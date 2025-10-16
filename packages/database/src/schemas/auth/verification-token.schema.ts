// packages/database/src/schemas/auth/verification-token.schema.ts
// ============================================
// VERIFICATION TOKENS SCHEMA - ENTERPRISE MULTI-TENANT (REFACTORED)
// ============================================

import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Token type enum
export const verification_token_type_enum = pgEnum('verification_token_type', [
  'email_verification',
  'phone_verification',
  'password_reset',
  'magic_link',
  'two_factor',
]);

export const verification_tokens = pgTable(
  'verification_tokens',
  {
    id: text('id').primaryKey(),
    tenant_id: text('tenant_id'), // ✅ ADICIONADO - Nullable para tokens pre-signup

    identifier: text('identifier').notNull(), // email ou phone
    token: text('token').notNull(),
    type: verification_token_type_enum('type').notNull(),

    // Expiry and usage
    expires: timestamp('expires').notNull(),
    used_at: timestamp('used_at'),

    // Attempt tracking
    attempts: integer('attempts').default(0).notNull(),
    last_attempt_at: timestamp('last_attempt_at'),

    // Metadata
    metadata: text('metadata'), // JSON string

    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    // ✅ REFATORADO - tenant_id em índices (nullable ok)
    tenantIdentifierIdx: index('verification_tokens_tenant_identifier_idx').on(
      table.tenant_id,
      table.identifier
    ),

    // Unique token
    tokenIdx: index('verification_tokens_token_idx').on(table.token),

    // Performance indexes
    identifierIdx: index('verification_tokens_identifier_idx').on(
      table.identifier
    ),
    typeIdx: index('verification_tokens_type_idx').on(table.type),
    expiresIdx: index('verification_tokens_expires_idx').on(table.expires),

    // Composite for common queries
    identifierTypeIdx: index('verification_tokens_identifier_type_idx').on(
      table.identifier,
      table.type
    ),
  })
);

// Types
export type VerificationToken = typeof verification_tokens.$inferSelect;
export type CreateVerificationToken = typeof verification_tokens.$inferInsert;
export type VerificationTokenType =
  (typeof verification_token_type_enum.enumValues)[number];

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isUsed: boolean;
  attemptsRemaining: number;
  token?: VerificationToken;
  error?: string;
}

export interface TokenConfig {
  expiryMinutes: number;
  maxAttempts: number;
  length: number;
}

// Constants
export const DEFAULT_TOKEN_EXPIRY = {
  email_verification: 60 * 24, // 24 hours
  phone_verification: 10, // 10 minutes
  password_reset: 60, // 1 hour
  magic_link: 15, // 15 minutes
  two_factor: 5, // 5 minutes
};

// Token generation
export function generateSecureToken(length = 32): string {
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

export function generateNumericToken(length = 6): string {
  let token = '';
  for (let i = 0; i < length; i++) {
    token += Math.floor(Math.random() * 10).toString();
  }
  return token;
}

// Token creation
export function createVerificationToken(
  identifier: string,
  type: VerificationTokenType,
  tenantId?: string
): CreateVerificationToken {
  const expiryMinutes = DEFAULT_TOKEN_EXPIRY[type] || 60;
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + expiryMinutes);

  const token =
    type === 'two_factor' || type === 'phone_verification'
      ? generateNumericToken(6)
      : generateSecureToken(32);

  return {
    id: crypto.randomUUID(),
    tenant_id: tenantId || null,
    identifier: identifier.toLowerCase().trim(),
    token,
    type,
    expires,
    used_at: null,
    attempts: 0,
    last_attempt_at: null,
    metadata: null,
    created_at: new Date(),
  };
}

// Token validation
export function validateToken(
  storedToken: VerificationToken | null,
  providedToken: string,
  maxAttempts = 5
): TokenValidationResult {
  if (!storedToken) {
    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      attemptsRemaining: 0,
      error: 'Token not found',
    };
  }

  if (storedToken.used_at) {
    return {
      isValid: false,
      isExpired: false,
      isUsed: true,
      attemptsRemaining: 0,
      token: storedToken,
      error: 'Token already used',
    };
  }

  if (new Date() > storedToken.expires) {
    return {
      isValid: false,
      isExpired: true,
      isUsed: false,
      attemptsRemaining: 0,
      token: storedToken,
      error: 'Token expired',
    };
  }

  if (storedToken.attempts >= maxAttempts) {
    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      attemptsRemaining: 0,
      token: storedToken,
      error: 'Max attempts exceeded',
    };
  }

  if (storedToken.token !== providedToken) {
    const remaining = Math.max(0, maxAttempts - (storedToken.attempts + 1));
    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      attemptsRemaining: remaining,
      token: storedToken,
      error: 'Invalid token',
    };
  }

  return {
    isValid: true,
    isExpired: false,
    isUsed: false,
    attemptsRemaining: maxAttempts - storedToken.attempts,
    token: storedToken,
  };
}

// Token utilities
export function isTokenExpired(token: VerificationToken): boolean {
  return new Date() > token.expires;
}

export function isTokenUsed(token: VerificationToken): boolean {
  return token.used_at !== null;
}

export function getTokenExpiryTime(token: VerificationToken): number {
  return Math.max(0, token.expires.getTime() - Date.now());
}

export function markTokenAsUsed(
  token: VerificationToken
): Partial<VerificationToken> {
  return {
    used_at: new Date(),
  };
}

// Metadata helpers
export function parseTokenMetadata(
  token: VerificationToken
): Record<string, any> {
  if (!token.metadata) return {};
  try {
    return JSON.parse(token.metadata);
  } catch {
    return {};
  }
}

export function serializeTokenMetadata(metadata: Record<string, any>): string {
  return JSON.stringify(metadata);
}

// Cleanup utilities
export function shouldCleanupToken(
  token: VerificationToken,
  cleanupAfterHours = 72
): boolean {
  const cleanupTime = new Date();
  cleanupTime.setHours(cleanupTime.getHours() - cleanupAfterHours);

  return (
    token.expires < cleanupTime ||
    (token.used_at !== null && token.used_at < cleanupTime)
  );
}

// Type guards
export function isPhoneVerificationToken(token: VerificationToken): boolean {
  return token.type === 'phone_verification';
}

export function isEmailVerificationToken(token: VerificationToken): boolean {
  return token.type === 'email_verification';
}

export function isPasswordResetToken(token: VerificationToken): boolean {
  return token.type === 'password_reset';
}

// Token hashing (simple, use crypto in production)
export function createTokenHash(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Rate limiting helper
export function rateLimit(
  token: VerificationToken,
  windowMinutes = 60,
  maxAttempts = 3
): boolean {
  if (!token.last_attempt_at) return false;

  const windowMs = windowMinutes * 60 * 1000;
  const timeSinceLastAttempt = Date.now() - token.last_attempt_at.getTime();

  if (timeSinceLastAttempt > windowMs) {
    return false; // Window expired, allow new attempts
  }

  return token.attempts >= maxAttempts;
}
