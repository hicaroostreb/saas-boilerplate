// apps/dashboard/app/api/auth/sign-up/route.ts - ACHROMATIC ENTERPRISE SIGN-UP

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db, users, organizations, memberships } from '@workspace/database';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { 
  hashPassword, 
  validatePasswordStrength,
  logAuthEvent,
  parseDeviceInfo, 
  calculateRiskScore
} from '@workspace/auth/server';
import { z } from 'zod';

// ✅ ENTERPRISE: Enhanced validation schema (CORRIGIDO)
const signUpSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(64, 'Name must be less than 64 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters'),
  // ✅ CORREÇÃO CRÍTICA: Aceitar null e undefined
  organizationSlug: z.string().optional().nullable(),
  invitationToken: z.string().optional().nullable(),
  returnTo: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    // ✅ ENTERPRISE: Get request context
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') ?? 
                    headersList.get('x-real-ip') ?? 
                    'unknown';
    const userAgent = headersList.get('user-agent') ?? 'unknown';

    // ✅ ACHROMATIC: Parse and validate input
    const body = await request.json();
    const validation = signUpSchema.safeParse(body);

    if (!validation.success) {
      await logAuthEvent({
        eventType: 'login',
        eventAction: 'signup_validation_failed',
        eventStatus: 'failure',
        eventCategory: 'auth',
        ipAddress,
        userAgent,
        errorMessage: 'Sign-up validation failed',
        eventData: {
          email: body.email,
          validationErrors: validation.error.issues,
        },
      });

      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR',
            message: validation.error.issues[0]?.message ?? 'Invalid input',
            details: validation.error.issues,
          }
        },
        { status: 400 }
      );
    }

    const { name, email, password, organizationSlug, invitationToken } = validation.data;

    // ✅ ENTERPRISE: Check if user already exists
    const [existingUser] = await db
      .select({ 
        id: users.id, 
        email: users.email, 
        isActive: users.isActive 
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      await logAuthEvent({
        eventType: 'login',
        eventAction: 'signup_user_exists',
        eventStatus: 'failure',
        eventCategory: 'auth',
        ipAddress,
        userAgent,
        errorMessage: 'User already exists',
        eventData: { email, existingUserId: existingUser.id },
      });

      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'USER_EXISTS',
            message: 'An account with this email already exists',
          }
        },
        { status: 409 }
      );
    }

    // ✅ ENTERPRISE: Validate password strength
    const passwordValidation = validatePasswordStrength(password, { email, name });
    if (!passwordValidation.isValid) {
      await logAuthEvent({
        eventType: 'login',
        eventAction: 'signup_weak_password',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress,
        userAgent,
        errorMessage: 'Weak password rejected',
        eventData: {
          email,
          strengthScore: passwordValidation.score,
          strengthErrors: passwordValidation.errors,
        },
      });

      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'PASSWORD_WEAK',
            message: passwordValidation.errors?.[0] ?? 'Password does not meet security requirements',
            suggestions: passwordValidation.suggestions,
          }
        },
        { status: 400 }
      );
    }

    // ✅ ENTERPRISE: Hash password
    const passwordHash = await hashPassword(password);

    // ✅ ENTERPRISE: Generate user ID and timestamps
    const userId = randomUUID();
    const now = new Date();

    // ✅ ENTERPRISE: Parse device and calculate risk
    const deviceInfo = await parseDeviceInfo(userAgent);
    const riskScore = await calculateRiskScore({
      userId,
      ipAddress,
      deviceInfo,
      isNewDevice: true,
      timeOfDay: now,
    });

    // ✅ ACHROMATIC: Create user
    const newUser = {
      id: userId,
      name,
      email,
      passwordHash,
      emailVerified: null,
      image: null,
      isActive: true,
      lastLoginAt: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
      securityLevel: riskScore.score >= 50 ? 'elevated' : 'normal',
      passwordChangedAt: now,
      accountLockedAt: null,
      accountLockedUntil: null,
      failedLoginAttempts: 0,
      preferences: {
        signUpMethod: 'credentials',
        initialRiskScore: riskScore,
        signUpDeviceInfo: deviceInfo,
        signUpIpAddress: ipAddress,
      },
      createdAt: now,
      updatedAt: now,
    };

    const [createdUser] = await db.insert(users).values(newUser).returning({
      id: users.id,
      email: users.email,
      name: users.name,
    });

    // ✅ ENTERPRISE: Handle organization membership
    let organizationId: string | null = null;
    if (organizationSlug) {
      try {
        const [organization] = await db
          .select({ 
            id: organizations.id, 
            name: organizations.name 
          })
          .from(organizations)
          .where(and(
            eq(organizations.slug, organizationSlug),
            eq(organizations.isActive, true)
          ))
          .limit(1);

        if (organization) {
          organizationId = organization.id;

          // ✅ ENTERPRISE: Create membership
          await db.insert(memberships).values({
            id: randomUUID(),
            userId,
            organizationId: organization.id,
            role: 'member',
            permissions: null,
            customPermissions: null,
            isActive: true,
            metadata: {
              joinMethod: 'signup',
              invitationToken: invitationToken ?? null,
            },
            createdAt: now,
          });

          console.log(`✅ ACHROMATIC: User added to organization: ${organizationSlug}`);
        }
      } catch (orgError) {
        console.error('❌ ACHROMATIC: Error adding user to organization:', orgError);
      }
    }

    // ✅ ENTERPRISE: Log successful sign-up
    await logAuthEvent({
      userId,
      organizationId,
      eventType: 'login',
      eventAction: 'signup_success',
      eventStatus: 'success',
      eventCategory: 'auth',
      ipAddress,
      userAgent,
      eventData: {
        email,
        name,
        organizationSlug,
        hasInvitation: Boolean(invitationToken),
        signUpMethod: 'credentials',
        deviceInfo,
        riskScore,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      },
      organization: organizationId ? { id: organizationId, slug: organizationSlug } : null,
      message: 'Account created successfully',
    });

  } catch (error) {
    console.error('❌ ACHROMATIC: Sign-up API error:', error);

    // ✅ ENTERPRISE: Log system error
    await logAuthEvent({
      eventType: 'login',
      eventAction: 'signup_system_error',
      eventStatus: 'error',
      eventCategory: 'auth',
      ipAddress: request.headers.get('x-forwarded-for') ?? 'unknown',
      userAgent: request.headers.get('user-agent') ?? 'unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      eventData: {
        error: error instanceof Error ? error.stack : String(error),
      },
    });

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SYSTEM_ERROR',
          message: 'An unexpected error occurred. Please try again.',
        }
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
