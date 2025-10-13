import { resetPasswordSchema } from '@workspace/auth';
import { resetPasswordFlow } from '@workspace/auth/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = resetPasswordSchema.parse(body);

    const result = await resetPasswordFlow(validatedData);

    if (result.success) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json(
        { message: 'Failed to reset password' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Reset password API error:', error);

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
