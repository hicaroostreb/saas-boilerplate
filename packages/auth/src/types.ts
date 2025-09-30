// packages/auth/src/types.ts - ACHROMATIC ENTERPRISE AUTH TYPES CORRIGIDO

import type {
  AuthAuditLog,
  Membership,
  Organization,
  Session,
  User,
} from '@workspace/database';

// ============================================
// CORE ENUMS & TYPES (DEFINIDOS LOCALMENTE)
// ============================================

/**
 * ✅ ENTERPRISE: Security levels
 */
export type SecurityLevel = 'normal' | 'elevated' | 'high_risk' | 'critical';

/**
 * ✅ ENTERPRISE: Member roles
 */
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';

/**
 * ✅ ENTERPRISE: Provider types
 */
export type ProviderType = 'credentials' | 'google' | 'oauth' | 'saml' | 'ldap';

/**
 * ✅ ENTERPRISE: Device types
 */
export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

/**
 * ✅ ENTERPRISE: Auth event types
 */
export type AuthEventType =
  | 'login'
  | 'logout'
  | 'password_reset'
  | 'mfa'
  | 'oauth'
  | 'session';

/**
 * ✅ ENTERPRISE: Auth event status
 */
export type AuthEventStatus = 'success' | 'failure' | 'error' | 'pending';

/**
 * ✅ ENTERPRISE: Auth event categories
 */
export type AuthEventCategory = 'auth' | 'security' | 'admin' | 'compliance';

// ============================================
// CORE AUTH INTERFACES
// ============================================

/**
 * ✅ ACHROMATIC: Enhanced user with enterprise context
 */
export interface EnterpriseUser extends User {
  securityLevel: SecurityLevel;
  twoFactorEnabled: boolean;
  lastLoginAt: Date | null;
  preferences: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;

  // ✅ ENTERPRISE: Computed properties
  isLocked?: boolean;
  requiresPasswordChange?: boolean;
  mfaRequired?: boolean;
}

/**
 * ✅ ENTERPRISE: Device information
 */
export interface DeviceInfo {
  name: string | null;
  type: DeviceType;
  fingerprint: string | null;
  userAgent?: string;
  platform?: string;
  browser?: string;
  os?: string;
}

/**
 * ✅ ENTERPRISE: Geolocation context
 */
export interface GeolocationContext {
  country: string | null;
  city: string | null;
  timezone: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  accuracy?: number;
}

/**
 * ✅ ENTERPRISE: Risk assessment data
 */
export interface RiskAssessment {
  score: number; // 0-100
  level: SecurityLevel;
  factors: string[];
  recommendations: string[];
  lastUpdated: Date;
}

/**
 * ✅ ACHROMATIC: Enterprise session context
 */
export interface EnterpriseSessionContext {
  sessionId: string | null;
  organizationId: string | null;
  organizationSlug: string | null;
  securityLevel: SecurityLevel;
  isCredentialsUser: boolean;
  provider: string;
  twoFactorEnabled: boolean;
  lastAccessedAt: Date | null;
  deviceInfo: DeviceInfo | null;
  geolocation: GeolocationContext | null;
  riskScore: number;

  // ✅ ENTERPRISE: Session metadata
  createdVia?: string;
  enhancedAt?: Date;
  touchedAt?: Date;
}

/**
 * ✅ ENTERPRISE: Enhanced session with full context
 */
export interface EnhancedSession extends Session {
  user: EnterpriseUser;
  organization?: Organization;
  membership?: Membership;

  // ✅ ENTERPRISE: Computed session properties
  isExpired: boolean;
  timeRemaining: number;
  isActive: boolean;

  // ✅ ENTERPRISE: Risk and security context
  riskAssessment: RiskAssessment;
  deviceInfo: DeviceInfo | null;
  geolocation: GeolocationContext | null;

  // ✅ ENTERPRISE: Session capabilities
  capabilities: SessionCapabilities;
}

/**
 * ✅ ENTERPRISE: Session capabilities based on security context
 */
export interface SessionCapabilities {
  canAccessSensitiveData: boolean;
  canPerformAdminActions: boolean;
  canManageBilling: boolean;
  canModifySecuritySettings: boolean;
  requiresMFA: boolean;
  maxIdleTime: number; // seconds

  // ✅ ENTERPRISE: Feature flags based on session
  features: {
    advancedReporting: boolean;
    bulkOperations: boolean;
    apiAccess: boolean;
    webhookManagement: boolean;
  };
}

// ============================================
// AUTH CONTEXT INTERFACES
// ============================================

