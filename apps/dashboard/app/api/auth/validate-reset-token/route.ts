// apps/dashboard/app/api/auth/validate-reset-token/route.ts - ACHROMATIC VALIDATE RESET TOKEN

import { logAuthEvent } from '@workspace/auth/server';
import { db, passwordResetTokens, users } from '@workspace/database';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ✅ ENTERPRISE: Validation schema
const validateTokenSchema = z.object({
  token: z.string().uuid('Invalid token format'),
});

export async function POST(request: NextRequest) {
  try {
    // ✅ ENTERPRISE: Get request context
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') ?? 'unknown';

    // ✅ ACHROMATIC: Parse and validate input
    const body = await request.json();
    const validation = validateTokenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid token format',
          },
        },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // ✅ ACHROMATIC: Find and validate token
    const [resetTokenData] = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        expiresAt: passwordResetTokens.expiresAt,
        usedAt: passwordResetTokens.usedAt,
        isRevoked: passwordResetTokens.isRevoked,
        attempts: passwordResetTokens.attempts,
        maxAttempts: passwordResetTokens.maxAttempts,
        metadata: passwordResetTokens.metadata,
        // User data
        userEmail: users.email,
        userName: users.name,
        userIsActive: users.isActive,
      })
      .from(passwordResetTokens)
      .innerJoin(users, eq(passwordResetTokens.userId, users.id))
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    // ✅ ENTERPRISE: Log token validation attempt
    await logAuthEvent({
      userId: resetTokenData?.userId || null,
      eventType: 'password_reset',
      eventAction: 'validate_reset_token',
      eventStatus: resetTokenData ? 'success' : 'failure',
      eventCategory: 'security',
      ipAddress,
      userAgent,
      eventData: {
        token: `${token.substring(0, 8)}...`,
        tokenExists: Boolean(resetTokenData),
        email: resetTokenData?.userEmail,
      },
    });

    // ✅ ENTERPRISE: Check if token exists
    if (!resetTokenData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_INVALID',
            message: 'Invalid or non-existent reset token',
          },
        },
        { status: 404 }
      );
    }

    // ✅ ENTERPRISE: Check if token is expired
    const now = new Date();
    if (resetTokenData.expiresAt < now) {
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'validate_reset_token_expired',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: {
          email: resetTokenData.userEmail,
          expiredAt: resetTokenData.expiresAt,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Reset token has expired',
            expiredAt: resetTokenData.expiresAt,
          },
        },
        { status: 410 }
      );
    }

    // ✅ ENTERPRISE: Check if token was already used
    if (resetTokenData.usedAt) {
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'validate_reset_token_used',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: {
          email: resetTokenData.userEmail,
          usedAt: resetTokenData.usedAt,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_USED',
            message: 'Reset token has already been used',
            usedAt: resetTokenData.usedAt,
          },
        },
        { status: 410 }
      );
    }

    // ✅ ENTERPRISE: Check if token is revoked
    if (resetTokenData.isRevoked) {
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'validate_reset_token_revoked',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: {
          email: resetTokenData.userEmail,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_REVOKED',
            message: 'Reset token has been revoked',
          },
        },
        { status: 410 }
      );
    }

    // ✅ ENTERPRISE: Check attempts limit
    if (resetTokenData.attempts >= resetTokenData.maxAttempts) {
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'validate_reset_token_max_attempts',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: {
          email: resetTokenData.userEmail,
          attempts: resetTokenData.attempts,
          maxAttempts: resetTokenData.maxAttempts,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MAX_ATTEMPTS_EXCEEDED',
            message: 'Maximum validation attempts exceeded',
          },
        },
        { status: 429 }
      );
    }

    // ✅ ENTERPRISE: Check if user is still active
    if (!resetTokenData.userIsActive) {
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'validate_reset_token_user_inactive',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: {
          email: resetTokenData.userEmail,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_INACTIVE',
            message: 'User account is inactive',
          },
        },
        { status: 403 }
      );
    }

    // ✅ ENTERPRISE: Extract organizationSlug from metadata safely
    const metadata = resetTokenData.metadata as Record<string, unknown> | null;
    const organizationSlug =
      (metadata?.organizationSlug as string | null) || null;

    return NextResponse.json({
      success: true,
      email: resetTokenData.userEmail,
      name: resetTokenData.userName,
      organizationSlug,
      expiresAt: resetTokenData.expiresAt,
      attemptsRemaining: resetTokenData.maxAttempts - resetTokenData.attempts,
      message: 'Token is valid',
    });
  } catch (error) {
    console.error('❌ ACHROMATIC: Validate reset token API error:', error);

    // ✅ ENTERPRISE: Log system error
    await logAuthEvent({
      eventType: 'password_reset',
      eventAction: 'validate_reset_token_system_error',
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
          message: 'An unexpected error occurred',
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
