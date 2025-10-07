import type { Plan } from './plans';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'digital_wallet';

export interface Payment {
  readonly id: string;
  readonly subscriptionId: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly status: PaymentStatus;
  readonly method: PaymentMethod;
  readonly createdAt: Date;
  readonly processedAt: Date | null;
}

export interface ProcessPaymentOptions {
  subscriptionId: string;
  plan: Plan;
  method: PaymentMethod;
}

export interface PaymentGateway {
  processPayment(options: ProcessPaymentOptions): Promise<Payment>;
  refundPayment(paymentId: string): Promise<void>;
}

export const processPayment = async (
  gateway: PaymentGateway,
  options: ProcessPaymentOptions
): Promise<Payment> => gateway.processPayment(options);

export const createMockGateway = (): PaymentGateway => ({
  processPayment: async ({ subscriptionId, plan }) => ({
    id: `pay_${Date.now()}`,
    subscriptionId,
    amountCents: plan.priceCents,
    currency: plan.currency,
    status: 'succeeded',
    method: 'card',
    createdAt: new Date(),
    processedAt: new Date(),
  }),
  refundPayment: async (_paymentId: string): Promise<void> => {},
});
