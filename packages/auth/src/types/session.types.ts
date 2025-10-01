// packages/auth/src/types/session.types.ts - SESSION-SPECIFIC TYPES

import type { DeviceType, SecurityLevel } from '../types';

/**
 * ✅ ENTERPRISE: Session Creation Context
 */
export interface SessionCreationContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  organizationId?: string;
  securityLevel?: SecurityLevel;
  provider?: string;
  deviceInfo?: {
    name?: string;
    type?: DeviceType;
    fingerprint?: string;
  };
  geolocation?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  riskScore?: number;
}

/**
 * ✅ ENTERPRISE: Enhanced Session Data
 */
export interface EnhancedSessionData {
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  lastAccessedAt: Date | null;
  isRevoked: boolean;
  revokedAt: Date | null;
  revokedBy: string | null;
  revokedReason: string | null;

  // Device & Security
  ipAddress: string | null;
  userAgent: string | null;
  deviceFingerprint: string | null;
  deviceName: string | null;
  deviceType: DeviceType;

  // Context
  organizationId: string | null;
  securityLevel: SecurityLevel;
  riskScore: number;

  // Geolocation
  country: string | null;
  city: string | null;
  timezone: string | null;

  // Metadata
  sessionData: Record<string, unknown> | null;
  complianceFlags: Record<string, unknown> | null;
}

/**
 * ✅ ENTERPRISE: Session List Item for UI
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
}

/**
 * ✅ ENTERPRISE: Device Information
 */
export interface DeviceInfo {
  name: string | null;
  type: DeviceType;
  fingerprint: string | null;
  platform?: string;
  browser?: string;
  os?: string;
}

/**
 * ✅ ENTERPRISE: Geolocation Context
 */
export interface GeolocationContext {
  country: string | null;
  city: string | null;
  timezone: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * ✅ ENTERPRISE: Risk Assessment
 */
export interface RiskAssessment {
  score: number; // 0-100
  level: SecurityLevel;
  factors: string[];
  recommendations: string[];
  lastUpdated: Date;
}
