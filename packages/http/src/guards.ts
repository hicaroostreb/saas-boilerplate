/**
 * @workspace/http - HTTP Protection Guards
 * Authentication and authorization utilities following DIP principle
 * Abstracts Next.js redirect logic for testability and flexibility
 */

import { buildUrl, routeUtils } from './builders';
import { ROUTES } from './routes';

// ===== REDIRECT ABSTRACTION =====
/**
 * Redirect function interface for dependency inversion
 * Allows mocking and testing without Next.js dependency
 */
export interface RedirectFunction {
  (url: string): never;
}

/**
 * Default Next.js redirect implementation
 * Can be overridden for testing or custom redirect logic
 */
let redirectImplementation: RedirectFunction;

// Conditional import based on environment
if (typeof window === 'undefined') {
  // Server-side: import Next.js redirect
  try {
    const nextRedirect = eval('require')('next/navigation').redirect;
    redirectImplementation = nextRedirect;
  } catch {
    redirectImplementation = (url: string) => {
      throw new Error(`Redirect to: ${url}`);
    };
  }
} else {
  // Client-side: fallback
  redirectImplementation = (url: string) => {
    throw new Error(`Redirect to: ${url}`);
  };
}

/**
 * Sets custom redirect implementation (useful for testing)
 * @param fn - Custom redirect function
 */
export const setRedirectImplementation = (fn: RedirectFunction): void => {
  redirectImplementation = fn;
};

/**
 * Gets current redirect implementation
 * @returns Current redirect function
 */
export const getRedirectImplementation = (): RedirectFunction => {
  return redirectImplementation;
};

// ===== ROUTE GUARDS =====
export const guards = {
  /**
   * Requires user authentication
   * Redirects to sign-in with optional return URL
   * @param returnTo - URL to redirect after successful auth
   */
  requireAuth: (returnTo?: string): never => {
    const signInUrl = returnTo
      ? buildUrl.signInWithReturn(returnTo)
      : ROUTES.SIGN_IN;

    return redirectImplementation(signInUrl);
  },

  /**
   * Requires guest user (not authenticated)
   * Redirects authenticated users to dashboard
   */
  requireGuest: (): never => {
    return redirectImplementation(ROUTES.DASHBOARD);
  },

  /**
   * Requires specific team access
   * Redirects to teams list if no team specified
   * @param teamId - Optional team identifier
   */
  requireTeam: (teamId?: string): never => {
    const targetUrl = teamId ? ROUTES.TEAM(teamId) : ROUTES.TEAMS;

    return redirectImplementation(targetUrl);
  },

  /**
   * Redirects to organization selection
   * Used after authentication when user has multiple orgs
   */
  requireOrganization: (): never => {
    return redirectImplementation(ROUTES.ORGANIZATIONS);
  },

  /**
   * Redirects to dashboard (home page for authenticated users)
   * @param teamId - Optional team to redirect to specific team dashboard
   */
  redirectToDashboard: (teamId?: string): never => {
    const dashboardUrl = teamId ? ROUTES.TEAM(teamId) : ROUTES.DASHBOARD;

    return redirectImplementation(dashboardUrl);
  },

  /**
   * Handles authentication errors with appropriate redirect
   * @param error - Error code or message
   * @param returnTo - Optional return URL after error is resolved
   */
  handleAuthError: (error?: string, returnTo?: string): never => {
    const errorUrl = buildUrl.withQuery(ROUTES.ERROR, {
      ...(error && { error }),
      ...(returnTo && { returnTo }),
    });

    return redirectImplementation(errorUrl);
  },

  /**
   * Redirects to billing page with optional tab
   * @param tab - Optional billing tab to display
   */
  requireBilling: (tab?: 'plans' | 'usage' | 'history'): never => {
    const billingUrl = buildUrl.billing(tab);
    return redirectImplementation(billingUrl);
  },

  /**
   * Redirects to settings page with optional section
   * @param section - Optional settings section
   */
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

// ===== CONDITIONAL GUARDS =====
export const conditionalGuards = {
  /**
   * Guards route based on authentication status
   * @param isAuthenticated - User authentication status
   * @param currentPath - Current pathname for return URL
   */
  authGuard: (isAuthenticated: boolean, currentPath?: string): void => {
    if (
      !isAuthenticated &&
      currentPath &&
      !routeUtils.isPublicRoute(currentPath)
    ) {
      guards.requireAuth(currentPath);
    }
  },

  /**
   * Guards guest-only routes for authenticated users
   * @param isAuthenticated - User authentication status
   */
  guestGuard: (isAuthenticated: boolean): void => {
    if (isAuthenticated) {
      guards.requireGuest();
    }
  },

  /**
   * Guards team-specific routes
   * @param hasTeamAccess - Whether user has access to team
   * @param teamId - Team identifier
   */
  teamGuard: (hasTeamAccess: boolean, teamId?: string): void => {
    if (!hasTeamAccess) {
      guards.requireTeam(teamId);
    }
  },
} as const;

// ===== TYPE EXPORTS =====
export type GuardFunction = () => never;
export type ConditionalGuardFunction = (
  condition: boolean,
  additionalParam?: string
) => void;
export type SettingsSection = 'security' | 'notifications' | 'preferences';
export type BillingTab = 'plans' | 'usage' | 'history';
