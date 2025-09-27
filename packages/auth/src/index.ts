// packages/auth/src/index.ts - CLIENT-SAFE EXPORTS

import { cache } from 'react';

// ============================================
// CLIENT-SAFE SESSION UTILITIES (PLACEHOLDERS)
// ============================================

export async function getSession() {
  // Placeholder - real implementation in server
  return null;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    return false; // Placeholder - real implementation in server
  } catch (error) {
    console.error('❌ ACHROMATIC: Error in isAuthenticated:', error);
    return false;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    return null; // Placeholder - real implementation in server
  } catch (error) {
    console.error('❌ ACHROMATIC: Error in getCurrentUserId:', error);
    return null;
  }
}

// ============================================
// CLIENT-SAFE VALIDATION FUNCTIONS
// ============================================

export function isValidSession(session: any): boolean {
  return (
    session &&
    typeof session === 'object' &&
    session.user &&
    typeof session.user.id === 'string' &&
    session.user.id.length > 0 &&
    typeof session.user.email === 'string' &&
    session.user.email.length > 0
  );
}

export function hasOrganizationAccess(
  membership: { role: string; isActive: boolean } | null
): boolean {
  return Boolean(membership?.isActive && membership?.role);
}

export function hasOrganizationPermission(
  membership: {
    role: string;
    permissions?: string[] | null;
    customPermissions?: Record<string, boolean> | null;
  } | null,
  permission: string
): boolean {
  if (!membership) return false;

  if (membership.role === 'owner' || membership.role === 'admin') {
    return true;
  }

  if (membership.customPermissions?.[permission] !== undefined) {
    return membership.customPermissions[permission];
  }

  if (membership.permissions?.includes(permission)) {
    return true;
  }

  return false;
}

// ============================================
// ACTIONS EXPORTS (Server Actions - Safe for Client Import)
// ============================================

export * from './lib/actions/change-password';
export * from './lib/actions/revoke-session';
export * from './lib/actions/sign-in';
export * from './lib/actions/sign-out';

// ============================================
// CLIENT-SAFE UTILITIES
// ============================================

export * from './client';

// ============================================
// TYPES EXPORTS (Client-Safe)
// ============================================

export type {
  AuthEventCategory,
  AuthEventStatus,
  AuthEventType,
  SecurityLevel,
  Session,
  User,
} from './types';

// Basic types
export interface EnterpriseAuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
  enterprise: {
    sessionId: string | null;
    organizationId: string | null;
    organizationSlug: string | null;
    securityLevel: string;
    isCredentialsUser: boolean;
    provider: string;
    twoFactorEnabled: boolean;
    lastAccessedAt: Date | null;
    deviceInfo: {
      name: string | null;
      type: string | null;
      fingerprint: string | null;
    } | null;
    geolocation: {
      country: string | null;
      city: string | null;
      timezone: string | null;
    } | null;
    riskScore: number;
  };
}

// ============================================
// NO NEXTAUTH OR DATABASE IMPORTS!
// ============================================
