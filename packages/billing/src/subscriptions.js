export const createSubscription = ({ teamId, planId, stripeSubscriptionId = null, stripeCustomerId = null, trialDays = 0, }) => ({
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
export const cancelSubscription = (subscription, immediately = false) => ({
    ...subscription,
    status: 'canceled',
    canceledAt: new Date(),
    endsAt: immediately ? new Date() : subscription.endsAt,
});
export const upgradeSubscription = (subscription, newPlanId) => ({
    ...subscription,
    planId: newPlanId,
});
//# sourceMappingURL=subscriptions.js.map