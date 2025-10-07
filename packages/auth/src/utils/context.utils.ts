// packages/auth/src/utils/context.utils.ts - CONTEXT UTILITIES (FINAL FIX)

import type { EnhancedAuthContext } from '../core/services/auth-context.service';

/**
 * ✅ EXTRACT: Auth context (proper property access)
 */
export function extractAuthContext(
  context: EnhancedAuthContext
): Record<string, unknown> {
  // ✅ FIX: Direct property access instead of destructuring
  return {
    userId: context.user?.id ?? null,
    email: context.user?.email ?? null,
    organizationId: context.session?.enterprise?.organizationId ?? null,
    role: context.session?.enterprise?.role ?? null,
    permissions: context.session?.enterprise?.permissions ?? [],
    securityLevel: context.session?.enterprise?.securityLevel ?? 'normal',
  };
}

/**
 * ✅ CHECK: If context has permission
 */
export function hasPermission(
  context: EnhancedAuthContext,
  permission: string
): boolean {
  const permissions = context.session?.enterprise?.permissions;
  return Array.isArray(permissions) && permissions.includes(permission);
}

/**
 * ✅ CHECK: If requires authentication
 */
export function requiresAuth(context: EnhancedAuthContext | null): boolean {
  return !context?.user?.id;
}

/**
 * ✅ CHECK: If user is super admin
 */
export function isSuperAdmin(context: EnhancedAuthContext): boolean {
  return context.user?.isSuperAdmin === true;
}

/**
 * ✅ CHECK: If organization owner
 */
export function isOrganizationOwner(context: EnhancedAuthContext): boolean {
  return context.session?.enterprise?.role === 'owner';
}

/**
 * ✅ GET: User role in organization
 */
export function getUserRole(context: EnhancedAuthContext): string | null {
  return context.session?.enterprise?.role ?? null;
}

/**
 * ✅ GET: Organization ID
 */
export function getOrganizationId(context: EnhancedAuthContext): string | null {
  return context.session?.enterprise?.organizationId ?? null;
}

/**
 * ✅ GET: User permissions
 */
export function getUserPermissions(context: EnhancedAuthContext): string[] {
  return context.session?.enterprise?.permissions ?? [];
}

/**
 * ✅ CHECK: If two-factor enabled
 */
export function isTwoFactorEnabled(_context: EnhancedAuthContext): boolean {
  return false; // Default implementation
}

/**
 * ✅ CHECK: If credentials user
 */
export function isCredentialsUser(_context: EnhancedAuthContext): boolean {
  return true; // Default implementation
}

/**
 * ✅ GET: Security level
 */
export function getSecurityLevel(context: EnhancedAuthContext): string {
  return context.session?.enterprise?.securityLevel ?? 'normal';
}

/**
 * ✅ GET: Risk score
 */
export function getRiskScore(context: EnhancedAuthContext): number {
  return context.session?.enterprise?.riskScore ?? 0;
}

/**
 * ✅ CHECK: If session is valid
 */
export function isValidSession(context: EnhancedAuthContext): boolean {
  return Boolean(context.user?.id && context.session?.expires);
}
