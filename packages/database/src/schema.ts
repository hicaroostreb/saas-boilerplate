// packages/database/src/schema.ts - ENTERPRISE ACHROMATIC SCHEMA COMPLETO

import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  decimal,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// ============================================
// NEXTAUTH.JS FOUNDATION (ACHROMATIC ENHANCED)
// ============================================

export const users = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 100 }),
    image: text('image'),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),

    // ✅ ACHROMATIC: Enhanced auth fields
    passwordHash: text('password_hash'),
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at'),

    // ✅ ENTERPRISE: Multi-factor & security
    twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
    twoFactorSecret: text('two_factor_secret'), // Encrypted TOTP secret
    backupCodes: jsonb('backup_codes'), // Encrypted array of backup codes

    // ✅ ENTERPRISE: Security preferences
    securityLevel: varchar('security_level', { length: 20 })
      .default('normal')
      .notNull(),
    passwordChangedAt: timestamp('password_changed_at'),
    accountLockedAt: timestamp('account_locked_at'),
    accountLockedUntil: timestamp('account_locked_until'),
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),

    // ✅ ACHROMATIC: Preferences & metadata
    preferences: jsonb('preferences'), // { theme, notifications, language }
    metadata: jsonb('metadata'), // Custom fields for extensions

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  table => ({
    emailIdx: index('user_email_idx').on(table.email),
    emailVerifiedIdx: index('user_email_verified_idx').on(table.emailVerified),
    isActiveIdx: index('user_is_active_idx').on(table.isActive),
    securityLevelIdx: index('user_security_level_idx').on(table.securityLevel),
    twoFactorIdx: index('user_two_factor_idx').on(table.twoFactorEnabled),
    accountLockedIdx: index('user_account_locked_idx').on(
      table.accountLockedAt
    ),
  })
);

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),

    // ✅ ENTERPRISE: Enhanced OAuth tracking
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
    lastUsedAt: timestamp('last_used_at'),

    // ✅ ACHROMATIC: Account metadata
    metadata: jsonb('metadata'), // Provider-specific data
  },
  table => ({
    compoundKey: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
    userIdIdx: index('account_user_id_idx').on(table.userId),
    providerIdx: index('account_provider_idx').on(table.provider),
    lastUsedIdx: index('account_last_used_idx').on(table.lastUsedAt),
  })
);

// ============================================
// SESSIONS ENTERPRISE (ACHROMATIC HYBRID STRATEGY)
// ============================================

export const sessions = pgTable(
  'session',
  {
    sessionToken: text('sessionToken').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),

    // ✅ ACHROMATIC: Core session lifecycle
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
    lastAccessedAt: timestamp('last_accessed_at').defaultNow(), // NULLABLE for compatibility

    // ✅ ENTERPRISE: Device & security context
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    deviceFingerprint: text('device_fingerprint'),
    deviceName: varchar('device_name', { length: 100 }), // "iPhone 15 Pro", "Chrome on Windows"
    deviceType: varchar('device_type', { length: 20 }), // "mobile", "desktop", "tablet"

    // ✅ HYBRID: Provider strategy tracking
    providerType: varchar('provider_type', { length: 20 })
      .default('database')
      .notNull(), // "database", "credentials", "oauth"
    isCredentialsUser: boolean('is_credentials_user').default(false).notNull(), // KEY: Achromatic hybrid flag

    // ✅ ENTERPRISE: Session security & control
    isRevoked: boolean('is_revoked').default(false).notNull(),
    revokedAt: timestamp('revoked_at'),
    revokedBy: text('revoked_by').references(() => users.id),
    revokedReason: varchar('revoked_reason', { length: 100 }), // "manual", "security", "timeout", "device_limit"

    // ✅ ACHROMATIC: Organization context (nullable for compatibility)
    organizationId: text('organization_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),

    // ✅ ENTERPRISE: Session classification & metadata
    securityLevel: varchar('security_level', { length: 20 }).default('normal'), // normal, elevated, high_risk
    sessionData: jsonb('session_data'), // Structured: { preferences, temp_data, client_hints }

    // ✅ ENTERPRISE: Geolocation & analytics
    country: varchar('country', { length: 2 }), // ISO country code
    city: varchar('city', { length: 100 }),
    timezone: varchar('timezone', { length: 50 }),

    // ✅ ENTERPRISE: Risk & compliance
    riskScore: integer('risk_score').default(0), // 0-100 calculated risk
    complianceFlags: jsonb('compliance_flags'), // GDPR, CCPA tracking
  },
  table => ({
    // Core indexes for performance
    userIdIdx: index('session_user_id_idx').on(table.userId),
    expiresIdx: index('session_expires_idx').on(table.expires),
    isRevokedIdx: index('session_is_revoked_idx').on(table.isRevoked),
    lastAccessedIdx: index('session_last_accessed_idx').on(
      table.lastAccessedAt
    ),

    // Enterprise indexes for advanced queries
    organizationIdIdx: index('session_organization_id_idx').on(
      table.organizationId
    ),
    ipAddressIdx: index('session_ip_address_idx').on(table.ipAddress),
    securityLevelIdx: index('session_security_level_idx').on(
      table.securityLevel
    ),
    deviceTypeIdx: index('session_device_type_idx').on(table.deviceType),

    // Achromatic hybrid strategy indexes
    providerTypeIdx: index('session_provider_type_idx').on(table.providerType),
    isCredentialsUserIdx: index('session_is_credentials_user_idx').on(
      table.isCredentialsUser
    ),

    // Risk & compliance indexes
    riskScoreIdx: index('session_risk_score_idx').on(table.riskScore),
    countryIdx: index('session_country_idx').on(table.country),
  })
);

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),

    // ✅ ENTERPRISE: Enhanced verification tracking
    type: varchar('type', { length: 50 }).default('email').notNull(), // email, phone, magic_link
    attempts: integer('attempts').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    usedAt: timestamp('used_at'),

    // ✅ ACHROMATIC: Request context
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata'), // Type-specific data
  },
  table => ({
    compoundKey: primaryKey({ columns: [table.identifier, table.token] }),
    expiresIdx: index('verification_token_expires_idx').on(table.expires),
    typeIdx: index('verification_token_type_idx').on(table.type),
    attemptsIdx: index('verification_token_attempts_idx').on(table.attempts),
  })
);

