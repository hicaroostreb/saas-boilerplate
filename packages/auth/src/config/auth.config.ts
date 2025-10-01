// packages/auth/src/config/auth.config.ts - NEXTAUTH CONFIGURATION

import type { NextAuthConfig } from 'next-auth';
import { adapterConfig } from './adapter.config';
import { callbacksConfig } from './callbacks.config';
import { pagesConfig } from './pages.config';
import { providersConfig } from './providers.config';

/**
 * ✅ ENTERPRISE: NextAuth Configuration
 * Single Responsibility: NextAuth setup and configuration
 */
const authConfig: NextAuthConfig = {
  adapter: adapterConfig,
  providers: providersConfig,
  callbacks: callbacksConfig,
  pages: pagesConfig,

  // Session configuration
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Security configuration
  useSecureCookies: process.env.NODE_ENV === 'production',
  trustHost: true,

  // Debug in development
  debug: process.env.NODE_ENV === 'development',

  // Logging configuration (corrected types)
  logger: {
    error: (error: Error) => {
      console.error(`[NextAuth Error]:`, error);
    },
    warn: (code: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[NextAuth Warning] ${code}`);
      }
    },
    debug: (code: string, metadata?: unknown) => {
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.NEXTAUTH_DEBUG === 'true'
      ) {
        console.debug(`[NextAuth Debug] ${code}:`, metadata);
      }
    },
  },

  // Events (for audit logging)
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Descartar unused parameters
      void account;
      void profile;
      void isNewUser;

      console.warn(`[NextAuth Event] User signed in: ${user.email}`);
      // Additional audit logging can be added here
    },

    async signOut(message) {
      // Descartar unused parameter
      void message;

      console.warn(`[NextAuth Event] User signed out`);
      // Additional audit logging can be added here
    },

    async createUser({ user }) {
      console.warn(`[NextAuth Event] New user created: ${user.email}`);
      // Additional audit logging can be added here
    },

    async updateUser({ user }) {
      console.warn(`[NextAuth Event] User updated: ${user.email}`);
      // Additional audit logging can be added here
    },

    async linkAccount({ user, account, profile }) {
      // Descartar unused parameter
      void profile;

      console.warn(
        `[NextAuth Event] Account linked: ${user.email} - ${account.provider}`
      );
      // Additional audit logging can be added here
    },

    async session(message) {
      // Descartar unused parameter
      void message;

      // Called whenever a session is checked
      if (process.env.NEXTAUTH_DEBUG === 'true') {
        console.debug(`[NextAuth Event] Session accessed`);
      }
    },
  },
};

// ============================================
// CREATE NEXTAUTH INSTANCE
// ============================================

const { default: NextAuth } = require('next-auth');

const nextAuth = NextAuth(authConfig);

// ============================================
// EXPORTS
// ============================================

// ✅ FIX: Add explicit return type annotation for signIn
export const { auth, handlers, signOut } = nextAuth;
export const signIn: (
  ...args: Parameters<typeof nextAuth.signIn>
) => ReturnType<typeof nextAuth.signIn> = nextAuth.signIn;

// Export configuration for other modules
export { authConfig };

// Default export
export default authConfig;

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  Account,
  NextAuthConfig,
  Profile,
  Session,
  User,
} from 'next-auth';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * ✅ HELPER: Get auth configuration for testing
 */
export function getAuthConfig(): NextAuthConfig {
  return authConfig;
}

/**
 * ✅ HELPER: Check if NextAuth is properly configured
 */
export function validateAuthConfig(): boolean {
  try {
    // Basic validation
    if (!authConfig.adapter) {
      console.error('[NextAuth Config] Missing adapter configuration');
      return false;
    }

    if (!authConfig.providers || authConfig.providers.length === 0) {
      console.error('[NextAuth Config] No providers configured');
      return false;
    }

    if (!process.env.NEXTAUTH_SECRET) {
      console.error(
        '[NextAuth Config] NEXTAUTH_SECRET environment variable not set'
      );
      return false;
    }

    if (!process.env.NEXTAUTH_URL) {
      console.warn(
        '[NextAuth Config] NEXTAUTH_URL environment variable not set'
      );
    }

    return true;
  } catch (error) {
    console.error('[NextAuth Config] Validation error:', error);
    return false;
  }
}

/**
 * ✅ HELPER: Get NextAuth URLs for different environments
 */
export function getAuthUrls() {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3001';

  return {
    signIn: `${baseUrl}/auth/sign-in`,
    signOut: `${baseUrl}/auth/sign-out`,
    error: `${baseUrl}/auth/error`,
    verifyRequest: `${baseUrl}/auth/verify-request`,
    newUser: `${baseUrl}/auth/new-user`,
  };
}
