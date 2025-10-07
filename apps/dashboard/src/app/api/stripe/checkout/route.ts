import { getServerSession } from '@workspace/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();

    // Create Stripe checkout session
    // TODO: Implementation with @workspace/billing
    console.warn('Creating checkout session for priceId:', priceId);

    return NextResponse.json({
      url: 'https://checkout.stripe.com/session-id',
      sessionId: 'session-id',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
