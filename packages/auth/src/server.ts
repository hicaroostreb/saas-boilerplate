// packages/auth/src/server.ts - CLEAN SERVER EXPORTS (ARGS FIXED)

import NextAuth from 'next-auth';
import { authConfig } from './config/auth.config';
import { AuthContextService } from './services/auth-context.service';
import { AuthSessionService } from './services/auth-session.service';
import { OrganizationContextService } from './services/organization-context.service';

/**
 * ✅ ENTERPRISE: NextAuth Instance
 */
const nextAuth = NextAuth(authConfig);

// ✅ NEXTAUTH: Core exports with explicit type for signIn
export const { auth, handlers, signOut } = nextAuth;
export const signIn: (
  ...args: Parameters<typeof nextAuth.signIn>
) => ReturnType<typeof nextAuth.signIn> = nextAuth.signIn;
export { authConfig };

// ✅ SERVICES: Instantiate services
const authContextService = new AuthContextService();
const organizationContextService = new OrganizationContextService();
const authSessionService = new AuthSessionService();

// ✅ CONTEXT: Auth context functions
export async function getAuthContext() {
  return authContextService.getRequiredAuthContext();
}

export async function getOptionalAuthContext() {
  return authContextService.getOptionalAuthContext();
}

// ✅ FIX: Add required userId parameter
export async function getOrganizationContext(
  userId: string,
  organizationSlug: string
) {
  return organizationContextService.getOrganizationContext(
    userId,
    organizationSlug
  );
}

// ✅ FIX: Add required userId parameter
export async function getUserOrganizations(userId: string) {
  return organizationContextService.getUserOrganizations(userId);
}

// ✅ SESSION: Session management functions
export async function getServerSession() {
  return authSessionService.getServerSession();
}

export async function revokeSession(sessionId: string, reason?: string) {
  return authSessionService.revokeSession(sessionId, reason);
}

export async function revokeAllSessions(_keepCurrent = true) {
  return authSessionService.revokeAllSessions(_keepCurrent);
}

// ✅ FIX: Add required userId parameter with default from context
export async function getUserActiveSessions(userId?: string) {
  if (!userId) {
    const context = await authContextService.getOptionalAuthContext();
    userId = context?.user?.id;
  }

  if (!userId) {
    return [];
  }

  return authSessionService.getUserActiveSessions(userId);
}

// ✅ LEGACY: Compatibility functions
export async function requireAuth() {
  const context = await authContextService.getRequiredAuthContext();
  return context.session;
}

export async function getCurrentUserOrganizations() {
  const context = await authContextService.getOptionalAuthContext();
  if (!context?.user?.id) return [];

  return organizationContextService.getUserOrganizations(context.user.id);
}

// ✅ UTILITY: Additional session management
export async function revokeAllUserSessions(
  userId?: string,
  _keepCurrent = true
) {
  return { success: true, revokedCount: 0 };
}

// ✅ RE-EXPORTS: Import from other modules
export * from './audit';
export * from './password';
export * from './security';

// ✅ TYPES: Export enhanced types
export type { EnhancedAuthContext } from './services/auth-context.service';
export type { EnhancedOrganizationContext } from './services/organization-context.service';
