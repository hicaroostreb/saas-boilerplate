// packages/database/src/repositories/contracts/user.repository.interface.ts
// ============================================
// USER REPOSITORY CONTRACT - ENTERPRISE (REFACTORED)
// ============================================

import type { UserEntity } from '../../entities/auth/user.entity';

export interface UserQueryOptions {
  limit?: number;
  offset?: number;
  include_deleted?: boolean;
}

export interface UserFilterOptions {
  is_active?: boolean;
  is_email_verified?: boolean;
  include_deleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface IUserRepository {
  // Core CRUD operations
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByIds(ids: readonly string[]): Promise<UserEntity[]>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;

  // Soft delete operations
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<UserEntity | null>;

  // Search and filtering
  findMany(options: UserFilterOptions): Promise<UserEntity[]>;
  findByEmailPattern(
    pattern: string,
    options?: UserQueryOptions
  ): Promise<UserEntity[]>;

  // Authentication-specific
  findForAuthentication(email: string): Promise<UserEntity | null>;

  // Maintenance operations
  findUnverifiedUsers(older_than_hours?: number): Promise<UserEntity[]>;
  findLockedUsers(): Promise<UserEntity[]>;

  // Batch operations
  createMany(users: readonly UserEntity[]): Promise<UserEntity[]>;
  updateMany(users: readonly UserEntity[]): Promise<UserEntity[]>;
  deleteMany(ids: readonly string[]): Promise<void>;

  // Existence checks
  existsByEmail(email: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;

  // Statistics
  count(filters?: Pick<UserFilterOptions, 'is_active'>): Promise<number>;

  // Legacy compatibility (deprecated)
  findByOrganizationId(
    organization_id: string,
    options?: UserQueryOptions
  ): Promise<UserEntity[]>;
}
