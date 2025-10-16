// packages/database/src/repositories/contracts/user.repository.interface.ts
// ============================================
// USER REPOSITORY CONTRACT - ENTERPRISE MULTI-TENANT
// ============================================

import type { UserEntity } from '../../entities';

export interface UserQueryOptions {
  limit?: number;
  offset?: number;
  order_by?: 'name' | 'email' | 'created_at';
  order_direction?: 'asc' | 'desc';
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
  // Core CRUD
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(options?: UserQueryOptions): Promise<UserEntity[]>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;

  /**
   * Delete user account (self-delete or system admin)
   * @param id - User ID to delete
   * @param requestingUserId - ID of user requesting deletion
   * @param isSystemAdmin - Whether requester is system admin (default: false)
   * @throws DatabaseError with code 'FORBIDDEN' if unauthorized
   */
  delete(
    id: string,
    requestingUserId: string,
    isSystemAdmin?: boolean
  ): Promise<void>;

  /**
   * Administrative delete (system context required)
   * @param id - User ID to delete
   * @param adminUserId - ID of system admin performing deletion
   * @throws DatabaseError with code 'FORBIDDEN' if not system context
   */
  adminDelete(id: string, adminUserId: string): Promise<void>;

  // Soft delete operations (legacy - prefer delete() which does soft delete)
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<UserEntity | null>;

  // Search and filtering
  findMany(options: UserFilterOptions): Promise<UserEntity[]>;
  search(query: string, options?: UserQueryOptions): Promise<UserEntity[]>;
  findByOrganizationId(
    organization_id: string,
    options?: UserQueryOptions
  ): Promise<UserEntity[]>;

  // Aggregation
  count(options?: UserQueryOptions): Promise<number>;

  // Batch operations
  createMany(users: readonly UserEntity[]): Promise<UserEntity[]>;
  updateMany(
    updates: ReadonlyArray<{
      id: string;
      data: Partial<Omit<UserEntity, 'id' | 'tenant_id'>>;
    }>
  ): Promise<UserEntity[]>;
  deleteMany(ids: readonly string[]): Promise<void>;

  // Existence checks
  existsByEmail(email: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
