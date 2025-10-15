// packages/database/src/schemas/auth/account.schema.ts
// ============================================
// ACCOUNTS SCHEMA - ENTERPRISE MULTI-TENANT (REFACTORED)
// OAuth/SSO Provider Accounts
// ============================================

import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    tenant_id: text('tenant_id').notNull(), // ✅ ADICIONADO
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // OAuth provider info
    type: text('type').notNull(), // oauth, oidc, email, credentials
    provider: text('provider').notNull(), // google, github, azure, etc
    provider_account_id: text('provider_account_id').notNull(),

    // OAuth tokens
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),

    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    // ✅ REFATORADO - tenant_id sempre primeiro
    tenantUserIdx: index('accounts_tenant_user_idx').on(
      table.tenant_id,
      table.user_id
    ),
    tenantProviderIdx: index('accounts_tenant_provider_idx').on(
      table.tenant_id,
      table.provider
    ),

    // Performance indexes
    userIdx: index('accounts_user_idx').on(table.user_id),
    providerIdx: index('accounts_provider_idx').on(table.provider),

    // Unique constraint per provider
    providerAccountIdx: index('accounts_provider_account_idx').on(
      table.provider,
      table.provider_account_id
    ),
  })
);

// Types
export type Account = typeof accounts.$inferSelect;
export type CreateAccount = typeof accounts.$inferInsert;
