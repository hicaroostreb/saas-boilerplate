// packages/database/src/schemas/security/auth-audit-log.schema.ts
// ============================================
// AUTH AUDIT LOG SCHEMA - ENTERPRISE SECURITY (REFACTORED)
// ============================================

import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Auth event type enum
export const auth_event_type_enum = pgEnum('auth_event_type', [
  'login_success',
  'login_failure',
  'logout',
  'password_change',
  'password_reset_request',
  'password_reset_success',
  'email_verification',
  'phone_verification',
  'account_locked',
  'account_unlocked',
  'two_factor_enabled',
  'two_factor_disabled',
  'session_expired',
  'token_refresh',
  'account_created',
  'account_deleted',
  'role_changed',
  'permissions_changed',
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
    tenant_id: text('tenant_id'), // ✅ ADICIONADO - Nullable para eventos system-level

    // Event details
    event_type: auth_event_type_enum('event_type').notNull(),
    event_description: text('event_description'),

    // User context
    user_id: text('user_id'),
    organization_id: text('organization_id'),
    session_id: text('session_id'),

    // Security context
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
    location: text('location'), // JSON object com geo data

    // Risk assessment
    risk_level: auth_risk_level_enum('risk_level').default('low').notNull(),
    risk_factors: text('risk_factors'), // JSON array
    risk_score: integer('risk_score').default(0).notNull(),

    // Event metadata
    metadata: text('metadata'), // JSON object

    // Success/failure
    is_success: boolean('is_success').notNull(),
    failure_reason: text('failure_reason'),

    // Timestamps
    occurred_at: timestamp('occurred_at').notNull().defaultNow(),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    // ✅ REFATORADO - tenant_id sempre primeiro (nullable ok)
    tenantOccurredIdx: index('auth_audit_logs_tenant_occurred_idx').on(
      table.tenant_id,
      table.occurred_at
    ),
    tenantUserIdx: index('auth_audit_logs_tenant_user_idx').on(
      table.tenant_id,
      table.user_id
    ),
    tenantOrgIdx: index('auth_audit_logs_tenant_org_idx').on(
      table.tenant_id,
      table.organization_id
    ),
    tenantEventIdx: index('auth_audit_logs_tenant_event_idx').on(
      table.tenant_id,
      table.event_type
    ),

    // Primary access patterns
    eventTypeIdx: index('auth_audit_logs_event_type_idx').on(table.event_type),
    userIdx: index('auth_audit_logs_user_idx').on(table.user_id),
    orgIdx: index('auth_audit_logs_org_idx').on(table.organization_id),
    sessionIdx: index('auth_audit_logs_session_idx').on(table.session_id),

    // Security analysis
    ipIdx: index('auth_audit_logs_ip_idx').on(table.ip_address),
    riskLevelIdx: index('auth_audit_logs_risk_level_idx').on(table.risk_level),
    riskScoreIdx: index('auth_audit_logs_risk_score_idx').on(table.risk_score),

    // Success/failure analysis
    isSuccessIdx: index('auth_audit_logs_is_success_idx').on(table.is_success),
    failureReasonIdx: index('auth_audit_logs_failure_reason_idx').on(
      table.failure_reason
    ),

    // Time-based queries
    occurredIdx: index('auth_audit_logs_occurred_idx').on(table.occurred_at),
    createdIdx: index('auth_audit_logs_created_idx').on(table.created_at),

    // Composite indexes for security analysis
    userEventIdx: index('auth_audit_logs_user_event_idx').on(
      table.user_id,
      table.event_type
    ),
    ipEventIdx: index('auth_audit_logs_ip_event_idx').on(
      table.ip_address,
      table.event_type
    ),
    orgRiskIdx: index('auth_audit_logs_org_risk_idx').on(
      table.organization_id,
      table.risk_level
    ),
    userRiskIdx: index('auth_audit_logs_user_risk_idx').on(
      table.user_id,
      table.risk_level
    ),

    // Time-based security analysis
    occurredRiskIdx: index('auth_audit_logs_occurred_risk_idx').on(
      table.occurred_at,
      table.risk_level
    ),
    occurredSuccessIdx: index('auth_audit_logs_occurred_success_idx').on(
      table.occurred_at,
      table.is_success
    ),
  })
);

// Types
export type AuthAuditLog = typeof auth_audit_logs.$inferSelect;
export type CreateAuthAuditLog = typeof auth_audit_logs.$inferInsert;
export type AuthEventType = (typeof auth_event_type_enum.enumValues)[number];
export type AuthRiskLevel = (typeof auth_risk_level_enum.enumValues)[number];

// Helper functions
export function parseRiskFactors(log: AuthAuditLog): string[] {
  if (!log.risk_factors) return [];
  try {
    const parsed = JSON.parse(log.risk_factors);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseLocation(log: AuthAuditLog): Record<string, any> | null {
  if (!log.location) return null;
  try {
    return JSON.parse(log.location);
  } catch {
    return null;
  }
}

export function parseMetadata(log: AuthAuditLog): Record<string, any> | null {
  if (!log.metadata) return null;
  try {
    return JSON.parse(log.metadata);
  } catch {
    return null;
  }
}

export function calculateRiskScore(factors: string[]): number {
  const riskWeights: Record<string, number> = {
    suspicious_ip: 30,
    unusual_location: 20,
    multiple_failures: 25,
    brute_force_pattern: 40,
    compromised_credentials: 50,
    unusual_device: 15,
    off_hours_access: 10,
    impossible_travel: 35,
    tor_exit_node: 45,
  };

  return factors.reduce(
    (score, factor) => score + (riskWeights[factor] || 5),
    0
  );
}

export function getRiskLevel(score: number): AuthRiskLevel {
  if (score >= 50) return 'critical';
  if (score >= 30) return 'high';
  if (score >= 15) return 'medium';
  return 'low';
}

export function isSecurityEvent(eventType: AuthEventType): boolean {
  const securityEvents: AuthEventType[] = [
    'login_failure',
    'account_locked',
    'password_reset_request',
    'two_factor_disabled',
    'role_changed',
    'permissions_changed',
  ];

  return securityEvents.includes(eventType);
}

export function isCriticalEvent(log: AuthAuditLog): boolean {
  return (
    log.risk_level === 'critical' ||
    log.event_type === 'account_deleted' ||
    log.event_type === 'role_changed'
  );
}

export function getEventSeverity(
  log: AuthAuditLog
): 'info' | 'warning' | 'error' | 'critical' {
  if (log.risk_level === 'critical') return 'critical';
  if (log.risk_level === 'high') return 'error';
  if (log.risk_level === 'medium') return 'warning';
  return 'info';
}
