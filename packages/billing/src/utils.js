import { PLANS } from './plans';
export const formatPrice = (cents, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
};
export const calculateProration = (oldPriceCents, newPriceCents, daysRemaining) => {
    const oldDailyRate = oldPriceCents / 30;
    const newDailyRate = newPriceCents / 30;
    return Math.round((newDailyRate - oldDailyRate) * daysRemaining);
};
export const validatePlanId = (planId) => planId in PLANS;
export const getPlan = (planId) => PLANS[planId];
export const isActiveSub = (subscription) => subscription.status === 'active' || subscription.status === 'trialing';
export const getDaysUntilRenewal = (subscription) => {
    if (!subscription.endsAt)
        return 0;
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
};
//# sourceMappingURL=utils.js.map