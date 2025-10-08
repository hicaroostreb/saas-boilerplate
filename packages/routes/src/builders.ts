/**
 * @workspace/routes - URL Construction Utilities
 * Type-safe URL builders following ISP and SRP principles
 * Zero dependencies, immutable, predictable
 */

import { GUEST_ONLY_ROUTES, PUBLIC_ROUTES, ROUTES } from './routes';

// ===== URL BUILDING UTILITIES =====
export const buildUrl = {
  /**
   * Adds query parameters to any URL
   * @param path - Base URL path
   * @param params - Query parameters as key-value pairs
   * @returns URL with query string
   */
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

  /**
   * Builds team-specific URLs with optional sub-paths
   * @param teamId - Team identifier
   * @param subPath - Optional sub-path (e.g., '/settings', '/members')
   * @returns Complete team URL
   */
  team: (teamId: string, subPath?: string): string => {
    const baseUrl = ROUTES.TEAM(teamId);
    return subPath ? `${baseUrl}${subPath}` : baseUrl;
  },

  /**
   * Builds billing URLs with optional tab parameter
   * @param tab - Optional billing tab ('plans' | 'usage' | 'history')
   * @returns Billing URL with optional tab query
   */
  billing: (tab?: 'plans' | 'usage' | 'history'): string => {
    return tab ? buildUrl.withQuery(ROUTES.BILLING, { tab }) : ROUTES.BILLING;
  },

  /**
   * Builds authentication URLs with return redirect
   * @param returnTo - URL to redirect after successful auth
   * @returns Sign-in URL with returnTo parameter
   */
  signInWithReturn: (returnTo: string): string => {
    return buildUrl.withQuery(ROUTES.SIGN_IN, { returnTo });
  },

  /**
   * Builds API URLs with dynamic parameters
   * @param endpoint - API endpoint function
   * @param params - Parameters for the endpoint
   * @returns Complete API URL
   */
  api: {
    team: (teamId: string) => ROUTES.API.TEAMS.GET(teamId),
    teamMembers: (teamId: string) => ROUTES.API.TEAMS.MEMBERS(teamId),
    teamInvite: (teamId: string) => ROUTES.API.TEAMS.INVITE(teamId),
  },
} as const;

// ===== ROUTE VALIDATION UTILITIES =====
export const routeUtils = {
  /**
   * Checks if a pathname is a public route
   * @param pathname - Current pathname
   * @returns true if route is public
   */
  isPublicRoute: (pathname: string): boolean => {
    return PUBLIC_ROUTES.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    );
  },

  /**
   * Checks if a pathname is guest-only route
   * @param pathname - Current pathname
   * @returns true if route is guest-only
   */
  isGuestOnlyRoute: (pathname: string): boolean => {
    return (GUEST_ONLY_ROUTES as readonly string[]).includes(pathname);
  },

  /**
   * Checks if pathname is authentication related
   * @param pathname - Current pathname
   * @returns true if auth route
   */
  isAuthRoute: (pathname: string): boolean => {
    return pathname.startsWith('/auth/');
  },

  /**
   * Checks if pathname is dashboard related
   * @param pathname - Current pathname
   * @returns true if dashboard route
   */
  isDashboardRoute: (pathname: string): boolean => {
    return pathname.startsWith('/dashboard');
  },

  /**
   * Checks if pathname is API route
   * @param pathname - Current pathname
   * @returns true if API route
   */
  isApiRoute: (pathname: string): boolean => {
    return pathname.startsWith('/api/');
  },

  /**
   * Gets appropriate callback URL for authenticated users
   * @param currentPath - Current pathname
   * @returns Callback URL (dashboard or current path)
   */
  getCallbackUrl: (currentPath: string): string => {
    return routeUtils.isPublicRoute(currentPath)
      ? ROUTES.DASHBOARD
      : currentPath;
  },
} as const;

// ===== TYPE EXPORTS =====
export type BuildUrlOptions = Parameters<typeof buildUrl.withQuery>[1];
export type BillingTab = Parameters<typeof buildUrl.billing>[0];
