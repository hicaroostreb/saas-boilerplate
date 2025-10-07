import { logAuthEvent } from '@workspace/auth/server'; // ✅ CORRETO: Apenas auth server
import type { NextRequest } from 'next/server';
import type {
  AuthErrorCodes,
  AuthHttpStatus,
  ErrorResponse,
  RequestContext,
} from '../types';

// ✅ CORRETO: Base controller sem database imports
export abstract class BaseController {
  protected getRequestContext(request: NextRequest): RequestContext {
    return {
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') ?? 'unknown',
    };
  }

  protected createErrorResponse(
    code: AuthErrorCodes,
    message: string,
    details?: unknown,
    suggestions?: string[]
  ): ErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        ...(suggestions && { suggestions }),
      },
    };
  }

  protected async handleError(
    error: unknown,
    request: NextRequest,
    eventAction: string,
    userId?: string
  ): Promise<{
    response: ErrorResponse;
    status: AuthHttpStatus;
  }> {
    const context = this.getRequestContext(request);

    // ✅ CORRETO: Usa logAuthEvent do @workspace/auth
    await logAuthEvent({
      userId: userId || null,
      eventType: 'system',
      eventAction: `${eventAction}_system_error`,
      eventStatus: 'error',
      eventCategory: 'auth',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      eventData: {
        error: error instanceof Error ? error.stack : String(error),
      },
    });

    console.error(`❌ ENTERPRISE: ${eventAction} error:`, error);

    return {
      response: this.createErrorResponse(
        AuthErrorCodes.SYSTEM_ERROR,
        'An unexpected error occurred. Please try again.'
      ),
      status: AuthHttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  protected async logSuccess(
    eventAction: string,
    context: RequestContext,
    eventData: Record<string, unknown>,
    userId?: string,
    organizationId?: string
  ): Promise<void> {
    // ✅ CORRETO: Usa logAuthEvent do @workspace/auth
    await logAuthEvent({
      userId: userId || null,
      organizationId: organizationId || null,
      eventType: 'auth',
      eventAction,
      eventStatus: 'success',
      eventCategory: 'auth',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      eventData,
    });
  }

  protected async logFailure(
    eventAction: string,
    context: RequestContext,
    errorMessage: string,
    eventData: Record<string, unknown>,
    userId?: string
  ): Promise<void> {
    // ✅ CORRETO: Usa logAuthEvent do @workspace/auth
    await logAuthEvent({
      userId: userId || null,
      eventType: 'auth',
      eventAction,
      eventStatus: 'failure',
      eventCategory: 'auth',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      errorMessage,
      eventData,
    });
  }
}
