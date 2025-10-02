// packages/database/src/schemas/security/auth-audit-log.schema.ts

// ============================================
// AUTH AUDIT LOG SCHEMA - SRP: APENAS AUTH AUDIT TABLE
// Enterprise Audit with Soft Delete and Modification Tracking
// ============================================

import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const authEventTypeEnum = pgEnum('auth_event_type', [
  'login_success',
  'login_failed',
  'logout',
  'session_expired',
  'register_success',
  'register_failed',
  'email_verification_sent',
  'email_verified',
  'password_changed',
  'password_reset_requested',
  'password_reset_completed',
  'password_reset_failed',
  'account_locked',
  'account_unlocked',
  'account_suspended',
  'account_reactivated',
  'account_deleted',
  'suspicious_activity',
  'multiple_login_attempts',
  'login_from_new_device',
  'login_from_new_location',
  'api_key_created',
  'api_key_revoked',
  'organization_joined',
  'organization_left',
  'role_changed',
  'permissions_modified',
]);

export const authRiskLevelEnum = pgEnum('auth_risk_level', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const authAuditLogs = pgTable(
  'auth_audit_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    
    // ✅ REMOVED REFERENCES to avoid circular dependency - will add via relations
    userId: text('user_id'),
    organizationId: text('organization_id'),
    
    eventType: authEventTypeEnum('event_type').notNull(),
    riskLevel: authRiskLevelEnum('risk_level').default('low').notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    country: varchar('country', { length: 2 }),
    region: varchar('region', { length: 100 }),
    city: varchar('city', { length: 100 }),
    deviceId: varchar('device_id', { length: 100 }),
    deviceType: varchar('device_type', { length: 50 }),
    browserName: varchar('browser_name', { length: 50 }),
    browserVersion: varchar('browser_version', { length: 20 }),
    osName: varchar('os_name', { length: 50 }),
    osVersion: varchar('os_version', { length: 20 }),
    sessionId: varchar('session_id', { length: 255 }),
    sessionToken: text('session_token'),
    success: boolean('success').notNull(),
    errorCode: varchar('error_code', { length: 50 }),
    errorMessage: text('error_message'),
    resource: varchar('resource', { length: 200 }),
    action: varchar('action', { length: 100 }),
    requestHeaders: jsonb('request_headers').$type<Record<string, string>>(),
    responseData: jsonb('response_data').$type<Record<string, any>>(),
    metadata: jsonb('metadata').$type<Record<string, any>>(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
    expiresAt: timestamp('expires_at', { mode: 'date' }),
  },
  table => ({
    userIdx: index('auth_audit_user_idx').on(table.userId),
    orgIdx: index('auth_audit_org_idx').on(table.organizationId),
    eventTypeIdx: index('auth_audit_event_type_idx').on(table.eventType),
    riskLevelIdx: index('auth_audit_risk_level_idx').on(table.riskLevel),
    ipAddressIdx: index('auth_audit_ip_address_idx').on(table.ipAddress),
    createdAtIdx: index('auth_audit_created_at_idx').on(table.createdAt),
    updatedAtIdx: index('auth_audit_updated_at_idx').on(table.updatedAt),
    deletedAtIdx: index('auth_audit_deleted_at_idx').on(table.deletedAt),
    successIdx: index('auth_audit_success_idx').on(table.success),
    deviceIdIdx: index('auth_audit_device_id_idx').on(table.deviceId),
    sessionIdIdx: index('auth_audit_session_id_idx').on(table.sessionId),
    expiresAtIdx: index('auth_audit_expires_at_idx').on(table.expiresAt),
    userEventIdx: index('auth_audit_user_event_idx').on(
      table.userId,
      table.eventType
    ),
    userCreatedIdx: index('auth_audit_user_created_idx').on(
      table.userId,
      table.createdAt
    ),
    ipEventIdx: index('auth_audit_ip_event_idx').on(
      table.ipAddress,
      table.eventType
    ),
    riskEventIdx: index('auth_audit_risk_event_idx').on(
      table.riskLevel,
      table.eventType
    ),
  })
);

export type AuthAuditLog = typeof authAuditLogs.$inferSelect;
export type CreateAuthAuditLog = typeof authAuditLogs.$inferInsert;
export type AuthEventType = (typeof authEventTypeEnum.enumValues)[number];
export type AuthRiskLevel = (typeof authRiskLevelEnum.enumValues)[number];

// ✅ ADD MISSING TYPES that security/index.ts is trying to export
export type AuthAuditLogWithUser = AuthAuditLog & {
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export type DeviceInfo = {
  deviceId?: string;
  deviceType?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
};

export type LocationInfo = {
  country?: string;
  region?: string;
  city?: string;
  ipAddress?: string;
};

export type RiskAssessment = {
  level: AuthRiskLevel;
  factors: string[];
  score: number;
};

export type SecurityEventSummary = {
  eventType: AuthEventType;
  count: number;
  lastOccurrence: Date;
  riskLevel: AuthRiskLevel;
};
