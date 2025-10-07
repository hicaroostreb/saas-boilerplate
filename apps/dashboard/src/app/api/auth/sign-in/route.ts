import { NextRequest, NextResponse } from 'next/server';
import { signInSchema } from '@/schemas/auth/sign-in-schema';
import { signInAction } from '@workspace/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = signInSchema.parse(body);

    const result = await signInAction({ email, password });
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 401 }
    );
  }
}
