import { signInAction, signInSchema } from '@workspace/auth';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = signInSchema.parse(body);

    // Criar FormData para signInAction
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const result = await signInAction(formData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sign in API error:', error);
    return NextResponse.json({ error: 'Sign in failed' }, { status: 401 });
  }
}
