// ============================================
// VERIFICATION TOKEN SCHEMA - SRP: APENAS VERIFICATION TABLE
// ============================================

import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// ============================================
// VERIFICATION TOKEN TABLE (NextAuth.js)
// ============================================

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),

    // Enhanced tracking
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    usedAt: timestamp('used_at', { mode: 'date' }),
  },
  table => ({
    // Compound primary key
    compoundKey: {
      primaryKey: [table.identifier, table.token],
    },
    // Indexes
    tokenIdx: index('verification_token_idx').on(table.token),
    expiresIdx: index('verification_expires_idx').on(table.expires),
    identifierIdx: index('verification_identifier_idx').on(table.identifier),
  })
);

// ============================================
// VERIFICATION TOKEN TYPES
// ============================================

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type CreateVerificationToken = typeof verificationTokens.$inferInsert;
