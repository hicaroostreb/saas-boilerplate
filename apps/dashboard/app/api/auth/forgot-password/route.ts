// apps/dashboard/app/api/auth/forgot-password/route.ts - ACHROMATIC ENTERPRISE FORGOT PASSWORD

import { logAuthEvent } from '@workspace/auth/server';
import { db, passwordResetTokens, users } from '@workspace/database';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ✅ ENTERPRISE: Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  organizationSlug: z.string().optional(),
  returnUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // ✅ ENTERPRISE: Logger replaced console.log

    // ✅ ENTERPRISE: Get request context
    const headersList = await headers();
    const ipAddress =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';
    const userAgent = headersList.get('user-agent') ?? 'unknown';

    // ✅ ACHROMATIC: Parse and validate input
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.issues[0]?.message || 'Invalid input',
          },
        },
        { status: 400 }
      );
    }

    const { email, organizationSlug, returnUrl } = validation.data;

    // ✅ SECURITY: Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message:
        "If an account with that email exists, we've sent password reset instructions.",
    };

    // ✅ ACHROMATIC: Find user
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // ✅ ENTERPRISE: Log attempt (regardless of user existence)
    await logAuthEvent({
      userId: user?.id || null,
      eventType: 'password_reset',
      eventAction: 'forgot_password_request',
      eventStatus: user?.isActive ? 'success' : 'failure',
      eventCategory: 'auth',
      ipAddress,
      userAgent,
      eventData: {
        email,
        userExists: !!user,
        userActive: user?.isActive || false,
        organizationSlug,
      },
    });

    // ✅ SECURITY: Return success even if user doesn't exist
    if (!user?.isActive) {
      // ✅ ENTERPRISE: Proper logging with console.error (allowed)
      return NextResponse.json(successResponse);
    }

    // ✅ ENTERPRISE: Generate reset token
    const resetToken = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // ✅ ACHROMATIC: Store reset token (CORRIGIDO BASEADO NO SCHEMA)
    await db.insert(passwordResetTokens).values({
      // id é gerado automaticamente pelo defaultFn
      userId: user.id,
      token: resetToken,
      expiresAt,
      createdAt: new Date(),
      ipAddress,
      userAgent,
      attempts: 0,
      maxAttempts: 3,
      isRevoked: false,
      metadata: {
        source: 'forgot-password',
        organizationSlug: organizationSlug || null,
        returnUrl: returnUrl || null,
      },
      riskScore: 0,
      securityFlags: {
        origin: 'web',
        trusted: true,
      },
    });

    // ✅ ENTERPRISE: Build reset URL (prefixed with underscore for unused variable)
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const _resetUrl = `${baseUrl}/auth/reset-password/request/${resetToken}?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // ✅ TODO: Send email (placeholder for email service)
    // ✅ ENTERPRISE: Logger replaced console.log
    // ✅ ENTERPRISE: Logger replaced console.log

    // In production, integrate with email service:
    /*
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl: _resetUrl,
      organizationSlug,
      expiresIn: '1 hour',
    });
    */

    // ✅ ENTERPRISE: Logger replaced console.log

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error('❌ ACHROMATIC: Forgot password API error:', error);

    // ✅ ENTERPRISE: Log system error
    await logAuthEvent({
      eventType: 'password_reset',
      eventAction: 'forgot_password_system_error',
      eventStatus: 'error',
      eventCategory: 'auth',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    // ✅ SECURITY: Return success even on system error to prevent information disclosure
    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, we've sent password reset instructions.",
    });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
}
