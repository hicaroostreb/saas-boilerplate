// ============================================
// PASSWORD RESET TOKEN SCHEMA - SRP: APENAS PASSWORD RESET TABLE
// ============================================

import {
  boolean,
  index,
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

export const tokenStatusEnum = pgEnum('token_status', [
  'active',
  'used',
  'expired',
  'revoked',
]);

export const requestSourceEnum = pgEnum('request_source', [
  'web',
  'mobile',
  'api',
  'admin',
]);

// ============================================
// PASSWORD RESET TOKEN TABLE DEFINITION
// ============================================

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Relations
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Token details
    token: varchar('token', { length: 255 }).notNull().unique(),
    hashedToken: text('hashed_token').notNull(), // Stored hashed for security

    // Status
    status: tokenStatusEnum('status').default('active').notNull(),

    // Validation
    email: varchar('email', { length: 255 }).notNull(), // Email when token was created

    // Timing
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    usedAt: timestamp('used_at', { mode: 'date' }),
    revokedAt: timestamp('revoked_at', { mode: 'date' }),

    // Security tracking
    requestIp: varchar('request_ip', { length: 45 }), // IP when token was requested
    requestUserAgent: text('request_user_agent'),
    requestSource: requestSourceEnum('request_source').default('web').notNull(),

    // Usage tracking
    useIp: varchar('use_ip', { length: 45 }), // IP when token was used
    useUserAgent: text('use_user_agent'),

    // Security features
    singleUse: boolean('single_use').default(true).notNull(),
    maxAttempts: varchar('max_attempts', { length: 2 }).default('3').notNull(),
    currentAttempts: varchar('current_attempts', { length: 2 })
      .default('0')
      .notNull(),

    // Metadata - ✅ FIXED: Self-reference as nullable text
    previousTokenId: text('previous_token_id'),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    // Indexes for performance
    tokenIdx: uniqueIndex('password_reset_token_idx').on(table.token),
    hashedTokenIdx: index('password_reset_hashed_token_idx').on(
      table.hashedToken
    ),
    userIdx: index('password_reset_user_idx').on(table.userId),
    emailIdx: index('password_reset_email_idx').on(table.email),
    statusIdx: index('password_reset_status_idx').on(table.status),
    expiresAtIdx: index('password_reset_expires_at_idx').on(table.expiresAt),
    createdAtIdx: index('password_reset_created_at_idx').on(table.createdAt),
    requestIpIdx: index('password_reset_request_ip_idx').on(table.requestIp),
    previousTokenIdx: index('password_reset_previous_token_idx').on(
      table.previousTokenId
    ),

    // Composite indexes
    userStatusIdx: index('password_reset_user_status_idx').on(
      table.userId,
      table.status
    ),
    emailStatusIdx: index('password_reset_email_status_idx').on(
      table.email,
      table.status
    ),
    activeTokensIdx: index('password_reset_active_tokens_idx').on(
      table.status,
      table.expiresAt
    ),
  })
);

// ============================================
// PASSWORD RESET TOKEN TYPES
// ============================================

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type CreatePasswordResetToken = typeof passwordResetTokens.$inferInsert;

// Enum types
export type TokenStatus = (typeof tokenStatusEnum.enumValues)[number];
export type RequestSource = (typeof requestSourceEnum.enumValues)[number];

// Token validation result
export type TokenValidationResult = {
  valid: boolean;
  token?: PasswordResetToken;
  error?: string;
  reason?: 'expired' | 'used' | 'revoked' | 'not_found' | 'max_attempts';
};

// Token with user info
export type PasswordResetTokenWithUser = PasswordResetToken & {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

// Token creation request
export type TokenCreationRequest = {
  userId: string;
  email: string;
  requestIp?: string;
  requestUserAgent?: string;
  requestSource?: RequestSource;
  expirationMinutes?: number;
};

// Token usage summary
export type TokenUsageSummary = {
  userId: string;
  email: string;
  totalRequests: number;
  successfulResets: number;
  expiredTokens: number;
  revokedTokens: number;
  lastRequestAt: Date;
  lastSuccessfulResetAt?: Date;
};

// Security alert data
export type SecurityAlert = {
  type: 'suspicious_activity' | 'multiple_requests' | 'unusual_ip';
  userId: string;
  email: string;
  details: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
};
