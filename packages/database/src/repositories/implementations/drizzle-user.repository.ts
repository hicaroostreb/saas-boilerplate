// packages/database/src/repositories/implementations/drizzle-user.repository.ts
// ============================================
// DRIZZLE USER REPOSITORY - ENTERPRISE MULTI-TENANT (REFACTORED)
// ============================================

import { and, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';
import type { DatabaseWrapper } from '../../connection';
import { DatabaseError } from '../../connection';
import { tenantContext } from '../../connection/tenant-context';
import { UserEntity } from '../../entities/auth/user.entity';
import { users, type User } from '../../schemas/auth';
import { logger } from '../../utils/logger';
import type {
  IUserRepository,
  UserFilterOptions,
  UserQueryOptions,
} from '../contracts/user.repository.interface';

export class DrizzleUserRepository implements IUserRepository {
  /**
   * ✅ REFATORADO: Recebe DatabaseWrapper (RLS já embutido)
   * Não precisa mais criar RLSRepositoryWrapper manualmente
   */
  constructor(private readonly rls: DatabaseWrapper) {}

  private checkBuildTime(): boolean {
    return (
      process.env.NODE_ENV === 'production' &&
      (process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.CI === 'true')
    );
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (this.checkBuildTime()) return null;

    try {
      const result = await this.rls
        .selectWhere(users, and(eq(users.id, id), isNull(users.deleted_at))!)
        .limit(1);

      return result[0] ? UserEntity.fromDatabase(result[0]) : null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findById');
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (this.checkBuildTime()) return null;

    try {
      const result = await this.rls
        .selectWhere(
          users,
          and(eq(users.email, email.toLowerCase()), isNull(users.deleted_at))!
        )
        .limit(1);

      return result[0] ? UserEntity.fromDatabase(result[0]) : null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByEmail');
    }
  }

  async findAll(options?: UserQueryOptions): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];

    try {
      let query = this.rls
        .selectWhere(users, isNull(users.deleted_at))
        .orderBy(desc(users.created_at));

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.offset(options.offset);
      }

      const result = await query;
      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findAll');
    }
  }

  async findByIds(ids: readonly string[]): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];
    if (ids.length === 0) return [];

    try {
      const result = await this.rls
        .selectWhere(
          users,
          and(inArray(users.id, [...ids]), isNull(users.deleted_at))!
        )
        .orderBy(desc(users.created_at));

      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByIds');
    }
  }

  async create(user: UserEntity): Promise<UserEntity> {
    if (this.checkBuildTime()) return user;

    return this.rls.transactionWithRLS(async tx => {
      const [result] = await tx
        .insert(users)
        .values(user.toDatabase())
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to create user - no result returned');
      }

      return UserEntity.fromDatabase(result);
    });
  }

  async update(user: UserEntity): Promise<UserEntity> {
    if (this.checkBuildTime()) return user;

    return this.rls.transactionWithRLS(async tx => {
      const [result] = await tx
        .update(users)
        .set({ ...user.toDatabase(), updated_at: new Date() })
        .where(and(eq(users.id, user.id), isNull(users.deleted_at))!)
        .returning();

      if (!result) {
        throw new DatabaseError(
          'Failed to update user - user not found or deleted'
        );
      }

      return UserEntity.fromDatabase(result);
    });
  }

  async delete(
    id: string,
    requestingUserId: string,
    isSystemAdmin = false
  ): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      // Self-delete or system admin
      if (requestingUserId !== id && !isSystemAdmin) {
        throw new DatabaseError(
          'Forbidden: Users can only delete their own account. Contact support for assistance.',
          'FORBIDDEN',
          'user_delete_forbidden'
        );
      }

      // Buscar user para verificar proteções
      const targetUser = await this.findById(id);

      if (!targetUser) {
        throw new DatabaseError('User not found or already deleted');
      }

      // Proteger super admins de delete por outros
      if (targetUser.isSuperAdmin && requestingUserId !== id) {
        throw new DatabaseError(
          'Forbidden: Cannot delete super admin accounts',
          'FORBIDDEN',
          'super_admin_protected'
        );
      }

      // Soft delete para manter audit trail
      await this.rls.softDelete(users, eq(users.id, id));

      // Log crítico: user deletion sempre deve ser auditado
      logger.warn(
        `[AUDIT] User ${id} deleted by ${requestingUserId} (isSystemAdmin: ${isSystemAdmin})`
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'delete');
    }
  }

  async adminDelete(id: string, adminUserId: string): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      // Verificar se requester é system admin
      const context = tenantContext.getContextOrNull();
      const isSystemContext =
        context?.source === 'system' || tenantContext.isSystemContext();

      if (!isSystemContext) {
        throw new DatabaseError(
          'Forbidden: Only system administrators can delete users',
          'FORBIDDEN',
          'admin_delete_forbidden'
        );
      }

      // Buscar user
      const targetUser = await this.findById(id);

      if (!targetUser) {
        throw new DatabaseError('User not found or already deleted');
      }

      await this.rls.softDelete(users, eq(users.id, id));

      logger.error(
        `[CRITICAL AUDIT] User ${id} administratively deleted by ${adminUserId}`
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'adminDelete');
    }
  }

  async softDelete(id: string): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      await this.rls.softDelete(users, eq(users.id, id));
    } catch (error) {
      throw this.handleDatabaseError(error, 'softDelete');
    }
  }

  async restore(id: string): Promise<UserEntity | null> {
    if (this.checkBuildTime()) return null;

    try {
      const restored = await this.rls.restore(users, eq(users.id, id));
      return restored[0] ? UserEntity.fromDatabase(restored[0]) : null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'restore');
    }
  }

  async findMany(options: UserFilterOptions): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];

    try {
      const conditions = [];

      if (!options.include_deleted) {
        conditions.push(isNull(users.deleted_at));
      }

      if (options.is_active !== undefined) {
        conditions.push(eq(users.is_active, options.is_active));
      }

      if (options.is_email_verified !== undefined) {
        conditions.push(eq(users.is_email_verified, options.is_email_verified));
      }

      let query =
        conditions.length > 0
          ? this.rls.selectWhere(users, and(...conditions)!)
          : this.rls.selectWhere(users, sql`1=1`);

      query = query.orderBy(desc(users.created_at));

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.offset(options.offset);
      }

      const result = await query;
      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findMany');
    }
  }

  async search(
    query: string,
    options?: UserQueryOptions
  ): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];

    try {
      const searchPattern = `%${query.toLowerCase().trim()}%`;

      let dbQuery = this.rls
        .selectWhere(
          users,
          and(
            or(
              ilike(users.name, searchPattern),
              ilike(users.email, searchPattern)
            )!,
            isNull(users.deleted_at)
          )!
        )
        .orderBy(users.name);

      if (options?.limit) {
        dbQuery = dbQuery.limit(options.limit);
      }

      if (options?.offset) {
        dbQuery = dbQuery.offset(options.offset);
      }

      const result = await dbQuery;
      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'search');
    }
  }

  async findByOrganizationId(
    _organization_id: string,
    _options?: UserQueryOptions
  ): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];

    logger.warn(
      '[DrizzleUserRepository] findByOrganizationId not implemented - users.organization_id removed'
    );
    return [];
  }

  async findForAuthentication(email: string): Promise<UserEntity | null> {
    if (this.checkBuildTime()) return null;

    try {
      const result = await this.rls
        .selectWhere(
          users,
          and(
            eq(users.email, email.toLowerCase()),
            eq(users.is_active, true),
            isNull(users.deleted_at)
          )!
        )
        .limit(1);

      return result[0] ? UserEntity.fromDatabase(result[0]) : null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findForAuthentication');
    }
  }

  async count(options?: UserQueryOptions): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      return await this.rls.count(users, isNull(users.deleted_at));
    } catch (error) {
      throw this.handleDatabaseError(error, 'count');
    }
  }

  async exists(id: string): Promise<boolean> {
    if (this.checkBuildTime()) return false;

    try {
      return await this.rls.exists(
        users,
        and(eq(users.id, id), isNull(users.deleted_at))!
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'exists');
    }
  }

  async existsById(id: string): Promise<boolean> {
    return this.exists(id);
  }

  async existsByEmail(email: string): Promise<boolean> {
    if (this.checkBuildTime()) return false;

    try {
      return await this.rls.exists(
        users,
        and(eq(users.email, email.toLowerCase()), isNull(users.deleted_at))!
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'existsByEmail');
    }
  }

  async createMany(
    user_entities: readonly UserEntity[]
  ): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [...user_entities];
    if (user_entities.length === 0) return [];

    try {
      const user_data = user_entities.map(user => user.toDatabase());
      await this.rls.batchInsert(users, user_data);
      return [...user_entities];
    } catch (error) {
      throw this.handleDatabaseError(error, 'createMany');
    }
  }

  async updateMany(
    user_updates: ReadonlyArray<{
      id: string;
      data: Partial<Omit<User, 'id' | 'tenant_id'>>;
    }>
  ): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];
    if (user_updates.length === 0) return [];

    try {
      return await this.rls.transaction(async tx => {
        const updated_users: UserEntity[] = [];

        for (const { id, data } of user_updates) {
          await tx
            .update(users)
            .set({ ...data, updated_at: new Date() })
            .where(
              and(
                eq(users.tenant_id, tenantContext.getTenantId()),
                eq(users.id, id),
                isNull(users.deleted_at)
              )!
            );

          const [result] = await tx
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

          if (result) {
            updated_users.push(UserEntity.fromDatabase(result));
          }
        }

        return updated_users;
      });
    } catch (error) {
      throw this.handleDatabaseError(error, 'updateMany');
    }
  }

  async deleteMany(ids: readonly string[]): Promise<void> {
    if (this.checkBuildTime()) return;
    if (ids.length === 0) return;

    try {
      await this.rls.softDelete(users, inArray(users.id, [...ids]));
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteMany');
    }
  }

  private handleDatabaseError(
    error: unknown,
    operation: string
  ): DatabaseError {
    const err = error as {
      code?: string;
      message?: string;
      constraint?: string;
    };

    logger.error(`[DrizzleUserRepository.${operation}] Database error:`, {
      code: err.code,
      message: err.message?.substring(0, 200),
      constraint: err.constraint,
    });

    if (err.code === '23505') {
      return new DatabaseError('User already exists', err.code, err.constraint);
    }

    if (err.code === '23503') {
      return new DatabaseError(
        'Referenced resource not found',
        err.code,
        err.constraint
      );
    }

    if (err.code === '23502') {
      return new DatabaseError(
        'Required field is missing',
        err.code,
        err.constraint
      );
    }

    if (err.code === 'FORBIDDEN') {
      return error as DatabaseError;
    }

    return new DatabaseError(
      `Database operation failed: ${operation}`,
      err.code,
      err.constraint
    );
  }
}
