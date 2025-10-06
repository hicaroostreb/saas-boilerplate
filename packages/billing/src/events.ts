/**
 * Billing Events with Dependency Inversion Principle
 * Domain Layer - Define interfaces, Infrastructure implementa
 */

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

// ✅ INTERFACE - Domain define, Infrastructure implementa
export interface IBillingNotifier {
  sendNotification(
    config: BillingWebhookConfig,
    event: BillingEvent
  ): Promise<void>;
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

// ✅ SERVICE - Dependency Injection
export class BillingEventService {
  constructor(private notifier?: IBillingNotifier) {}

  async sendBillingWebhook(
    config: BillingWebhookConfig,
    event: BillingEvent
  ): Promise<void> {
    if (!this.notifier) {
      console.warn('No billing notifier configured - event not sent');
      return;
    }

    await this.notifier.sendNotification(config, event);
  }

  // Handler para mudanças de assinatura do Stripe
  async handleSubscriptionChange(
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
      await this.sendBillingWebhook(webhookConfig, billingEvent);
    }
  }
}

// ✅ BACKWARD COMPATIBILITY - Funções para manter API existente
let defaultEventService: BillingEventService | null = null;

export const setDefaultBillingNotifier = (notifier: IBillingNotifier): void => {
  defaultEventService = new BillingEventService(notifier);
};

export const sendBillingWebhook = async (
  config: BillingWebhookConfig,
  event: BillingEvent
): Promise<void> => {
  if (!defaultEventService) {
    console.warn(
      'No default billing notifier - use setDefaultBillingNotifier()'
    );
    return;
  }

  await defaultEventService.sendBillingWebhook(config, event);
};

export const handleSubscriptionChange = async (
  subscription: Stripe.Subscription,
  webhookConfig?: BillingWebhookConfig
): Promise<void> => {
  if (!defaultEventService) {
    console.warn(
      'No default billing notifier - use setDefaultBillingNotifier()'
    );
    return;
  }

  await defaultEventService.handleSubscriptionChange(
    subscription,
    webhookConfig
  );
};
