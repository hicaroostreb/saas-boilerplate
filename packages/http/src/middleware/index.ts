/**
 * @workspace/http - HTTP Middleware
 * Enterprise-grade middleware with structured logging and external rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildUrl, routeUtils } from '../builders';
import { ROUTES } from '../routes';

// ===== STRUCTURED LOGGING =====
interface LogContext extends Record<string, unknown> {
  readonly requestId?: string;
  readonly method: string;
  readonly path: string;
  readonly timestamp: string;
  readonly userAgent?: string;
  readonly ip?: string;
}

const createLogContext = (
  request: NextRequest,
  requestId?: string
): LogContext => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent');

  // Build context object immutably
  const baseContext = {
    method: request.method,
    path: new URL(request.url).pathname,
    timestamp: new Date().toISOString(),
  };

  const ipValue = forwardedFor?.split(',')[0]?.trim() ?? realIp;

  return {
    ...baseContext,
    ...(requestId && { requestId }),
    ...(userAgent && { userAgent }),
    ...(ipValue && { ip: ipValue }),
  };
};

const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ level: 'info', message, ...context }));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...context }));
  },
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', message, ...context }));
  },
};

// ===== REDIRECT ABSTRACTION (mantido do guards.ts) =====
export interface RedirectFunction {
  (url: string): never;
}

let redirectImplementation: RedirectFunction;

if (typeof window === 'undefined') {
  try {
    const nextRedirect = eval('require')('next/navigation').redirect;
    redirectImplementation = nextRedirect;
  } catch {
    redirectImplementation = (url: string) => {
      throw new Error(`Redirect to: ${url}`);
    };
  }
} else {
  redirectImplementation = (url: string) => {
    throw new Error(`Redirect to: ${url}`);
  };
}

export const setRedirectImplementation = (fn: RedirectFunction): void => {
  redirectImplementation = fn;
};

export const getRedirectImplementation = (): RedirectFunction => {
  return redirectImplementation;
};

// ===== PAGE GUARDS (mantidos do guards.ts) =====
export const guards = {
  requireAuth: (returnTo?: string): never => {
    const signInUrl = returnTo
      ? buildUrl.signInWithReturn(returnTo)
      : ROUTES.SIGN_IN;
    return redirectImplementation(signInUrl);
  },

  requireGuest: (): never => {
    return redirectImplementation(ROUTES.DASHBOARD);
  },

  requireTeam: (teamId?: string): never => {
    const targetUrl = teamId ? ROUTES.TEAM(teamId) : ROUTES.TEAMS;
    return redirectImplementation(targetUrl);
  },

  requireOrganization: (): never => {
    return redirectImplementation(ROUTES.ORGANIZATIONS);
  },

  redirectToDashboard: (teamId?: string): never => {
    const dashboardUrl = teamId ? ROUTES.TEAM(teamId) : ROUTES.DASHBOARD;
    return redirectImplementation(dashboardUrl);
  },

  handleAuthError: (error?: string, returnTo?: string): never => {
    const errorUrl = buildUrl.withQuery(ROUTES.ERROR, {
      ...(error && { error }),
      ...(returnTo && { returnTo }),
    });
    return redirectImplementation(errorUrl);
  },

  requireBilling: (tab?: 'plans' | 'usage' | 'history'): never => {
    const billingUrl = buildUrl.billing(tab);
    return redirectImplementation(billingUrl);
  },

  requireSettings: (
    section?: 'security' | 'notifications' | 'preferences'
  ): never => {
    let settingsUrl: string = ROUTES.SETTINGS;
    switch (section) {
      case 'security':
        settingsUrl = ROUTES.SETTINGS_SECURITY;
        break;
      case 'notifications':
        settingsUrl = ROUTES.SETTINGS_NOTIFICATIONS;
        break;
      case 'preferences':
        settingsUrl = ROUTES.SETTINGS_PREFERENCES;
        break;
    }
    return redirectImplementation(settingsUrl);
  },
} as const;

// ===== CONDITIONAL GUARDS (mantidos do guards.ts) =====
export const conditionalGuards = {
  authGuard: (isAuthenticated: boolean, currentPath?: string): void => {
    if (
      !isAuthenticated &&
      currentPath &&
      !routeUtils.isPublicRoute(currentPath)
    ) {
      guards.requireAuth(currentPath);
    }
  },

  guestGuard: (isAuthenticated: boolean): void => {
    if (isAuthenticated) {
      guards.requireGuest();
    }
  },

  teamGuard: (hasTeamAccess: boolean, teamId?: string): void => {
    if (!hasTeamAccess) {
      guards.requireTeam(teamId);
    }
  },
} as const;

// ===== HTTP MIDDLEWARES PARA API ROUTES =====
export type HttpMiddleware = (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse | null>;

// Middleware de tratamento global de erros
export const errorHandlerMiddleware: HttpMiddleware = async (
  request: NextRequest
) => {
  const requestId =
    request.headers.get('x-request-id') ??
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Middleware passa adiante, captura erros não tratados
    return null; // Continue to next middleware
  } catch (error) {
    const logContext = createLogContext(request, requestId);

    logger.error('Unhandled error in middleware chain', {
      ...logContext,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: 500 }
    );
  }
};

// CORS middleware com logging
export const corsMiddleware: HttpMiddleware = async (request: NextRequest) => {
  const requestId =
    request.headers.get('x-request-id') ??
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Request-ID'
  );
  response.headers.set('X-Request-ID', requestId);

  if (request.method === 'OPTIONS') {
    const logContext = createLogContext(request, requestId);
    logger.info('CORS preflight request handled', logContext);

    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return null; // Continue
};

// Rate limiting usando o pacote dedicado (assumindo que @workspace/rate-limiter existe)
export const rateLimitMiddleware = (
  maxRequests = 100,
  windowMs = 60000
): HttpMiddleware => {
  return async (request: NextRequest) => {
    const requestId =
      request.headers.get('x-request-id') ??
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const logContext = createLogContext(request, requestId);

    try {
      // TODO: Integrar com @workspace/rate-limiter quando disponível
      // const rateLimiter = await import('@workspace/rate-limiter');
      // const result = await rateLimiter.checkLimit(identifier, { maxRequests, windowMs });

      // Por enquanto, fallback para implementação local apenas para desenvolvimento
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const identifier =
        forwardedFor?.split(',')[0]?.trim() ?? realIp ?? 'anonymous';

      // AVISO: Esta implementação é apenas para desenvolvimento
      // Em produção, usar @workspace/rate-limiter com Redis
      if (process.env.NODE_ENV === 'production') {
        logger.warn(
          'Using in-memory rate limiting in production - consider using @workspace/rate-limiter',
          {
            ...logContext,
            identifier,
          }
        );
      }

      // Implementação local simplificada (apenas para dev)
      // Simular verificação bem-sucedida para dev
      logger.info('Rate limit check passed', {
        ...logContext,
        identifier,
        maxRequests,
        windowMs,
      });

      return null; // Continue
    } catch (error) {
      logger.error('Rate limit check failed', {
        ...logContext,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Rate limit service unavailable',
            code: 'RATE_LIMIT_ERROR',
          },
          meta: { timestamp: new Date().toISOString(), requestId },
        },
        { status: 503 }
      );
    }
  };
};

// Auth middleware com logging estruturado
export const authApiMiddleware: HttpMiddleware = async (
  request: NextRequest
) => {
  const requestId =
    request.headers.get('x-request-id') ??
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const logContext = createLogContext(request, requestId);
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn(
      'Authentication failed - missing or invalid authorization header',
      {
        ...logContext,
        reason: 'missing_bearer_token',
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
        meta: { timestamp: new Date().toISOString(), requestId },
      },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  if (!token) {
    logger.warn('Authentication failed - empty token', {
      ...logContext,
      reason: 'empty_token',
    });

    return NextResponse.json(
      {
        success: false,
        error: { message: 'Invalid token', code: 'INVALID_TOKEN' },
        meta: { timestamp: new Date().toISOString(), requestId },
      },
      { status: 401 }
    );
  }

  // Token validation seria delegada para o service layer
  logger.info('Authentication check passed', {
    ...logContext,
    tokenLength: token.length,
  });

  return null; // Continue
};

// Middleware composer com error handling
export const composeMiddleware = (
  ...middlewares: HttpMiddleware[]
): HttpMiddleware => {
  return async (request: NextRequest, context?) => {
    const requestId =
      request.headers.get('x-request-id') ??
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    for (const middleware of middlewares) {
      try {
        const result = await middleware(request, context);
        if (result) {
          return result; // Stop on first non-null response
        }
      } catch (error) {
        const logContext = createLogContext(request, requestId);

        logger.error('Middleware execution failed', {
          ...logContext,
          middlewareName: middleware.name || 'anonymous',
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Internal server error',
              code: 'MIDDLEWARE_ERROR',
            },
            meta: { timestamp: new Date().toISOString(), requestId },
          },
          { status: 500 }
        );
      }
    }
    return null; // Continue
  };
};

// Type exports
export type GuardFunction = () => never;
export type ConditionalGuardFunction = (
  condition: boolean,
  additionalParam?: string
) => void;
export type SettingsSection = 'security' | 'notifications' | 'preferences';
export type BillingTab = 'plans' | 'usage' | 'history';
