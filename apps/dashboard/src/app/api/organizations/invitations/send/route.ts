import { getServerSession } from '@workspace/auth/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    // TODO: Implementation with @workspace/auth
    console.warn('Send invitation:', body, 'from user:', session.user.id);

    return NextResponse.json({ success: true, message: 'Invitation sent' });
  } catch (error) {
    console.error('Send invitation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
