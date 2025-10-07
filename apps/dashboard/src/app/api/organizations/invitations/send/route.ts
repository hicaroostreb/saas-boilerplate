import { getServerSession } from '@workspace/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, organizationId, role } = await req.json();

    // Send invitation email
    // TODO: Implementation with @workspace/auth
    console.warn('Sending invitation:', { email, organizationId, role });

    return NextResponse.json({
      message: 'Invitation sent',
      email,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
