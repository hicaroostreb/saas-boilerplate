// packages/database/src/entities/auth/user.entity.ts
// ============================================
// USER ENTITY - ENTERPRISE DOMAIN MODEL (FIXED IMPORT)
// ============================================

import type { User, PublicUser, UserProfile } from '../../schemas';

export class UserEntity {
  private readonly user: User;

  constructor(user: User) {
    this.user = user;
  }

  // Getters
  get id(): string {
    return this.user.id;
  }

  get email(): string {
    return this.user.email;
  }

  get name(): string {
    // Fixed null safety
    return this.user.name || 'Unknown User';
  }

  get isActive(): boolean {
    return this.user.is_active;
  }

  get isSuperAdmin(): boolean {
    return this.user.is_super_admin;
  }

  get isEmailVerified(): boolean {
    return this.user.is_email_verified;
  }

  get organizationId(): string | null {
    return this.user.organization_id;
  }

  get createdAt(): Date {
    return this.user.created_at;
  }

  get lastLoginAt(): Date | null {
    return this.user.last_login_at;
  }

  // Business logic methods
  isLocked(): boolean {
    return this.user.locked_until ? new Date() < this.user.locked_until : false;
  }

  canLogin(): boolean {
    return this.user.is_active && this.user.is_email_verified && !this.isLocked();
  }

  hasExceededLoginAttempts(): boolean {
    return this.user.login_attempts >= 5;
  }

  // Data transformation
  toDatabase(): User {
    return this.user;
  }

  toPublic(): PublicUser {
    const {
      password_hash,
      login_attempts,
      locked_until,
      last_login_ip,
      email_verified,
      deleted_at,
      ...publicData
    } = this.user;

    return {
      ...publicData,
      name: this.name, // Use the fixed name getter
    };
  }

  toProfile(): UserProfile {
    return {
      id: this.user.id,
      name: this.name, // Use the fixed name getter
      email: this.user.email,
      image: this.user.image,
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      avatar_url: this.user.avatar_url,
      timezone: this.user.timezone,
      locale: this.user.locale,
      is_active: this.user.is_active,
    };
  }

  // Static factory methods
  static fromDatabase(user: User): UserEntity {
    return new UserEntity(user);
  }

  static create(userData: Partial<User> & { email: string }): UserEntity {
    const user: User = {
      id: userData.id || crypto.randomUUID(),
      organization_id: userData.organization_id || null,
      name: userData.name || userData.email, // Fallback to email if no name
      email: userData.email,
      image: userData.image || null,
      email_verified: userData.email_verified || null,
      password_hash: userData.password_hash || null,
      is_active: userData.is_active ?? true,
      is_super_admin: userData.is_super_admin ?? false,
      is_email_verified: userData.is_email_verified ?? false,
      last_login_at: userData.last_login_at || null,
      last_login_ip: userData.last_login_ip || null,
      login_attempts: userData.login_attempts || 0,
      locked_until: userData.locked_until || null,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      avatar_url: userData.avatar_url || null,
      timezone: userData.timezone || 'UTC',
      locale: userData.locale || 'en',
      email_notifications: userData.email_notifications ?? true,
      marketing_emails: userData.marketing_emails ?? false,
      created_at: userData.created_at || new Date(),
      updated_at: userData.updated_at || new Date(),
      deleted_at: userData.deleted_at || null,
    };

    return new UserEntity(user);
  }
}
