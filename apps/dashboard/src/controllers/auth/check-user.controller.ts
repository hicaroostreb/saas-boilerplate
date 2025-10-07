import type { NextRequest } from 'next/server';
import { UserCheckService } from '../../services/auth/user-check.service';
import { BaseController } from '../base/base.controller';
import type {
  AuthErrorCodes,
  AuthHttpStatus,
  CheckUserRequest,
  CheckUserResponse,
  ErrorResponse,
} from '../types';
import { checkUserSchema } from '../types';

/**
 * ✅ SRP: Controller apenas para check user endpoint
 * ~50 linhas - Single Responsibility
 */
export class CheckUserController extends BaseController {
  private userCheckService: UserCheckService;

  constructor() {
    super();
    this.userCheckService = new UserCheckService();
  }

  async execute(
    data: CheckUserRequest,
    request: NextRequest
  ): Promise<{
    response: CheckUserResponse | ErrorResponse;
    status: AuthHttpStatus;
  }> {
    try {
      const context = this.getRequestContext(request);

      // ✅ 1. Validate input
      const validation = checkUserSchema.safeParse(data);
      if (!validation.success) {
        return {
          response: this.createErrorResponse(
            AuthErrorCodes.VALIDATION_ERROR,
            validation.error.issues[0]?.message || 'Invalid email'
          ),
          status: AuthHttpStatus.BAD_REQUEST,
        };
      }

      // ✅ 2. Execute business logic via service
      const result = await this.userCheckService.checkEmailAvailability(
        validation.data.email,
        context
      );

      // ✅ 3. Return formatted response
      return {
        response: {
          success: true,
          available: result.available,
          exists: result.exists,
          user: result.user,
          message: result.message,
        },
        status: AuthHttpStatus.OK,
      };
    } catch (error) {
      return await this.handleError(error, request, 'check_user');
    }
  }
}
