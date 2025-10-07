import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@workspace/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    // Check if user exists
    const session = await getServerSession();
    
    return NextResponse.json({ 
      exists: !!session,
      email
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}
