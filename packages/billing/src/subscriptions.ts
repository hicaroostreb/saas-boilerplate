import type { PlanId } from './plans';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface Subscription {
  readonly id: string;
  readonly teamId: string;
  readonly planId: PlanId;
  readonly status: SubscriptionStatus;
  readonly stripeSubscriptionId: string | null;
  readonly stripeCustomerId: string | null;
  readonly startedAt: Date;
  readonly endsAt: Date | null;
  readonly canceledAt: Date | null;
}

export const createSubscription = ({
  teamId,
  planId,
  stripeSubscriptionId = null,
  stripeCustomerId = null,
  trialDays = 0,
}: {
  teamId: string;
  planId: PlanId;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  trialDays?: number;
}): Subscription => ({
  id: `sub_${Date.now()}`,
  teamId,
  planId,
  status: trialDays > 0 ? 'trialing' : 'active',
  stripeSubscriptionId,
  stripeCustomerId,
  startedAt: new Date(),
  endsAt: null,
  canceledAt: null,
});

export const cancelSubscription = (
  subscription: Subscription,
  immediately = false
): Subscription => ({
  ...subscription,
  status: 'canceled',
  canceledAt: new Date(),
  endsAt: immediately ? new Date() : subscription.endsAt,
});

export const upgradeSubscription = (
  subscription: Subscription,
  newPlanId: PlanId
): Subscription => ({
  ...subscription,
  planId: newPlanId,
});
