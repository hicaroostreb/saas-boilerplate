import { forgotPasswordSchema } from '@workspace/auth';
import { forgotPasswordFlow } from '@workspace/auth/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = forgotPasswordSchema.parse(body);

    const result = await forgotPasswordFlow(validatedData);

    if (result.success) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json(
        { message: result.error ?? 'Failed to process request' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Forgot password API error:', error);

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
