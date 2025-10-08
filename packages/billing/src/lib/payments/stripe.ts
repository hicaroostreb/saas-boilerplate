import Stripe from 'stripe';
import type { PaymentGateway } from '../../payments';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(stripeSecretKey, { apiVersion: '2022-11-15' });

export interface StripeCheckoutOptions {
  teamId: string;
  priceId: string;
  customerId?: string;
  clientReferenceId?: string;
  allowPromotionCodes?: boolean;
  trialPeriodDays?: number;
}

export interface StripePortalOptions {
  customerId: string;
  productId?: string;
  returnUrl?: string;
}

export async function createCheckoutSession(
  options: StripeCheckoutOptions
): Promise<Stripe.Checkout.Session> {
  const {
    teamId,
    priceId,
    customerId,
    clientReferenceId,
    allowPromotionCodes = true,
    trialPeriodDays,
  } = options;
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL environment variable is required');
  }

  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${baseUrl}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    allow_promotion_codes: allowPromotionCodes,
    metadata: { teamId },
  };

  if (customerId) {
    sessionConfig.customer = customerId;
  }
  if (clientReferenceId) {
    sessionConfig.client_reference_id = clientReferenceId;
  }
  if (trialPeriodDays && trialPeriodDays > 0) {
    sessionConfig.subscription_data = { trial_period_days: trialPeriodDays };
  }

  return stripe.checkout.sessions.create(sessionConfig);
}

export async function createCustomerPortalSession(
  options: StripePortalOptions
): Promise<Stripe.BillingPortal.Session> {
  const { customerId, productId, returnUrl } = options;
  if (!customerId) {
    throw new Error('Customer ID is required for portal session');
  }
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL environment variable is required');
  }

  const finalReturnUrl = returnUrl ?? `${baseUrl}/dashboard`;
  let configurationId: string | undefined;

  if (productId) {
    const configurations = await stripe.billingPortal.configurations.list();
    if (configurations.data.length > 0) {
      configurationId = configurations.data[0]?.id;
    } else {
      const product = await stripe.products.retrieve(productId);
      if (!product.active) {
        throw new Error('Product is not active in Stripe');
      }

      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });
      if (prices.data.length === 0) {
        throw new Error('No active prices found for the product');
      }

      const configuration = await stripe.billingPortal.configurations.create({
        business_profile: { headline: 'Manage your subscription' },
        features: {
          subscription_update: {
            enabled: true,
            default_allowed_updates: ['price', 'quantity', 'promotion_code'],
            proration_behavior: 'create_prorations',
            products: [
              {
                product: product.id,
                prices: prices.data.map(price => price.id),
              },
            ],
          },
          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end',
            cancellation_reason: {
              enabled: true,
              options: [
                'too_expensive',
                'missing_features',
                'switched_service',
                'unused',
                'other',
              ],
            },
          },
          payment_method_update: { enabled: true },
        },
      });

      configurationId = configuration.id;
    }
  }

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: finalReturnUrl,
    ...(configurationId ? { configuration: configurationId } : {}),
  });
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring',
  });
  return prices.data.map(price => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
  });
  return products.data.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id,
  }));
}

export const createStripeGateway = (): PaymentGateway => ({
  processPayment: async ({ subscriptionId, plan }) => {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.priceCents,
      currency: plan.currency,
      metadata: { subscriptionId, planId: plan.id },
    });
    return {
      id: paymentIntent.id,
      subscriptionId,
      amountCents: plan.priceCents,
      currency: plan.currency,
      status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
      method: 'card',
      createdAt: new Date(),
      processedAt: paymentIntent.status === 'succeeded' ? new Date() : null,
    };
  },
  refundPayment: async (paymentId: string) => {
    await stripe.refunds.create({ payment_intent: paymentId });
  },
});
