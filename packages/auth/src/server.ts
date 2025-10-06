import NextAuth, { type NextAuthResult } from 'next-auth';
import { authConfig } from './config/auth.config';
import { AuthContextService } from './services/auth-context.service';
import { AuthSessionService } from './services/auth-session.service';
import { OrganizationContextService } from './services/organization-context.service';

/**
 * ✅ ENTERPRISE: NextAuth Instance
 */
const nextAuth = NextAuth(authConfig);

// ✅ NEXTAUTH: Core exports with explicit type annotations
export const auth: NextAuthResult['auth'] = nextAuth.auth;
export const handlers: NextAuthResult['handlers'] = nextAuth.handlers;
export const signOut: NextAuthResult['signOut'] = nextAuth.signOut;
export const signIn: NextAuthResult['signIn'] = nextAuth.signIn;
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

export async function getOrganizationContext(
  userId: string,
  organizationSlug: string
) {
  return organizationContextService.getOrganizationContext(
    userId,
    organizationSlug
  );
}

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

export async function revokeAllSessions(keepCurrent = true) {
  return authSessionService.revokeAllSessions(keepCurrent);
}

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

export async function revokeAllUserSessions(
  userId?: string,
  keepCurrent = true,
  reason?: string
) {
  return { success: true, revokedCount: 0 };
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

// ✅ RE-EXPORTS: Import from other modules
export * from './audit';
export * from './password';
export * from './security';

// ✅ NEW: Export flows (CRÍTICO!)
export * from './flows';

// ✅ TYPES: Export enhanced types
export type { EnhancedAuthContext } from './services/auth-context.service';
export type { EnhancedOrganizationContext } from './services/organization-context.service';
