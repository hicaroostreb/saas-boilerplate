/**
 * Webhook Implementation of Billing Notifier
 * Infrastructure Layer - Implementa interface do Domain
 */

import type {
  BillingEvent,
  BillingWebhookConfig,
  IBillingNotifier,
} from '@workspace/billing';
import { sendWebhook } from './client';

export class WebhookBillingNotifier implements IBillingNotifier {
  async sendNotification(
    config: BillingWebhookConfig,
    event: BillingEvent
  ): Promise<void> {
    await sendWebhook({
      url: config.url,
      secret: config.secret,
      payload: event as unknown as Record<string, unknown>,
      maxRetries: 3,
    });
  }
}

// ✅ FACTORY para facilitar uso
export const createBillingNotifier = (): IBillingNotifier => {
  return new WebhookBillingNotifier();
};
