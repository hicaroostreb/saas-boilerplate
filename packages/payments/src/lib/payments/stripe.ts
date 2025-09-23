// packages/payments/src/lib/payments/stripe.ts

import Stripe from "stripe";
import { InferModel } from "drizzle-orm";
import { teams } from "@your-org/db/lib/db/schema";
import {
  getUser,
  getTeamByStripeCustomerId,
  updateTeamSubscription,
} from "@your-org/auth/lib/db/queries";

type Team = InferModel<typeof teams, "select">;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function createCheckoutSession({
  team,
  priceId,
}: {
  team: Team | null;
  priceId: string;
}): Promise<Stripe.Checkout.Session> {
  const user = await getUser();
  if (!team || !user) {
    throw new Error("Authentication required");
  }

  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
    },
  });
}

export async function createCustomerPortalSession(
  team: Team,
): Promise<Stripe.BillingPortal.Session> {
  if (!team.stripeCustomerId) {
    throw new Error("Customer not found");
  }
  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard/billing`,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;
  const team = await getTeamByStripeCustomerId(customerId);
  if (!team) return;

  const status = subscription.status;
  const planItem = subscription.items.data[0];
  const product = planItem?.price.product as Stripe.Product;

  await updateTeamSubscription(team.id, {
    stripeSubscriptionId: status === "canceled" ? null : subscription.id,
    stripeProductId: status === "canceled" ? null : product.id,
    planName: status === "canceled" ? null : product.name,
    subscriptionStatus: status,
  });
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ["data.product"],
    active: true,
    type: "recurring",
  });
  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount ?? 0,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days ?? 0,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });
  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description || "",
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id || "",
  }));
}
