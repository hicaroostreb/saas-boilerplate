/**
 * Billing Domain Interfaces - Foundation Layer
 * Interfaces compartilhadas para Domain e Infrastructure layers
 */

export interface BillingEvent {
  type:
    | 'subscription_created'
    | 'subscription_updated'
    | 'subscription_cancelled'
    | 'payment_succeeded'
    | 'payment_failed';
  userId: string;
  subscriptionId?: string;
  paymentId?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface BillingWebhookConfig {
  url: string;
  secret: string;
  retries?: number;
  timeout?: number;
}

export interface IBillingNotifier {
  sendNotification(
    config: BillingWebhookConfig,
    event: BillingEvent
  ): Promise<void>;
}
