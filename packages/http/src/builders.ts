/**
 * @workspace/http - HTTP Route Builders
 * Enhanced with UI/API route separation
 */

import { NextRequest } from 'next/server';
import type { HttpMiddleware } from './middleware';
import {
  API_ROUTES,
  GUEST_ONLY_ROUTES,
  PUBLIC_ROUTES,
  UI_ROUTES,
} from './routes';

// ===== URL BUILDING =====
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

  // UI Routes
  ui: {
    team: (teamId: string, subPath?: string): string => {
      const baseUrl = UI_ROUTES.TEAM(teamId);
      return subPath ? `${baseUrl}${subPath}` : baseUrl;
    },

    billing: (tab?: 'plans' | 'usage' | 'history'): string => {
      return tab
        ? buildUrl.withQuery(UI_ROUTES.BILLING, { tab })
        : UI_ROUTES.BILLING;
    },

    signInWithReturn: (returnTo: string): string => {
      return buildUrl.withQuery(UI_ROUTES.SIGN_IN, { returnTo });
    },
  },

  // API Routes
  api: {
    team: (teamId: string) => API_ROUTES.TEAMS.GET(teamId),
    teamMembers: (teamId: string) => API_ROUTES.TEAMS.MEMBERS(teamId),
    teamInvite: (teamId: string) => API_ROUTES.TEAMS.INVITE(teamId),
  },

  // Backward compatibility
  team: (teamId: string, subPath?: string): string =>
    buildUrl.ui.team(teamId, subPath),
  billing: (tab?: 'plans' | 'usage' | 'history'): string =>
    buildUrl.ui.billing(tab),
  signInWithReturn: (returnTo: string): string =>
    buildUrl.ui.signInWithReturn(returnTo),
} as const;

// ===== ENHANCED ROUTE UTILS =====
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

  // Enhanced route classification
  isUIRoute: (pathname: string): boolean => {
    return !routeUtils.isApiRoute(pathname);
  },

  isPublicApiRoute: (pathname: string): boolean => {
    const publicApiRoutes = [
      API_ROUTES.AUTH.SIGNIN,
      API_ROUTES.AUTH.SIGNUP,
      API_ROUTES.BILLING.WEBHOOK,
    ] as const;

    return publicApiRoutes.includes(
      pathname as (typeof publicApiRoutes)[number]
    );
  },

  isPublicUIRoute: (pathname: string): boolean => {
    return routeUtils.isUIRoute(pathname) && routeUtils.isPublicRoute(pathname);
  },

  getCallbackUrl: (currentPath: string): string => {
    return routeUtils.isPublicRoute(currentPath)
      ? UI_ROUTES.DASHBOARD
      : currentPath;
  },
} as const;

// ===== HTTP ROUTE HANDLER BUILDER =====
export type RouteHandler<
  TParams extends Record<string, string> = Record<string, string>,
> = (
  request: NextRequest,
  context: { params: Promise<TParams> }
) => Promise<Response>;

export class HttpRouteBuilder {
  private middleware: HttpMiddleware[] = [];

  use(middleware: HttpMiddleware): this {
    this.middleware.push(middleware);
    return this;
  }

  build<TParams extends Record<string, string> = Record<string, string>>(
    handler: RouteHandler<TParams>
  ): RouteHandler<TParams> {
    return async (request: NextRequest, context) => {
      // Apply middleware
      for (const mw of this.middleware) {
        const result = await mw(request, { params: context.params });
        if (result) {
          return result; // Early return if middleware responds
        }
      }

      // Execute handler
      return handler(request, context);
    };
  }
}

// Factory function
export const createHttpRoute = (): HttpRouteBuilder => new HttpRouteBuilder();

// Type exports
export type BuildUrlOptions = Parameters<typeof buildUrl.withQuery>[1];
export type BillingTab = Parameters<typeof buildUrl.ui.billing>[0];
