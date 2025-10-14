// packages/database/src/schemas/security/auth-audit-log.schema.ts
// ============================================
// AUTH AUDIT LOGS SCHEMA - ENTERPRISE SECURITY MONITORING
// ============================================

import { boolean, index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Auth event types enum
export const auth_event_type_enum = pgEnum('auth_event_type', [
  'login_success',
  'login_failed',
  'logout',
  'password_change',
  'password_reset',
  'password_reset_request',
  'email_change',
  'profile_update',
  'account_locked',
  'account_unlocked',
  'account_created',
  'account_deleted',
  'two_factor_enabled',
  'two_factor_disabled',
  'two_factor_backup_used',
  'session_expired',
  'suspicious_activity',
  'api_key_created',
  'api_key_revoked',
  'permission_granted',
  'permission_revoked',
]);

// Risk level enum
export const auth_risk_level_enum = pgEnum('auth_risk_level', [
  'low',
  'medium', 
  'high',
  'critical',
]);

export const auth_audit_logs = pgTable(
  'auth_audit_logs',
  {
    id: text('id').primaryKey(),
    
    // Context
    user_id: text('user_id'), // Can be null for failed login attempts
    organization_id: text('organization_id'),
    
    // Event details
    event_type: auth_event_type_enum('event_type').notNull(),
    success: boolean('success').notNull(),
    
    // Request context
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
    
    // Device information
    device_id: text('device_id'),
    device_fingerprint: text('device_fingerprint'),
    
    // Location information
    location_country: text('location_country'),
    location_city: text('location_city'),
    
    // Risk assessment
    risk_score: integer('risk_score').default(0), // 0-100
    risk_level: auth_risk_level_enum('risk_level').default('low'),
    
    // Error details
    error_message: text('error_message'),
    
    // Session information
    session_id: text('session_id'),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    // Performance indexes
    userIdx: index('auth_audit_logs_user_idx').on(table.user_id),
    orgIdx: index('auth_audit_logs_org_idx').on(table.organization_id),
    eventTypeIdx: index('auth_audit_logs_event_type_idx').on(table.event_type),
    
    // Security indexes
    ipIdx: index('auth_audit_logs_ip_idx').on(table.ip_address),
    riskLevelIdx: index('auth_audit_logs_risk_level_idx').on(table.risk_level),
    successIdx: index('auth_audit_logs_success_idx').on(table.success),
    
    // Time-based indexes for cleanup and analysis
    createdIdx: index('auth_audit_logs_created_idx').on(table.created_at),
    
    // Composite indexes for common security queries
    userEventIdx: index('auth_audit_logs_user_event_idx').on(table.user_id, table.event_type),
    ipEventIdx: index('auth_audit_logs_ip_event_idx').on(table.ip_address, table.event_type),
    userTimeIdx: index('auth_audit_logs_user_time_idx').on(table.user_id, table.created_at),
    suspiciousIdx: index('auth_audit_logs_suspicious_idx').on(table.risk_level, table.success, table.created_at),
    
    // Failed login tracking
    failedLoginIdx: index('auth_audit_logs_failed_login_idx')
      .on(table.event_type, table.success, table.ip_address, table.created_at),
    
    // Session tracking
    sessionIdx: index('auth_audit_logs_session_idx').on(table.session_id),
    deviceIdx: index('auth_audit_logs_device_idx').on(table.device_id),
  })
);

// Types
export type AuthAuditLog = typeof auth_audit_logs.$inferSelect;
export type CreateAuthAuditLog = typeof auth_audit_logs.$inferInsert;
export type AuthEventType = typeof auth_event_type_enum.enumValues[number];
export type AuthRiskLevel = typeof auth_risk_level_enum.enumValues[number];

// Helper types for structured data
export interface DeviceInfo {
  id?: string;
  fingerprint?: string;
  browser?: string;
  os?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
}

