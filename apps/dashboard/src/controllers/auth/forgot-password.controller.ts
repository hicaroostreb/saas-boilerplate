import type { NextRequest } from 'next/server';
import { ForgotPasswordService } from '../../services/auth/forgot-password.service';
import { BaseController } from '../base/base.controller';
import type {
  AuthErrorCodes,
  AuthHttpStatus,
  ErrorResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from '../types';
import { forgotPasswordSchema } from '../types';

/**
 * ✅ SRP: Controller apenas para forgot password endpoint
 * ~45 linhas - Single Responsibility
 */
export class ForgotPasswordController extends BaseController {
  private forgotPasswordService: ForgotPasswordService;

  constructor() {
    super();
    this.forgotPasswordService = new ForgotPasswordService();
  }

  async execute(
    data: ForgotPasswordRequest,
    request: NextRequest
  ): Promise<{
    response: ForgotPasswordResponse | ErrorResponse;
    status: AuthHttpStatus;
  }> {
    try {
      const context = this.getRequestContext(request);

      // ✅ 1. Validate input
      const validation = forgotPasswordSchema.safeParse(data);
      if (!validation.success) {
        return {
          response: this.createErrorResponse(
            AuthErrorCodes.VALIDATION_ERROR,
            validation.error.issues[0]?.message || 'Invalid input'
          ),
          status: AuthHttpStatus.BAD_REQUEST,
        };
      }

      // ✅ 2. Execute business logic via service
      const result = await this.forgotPasswordService.requestPasswordReset(
        validation.data,
        context
      );

      // ✅ 3. Return response (always success for security)
      return {
        response: {
          success: true,
          message: result.message,
        },
        status: AuthHttpStatus.OK,
      };
    } catch (error) {
      // ✅ SECURITY: Return success even on system error
      await this.handleError(error, request, 'forgot_password');
      return {
        response: {
          success: true,
          message:
            "If an account with that email exists, we've sent password reset instructions.",
        },
        status: AuthHttpStatus.OK,
      };
    }
  }
}
