import {
  handleSubscriptionChange,
  stripe,
} from '@workspace/billing';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// ✅ Correção: Nullish coalescing + melhor error handling
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(request: NextRequest) {
  // ✅ Validação da webhook secret
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET environment variable is not configured');
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    );
  }

  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  // ✅ Validação da signature
  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing webhook signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    // ✅ Correção: console.error permitido em production
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
    } else {
      // ✅ Correção: console.warn para eventos não tratados
      console.warn(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
