export const processPayment = async (gateway, options) => gateway.processPayment(options);
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
    refundPayment: async (_paymentId) => { },
});
//# sourceMappingURL=payments.js.map