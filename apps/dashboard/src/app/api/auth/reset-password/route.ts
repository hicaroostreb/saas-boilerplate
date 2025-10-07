import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/schemas/auth/reset-password-schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Reset password with token
    // Implementation with @workspace/auth
    
    return NextResponse.json({ 
      message: 'Password reset successful' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
