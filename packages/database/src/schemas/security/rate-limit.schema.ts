// packages/database/src/schemas/security/rate-limit.schema.ts

// ============================================
// RATE LIMIT SCHEMA - SRP: APENAS RATE LIMIT TABLE
// Enterprise Multi-Tenancy and Soft Delete
// ============================================

import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const rateLimitTypeEnum = pgEnum('rate_limit_type', [
  'login_attempts',
  'password_reset',
  'email_verification',
  'registration',
  'api_requests',
  'api_uploads',
  'api_downloads',
  'organization_creation',
  'invitation_sending',
  'project_creation',
  'contact_creation',
  'requests_per_ip',
  'requests_per_user',
  'requests_per_endpoint',
]);

export const rateLimitWindowEnum = pgEnum('rate_limit_window', [
  'minute',
  'hour',
  'day',
  'week',
  'month',
]);

export const rateLimits = pgTable(
  'rate_limits',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Multi-tenancy - ✅ REMOVED REFERENCES to avoid circular dependency
    organizationId: text('organization_id'),

    // Identification - ✅ REMOVED REFERENCES to avoid circular dependency
    userId: text('user_id'),
    ipAddress: varchar('ip_address', { length: 45 }),
    identifier: varchar('identifier', { length: 255 }),

    // Configuration
    type: rateLimitTypeEnum('type').notNull(),
    resource: varchar('resource', { length: 200 }),

    // Details
    windowType: rateLimitWindowEnum('window_type').notNull(),
    windowSize: integer('window_size').default(1).notNull(),
    maxAttempts: integer('max_attempts').notNull(),

    // State
    currentAttempts: integer('current_attempts').default(0).notNull(),

    // Timing
    windowStart: timestamp('window_start', { mode: 'date' }).notNull(),
    windowEnd: timestamp('window_end', { mode: 'date' }).notNull(),
    blockedUntil: timestamp('blocked_until', { mode: 'date' }),

    // Metadata
    lastAttemptAt: timestamp('last_attempt_at', { mode: 'date' }),
    lastAttemptIp: varchar('last_attempt_ip', { length: 45 }),
    userAgent: text('user_agent'),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
  },
  table => ({
    userIdx: index('rate_limit_user_idx').on(table.userId),
    organizationIdx: index('rate_limit_org_idx').on(table.organizationId),
    ipIdx: index('rate_limit_ip_idx').on(table.ipAddress),
    identifierIdx: index('rate_limit_identifier_idx').on(table.identifier),
    typeIdx: index('rate_limit_type_idx').on(table.type),
    windowEndIdx: index('rate_limit_window_end_idx').on(table.windowEnd),
    blockedUntilIdx: index('rate_limit_blocked_until_idx').on(
      table.blockedUntil
    ),
    createdAtIdx: index('rate_limit_created_at_idx').on(table.createdAt),
    deletedAtIdx: index('rate_limit_deleted_at_idx').on(table.deletedAt),

    userTypeIdx: index('rate_limit_user_type_idx').on(table.userId, table.type),
    ipTypeIdx: index('rate_limit_ip_type_idx').on(table.ipAddress, table.type),
    identifierTypeIdx: index('rate_limit_identifier_type_idx').on(
      table.identifier,
      table.type
    ),
    userTypeResourceIdx: uniqueIndex('rate_limit_user_type_resource_idx').on(
      table.userId,
      table.type,
      table.resource
    ),
    ipTypeResourceIdx: uniqueIndex('rate_limit_ip_type_resource_idx').on(
      table.ipAddress,
      table.type,
      table.resource
    ),
    identifierTypeResourceIdx: uniqueIndex(
      'rate_limit_identifier_type_resource_idx'
    ).on(table.identifier, table.type, table.resource),
  })
);

export type RateLimit = typeof rateLimits.$inferSelect;
export type CreateRateLimit = typeof rateLimits.$inferInsert;
export type RateLimitType = (typeof rateLimitTypeEnum.enumValues)[number];
export type RateLimitWindow = (typeof rateLimitWindowEnum.enumValues)[number];

export type RateLimitWithUser = RateLimit & {
  user?: { id: string; name: string | null; email: string };
};

export type RateLimitSummary = {
  type: RateLimitType;
  resource?: string;
  totalLimits: number;
  activeLimits: number;
  blockedLimits: number;
  averageAttempts: number;
};

// ✅ ADD MISSING TYPES that security/index.ts is trying to export
export type RateLimitConfig = {
  type: RateLimitType;
  resource?: string;
  windowType: RateLimitWindow;
  windowSize: number;
  maxAttempts: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
};
