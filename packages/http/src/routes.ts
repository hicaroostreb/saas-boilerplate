/**
 * @workspace/http - Route Definitions
 * Mantido igual ao original para compatibilidade
 */

// ===== CORE ROUTE DEFINITIONS =====
export const ROUTES = {
  // Authentication Routes
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  SIGN_OUT: '/auth/signout',
  ERROR: '/auth/error',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  ORGANIZATIONS: '/auth/organizations',

  // Dashboard Routes
  DASHBOARD: '/dashboard',
  SETTINGS: '/dashboard/settings',
  SETTINGS_SECURITY: '/dashboard/settings/security',
  SETTINGS_NOTIFICATIONS: '/dashboard/settings/notifications',
  SETTINGS_PREFERENCES: '/dashboard/settings/preferences',
  BILLING: '/dashboard/billing',
  TEAMS: '/dashboard/teams',
  INVITATIONS: '/dashboard/invitations',
  ACTIVITY: '/dashboard/activity',

  // Dynamic Routes (Type-safe functions)
  TEAM: (teamId: string) => `/dashboard/teams/${teamId}` as const,
  TEAM_MEMBERS: (teamId: string) =>
    `/dashboard/teams/${teamId}/members` as const,
  TEAM_SETTINGS: (teamId: string) =>
    `/dashboard/teams/${teamId}/settings` as const,
  TEAM_ACTIVITY: (teamId: string) =>
    `/dashboard/teams/${teamId}/activity` as const,

  // API Routes
  API: {
    AUTH: {
      SIGNIN: '/api/auth/signin',
      SIGNUP: '/api/auth/signup',
      SIGNOUT: '/api/auth/signout',
      SESSION: '/api/auth/session',
    },
    USER: {
      PROFILE: '/api/user/profile',
      PREFERENCES: '/api/user/preferences',
      DELETE: '/api/user/delete',
    },
    TEAMS: {
      LIST: '/api/teams',
      CREATE: '/api/teams',
      GET: (teamId: string) => `/api/teams/${teamId}` as const,
      UPDATE: (teamId: string) => `/api/teams/${teamId}` as const,
      DELETE: (teamId: string) => `/api/teams/${teamId}` as const,
      MEMBERS: (teamId: string) => `/api/teams/${teamId}/members` as const,
      INVITE: (teamId: string) => `/api/teams/${teamId}/invite` as const,
    },
    BILLING: {
      PLANS: '/api/billing/plans',
      SUBSCRIPTION: '/api/billing/subscription',
      CHECKOUT: '/api/billing/checkout',
      PORTAL: '/api/billing/portal',
      WEBHOOK: '/api/billing/webhook',
    },
  },
} as const;

export type RouteKey = keyof typeof ROUTES;
export type DynamicRoute = (...args: string[]) => string;

export const PUBLIC_ROUTES = [
  '/',
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.ERROR,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
  ROUTES.API.AUTH.SIGNIN,
  ROUTES.API.AUTH.SIGNUP,
  ROUTES.API.BILLING.WEBHOOK,
] as const;

export const GUEST_ONLY_ROUTES = [ROUTES.SIGN_IN, ROUTES.SIGN_UP] as const;

export interface NavItem {
  readonly title: string;
  readonly href: string;
  readonly icon?: string;
  readonly children?: readonly NavItem[];
  readonly badge?: string;
}

export const MAIN_NAVIGATION: readonly NavItem[] = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'dashboard',
  },
  {
    title: 'Teams',
    href: ROUTES.TEAMS,
    icon: 'teams',
  },
  {
    title: 'Configurações',
    href: ROUTES.SETTINGS,
    icon: 'settings',
  },
  {
    title: 'Cobrança',
    href: ROUTES.BILLING,
    icon: 'billing',
  },
] as const;

export const SETTINGS_NAVIGATION: readonly NavItem[] = [
  {
    title: 'Perfil',
    href: ROUTES.SETTINGS,
    icon: 'user',
  },
  {
    title: 'Segurança',
    href: ROUTES.SETTINGS_SECURITY,
    icon: 'shield',
  },
  {
    title: 'Notificações',
    href: ROUTES.SETTINGS_NOTIFICATIONS,
    icon: 'bell',
  },
  {
    title: 'Preferências',
    href: ROUTES.SETTINGS_PREFERENCES,
    icon: 'settings',
  },
] as const;

export const createTeamNavigation = (teamId: string): readonly NavItem[] =>
  [
    {
      title: 'Visão Geral',
      href: ROUTES.TEAM(teamId),
      icon: 'overview',
    },
    {
      title: 'Membros',
      href: ROUTES.TEAM_MEMBERS(teamId),
      icon: 'users',
    },
    {
      title: 'Configurações',
      href: ROUTES.TEAM_SETTINGS(teamId),
      icon: 'settings',
    },
    {
      title: 'Atividade',
      href: ROUTES.TEAM_ACTIVITY(teamId),
      icon: 'activity',
    },
  ] as const;