/**
 * ✅ ACHROMATIC: Core auth context
 */
export interface AuthContext {
  session: EnhancedSession;
  user: EnterpriseUser;
  organization?: Organization;
  membership?: Membership;

  // ✅ ENTERPRISE: Context helpers
  isAuthenticated: boolean;
  hasValidSession: boolean;
  requiresMFA: boolean;
}

/**
 * ✅ ENTERPRISE: Organization auth context
 */
export interface OrganizationAuthContext extends AuthContext {
  organization: Organization & {
    settings: Record<string, unknown> | null;
    features: Record<string, unknown> | null;
    securityPolicy: Record<string, unknown> | null;
  };
  membership: Membership & {
    role: MemberRole;
    permissions: string[] | null;
    customPermissions: Record<string, boolean> | null;
    metadata: Record<string, unknown> | null;
  };

  // ✅ ENTERPRISE: Organization-specific capabilities
  organizationCapabilities: OrganizationCapabilities;
}

/**
 * ✅ ENTERPRISE: Organization-specific capabilities
 */
export interface OrganizationCapabilities {
  canManageMembers: boolean;
  canManageProjects: boolean;
  canViewBilling: boolean;
  canManageBilling: boolean;
  canManageSettings: boolean;
  canViewAuditLogs: boolean;
  canManageIntegrations: boolean;
  canManageWebhooks: boolean;

  // ✅ ENTERPRISE: Resource limits
  limits: {
    maxMembers: number;
    maxProjects: number;
    maxStorage: number; // MB
    canCreateSubOrganizations: boolean;
  };
}

// ============================================
// SESSION MANAGEMENT INTERFACES
// ============================================

/**
 * ✅ ENTERPRISE: Session creation context
 */
export interface SessionCreationContext {
  userId: string;
  provider: ProviderType;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Partial<DeviceInfo>;
  geolocation?: Partial<GeolocationContext>;
  organizationId?: string;
  securityLevel?: SecurityLevel;

  // ✅ ENTERPRISE: Additional context
  referrer?: string;
  campaignId?: string;
  invitationToken?: string;
}

/**
 * ✅ ENTERPRISE: Session list item for management UI
 */
export interface SessionListItem {
  sessionToken: string;
  deviceName: string | null;
  deviceType: DeviceType;
  ipAddress: string | null;
  location: {
    country: string | null;
    city: string | null;
  };
  lastAccessedAt: Date | null;
  createdAt: Date;
  isCurrent: boolean;
  riskScore: number;
  securityLevel: SecurityLevel;

  // ✅ ENTERPRISE: Session status
  status?: 'active' | 'expired' | 'revoked';
  canRevoke?: boolean;
}

/**
 * ✅ ENTERPRISE: Session revocation context
 */
export interface SessionRevocationContext {
  sessionToken: string;
  revokedBy: string;
  reason: SessionRevocationReason;
  ipAddress?: string;
  userAgent?: string;
  force?: boolean;
}

/**
 * ✅ ENTERPRISE: Session revocation reasons
 */
export type SessionRevocationReason =
  | 'user_request'
  | 'admin_revoked'
  | 'security_breach'
  | 'password_changed'
  | 'device_lost'
  | 'suspicious_activity'
  | 'expired'
  | 'logout'
  | 'account_disabled';

// ============================================
// AUDIT & MONITORING INTERFACES
// ============================================

/**
 * ✅ ENTERPRISE: Enhanced audit event
 */
export interface EnterpriseAuditEvent {
  // ✅ ACHROMATIC: Core event data
  id: string;
  userId?: string | null;
  sessionToken?: string | null;
  organizationId?: string | null;

  // ✅ ENTERPRISE: Event classification
  eventType: AuthEventType;
  eventAction: string;
  eventStatus: AuthEventStatus;
  eventCategory: AuthEventCategory;

  // ✅ ENTERPRISE: Context data
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo?: DeviceInfo | null;
  geolocation?: GeolocationContext | null;

  // ✅ ENTERPRISE: Security assessment
  riskScore: number;
  riskFactors: string[] | null;
  securityFlags: Record<string, unknown> | null;

  // ✅ ENTERPRISE: Event details
  eventData: Record<string, unknown> | null;
  errorCode?: string | null;
  errorMessage?: string | null;

  // ✅ ENTERPRISE: Metadata
  timestamp: Date;
  source: string;
  requestId?: string | null;

  // ✅ ENTERPRISE: Processing status
  processed: boolean;
  alertsSent: Record<string, unknown> | null;
}

