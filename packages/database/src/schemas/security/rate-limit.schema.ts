// packages/database/src/schemas/security/rate-limit.schema.ts
// ============================================
// RATE LIMITS SCHEMA - ENTERPRISE RATE LIMITING (FIXED)
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

// Result types
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset_time: Date;
  retry_after?: number; // Seconds until retry is allowed
  current_window_requests: number;
}

// Helper functions (NO DUPLICATES)
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

// Identifier generation (FIXED ASYNC)
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

// FIXED: Made async and simplified
export async function createAPIKeyIdentifier(apiKey: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey));
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return createIdentifier('api_key', hashHex.substring(0, 16));
    }
  } catch {
    // Fallback
  }
  
  // Simple hash fallback
  let hash = 0;
  for (let i = 0; i < apiKey.length; i++) {
    const char = apiKey.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return createIdentifier('api_key', Math.abs(hash).toString(16));
}
