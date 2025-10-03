/**
 * Recebimento e Verificação de Webhooks
 * SRP: apenas verificar assinatura e parsear JSON
 */

import { signPayload } from './utils';

export interface WebhookRequest {
  headers: Record<string, string | undefined>;
  body: string;
  secret: string;
}

export const verifyWebhook = ({
  headers,
  body,
  secret,
}: WebhookRequest): boolean => {
  const signature = headers['x-signature'] || '';
  return signature === signPayload(secret, body);
};
