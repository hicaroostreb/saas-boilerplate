// packages/database/src/schemas/security/rate-limit.schema.ts
// ============================================
// RATE LIMITS SCHEMA - ENTERPRISE RATE LIMITING
// ============================================

import { index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Rate limit types
export const rate_limit_type_enum = pgEnum('rate_limit_type', [
  'api_request',
  'login_attempt',
  'password_reset',
  'email_send',
  'file_upload',
  'search_query',
  'export_data',
  'invitation_send',
  'contact_create',
  'project_create',
]);

// Time window types
export const rate_limit_window_enum = pgEnum('rate_limit_window', [
  'minute',
  'hour', 
  'day',
  'month',
]);

export const rate_limits = pgTable(
  'rate_limits',
  {
    id: text('id').primaryKey(),
    
    // What is being rate limited
    type: rate_limit_type_enum('type').notNull(),
    identifier: text('identifier').notNull(), // IP, user_id, API key, etc.
    
    // Rate limiting context
    organization_id: text('organization_id'), // Optional organization context
    user_id: text('user_id'), // Optional user context
    
    // Rate limiting configuration
    window_type: rate_limit_window_enum('window_type').notNull(),
    window_size: integer('window_size').notNull().default(1), // Number of window units
    max_requests: integer('max_requests').notNull(),
    
    // Current state
    current_count: integer('current_count').notNull().default(0),
    window_start: timestamp('window_start').notNull(),
    window_end: timestamp('window_end').notNull(),
    
    // Tracking
    first_request_at: timestamp('first_request_at').notNull(),
    last_request_at: timestamp('last_request_at').notNull(),
    
    // Metadata
    metadata: text('metadata'), // JSON string for additional context
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Primary access pattern
    typeIdentifierIdx: index('rate_limits_type_identifier_idx')
      .on(table.type, table.identifier),
    
    // Performance indexes
    typeIdx: index('rate_limits_type_idx').on(table.type),
    identifierIdx: index('rate_limits_identifier_idx').on(table.identifier),
    orgIdx: index('rate_limits_org_idx').on(table.organization_id),
    userIdx: index('rate_limits_user_idx').on(table.user_id),
    
    // Window management
    windowEndIdx: index('rate_limits_window_end_idx').on(table.window_end),
    windowTypeIdx: index('rate_limits_window_type_idx').on(table.window_type),
    
    // Composite indexes for lookups
    typeOrgIdx: index('rate_limits_type_org_idx').on(table.type, table.organization_id),
    typeUserIdx: index('rate_limits_type_user_idx').on(table.type, table.user_id),
    identifierOrgIdx: index('rate_limits_identifier_org_idx')
      .on(table.identifier, table.organization_id),
    
    // Cleanup indexes
    expiredWindowsIdx: index('rate_limits_expired_windows_idx')
      .on(table.window_end, table.updated_at),
    
    // Timestamps
    createdIdx: index('rate_limits_created_idx').on(table.created_at),
    updatedIdx: index('rate_limits_updated_idx').on(table.updated_at),
  })
);

// Types
export type RateLimit = typeof rate_limits.$inferSelect;
export type CreateRateLimit = typeof rate_limits.$inferInsert;
export type RateLimitType = typeof rate_limit_type_enum.enumValues[number];
export type RateLimitWindow = typeof rate_limit_window_enum.enumValues[number];

// Configuration types
export interface RateLimitConfig {
  type: RateLimitType;
  window_type: RateLimitWindow;
  window_size: number;
  max_requests: number;
  burst_allowance?: number; // Allow temporary bursts
  global_limit?: number; // Global limit across all identifiers
}

// Result types
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset_time: Date;
  retry_after?: number; // Seconds until retry is allowed
  current_window_requests: number;
}

