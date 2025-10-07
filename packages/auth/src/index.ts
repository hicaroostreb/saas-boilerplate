// packages/auth/src/index.ts - PRAGMATIC ARCHITECTURE EXPORTS

// ============================================
// FLOWS (PRIMARY API)
// ============================================
export * from './core/flows';

// ============================================
// SCHEMAS & TYPES
// ============================================
export * from './types';
export * from './types/schemas';

// ============================================
// NEXTAUTH INTEGRATION (WORKING)
// ============================================
export { authConfig } from './lib/nextauth/config';
export {
  auth,
  handlers,
  signIn,
  signInAction,
  signOut,
  signOutAction,
} from './lib/nextauth/handlers';
export { getServerSession, requireAuth } from './server';

// ============================================
// CORE SERVICES (ENTERPRISE)
// ============================================
export * from './core/services';

// ============================================
// UTILS
// ============================================
export * from './utils';

// ============================================
// CONSTANTS
// ============================================
export const AUTH_PACKAGE_VERSION = '1.0.0';
