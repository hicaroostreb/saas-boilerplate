/**
 * Helpers de Webhook
 * ISP: funções específicas sem dependências externas
 */

import crypto from 'crypto';

export const signPayload = (secret: string, body: string): string => {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
};

export const parseWebhookBody = (body: unknown): Record<string, unknown> => {
  // ✅ CORREÇÃO: Adicionadas chaves obrigatórias
  if (typeof body === 'string') {
    return JSON.parse(body);
  }
  throw new TypeError('Invalid webhook body');
};