export interface LocationInfo {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

export interface RiskAssessment {
  score: number; // 0-100
  level: AuthRiskLevel;
  factors: string[]; // Array of risk factors
  details?: Record<string, any>;
}

// Audit log builder
export class AuthAuditLogBuilder {
  private data: Partial<CreateAuthAuditLog> = {};

  constructor(eventType: AuthEventType, success: boolean) {
    this.data = {
      id: crypto.randomUUID(),
      event_type: eventType,
      success,
      risk_level: 'low',
      risk_score: 0,
      created_at: new Date(),
    };
  }

  withUser(userId: string): AuthAuditLogBuilder {
    this.data.user_id = userId;
    return this;
  }

  withOrganization(organizationId: string): AuthAuditLogBuilder {
    this.data.organization_id = organizationId;
    return this;
  }

  withRequest(ipAddress?: string, userAgent?: string): AuthAuditLogBuilder {
    this.data.ip_address = ipAddress;
    this.data.user_agent = userAgent;
    return this;
  }

  withDevice(deviceInfo: DeviceInfo): AuthAuditLogBuilder {
    this.data.device_id = deviceInfo.id;
    this.data.device_fingerprint = deviceInfo.fingerprint;
    return this;
  }

  withLocation(locationInfo: LocationInfo): AuthAuditLogBuilder {
    this.data.location_country = locationInfo.country;
    this.data.location_city = locationInfo.city;
    return this;
  }

  withRisk(riskAssessment: RiskAssessment): AuthAuditLogBuilder {
    this.data.risk_score = riskAssessment.score;
    this.data.risk_level = riskAssessment.level;
    return this;
  }

  withError(errorMessage: string): AuthAuditLogBuilder {
    this.data.error_message = errorMessage;
    this.data.success = false;
    return this;
  }

  withSession(sessionId: string): AuthAuditLogBuilder {
    this.data.session_id = sessionId;
    return this;
  }

  build(): CreateAuthAuditLog {
    if (!this.data.event_type) {
      throw new Error('Event type is required');
    }
    
    return this.data as CreateAuthAuditLog;
  }
}

// Helper functions for risk assessment
export function calculateRiskScore(factors: {
  newDevice?: boolean;
  newLocation?: boolean;
  offHours?: boolean;
  multipleFailedAttempts?: boolean;
  suspiciousUserAgent?: boolean;
  vpnDetected?: boolean;
  recentPasswordChange?: boolean;
}): number {
  let score = 0;
  
  if (factors.newDevice) score += 20;
  if (factors.newLocation) score += 25;
  if (factors.offHours) score += 10;
  if (factors.multipleFailedAttempts) score += 30;
  if (factors.suspiciousUserAgent) score += 15;
  if (factors.vpnDetected) score += 20;
  if (factors.recentPasswordChange) score += 5;
  
  return Math.min(100, score);
}

export function getRiskLevel(score: number): AuthRiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

// Event type helpers
export function isLoginEvent(eventType: AuthEventType): boolean {
  return ['login_success', 'login_failed'].includes(eventType);
}

export function isPasswordEvent(eventType: AuthEventType): boolean {
  return ['password_change', 'password_reset', 'password_reset_request'].includes(eventType);
}

export function isSecurityEvent(eventType: AuthEventType): boolean {
  return [
    'account_locked',
    'account_unlocked', 
    'two_factor_enabled',
    'two_factor_disabled',
    'suspicious_activity',
    'api_key_created',
    'api_key_revoked',
  ].includes(eventType);
}

export function isCriticalEvent(eventType: AuthEventType): boolean {
  return [
    'account_deleted',
    'suspicious_activity',
    'account_locked',
    'two_factor_disabled',
    'api_key_revoked',
  ].includes(eventType);
}

// Analysis helpers
export function shouldAlertAdmins(auditLog: AuthAuditLog): boolean {
  // Alert on critical events or high/critical risk
  return (
    isCriticalEvent(auditLog.event_type) ||
    auditLog.risk_level === 'critical' ||
    auditLog.risk_level === 'high'
  );
}

export function shouldBlockUser(failedAttempts: number, timeWindowMinutes = 15): boolean {
  // Block after 5 failed attempts in 15 minutes
  return failedAttempts >= 5;
}

export function shouldRequire2FA(auditLog: AuthAuditLog): boolean {
  // Require 2FA for medium+ risk or new devices
  return auditLog.risk_level === 'medium' || auditLog.risk_level === 'high';
}

// Filtering and search
export interface AuditLogFilters {
  user_id?: string;
  organization_id?: string;
  event_types?: AuthEventType[];
  risk_levels?: AuthRiskLevel[];
  success?: boolean;
  ip_address?: string;
  date_from?: Date;
  date_to?: Date;
  session_id?: string;
  device_id?: string;
}

// Analytics types
export interface SecurityMetrics {
  total_events: number;
  successful_logins: number;
  failed_logins: number;
  unique_users: number;
  unique_ips: number;
  high_risk_events: number;
  blocked_attempts: number;
  suspicious_activities: number;
}

export interface LoginAnalytics {
  success_rate: number;
  failure_rate: number;
  unique_login_attempts: number;
  peak_login_hour: number;
  most_common_failure_reason: string;
  geographic_distribution: Record<string, number>;
}

// Time-based analysis
export function getEventsByTimeRange(
  events: AuthAuditLog[],
  startDate: Date,
  endDate: Date
): AuthAuditLog[] {
  return events.filter(
    event => event.created_at >= startDate && event.created_at <= endDate
  );
}

export function groupEventsByHour(events: AuthAuditLog[]): Record<number, number> {
  const hourCounts: Record<number, number> = {};
  
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }
  
