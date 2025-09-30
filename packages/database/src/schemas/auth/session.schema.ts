// ============================================
// SESSION SCHEMA - SRP: APENAS SESSION TABLE
// ============================================

import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

// ============================================
// SESSION TABLE DEFINITION (NextAuth.js)
// ============================================

export const sessions = pgTable(
  'session',
  {
    sessionToken: text('sessionToken').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),

    // Enhanced session tracking
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    lastAccessedAt: timestamp('last_accessed_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
  },
  table => ({
    // Indexes for performance
    userIdIdx: index('session_user_id_idx').on(table.userId),
    expiresIdx: index('session_expires_idx').on(table.expires),
    lastAccessedIdx: index('session_last_accessed_idx').on(
      table.lastAccessedAt
    ),
  })
);

// ============================================
// SESSION TYPES
// ============================================

export type Session = typeof sessions.$inferSelect;
export type CreateSession = typeof sessions.$inferInsert;

// Session with user info
export type SessionWithUser = Session & {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};
