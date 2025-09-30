// packages/auth/src/index.ts - CLIENT-SAFE EXPORTS

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

export function isValidSession(session: Record<string, unknown>): boolean {
  return Boolean(
    session &&
      typeof session === 'object' &&
      session.user &&
      typeof (session.user as Record<string, unknown>).id === 'string' &&
      (session.user as Record<string, unknown>).id &&
      typeof (session.user as Record<string, unknown>).email === 'string' &&
      (session.user as Record<string, unknown>).email
  );
}

export function hasOrganizationAccess(
  membership: { role: string; isActive: boolean } | null
): boolean {
  return Boolean(membership?.isActive && membership.role);
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

// ✅ CORRIGIDO: signInAction com error como objeto
export async function signInAction(data: {
  email: string;
  password: string;
  organizationSlug?: string;
  rememberMe?: boolean;
  returnTo?: string;
}) {
  console.warn('signInAction called with:', data);
  
  // ✅ CORRIGIDO: error como objeto com message
  return {
    success: false,
    error: {
      message: 'Not implemented - use server-side implementation',
      code: 'NOT_IMPLEMENTED',
    },
    message: 'This is a placeholder function',
    requiresMFA: false,
    redirectTo: null,
    user: null,
  };
}

// ✅ CORRIGIDO: signOutAction com error como objeto
export async function signOutAction(options?: { redirectTo?: string }) {
  console.warn('signOutAction called with:', options);
  
  return {
    success: false,
    error: {
      message: 'Not implemented - use server-side implementation',
      code: 'NOT_IMPLEMENTED',
    },
    message: 'This is a placeholder function',
  };
}

// ✅ CORRIGIDO: changePasswordAction com error como objeto
export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  console.warn('changePasswordAction called with:', data);
  
  return {
    success: false,
    error: {
      message: 'Not implemented - use server-side implementation',
      code: 'NOT_IMPLEMENTED',
    },
    message: 'This is a placeholder function',
  };
}

// ✅ CORRIGIDO: revokeSessionAction com error como objeto
export async function revokeSessionAction(sessionId: string) {
  console.warn('revokeSessionAction called with:', sessionId);
  
  return {
    success: false,
    error: {
      message: 'Not implemented - use server-side implementation',
      code: 'NOT_IMPLEMENTED',
    },
    message: 'This is a placeholder function',
  };
}

// ✅ CORRIGIDO: revokeAllSessionsAction com error como objeto
export async function revokeAllSessionsAction(keepCurrent?: boolean) {
  console.warn('revokeAllSessionsAction called with:', keepCurrent);
  
  return {
    success: false,
    error: {
      message: 'Not implemented - use server-side implementation',
      code: 'NOT_IMPLEMENTED',
    },
    message: 'This is a placeholder function',
    revokedCount: 0,
  };
}

// ✅ CORRIGIDO: getActiveSessionsAction com error como objeto
export async function getActiveSessionsAction() {
  console.warn('getActiveSessionsAction called');
  
  return {
    success: false,
    error: {
      message: 'Not implemented - use server-side implementation',
      code: 'NOT_IMPLEMENTED',
    },
    message: 'This is a placeholder function',
    sessions: [],
  };
}

// ============================================
// CLIENT-SAFE UTILITIES
// ============================================

// ✅ CORRIGIDO: validatePasswordStrength com parâmetro
export function validatePasswordStrength(password: string) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  ].filter(Boolean).length;

  return {
    isValid: score >= 3 && password.length >= minLength,
    score: Math.min(score * 20, 100),
    feedback: score >= 4 ? 'Strong' : score >= 3 ? 'Good' : 'Weak',
    errors: score < 3 ? ['Password is too weak'] : [],
    warnings: score === 3 ? ['Consider adding more variety'] : [],
    suggestions: score < 4 ? ['Add uppercase, lowercase, numbers and symbols'] : [],
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// TYPES EXPORTS (Client-Safe)
// ============================================

export type {
  AuthEventCategory,
  AuthEventStatus,
  AuthEventType,
  SecurityLevel,
  Session,
  User
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
