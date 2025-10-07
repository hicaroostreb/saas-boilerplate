import { db, passwordResetTokens, users } from '@workspace/database';
import { eq } from 'drizzle-orm';
import { AuditService } from '../services/audit.service';

export interface ValidateResetTokenFlowRequest {
  token: string;
  ipAddress: string;
  userAgent: string;
}

export interface ValidateResetTokenFlowResult {
  valid: boolean;
  payload?: {
    email: string;
    name: string;
    organizationSlug?: string | null;
    expiresAt: Date;
    attemptsRemaining: number;
  };
  errorCode?: string;
  message?: string;
}

/**
 * ✅ ENTERPRISE: Facade para validate reset token
 */
export async function validateResetTokenFlow(
  request: ValidateResetTokenFlowRequest
): Promise<ValidateResetTokenFlowResult> {
  const auditService = new AuditService();

  try {
    const { token } = request;

    // ✅ Find and validate token
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
        userEmail: users.email,
        userName: users.name,
        userIsActive: users.isActive,
      })
      .from(passwordResetTokens)
      .innerJoin(users, eq(passwordResetTokens.userId, users.id))
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    // ✅ Log validation attempt
    await auditService.logAuthEvent({
      userId: resetTokenData?.userId || null,
      eventType: 'password_reset',
      eventAction: 'validate_reset_token',
      eventStatus: resetTokenData ? 'success' : 'failure',
      eventCategory: 'security',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      eventData: {
        token: `${token.substring(0, 8)}...`,
        tokenExists: Boolean(resetTokenData),
        email: resetTokenData?.userEmail,
      },
    });

    // ✅ Check if token exists
    if (!resetTokenData) {
      return {
        valid: false,
        errorCode: 'TOKEN_INVALID',
        message: 'Invalid or non-existent reset token',
      };
    }

    // ✅ Check if token is expired
    if (resetTokenData.expiresAt < new Date()) {
      return {
        valid: false,
        errorCode: 'TOKEN_EXPIRED',
        message: 'Reset token has expired',
      };
    }

    // ✅ Check if token was already used
    if (resetTokenData.usedAt) {
      return {
        valid: false,
        errorCode: 'TOKEN_USED',
        message: 'Reset token has already been used',
      };
    }

    // ✅ Check if token is revoked
    if (resetTokenData.isRevoked) {
      return {
        valid: false,
        errorCode: 'TOKEN_REVOKED',
        message: 'Reset token has been revoked',
      };
    }

    // ✅ Check attempts
    if (resetTokenData.attempts >= resetTokenData.maxAttempts) {
      return {
        valid: false,
        errorCode: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum validation attempts exceeded',
      };
    }

    // ✅ Check if user is active
    if (!resetTokenData.userIsActive) {
      return {
        valid: false,
        errorCode: 'USER_INACTIVE',
        message: 'User account is inactive',
      };
    }

    // ✅ Extract organizationSlug from metadata
    const metadata = resetTokenData.metadata as Record<string, unknown> | null;
    const organizationSlug =
      (metadata?.organizationSlug as string | null) || null;

    // ✅ Token is valid
    return {
      valid: true,
      payload: {
        email: resetTokenData.userEmail,
        name: resetTokenData.userName || '',
        organizationSlug,
        expiresAt: resetTokenData.expiresAt,
        attemptsRemaining: resetTokenData.maxAttempts - resetTokenData.attempts,
      },
    };
  } catch (error) {
    console.error('❌ validateResetTokenFlow error:', error);

    await auditService.logAuthEvent({
      eventType: 'password_reset',
      eventAction: 'validate_reset_token_system_error',
      eventStatus: 'error',
      eventCategory: 'auth',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      eventData: { token: `${request.token.substring(0, 8)}...` },
    });

    return {
      valid: false,
      errorCode: 'SYSTEM_ERROR',
      message: 'Token validation failed due to system error',
    };
  }
}
