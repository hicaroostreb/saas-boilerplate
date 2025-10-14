// packages/database/src/schemas/security/password-reset-token.schema.ts
// ============================================
// PASSWORD RESET TOKENS SCHEMA - ENTERPRISE SECURITY
// ============================================

import { boolean, index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Token status enum
export const token_status_enum = pgEnum('token_status', [
  'active',
  'used',
  'expired',
  'revoked',
]);

// Request source enum
export const request_source_enum = pgEnum('request_source', [
  'web',
  'mobile',
  'api',
  'admin',
]);

export const password_reset_tokens = pgTable(
  'password_reset_tokens',
  {
    id: text('id').primaryKey(),
    
    // User and organization context
    user_id: text('user_id').notNull(),
    organization_id: text('organization_id'),
    
    // Token details
    token_hash: text('token_hash').notNull().unique(), // Hashed token for security
    token_partial: text('token_partial').notNull(), // Last 4 chars for identification
    
    // Request context
    request_source: request_source_enum('request_source').notNull().default('web'),
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
    
    // Token lifecycle
    status: token_status_enum('status').notNull().default('active'),
    expires_at: timestamp('expires_at').notNull(),
    
    // Usage tracking
    attempts: integer('attempts').notNull().default(0),
    max_attempts: integer('max_attempts').notNull().default(3),
    used_at: timestamp('used_at'),
    used_ip: text('used_ip'),
    
    // Security flags
    is_one_time: boolean('is_one_time').notNull().default(true),
    requires_verification: boolean('requires_verification').notNull().default(false),
    
    // Metadata
    metadata: text('metadata'), // JSON string for additional context
    
    // Admin context (if requested by admin)
    requested_by_admin: text('requested_by_admin'),
    admin_notes: text('admin_notes'),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Security indexes
    tokenHashIdx: index('password_reset_tokens_hash_idx').on(table.token_hash),
    tokenPartialIdx: index('password_reset_tokens_partial_idx').on(table.token_partial),
    
    // User and organization indexes
    userIdx: index('password_reset_tokens_user_idx').on(table.user_id),
    orgIdx: index('password_reset_tokens_org_idx').on(table.organization_id),
    
    // Status and lifecycle indexes
    statusIdx: index('password_reset_tokens_status_idx').on(table.status),
    expiresIdx: index('password_reset_tokens_expires_idx').on(table.expires_at),
    
    // Security tracking
    ipIdx: index('password_reset_tokens_ip_idx').on(table.ip_address),
    sourceIdx: index('password_reset_tokens_source_idx').on(table.request_source),
    
    // Admin tracking
    adminIdx: index('password_reset_tokens_admin_idx').on(table.requested_by_admin),
    
    // Composite indexes for security queries
    userStatusIdx: index('password_reset_tokens_user_status_idx')
      .on(table.user_id, table.status),
    statusExpiresIdx: index('password_reset_tokens_status_expires_idx')
      .on(table.status, table.expires_at),
    ipAttemptsIdx: index('password_reset_tokens_ip_attempts_idx')
      .on(table.ip_address, table.attempts, table.created_at),
    
    // Cleanup indexes
    expiredTokensIdx: index('password_reset_tokens_expired_idx')
      .on(table.expires_at, table.status, table.updated_at),
    
    // Timestamps
    createdIdx: index('password_reset_tokens_created_idx').on(table.created_at),
    updatedIdx: index('password_reset_tokens_updated_idx').on(table.updated_at),
  })
);

// Types
export type PasswordResetToken = typeof password_reset_tokens.$inferSelect;
export type CreatePasswordResetToken = typeof password_reset_tokens.$inferInsert;
export type TokenStatus = typeof token_status_enum.enumValues[number];
export type RequestSource = typeof request_source_enum.enumValues[number];

// Helper types
export interface TokenCreationRequest {
  user_id: string;
  organization_id?: string;
  request_source: RequestSource;
  ip_address?: string;
  user_agent?: string;
  requested_by_admin?: string;
  admin_notes?: string;
  expires_in_minutes?: number;
}

export interface TokenValidationResult {
  is_valid: boolean;
  is_expired: boolean;
  is_used: boolean;
  is_revoked: boolean;
  attempts_exceeded: boolean;
  token?: PasswordResetToken;
  error_message?: string;
}

export interface TokenUsageResult {
  success: boolean;
  token: PasswordResetToken;
  error_message?: string;
  should_lock_account?: boolean;
}

// Default configurations
export const TOKEN_CONFIG = {
  DEFAULT_EXPIRY_MINUTES: 60, // 1 hour
  ADMIN_EXPIRY_MINUTES: 240,   // 4 hours for admin requests
  MAX_ATTEMPTS: 3,
  MIN_TOKEN_LENGTH: 32,
  TOKEN_PARTIAL_LENGTH: 4,
} as const;

// Token generation utilities
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length];
  }
  
  return token;
}

