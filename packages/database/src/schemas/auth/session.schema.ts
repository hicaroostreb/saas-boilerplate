// packages/database/src/schemas/auth/session.schema.ts
// ============================================
// SESSIONS SCHEMA - ENTERPRISE AUTH
// ============================================

import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const sessions = pgTable(
  'sessions',
  {
    session_token: text('session_token').primaryKey(),
    user_id: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires').notNull(),
    
    // Session tracking
    created_at: timestamp('created_at').notNull().defaultNow(),
    last_accessed_at: timestamp('last_accessed_at').notNull().defaultNow(),
    
    // Security context
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
  },
  (table) => ({
    // Performance indexes
    userIdx: index('sessions_user_idx').on(table.user_id),
    expiresIdx: index('sessions_expires_idx').on(table.expires),
    lastAccessedIdx: index('sessions_last_accessed_idx').on(table.last_accessed_at),
    
    // Security indexes
    ipIdx: index('sessions_ip_idx').on(table.ip_address),
    
    // Composite indexes for common queries
    userExpiresIdx: index('sessions_user_expires_idx').on(table.user_id, table.expires),
    activeSessionsIdx: index('sessions_active_idx').on(table.user_id, table.expires, table.last_accessed_at),
  })
);

// Types
export type Session = typeof sessions.$inferSelect;
export type CreateSession = typeof sessions.$inferInsert;

// Helper types for session management
export interface SessionWithUser {
  session_token: string;
  user_id: string;
  expires: Date;
  created_at: Date;
  last_accessed_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    is_active: boolean;
  };
}

export interface SessionSummary {
  total_sessions: number;
  active_sessions: number;
  expired_sessions: number;
  unique_users: number;
  unique_ips: number;
}

// Session validation helpers
export function isSessionExpired(session: Session): boolean {
  return new Date() > session.expires;
}

export function isSessionActive(session: Session, maxInactiveMinutes = 60): boolean {
  if (isSessionExpired(session)) {
    return false;
  }
  
  const maxInactiveMs = maxInactiveMinutes * 60 * 1000;
  const inactiveDuration = Date.now() - session.last_accessed_at.getTime();
  
  return inactiveDuration <= maxInactiveMs;
}

export function getSessionTimeRemaining(session: Session): number {
  const now = Date.now();
  const expiresMs = session.expires.getTime();
  return Math.max(0, expiresMs - now);
}
