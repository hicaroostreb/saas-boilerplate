// Authentication routes
export const authRoutes = {
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  signOut: '/auth/signout',
  error: '/auth/error',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
  organizations: '/auth/organizations',
} as const;

// Protected dashboard routes
export const dashboardRoutes = {
  home: '/dashboard',
  settings: '/dashboard/settings',
  billing: '/dashboard/billing',
  teams: '/dashboard/teams',
  team: (teamId: string) => `/dashboard/teams/${teamId}`,
  members: (teamId: string) => `/dashboard/teams/${teamId}/members`,
  invitations: '/dashboard/invitations',
  activity: '/dashboard/activity',
} as const;

// API routes
export const apiRoutes = {
  auth: {
    signin: '/api/auth/signin',
    signup: '/api/auth/signup',
    signout: '/api/auth/signout',
    session: '/api/auth/session',
  },
  user: {
    profile: '/api/user/profile',
    preferences: '/api/user/preferences',
    delete: '/api/user/delete',
  },
  teams: {
    list: '/api/teams',
    create: '/api/teams',
    get: (teamId: string) => `/api/teams/${teamId}`,
    update: (teamId: string) => `/api/teams/${teamId}`,
    delete: (teamId: string) => `/api/teams/${teamId}`,
    members: (teamId: string) => `/api/teams/${teamId}/members`,
    invite: (teamId: string) => `/api/teams/${teamId}/invite`,
  },
  billing: {
    plans: '/api/billing/plans',
    subscription: '/api/billing/subscription',
    checkout: '/api/billing/checkout',
    portal: '/api/billing/portal',
    webhook: '/api/billing/webhook',
  },
} as const;

// Public routes that don't require authentication
export const publicRoutes = [
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/error',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/billing/webhook',
] as const;

// Routes that redirect authenticated users
export const guestOnlyRoutes = ['/auth/sign-in', '/auth/sign-up'] as const;