export function createTokenHash(token: string): string {
  // In a real implementation, use a proper hash function like SHA-256
  // This is a simplified version for demonstration
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  
  // Fallback hash for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

export function createTokenPartial(token: string): string {
  return token.slice(-TOKEN_CONFIG.TOKEN_PARTIAL_LENGTH);
}

export function createExpiryDate(minutesFromNow: number): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutesFromNow);
  return expiry;
}

// Validation functions
export function isTokenExpired(token: PasswordResetToken): boolean {
  return new Date() > token.expires_at;
}

export function isTokenUsed(token: PasswordResetToken): boolean {
  return token.status === 'used' || token.used_at !== null;
}

export function isTokenRevoked(token: PasswordResetToken): boolean {
  return token.status === 'revoked';
}

export function hasExceededAttempts(token: PasswordResetToken): boolean {
  return token.attempts >= token.max_attempts;
}

export function isTokenActive(token: PasswordResetToken): boolean {
  return (
    token.status === 'active' &&
    !isTokenExpired(token) &&
    !isTokenUsed(token) &&
    !isTokenRevoked(token) &&
    !hasExceededAttempts(token)
  );
}

// Token validation
export function validatePasswordResetToken(token: PasswordResetToken): TokenValidationResult {
  if (isTokenRevoked(token)) {
    return {
      is_valid: false,
      is_expired: false,
      is_used: false,
      is_revoked: true,
      attempts_exceeded: false,
      token,
      error_message: 'Token has been revoked',
    };
  }

  if (isTokenUsed(token)) {
    return {
      is_valid: false,
      is_expired: false,
      is_used: true,
      is_revoked: false,
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
      is_revoked: false,
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
      is_revoked: false,
      attempts_exceeded: true,
      token,
      error_message: 'Too many attempts made with this token',
    };
  }

  return {
    is_valid: true,
    is_expired: false,
    is_used: false,
    is_revoked: false,
    attempts_exceeded: false,
    token,
  };
}

// Usage tracking
export function incrementTokenAttempts(token: PasswordResetToken): Partial<PasswordResetToken> {
  const newAttempts = token.attempts + 1;
  const updates: Partial<PasswordResetToken> = {
    attempts: newAttempts,
    updated_at: new Date(),
  };

  // Auto-revoke if max attempts exceeded
  if (newAttempts >= token.max_attempts) {
    updates.status = 'revoked';
  }

  return updates;
}

export function markTokenAsUsed(
  token: PasswordResetToken,
  usedIp?: string
): Partial<PasswordResetToken> {
  return {
    status: 'used',
    used_at: new Date(),
    used_ip: usedIp,
    updated_at: new Date(),
  };
}

export function revokeToken(token: PasswordResetToken): Partial<PasswordResetToken> {
  return {
    status: 'revoked',
    updated_at: new Date(),
  };
}

// Time utilities
export function getTimeUntilExpiry(token: PasswordResetToken): number {
  const now = Date.now();
  const expiryTime = token.expires_at.getTime();
  return Math.max(0, expiryTime - now);
}

export function getMinutesUntilExpiry(token: PasswordResetToken): number {
  const msUntilExpiry = getTimeUntilExpiry(token);
  return Math.floor(msUntilExpiry / (1000 * 60));
}

export function getTimeSinceCreation(token: PasswordResetToken): number {
  const now = Date.now();
  const createdTime = token.created_at.getTime();
  return now - createdTime;
}

export function getMinutesSinceCreation(token: PasswordResetToken): number {
  const msSinceCreation = getTimeSinceCreation(token);
  return Math.floor(msSinceCreation / (1000 * 60));
}

// Security helpers
export function shouldLockAccount(failedAttempts: PasswordResetToken[]): boolean {
  // Lock account if there are multiple failed reset attempts from different tokens
  const recentFailures = failedAttempts.filter(token => {
    const hoursSinceAttempt = (Date.now() - token.updated_at.getTime()) / (1000 * 60 * 60);
    return hoursSinceAttempt <= 24 && token.attempts >= token.max_attempts;
  });

  return recentFailures.length >= 3;
}

export function getFailedAttemptsFromIP(
  tokens: PasswordResetToken[],
  ipAddress: string,
  hoursBack: number = 24
): PasswordResetToken[] {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

  return tokens.filter(token => 
    token.ip_address === ipAddress &&
    token.updated_at > cutoffTime &&
    token.attempts > 0
  );
}

export function shouldBlockIP(
  tokens: PasswordResetToken[],
  ipAddress: string
): boolean {
  const failedAttempts = getFailedAttemptsFromIP(tokens, ipAddress);
  const totalAttempts = failedAttempts.reduce((sum, token) => sum + token.attempts, 0);
  
  return totalAttempts >= 10; // Block IP after 10 failed attempts in 24h
}

// Metadata helpers
export function parseTokenMetadata(token: PasswordResetToken): Record<string, any> | null {
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

// Cleanup utilities
export function shouldCleanupToken(
  token: PasswordResetToken,
  retentionHours: number = 168 // 7 days
): boolean {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - retentionHours);
  
  // Always keep tokens that were successfully used for audit purposes
  if (token.status === 'used') {
    cutoffTime.setHours(cutoffTime.getHours() - (30 * 24)); // Keep for 30 days
  }
  
  return token.updated_at < cutoffTime;
}

