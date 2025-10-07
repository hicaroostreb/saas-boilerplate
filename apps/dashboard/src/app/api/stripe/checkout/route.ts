import { getServerSession } from '@workspace/auth/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    // TODO: Implementation with Stripe
    console.warn('Stripe checkout:', body, 'for user:', session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Checkout session created',
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