// Default rate limit configurations
export const DEFAULT_RATE_LIMITS: Record<RateLimitType, RateLimitConfig> = {
  api_request: {
    type: 'api_request',
    window_type: 'minute',
    window_size: 1,
    max_requests: 100,
  },
  login_attempt: {
    type: 'login_attempt',
    window_type: 'hour',
    window_size: 1,
    max_requests: 10,
  },
  password_reset: {
    type: 'password_reset',
    window_type: 'hour',
    window_size: 1,
    max_requests: 3,
  },
  email_send: {
    type: 'email_send',
    window_type: 'hour',
    window_size: 1,
    max_requests: 50,
  },
  file_upload: {
    type: 'file_upload',
    window_type: 'minute',
    window_size: 1,
    max_requests: 10,
  },
  search_query: {
    type: 'search_query',
    window_type: 'minute',
    window_size: 1,
    max_requests: 30,
  },
  export_data: {
    type: 'export_data',
    window_type: 'hour',
    window_size: 1,
    max_requests: 5,
  },
  invitation_send: {
    type: 'invitation_send',
    window_type: 'day',
    window_size: 1,
    max_requests: 20,
  },
  contact_create: {
    type: 'contact_create',
    window_type: 'hour',
    window_size: 1,
    max_requests: 100,
  },
  project_create: {
    type: 'project_create',
    window_type: 'day',
    window_size: 1,
    max_requests: 10,
  },
};

// Helper functions
export function isRateLimitExceeded(rateLimit: RateLimit): boolean {
  return rateLimit.current_count >= rateLimit.max_requests;
}

export function isWindowExpired(rateLimit: RateLimit): boolean {
  return new Date() > rateLimit.window_end;
}

export function getRemainingRequests(rateLimit: RateLimit): number {
  return Math.max(0, rateLimit.max_requests - rateLimit.current_count);
}

export function getRetryAfterSeconds(rateLimit: RateLimit): number {
  if (!isRateLimitExceeded(rateLimit)) return 0;
  
  const now = Date.now();
  const windowEnd = rateLimit.window_end.getTime();
  
  return Math.max(0, Math.ceil((windowEnd - now) / 1000));
}

// Window calculation
export function calculateWindowBounds(
  windowType: RateLimitWindow,
  windowSize: number,
  baseTime = new Date()
): { start: Date; end: Date } {
  const start = new Date(baseTime);
  const end = new Date(baseTime);
  
  switch (windowType) {
    case 'minute':
      start.setSeconds(0, 0);
      end.setTime(start.getTime() + windowSize * 60 * 1000);
      break;
    case 'hour':
      start.setMinutes(0, 0, 0);
      end.setTime(start.getTime() + windowSize * 60 * 60 * 1000);
      break;
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setTime(start.getTime() + windowSize * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + windowSize);
      break;
  }
  
  return { start, end };
}

export function shouldResetWindow(rateLimit: RateLimit): boolean {
  return isWindowExpired(rateLimit);
}

export function createWindowReset(
  rateLimit: RateLimit,
  baseTime = new Date()
): Partial<RateLimit> {
  const { start, end } = calculateWindowBounds(
    rateLimit.window_type,
    rateLimit.window_size,
    baseTime
  );
  
  return {
    current_count: 0,
    window_start: start,
    window_end: end,
    updated_at: baseTime,
  };
}

// Rate limit checking
export function checkRateLimit(
  rateLimit: RateLimit,
  requestTime = new Date()
): RateLimitResult {
  let currentLimit = rateLimit;
  
  // Reset window if expired
  if (isWindowExpired(currentLimit)) {
    const reset = createWindowReset(currentLimit, requestTime);
    currentLimit = { ...currentLimit, ...reset };
  }
  
  const allowed = !isRateLimitExceeded(currentLimit);
  const remaining = getRemainingRequests(currentLimit);
  const retryAfter = allowed ? undefined : getRetryAfterSeconds(currentLimit);
  
  return {
    allowed,
    limit: currentLimit.max_requests,
    remaining: allowed ? remaining - 1 : remaining, // Account for current request
    reset_time: currentLimit.window_end,
    retry_after: retryAfter,
    current_window_requests: currentLimit.current_count + (allowed ? 1 : 0),
  };
}

