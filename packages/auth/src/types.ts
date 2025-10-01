// packages/auth/src/types.ts - CORE TYPES (ESTRUTURA CORRIGIDA)

// ============================================
// CORE USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
}

export interface EnterpriseUser extends User {
  isEmailVerified: boolean;
  loginAttempts: number;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SECURITY TYPES (CORRIGIDOS)
// ============================================

export type SecurityLevel = 'normal' | 'elevated' | 'high_risk' | 'critical';
export type MemberRole = 'member' | 'admin' | 'owner';

// ✅ FIX: AuthEventType - incluindo TODOS os valores usados no código
export type AuthEventType =
  | 'login_success'
  | 'login_failed'
  | 'login' // Adicionado - usado em múltiplos arquivos
  | 'logout'
  | 'password_reset'
  | 'oauth'
  | 'session_expired'
  | 'session' // Adicionado - usado em handlers e services
  | 'mfa';

// ✅ FIX: AuthEventStatus - incluindo TODOS os valores usados
export type AuthEventStatus = 'success' | 'failure' | 'pending' | 'error';

export type AuthEventCategory = 'auth' | 'security' | 'admin';
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

// ============================================
// DEVICE & GEOLOCATION
// ============================================

export interface DeviceInfo {
  name: string;
  type: DeviceType;
  fingerprint: string | null;
  platform?: string | undefined;
  browser?: string | undefined;
  os?: string | undefined;
}

export interface GeolocationContext {
  country?: string | null;
  city?: string | null;
  timezone?: string | null;
}

// ============================================
// SESSION TYPES
// ============================================

export interface SessionCreationContext {
  userId: string;
  deviceInfo?: DeviceInfo | null;
  geolocation?: GeolocationContext | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  organizationId?: string | null;
}

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
}

// ============================================
// ORGANIZATION TYPES
// ============================================

export interface OrganizationAuthContext {
  user: EnterpriseUser;
  session: unknown;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
    isActive: boolean;
  }>;
  currentOrganization: {
    id: string;
    name: string;
    slug: string;
    role: string;
    isActive: boolean;
  } | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  membership: {
    id: string;
    role: MemberRole;
    permissions: string[];
    createdAt: Date;
    status: 'active' | 'inactive';
  };
}

// ============================================
// AUDIT TYPES
// ============================================

export interface EnterpriseAuditEvent {
  id: string;
  userId?: string | null;
  sessionToken?: string | null;
  organizationId?: string | null;

  eventType: AuthEventType;
  eventAction: string;
  eventStatus: AuthEventStatus;
  eventCategory: AuthEventCategory;

  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo?: DeviceInfo | null;
  geolocation?: GeolocationContext | null;

  riskScore: number;
  riskFactors?: string[] | null;
  securityFlags?: Record<string, unknown> | null;

  eventData?: Record<string, unknown> | null;
  errorCode?: string | null;
  errorMessage?: string | null;

  timestamp: Date;
  source: string;
  requestId?: string | null;
  processed: boolean;
  alertsSent?: Record<string, unknown> | null;
}

export interface AuditQueryFilters {
  userId?: string;
  organizationId?: string;
  eventTypes?: AuthEventType[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditQueryResult {
  events: EnterpriseAuditEvent[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

// ============================================
// RISK ASSESSMENT
// ============================================

export interface RiskAssessment {
  securityLevel: SecurityLevel;
  riskFactors: string[];
  recommendations: string[];
}