  events.forEach(event => {
    const hour = event.created_at.getHours();
    hourCounts[hour]++;
  });
  
  return hourCounts;
}

export function groupEventsByDay(events: AuthAuditLog[]): Record<string, number> {
  const dayCounts: Record<string, number> = {};
  
  events.forEach(event => {
    const dateKey = event.created_at.toISOString().split('T')[0];
    dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1;
  });
  
  return dayCounts;
}

// IP-based analysis
export function getUniqueIPs(events: AuthAuditLog[]): string[] {
  const ips = new Set<string>();
  events.forEach(event => {
    if (event.ip_address) {
      ips.add(event.ip_address);
    }
  });
  return Array.from(ips);
}

export function getFailedAttemptsByIP(events: AuthAuditLog[]): Record<string, number> {
  const ipCounts: Record<string, number> = {};
  
  events
    .filter(event => !event.success && event.ip_address)
    .forEach(event => {
      const ip = event.ip_address!;
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    });
  
  return ipCounts;
}

export function getSuspiciousIPs(
  events: AuthAuditLog[],
  threshold: number = 10
): string[] {
  const failedCounts = getFailedAttemptsByIP(events);
  return Object.entries(failedCounts)
    .filter(([, count]) => count >= threshold)
    .map(([ip]) => ip);
}

// Device tracking
export function getUniqueDevices(events: AuthAuditLog[]): string[] {
  const devices = new Set<string>();
  events.forEach(event => {
    if (event.device_id) {
      devices.add(event.device_id);
    }
  });
  return Array.from(devices);
}

// Cleanup utilities
export function shouldRetainAuditLog(
  auditLog: AuthAuditLog,
  retentionDays: number = 90
): boolean {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  // Always retain critical events longer
  if (isCriticalEvent(auditLog.event_type)) {
    cutoffDate.setDate(cutoffDate.getDate() - 365); // 1 year for critical events
  }
  
  return auditLog.created_at > cutoffDate;
}

export function getAuditLogsToArchive(
  events: AuthAuditLog[],
  retentionDays: number = 90
): AuthAuditLog[] {
  return events.filter(event => !shouldRetainAuditLog(event, retentionDays));
}
