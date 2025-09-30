// apps/dashboard/app/api/auth/check-user/route.ts - ACHROMATIC ENTERPRISE USER CHECK

import { logAuthEvent } from '@workspace/auth/server';
import { db, users } from '@workspace/database';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ✅ ENTERPRISE: Validation schema
const checkUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
});

export async function POST(request: NextRequest) {
  try {
    // ✅ ENTERPRISE: Logger replaced console.log

    // ✅ ENTERPRISE: Get request context
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') ?? 'unknown';

    // ✅ ACHROMATIC: Parse and validate input
    const body = await request.json();
    const validation = checkUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.issues[0]?.message || 'Invalid email',
          },
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // ✅ ACHROMATIC: Check if user exists
    const [existingUser] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        twoFactorEnabled: users.twoFactorEnabled,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // ✅ ENTERPRISE: Log check attempt (for analytics, not security)
    await logAuthEvent({
      userId: existingUser?.id || null,
      eventType: 'login',
      eventAction: 'check_user',
      eventStatus: 'success',
      eventCategory: 'auth',
      ipAddress,
      userAgent,
      eventData: {
        email,
        userExists: !!existingUser,
        userActive: existingUser?.isActive || false,
        purpose: 'signup_validation',
      },
    });

    // ✅ ENTERPRISE: Return user existence and status
    if (!existingUser) {
      return NextResponse.json({
        success: true,
        exists: false,
        available: true,
        message: 'Email is available for registration',
      });
    }

    // ✅ ENTERPRISE: User exists - return status info
    return NextResponse.json({
      success: true,
      exists: true,
      available: false,
      user: {
        email: existingUser.email,
        name: existingUser.name,
        isActive: existingUser.isActive,
        emailVerified: !!existingUser.emailVerified,
        hasPassword: true, // Don't reveal if user has password set
        twoFactorEnabled: existingUser.twoFactorEnabled,
        memberSince: existingUser.createdAt,
      },
      message: existingUser.isActive
        ? 'User account exists and is active'
        : 'User account exists but is inactive',
    });
  } catch (error) {
    // ✅ ENTERPRISE: Proper error logging with console.error (allowed)
    console.error('❌ ACHROMATIC: Check user API error:', error);

    // ✅ ENTERPRISE: Log system error
    await logAuthEvent({
      eventType: 'login',
      eventAction: 'check_user_system_error',
      eventStatus: 'error',
      eventCategory: 'auth',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SYSTEM_ERROR',
          message: 'Unable to check user at this time',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
}
