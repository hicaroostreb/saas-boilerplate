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
// NEXTAUTH INTEGRATION
// ============================================
export { authConfig } from './lib/nextauth/config';
export { auth, handlers, signIn, signOut } from './lib/nextauth/handlers';

// ============================================
// UTILS
// ============================================
export * from './utils';

// ============================================
// CONSTANTS
// ============================================
export const AUTH_PACKAGE_VERSION = '1.0.0';