// Identifier generation
export function createIdentifier(
  type: 'ip' | 'user' | 'api_key' | 'organization',
  value: string
): string {
  return `${type}:${value}`;
}

export function createUserIdentifier(userId: string): string {
  return createIdentifier('user', userId);
}

export function createIPIdentifier(ipAddress: string): string {
  return createIdentifier('ip', ipAddress);
}

export function createOrganizationIdentifier(organizationId: string): string {
  return createIdentifier('organization', organizationId);
}

export function createAPIKeyIdentifier(apiKey: string): string {
  // Use hash for security
  const hash = Array.from(new Uint8Array(
    crypto.subtle ? 
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey)) :
    Buffer.from(apiKey).subarray(0, 8) // Fallback
  )).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return createIdentifier('api_key', hash);
}

// Metadata helpers
export function parseMetadata(rateLimit: RateLimit): Record<string, any> | null {
  if (!rateLimit.metadata) return null;
  
  try {
    return JSON.parse(rateLimit.metadata);
  } catch {
    return null;
  }
}

export function serializeMetadata(metadata: Record<string, any>): string {
  return JSON.stringify(metadata);
}

// Burst handling
export function calculateBurstAllowance(
  config: RateLimitConfig,
  currentCount: number,
  windowProgress: number // 0-1, how far through window we are
): number {
  if (!config.burst_allowance) return 0;
  
  // Allow burst early in window, taper off
  const burstFactor = Math.max(0, 1 - windowProgress);
  const availableBurst = Math.floor(config.burst_allowance * burstFactor);
  
  return Math.max(0, availableBurst);
}

export function getWindowProgress(rateLimit: RateLimit): number {
  const now = Date.now();
  const start = rateLimit.window_start.getTime();
  const end = rateLimit.window_end.getTime();
  
  if (now <= start) return 0;
  if (now >= end) return 1;
  
  return (now - start) / (end - start);
}

// Cleanup utilities
export function isExpiredRateLimit(rateLimit: RateLimit, cleanupDelayHours = 24): boolean {
  const cleanupTime = new Date();
  cleanupTime.setHours(cleanupTime.getHours() - cleanupDelayHours);
  
  return rateLimit.window_end < cleanupTime;
}

export function shouldCleanupRateLimit(rateLimit: RateLimit): boolean {
  return isExpiredRateLimit(rateLimit) && rateLimit.current_count === 0;
}

// Analytics
export interface RateLimitStats {
  total_limits: number;
  active_limits: number;
  exceeded_limits: number;
  most_limited_type: RateLimitType;
  most_limited_identifier: string;
  average_usage_percentage: number;
}

export function calculateUsagePercentage(rateLimit: RateLimit): number {
  return Math.round((rateLimit.current_count / rateLimit.max_requests) * 100);
}

export function isHighUsage(rateLimit: RateLimit, threshold = 80): boolean {
  return calculateUsagePercentage(rateLimit) >= threshold;
}

// Configuration validation
export function validateRateLimitConfig(config: RateLimitConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (config.window_size <= 0) {
    errors.push('Window size must be greater than 0');
  }
  
  if (config.max_requests <= 0) {
    errors.push('Max requests must be greater than 0');
  }
  
  if (config.burst_allowance && config.burst_allowance >= config.max_requests) {
    errors.push('Burst allowance must be less than max requests');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Integration helpers
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset_time.getTime() / 1000).toString(),
    ...(result.retry_after ? { 'Retry-After': result.retry_after.toString() } : {}),
  };
}

export function createRateLimitError(result: RateLimitResult): {
  message: string;
  code: string;
  details: Record<string, any>;
} {
  return {
    message: 'Rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED',
    details: {
      limit: result.limit,
      remaining: result.remaining,
      reset_time: result.reset_time,
      retry_after: result.retry_after,
    },
  };
}
