// ============================================
// AUTH AUDIT LOG SCHEMA - SRP: APENAS AUTH AUDIT TABLE
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
import { users } from '../auth/user.schema';
import { organizations } from '../business/organization.schema';

// ============================================
// ENUMS
// ============================================

export const authEventTypeEnum = pgEnum('auth_event_type', [
  // Authentication events
  'login_success',
  'login_failed',
  'logout',
  'session_expired',

  // Registration events
  'register_success',
  'register_failed',
  'email_verification_sent',
  'email_verified',

  // Password events
  'password_changed',
  'password_reset_requested',
  'password_reset_completed',
  'password_reset_failed',

  // Account events
  'account_locked',
  'account_unlocked',
  'account_suspended',
  'account_reactivated',
  'account_deleted',

  // Security events
  'suspicious_activity',
  'multiple_login_attempts',
  'login_from_new_device',
  'login_from_new_location',
  'api_key_created',
  'api_key_revoked',

  // Organization events
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

// ============================================
// AUTH AUDIT LOG TABLE DEFINITION
// ============================================

export const authAuditLogs = pgTable(
  'auth_audit_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Relations (nullable for events before user creation)
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    organizationId: text('organization_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),

    // Event details
    eventType: authEventTypeEnum('event_type').notNull(),
    riskLevel: authRiskLevelEnum('risk_level').default('low').notNull(),

    // Request details
    ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
    userAgent: text('user_agent'),

    // Location data
    country: varchar('country', { length: 2 }), // ISO country code
    region: varchar('region', { length: 100 }),
    city: varchar('city', { length: 100 }),

    // Device fingerprinting
    deviceId: varchar('device_id', { length: 100 }),
    deviceType: varchar('device_type', { length: 50 }), // mobile, desktop, tablet
    browserName: varchar('browser_name', { length: 50 }),
    browserVersion: varchar('browser_version', { length: 20 }),
    osName: varchar('os_name', { length: 50 }),
    osVersion: varchar('os_version', { length: 20 }),

    // Session info
    sessionId: varchar('session_id', { length: 255 }),
    sessionToken: text('session_token'),

    // Event metadata
    success: boolean('success').notNull(),
    errorCode: varchar('error_code', { length: 50 }),
    errorMessage: text('error_message'),

    // Additional context
    resource: varchar('resource', { length: 200 }), // What was being accessed
    action: varchar('action', { length: 100 }), // What action was attempted

    // Raw data
    requestHeaders: jsonb('request_headers').$type<Record<string, string>>(),
    responseData: jsonb('response_data').$type<Record<string, any>>(),
    metadata: jsonb('metadata').$type<Record<string, any>>(),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),

    // Retention policy
    expiresAt: timestamp('expires_at', { mode: 'date' }), // For GDPR compliance
  },
  table => ({
    // Indexes for performance
    userIdx: index('auth_audit_user_idx').on(table.userId),
    orgIdx: index('auth_audit_org_idx').on(table.organizationId),
    eventTypeIdx: index('auth_audit_event_type_idx').on(table.eventType),
    riskLevelIdx: index('auth_audit_risk_level_idx').on(table.riskLevel),
    ipAddressIdx: index('auth_audit_ip_address_idx').on(table.ipAddress),
    createdAtIdx: index('auth_audit_created_at_idx').on(table.createdAt),
    successIdx: index('auth_audit_success_idx').on(table.success),
    deviceIdIdx: index('auth_audit_device_id_idx').on(table.deviceId),
    sessionIdIdx: index('auth_audit_session_id_idx').on(table.sessionId),
    expiresAtIdx: index('auth_audit_expires_at_idx').on(table.expiresAt),

    // Composite indexes for common queries
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

// ============================================
// AUTH AUDIT LOG TYPES
// ============================================

export type AuthAuditLog = typeof authAuditLogs.$inferSelect;
export type CreateAuthAuditLog = typeof authAuditLogs.$inferInsert;

// Enum types
export type AuthEventType = (typeof authEventTypeEnum.enumValues)[number];
export type AuthRiskLevel = (typeof authRiskLevelEnum.enumValues)[number];

// Device information structure
export type DeviceInfo = {
  deviceId?: string;
  deviceType?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
};

// Location information structure
export type LocationInfo = {
  country?: string;
  region?: string;
  city?: string;
  ipAddress?: string;
};

// Audit log with user info
export type AuthAuditLogWithUser = AuthAuditLog & {
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
};

// Security event summary
export type SecurityEventSummary = {
  eventType: AuthEventType;
  count: number;
  lastOccurrence: Date;
  riskLevel: AuthRiskLevel;
  uniqueUsers: number;
  uniqueIPs: number;
};

// Risk assessment data
export type RiskAssessment = {
  userId: string;
  riskScore: number;
  riskFactors: string[];
  recentEvents: AuthEventType[];
  recommendedActions: string[];
};
