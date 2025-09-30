// ============================================
// ACCOUNT SCHEMA - SRP: APENAS ACCOUNT TABLE
// ============================================

import { index, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

// ============================================
// ACCOUNT TABLE DEFINITION (NextAuth.js)
// ============================================

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  table => ({
    // Compound primary key
    compoundKey: {
      primaryKey: [table.provider, table.providerAccountId],
    },
    // Indexes
    userIdIdx: index('account_user_id_idx').on(table.userId),
    providerIdx: index('account_provider_idx').on(table.provider),
  })
);

// ============================================
// ACCOUNT TYPES
// ============================================

export type Account = typeof accounts.$inferSelect;
export type CreateAccount = typeof accounts.$inferInsert;

// Provider-specific types
export type GoogleAccount = Account & { provider: 'google' };
export type GitHubAccount = Account & { provider: 'github' };
export type CredentialsAccount = Account & { provider: 'credentials' };
