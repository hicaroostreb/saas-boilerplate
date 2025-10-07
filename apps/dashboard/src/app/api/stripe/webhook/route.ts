import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // Process Stripe webhook
    // TODO: Implementation with @workspace/billing
    console.warn('Processing webhook:', { bodyLength: body.length, signature });

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
