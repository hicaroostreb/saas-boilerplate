// packages/database/src/entities/auth/user.entity.ts
// ============================================
// USER ENTITY - ENTERPRISE DOMAIN MODEL (REFACTORED)
// ============================================

import type { User } from '../../schemas/auth';

export interface PublicUser {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  image: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  is_active: boolean;
  is_super_admin: boolean;
  is_email_verified: boolean;
  created_at: Date;
}

export interface UserProfile {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  image: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  is_active: boolean;
}

export class UserEntity {
  private readonly user: User;

  constructor(user: User) {
    this.user = user;
  }

  get id(): string {
    return this.user.id;
  }

  get tenantId(): string {
    return this.user.tenant_id;
  }

  get email(): string {
    return this.user.email;
  }

  get name(): string {
    return this.user.name || 'Unknown User';
  }

  get firstName(): string | null {
    return this.user.first_name;
  }

  get lastName(): string | null {
    return this.user.last_name;
  }

  get fullName(): string {
    if (this.user.first_name && this.user.last_name) {
      return `${this.user.first_name} ${this.user.last_name}`;
    }
    return this.name;
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

  get createdAt(): Date {
    return this.user.created_at;
  }

  get lastLoginAt(): Date | null {
    return this.user.last_login_at;
  }

  get timezone(): string {
    return this.user.timezone;
  }

  get locale(): string {
    return this.user.locale;
  }

  get avatarUrl(): string | null {
    return this.user.avatar_url;
  }

  isLocked(): boolean {
    return this.user.locked_until ? new Date() < this.user.locked_until : false;
  }

  canLogin(): boolean {
    return (
      this.user.is_active && this.user.is_email_verified && !this.isLocked()
    );
  }

  hasExceededLoginAttempts(): boolean {
    return this.user.login_attempts >= 5;
  }

  needsPasswordChange(): boolean {
    return !this.user.password_hash;
  }

  toDatabase(): User {
    return this.user;
  }

  toPublic(): PublicUser {
    return {
      id: this.user.id,
      tenant_id: this.user.tenant_id,
      name: this.name,
      email: this.user.email,
      image: this.user.image,
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      avatar_url: this.user.avatar_url,
      timezone: this.user.timezone,
      locale: this.user.locale,
      is_active: this.user.is_active,
      is_super_admin: this.user.is_super_admin,
      is_email_verified: this.user.is_email_verified,
      created_at: this.user.created_at,
    };
  }

  toProfile(): UserProfile {
    return {
      id: this.user.id,
      tenant_id: this.user.tenant_id,
      name: this.name,
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

  static fromDatabase(user: User): UserEntity {
    return new UserEntity(user);
  }

  static create(
    userData: Partial<User> & { tenant_id: string; email: string }
  ): UserEntity {
    const now = new Date();

    const user: User = {
      id: userData.id || crypto.randomUUID(),
      tenant_id: userData.tenant_id,
      name: userData.name || userData.email,
      email: userData.email.toLowerCase(),
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
      phone: userData.phone || null,
      phone_verified_at: userData.phone_verified_at || null,
      email_notifications: userData.email_notifications ?? true,
      marketing_emails: userData.marketing_emails ?? false,
      metadata: userData.metadata || null,
      created_at: userData.created_at || now,
      updated_at: userData.updated_at || now,
      deleted_at: userData.deleted_at || null,
    };

    return new UserEntity(user);
  }

  updateLoginAttempts(attempts: number): UserEntity {
    return new UserEntity({
      ...this.user,
      login_attempts: attempts,
      updated_at: new Date(),
    });
  }

  lockAccount(duration: number = 15): UserEntity {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + duration);

    return new UserEntity({
      ...this.user,
      locked_until: lockUntil,
      updated_at: new Date(),
    });
  }

  unlockAccount(): UserEntity {
    return new UserEntity({
      ...this.user,
      locked_until: null,
      login_attempts: 0,
      updated_at: new Date(),
    });
  }

  updateLastLogin(ipAddress: string): UserEntity {
    return new UserEntity({
      ...this.user,
      last_login_at: new Date(),
      last_login_ip: ipAddress,
      login_attempts: 0,
      locked_until: null,
      updated_at: new Date(),
    });
  }

  verifyEmail(): UserEntity {
    return new UserEntity({
      ...this.user,
      is_email_verified: true,
      email_verified: new Date(),
      updated_at: new Date(),
    });
  }

  updateProfile(data: {
    name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    timezone?: string;
    locale?: string;
  }): UserEntity {
    return new UserEntity({
      ...this.user,
      ...data,
      updated_at: new Date(),
    });
  }
}
