import { PLANS, type Plan, type PlanId } from './plans';
import type { Subscription } from './subscriptions';

export const formatPrice = (cents: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    cents / 100
  );
};

export const calculateProration = (
  oldPriceCents: number,
  newPriceCents: number,
  daysRemaining: number
): number => {
  const oldDailyRate = oldPriceCents / 30;
  const newDailyRate = newPriceCents / 30;
  return Math.round((newDailyRate - oldDailyRate) * daysRemaining);
};

export const validatePlanId = (planId: string): planId is PlanId =>
  planId in PLANS;

export const getPlan = (planId: PlanId): Plan => PLANS[planId] as Plan;

export const isActiveSub = (subscription: Subscription): boolean =>
  subscription.status === 'active' || subscription.status === 'trialing';

export const getDaysUntilRenewal = (subscription: Subscription): number => {
  if (!subscription.endsAt) {
    return 0;
  }
  const now = new Date();
  const diffMs = subscription.endsAt.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const billing = {
  format: { price: formatPrice },
  calculate: { proration: calculateProration },
  validate: { planId: validatePlanId },
  get: { plan: getPlan },
  check: { isActive: isActiveSub },
  time: { daysUntilRenewal: getDaysUntilRenewal },
} as const;
