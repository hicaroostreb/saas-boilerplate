/**
 * Payment Processing & Gateway Integration
 * SRP: Processar pagamentos e integrar com gateways
 */
export const processPayment = async (gateway, options) => {
  return gateway.processPayment(options);
};
// Mock gateway para desenvolvimento
export const createMockGateway = () => ({
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
  refundPayment: async _paymentId => {
    // Mock refund
  },
});
//# sourceMappingURL=payments.js.map