// ============================================
// AUTHENTICATION AUDIT & MONITORING (ENHANCED)
// ============================================

export const authAuditLogs = pgTable(
  'auth_audit_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // ✅ ACHROMATIC: Context relationships
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    sessionToken: text('session_token').references(
      () => sessions.sessionToken,
      { onDelete: 'set null' }
    ),
    organizationId: text('organization_id').references(() => organizations.id, {
      onDelete: 'set null',
    }),

    // ✅ ENTERPRISE: Event classification
    eventType: varchar('event_type', { length: 50 }).notNull(), // login, logout, session_created, mfa_challenge
    eventAction: varchar('event_action', { length: 100 }).notNull(), // authenticate_success, password_reset_requested
    eventStatus: varchar('event_status', { length: 20 }).notNull(), // success, failure, warning, blocked
    eventCategory: varchar('event_category', { length: 30 }).notNull(), // auth, session, security, compliance

    // ✅ ENTERPRISE: Request context (enhanced)
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    deviceFingerprint: text('device_fingerprint'),
    deviceInfo: jsonb('device_info'), // Parsed device details

    // ✅ ENTERPRISE: Geolocation context
    country: varchar('country', { length: 2 }),
    city: varchar('city', { length: 100 }),
    timezone: varchar('timezone', { length: 50 }),

    // ✅ ACHROMATIC: Security assessment
    riskScore: integer('risk_score').default(0), // 0-100
    riskFactors: jsonb('risk_factors'), // ["new_device", "suspicious_location", "rapid_requests"]
    securityFlags: jsonb('security_flags'), // System-generated security alerts

    // ✅ ENTERPRISE: Event data & context
    eventData: jsonb('event_data'), // Structured event-specific data
    errorCode: varchar('error_code', { length: 50 }), // Standardized error codes
    errorMessage: text('error_message'),

    // ✅ COMPLIANCE: Audit trail requirements
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    source: varchar('source', { length: 50 }).default('web').notNull(), // web, mobile, api, system
    requestId: text('request_id'), // Correlation ID for tracing

    // ✅ ACHROMATIC: Processing metadata
    processed: boolean('processed').default(false).notNull(), // For batch processing
    alertsSent: jsonb('alerts_sent'), // Track which alerts were triggered
  },
  table => ({
    // Core audit indexes
    userIdIdx: index('auth_audit_user_id_idx').on(table.userId),
    timestampIdx: index('auth_audit_timestamp_idx').on(table.timestamp),
    eventTypeIdx: index('auth_audit_event_type_idx').on(table.eventType),
    eventStatusIdx: index('auth_audit_event_status_idx').on(table.eventStatus),

    // Security & risk indexes
    riskScoreIdx: index('auth_audit_risk_score_idx').on(table.riskScore),
    ipAddressIdx: index('auth_audit_ip_address_idx').on(table.ipAddress),
    countryIdx: index('auth_audit_country_idx').on(table.country),

    // Operational indexes
    organizationIdIdx: index('auth_audit_organization_id_idx').on(
      table.organizationId
    ),
    requestIdIdx: index('auth_audit_request_id_idx').on(table.requestId),
    processedIdx: index('auth_audit_processed_idx').on(table.processed),

    // Composite indexes for common queries
    userTimeIdx: index('auth_audit_user_time_idx').on(
      table.userId,
      table.timestamp
    ),
    eventCategoryTimeIdx: index('auth_audit_category_time_idx').on(
      table.eventCategory,
      table.timestamp
    ),
  })
);

