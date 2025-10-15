/**
 * @workspace/http - HTTP Middleware
 * Adapted from guards.ts - maintains existing redirect logic
 * Adds HTTP-specific middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildUrl, routeUtils } from '../builders';
import { ROUTES } from '../routes';

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

// ===== NOVOS HTTP MIDDLEWARES PARA API ROUTES =====
export type HttpMiddleware = (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse | null>;

// CORS middleware
export const corsMiddleware: HttpMiddleware = async (request: NextRequest) => {
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  
  return null; // Continue
};

// Rate limiting básico (em memória)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 60000): HttpMiddleware => {
  return async (request: NextRequest) => {
    const identifier = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
    const now = Date.now();
    const record = rateLimitStore.get(identifier);
    
    if (!record || now >= record.resetTime) {
      rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return null; // Continue
    }
    
    if (record.count >= maxRequests) {
      return NextResponse.json(
        { success: false, error: { message: 'Rate limit exceeded', code: 'RATE_LIMIT' } },
        { status: 429 }
      );
    }
    
    record.count++;
    return null; // Continue
  };
};

// Auth middleware para API routes
export const authApiMiddleware: HttpMiddleware = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }
  
  const token = authHeader.substring(7);
  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: 'Invalid token', code: 'INVALID_TOKEN' } },
      { status: 401 }
    );
  }
  
  // Token validation seria delegada para o service layer
  return null; // Continue
};

// Middleware composer
export const composeMiddleware = (...middlewares: HttpMiddleware[]): HttpMiddleware => {
  return async (request: NextRequest, context?) => {
    for (const middleware of middlewares) {
      const result = await middleware(request, context);
      if (result) return result; // Stop on first non-null response
    }
    return null; // Continue
  };
};

// Type exports
export type GuardFunction = () => never;
export type ConditionalGuardFunction = (condition: boolean, additionalParam?: string) => void;
export type SettingsSection = 'security' | 'notifications' | 'preferences';
export type BillingTab = 'plans' | 'usage' | 'history';
