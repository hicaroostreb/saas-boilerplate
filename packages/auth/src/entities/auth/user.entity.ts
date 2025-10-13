export interface UserEntity {
  id: string;
  organizationId: string | null;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: Date | null;
  passwordHash: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  loginAttempts: string;
  lockedUntil: Date | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  timezone: string;
  locale: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
