// packages/database/src/entities/auth/user.entity.ts
// ============================================
// USER ENTITY - ENTERPRISE DOMAIN MODEL
// ============================================

import type { User } from '../../schemas/auth';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly organization_id: string | null,
    public readonly name: string | null,
    public readonly email: string,
    public readonly image: string | null,
    public readonly email_verified: Date | null,
    public readonly password_hash: string | null,
    public readonly is_active: boolean,
    public readonly is_super_admin: boolean,
    public readonly is_email_verified: boolean,
    public readonly last_login_at: Date | null,
    public readonly last_login_ip: string | null,
    public readonly login_attempts: number,
    public readonly locked_until: Date | null,
    public readonly first_name: string | null,
    public readonly last_name: string | null,
    public readonly avatar_url: string | null,
    public readonly timezone: string,
    public readonly locale: string,
    public readonly email_notifications: boolean,
    public readonly marketing_emails: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date,
    public readonly deleted_at: Date | null
  ) {}

  static fromDatabase(data: User): UserEntity {
    return new UserEntity(
      data.id,
      data.organization_id,
      data.name,
      data.email,
      data.image,
      data.email_verified,
      data.password_hash,
      data.is_active,
      data.is_super_admin,
      data.is_email_verified,
      data.last_login_at,
      data.last_login_ip,
      data.login_attempts,
      data.locked_until,
      data.first_name,
      data.last_name,
      data.avatar_url,
      data.timezone,
      data.locale,
      data.email_notifications,
      data.marketing_emails,
      data.created_at,
      data.updated_at,
      data.deleted_at
    );
  }

  toDatabase(): Omit<User, never> {
    return {
      id: this.id,
      organization_id: this.organization_id,
      name: this.name,
      email: this.email,
      image: this.image,
      email_verified: this.email_verified,
      password_hash: this.password_hash,
      is_active: this.is_active,
      is_super_admin: this.is_super_admin,
      is_email_verified: this.is_email_verified,
      last_login_at: this.last_login_at,
      last_login_ip: this.last_login_ip,
      login_attempts: this.login_attempts,
      locked_until: this.locked_until,
      first_name: this.first_name,
      last_name: this.last_name,
      avatar_url: this.avatar_url,
      timezone: this.timezone,
      locale: this.locale,
      email_notifications: this.email_notifications,
      marketing_emails: this.marketing_emails,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
    };
  }

  get fullName(): string {
    if (this.first_name && this.last_name) {
      return `${this.first_name} ${this.last_name}`;
    }
    return this.name || this.email;
  }

  get isLocked(): boolean {
    return this.locked_until ? new Date() < this.locked_until : false;
  }

  get canLogin(): boolean {
    return this.is_active && this.is_email_verified && !this.isLocked && !this.deleted_at;
  }

  isOwnerOf(organizationId: string): boolean {
    return this.organization_id === organizationId && this.is_super_admin;
  }
}

export class UserEntityBuilder {
  private data: Partial<User> = {};

  constructor(email: string) {
    this.data = {
      id: crypto.randomUUID(),
      email,
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
      deleted_at: null,
    };
  }

  withId(id: string): UserEntityBuilder {
    this.data.id = id;
    return this;
  }

  withOrganization(organizationId: string): UserEntityBuilder {
    this.data.organization_id = organizationId;
    return this;
  }

  withName(name: string): UserEntityBuilder {
    this.data.name = name;
    return this;
  }

  withPassword(passwordHash: string): UserEntityBuilder {
    this.data.password_hash = passwordHash;
    return this;
  }

  withEmailVerified(verified: boolean = true): UserEntityBuilder {
    this.data.is_email_verified = verified;
    this.data.email_verified = verified ? new Date() : null;
    return this;
  }

  withSuperAdmin(isSuperAdmin: boolean = true): UserEntityBuilder {
    this.data.is_super_admin = isSuperAdmin;
    return this;
  }

  withProfile(firstName: string, lastName: string): UserEntityBuilder {
    this.data.first_name = firstName;
    this.data.last_name = lastName;
    return this;
  }

  withTimezone(timezone: string): UserEntityBuilder {
    this.data.timezone = timezone;
    return this;
  }

  withLocale(locale: string): UserEntityBuilder {
    this.data.locale = locale;
    return this;
  }

  build(): UserEntity {
    if (!this.data.email) {
      throw new Error('Email is required to build UserEntity');
    }

    return UserEntity.fromDatabase(this.data as User);
  }
}
