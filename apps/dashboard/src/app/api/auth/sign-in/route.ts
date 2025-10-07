import { signInAction, signInSchema } from '@workspace/auth';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = signInSchema.parse(body);

    const result = await signInAction({ email, password });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Sign in failed' }, { status: 401 });
  }
}
