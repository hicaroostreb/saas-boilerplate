// packages/database/src/repositories/contracts/user.repository.interface.ts

// ============================================
// USER REPOSITORY CONTRACT - SRP: APENAS USER INTERFACE
// Enterprise Multi-Tenancy and Soft Delete
// ============================================

import type { UserEntity } from '../../entities/auth/user.entity';

export interface IUserRepository {
  // ============================================
  // BASIC CRUD OPERATIONS
  // ============================================

  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByIds(ids: string[]): Promise<UserEntity[]>;

  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;

  // ============================================
  // MULTI-TENANCY OPERATIONS
  // ============================================

  findByOrganizationId(organizationId: string): Promise<UserEntity[]>;

  // ============================================
  // SOFT DELETE OPERATIONS
  // ============================================

  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<UserEntity>;

  // ============================================
  // QUERY OPERATIONS
  // ============================================

  findAll(options?: {
    limit?: number;
    offset?: number;
    isActive?: boolean;
  }): Promise<UserEntity[]>;

  findByEmailPattern(pattern: string, limit?: number): Promise<UserEntity[]>;

  findRecentlyActive(days?: number, limit?: number): Promise<UserEntity[]>;

  // ============================================
  // BUSINESS OPERATIONS
  // ============================================

  findByLoginCredentials(email: string): Promise<UserEntity | null>;

  findUnverifiedUsers(olderThanHours?: number): Promise<UserEntity[]>;

  findLockedUsers(): Promise<UserEntity[]>;

  findInactiveUsers(olderThanDays?: number): Promise<UserEntity[]>;

  // ============================================
  // ANALYTICS & REPORTING
  // ============================================

  countTotal(): Promise<number>;
  countActive(): Promise<number>;
  countVerified(): Promise<number>;

  getRegistrationStats(days?: number): Promise<
    {
      date: string;
      count: number;
    }[]
  >;

  // ============================================
  // BULK OPERATIONS
  // ============================================

  createMany(users: UserEntity[]): Promise<UserEntity[]>;
  updateMany(users: UserEntity[]): Promise<UserEntity[]>;
  deleteMany(ids: string[]): Promise<void>;

  // ============================================
  // EXISTENCE CHECKS
  // ============================================

  existsByEmail(email: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
