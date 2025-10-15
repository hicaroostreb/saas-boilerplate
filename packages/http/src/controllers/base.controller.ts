/**
 * @workspace/http - Base HTTP Controller
 * Enterprise HTTP adapter with enhanced response control
 */

import { NextRequest, NextResponse } from 'next/server';

// Enhanced API response structure
export interface ApiResponse<TData = unknown> {
  readonly success: boolean;
  readonly data?: TData;
  readonly error?: {
    readonly message: string;
    readonly code?: string;
  };
  readonly meta?: {
    readonly timestamp: string;
    readonly requestId?: string;
  };
}

// Response options for enhanced control
export interface ResponseOptions {
  readonly headers?: Record<string, string>;
  readonly cache?: {
    readonly maxAge?: number;
    readonly sMaxAge?: number;
    readonly staleWhileRevalidate?: number;
    readonly noCache?: boolean;
    readonly noStore?: boolean;
  };
  readonly cors?: {
    readonly origin?: string;
    readonly credentials?: boolean;
    readonly methods?: string[];
    readonly headers?: string[];
  };
}

// Base controller for HTTP adaptation
export abstract class BaseController {
  // Enhanced success responses
  protected ok<TData>(
    data: TData,
    requestId?: string,
    options?: ResponseOptions
  ): NextResponse {
    const response: ApiResponse<TData> = {
      success: true,
      data,
      ...(requestId && {
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };

    return this.createResponse(response, 200, options);
  }

  protected created<TData>(
    data: TData,
    requestId?: string,
    options?: ResponseOptions
  ): NextResponse {
    const response: ApiResponse<TData> = {
      success: true,
      data,
      ...(requestId && {
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };

    return this.createResponse(response, 201, options);
  }

  protected noContent(
    requestId?: string,
    options?: ResponseOptions
  ): NextResponse {
    const response: ApiResponse<null> = {
      success: true,
      data: null,
      ...(requestId && {
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };

    return this.createResponse(response, 204, options);
  }

  // Enhanced error responses
  protected badRequest(
    message: string,
    code?: string,
    requestId?: string,
    options?: ResponseOptions
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        ...(code && { code }),
      },
      ...(requestId && {
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };

    return this.createResponse(response, 400, options);
  }

  protected unauthorized(
    message = 'Unauthorized',
    requestId?: string,
    options?: ResponseOptions
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: { message, code: 'UNAUTHORIZED' },
      ...(requestId && {
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };

    return this.createResponse(response, 401, options);
  }

  protected forbidden(
    message = 'Forbidden',
    requestId?: string,
    options?: ResponseOptions
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: { message, code: 'FORBIDDEN' },
      ...(requestId && {
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };

    return this.createResponse(response, 403, options);
  }

  protected notFound(
    message = 'Resource not found',
    requestId?: string,
    options?: ResponseOptions
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: { message, code: 'NOT_FOUND' },
      ...(requestId && {
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };

    return this.createResponse(response, 404, options);
  }

  protected serverError(
    message = 'Internal server error',
    requestId?: string,
    options?: ResponseOptions
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: { message, code: 'INTERNAL_ERROR' },
      ...(requestId && {
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      }),
    };

    return this.createResponse(response, 500, options);
  }

  // Enhanced response creation with headers and cache control
  private createResponse(
    data: ApiResponse,
    status: number,
    options?: ResponseOptions
  ): NextResponse {
    const response = NextResponse.json(data, { status });

    // Apply custom headers
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    // Apply cache control
    if (options?.cache) {
      const cacheDirectives: string[] = [];

      if (options.cache.noCache) {
        cacheDirectives.push('no-cache');
      }
      if (options.cache.noStore) {
        cacheDirectives.push('no-store');
      }
      if (options.cache.maxAge !== undefined) {
        cacheDirectives.push(`max-age=${options.cache.maxAge}`);
      }
      if (options.cache.sMaxAge !== undefined) {
        cacheDirectives.push(`s-maxage=${options.cache.sMaxAge}`);
      }
      if (options.cache.staleWhileRevalidate !== undefined) {
        cacheDirectives.push(
          `stale-while-revalidate=${options.cache.staleWhileRevalidate}`
        );
      }

      if (cacheDirectives.length > 0) {
        response.headers.set('Cache-Control', cacheDirectives.join(', '));
      }
    }

    // Apply CORS headers
    if (options?.cors) {
      if (options.cors.origin) {
        response.headers.set(
          'Access-Control-Allow-Origin',
          options.cors.origin
        );
      }
      if (options.cors.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      if (options.cors.methods) {
        response.headers.set(
          'Access-Control-Allow-Methods',
          options.cors.methods.join(', ')
        );
      }
      if (options.cors.headers) {
        response.headers.set(
          'Access-Control-Allow-Headers',
          options.cors.headers.join(', ')
        );
      }
    }

    return response;
  }

  // Enhanced request parsing utilities
  protected async parseBody<T>(request: NextRequest): Promise<T | null> {
    try {
      const text = await request.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }

  protected getQuery(request: NextRequest): Record<string, string> {
    const url = new URL(request.url);
    return Object.fromEntries(url.searchParams.entries());
  }

  protected generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enhanced request context extraction - Fixed for readonly properties
  protected getRequestContext(request: NextRequest): {
    readonly ip?: string;
    readonly userAgent?: string;
    readonly requestId?: string;
  } {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const requestId = request.headers.get('x-request-id');

    // Build context object immutably
    const baseContext = {};

    const ipValue = forwardedFor?.split(',')[0]?.trim() ?? realIp;

    return {
      ...baseContext,
      ...(ipValue && { ip: ipValue }),
      ...(userAgent && { userAgent }),
      ...(requestId && { requestId }),
    };
  }
}
