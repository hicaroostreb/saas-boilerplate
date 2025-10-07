import { sendWebhook } from '@workspace/webhooks';
export const createBillingEvent = (type, data) => ({
  type,
  id: `evt_${Date.now()}`,
  createdAt: new Date(),
  data,
});
export const sendBillingWebhook = async (config, event) => {
  await sendWebhook({
    url: config.url,
    secret: config.secret,
    payload: event,
    maxRetries: 3,
  });
};
export async function handleSubscriptionChange(subscription, webhookConfig) {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
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
  if (webhookConfig) {
    await sendBillingWebhook(webhookConfig, billingEvent);
  }
}
//# sourceMappingURL=events.js.map
