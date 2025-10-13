// ============================================
// SESSION REPOSITORY CONTRACT - SRP: APENAS SESSION INTERFACE
// Enterprise Security and Session Management
// ============================================

export interface SessionListItem {
  sessionToken: string;
  deviceName: string | null;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  platform: string;
  browser: string;
  ipAddress: string;
  location: {
    country: string | null;
    city: string | null;
  };
  lastAccessedAt: Date;
  createdAt: Date;
  expiresAt?: Date;
  isExpired?: boolean;
  isCurrent: boolean;
  riskScore: number;
  securityLevel: 'low' | 'normal' | 'high' | 'critical';
}

export interface EnhancedSessionData {
  sessionToken: string;
  userId: string;
  expires: Date;
  lastAccessedAt: Date;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  isRevoked: boolean;
  revokedAt: Date | null;
  revokedBy: string | null;
  revokedReason: string | null;
  deviceFingerprint: string | null;
  deviceName: string | null;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  organizationId: string | null;
  securityLevel: 'low' | 'normal' | 'high' | 'critical';
  riskScore: number;
  country: string | null;
  city: string | null;
  timezone: string | null;
  sessionData: Record<string, unknown> | null;
  complianceFlags: Record<string, unknown> | null;
}

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';
export type SecurityLevel = 'low' | 'normal' | 'high' | 'critical';

export interface ISessionRepository {
  // ============================================
  // BASIC CRUD OPERATIONS
  // ============================================

  create(sessionData: {
    userId: string;
    sessionToken?: string;
    expires: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    deviceName?: string;
    deviceType?: DeviceType;
    organizationId?: string;
    securityLevel?: SecurityLevel;
    riskScore?: number;
    country?: string;
    city?: string;
    timezone?: string;
    sessionData?: Record<string, unknown>;
  }): Promise<EnhancedSessionData>;

  findByToken(sessionToken: string): Promise<EnhancedSessionData | null>;
  touch(sessionToken: string): Promise<void>;
  deleteSession(sessionToken: string): Promise<void>;

  // ============================================
  // USER SESSION OPERATIONS
  // ============================================

  findActiveByUser(userId: string): Promise<SessionListItem[]>;
  findAllByUser(userId: string): Promise<SessionListItem[]>;
  countActiveForUser(userId: string): Promise<number>;

  // ============================================
  // REVOCATION OPERATIONS
  // ============================================

  revoke(
    sessionToken: string,
    revokedBy: string,
    reason?: string
  ): Promise<void>;
  revokeAllForUser(
    userId: string,
    exceptSessionToken?: string,
    revokedBy?: string,
    reason?: string
  ): Promise<number>;

  // ============================================
  // CLEANUP OPERATIONS
  // ============================================

  cleanupExpired(): Promise<number>;
}
