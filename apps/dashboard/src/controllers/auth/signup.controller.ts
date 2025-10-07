import type { NextRequest } from 'next/server';
import { SignupService } from '../../services/auth/signup.service';
import { BaseController } from '../base/base.controller';
import type {
  AuthErrorCodes,
  AuthHttpStatus,
  ErrorResponse,
  SignUpRequest,
  SignUpResponse,
} from '../types';
import { signUpSchema } from '../types';

/**
 * ✅ SRP: Controller apenas para signup endpoint
 * ~60 linhas - Single Responsibility
 */
export class SignupController extends BaseController {
  private signupService: SignupService;

  constructor() {
    super();
    this.signupService = new SignupService();
  }

  async execute(
    data: SignUpRequest,
    request: NextRequest
  ): Promise<{
    response: SignUpResponse | ErrorResponse;
    status: AuthHttpStatus;
  }> {
    try {
      const context = this.getRequestContext(request);

      // ✅ 1. Validate input
      const validation = signUpSchema.safeParse(data);
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
      const result = await this.signupService.createUser(
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
          organization: result.organization || null,
          message: 'Account created successfully',
        },
        status: AuthHttpStatus.OK,
      };
    } catch (error) {
      return await this.handleError(error, request, 'signup');
    }
  }

  // ✅ HELPER: Map error codes to HTTP status
  private mapErrorCodeToStatus(errorCode: string): AuthHttpStatus {
    switch (errorCode) {
      case 'USER_EXISTS':
        return AuthHttpStatus.CONFLICT;
      case 'PASSWORD_WEAK':
        return AuthHttpStatus.BAD_REQUEST;
      case 'EMAIL_NOT_AVAILABLE':
        return AuthHttpStatus.CONFLICT;
      default:
        return AuthHttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
