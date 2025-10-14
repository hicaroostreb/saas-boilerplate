// packages/database/src/schemas/auth/user.schema.ts
// ============================================
// USERS SCHEMA - ENTERPRISE MULTI-TENANT AUTH
// ============================================

import { boolean, index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// User status enum
export const user_status_enum = pgEnum('user_status', [
  'active',
  'inactive',
  'suspended',
  'pending_verification',
]);

// User role enum (global system roles)
export const user_role_enum = pgEnum('user_role', [
  'super_admin',
  'admin',
  'user',
]);

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    
    // Multi-tenancy
    organization_id: text('organization_id'), // Can be null for super admins
    
    // Basic user information
    name: text('name'),
    email: text('email').notNull().unique(),
    image: text('image'),
    
    // Email verification
    email_verified: timestamp('email_verified'),
    
    // Authentication
    password_hash: text('password_hash'), // Can be null for OAuth-only users
    
    // Status and permissions
    is_active: boolean('is_active').notNull().default(true),
    is_super_admin: boolean('is_super_admin').notNull().default(false),
    is_email_verified: boolean('is_email_verified').notNull().default(false),
    
    // Security tracking
    last_login_at: timestamp('last_login_at'),
    last_login_ip: text('last_login_ip'),
    login_attempts: integer('login_attempts').notNull().default(0),
    locked_until: timestamp('locked_until'),
    
    // Profile information
    first_name: text('first_name'),
    last_name: text('last_name'),
    avatar_url: text('avatar_url'),
    
    // Preferences
    timezone: text('timezone').notNull().default('UTC'),
    locale: text('locale').notNull().default('en'),
    
    // Communication preferences
    email_notifications: boolean('email_notifications').notNull().default(true),
    marketing_emails: boolean('marketing_emails').notNull().default(false),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'), // Soft delete
  },
  (table) => ({
    // Core indexes
    emailIdx: index('users_email_idx').on(table.email),
    orgIdx: index('users_org_idx').on(table.organization_id),
    
    // Status indexes
    activeIdx: index('users_active_idx').on(table.is_active),
    verifiedIdx: index('users_verified_idx').on(table.is_email_verified),
    superAdminIdx: index('users_super_admin_idx').on(table.is_super_admin),
    
    // Security indexes
    lockedIdx: index('users_locked_idx').on(table.locked_until),
    lastLoginIdx: index('users_last_login_idx').on(table.last_login_at),
    loginAttemptsIdx: index('users_login_attempts_idx').on(table.login_attempts),
    
    // Soft delete index
    deletedIdx: index('users_deleted_idx').on(table.deleted_at),
    
    // Composite indexes for common queries
    orgActiveIdx: index('users_org_active_idx').on(table.organization_id, table.is_active),
    emailVerifiedIdx: index('users_email_verified_idx').on(table.email, table.is_email_verified),
    orgVerifiedIdx: index('users_org_verified_idx').on(table.organization_id, table.is_email_verified),
    
    // Timestamps
    createdIdx: index('users_created_idx').on(table.created_at),
    updatedIdx: index('users_updated_idx').on(table.updated_at),
  })
);

// Types
export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
export type UpdateUser = Partial<Omit<User, 'id' | 'created_at'>>;
export type UserStatus = typeof user_status_enum.enumValues[number];
export type UserRole = typeof user_role_enum.enumValues[number];

// Public user type (safe for API responses)
export interface PublicUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  timezone: string;
  locale: string;
  created_at: Date;
}

// User profile type
export interface UserProfile {
  id: string;
  organization_id: string | null;
  name: string | null;
  email: string;
  image: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  email_notifications: boolean;
  marketing_emails: boolean;
  is_email_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Security info type (for admin views)
export interface UserSecurityInfo {
  id: string;
  email: string;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at: Date | null;
  last_login_ip: string | null;
  login_attempts: number;
  locked_until: Date | null;
  created_at: Date;
}

// User preferences type
export interface UserPreferences {
  timezone: string;
  locale: string;
  email_notifications: boolean;
  marketing_emails: boolean;
}

// Helper functions
export function isUserActive(user: User): boolean {
  return user.is_active && !user.deleted_at;
}

export function isUserLocked(user: User): boolean {
  return user.locked_until ? new Date() < user.locked_until : false;
}

export function canUserLogin(user: User): boolean {
  return (
    isUserActive(user) &&
    user.is_email_verified &&
    !isUserLocked(user)
  );
}

export function getUserDisplayName(user: User): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.name) {
    return user.name;
  }
  return user.email;
}

