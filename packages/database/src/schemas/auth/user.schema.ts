// packages/database/src/schemas/auth/user.schema.ts
// ============================================
// USER SCHEMA - ENTERPRISE AUTH (FIXED NULL SAFETY)
// ============================================

import { boolean, index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// User status enum
export const user_status_enum = pgEnum('user_status', [
  'active',
  'inactive', 
  'suspended',
  'pending'
]);

// User role enum
export const user_role_enum = pgEnum('user_role', [
  'super_admin',
  'admin',
  'member',
  'viewer'  
]);

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    organization_id: text('organization_id'),
    
    // Basic info
    name: text('name').notNull(),
    email: text('email').notNull(),
    image: text('image'),
    
    // Auth
    email_verified: timestamp('email_verified'),
    password_hash: text('password_hash'),
    
    // Status flags
    is_active: boolean('is_active').default(true).notNull(),
    is_super_admin: boolean('is_super_admin').default(false).notNull(),
    is_email_verified: boolean('is_email_verified').default(false).notNull(),
    
    // Security tracking
    last_login_at: timestamp('last_login_at'),
    last_login_ip: text('last_login_ip'),
    login_attempts: integer('login_attempts').default(0).notNull(),
    locked_until: timestamp('locked_until'),
    
    // Profile details
    first_name: text('first_name'),
    last_name: text('last_name'),
    avatar_url: text('avatar_url'),
    timezone: text('timezone').default('UTC').notNull(),
    locale: text('locale').default('en').notNull(),
    
    // Preferences
    email_notifications: boolean('email_notifications').default(true).notNull(),
    marketing_emails: boolean('marketing_emails').default(false).notNull(),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    orgIdx: index('users_org_idx').on(table.organization_id),
    activeIdx: index('users_active_idx').on(table.is_active),
    superAdminIdx: index('users_super_admin_idx').on(table.is_super_admin),
    emailVerifiedIdx: index('users_email_verified_idx').on(table.is_email_verified),
    lastLoginIdx: index('users_last_login_idx').on(table.last_login_at),
    createdIdx: index('users_created_idx').on(table.created_at),
    updatedIdx: index('users_updated_idx').on(table.updated_at),
    deletedIdx: index('users_deleted_idx').on(table.deleted_at),
    lockedIdx: index('users_locked_idx').on(table.locked_until),
    loginAttemptsIdx: index('users_login_attempts_idx').on(table.login_attempts),
  })
);

// Types
export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
export type UserStatus = typeof user_status_enum.enumValues[number];
export type UserRole = typeof user_role_enum.enumValues[number];

// Public user type (no sensitive data)
export type PublicUser = Omit<User, 
  | 'password_hash' 
  | 'login_attempts' 
  | 'locked_until' 
  | 'last_login_ip'
  | 'email_verified'
  | 'deleted_at'
>;

// User profile for display
export type UserProfile = Pick<User,
  | 'id'
  | 'name'
  | 'email'
  | 'image'
  | 'first_name'
  | 'last_name'
  | 'avatar_url'
  | 'timezone'
  | 'locale'
  | 'is_active'
>;

// Helper functions with null safety
export function getFullName(user: Pick<User, 'first_name' | 'last_name' | 'name'>): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`.trim();
  }
  return user.name || 'Unknown User';
}

export function getDisplayName(user: Pick<User, 'first_name' | 'name'>): string {
  return user.first_name || user.name || 'Unknown User';
}

export function getInitials(user: Pick<User, 'first_name' | 'last_name' | 'name'>): string {
  if (user.first_name && user.last_name) {
    const firstName = user.first_name.trim();
    const lastName = user.last_name.trim();
    if (firstName.length > 0 && lastName.length > 0) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
  }
  
  const name = user.name || 'U';
  const parts = name.trim().split(/\s+/);
  
  if (parts.length >= 2 && parts[0] && parts[1]) {
    // Fixed null safety
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }
  
  if (parts[0] && parts[0].length >= 2) {
    // Fixed null safety
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
}

export function isUserLocked(user: Pick<User, 'locked_until'>): boolean {
  return user.locked_until ? new Date() < user.locked_until : false;
}

export function getLockoutDuration(attemptCount: number): number {
  const durations = [
    0,      // 0 attempts
    300,    // 1 attempt: 5 minutes
    900,    // 2 attempts: 15 minutes
    1800,   // 3 attempts: 30 minutes
    3600,   // 4 attempts: 1 hour
    7200,   // 5 attempts: 2 hours
    14400,  // 6 attempts: 4 hours
    28800,  // 7+ attempts: 8 hours
  ];
  
  const index = Math.min(attemptCount, durations.length - 1);
  // Fixed null safety
  return durations[index] || 0;
}

export function shouldLockUser(attemptCount: number): boolean {
  return attemptCount >= 3;
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function isValidLocale(locale: string): boolean {
  const validLocales = [
    'en', 'en-US', 'en-GB',
    'pt', 'pt-BR', 'pt-PT',
    'es', 'es-ES', 'es-MX',
    'fr', 'fr-FR',
    'de', 'de-DE',
    'it', 'it-IT',
    'ja', 'ja-JP',
    'ko', 'ko-KR',
    'zh', 'zh-CN', 'zh-TW',
  ];
  
  return validLocales.includes(locale);
}

export function formatUserForAPI(user: User): PublicUser {
  const {
    password_hash,
    login_attempts,
    locked_until,
    last_login_ip,
    email_verified,
    deleted_at,
    ...publicUser
  } = user;
  
  return publicUser;
}

export function getUserSecurityLevel(user: User): 'low' | 'medium' | 'high' {
  if (user.is_super_admin) return 'high';
  if (user.is_email_verified && user.password_hash) return 'medium';
  return 'low';
}

export function canUserPerformAction(
  user: User,
  action: 'read' | 'write' | 'admin' | 'super_admin'
): boolean {
  if (!user.is_active) return false;
  if (isUserLocked(user)) return false;
  
  switch (action) {
    case 'super_admin':
      return user.is_super_admin;
    case 'admin':
      return user.is_super_admin; // Can be extended for other admin roles
    case 'write':
      return user.is_email_verified;
    case 'read':
      return true; // All active, non-locked users can read
    default:
      return false;
  }
}
