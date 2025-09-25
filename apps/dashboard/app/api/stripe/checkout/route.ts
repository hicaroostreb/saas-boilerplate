import { stripe } from '@workspace/billing';
import { db, teamMembers, teams, users } from '@workspace/database';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data from Stripe.');
    }

    const customerId = session.customer.id;
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      throw new Error('No subscription found for this session.');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    const plan = subscription.items.data[0]?.price;
    if (!plan) {
      throw new Error('No plan found for this subscription.');
    }

    const productId = (plan.product as Stripe.Product).id;
    if (!productId) {
      throw new Error('No product ID found for this subscription.');
    }

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID in session's client_reference_id.");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);
    if (!user) {
      throw new Error('User not found in database.');
    }

    const [userTeam] = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);
    if (!userTeam) {
      throw new Error('User is not associated with any team.');
    }

    await db
      .update(teams)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripeProductId: productId,
        planName: (plan.product as Stripe.Product).name,
        subscriptionStatus: subscription.status,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, userTeam.teamId));

    // Redirect to dashboard - user will be authenticated by middleware
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error handling checkout:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
