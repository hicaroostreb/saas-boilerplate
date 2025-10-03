/**
 * Envio de Webhooks
 * SRP: apenas POST HTTP e retry/backoff
 */

import { signPayload } from './utils';

export interface WebhookOptions {
  url: string;
  secret: string;
  payload: Record<string, unknown>;
  maxRetries?: number;
}

export const sendWebhook = async ({
  url,
  secret,
  payload,
  maxRetries = 3,
}: WebhookOptions): Promise<void> => {
  const body = JSON.stringify(payload);
  const signature = signPayload(secret, body);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
        },
        body,
      });
      if (res.ok) return;
      throw new Error(`Status ${res.status}`);
    } catch (_err) {
      if (attempt === maxRetries - 1) {
        throw new Error('Webhook failed after retries');
      }
      const delay = attempt ** 2 * 100; // backoff quadrático
      await new Promise(resolve => {
        setTimeout(() => resolve(undefined), delay);
      });
    }
  }
};
