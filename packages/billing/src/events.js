/**
 * Billing Events with Dependency Inversion Principle
 * Domain Layer - Define interfaces, Infrastructure implementa
 */
export const createBillingEvent = (type, data) => ({
  type,
  id: `evt_${Date.now()}`,
  createdAt: new Date(),
  data,
});
// ✅ SERVICE - Dependency Injection
export class BillingEventService {
  notifier;
  constructor(notifier) {
    this.notifier = notifier;
  }
  async sendBillingWebhook(config, event) {
    if (!this.notifier) {
      console.warn('No billing notifier configured - event not sent');
      return;
    }
    await this.notifier.sendNotification(config, event);
  }
  // Handler para mudanças de assinatura do Stripe
  async handleSubscriptionChange(subscription, webhookConfig) {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;
    // Criar evento de billing
    const billingEvent = createBillingEvent('subscription.updated', {
      id: subscriptionId,
      teamId: customerId,
      planId: 'PRO_MONTHLY',
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
let defaultEventService = null;
export const setDefaultBillingNotifier = notifier => {
  defaultEventService = new BillingEventService(notifier);
};
export const sendBillingWebhook = async (config, event) => {
  if (!defaultEventService) {
    console.warn(
      'No default billing notifier - use setDefaultBillingNotifier()'
    );
    return;
  }
  await defaultEventService.sendBillingWebhook(config, event);
};
export const handleSubscriptionChange = async (subscription, webhookConfig) => {
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
//# sourceMappingURL=events.js.map