// ============================================
// RATE LIMITING & SECURITY (ENHANCED)
// ============================================

export const rateLimits = pgTable(
  'rate_limits',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // ✅ ACHROMATIC: Enhanced rate limit keys
    key: varchar('key', { length: 255 }).notNull().unique(), // "login:user_id:123" or "api:ip:1.2.3.4"
    keyType: varchar('key_type', { length: 50 }).notNull(), // "user_login", "ip_login", "api_user", "password_reset"
    keyValue: varchar('key_value', { length: 255 }).notNull(), // Extracted value for indexing

    // ✅ ENTERPRISE: Sliding window rate limiting
    attempts: integer('attempts').default(0).notNull(),
    maxAttempts: integer('max_attempts').notNull(),
    windowStart: timestamp('window_start').defaultNow().notNull(),
    windowDuration: integer('window_duration').notNull(), // seconds
    windowType: varchar('window_type', { length: 20 })
      .default('sliding')
      .notNull(), // sliding, fixed

    // ✅ ENTERPRISE: Progressive blocking
    isBlocked: boolean('is_blocked').default(false).notNull(),
    blockedUntil: timestamp('blocked_until'),
    blockLevel: varchar('block_level', { length: 20 }).default('soft'), // soft, hard, permanent
    escalationCount: integer('escalation_count').default(0).notNull(),

    // ✅ ACHROMATIC: Tracking & metadata
    lastAttemptAt: timestamp('last_attempt_at').defaultNow().notNull(),
    firstAttemptAt: timestamp('first_attempt_at').defaultNow().notNull(),

    // ✅ ENTERPRISE: Context & analytics
    organizationId: text('organization_id').references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    ipAddress: varchar('ip_address', { length: 45 }),

    // ✅ ENTERPRISE: Rule configuration & metadata
    ruleMetadata: jsonb('rule_metadata'), // Rule-specific config and context
    alertsTriggered: jsonb('alerts_triggered'), // Track security alerts sent

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  table => ({
    keyIdx: index('rate_limits_key_idx').on(table.key),
    keyTypeValueIdx: index('rate_limits_key_type_value_idx').on(
      table.keyType,
      table.keyValue
    ),
    isBlockedIdx: index('rate_limits_is_blocked_idx').on(table.isBlocked),
    blockedUntilIdx: index('rate_limits_blocked_until_idx').on(
      table.blockedUntil
    ),
    organizationIdIdx: index('rate_limits_organization_id_idx').on(
      table.organizationId
    ),
    userIdIdx: index('rate_limits_user_id_idx').on(table.userId),
    ipAddressIdx: index('rate_limits_ip_address_idx').on(table.ipAddress),
    windowStartIdx: index('rate_limits_window_start_idx').on(table.windowStart),
  })
);

// ============================================
// BUSINESS DOMAIN (ENHANCED)
// ============================================

export const organizations = pgTable(
  'organizations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    image: text('image'),
    website: varchar('website', { length: 255 }),

    // ✅ ACHROMATIC: Enhanced ownership
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id),
    parentId: text('parent_id'), // For sub-organizations

    // ✅ ENTERPRISE: Billing & subscription (Stripe integration)
    stripeCustomerId: text('stripe_customer_id').unique(),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    billingEmail: varchar('billing_email', { length: 255 }),

    // ✅ ENTERPRISE: Plan & limits
    planId: varchar('plan_id', { length: 50 }).default('free').notNull(),
    planName: varchar('plan_name', { length: 50 }).default('Free').notNull(),
    subscriptionStatus: varchar('subscription_status', { length: 20 })
      .default('inactive')
      .notNull(),
    trialEndsAt: timestamp('trial_ends_at'),
    subscriptionEndsAt: timestamp('subscription_ends_at'),

    // ✅ ENTERPRISE: Usage tracking
    maxMembers: integer('max_members').default(5).notNull(),
    maxProjects: integer('max_projects').default(3).notNull(),
    maxStorage: integer('max_storage').default(1000).notNull(), // MB
    currentMembers: integer('current_members').default(1).notNull(),
    currentProjects: integer('current_projects').default(0).notNull(),
    currentStorage: integer('current_storage').default(0).notNull(), // MB

    // ✅ ACHROMATIC: Settings & configuration
    settings: jsonb('settings'), // { theme, notifications, integrations, security }
    features: jsonb('features'), // { sso: true, audit_logs: false }
    securityPolicy: jsonb('security_policy'), // Security rules and requirements

    // ✅ ENTERPRISE: Status & lifecycle
    isActive: boolean('is_active').default(true).notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    isSuspended: boolean('is_suspended').default(false).notNull(),
    suspendedAt: timestamp('suspended_at'),
    suspendedReason: text('suspended_reason'),
    deletedAt: timestamp('deleted_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  table => ({
    ownerIdIdx: index('organizations_owner_id_idx').on(table.ownerId),
    parentIdIdx: index('organizations_parent_id_idx').on(table.parentId),
    planIdIdx: index('organizations_plan_id_idx').on(table.planId),
    subscriptionStatusIdx: index('organizations_subscription_status_idx').on(
      table.subscriptionStatus
    ),
    isActiveIdx: index('organizations_is_active_idx').on(table.isActive),
    isSuspendedIdx: index('organizations_is_suspended_idx').on(
      table.isSuspended
    ),
    stripeCustomerIdx: index('organizations_stripe_customer_idx').on(
      table.stripeCustomerId
    ),
  })
);

