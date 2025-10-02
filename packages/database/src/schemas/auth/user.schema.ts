// packages/database/src/schemas/auth/user.schema.ts

import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Multi-tenancy
    organizationId: text('organization_id'), // ✅ REMOVED REFERENCE - fix circular

    // Basic info
    name: varchar('name', { length: 100 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    image: text('image'),
    emailVerified: timestamp('email_verified', { mode: 'date' }),

    // Password & security
    passwordHash: text('password_hash'),

    // Account status
    isActive: boolean('is_active').default(true).notNull(),
    isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),

    // Security tracking
    lastLoginAt: timestamp('last_login_at', { mode: 'date' }),
    lastLoginIp: varchar('last_login_ip', { length: 45 }),
    loginAttempts: text('login_attempts').default('0').notNull(),
    lockedUntil: timestamp('locked_until', { mode: 'date' }),

    // Profile
    firstName: varchar('first_name', { length: 50 }),
    lastName: varchar('last_name', { length: 50 }),
    avatarUrl: text('avatar_url'),

    // Preferences
    timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
    locale: varchar('locale', { length: 10 }).default('en').notNull(),
    emailNotifications: boolean('email_notifications').default(true).notNull(),
    marketingEmails: boolean('marketing_emails').default(false).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
  },
  table => ({
    emailIdx: uniqueIndex('user_email_idx').on(table.email),
    organizationIdx: index('user_organization_idx').on(table.organizationId),
    activeIdx: index('user_active_idx').on(table.isActive),
    createdAtIdx: index('user_created_at_idx').on(table.createdAt),
  })
);

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;

// Specific user types
export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'image' | 'createdAt'>;
export type UserProfile = Pick<User, 'id' | 'name' | 'email' | 'image' | 'firstName' | 'lastName' | 'avatarUrl' | 'timezone' | 'locale'>;
export type UserPreferences = Pick<User, 'id' | 'timezone' | 'locale' | 'emailNotifications' | 'marketingEmails'>;
