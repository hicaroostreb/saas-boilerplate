// ============================================
// USER SCHEMA - SRP: APENAS USER TABLE
// ============================================

import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// ============================================
// USER TABLE DEFINITION
// ============================================

export const users = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 100 }),
    image: text('image'),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),

    // Enhanced auth fields
    passwordHash: text('password_hash'),
    isActive: boolean('is_active').default(true).notNull(),
    isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),

    // Metadata
    lastLoginAt: timestamp('last_login_at', { mode: 'date' }),
    lastLoginIp: varchar('last_login_ip', { length: 45 }),
    loginAttempts: varchar('login_attempts', { length: 10 }).default('0'),
    lockedUntil: timestamp('locked_until', { mode: 'date' }),

    // Profile fields
    firstName: varchar('first_name', { length: 50 }),
    lastName: varchar('last_name', { length: 50 }),
    avatarUrl: text('avatar_url'),
    timezone: varchar('timezone', { length: 50 }).default('UTC'),
    locale: varchar('locale', { length: 10 }).default('en'),

    // Preferences
    emailNotifications: boolean('email_notifications').default(true).notNull(),
    marketingEmails: boolean('marketing_emails').default(false).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
  },
  table => ({
    // Indexes for performance
    emailIdx: index('user_email_idx').on(table.email),
    activeIdx: index('user_active_idx').on(table.isActive),
    createdAtIdx: index('user_created_at_idx').on(table.createdAt),
    lastLoginIdx: index('user_last_login_idx').on(table.lastLoginAt),
  })
);

// ============================================
// USER TYPES
// ============================================

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;

// Specific user types for different contexts
export type PublicUser = Pick<
  User,
  'id' | 'name' | 'email' | 'image' | 'createdAt'
>;
export type UserProfile = Pick<
  User,
  | 'id'
  | 'name'
  | 'email'
  | 'image'
  | 'firstName'
  | 'lastName'
  | 'avatarUrl'
  | 'timezone'
  | 'locale'
>;
export type UserPreferences = Pick<
  User,
  'id' | 'emailNotifications' | 'marketingEmails' | 'timezone' | 'locale'
>;