export const memberships = pgTable(
  'memberships',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    // ✅ ACHROMATIC: Enhanced role system
    role: varchar('role', { length: 20 }).notNull().default('member'),
    permissions: jsonb('permissions'), // Structured permissions array
    customPermissions: jsonb('custom_permissions'), // Organization-specific permissions

    // ✅ ENTERPRISE: Invitation & lifecycle
    invitedBy: text('invited_by').references(() => users.id),
    invitedAt: timestamp('invited_at'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull(),

    // ✅ ACHROMATIC: Enhanced metadata
    metadata: jsonb('metadata'), // { title, department, custom_fields }

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  table => ({
    userOrgUnique: unique('memberships_user_org_unique').on(
      table.userId,
      table.organizationId
    ),
    userIdIdx: index('memberships_user_id_idx').on(table.userId),
    organizationIdIdx: index('memberships_organization_id_idx').on(
      table.organizationId
    ),
    roleIdx: index('memberships_role_idx').on(table.role),
    isActiveIdx: index('memberships_is_active_idx').on(table.isActive),
    invitedByIdx: index('memberships_invited_by_idx').on(table.invitedBy),
  })
);

export const invitations = pgTable(
  'invitations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    // ✅ ACHROMATIC: Enhanced invitation flow
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('member'),
    permissions: jsonb('permissions'), // Pre-configured permissions
    message: text('message'),

    // ✅ ENTERPRISE: Invitation lifecycle
    invitedBy: text('invited_by')
      .notNull()
      .references(() => users.id),
    token: text('token').notNull().unique(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),

    // ✅ ENTERPRISE: Enhanced timing
    expiresAt: timestamp('expires_at').notNull(),
    invitedAt: timestamp('invited_at').defaultNow().notNull(),
    respondedAt: timestamp('responded_at'),
    reminderSentAt: timestamp('reminder_sent_at'),

    // ✅ ACHROMATIC: Response tracking
    responseMetadata: jsonb('response_metadata'), // { ip, userAgent, device_info }
  },
  table => ({
    organizationIdIdx: index('invitations_organization_id_idx').on(
      table.organizationId
    ),
    emailIdx: index('invitations_email_idx').on(table.email),
    statusIdx: index('invitations_status_idx').on(table.status),
    expiresAtIdx: index('invitations_expires_at_idx').on(table.expiresAt),
    invitedByIdx: index('invitations_invited_by_idx').on(table.invitedBy),
    tokenIdx: index('invitations_token_idx').on(table.token),
  })
);

export const projects = pgTable(
  'projects',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    // ✅ ACHROMATIC: Enhanced project details
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    slug: varchar('slug', { length: 100 }).notNull(),
    image: text('image'),

    // ✅ ENTERPRISE: Project lifecycle & visibility
    status: varchar('status', { length: 20 }).default('active').notNull(), // active, archived, draft, suspended
    visibility: varchar('visibility', { length: 20 })
      .default('private')
      .notNull(), // private, internal, public

    // ✅ ACHROMATIC: Enhanced ownership & team management
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id),
    teamIds: jsonb('team_ids'), // ["team-1", "team-2"] - Enhanced with proper JSON

    // ✅ ENTERPRISE: Configuration & integrations
    settings: jsonb('settings'), // { integrations, webhooks, notifications, security }

    // ✅ ENTERPRISE: Lifecycle tracking
    archivedAt: timestamp('archived_at'),
    archivedBy: text('archived_by').references(() => users.id),
    deletedAt: timestamp('deleted_at'),
    deletedBy: text('deleted_by').references(() => users.id),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  table => ({
    orgSlugUnique: unique('projects_org_slug_unique').on(
      table.organizationId,
      table.slug
    ),
    organizationIdIdx: index('projects_organization_id_idx').on(
      table.organizationId
    ),
    ownerIdIdx: index('projects_owner_id_idx').on(table.ownerId),
    statusIdx: index('projects_status_idx').on(table.status),
    visibilityIdx: index('projects_visibility_idx').on(table.visibility),
    archivedByIdx: index('projects_archived_by_idx').on(table.archivedBy),
    deletedByIdx: index('projects_deleted_by_idx').on(table.deletedBy),
  })
);

