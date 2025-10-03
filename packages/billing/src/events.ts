/**
 * Billing Events & Webhook Integration
 * DIP: Abstrai eventos de billing usando @workspace/webhooks
 */

import { sendWebhook } from '@workspace/webhooks';
import type Stripe from 'stripe';
import type { Payment } from './payments';
import type { PlanId } from './plans';
import type { Subscription, SubscriptionStatus } from './subscriptions';

export type BillingEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'payment.succeeded'
  | 'payment.failed';

export interface BillingEvent {
  readonly type: BillingEventType;
  readonly id: string;
  readonly createdAt: Date;
  readonly data: Subscription | Payment;
}

export interface BillingWebhookConfig {
  url: string;
  secret: string;
}

export const createBillingEvent = <T extends Subscription | Payment>(
  type: BillingEventType,
  data: T
): BillingEvent => ({
  type,
  id: `evt_${Date.now()}`,
  createdAt: new Date(),
  data,
});

export const sendBillingWebhook = async (
  config: BillingWebhookConfig,
  event: BillingEvent
): Promise<void> => {
  await sendWebhook({
    url: config.url,
    secret: config.secret,
    payload: event as unknown as Record<string, unknown>,
    maxRetries: 3,
  });
};

// Handler para mudanças de assinatura do Stripe
export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  webhookConfig?: BillingWebhookConfig
): Promise<void> {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status as SubscriptionStatus;

  // Criar evento de billing
  const billingEvent = createBillingEvent('subscription.updated', {
    id: subscriptionId,
    teamId: customerId,
    planId: 'PRO_MONTHLY' as PlanId,
    status,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
    startedAt: new Date(subscription.created * 1000),
    endsAt: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
  });

  // Enviar webhook se configurado
  if (webhookConfig) {
    await sendBillingWebhook(webhookConfig, billingEvent);
  }
}
