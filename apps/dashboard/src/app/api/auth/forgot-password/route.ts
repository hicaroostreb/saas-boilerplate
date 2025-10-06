import { createForgotPasswordController } from '@/lib/controller-factory';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * ✅ ULTRA-THIN: API route usando controller
 * ~15 linhas - Single Responsibility
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ 1. Create controller
    const controller = createForgotPasswordController();

    // ✅ 2. Parse body
    const body = await request.json();

    // ✅ 3. Execute controller
    const { response, status } = await controller.execute(body, request);

    // ✅ 4. Return response
    return NextResponse.json(response, { status });
  } catch (error) {
    // ✅ SECURITY: Always return success for forgot password
    console.error('❌ Forgot password route error:', error);
    return NextResponse.json(
      {
        success: true,
        message:
          "If an account with that email exists, we've sent password reset instructions.",
      },
      { status: 200 }
    );
  }
}
