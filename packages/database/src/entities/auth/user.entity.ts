// ============================================
// USER ENTITY - SRP: APENAS USER DOMAIN LOGIC
// ============================================

import type { User } from '../../schemas/auth';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly image: string | null,
    public readonly emailVerified: Date | null,
    public readonly passwordHash: string | null,
    public readonly isActive: boolean,
    public readonly isSuperAdmin: boolean,
    public readonly isEmailVerified: boolean,
    public readonly lastLoginAt: Date | null,
    public readonly lastLoginIp: string | null,
    public readonly loginAttempts: string,
    public readonly lockedUntil: Date | null,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly avatarUrl: string | null,
    public readonly timezone: string,
    public readonly locale: string,
    public readonly emailNotifications: boolean,
    public readonly marketingEmails: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {}

  // ============================================
  // FACTORY METHODS
  // ============================================

  static fromDatabase(data: User): UserEntity {
    return new UserEntity(
      data.id,
      data.email,
      data.name,
      data.image,
      data.emailVerified,
      data.passwordHash,
      data.isActive,
      data.isSuperAdmin,
      data.isEmailVerified,
      data.lastLoginAt,
      data.lastLoginIp,
      data.loginAttempts || '0',
      data.lockedUntil,
      data.firstName,
      data.lastName,
      data.avatarUrl,
      data.timezone || 'UTC', // ✅ FIXED: Default fallback
      data.locale || 'en', // ✅ FIXED: Default fallback
      data.emailNotifications,
      data.marketingEmails,
      data.createdAt,
      data.updatedAt,
      data.deletedAt
    );
  }

  static create(data: {
    email: string;
    name?: string | null;
    image?: string | null;
    passwordHash?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    timezone?: string;
    locale?: string;
  }): UserEntity {
    const now = new Date();

    return new UserEntity(
      crypto.randomUUID(),
      data.email,
      data.name || null,
      data.image || null,
      null, // emailVerified
      data.passwordHash || null,
      true, // isActive
      false, // isSuperAdmin
      false, // isEmailVerified
      null, // lastLoginAt
      null, // lastLoginIp
      '0', // loginAttempts
      null, // lockedUntil
      data.firstName || null,
      data.lastName || null,
      null, // avatarUrl
      data.timezone || 'UTC',
      data.locale || 'en',
      true, // emailNotifications
      false, // marketingEmails
      now, // createdAt
      now, // updatedAt
      null // deletedAt
    );
  }

  // ============================================
  // BUSINESS METHODS
  // ============================================

  getDisplayName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    // ✅ FIXED: Proper type handling
    const fallbackName = this.name || this.email.split('@')[0] || 'User';
    return fallbackName;
  }

  getInitials(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName[0]}${this.lastName[0]}`.toUpperCase();
    }
    if (this.name) {
      const parts = this.name.split(' ');
      if (parts.length > 1 && parts[0] && parts[1]) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return (
        parts[0]?.[0]?.toUpperCase() ?? this.email[0]?.toUpperCase() ?? 'U'
      );
    }
    return this.email[0]?.toUpperCase() ?? 'U';
  }

  isLocked(): boolean {
    return this.lockedUntil !== null && this.lockedUntil > new Date();
  }

  canLogin(): boolean {
    return this.isActive && !this.isLocked() && this.passwordHash !== null;
  }

  needsPasswordReset(): boolean {
    return this.passwordHash === null;
  }

  shouldReceiveEmails(): boolean {
    return this.isActive && this.emailNotifications;
  }

  shouldReceiveMarketing(): boolean {
    return this.isActive && this.marketingEmails && this.emailNotifications;
  }

  // ... resto dos métodos igual ao anterior ...

  // ============================================
  // SERIALIZATION
  // ============================================

  toDatabase(): User {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      image: this.image,
      emailVerified: this.emailVerified,
      passwordHash: this.passwordHash,
      isActive: this.isActive,
      isSuperAdmin: this.isSuperAdmin,
      isEmailVerified: this.isEmailVerified,
      lastLoginAt: this.lastLoginAt,
      lastLoginIp: this.lastLoginIp,
      loginAttempts: this.loginAttempts,
      lockedUntil: this.lockedUntil,
      firstName: this.firstName,
      lastName: this.lastName,
      avatarUrl: this.avatarUrl,
      timezone: this.timezone,
      locale: this.locale,
      emailNotifications: this.emailNotifications,
      marketingEmails: this.marketingEmails,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  toPublic() {
    return {
      id: this.id,
      name: this.getDisplayName(),
      email: this.email,
      image: this.image || this.avatarUrl,
      initials: this.getInitials(),
      createdAt: this.createdAt,
    };
  }

  toProfile() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.getDisplayName(),
      image: this.image,
      avatarUrl: this.avatarUrl,
      timezone: this.timezone,
      locale: this.locale,
      emailVerified: this.emailVerified,
      isEmailVerified: this.isEmailVerified,
      emailNotifications: this.emailNotifications,
      marketingEmails: this.marketingEmails,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Update methods - mantendo os mesmos do anterior
  updateProfile(data: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    timezone?: string;
    locale?: string;
  }): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      data.name !== undefined ? data.name : this.name,
      this.image,
      this.emailVerified,
      this.passwordHash,
      this.isActive,
      this.isSuperAdmin,
      this.isEmailVerified,
      this.lastLoginAt,
      this.lastLoginIp,
      this.loginAttempts,
      this.lockedUntil,
      data.firstName !== undefined ? data.firstName : this.firstName,
      data.lastName !== undefined ? data.lastName : this.lastName,
      this.avatarUrl,
      data.timezone || this.timezone,
      data.locale || this.locale,
      this.emailNotifications,
      this.marketingEmails,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  recordLogin(ipAddress?: string): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      this.name,
      this.image,
      this.emailVerified,
      this.passwordHash,
      this.isActive,
      this.isSuperAdmin,
      this.isEmailVerified,
      new Date(),
      ipAddress || this.lastLoginIp,
      '0',
      null,
      this.firstName,
      this.lastName,
      this.avatarUrl,
      this.timezone,
      this.locale,
      this.emailNotifications,
      this.marketingEmails,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  verifyEmail(): UserEntity {
    return new UserEntity(
      this.id,
      this.email,
      this.name,
      this.image,
      new Date(),
      this.passwordHash,
      this.isActive,
      this.isSuperAdmin,
      true,
      this.lastLoginAt,
      this.lastLoginIp,
      this.loginAttempts,
      this.lockedUntil,
      this.firstName,
      this.lastName,
      this.avatarUrl,
      this.timezone,
      this.locale,
      this.emailNotifications,
      this.marketingEmails,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }
}
