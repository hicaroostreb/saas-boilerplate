/**
 * @workspace/http - Route Definitions
 * Separação clara entre rotas UI e API para melhor manutenção
 */

// ===== UI ROUTES =====
export const UI_ROUTES = {
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
} as const;

// ===== API ROUTES =====
export const API_ROUTES = {
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
} as const;

// ===== UNIFIED ROUTES (compatibilidade com código existente) =====
export const ROUTES = {
  ...UI_ROUTES,
  API: API_ROUTES,
} as const;

// ===== TYPE DEFINITIONS =====
export type RouteKey = keyof typeof ROUTES;
export type DynamicRoute = (...args: string[]) => string;

// ===== ROUTE CLASSIFICATIONS =====
export const PUBLIC_UI_ROUTES = [
  '/',
  UI_ROUTES.SIGN_IN,
  UI_ROUTES.SIGN_UP,
  UI_ROUTES.ERROR,
  UI_ROUTES.FORGOT_PASSWORD,
  UI_ROUTES.RESET_PASSWORD,
  UI_ROUTES.VERIFY_EMAIL,
] as const;

export const PUBLIC_API_ROUTES = [
  API_ROUTES.AUTH.SIGNIN,
  API_ROUTES.AUTH.SIGNUP,
  API_ROUTES.BILLING.WEBHOOK,
] as const;

export const PUBLIC_ROUTES = [
  ...PUBLIC_UI_ROUTES,
  ...PUBLIC_API_ROUTES,
] as const;

export const GUEST_ONLY_ROUTES = [
  UI_ROUTES.SIGN_IN,
  UI_ROUTES.SIGN_UP,
] as const;

// ===== NAVIGATION STRUCTURES =====
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
    href: UI_ROUTES.DASHBOARD,
    icon: 'dashboard',
  },
  {
    title: 'Teams',
    href: UI_ROUTES.TEAMS,
    icon: 'teams',
  },
  {
    title: 'Configurações',
    href: UI_ROUTES.SETTINGS,
    icon: 'settings',
  },
  {
    title: 'Cobrança',
    href: UI_ROUTES.BILLING,
    icon: 'billing',
  },
] as const;

export const SETTINGS_NAVIGATION: readonly NavItem[] = [
  {
    title: 'Perfil',
    href: UI_ROUTES.SETTINGS,
    icon: 'user',
  },
  {
    title: 'Segurança',
    href: UI_ROUTES.SETTINGS_SECURITY,
    icon: 'shield',
  },
  {
    title: 'Notificações',
    href: UI_ROUTES.SETTINGS_NOTIFICATIONS,
    icon: 'bell',
  },
  {
    title: 'Preferências',
    href: UI_ROUTES.SETTINGS_PREFERENCES,
    icon: 'settings',
  },
] as const;

export const createTeamNavigation = (teamId: string): readonly NavItem[] =>
  [
    {
      title: 'Visão Geral',
      href: UI_ROUTES.TEAM(teamId),
      icon: 'overview',
    },
    {
      title: 'Membros',
      href: UI_ROUTES.TEAM_MEMBERS(teamId),
      icon: 'users',
    },
    {
      title: 'Configurações',
      href: UI_ROUTES.TEAM_SETTINGS(teamId),
      icon: 'settings',
    },
    {
      title: 'Atividade',
      href: UI_ROUTES.TEAM_ACTIVITY(teamId),
      icon: 'activity',
    },
  ] as const;