/**
 * ✅ ENTERPRISE: Audit query filters
 */
export interface AuditQueryFilters {
  userId?: string;
  organizationId?: string;
  sessionToken?: string;
  eventTypes?: AuthEventType[];
  eventStatuses?: AuthEventStatus[];
  eventCategories?: AuthEventCategory[];

  // ✅ ENTERPRISE: Time range
  startDate?: Date;
  endDate?: Date;

  // ✅ ENTERPRISE: Risk and security filters
  minRiskScore?: number;
  maxRiskScore?: number;
  ipAddress?: string;
  country?: string;

  // ✅ ENTERPRISE: Pagination
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * ✅ ENTERPRISE: Audit query results
 */
export interface AuditQueryResult {
  events: EnterpriseAuditEvent[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;

  // ✅ ENTERPRISE: Aggregations
  aggregations?: {
    eventTypeCount: Record<string, number>;
    riskScoreDistribution: Record<string, number>;
    topCountries: Array<{ country: string; count: number }>;
    topDeviceTypes: Array<{ deviceType: string; count: number }>;
  };
}

// ============================================
// AUTHENTICATION FLOW INTERFACES
// ============================================

/**
 * ✅ ENTERPRISE: Sign-in request context
 */
export interface SignInContext {
  email: string;
  password?: string;
  provider?: string;

  // ✅ ENTERPRISE: Request context
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;

  // ✅ ENTERPRISE: Security context
  mfaToken?: string;
  backupCode?: string;
  trustedDevice?: boolean;

  // ✅ ENTERPRISE: Flow context
  organizationSlug?: string;
  invitationToken?: string;
  redirectUrl?: string;
}

/**
 * ✅ ENTERPRISE: Sign-in action result (for UI)
 */
export interface SignInActionResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };

  // ✅ ENTERPRISE: Flow control
  requiresMFA?: boolean;
  redirectTo?: string;

  // ✅ ENTERPRISE: Error handling
  error?: {
    code: AuthErrorCode;
    message: string;
    field?: 'email' | 'password' | 'general';
  };
}

/**
 * ✅ ENTERPRISE: Sign-in result (internal)
 */
export interface SignInResult {
  success: boolean;
  user?: EnterpriseUser;
  session?: EnhancedSession;

  // ✅ ENTERPRISE: Flow control
  requiresMFA: boolean;
  mfaChallenge?: {
    type: 'totp' | 'sms' | 'email';
    challengeId: string;
    expiresAt: Date;
  };

  // ✅ ENTERPRISE: Error handling
  error?: {
    code: AuthErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };

  // ✅ ENTERPRISE: Security context
  riskAssessment?: RiskAssessment;
  securityRecommendations?: string[];
}

/**
 * ✅ ENTERPRISE: Authentication error codes
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USER_INACTIVE'
  | 'ACCOUNT_LOCKED'
  | 'PASSWORD_EXPIRED'
  | 'MFA_REQUIRED'
  | 'MFA_INVALID'
  | 'RATE_LIMITED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SYSTEM_ERROR'
  | 'ORGANIZATION_SUSPENDED'
  | 'INVITATION_EXPIRED'
  | 'DEVICE_NOT_TRUSTED'
  | 'VALIDATION_ERROR'
  | 'PASSWORD_WEAK'
  | 'PASSWORD_REUSED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'TOKEN_USED'
  | 'METHOD_NOT_ALLOWED';

// ============================================
// PERMISSION & ACCESS CONTROL INTERFACES
// ============================================

/**
 * ✅ ENTERPRISE: Permission check context
 */
export interface PermissionContext {
  userId: string;
  organizationId: string;
  resource: string;
  action: string;

  // ✅ ENTERPRISE: Additional context
  resourceId?: string;
  conditions?: Record<string, unknown>;
}

/**
 * ✅ ENTERPRISE: Permission result
 */
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: MemberRole;
  requiredPermissions?: string[];

  // ✅ ENTERPRISE: Conditional access
  conditions?: {
    requiresMFA: boolean;
    restrictedToIP?: string[];
    timeRestrictions?: {
      allowedHours: number[];
      allowedDays: number[];
    };
  };
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * ✅ ACHROMATIC: Optional auth context (no redirect)
 */
export type OptionalAuthContext = AuthContext | null;

/**
 * ✅ ENTERPRISE: Session with organization context
 */
export type SessionWithOrganization = EnhancedSession & {
  organization: Organization;
  membership: Membership;
};

