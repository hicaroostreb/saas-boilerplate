// packages/auth/src/index.ts - CLIENT-SAFE EXPORTS ONLY

// ============================================
// SCHEMAS & TYPES (CLIENT-SAFE)
// ============================================
export * from './types';
export * from './types/schemas';

// ============================================
// NEXTAUTH CLIENT-SIDE ONLY
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

// ============================================
// UTILS (CLIENT-SAFE)
// ============================================
export * from './utils';

// ❌ REMOVIDO: export * from './core/flows'; // CAUSA DATABASE LEAK

// ============================================
// CONSTANTS
// ============================================
export const AUTH_PACKAGE_VERSION = '1.0.0';