export const contacts = pgTable(
  'contacts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    // ✅ ACHROMATIC: Enhanced personal information
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    avatar: text('avatar'),

    // ✅ ENTERPRISE: Professional context
    company: varchar('company', { length: 100 }),
    jobTitle: varchar('job_title', { length: 100 }),
    department: varchar('department', { length: 50 }),
    website: varchar('website', { length: 255 }),

    // ✅ ENTERPRISE: Location & geography
    address: text('address'),
    city: varchar('city', { length: 50 }),
    state: varchar('state', { length: 50 }),
    zipCode: varchar('zip_code', { length: 20 }),
    country: varchar('country', { length: 50 }),
    timezone: varchar('timezone', { length: 50 }),

    // ✅ ACHROMATIC: Enhanced classification & organization
    tags: jsonb('tags'), // ["vip", "lead", "customer"] - Enhanced JSON array
    source: varchar('source', { length: 50 }), // "website", "referral", "event", "import"
    status: varchar('status', { length: 20 }).default('active').notNull(), // active, inactive, blocked

    // ✅ ENTERPRISE: Custom data & flexibility
    customFields: jsonb('custom_fields'), // { field1: "value1", field2: "value2" }
    notes: text('notes'),

    // ✅ ENTERPRISE: Social & communication preferences
    socialProfiles: jsonb('social_profiles'), // { linkedin: "url", twitter: "handle", github: "username" }
    communicationPreferences: jsonb('communication_preferences'), // { email: true, sms: false, phone: true }

    // ✅ ACHROMATIC: Enhanced tracking & ownership
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    updatedBy: text('updated_by').references(() => users.id),
    lastContactedAt: timestamp('last_contacted_at'),
    lastContactedBy: text('last_contacted_by').references(() => users.id),

    // ✅ ENTERPRISE: Lifecycle management
    isActive: boolean('is_active').default(true).notNull(),
    deletedAt: timestamp('deleted_at'),
    deletedBy: text('deleted_by').references(() => users.id),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  table => ({
    organizationIdIdx: index('contacts_organization_id_idx').on(
      table.organizationId
    ),
    emailIdx: index('contacts_email_idx').on(table.email),
    companyIdx: index('contacts_company_idx').on(table.company),
    fullNameIdx: index('contacts_full_name_idx').on(
      table.firstName,
      table.lastName
    ),
    statusIdx: index('contacts_status_idx').on(table.status),
    createdByIdx: index('contacts_created_by_idx').on(table.createdBy),
    updatedByIdx: index('contacts_updated_by_idx').on(table.updatedBy),
    isActiveIdx: index('contacts_is_active_idx').on(table.isActive),
    lastContactedIdx: index('contacts_last_contacted_idx').on(
      table.lastContactedAt
    ),
    lastContactedByIdx: index('contacts_last_contacted_by_idx').on(
      table.lastContactedBy
    ),
    countryIdx: index('contacts_country_idx').on(table.country),
  })
);

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // ✅ ACHROMATIC: Enhanced context relationships
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    sessionId: text('session_id').references(() => sessions.sessionToken, {
      onDelete: 'set null',
    }),

    // ✅ ENTERPRISE: Action classification & targeting
    action: varchar('action', { length: 100 }).notNull(), // created, updated, deleted, invited, etc.
    entityType: varchar('entity_type', { length: 50 }), // "contact", "project", "member", "organization"
    entityId: text('entity_id'),
    entityName: varchar('entity_name', { length: 100 }),

    // ✅ ACHROMATIC: Enhanced change tracking
    description: text('description').notNull(),
    changes: jsonb('changes'), // { field: { from: "old", to: "new" }, field2: { from: null, to: "new" } }
    metadata: jsonb('metadata'), // { browser, location, api_version, correlation_id }

    // ✅ ENTERPRISE: Request context & security
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    deviceInfo: jsonb('device_info'), // Parsed device details

    // ✅ ENTERPRISE: Enhanced classification & prioritization
    severity: varchar('severity', { length: 20 }).default('info').notNull(), // info, warning, error, critical
    category: varchar('category', { length: 50 }), // "auth", "data", "billing", "security", "admin"
    subcategory: varchar('subcategory', { length: 50 }), // More granular classification

    // ✅ ACHROMATIC: Enhanced timing & correlation
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    correlationId: text('correlation_id'), // Group related activities
    parentActivityId: text('parent_activity_id'), // For nested activities - reference will be in relations

    // ✅ ENTERPRISE: Processing & alerting
    processed: boolean('processed').default(false).notNull(),
    alertsSent: jsonb('alerts_sent'), // Track notifications sent
  },
  table => ({
    organizationIdIdx: index('activity_logs_organization_id_idx').on(
      table.organizationId
    ),
    userIdIdx: index('activity_logs_user_id_idx').on(table.userId),
    sessionIdIdx: index('activity_logs_session_id_idx').on(table.sessionId),
    actionIdx: index('activity_logs_action_idx').on(table.action),
    entityIdx: index('activity_logs_entity_idx').on(
      table.entityType,
      table.entityId
    ),
    timestampIdx: index('activity_logs_timestamp_idx').on(table.timestamp),
    severityIdx: index('activity_logs_severity_idx').on(table.severity),
    categoryIdx: index('activity_logs_category_idx').on(table.category),
    subcategoryIdx: index('activity_logs_subcategory_idx').on(
      table.subcategory
    ),
    correlationIdx: index('activity_logs_correlation_idx').on(
      table.correlationId
    ),
    parentActivityIdx: index('activity_logs_parent_activity_idx').on(
      table.parentActivityId
    ),
    processedIdx: index('activity_logs_processed_idx').on(table.processed),

    // Composite indexes for common queries
    userTimeIdx: index('activity_logs_user_time_idx').on(
      table.userId,
      table.timestamp
    ),
    categoryTimeIdx: index('activity_logs_category_time_idx').on(
      table.category,
      table.timestamp
    ),
    entityTimeIdx: index('activity_logs_entity_time_idx').on(
      table.entityType,
      table.timestamp
    ),
  })
);

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    usedAt: timestamp('used_at'),

    // ✅ ACHROMATIC: Enhanced security tracking
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    deviceFingerprint: text('device_fingerprint'),

    // ✅ ENTERPRISE: Enhanced validation & security
    attempts: integer('attempts').default(0).notNull(),
    maxAttempts: integer('max_attempts').default(3).notNull(),
    isRevoked: boolean('is_revoked').default(false).notNull(),
    revokedAt: timestamp('revoked_at'),
    revokedReason: varchar('revoked_reason', { length: 100 }), // "used", "expired", "security", "user_request"

    // ✅ ACHROMATIC: Enhanced metadata & context
    metadata: jsonb('metadata'), // { source: "forgot_password", trigger: "failed_login", correlation_id }

    // ✅ ENTERPRISE: Geographic & risk context
    country: varchar('country', { length: 2 }),
    city: varchar('city', { length: 100 }),
    riskScore: integer('risk_score').default(0), // 0-100 calculated risk
    securityFlags: jsonb('security_flags'), // ["new_device", "suspicious_location"]
  },
  table => ({
    userIdIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
    tokenIdx: index('password_reset_tokens_token_idx').on(table.token),
    expiresAtIdx: index('password_reset_tokens_expires_at_idx').on(
      table.expiresAt
    ),
    attemptsIdx: index('password_reset_tokens_attempts_idx').on(table.attempts),
    isRevokedIdx: index('password_reset_tokens_is_revoked_idx').on(
      table.isRevoked
    ),
    ipAddressIdx: index('password_reset_tokens_ip_address_idx').on(
      table.ipAddress
    ),
    countryIdx: index('password_reset_tokens_country_idx').on(table.country),
    riskScoreIdx: index('password_reset_tokens_risk_score_idx').on(
      table.riskScore
    ),

    // Composite indexes
    userAttemptsIdx: index('password_reset_tokens_user_attempts_idx').on(
      table.userId,
      table.attempts
    ),
  })
);

