/**
 * @workspace/http - HTTP Route Builders
 * Simplified from original builders.ts
 * Focus on HTTP request/response building
 */

import { NextRequest } from 'next/server';
import { GUEST_ONLY_ROUTES, PUBLIC_ROUTES, ROUTES } from './routes';
import type { HttpMiddleware } from './middleware';

// ===== URL BUILDING (mantido do original) =====
export const buildUrl = {
  withQuery: (
    path: string,
    params: Record<string, string | number | boolean>
  ): string => {
    if (!params || Object.keys(params).length === 0) {
      return path;
    }
    const url = new URL(path, 'http://localhost');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    return `${url.pathname}${url.search}`;
  },

  team: (teamId: string, subPath?: string): string => {
    const baseUrl = ROUTES.TEAM(teamId);
    return subPath ? `${baseUrl}${subPath}` : baseUrl;
  },

  billing: (tab?: 'plans' | 'usage' | 'history'): string => {
    return tab ? buildUrl.withQuery(ROUTES.BILLING, { tab }) : ROUTES.BILLING;
  },

  signInWithReturn: (returnTo: string): string => {
    return buildUrl.withQuery(ROUTES.SIGN_IN, { returnTo });
  },

  api: {
    team: (teamId: string) => ROUTES.API.TEAMS.GET(teamId),
    teamMembers: (teamId: string) => ROUTES.API.TEAMS.MEMBERS(teamId),
    teamInvite: (teamId: string) => ROUTES.API.TEAMS.INVITE(teamId),
  },
} as const;

// ===== ROUTE UTILS (mantido do original) =====
export const routeUtils = {
  isPublicRoute: (pathname: string): boolean => {
    return PUBLIC_ROUTES.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    );
  },

  isGuestOnlyRoute: (pathname: string): boolean => {
    return (GUEST_ONLY_ROUTES as readonly string[]).includes(pathname);
  },

  isAuthRoute: (pathname: string): boolean => {
    return pathname.startsWith('/auth/');
  },

  isDashboardRoute: (pathname: string): boolean => {
    return pathname.startsWith('/dashboard');
  },

  isApiRoute: (pathname: string): boolean => {
    return pathname.startsWith('/api/');
  },

  getCallbackUrl: (currentPath: string): string => {
    return routeUtils.isPublicRoute(currentPath)
      ? ROUTES.DASHBOARD
      : currentPath;
  },
} as const;

// ===== NOVO: HTTP ROUTE HANDLER BUILDER =====
export type RouteHandler<TParams = Record<string, string>> = (
  request: NextRequest,
  context: { params: Promise<TParams> }
) => Promise<Response>;

export class HttpRouteBuilder {
  private middleware: HttpMiddleware[] = [];
  
  use(middleware: HttpMiddleware): this {
    this.middleware.push(middleware);
    return this;
  }
  
  build<TParams = Record<string, string>>(
    handler: RouteHandler<TParams>
  ): RouteHandler<TParams> {
    return async (request: NextRequest, context) => {
      // Apply middleware
      for (const mw of this.middleware) {
        const result = await mw(request, context);
        if (result) return result; // Early return if middleware responds
      }
      
      // Execute handler
      return handler(request, context);
    };
  }
}

// Factory function
export const createHttpRoute = (): HttpRouteBuilder => new HttpRouteBuilder();

// Type exports (mantidos)
export type BuildUrlOptions = Parameters<typeof buildUrl.withQuery>[1];
export type BillingTab = Parameters<typeof buildUrl.billing>[0];
