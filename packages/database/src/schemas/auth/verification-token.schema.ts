// packages/database/src/schemas/auth/verification-token.schema.ts
// ============================================
// VERIFICATION TOKEN SCHEMA - ENTERPRISE AUTH (FIXED NULL SAFETY)
// ============================================

import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Token type enum
export const verification_token_type_enum = pgEnum('verification_token_type', [
  'email_verification',
  'password_reset',
  'account_activation',
  'two_factor_setup',
  'email_change',
  'phone_verification',
]);

export const verification_tokens = pgTable(
  'verification_tokens',
  {
    id: text('id').primaryKey(),
    
    // Token details
    identifier: text('identifier').notNull(), // email, phone, user_id, etc.
    token: text('token').notNull(),
    type: verification_token_type_enum('type').notNull(),
    
    // Context
    user_id: text('user_id'),
    organization_id: text('organization_id'),
    
    // Expiry and usage
    expires: timestamp('expires').notNull(),
    used_at: timestamp('used_at'),
    
    // Security tracking
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
    
    // Metadata
    metadata: text('metadata'), // JSON string for additional context
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Primary access patterns
    identifierIdx: index('verification_tokens_identifier_idx').on(table.identifier),
    tokenIdx: index('verification_tokens_token_idx').on(table.token),
    typeIdx: index('verification_tokens_type_idx').on(table.type),
    
    // Context indexes
    userIdx: index('verification_tokens_user_idx').on(table.user_id),
    orgIdx: index('verification_tokens_org_idx').on(table.organization_id),
    
    // Expiry and cleanup
    expiresIdx: index('verification_tokens_expires_idx').on(table.expires),
    usedIdx: index('verification_tokens_used_idx').on(table.used_at),
    
    // Composite indexes
    identifierTypeIdx: index('verification_tokens_identifier_type_idx')
      .on(table.identifier, table.type),
    tokenTypeIdx: index('verification_tokens_token_type_idx')
      .on(table.token, table.type),
    
    // Timestamps
    createdIdx: index('verification_tokens_created_idx').on(table.created_at),
    updatedIdx: index('verification_tokens_updated_idx').on(table.updated_at),
  })
);

// Types
export type VerificationToken = typeof verification_tokens.$inferSelect;
export type CreateVerificationToken = typeof verification_tokens.$inferInsert;
export type VerificationTokenType = typeof verification_token_type_enum.enumValues[number];

// Token validation result
export type TokenValidationResult = {
  isValid: boolean;
  isExpired: boolean;
  isUsed: boolean;
  token?: VerificationToken;
  error?: string;
};

// Token generation configuration
export interface TokenConfig {
  type: VerificationTokenType;
  identifier: string;
  userId?: string;
  organizationId?: string;
  expiryMinutes?: number;
  tokenLength?: number;
  metadata?: Record<string, any>;
}

// Default expiry times (in minutes)
export const DEFAULT_TOKEN_EXPIRY: Record<VerificationTokenType, number> = {
  email_verification: 1440, // 24 hours
  password_reset: 60,       // 1 hour
  account_activation: 2880, // 48 hours
  two_factor_setup: 30,     // 30 minutes
  email_change: 60,         // 1 hour
  phone_verification: 10,   // 10 minutes
};

// Token generation
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available, otherwise Math.random fallback
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      // Fixed null safety
      const arrayValue = array[i];
      if (arrayValue !== undefined) {
        result += chars[arrayValue % chars.length];
      }
    }
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
}

export function generateNumericToken(length = 6): string {
  const chars = '0123456789';
  let result = '';
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      // Fixed null safety
      const arrayValue = array[i];
      if (arrayValue !== undefined) {
        result += chars[arrayValue % chars.length];
      }
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
}

// Token creation
export function createVerificationToken(config: TokenConfig): CreateVerificationToken {
  const expiryMinutes = config.expiryMinutes || DEFAULT_TOKEN_EXPIRY[config.type];
  const tokenLength = config.tokenLength || (config.type === 'phone_verification' ? 6 : 32);
  
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + expiryMinutes);
  
  const token = config.type === 'phone_verification' ? 
    generateNumericToken(tokenLength) : 
    generateSecureToken(tokenLength);

  return {
    id: crypto.randomUUID(),
    identifier: config.identifier,
    token,
    type: config.type,
    user_id: config.userId || null,
    organization_id: config.organizationId || null,
    expires,
    used_at: null,
    ip_address: null,
    user_agent: null,
    metadata: config.metadata ? JSON.stringify(config.metadata) : null,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

// Token validation
export function validateToken(
  storedToken: VerificationToken | null,
  providedToken: string
): TokenValidationResult {
  if (!storedToken) {
    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      error: 'Token not found',
    };
  }

  if (storedToken.used_at) {
    return {
      isValid: false,
      isExpired: false,
      isUsed: true,
      token: storedToken,
      error: 'Token already used',
    };
  }

  if (new Date() > storedToken.expires) {
    return {
      isValid: false,
      isExpired: true,
      isUsed: false,
      token: storedToken,
      error: 'Token expired',
    };
  }

  if (storedToken.token !== providedToken) {
    return {
      isValid: false,
      isExpired: false,
      isUsed: false,
      token: storedToken,
      error: 'Invalid token',
    };
  }

  return {
    isValid: true,
    isExpired: false,
    isUsed: false,
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

export function markTokenAsUsed(token: VerificationToken): Partial<VerificationToken> {
  return {
    used_at: new Date(),
    updated_at: new Date(),
  };
}

// Token metadata helpers
export function parseTokenMetadata(token: VerificationToken): Record<string, any> | null {
  if (!token.metadata) return null;
  
  try {
    return JSON.parse(token.metadata);
  } catch {
    return null;
  }
}

export function serializeTokenMetadata(metadata: Record<string, any>): string {
  return JSON.stringify(metadata);
}

// Token cleanup utilities
export function shouldCleanupToken(token: VerificationToken, cleanupAfterHours = 72): boolean {
  const cleanupTime = new Date();
  cleanupTime.setHours(cleanupTime.getHours() - cleanupAfterHours);
  
  return (token.used_at && token.used_at < cleanupTime) || 
         (!token.used_at && token.expires < cleanupTime);
}

// Token type helpers
export function isPhoneVerificationToken(token: VerificationToken): boolean {
  return token.type === 'phone_verification';
}

export function isEmailVerificationToken(token: VerificationToken): boolean {
  return token.type === 'email_verification';
}

export function isPasswordResetToken(token: VerificationToken): boolean {
  return token.type === 'password_reset';
}

// Security helpers
export function createTokenHash(token: string): string {
  // Simple hash for token comparison (in production, use proper hashing)
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    // Fixed null safety
    if (char !== undefined) {
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
  }
  return Math.abs(hash).toString(16);
}

export function rateLimit(
  identifier: string,
  type: VerificationTokenType,
  windowMinutes = 60,
  maxAttempts = 5
): boolean {
  // This would integrate with the rate limiting system
  // For now, return true (allow all)
  return true;
}
