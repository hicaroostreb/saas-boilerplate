// packages/auth/src/index.ts - MAIN PACKAGE EXPORTS (CLEAN & MINIMAL)

// ============================================
// CORE EXPORTS
// ============================================

// NextAuth core
export { authConfig } from './config/auth.config';
export { auth, handlers, signIn, signOut } from './server';

// Auth context functions
export {
  getAuthContext,
  getOptionalAuthContext,
  getOrganizationContext,
  getUserOrganizations,
  requireAuth,
} from './server';

// Session management
export {
  getServerSession,
  getUserActiveSessions,
  revokeAllSessions,
  revokeSession,
} from './server';

// ============================================
// SERVICE EXPORTS
// ============================================

// Core services
export { AuthContextService } from './services/auth-context.service';
export { AuthSessionService } from './services/auth-session.service';
export { OrganizationContextService } from './services/organization-context.service';
export { UserValidationService } from './services/user-validation.service';

// Additional services
export { AuthenticationService } from './services/authentication.service';
export { PasswordChangeService } from './services/password-change.service';
export { SessionRevocationService } from './services/session-revocation.service';
export { SignInService } from './services/sign-in.service';
export { SignOutService } from './services/sign-out.service';

// Repository exports
export { OrganizationRepository } from './repositories/organization.repository';
export { UserRepository } from './repositories/user.repository';

// Gateway exports
export { DeviceInfoGateway } from './gateways/device-info.gateway';

// ============================================
// UTILITY EXPORTS
// ============================================

// Audit utilities
export * from './audit';

// Security utilities
export * from './security';

// Password utilities
export * from './password';

// ============================================
// TYPE EXPORTS
// ============================================

// Core types
export type {
  AuditQueryFilters,
  AuditQueryResult,
  AuthEventCategory,
  AuthEventStatus,
  AuthEventType,
  DeviceInfo,
  DeviceType,
  EnterpriseAuditEvent,
  EnterpriseUser,
  GeolocationContext,
  MemberRole,
  OrganizationAuthContext,
  RiskAssessment,
  SecurityLevel,
  SessionCreationContext,
  SessionListItem,
  User,
} from './types';

// Service types
export type { EnhancedAuthContext } from './services/auth-context.service';
export type { EnhancedOrganizationContext } from './services/organization-context.service';

// Validation types
export type { UserValidationResult } from './services/user-validation.service';

// Session types
export type { SessionRevocationResult } from './services/session-revocation.service';

// ============================================
// CONSTANTS
// ============================================

export const AUTH_PACKAGE_VERSION = '1.0.0';
export const AUTH_PROVIDER = 'enterprise-auth';
