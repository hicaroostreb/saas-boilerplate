// packages/database/src/schemas/auth/account.schema.ts
// ============================================
// ACCOUNTS SCHEMA - ENTERPRISE OAUTH/PROVIDER AUTH
// ============================================

import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    
    // Provider information
    type: text('type').notNull(), // oauth, email, credentials
    provider: text('provider').notNull(), // google, github, email, etc.
    provider_account_id: text('provider_account_id').notNull(),
    
    // OAuth tokens
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'), // Unix timestamp
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    
    // OAuth session state
    session_state: text('session_state'),
    oauth_token_secret: text('oauth_token_secret'),
    oauth_token: text('oauth_token'),
    
    // Provider profile data
    provider_data: text('provider_data'), // JSON string of additional provider data
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Unique constraint for provider + provider_account_id
    providerAccountIdx: index('accounts_provider_account_idx')
      .on(table.provider, table.provider_account_id),
    
    // Performance indexes
    userIdx: index('accounts_user_idx').on(table.user_id),
    providerIdx: index('accounts_provider_idx').on(table.provider),
    typeIdx: index('accounts_type_idx').on(table.type),
    
    // Composite indexes for common queries
    userProviderIdx: index('accounts_user_provider_idx').on(table.user_id, table.provider),
    providerTypeIdx: index('accounts_provider_type_idx').on(table.provider, table.type),
    
    // Token expiration index for cleanup
    expiresIdx: index('accounts_expires_idx').on(table.expires_at),
  })
);

// Types
export type Account = typeof accounts.$inferSelect;
export type CreateAccount = typeof accounts.$inferInsert;

// Helper types for OAuth management
export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

export interface ProviderProfile {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  [key: string]: any;
}

export interface AccountWithTokens extends Account {
  is_token_expired: boolean;
  token_expires_in?: number;
}

// Token management helpers
export function isTokenExpired(account: Account): boolean {
  if (!account.expires_at) {
    return false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return now >= account.expires_at;
}

export function getTokenExpiresIn(account: Account): number | null {
  if (!account.expires_at) {
    return null;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, account.expires_at - now);
}

export function shouldRefreshToken(account: Account, bufferSeconds = 300): boolean {
  if (!account.expires_at || !account.refresh_token) {
    return false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return (account.expires_at - now) <= bufferSeconds;
}

// Provider data parser
export function parseProviderData(account: Account): ProviderProfile | null {
  if (!account.provider_data) {
    return null;
  }
  
  try {
    return JSON.parse(account.provider_data) as ProviderProfile;
  } catch {
    return null;
  }
}

export function serializeProviderData(profile: ProviderProfile): string {
  return JSON.stringify(profile);
}
