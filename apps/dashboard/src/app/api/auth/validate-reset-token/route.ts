import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    // Validate reset token
    // TODO: Implementation with @workspace/auth
    console.warn('Validating token:', token);

    return NextResponse.json({
      valid: true,
      token,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
}