// ============================================
// RELATIONS (COMPLETE)
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  passwordResetTokens: many(passwordResetTokens),
  ownedOrganizations: many(organizations),
  memberships: many(memberships),
  invitationsSent: many(invitations, { relationName: 'inviter' }),
  ownedProjects: many(projects),
  archivedProjects: many(projects, { relationName: 'archiver' }),
  deletedProjects: many(projects, { relationName: 'deleter' }),
  contactsCreated: many(contacts, { relationName: 'creator' }),
  contactsUpdated: many(contacts, { relationName: 'updater' }),
  contactsLastContacted: many(contacts, { relationName: 'lastContacter' }),
  contactsDeleted: many(contacts, { relationName: 'deleter' }),
  activityLogs: many(activityLogs),
  authAuditLogs: many(authAuditLogs),
  revokedSessions: many(sessions, { relationName: 'sessionRevoker' }),
  rateLimits: many(rateLimits),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  organization: one(organizations, {
    fields: [sessions.organizationId],
    references: [organizations.id],
  }),
  revokedByUser: one(users, {
    fields: [sessions.revokedBy],
    references: [users.id],
    relationName: 'sessionRevoker',
  }),
  authAuditLogs: many(authAuditLogs),
  activityLogs: many(activityLogs),
}));

export const authAuditLogsRelations = relations(authAuditLogs, ({ one }) => ({
  user: one(users, { fields: [authAuditLogs.userId], references: [users.id] }),
  session: one(sessions, {
    fields: [authAuditLogs.sessionToken],
    references: [sessions.sessionToken],
  }),
  organization: one(organizations, {
    fields: [authAuditLogs.organizationId],
    references: [organizations.id],
  }),
}));

