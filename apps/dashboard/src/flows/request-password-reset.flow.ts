import { db, passwordResetTokens } from '@workspace/database';
import { randomUUID } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { AuditService } from '../services/audit.service';

export interface RequestPasswordResetFlowRequest {
  email: string;
  organizationSlug?: string;
  returnUrl?: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * ✅ ENTERPRISE: Facade para request password reset
 */
export async function requestPasswordResetFlow(
  request: RequestPasswordResetFlowRequest
): Promise<void> {
  const userRepository = new UserRepository();
  const auditService = new AuditService();

  try {
    const { email, organizationSlug, returnUrl } = request;

    // ✅ Find user
    const user = await userRepository.findByEmail(email);

    // ✅ Log attempt (always log, even if user doesn't exist)
    await auditService.logAuthEvent({
      userId: user?.id || null,
      eventType: 'password_reset',
      eventAction: 'forgot_password_request',
      eventStatus: user?.isActive ? 'success' : 'failure',
      eventCategory: 'auth',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      eventData: {
        email,
        userExists: !!user,
        userActive: user?.isActive || false,
        organizationSlug,
      },
    });

    // ✅ SECURITY: Exit early if user doesn't exist or is inactive
    if (!user || !user.isActive) {
      return; // Always return void for security (anti-enumeration)
    }

    // ✅ Generate reset token
    const resetToken = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // ✅ Store reset token
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expiresAt,
      createdAt: new Date(),
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
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

    // TODO: Send email (integrate with email service)
    // const emailService = new EmailService();
    // await emailService.sendPasswordResetEmail(user.email, resetToken, returnUrl);

    console.log(
      `✅ Password reset token generated for ${email}: ${resetToken}`
    );
  } catch (error) {
    console.error('❌ requestPasswordResetFlow error:', error);

    await auditService.logAuthEvent({
      eventType: 'password_reset',
      eventAction: 'forgot_password_system_error',
      eventStatus: 'error',
      eventCategory: 'auth',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      eventData: { email: request.email },
    });

    // ✅ SECURITY: Don't throw - always return void for anti-enumeration
  }
}
