// packages/database/src/schemas/auth/verification-token.schema.ts
// ============================================
// VERIFICATION TOKENS SCHEMA - ENTERPRISE EMAIL VERIFICATION
// ============================================

import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Token type enumeration
export const verification_token_type_enum = pgEnum('verification_token_type', [
  'email_verification',
  'password_reset',
  'magic_link',
  'two_factor_setup',
  'account_recovery',
]);

export const verification_tokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(), // Usually email address
    token: text('token').primaryKey(),
    type: verification_token_type_enum('type').notNull().default('email_verification'),
    expires: timestamp('expires').notNull(),
    
    // Context information
    user_id: text('user_id'), // Optional link to user
    metadata: text('metadata'), // JSON string for additional data
    
    // Security tracking
    attempts: text('attempts').default('0'), // Number of attempts made
    max_attempts: text('max_attempts').default('3'),
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    used_at: timestamp('used_at'), // When token was successfully used
  },
  (table) => ({
    // Primary access patterns
    identifierIdx: index('verification_tokens_identifier_idx').on(table.identifier),
    tokenIdx: index('verification_tokens_token_idx').on(table.token),
    
    // Performance indexes
    expiresIdx: index('verification_tokens_expires_idx').on(table.expires),
    typeIdx: index('verification_tokens_type_idx').on(table.type),
    userIdx: index('verification_tokens_user_idx').on(table.user_id),
    
    // Composite indexes for common queries
    identifierTypeIdx: index('verification_tokens_identifier_type_idx')
      .on(table.identifier, table.type),
    userTypeIdx: index('verification_tokens_user_type_idx')
      .on(table.user_id, table.type),
    
    // Cleanup indexes
    expiredTokensIdx: index('verification_tokens_expired_idx')
      .on(table.expires, table.used_at),
  })
);

// Types
export type VerificationToken = typeof verification_tokens.$inferSelect;
export type CreateVerificationToken = typeof verification_tokens.$inferInsert;
export type VerificationTokenType = typeof verification_token_type_enum.enumValues[number];

// Helper types
export interface TokenMetadata {
  purpose?: string;
  redirect_url?: string;
  additional_data?: Record<string, any>;
  security_context?: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
  };
}

export interface TokenValidationResult {
  is_valid: boolean;
  is_expired: boolean;
  is_used: boolean;
  attempts_exceeded: boolean;
  token?: VerificationToken;
  error_message?: string;
}

// Token validation helpers
export function isTokenExpired(token: VerificationToken): boolean {
  return new Date() > token.expires;
}

export function isTokenUsed(token: VerificationToken): boolean {
  return token.used_at !== null;
}

export function hasExceededAttempts(token: VerificationToken): boolean {
  const attempts = parseInt(token.attempts || '0', 10);
  const maxAttempts = parseInt(token.max_attempts || '3', 10);
  return attempts >= maxAttempts;
}

export function validateToken(token: VerificationToken): TokenValidationResult {
  if (isTokenUsed(token)) {
    return {
      is_valid: false,
      is_expired: false,
      is_used: true,
      attempts_exceeded: false,
      token,
      error_message: 'Token has already been used',
    };
  }

  if (isTokenExpired(token)) {
    return {
      is_valid: false,
      is_expired: true,
      is_used: false,
      attempts_exceeded: false,
      token,
      error_message: 'Token has expired',
    };
  }

  if (hasExceededAttempts(token)) {
    return {
      is_valid: false,
      is_expired: false,
      is_used: false,
      attempts_exceeded: true,
      token,
      error_message: 'Too many attempts made with this token',
    };
  }

  return {
    is_valid: true,
    is_expired: false,
    is_used: false,
    attempts_exceeded: false,
    token,
  };
}

// Token generation utilities
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  
  return result;
}

export function createTokenExpiry(minutesFromNow: number): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutesFromNow);
  return expiry;
}

// Metadata helpers
export function parseTokenMetadata(token: VerificationToken): TokenMetadata | null {
  if (!token.metadata) {
    return null;
  }
  
  try {
    return JSON.parse(token.metadata) as TokenMetadata;
  } catch {
    return null;
  }
}

export function serializeTokenMetadata(metadata: TokenMetadata): string {
  return JSON.stringify(metadata);
}
