// apps/dashboard/app/api/auth/reset-password/route.ts - ACHROMATIC ENTERPRISE RESET PASSWORD

import {
  hashPassword,
  logAuthEvent,
  revokeAllUserSessions,
  validatePasswordReuse,
  validatePasswordStrength
} from '@workspace/auth/server';
import { db, passwordResetTokens, users } from '@workspace/database';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// ✅ ENTERPRISE: Validation schema
const resetPasswordSchema = z
  .object({
    token: z.string().uuid('Invalid token format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be less than 72 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
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
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.issues[0]?.message || 'Invalid input',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // ✅ ACHROMATIC: Find and validate token with user data
    const [resetTokenData] = await db
      .select({
        tokenId: passwordResetTokens.id,
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
        currentPasswordHash: users.passwordHash,
      })
      .from(passwordResetTokens)
      .innerJoin(users, eq(passwordResetTokens.userId, users.id))
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    // ✅ ENTERPRISE: Validate token
    if (!resetTokenData) {
      await logAuthEvent({
        eventType: 'password_reset',
        eventAction: 'reset_password_invalid_token',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: { token: `${token.substring(0, 8)}...` },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_INVALID',
            message: 'Invalid reset token',
          },
        },
        { status: 404 }
      );
    }

    // ✅ ENTERPRISE: Check expiration
    if (resetTokenData.expiresAt < new Date()) {
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'reset_password_expired_token',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: { email: resetTokenData.userEmail },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Reset token has expired',
          },
        },
        { status: 410 }
      );
    }

    // ✅ ENTERPRISE: Check if already used
    if (resetTokenData.usedAt) {
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'reset_password_used_token',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: { email: resetTokenData.userEmail },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_USED',
            message: 'Reset token has already been used',
          },
        },
        { status: 410 }
      );
    }

    // ✅ ENTERPRISE: Check if revoked
    if (resetTokenData.isRevoked) {
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'reset_password_revoked_token',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: { email: resetTokenData.userEmail },
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

    // ✅ ENTERPRISE: Check attempts
    if (resetTokenData.attempts >= resetTokenData.maxAttempts) {
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'reset_password_max_attempts',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: { email: resetTokenData.userEmail },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MAX_ATTEMPTS_EXCEEDED',
            message: 'Maximum reset attempts exceeded',
          },
        },
        { status: 429 }
      );
    }

    // ✅ ENTERPRISE: Check user is active
    if (!resetTokenData.userIsActive) {
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

    // ✅ ENTERPRISE: Validate password strength
    const strengthValidation = validatePasswordStrength(password, {
      email: resetTokenData.userEmail,
      name: resetTokenData.userName || undefined,
    });

    if (!strengthValidation.isValid) {
      // ✅ INCREMENT ATTEMPTS
      await db
        .update(passwordResetTokens)
        .set({
          attempts: resetTokenData.attempts + 1,
        })
        .where(eq(passwordResetTokens.id, resetTokenData.tokenId));

      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'reset_password_weak_password',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        eventData: {
          email: resetTokenData.userEmail,
          strengthScore: strengthValidation.score,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_WEAK',
            message:
              strengthValidation.errors?.[0] ||
              'Password does not meet security requirements',
            suggestions: strengthValidation.suggestions,
          },
        },
        { status: 400 }
      );
    }

    // ✅ ENTERPRISE: Check password reuse (SAFE VERSION)
    let reuseValidation = { isValid: true };

    if (resetTokenData.currentPasswordHash) {
      reuseValidation = await validatePasswordReuse(password, [
        resetTokenData.currentPasswordHash,
      ]);

      if (!reuseValidation.isValid) {
        // ✅ INCREMENT ATTEMPTS
        await db
          .update(passwordResetTokens)
          .set({
            attempts: resetTokenData.attempts + 1,
          })
          .where(eq(passwordResetTokens.id, resetTokenData.tokenId));

        await logAuthEvent({
          userId: resetTokenData.userId,
          eventType: 'password_reset',
          eventAction: 'reset_password_reuse',
          eventStatus: 'failure',
          eventCategory: 'security',
          ipAddress,
          userAgent,
          eventData: { email: resetTokenData.userEmail },
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PASSWORD_REUSED',
              message: 'Cannot reuse recent passwords',
            },
          },
          { status: 400 }
        );
      }
    } else {
      // ✅ ENTERPRISE: Log OAuth user case
      await logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'reset_password_oauth_user',
        eventStatus: 'success',
        eventCategory: 'auth',
        ipAddress,
        userAgent,
        eventData: {
          email: resetTokenData.userEmail,
          note: 'OAuth user setting password for first time',
        },
      });
    }

    // ✅ ENTERPRISE: Hash new password
    const newPasswordHash = await hashPassword(password);
    const now = new Date();

    // ✅ ACHROMATIC: Update user password and mark token as used
    await Promise.all([
      // Update user password
      db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          passwordChangedAt: now,
          failedLoginAttempts: 0,
          accountLockedAt: null,
          accountLockedUntil: null,
          updatedAt: now,
        })
        .where(eq(users.id, resetTokenData.userId)),

      // Mark token as used
      db
        .update(passwordResetTokens)
        .set({
          usedAt: now,
          attempts: resetTokenData.attempts + 1,
        })
        .where(eq(passwordResetTokens.id, resetTokenData.tokenId)),
    ]);

    // ✅ ENTERPRISE: Revoke all user sessions for security
    try {
      const revokedCount = await revokeAllUserSessions(
        resetTokenData.userId,
        undefined, // Don't keep any sessions
        'password_reset'
      );
      // eslint-disable-next-line no-console
      console.log(
        `✅ ACHROMATIC: ${revokedCount} sessions revoked after password reset`
      );
    } catch (sessionError) {
      console.error(
        '❌ ACHROMATIC: Error revoking sessions after password reset:',
        sessionError
      );
      // Don't fail the password reset if session revocation fails
    }

    // ✅ ENTERPRISE: Log successful password reset
    await logAuthEvent({
      userId: resetTokenData.userId,
      eventType: 'password_reset',
      eventAction: 'reset_password_success',
      eventStatus: 'success',
      eventCategory: 'security',
      ipAddress,
      userAgent,
      eventData: {
        email: resetTokenData.userEmail,
        strengthScore: strengthValidation.score,
        metadata: resetTokenData.metadata,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        email: resetTokenData.userEmail,
        name: resetTokenData.userName,
      },
    });
  } catch (error) {
    console.error('❌ ACHROMATIC: Reset password API error:', error);

    // ✅ ENTERPRISE: Log system error
    await logAuthEvent({
      eventType: 'password_reset',
      eventAction: 'reset_password_system_error',
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