export function getUserInitials(user: User): string {
  const displayName = getUserDisplayName(user);
  const parts = displayName.split(' ').filter(Boolean);
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return user.email.substring(0, 2).toUpperCase();
}

export function isPasswordRequired(user: User): boolean {
  // Password is required if user doesn't have OAuth accounts
  // This would need to be checked against the accounts table
  return !user.password_hash;
}

export function shouldLockAccount(user: User): boolean {
  return user.login_attempts >= 5; // Lock after 5 failed attempts
}

export function calculateLockDuration(attempts: number): number {
  // Progressive lock duration: 5 min, 15 min, 1 hour, 4 hours, 24 hours
  const durations = [5, 15, 60, 240, 1440]; // in minutes
  const index = Math.min(attempts - 5, durations.length - 1);
  return durations[index];
}

export function createLockExpiry(attempts: number): Date {
  const duration = calculateLockDuration(attempts);
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + duration);
  return expiry;
}

// User builder utility
export class UserBuilder {
  private userData: Partial<CreateUser> = {};

  constructor(email: string) {
    this.userData = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      is_active: true,
      is_super_admin: false,
      is_email_verified: false,
      login_attempts: 0,
      timezone: 'UTC',
      locale: 'en',
      email_notifications: true,
      marketing_emails: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  withName(name: string): UserBuilder {
    this.userData.name = name;
    return this;
  }

  withProfile(firstName: string, lastName: string): UserBuilder {
    this.userData.first_name = firstName;
    this.userData.last_name = lastName;
    this.userData.name = `${firstName} ${lastName}`;
    return this;
  }

  withOrganization(organizationId: string): UserBuilder {
    this.userData.organization_id = organizationId;
    return this;
  }

  withPassword(passwordHash: string): UserBuilder {
    this.userData.password_hash = passwordHash;
    return this;
  }

  withEmailVerified(verified: boolean = true): UserBuilder {
    this.userData.is_email_verified = verified;
    this.userData.email_verified = verified ? new Date() : null;
    return this;
  }

  withSuperAdmin(isSuperAdmin: boolean = true): UserBuilder {
    this.userData.is_super_admin = isSuperAdmin;
    return this;
  }

  withPreferences(preferences: Partial<UserPreferences>): UserBuilder {
    if (preferences.timezone) this.userData.timezone = preferences.timezone;
    if (preferences.locale) this.userData.locale = preferences.locale;
    if (preferences.email_notifications !== undefined) {
      this.userData.email_notifications = preferences.email_notifications;
    }
    if (preferences.marketing_emails !== undefined) {
      this.userData.marketing_emails = preferences.marketing_emails;
    }
    return this;
  }

  withImage(imageUrl: string): UserBuilder {
    this.userData.image = imageUrl;
    this.userData.avatar_url = imageUrl;
    return this;
  }

  build(): CreateUser {
    return this.userData as CreateUser;
  }
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Data transformation helpers
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar_url: user.avatar_url,
    is_active: user.is_active,
    is_email_verified: user.is_email_verified,
    timezone: user.timezone,
    locale: user.locale,
    created_at: user.created_at,
  };
}

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    organization_id: user.organization_id,
    name: user.name,
    email: user.email,
    image: user.image,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar_url: user.avatar_url,
    timezone: user.timezone,
    locale: user.locale,
    email_notifications: user.email_notifications,
    marketing_emails: user.marketing_emails,
    is_email_verified: user.is_email_verified,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export function toSecurityInfo(user: User): UserSecurityInfo {
  return {
    id: user.id,
    email: user.email,
    is_active: user.is_active,
    is_email_verified: user.is_email_verified,
    last_login_at: user.last_login_at,
    last_login_ip: user.last_login_ip,
    login_attempts: user.login_attempts,
    locked_until: user.locked_until,
    created_at: user.created_at,
  };
}

// Search helpers
export function createUserSearchTerms(user: User): string[] {
  return [
    user.email,
    user.name,
    user.first_name,
    user.last_name,
    `${user.first_name} ${user.last_name}`,
  ].filter((term): term is string => Boolean(term));
}

export function matchesSearchTerm(user: User, searchTerm: string): boolean {
  const searchTerms = createUserSearchTerms(user);
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return searchTerms.some(term => 
    term.toLowerCase().includes(normalizedSearch)
  );
}
