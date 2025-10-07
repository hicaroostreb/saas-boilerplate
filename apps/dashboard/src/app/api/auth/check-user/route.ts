import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@workspace/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    // Check if user exists
    const session = await getServerSession();
    
    return NextResponse.json({ 
      exists: !!session,
      email: email 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}