export function getTokensToCleanup(
  tokens: PasswordResetToken[],
  retentionHours: number = 168
): PasswordResetToken[] {
  return tokens.filter(token => shouldCleanupToken(token, retentionHours));
}

// Analytics types
export interface PasswordResetAnalytics {
  total_requests: number;
  successful_resets: number;
  expired_tokens: number;
  revoked_tokens: number;
  success_rate: number;
  average_time_to_use: number; // minutes
  most_common_source: RequestSource;
  suspicious_activity: {
    multiple_requests_same_user: number;
    multiple_requests_same_ip: number;
    admin_requested_resets: number;
  };
}

export function calculateSuccessRate(successful: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((successful / total) * 100);
}

export function calculateAverageTimeToUse(tokens: PasswordResetToken[]): number {
  const usedTokens = tokens.filter(token => token.used_at);
  if (usedTokens.length === 0) return 0;
  
  const totalMinutes = usedTokens.reduce((sum, token) => {
    const timeToUse = token.used_at!.getTime() - token.created_at.getTime();
    return sum + (timeToUse / (1000 * 60));
  }, 0);
  
  return Math.round(totalMinutes / usedTokens.length);
}

// Security monitoring
export function detectSuspiciousActivity(
  tokens: PasswordResetToken[],
  timeWindowHours: number = 24
): {
  suspicious_users: string[];
  suspicious_ips: string[];
  rapid_requests: PasswordResetToken[];
} {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - timeWindowHours);
  
  const recentTokens = tokens.filter(token => token.created_at > cutoffTime);
  
  // Group by user and IP
  const userCounts: Record<string, number> = {};
  const ipCounts: Record<string, number> = {};
  
  recentTokens.forEach(token => {
    userCounts[token.user_id] = (userCounts[token.user_id] || 0) + 1;
    if (token.ip_address) {
      ipCounts[token.ip_address] = (ipCounts[token.ip_address] || 0) + 1;
    }
  });
  
  // Find suspicious activity
  const suspicious_users = Object.entries(userCounts)
    .filter(([, count]) => count >= 5)
    .map(([userId]) => userId);
  
  const suspicious_ips = Object.entries(ipCounts)
    .filter(([, count]) => count >= 10)
    .map(([ip]) => ip);
  
  // Find rapid requests (multiple requests within 5 minutes)
  const rapid_requests = recentTokens.filter((token, index) => {
    const nextToken = recentTokens[index + 1];
    if (!nextToken || token.user_id !== nextToken.user_id) return false;
    
    const timeDiff = token.created_at.getTime() - nextToken.created_at.getTime();
    return Math.abs(timeDiff) < 5 * 60 * 1000; // 5 minutes
  });
  
  return {
    suspicious_users,
    suspicious_ips,
    rapid_requests,
  };
}

// Token builder utility
export class PasswordResetTokenBuilder {
  private data: Partial<CreatePasswordResetToken> = {};

  constructor(userId: string) {
    this.data = {
      id: crypto.randomUUID(),
      user_id: userId,
      request_source: 'web',
      status: 'active',
      attempts: 0,
      max_attempts: TOKEN_CONFIG.MAX_ATTEMPTS,
      is_one_time: true,
      requires_verification: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  withOrganization(organizationId: string): PasswordResetTokenBuilder {
    this.data.organization_id = organizationId;
    return this;
  }

  withSource(source: RequestSource): PasswordResetTokenBuilder {
    this.data.request_source = source;
    return this;
  }

  withRequest(ipAddress?: string, userAgent?: string): PasswordResetTokenBuilder {
    this.data.ip_address = ipAddress;
    this.data.user_agent = userAgent;
    return this;
  }

  withExpiry(minutesFromNow: number): PasswordResetTokenBuilder {
    this.data.expires_at = createExpiryDate(minutesFromNow);
    return this;
  }

  withAdmin(adminId: string, notes?: string): PasswordResetTokenBuilder {
    this.data.requested_by_admin = adminId;
    this.data.admin_notes = notes;
    // Admin requests get longer expiry
    this.data.expires_at = createExpiryDate(TOKEN_CONFIG.ADMIN_EXPIRY_MINUTES);
    return this;
  }

  withMetadata(metadata: Record<string, any>): PasswordResetTokenBuilder {
    this.data.metadata = serializeTokenMetadata(metadata);
    return this;
  }

  build(): { data: CreatePasswordResetToken; plainToken: string } {
    const plainToken = generateSecureToken(TOKEN_CONFIG.MIN_TOKEN_LENGTH);
    
    const finalData: CreatePasswordResetToken = {
      ...this.data,
      token_hash: createTokenHash(plainToken),
      token_partial: createTokenPartial(plainToken),
      expires_at: this.data.expires_at || createExpiryDate(TOKEN_CONFIG.DEFAULT_EXPIRY_MINUTES),
    } as CreatePasswordResetToken;

    return {
      data: finalData,
      plainToken,
    };
  }
}
