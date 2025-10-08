'use server';

import { redirect } from 'next/navigation';
import { PLANS, type Plan, type PlanId, isContactOnlyPlan } from '../../plans';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';

export interface CheckoutActionData {
  priceId: string;
  teamId: string;
  customerId?: string;
  clientReferenceId?: string;
}

export interface PortalActionData {
  customerId: string;
  productId?: string;
}

export interface ContactSalesData {
  planId: PlanId;
  companyName: string;
  contactEmail: string;
  contactName: string;
  teamSize?: number;
  message?: string;
}

interface Team {
  id: string;
  stripeCustomerId?: string;
  stripeProductId?: string;
}

type WithTeamMiddleware = <T extends unknown[], R>(
  fn: (formData: FormData | unknown, team: Team, ...args: T) => R
) => (...args: T) => R;

export async function checkoutAction(data: CheckoutActionData): Promise<never> {
  const { priceId, teamId, customerId, clientReferenceId } = data;
  const foundPlan = Object.values(PLANS).find(p => p.stripePriceId === priceId);
  if (!foundPlan) {
    throw new Error(`Invalid price ID: ${priceId}`);
  }

  const plan = foundPlan as Plan;
  if (plan.isContactOnly) {
    redirect(`/contact-sales?plan=${plan.id}`);
  }

  const checkoutOptions = {
    teamId,
    priceId,
    ...(customerId && { customerId }),
    ...(clientReferenceId && { clientReferenceId }),
    ...(plan.trialDays && { trialPeriodDays: plan.trialDays }),
  };

  const session = await createCheckoutSession(checkoutOptions);
  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }
  redirect(session.url);
}

export async function customerPortalAction(
  data: PortalActionData
): Promise<never> {
  const { customerId, productId } = data;
  const portalOptions = { customerId, ...(productId && { productId }) };
  const portalSession = await createCustomerPortalSession(portalOptions);
  redirect(portalSession.url);
}

export async function contactSalesAction(
  data: ContactSalesData
): Promise<void> {
  const { planId, companyName, contactEmail, contactName, teamSize, message } =
    data;
  if (!isContactOnlyPlan(planId)) {
    throw new Error('This plan does not require contact sales');
  }

  console.warn('Enterprise contact request received:', {
    planId,
    companyName,
    contactEmail,
    contactName,
    teamSize,
    message,
    timestamp: new Date().toISOString(),
  });
}

// Wrapper functions
export function createCheckoutAction(withTeamMiddleware: WithTeamMiddleware) {
  return withTeamMiddleware(async (formData: unknown, team: Team) => {
    const form = formData as FormData;
    const priceId = form.get('priceId') as string;
    const checkoutData: CheckoutActionData = {
      priceId,
      teamId: team.id,
      ...(team.stripeCustomerId && { customerId: team.stripeCustomerId }),
      clientReferenceId: team.id,
    };
    await checkoutAction(checkoutData);
  });
}

export function createPortalAction(withTeamMiddleware: WithTeamMiddleware) {
  return withTeamMiddleware(async (_: unknown, team: Team) => {
    if (!team.stripeCustomerId) {
      redirect('/pricing');
    }
    const portalData: PortalActionData = {
      customerId: team.stripeCustomerId,
      ...(team.stripeProductId && { productId: team.stripeProductId }),
    };
    await customerPortalAction(portalData);
  });
}
