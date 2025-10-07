import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordSchema } from '@/schemas/auth/forgot-password-schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Send password reset email
    // Implementation with @workspace/auth
    
    return NextResponse.json({ 
      message: 'Password reset email sent' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send reset email' },
      { status: 500 }
    );
  }
}
