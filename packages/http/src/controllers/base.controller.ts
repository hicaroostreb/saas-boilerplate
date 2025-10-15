/**
 * @workspace/http - Base HTTP Controller
 * Minimal HTTP adapter following Clean Architecture
 * Translates HTTP requests to application layer calls
 */

import { NextRequest, NextResponse } from 'next/server';

// Padronized API response structure
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

// Base controller for HTTP adaptation
export abstract class BaseController {
  // Success responses
  protected ok<TData>(data: TData, requestId?: string): NextResponse {
    const response: ApiResponse<TData> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    return NextResponse.json(response, { status: 200 });
  }
  
  protected created<TData>(data: TData, requestId?: string): NextResponse {
    const response: ApiResponse<TData> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    return NextResponse.json(response, { status: 201 });
  }
  
  protected noContent(requestId?: string): NextResponse {
    const response: ApiResponse<null> = {
      success: true,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    return NextResponse.json(response, { status: 204 });
  }
  
  // Error responses
  protected badRequest(message: string, code?: string, requestId?: string): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: { message, code },
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    return NextResponse.json(response, { status: 400 });
  }
  
  protected unauthorized(message: string = 'Unauthorized', requestId?: string): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: { message, code: 'UNAUTHORIZED' },
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    return NextResponse.json(response, { status: 401 });
  }
  
  protected forbidden(message: string = 'Forbidden', requestId?: string): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: { message, code: 'FORBIDDEN' },
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    return NextResponse.json(response, { status: 403 });
  }
  
  protected notFound(message: string = 'Resource not found', requestId?: string): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: { message, code: 'NOT_FOUND' },
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    return NextResponse.json(response, { status: 404 });
  }
  
  protected serverError(message: string = 'Internal server error', requestId?: string): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: { message, code: 'INTERNAL_ERROR' },
      meta: {
        timestamp: new Date().toISOString(),
        requestId
      }
    };
    return NextResponse.json(response, { status: 500 });
  }
  
  // Request parsing utilities
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
}