export const rateLimitsRelations = relations(rateLimits, ({ one }) => ({
  user: one(users, { fields: [rateLimits.userId], references: [users.id] }),
  organization: one(organizations, {
    fields: [rateLimits.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationsRelations = relations(
  organizations,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [organizations.ownerId],
      references: [users.id],
    }),
    parent: one(organizations, {
      fields: [organizations.parentId],
      references: [organizations.id],
      relationName: 'parent',
    }),
    children: many(organizations, { relationName: 'parent' }),
    memberships: many(memberships),
    invitations: many(invitations),
    projects: many(projects),
    contacts: many(contacts),
    activityLogs: many(activityLogs),
    sessions: many(sessions),
    authAuditLogs: many(authAuditLogs),
    rateLimits: many(rateLimits),
  })
);

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [memberships.invitedBy],
    references: [users.id],
    relationName: 'inviter',
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  archiver: one(users, {
    fields: [projects.archivedBy],
    references: [users.id],
    relationName: 'archiver',
  }),
  deleter: one(users, {
    fields: [projects.deletedBy],
    references: [users.id],
    relationName: 'deleter',
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  organization: one(organizations, {
    fields: [contacts.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [contacts.createdBy],
    references: [users.id],
    relationName: 'creator',
  }),
  updater: one(users, {
    fields: [contacts.updatedBy],
    references: [users.id],
    relationName: 'updater',
  }),
  lastContacter: one(users, {
    fields: [contacts.lastContactedBy],
    references: [users.id],
    relationName: 'lastContacter',
  }),
  deleter: one(users, {
    fields: [contacts.deletedBy],
    references: [users.id],
    relationName: 'deleter',
  }),
}));

export const activityLogsRelations = relations(
  activityLogs,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [activityLogs.organizationId],
      references: [organizations.id],
    }),
    user: one(users, { fields: [activityLogs.userId], references: [users.id] }),
    session: one(sessions, {
      fields: [activityLogs.sessionId],
      references: [sessions.sessionToken],
    }),
    parentActivity: one(activityLogs, {
      fields: [activityLogs.parentActivityId],
      references: [activityLogs.id],
      relationName: 'parentActivity',
    }),
    childActivities: many(activityLogs, { relationName: 'parentActivity' }),
  })
);

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  })
);

// ============================================
// TYPESCRIPT TYPES (COMPLETE)
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type AuthAuditLog = typeof authAuditLogs.$inferSelect;
export type NewAuthAuditLog = typeof authAuditLogs.$inferInsert;
export type RateLimit = typeof rateLimits.$inferSelect;
export type NewRateLimit = typeof rateLimits.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// ✅ ACHROMATIC: Enterprise session types
export interface EnterpriseSessionData extends Session {
  user: User;
  organization?: Organization;
  membership?: Membership;
  deviceInfo?: {
    name: string;
    type: string;
    fingerprint: string;
  };
  securityContext?: {
    riskScore: number;
    riskFactors: string[];
    lastSecurityCheck: Date;
  };
  geolocation?: {
    country: string;
    city: string;
    timezone: string;
  };
}

export interface SessionCreateData {
  userId: string;
  sessionToken: string;
  expires: Date;
  providerType: 'database' | 'credentials' | 'oauth';
  isCredentialsUser: boolean;
  deviceInfo?: {
    userAgent?: string;
    fingerprint?: string;
    name?: string;
    type?: string;
  };
  securityContext?: {
    ipAddress?: string;
    riskScore?: number;
    securityLevel?: string;
  };
  organizationId?: string;
}

export interface UserWithSecurity extends User {
  failedAttempts: number;
  isLocked: boolean;
  securityLevel: SecurityLevel;
  mfaEnabled: boolean;
}

export interface SessionWithContext extends Session {
  user: User;
  organization?: Organization;
  isExpired: boolean;
  timeRemaining: number;
  riskAssessment: {
    score: number;
    factors: string[];
    level: SecurityLevel;
  };
}

// ============================================
// ENUMS & CONSTANTS (COMPLETE)
// ============================================

