import { createValidateTokenController } from '@/lib/controller-factory';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * ✅ ULTRA-THIN: API route usando controller
 * ~15 linhas - Single Responsibility
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ 1. Create controller
    const controller = createValidateTokenController();

    // ✅ 2. Parse body
    const body = await request.json();

    // ✅ 3. Execute controller
    const { response, status } = await controller.execute(body, request);

    // ✅ 4. Return response
    return NextResponse.json(response, { status });
  } catch (error) {
    console.error('❌ Validate token route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SYSTEM_ERROR',
          message: 'Token validation failed',
        },
      },
      { status: 500 }
    );
  }
}
