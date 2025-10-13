// packages/common/src/domain/billing/validators/billing.validators.ts

import { z } from 'zod';

// Import billing limits do shared (consolidados em BILLING_PLANS)
const BILLING_LIMITS = {
  MIN_PLAN_PRICE: 0,
  MAX_PLAN_PRICE: 999,
  MAX_SUBSCRIPTION_CHANGES_PER_MONTH: 3,
  TRIAL_DURATION_DAYS: 14,
  GRACE_PERIOD_DAYS: 7,
} as const;

/**
 * Schema para validação de ID de plano
 */
export const planIdSchema = z.enum(['free', 'pro', 'enterprise'], {
  message: 'Plano deve ser free, pro ou enterprise',
});

/**
 * Schema para validação de preço de plano
 */
export const planPriceSchema = z.object({
  monthly: z
    .number()
    .min(BILLING_LIMITS.MIN_PLAN_PRICE, 'Preço mensal não pode ser negativo')
    .max(BILLING_LIMITS.MAX_PLAN_PRICE, 'Preço mensal muito alto'),
  yearly: z
    .number()
    .min(BILLING_LIMITS.MIN_PLAN_PRICE, 'Preço anual não pode ser negativo')
    .max(BILLING_LIMITS.MAX_PLAN_PRICE * 12, 'Preço anual muito alto'),
});

/**
 * Schema para validação de limites de plano
 */
export const planLimitsSchema = z.object({
  teams: z
    .number()
    .int()
    .min(-1, 'Limite de teams deve ser -1 (ilimitado) ou positivo'),
  members: z
    .number()
    .int()
    .min(-1, 'Limite de membros deve ser -1 (ilimitado) ou positivo'),
  storage: z.number().int().min(1, 'Storage deve ser pelo menos 1GB'),
  apiCalls: z.number().int().min(1, 'API calls deve ser pelo menos 1'),
});

/**
 * Schema para validação completa de plano
 */
export const createPlanSchema = z.object({
  id: planIdSchema,
  name: z
    .string()
    .min(2, 'Nome do plano deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo'),
  description: z
    .string()
    .min(10, 'Descrição muito curta')
    .max(200, 'Descrição muito longa'),
  price: planPriceSchema,
  limits: planLimitsSchema,
  features: z
    .array(z.string().min(1, 'Feature não pode estar vazia'))
    .min(1, 'Plano deve ter pelo menos uma feature'),
  popular: z.boolean().optional(),
});

/**
 * Schema para mudança de plano
 */
export const changePlanSchema = z
  .object({
    currentPlanId: planIdSchema,
    newPlanId: planIdSchema,
    billingCycle: z.enum(['monthly', 'yearly'], {
      message: 'Ciclo deve ser monthly ou yearly',
    }),
  })
  .refine(data => data.currentPlanId !== data.newPlanId, {
    message: 'Novo plano deve ser diferente do atual',
  });

/**
 * Schema para cancelamento de assinatura
 */
export const cancelSubscriptionSchema = z.object({
  reason: z.enum(
    [
      'too_expensive',
      'missing_features',
      'switching_service',
      'temporary_pause',
      'other',
    ],
    {
      message: 'Motivo de cancelamento inválido',
    }
  ),
  feedback: z.string().max(500, 'Feedback muito longo').optional(),
  cancelAtPeriodEnd: z.boolean().default(true),
});
