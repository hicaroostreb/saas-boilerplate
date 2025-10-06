'use client';

import { useState } from 'react';
import type { PricingPlan } from '../types/marketing.types';

// Mock data - versão simplificada
const mockPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'BRL',
    interval: 'month',
    features: ['Até 1.000 usuários', 'Suporte por email', 'Dashboard básico'],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 99,
    currency: 'BRL',
    interval: 'month',
    popular: true,
    features: [
      'Até 10.000 usuários',
      'Suporte prioritário',
      'Dashboard avançado',
      'API completa',
    ],
  },
];

export const usePricingPlans = () => {
  const [plans] = useState<PricingPlan[]>(mockPlans);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  return { plans, isLoading, error };
};
