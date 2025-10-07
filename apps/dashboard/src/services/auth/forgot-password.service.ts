import type { ForgotPasswordRequest, RequestContext } from '@workspace/auth';
import { requestPasswordResetFlow } from '@workspace/auth/server';

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * ✅ SRP: Service apenas para forgot password
 * ~35 linhas - Business logic delegation
 */
export class ForgotPasswordService {
  async requestPasswordReset(
    data: ForgotPasswordRequest,
    context: RequestContext
  ): Promise<ForgotPasswordResult> {
    try {
      // ✅ CORRETO: Usa apenas facade do @workspace/auth
      await requestPasswordResetFlow({
        ...data,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      // ✅ SECURITY: Always return success (anti-enumeration)
      return {
        success: true,
        message:
          "If an account with that email exists, we've sent password reset instructions.",
      };
    } catch (error) {
      console.error('❌ ForgotPasswordService error:', error);

      // ✅ SECURITY: Return success even on error (anti-enumeration)
      return {
        success: true,
        message:
          "If an account with that email exists, we've sent password reset instructions.",
      };
    }
  }
}
