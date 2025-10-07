import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema } from '@/schemas/auth/sign-up-schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = signUpSchema.parse(body);

    // Create new user
    // Implementation with @workspace/auth
    
    return NextResponse.json({ 
      message: 'User created successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Sign up failed' },
      { status: 500 }
    );
  }
}
