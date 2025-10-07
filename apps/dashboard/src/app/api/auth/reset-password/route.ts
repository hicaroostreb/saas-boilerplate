import { resetPasswordSchema } from '@workspace/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Reset password with token
    // TODO: Implementation with @workspace/auth
    console.warn(
      'Password reset for token:',
      token,
      'password length:',
      password.length
    );

    return NextResponse.json({
      message: 'Password reset successful',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