/**
 * ✅ ENTERPRISE: Partial session update
 */
export type SessionUpdate = Partial<
  Pick<Session, 'lastAccessedAt' | 'sessionData'>
>;

/**
 * ✅ ENTERPRISE: User session summary
 */
export interface UserSessionSummary {
  userId: string;
  totalSessions: number;
  activeSessions: number;
  devicesCount: number;
  lastActivity: Date | null;
  riskScore: number;

  // ✅ ENTERPRISE: Recent activity
  recentActivity: {
    logins: number;
    failures: number;
    securityEvents: number;
  };
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * ✅ ACHROMATIC: Type guard for valid auth context
 */
export function isValidAuthContext(context: unknown): context is AuthContext {
  return Boolean(
    context &&
    typeof context === 'object' &&
    (context as AuthContext).session &&
    (context as AuthContext).user &&
    typeof (context as AuthContext).user.id === 'string' &&
    typeof (context as AuthContext).user.email === 'string' &&
    (context as AuthContext).user.isActive === true &&
    (context as AuthContext).isAuthenticated === true
  );
}

/**
 * ✅ ENTERPRISE: Type guard for organization context
 */
export function isValidOrganizationContext(
  context: unknown
): context is OrganizationAuthContext {
  return Boolean(
    isValidAuthContext(context) &&
      (context as OrganizationAuthContext).organization &&
      (context as OrganizationAuthContext).membership &&
      typeof (context as OrganizationAuthContext).organization.id === 'string' &&
      typeof (context as OrganizationAuthContext).membership.role === 'string' &&
      (context as OrganizationAuthContext).membership.isActive === true &&
      (context as OrganizationAuthContext).organization.isActive === true
  );
}

/**
 * ✅ ENTERPRISE: Type guard for enhanced session
 */
export function isValidEnhancedSession(
  session: unknown
): session is EnhancedSession {
  return Boolean(
    session &&
    typeof session === 'object' &&
    (session as EnhancedSession).user &&
    typeof (session as EnhancedSession).user.id === 'string' &&
    typeof (session as EnhancedSession).isExpired === 'boolean' &&
    typeof (session as EnhancedSession).isActive === 'boolean' &&
    (session as EnhancedSession).riskAssessment &&
    typeof (session as EnhancedSession).riskAssessment.score === 'number'
  );
}

/**
 * ✅ ENTERPRISE: Type guard for device info
 */
export function isValidDeviceInfo(
  deviceInfo: unknown
): deviceInfo is DeviceInfo {
  return Boolean(
    deviceInfo &&
    typeof deviceInfo === 'object' &&
    typeof (deviceInfo as DeviceInfo).type === 'string' &&
    ['mobile', 'desktop', 'tablet', 'unknown'].includes((deviceInfo as DeviceInfo).type)
  );
}


// ============================================
// CONSTANTS & ENUMS
// ============================================

/**
 * ✅ ENTERPRISE: Security levels in order of priority
 */
export const SECURITY_LEVEL_PRIORITY: Record<SecurityLevel, number> = {
  normal: 1,
  elevated: 2,
  high_risk: 3,
  critical: 4,
} as const;

/**
 * ✅ ENTERPRISE: Default session capabilities
 */
export const DEFAULT_SESSION_CAPABILITIES: SessionCapabilities = {
  canAccessSensitiveData: false,
  canPerformAdminActions: false,
  canManageBilling: false,
  canModifySecuritySettings: false,
  requiresMFA: false,
  maxIdleTime: 30 * 60, // 30 minutes
  features: {
    advancedReporting: false,
    bulkOperations: false,
    apiAccess: false,
    webhookManagement: false,
  },
} as const;

/**
 * ✅ ENTERPRISE: Risk score thresholds
 */
export const RISK_SCORE_THRESHOLDS = {
  LOW: 0,
  MEDIUM: 30,
  HIGH: 60,
  CRITICAL: 80,
} as const;

/**
 * ✅ ENTERPRISE: Session timeouts by security level (in seconds)
 */
export const SESSION_TIMEOUTS: Record<SecurityLevel, number> = {
  normal: 30 * 24 * 60 * 60, // 30 days
  elevated: 7 * 24 * 60 * 60, // 7 days
  high_risk: 24 * 60 * 60, // 24 hours
  critical: 4 * 60 * 60, // 4 hours
} as const;

// ============================================
// EXPORTS
// ============================================

export type {
  AuthAuditLog,
  Membership,
  Organization,
  Session,
  // Core types from database package
  User
};