export const MEMBER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
  GUEST: 'guest',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
} as const;

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  SUSPENDED: 'suspended',
} as const;

export const CONTACT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
} as const;

export const AUTH_EVENT_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  SESSION_CREATED: 'session_created',
  SESSION_REVOKED: 'session_revoked',
  SESSION_EXPIRED: 'session_expired',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_LOCKED: 'account_locked',
  MFA_CHALLENGE: 'mfa_challenge',
  MFA_SUCCESS: 'mfa_success',
  MFA_FAILURE: 'mfa_failure',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SECURITY_ALERT: 'security_alert',
} as const;

export const AUTH_EVENT_STATUS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  WARNING: 'warning',
  BLOCKED: 'blocked',
  PENDING: 'pending',
} as const;

export const AUTH_EVENT_CATEGORIES = {
  AUTH: 'auth',
  SESSION: 'session',
  SECURITY: 'security',
  COMPLIANCE: 'compliance',
  ADMIN: 'admin',
} as const;

export const SECURITY_LEVELS = {
  NORMAL: 'normal',
  ELEVATED: 'elevated',
  HIGH_RISK: 'high_risk',
  CRITICAL: 'critical',
} as const;

export const PROVIDER_TYPES = {
  DATABASE: 'database',
  CREDENTIALS: 'credentials',
  OAUTH: 'oauth',
} as const;

export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  UNKNOWN: 'unknown',
} as const;

export const RATE_LIMIT_TYPES = {
  USER_LOGIN: 'user_login',
  IP_LOGIN: 'ip_login',
  API_USER: 'api_user',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
  INVITATION_SEND: 'invitation_send',
} as const;

export const BLOCK_LEVELS = {
  SOFT: 'soft', // Temporary block with retry
  HARD: 'hard', // Extended block
  PERMANENT: 'permanent', // Requires manual intervention
} as const;

export const WINDOW_TYPES = {
  SLIDING: 'sliding',
  FIXED: 'fixed',
} as const;

export const VERIFICATION_TOKEN_TYPES = {
  EMAIL: 'email',
  PHONE: 'phone',
  MAGIC_LINK: 'magic_link',
  PASSWORD_RESET: 'password_reset',
  TWO_FACTOR: 'two_factor',
} as const;

export const ACTIVITY_SEVERITIES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export const ACTIVITY_CATEGORIES = {
  AUTH: 'auth',
  DATA: 'data',
  BILLING: 'billing',
  SECURITY: 'security',
  ADMIN: 'admin',
  API: 'api',
  INTEGRATION: 'integration',
} as const;

export const PASSWORD_RESET_REVOKED_REASONS = {
  USED: 'used',
  EXPIRED: 'expired',
  SECURITY: 'security',
  USER_REQUEST: 'user_request',
  ADMIN_REVOKED: 'admin_revoked',
} as const;

// Enhanced type exports
export type MemberRole = (typeof MEMBER_ROLES)[keyof typeof MEMBER_ROLES];
export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
export type InvitationStatus =
  (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];
export type ProjectStatus =
  (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];
export type ContactStatus =
  (typeof CONTACT_STATUS)[keyof typeof CONTACT_STATUS];
export type AuthEventType =
  (typeof AUTH_EVENT_TYPES)[keyof typeof AUTH_EVENT_TYPES];
export type AuthEventStatus =
  (typeof AUTH_EVENT_STATUS)[keyof typeof AUTH_EVENT_STATUS];
export type AuthEventCategory =
  (typeof AUTH_EVENT_CATEGORIES)[keyof typeof AUTH_EVENT_CATEGORIES];
export type SecurityLevel =
  (typeof SECURITY_LEVELS)[keyof typeof SECURITY_LEVELS];
export type ProviderType = (typeof PROVIDER_TYPES)[keyof typeof PROVIDER_TYPES];
export type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES];
export type RateLimitType =
  (typeof RATE_LIMIT_TYPES)[keyof typeof RATE_LIMIT_TYPES];
export type BlockLevel = (typeof BLOCK_LEVELS)[keyof typeof BLOCK_LEVELS];
export type WindowType = (typeof WINDOW_TYPES)[keyof typeof WINDOW_TYPES];
export type VerificationTokenType =
  (typeof VERIFICATION_TOKEN_TYPES)[keyof typeof VERIFICATION_TOKEN_TYPES];
export type ActivitySeverity =
  (typeof ACTIVITY_SEVERITIES)[keyof typeof ACTIVITY_SEVERITIES];
export type ActivityCategory =
  (typeof ACTIVITY_CATEGORIES)[keyof typeof ACTIVITY_CATEGORIES];
export type PasswordResetRevokedReason =
  (typeof PASSWORD_RESET_REVOKED_REASONS)[keyof typeof PASSWORD_RESET_REVOKED_REASONS];
