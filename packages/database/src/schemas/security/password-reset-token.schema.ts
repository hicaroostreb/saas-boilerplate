// packages/database/src/schemas/security/password-reset-token.schema.ts
// ============================================
// PASSWORD RESET TOKEN SCHEMA - ENTERPRISE SECURITY (REFACTORED)
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

// Token status enum
export const password_reset_status_enum = pgEnum('password_reset_status', [
  'active',
  'used',
  'expired',
  'revoked',
]);

export const password_reset_tokens = pgTable(
  'password_reset_tokens',
  {
    id: text('id').primaryKey(),
    tenant_id: text('tenant_id'), // ✅ ADICIONADO - Nullable para tokens pre-signup

    // User context
    user_id: text('user_id').notNull(),
    organization_id: text('organization_id'),

    // Token details
    token: text('token').notNull(),
    token_hash: text('token_hash').notNull(),

    // Status
    status: password_reset_status_enum('status').default('active').notNull(),

    // Expiry and usage
    expires_at: timestamp('expires_at').notNull(),
    used_at: timestamp('used_at'),
    revoked_at: timestamp('revoked_at'),
    revoked_by: text('revoked_by'),
    revoked_reason: text('revoked_reason'),

    // Security tracking
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),

    // Attempt tracking
    attempt_count: integer('attempt_count').default(0).notNull(),
    last_attempt_at: timestamp('last_attempt_at'),

    // Rate limiting
    is_rate_limited: boolean('is_rate_limited').default(false).notNull(),
    rate_limit_expires_at: timestamp('rate_limit_expires_at'),

    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    // ✅ REFATORADO - tenant_id sempre primeiro (nullable ok)
    tenantUserIdx: index('password_reset_tokens_tenant_user_idx').on(
      table.tenant_id,
      table.user_id
    ),
    tenantStatusIdx: index('password_reset_tokens_tenant_status_idx').on(
      table.tenant_id,
      table.status
    ),

    // Primary access patterns
    userIdx: index('password_reset_tokens_user_idx').on(table.user_id),
    tokenIdx: index('password_reset_tokens_token_idx').on(table.token),
    tokenHashIdx: index('password_reset_tokens_token_hash_idx').on(
      table.token_hash
    ),
    orgIdx: index('password_reset_tokens_org_idx').on(table.organization_id),

    // Status and expiry
    statusIdx: index('password_reset_tokens_status_idx').on(table.status),
    expiresIdx: index('password_reset_tokens_expires_idx').on(table.expires_at),
    usedIdx: index('password_reset_tokens_used_idx').on(table.used_at),
    revokedIdx: index('password_reset_tokens_revoked_idx').on(table.revoked_at),

    // Security and rate limiting
    ipIdx: index('password_reset_tokens_ip_idx').on(table.ip_address),
    attemptCountIdx: index('password_reset_tokens_attempt_count_idx').on(
      table.attempt_count
    ),
    lastAttemptIdx: index('password_reset_tokens_last_attempt_idx').on(
      table.last_attempt_at
    ),
    rateLimitIdx: index('password_reset_tokens_rate_limit_idx').on(
      table.is_rate_limited
    ),
    rateLimitExpiresIdx: index(
      'password_reset_tokens_rate_limit_expires_idx'
    ).on(table.rate_limit_expires_at),

    // Composite indexes
    userStatusIdx: index('password_reset_tokens_user_status_idx').on(
      table.user_id,
      table.status
    ),
    statusExpiresIdx: index('password_reset_tokens_status_expires_idx').on(
      table.status,
      table.expires_at
    ),

    // Timestamps
    createdIdx: index('password_reset_tokens_created_idx').on(table.created_at),
    updatedIdx: index('password_reset_tokens_updated_idx').on(table.updated_at),
  })
);

// Types
export type PasswordResetToken = typeof password_reset_tokens.$inferSelect;
export type CreatePasswordResetToken =
  typeof password_reset_tokens.$inferInsert;
export type PasswordResetStatus =
  (typeof password_reset_status_enum.enumValues)[number];

