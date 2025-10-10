import { signUpSchema } from '@workspace/auth'; // Client-safe schema only
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse e validar input (client-safe schemas apenas)
    const body = await req.json();
    const validatedInput = signUpSchema.parse(body);

    // 2. Importação dinâmica do server-only flow
    const { signUpFlow } = await import('@workspace/auth/server');

    // 3. Executar sign up flow
    const result = await signUpFlow(validatedInput);

    // 4. Retornar resultado baseado no flow
    if (result.success) {
      return NextResponse.json({
        message: 'User created successfully',
        user: result.data?.user,
      });
    }

    // Error cases com status codes apropriados
    const statusCode = result.error?.includes('already exists') ? 409 : 400;

    return NextResponse.json({ error: result.error }, { status: statusCode });
  } catch (error) {
    console.error('Sign up API error:', error);

    // Handle validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
