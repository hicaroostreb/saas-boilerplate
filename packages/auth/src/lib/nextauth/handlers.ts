// packages/auth/src/lib/nextauth/handlers.ts - NEXTAUTH HANDLERS

import NextAuth, { type NextAuthResult } from 'next-auth';
import { authConfig } from './config';

// ✅ FIX: Usar apenas AUTH_SECRET que está no turbo.json
const nextAuthResult: NextAuthResult = NextAuth({
  ...authConfig,
  // ✅ CRITICAL: Usar apenas AUTH_SECRET (que está em globalEnv)
  secret: process.env.AUTH_SECRET ?? 'dev-secret-for-local-only-nextauth-12345',
});

// Export with explicit type annotations (apenas funções do NextAuth)
export const auth: typeof nextAuthResult.auth = nextAuthResult.auth;
export const handlers: typeof nextAuthResult.handlers = nextAuthResult.handlers;
export const signIn: typeof nextAuthResult.signIn = nextAuthResult.signIn;
export const signOut: typeof nextAuthResult.signOut = nextAuthResult.signOut;
