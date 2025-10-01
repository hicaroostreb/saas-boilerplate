// packages/auth/src/types/index.ts - CLEAN TYPES EXPORTS (MINIMAL FIX)

// ============================================
// RE-EXPORT ALL TYPES FROM ROOT
// ============================================

export type {
  AuditQueryFilters,
  AuditQueryResult,
  AuthEventCategory,
  AuthEventStatus,
  AuthEventType,
  // Device & location
  DeviceInfo,
  DeviceType,
  // Audit types
  EnterpriseAuditEvent,
  EnterpriseUser,
  GeolocationContext,
  MemberRole,
  // Organization types
  OrganizationAuthContext,
  // Risk assessment
  RiskAssessment,
  // Security types
  SecurityLevel,
  // Session types
  SessionCreationContext,
  SessionListItem,
  // Core user types
  User,
} from '../types';

// ============================================
// UTILITY TYPES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// ============================================
// BACKWARDS COMPATIBILITY ALIASES
// ============================================

import type { EnterpriseUser, OrganizationAuthContext } from '../types';

// Legacy type aliases for backward compatibility
export type UserProfile = EnterpriseUser;
export type AuthContext = OrganizationAuthContext;
export type ValidationResult = {
  isValid: boolean;
  issues: string[];
  requiresMFA?: boolean;
};
