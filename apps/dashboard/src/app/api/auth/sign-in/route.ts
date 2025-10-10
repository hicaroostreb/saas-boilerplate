import { signInSchema } from '@workspace/auth';
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signInSchema.parse(body);

    // Importação dinâmica do flow enterprise
    const { signInFlow } = await import('@workspace/auth/server');

    const result = await signInFlow(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 401 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          issues: error.issues,
          success: false,
        },
        { status: 400 }
      );
    }

    console.error('Sign in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
