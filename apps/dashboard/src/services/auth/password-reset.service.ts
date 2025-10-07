import type {
  RequestContext,
  ResetPasswordRequest,
  ValidateTokenRequest,
} from '@workspace/auth';
import {
  resetPasswordFlow,
  validateResetTokenFlow,
} from '@workspace/auth/server';

export interface ResetPasswordResult {
  success: boolean;
  user?: {
    email: string;
    name: string;
  };
  error?: {
    code: string;
    message: string;
    suggestions?: string[];
  };
}

export interface ValidateTokenResult {
  success: boolean;
  valid: boolean;
  email?: string;
  name?: string;
  organizationSlug?: string | null;
  expiresAt?: Date;
  attemptsRemaining?: number;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * ✅ SRP: Service para reset password e validate token
 * ~70 linhas - Business logic delegation
 */
export class PasswordResetService {
  async resetPassword(
    data: ResetPasswordRequest,
    context: RequestContext
  ): Promise<ResetPasswordResult> {
    try {
      // ✅ CORRETO: Usa apenas facade do @workspace/auth
      const result = await resetPasswordFlow({
        ...data,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      if (!result.success) {
        return {
          success: false,
          error: {
            code: result.errorCode || 'RESET_FAILED',
            message: result.message || 'Password reset failed',
            suggestions: result.suggestions,
          },
        };
      }

      return {
        success: true,
        user: result.user
          ? {
              email: result.user.email,
              name: result.user.name || '',
            }
          : undefined,
      };
    } catch (error) {
      console.error('❌ PasswordResetService resetPassword error:', error);

      return {
        success: false,
        error: {
          code: 'SYSTEM_ERROR',
          message: 'An unexpected error occurred',
        },
      };
    }
  }

  async validateResetToken(
    data: ValidateTokenRequest,
    context: RequestContext
  ): Promise<ValidateTokenResult> {
    try {
      // ✅ CORRETO: Usa apenas facade do @workspace/auth
      const result = await validateResetTokenFlow({
        ...data,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      if (!result.valid) {
        return {
          success: true, // Request succeeded
          valid: false,
          error: {
            code: result.errorCode || 'TOKEN_INVALID',
            message: result.message || 'Invalid or expired token',
          },
        };
      }

      return {
        success: true,
        valid: true,
        email: result.payload?.email,
        name: result.payload?.name,
        organizationSlug: result.payload?.organizationSlug,
        expiresAt: result.payload?.expiresAt,
        attemptsRemaining: result.payload?.attemptsRemaining,
      };
    } catch (error) {
      console.error('❌ PasswordResetService validateToken error:', error);

      return {
        success: false,
        valid: false,
        error: {
          code: 'SYSTEM_ERROR',
          message: 'An unexpected error occurred',
        },
      };
    }
  }
}
