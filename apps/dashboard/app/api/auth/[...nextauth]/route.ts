import { handlers } from '@workspace/auth/server';
import { NextRequest, NextResponse } from 'next/server';

// ✅ ENTERPRISE: Next.js 15+ Promise-based params pattern
type RouteContext = {
  params: Promise<{
    nextauth: string[];
  }>;
};

// ✅ ENTERPRISE: Type-safe error handling
type AuthRouteError = {
  error: string;
  message: string;
  status: number;
};

/**
 * ✅ ENTERPRISE: GET handler for NextAuth.js dynamic route
 * Handles OAuth callbacks, session checks, and CSRF validation
 *
 * @param request - Next.js request object with headers and body
 * @param context - Route context containing dynamic route parameters
 * @returns Promise<Response> - NextAuth.js response (native Response, not NextResponse)
 */
export const GET = async (
  request: NextRequest,
  context: RouteContext
): Promise<Response> => {
  try {
    // ✅ ENTERPRISE: Await params for Next.js 15+ compatibility
    const params = await context.params;

    // ✅ ENTERPRISE: Validate nextauth parameter structure
    if (!params.nextauth || !Array.isArray(params.nextauth)) {
      return NextResponse.json(
        {
          error: 'INVALID_ROUTE_PARAMS',
          message: 'Invalid NextAuth.js route parameters',
          status: 400,
        } satisfies AuthRouteError,
        { status: 400 }
      );
    }

    // ✅ ENTERPRISE: Delegate to NextAuth.js handlers (returns Response)
    const response = await handlers.GET(request);

    // ✅ ENTERPRISE: Ensure response exists
    if (!response) {
      return NextResponse.json(
        {
          error: 'HANDLER_ERROR',
          message: 'NextAuth.js handler returned invalid response',
          status: 500,
        } satisfies AuthRouteError,
        { status: 500 }
      );
    }

    // ✅ CORRECTED: Return native Response (NextAuth handlers return Response, not NextResponse)
    return response;
  } catch (error) {
    // ✅ ENTERPRISE: Comprehensive error logging and handling
    console.error('❌ ENTERPRISE: NextAuth GET handler error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication service temporarily unavailable',
        status: 500,
      } satisfies AuthRouteError,
      { status: 500 }
    );
  }
};

/**
 * ✅ ENTERPRISE: POST handler for NextAuth.js dynamic route
 * Handles sign-in, sign-out, and credential authentication
 *
 * @param request - Next.js request object with headers and body
 * @param context - Route context containing dynamic route parameters
 * @returns Promise<Response> - NextAuth.js response (native Response, not NextResponse)
 */
export const POST = async (
  request: NextRequest,
  context: RouteContext
): Promise<Response> => {
  try {
    // ✅ ENTERPRISE: Await params for Next.js 15+ compatibility
    const params = await context.params;

    // ✅ ENTERPRISE: Validate nextauth parameter structure
    if (!params.nextauth || !Array.isArray(params.nextauth)) {
      return NextResponse.json(
        {
          error: 'INVALID_ROUTE_PARAMS',
          message: 'Invalid NextAuth.js route parameters',
          status: 400,
        } satisfies AuthRouteError,
        { status: 400 }
      );
    }

    // ✅ ENTERPRISE: Additional security validation for POST requests
    const contentType = request.headers.get('content-type');
    if (
      contentType &&
      !contentType.includes('application/json') &&
      !contentType.includes('application/x-www-form-urlencoded')
    ) {
      return NextResponse.json(
        {
          error: 'INVALID_CONTENT_TYPE',
          message: 'Unsupported content type for authentication request',
          status: 415,
        } satisfies AuthRouteError,
        { status: 415 }
      );
    }

    // ✅ ENTERPRISE: Delegate to NextAuth.js handlers (returns Response)
    const response = await handlers.POST(request);

    // ✅ ENTERPRISE: Ensure response exists
    if (!response) {
      return NextResponse.json(
        {
          error: 'HANDLER_ERROR',
          message: 'NextAuth.js handler returned invalid response',
          status: 500,
        } satisfies AuthRouteError,
        { status: 500 }
      );
    }

    // ✅ CORRECTED: Return native Response (NextAuth handlers return Response, not NextResponse)
    return response;
  } catch (error) {
    // ✅ ENTERPRISE: Comprehensive error logging and handling
    console.error('❌ ENTERPRISE: NextAuth POST handler error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication service temporarily unavailable',
        status: 500,
      } satisfies AuthRouteError,
      { status: 500 }
    );
  }
};

// ✅ ENTERPRISE: Runtime configuration for optimal Node.js performance
export const runtime = 'nodejs';

// ✅ ENTERPRISE: Route segment config for Next.js optimization
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ✅ ENTERPRISE: Export types for external usage and testing
export type { AuthRouteError, RouteContext };
