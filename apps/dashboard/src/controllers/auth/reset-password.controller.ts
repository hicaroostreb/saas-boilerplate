import type { NextRequest } from 'next/server';
import { PasswordResetService } from '../../services/auth/password-reset.service';
import { BaseController } from '../base/base.controller';
import type {
  AuthErrorCodes,
  AuthHttpStatus,
  ErrorResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types';
import { resetPasswordSchema } from '../types';

/**
 * ✅ SRP: Controller apenas para reset password endpoint
 * ~55 linhas - Single Responsibility
 */
export class ResetPasswordController extends BaseController {
  private passwordResetService: PasswordResetService;

  constructor() {
    super();
    this.passwordResetService = new PasswordResetService();
  }

  async execute(
    data: ResetPasswordRequest,
    request: NextRequest
  ): Promise<{
    response: ResetPasswordResponse | ErrorResponse;
    status: AuthHttpStatus;
  }> {
    try {
      const context = this.getRequestContext(request);

      // ✅ 1. Validate input
      const validation = resetPasswordSchema.safeParse(data);
      if (!validation.success) {
        return {
          response: this.createErrorResponse(
            AuthErrorCodes.VALIDATION_ERROR,
            validation.error.issues[0]?.message || 'Invalid input',
            validation.error.issues
          ),
          status: AuthHttpStatus.BAD_REQUEST,
        };
      }

      // ✅ 2. Execute business logic via service
      const result = await this.passwordResetService.resetPassword(
        validation.data,
        context
      );

      // ✅ 3. Handle service response
      if (!result.success) {
        return {
          response: this.createErrorResponse(
            result.error!.code as AuthErrorCodes,
            result.error!.message,
            undefined,
            result.error!.suggestions
          ),
          status: this.mapErrorCodeToStatus(result.error!.code),
        };
      }

      // ✅ 4. Return successful response
      return {
        response: {
          success: true,
          user: result.user!,
          message: 'Password reset successfully',
        },
        status: AuthHttpStatus.OK,
      };
    } catch (error) {
      return await this.handleError(error, request, 'reset_password');
    }
  }

  // ✅ HELPER: Map error codes to HTTP status
  private mapErrorCodeToStatus(errorCode: string): AuthHttpStatus {
    switch (errorCode) {
      case 'TOKEN_INVALID':
        return AuthHttpStatus.NOT_FOUND;
      case 'TOKEN_EXPIRED':
      case 'TOKEN_USED':
      case 'TOKEN_REVOKED':
        return AuthHttpStatus.GONE;
      case 'PASSWORD_WEAK':
      case 'PASSWORD_REUSED':
        return AuthHttpStatus.BAD_REQUEST;
      case 'MAX_ATTEMPTS_EXCEEDED':
        return AuthHttpStatus.TOO_MANY_REQUESTS;
      case 'USER_INACTIVE':
        return AuthHttpStatus.FORBIDDEN;
      default:
        return AuthHttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
