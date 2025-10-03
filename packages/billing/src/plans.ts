/**
 * Plan Definitions & Pricing Models
 * SRP: Única responsabilidade - definir planos e estruturas de preço
 */

export interface Plan {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly currency: string;
  readonly interval: 'month' | 'year';
  readonly features: readonly string[];
  readonly stripePriceId: string;
  readonly trialDays?: number;
  readonly isContactOnly?: boolean;
}

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
} as const satisfies Record<string, Plan>;

export type PlanId = keyof typeof PLANS;
export type PlanInterval = Plan['interval'];

// Utility functions para trabalhar com planos
export const isContactOnlyPlan = (planId: PlanId): boolean => {
  const plan = PLANS[planId] as Plan;
  return Boolean(plan.isContactOnly);
};

export const getPurchasablePlans = (): Array<[PlanId, Plan]> => {
  return (Object.entries(PLANS) as Array<[PlanId, Plan]>).filter(
    ([_, plan]) => !(plan as Plan).isContactOnly
  );
};

export const getContactOnlyPlans = (): Array<[PlanId, Plan]> => {
  return (Object.entries(PLANS) as Array<[PlanId, Plan]>).filter(([_, plan]) =>
    Boolean((plan as Plan).isContactOnly)
  );
};
