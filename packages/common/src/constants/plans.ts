// Subscription plans configuration
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  limits: {
    teams: number;
    members: number;
    storage: number; // GB
    apiCalls: number; // per month
  };
  features: string[];
  popular?: boolean;
}

export const PLANS: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      teams: 1,
      members: 3,
      storage: 1,
      apiCalls: 1000,
    },
    features: [
      '1 team',
      'Up to 3 members',
      '1GB storage',
      'Basic support',
      'Core features',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Best for growing teams',
    price: {
      monthly: 29,
      yearly: 290,
    },
    limits: {
      teams: 5,
      members: 25,
      storage: 50,
      apiCalls: 50000,
    },
    features: [
      '5 teams',
      'Up to 25 members per team',
      '50GB storage',
      'Priority support',
      'Advanced features',
      'API access',
    ],
    popular: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: {
      monthly: 99,
      yearly: 990,
    },
    limits: {
      teams: -1, // unlimited
      members: -1, // unlimited
      storage: 500,
      apiCalls: 500000,
    },
    features: [
      'Unlimited teams',
      'Unlimited members',
      '500GB storage',
      '24/7 premium support',
      'All features',
      'Advanced API access',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
} as const;
