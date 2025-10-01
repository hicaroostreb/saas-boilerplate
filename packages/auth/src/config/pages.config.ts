// packages/auth/src/config/pages.config.ts - CUSTOM AUTH PAGES

import type { NextAuthConfig } from 'next-auth';

/**
 * ✅ ENTERPRISE: Custom Authentication Pages
 * Single Responsibility: Page routing configuration
 */
export const pagesConfig: NextAuthConfig['pages'] = {
  signIn: '/auth/sign-in',
  signOut: '/auth/sign-out',
  error: '/auth/error',
  verifyRequest: '/auth/verify-request',
  newUser: '/organizations', // Redirect new users to org selection
};

export default pagesConfig;
