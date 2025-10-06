import type { NextRequest } from 'next/server';
import { PasswordResetService } from '../../services/auth/password-reset.service';
import { BaseController } from '../base/base.controller';
import type {
  AuthErrorCodes,
  AuthHttpStatus,
  ErrorResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from '../types';
import { validateTokenSchema } from '../types';

/**
 * ✅ SRP: Controller apenas para validate token endpoint
 * ~50 linhas - Single Responsibility
 */
export class ValidateTokenController extends BaseController {
  private passwordResetService: PasswordResetService;

  constructor() {
    super();
    this.passwordResetService = new PasswordResetService();
  }

  async execute(
    data: ValidateTokenRequest,
    request: NextRequest
  ): Promise<{
    response: ValidateTokenResponse | ErrorResponse;
    status: AuthHttpStatus;
  }> {
    try {
      const context = this.getRequestContext(request);

      // ✅ 1. Validate input
      const validation = validateTokenSchema.safeParse(data);
      if (!validation.success) {
        return {
          response: this.createErrorResponse(
            AuthErrorCodes.VALIDATION_ERROR,
            'Invalid token format'
          ),
          status: AuthHttpStatus.BAD_REQUEST,
        };
      }

      // ✅ 2. Execute business logic via service
      const result = await this.passwordResetService.validateResetToken(
        validation.data,
        context
      );

      // ✅ 3. Handle service response
      if (!result.success) {
        return {
          response: this.createErrorResponse(
            result.error!.code as AuthErrorCodes,
            result.error!.message
          ),
          status: AuthHttpStatus.INTERNAL_SERVER_ERROR,
        };
      }

      if (!result.valid) {
        return {
          response: this.createErrorResponse(
            result.error!.code as AuthErrorCodes,
            result.error!.message
          ),
          status: this.mapErrorCodeToStatus(result.error!.code),
        };
      }

      // ✅ 4. Return successful response
      return {
        response: {
          success: true,
          email: result.email!,
          name: result.name!,
          organizationSlug: result.organizationSlug,
          expiresAt: result.expiresAt!,
          attemptsRemaining: result.attemptsRemaining!,
          message: 'Token is valid',
        },
        status: AuthHttpStatus.OK,
      };
    } catch (error) {
      return await this.handleError(error, request, 'validate_reset_token');
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
      case 'MAX_ATTEMPTS_EXCEEDED':
        return AuthHttpStatus.TOO_MANY_REQUESTS;
      case 'USER_INACTIVE':
        return AuthHttpStatus.FORBIDDEN;
      default:
        return AuthHttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
