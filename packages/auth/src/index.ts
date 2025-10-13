// packages/auth/src/index.ts - CLIENT-SAFE EXPORTS ONLY

// ============================================
// SCHEMAS & TYPES (CLIENT-SAFE)
// ============================================
export * from './types';
export * from './types/schemas';

// ============================================
// UTILS (CLIENT-SAFE)
// ============================================
export * from './utils';

// ============================================
// CONSTANTS
// ============================================
export const AUTH_PACKAGE_VERSION = '1.0.0';

// ✅ TEMPORARILY REMOVED: NextAuth config (causing database leak)
// Use direct import: import { authConfig } from '@workspace/auth/server'

// ⚠️ FLOWS REMOVED: Server-side only, import directly in API routes
