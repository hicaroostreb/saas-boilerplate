// packages/auth/src/index.ts - CLIENT-SAFE EXPORTS ONLY

// ============================================
// FLOWS (PRIMARY API)
// ============================================
export * from './core/flows';

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

// ❌ REMOVIDO: export { getServerSession, requireAuth } from './server';

// ============================================
// UTILS (CLIENT-SAFE)
// ============================================
export * from './utils';

// ============================================
// CONSTANTS
// ============================================
export const AUTH_PACKAGE_VERSION = '1.0.0';
