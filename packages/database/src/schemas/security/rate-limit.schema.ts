// ============================================
// RATE LIMIT SCHEMA - SRP: APENAS RATE LIMIT TABLE
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
import { users } from '../auth/user.schema';

// ============================================
// ENUMS
// ============================================

export const rateLimitTypeEnum = pgEnum('rate_limit_type', [
  // Authentication limits
  'login_attempts',
  'password_reset',
  'email_verification',
  'registration',

  // API limits
  'api_requests',
  'api_uploads',
  'api_downloads',

  // Feature limits
  'organization_creation',
  'invitation_sending',
  'project_creation',
  'contact_creation',

  // General limits
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

// ============================================
// RATE LIMIT TABLE DEFINITION
// ============================================

export const rateLimits = pgTable(
  'rate_limits',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Identification (one of these will be used)
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
    identifier: varchar('identifier', { length: 255 }), // Generic identifier (email, etc.)

    // Rate limit configuration
    type: rateLimitTypeEnum('type').notNull(),
    resource: varchar('resource', { length: 200 }), // Specific resource being limited

    // Limit details
    windowType: rateLimitWindowEnum('window_type').notNull(),
    windowSize: integer('window_size').default(1).notNull(), // Number of window units
    maxAttempts: integer('max_attempts').notNull(),

    // Current state
    currentAttempts: integer('current_attempts').default(0).notNull(),

    // Timing
    windowStart: timestamp('window_start', { mode: 'date' }).notNull(),
    windowEnd: timestamp('window_end', { mode: 'date' }).notNull(),

    // Blocking
    blockedUntil: timestamp('blocked_until', { mode: 'date' }),

    // Metadata
    lastAttemptAt: timestamp('last_attempt_at', { mode: 'date' }),
    lastAttemptIp: varchar('last_attempt_ip', { length: 45 }),
    userAgent: text('user_agent'),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    // Indexes for performance
    userIdx: index('rate_limit_user_idx').on(table.userId),
    ipIdx: index('rate_limit_ip_idx').on(table.ipAddress),
    identifierIdx: index('rate_limit_identifier_idx').on(table.identifier),
    typeIdx: index('rate_limit_type_idx').on(table.type),
    windowEndIdx: index('rate_limit_window_end_idx').on(table.windowEnd),
    blockedUntilIdx: index('rate_limit_blocked_until_idx').on(
      table.blockedUntil
    ),
    createdAtIdx: index('rate_limit_created_at_idx').on(table.createdAt),

    // Composite indexes for lookups
    userTypeIdx: index('rate_limit_user_type_idx').on(table.userId, table.type),
    ipTypeIdx: index('rate_limit_ip_type_idx').on(table.ipAddress, table.type),
    identifierTypeIdx: index('rate_limit_identifier_type_idx').on(
      table.identifier,
      table.type
    ),

    // Unique constraints
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

// ============================================
// RATE LIMIT TYPES
// ============================================

export type RateLimit = typeof rateLimits.$inferSelect;
export type CreateRateLimit = typeof rateLimits.$inferInsert;

// Enum types
export type RateLimitType = (typeof rateLimitTypeEnum.enumValues)[number];
export type RateLimitWindow = (typeof rateLimitWindowEnum.enumValues)[number];

// Rate limit check result
export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // seconds
};

// Rate limit configuration
export type RateLimitConfig = {
  type: RateLimitType;
  resource?: string;
  windowType: RateLimitWindow;
  windowSize: number;
  maxAttempts: number;
};

// Rate limit with user info
export type RateLimitWithUser = RateLimit & {
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
};

// Rate limit summary for monitoring
export type RateLimitSummary = {
  type: RateLimitType;
  resource?: string;
  totalLimits: number;
  activeLimits: number;
  blockedLimits: number;
  averageAttempts: number;
};
