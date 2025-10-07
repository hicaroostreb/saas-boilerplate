import { db, passwordResetTokens, users } from '@workspace/database';
import { eq } from 'drizzle-orm';
import {
  hashPassword,
  validatePasswordReuse,
  validatePasswordStrength,
} from '../password';
import { UserRepository } from '../repositories/user.repository';
import { revokeAllUserSessions } from '../server';
import { AuditService } from '../services/audit.service';

export interface ResetPasswordFlowRequest {
  token: string;
  password: string;
  confirmPassword?: string;
  ipAddress: string;
  userAgent: string;
}

export interface ResetPasswordFlowResult {
  success: boolean;
  user?: {
    email: string;
    name: string;
  };
  errorCode?: string;
  message?: string;
  suggestions?: string[];
}

/**
 * ✅ ENTERPRISE: Facade para reset password
 */
export async function resetPasswordFlow(
  request: ResetPasswordFlowRequest
): Promise<ResetPasswordFlowResult> {
  const userRepository = new UserRepository();
  const auditService = new AuditService();

  try {
    const { token, password } = request;

    // ✅ Find and validate token with user data
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
        userEmail: users.email,
        userName: users.name,
        userIsActive: users.isActive,
        currentPasswordHash: users.passwordHash,
      })
      .from(passwordResetTokens)
      .innerJoin(users, eq(passwordResetTokens.userId, users.id))
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    // ✅ Validate token exists
    if (!resetTokenData) {
      await auditService.logAuthEvent({
        eventType: 'password_reset',
        eventAction: 'reset_password_invalid_token',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        eventData: { token: `${token.substring(0, 8)}...` },
      });

      return {
        success: false,
        errorCode: 'TOKEN_INVALID',
        message: 'Invalid reset token',
      };
    }

    // ✅ Check expiration
    if (resetTokenData.expiresAt < new Date()) {
      await auditService.logAuthEvent({
        userId: resetTokenData.userId,
        eventType: 'password_reset',
        eventAction: 'reset_password_expired_token',
        eventStatus: 'failure',
        eventCategory: 'security',
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        eventData: { email: resetTokenData.userEmail },
      });

      return {
        success: false,
        errorCode: 'TOKEN_EXPIRED',
        message: 'Reset token has expired',
      };
    }

    // ✅ Check if token was already used
    if (resetTokenData.usedAt) {
      return {
        success: false,
        errorCode: 'TOKEN_USED',
        message: 'Reset token has already been used',
      };
    }

    // ✅ Check if token is revoked
    if (resetTokenData.isRevoked) {
      return {
        success: false,
        errorCode: 'TOKEN_REVOKED',
        message: 'Reset token has been revoked',
      };
    }

    // ✅ Check attempts
    if (resetTokenData.attempts >= resetTokenData.maxAttempts) {
      return {
        success: false,
        errorCode: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum reset attempts exceeded',
      };
    }

    // ✅ Check if user is active
    if (!resetTokenData.userIsActive) {
      return {
        success: false,
        errorCode: 'USER_INACTIVE',
        message: 'User account is inactive',
      };
    }

    // ✅ Validate password strength
    const strengthValidation = validatePasswordStrength(password, {
      email: resetTokenData.userEmail,
      name: resetTokenData.userName || undefined,
    });

    if (!strengthValidation.isValid) {
      // Increment attempts
      await db
        .update(passwordResetTokens)
        .set({ attempts: resetTokenData.attempts + 1 })
        .where(eq(passwordResetTokens.id, resetTokenData.tokenId));

      return {
        success: false,
        errorCode: 'PASSWORD_WEAK',
        message:
          strengthValidation.errors?.[0] ||
          'Password does not meet security requirements',
        suggestions: strengthValidation.suggestions,
      };
    }

    // ✅ Check password reuse
    if (resetTokenData.currentPasswordHash) {
      const reuseValidation = await validatePasswordReuse(password, [
        resetTokenData.currentPasswordHash,
      ]);

      if (!reuseValidation.isValid) {
        return {
          success: false,
          errorCode: 'PASSWORD_REUSED',
          message: 'Cannot reuse recent passwords',
        };
      }
    }

    // ✅ Hash new password
    const newPasswordHash = await hashPassword(password);
    const now = new Date();

    // ✅ Update user password and mark token as used
    await Promise.all([
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

      db
        .update(passwordResetTokens)
        .set({
          usedAt: now,
          attempts: resetTokenData.attempts + 1,
        })
        .where(eq(passwordResetTokens.id, resetTokenData.tokenId)),
    ]);

    // ✅ Revoke all user sessions
    try {
      await revokeAllUserSessions(
        resetTokenData.userId,
        false,
        'password_reset'
      );
    } catch (sessionError) {
      console.error('❌ Error revoking sessions:', sessionError);
    }

    // ✅ Log successful reset
    await auditService.logAuthEvent({
      userId: resetTokenData.userId,
      eventType: 'password_reset',
      eventAction: 'reset_password_success',
      eventStatus: 'success',
      eventCategory: 'security',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      eventData: {
        email: resetTokenData.userEmail,
        strengthScore: strengthValidation.score,
        metadata: resetTokenData.metadata,
      },
    });

    return {
      success: true,
      user: {
        email: resetTokenData.userEmail,
        name: resetTokenData.userName || '',
      },
    };
  } catch (error) {
    console.error('❌ resetPasswordFlow error:', error);

    await auditService.logAuthEvent({
      eventType: 'password_reset',
      eventAction: 'reset_password_system_error',
      eventStatus: 'error',
      eventCategory: 'auth',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      errorCode: 'SYSTEM_ERROR',
      message: 'Password reset failed due to system error',
    };
  }
}
