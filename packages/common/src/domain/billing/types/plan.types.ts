// packages/common/src/domain/billing/types/plan.types.ts

/**
 * Identificadores dos planos disponíveis
 */
export type PlanId = 'free' | 'pro' | 'enterprise';

/**
 * Status de uma assinatura
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete';

/**
 * Limites de recursos por plano
 */
export interface PlanLimits {
  teams: number;
  members: number;
  storage: number; // GB
  apiCalls: number; // por mês
}

/**
 * Estrutura de preços de um plano
 */
export interface PlanPrice {
  monthly: number;
  yearly: number;
}

/**
 * Feature de um plano com metadados
 */
export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
}

/**
 * Informações de uso atual vs limites
 */
export interface UsageInfo {
  teams: {
    current: number;
    limit: number;
  };
  members: {
    current: number;
    limit: number;
  };
  storage: {
    current: number; // GB
    limit: number; // GB
  };
  apiCalls: {
    current: number;
    limit: number;
  };
}

/**
 * Detalhes de uma assinatura
 */
export interface SubscriptionDetails {
  id: string;
  planId: PlanId;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  canceledAt?: Date;
}
