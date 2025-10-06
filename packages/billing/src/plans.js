/**
 * Plan Definitions & Pricing Models
 * SRP: Única responsabilidade - definir planos e estruturas de preço
 */
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    priceCents: 0,
    currency: 'USD',
    interval: 'month',
    features: ['Basic features', '1 team', '5 projects', 'Community support'],
    stripePriceId: 'price_free',
  },
  PRO_MONTHLY: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    priceCents: 2000,
    currency: 'USD',
    interval: 'month',
    features: [
      'All features',
      'Unlimited teams',
      'Advanced analytics',
      'Priority support',
      'API access',
    ],
    stripePriceId: 'price_1ABC_pro_monthly',
    trialDays: 14,
  },
  PRO_YEARLY: {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    priceCents: 20000,
    currency: 'USD',
    interval: 'year',
    features: [
      'All features',
      'Unlimited teams',
      'Advanced analytics',
      'Priority support',
      'API access',
      '2 months free',
    ],
    stripePriceId: 'price_1ABC_pro_yearly',
    trialDays: 14,
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Custom features & integrations',
      'Dedicated account manager',
      'Premium SLA (99.9% uptime)',
      'Advanced security & compliance',
      'Custom onboarding & training',
      'Volume discounts',
      'Invoice billing',
      'Custom contract terms',
      '24/7 phone support',
    ],
    stripePriceId: '',
    isContactOnly: true,
  },
};
// Utility functions para trabalhar com planos
export const isContactOnlyPlan = planId => {
  const plan = PLANS[planId];
  return Boolean(plan.isContactOnly);
};
export const getPurchasablePlans = () => {
  return Object.entries(PLANS).filter(([_, plan]) => !plan.isContactOnly);
};
export const getContactOnlyPlans = () => {
  return Object.entries(PLANS).filter(([_, plan]) =>
    Boolean(plan.isContactOnly)
  );
};
//# sourceMappingURL=plans.js.map