// Token validation result
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isUsed: boolean;
  isRevoked: boolean;
  isRateLimited: boolean;
  token?: PasswordResetToken;
  error?: string;
  remainingAttempts?: number;
}

// Constants
export const PASSWORD_RESET_TOKEN_LENGTH = 32;
export const PASSWORD_RESET_EXPIRY_HOURS = 1;
export const MAX_RESET_ATTEMPTS = 5;
export const RATE_LIMIT_HOURS = 24;

// Token generation
export function generatePasswordResetToken(
  length = PASSWORD_RESET_TOKEN_LENGTH
): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      const arrayValue = array[i];
      if (arrayValue !== undefined) {
        token += chars[arrayValue % chars.length];
      }
    }
  } else {
    for (let i = 0; i < length; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return token;
}

// Token hashing
export function hashPasswordResetToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    if (char !== undefined) {
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
  }
  return Math.abs(hash).toString(16);
}

// Token creation
export function createPasswordResetToken(
  userId: string,
  tenantId?: string,
  organizationId?: string,
  ipAddress?: string,
  userAgent?: string
): CreatePasswordResetToken {
  const token = generatePasswordResetToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + PASSWORD_RESET_EXPIRY_HOURS);

  return {
    id: crypto.randomUUID(),
    tenant_id: tenantId || null,
    user_id: userId,
    organization_id: organizationId || null,
    token,
    token_hash: hashPasswordResetToken(token),
    status: 'active',
    expires_at: expires,
    used_at: null,
    revoked_at: null,
    revoked_by: null,
    revoked_reason: null,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    attempt_count: 0,
    last_attempt_at: null,
    is_rate_limited: false,
    rate_limit_expires_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

// Token validation
export function validatePasswordResetToken(
  storedToken: PasswordResetToken | null,
  providedToken: string
): TokenValidationResult {
  if (!storedToken) {
    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      isRevoked: false,
      isRateLimited: false,
      error: 'Token not found',
    };
  }

  if (storedToken.status === 'revoked') {
    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      isRevoked: true,
      isRateLimited: false,
      token: storedToken,
      error: 'Token revoked',
    };
  }

  if (
    storedToken.is_rate_limited &&
    storedToken.rate_limit_expires_at &&
    new Date() < storedToken.rate_limit_expires_at
  ) {
    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      isRevoked: false,
      isRateLimited: true,
      token: storedToken,
      error: 'Rate limited',
    };
  }

  if (storedToken.status === 'used' || storedToken.used_at) {
    return {
      isValid: false,
      isExpired: false,
      isUsed: true,
      isRevoked: false,
      isRateLimited: false,
      token: storedToken,
      error: 'Token already used',
    };
  }

  if (storedToken.status === 'expired' || new Date() > storedToken.expires_at) {
    return {
      isValid: false,
      isExpired: true,
      isUsed: false,
      isRevoked: false,
      isRateLimited: false,
      token: storedToken,
      error: 'Token expired',
    };
  }

  if (storedToken.token !== providedToken) {
    const remainingAttempts = Math.max(
      0,
      MAX_RESET_ATTEMPTS - (storedToken.attempt_count + 1)
    );

    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      isRevoked: false,
      isRateLimited: false,
      token: storedToken,
      error: 'Invalid token',
      remainingAttempts,
    };
  }

  return {
    isValid: true,
    isExpired: false,
    isUsed: false,
    isRevoked: false,
    isRateLimited: false,
    token: storedToken,
  };
}

// Token utilities
export function isTokenExpired(token: PasswordResetToken): boolean {
  return new Date() > token.expires_at;
}

export function isTokenUsed(token: PasswordResetToken): boolean {
  return token.status === 'used' || token.used_at !== null;
}

export function isTokenRevoked(token: PasswordResetToken): boolean {
  return token.status === 'revoked';
}

export function isTokenRateLimited(token: PasswordResetToken): boolean {
  return (
    token.is_rate_limited &&
    token.rate_limit_expires_at !== null &&
    new Date() < token.rate_limit_expires_at
  );
}

export function shouldRateLimit(token: PasswordResetToken): boolean {
  return token.attempt_count >= MAX_RESET_ATTEMPTS;
}
