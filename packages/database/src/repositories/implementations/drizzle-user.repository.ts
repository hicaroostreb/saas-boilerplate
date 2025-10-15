// packages/database/src/repositories/implementations/drizzle-user.repository.ts
// ============================================
// DRIZZLE USER REPOSITORY - ENTERPRISE MULTI-TENANT (REFACTORED)
// ============================================

import { and, desc, eq, gte, inArray, isNull, like } from 'drizzle-orm';
import type { Database } from '../../connection';
import { DatabaseError } from '../../connection';
import { tenantContext } from '../../connection/tenant-context';
import { UserEntity } from '../../entities/auth/user.entity';
import { users, type User } from '../../schemas/auth';
import type {
  IUserRepository,
  UserFilterOptions,
  UserQueryOptions,
} from '../contracts/user.repository.interface';
import { RLSRepositoryWrapper } from '../rls-wrapper';

export class DrizzleUserRepository implements IUserRepository {
  private rls: RLSRepositoryWrapper;

  constructor(private readonly db: Database) {
    this.rls = new RLSRepositoryWrapper(db);
  }

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

  async delete(id: string): Promise<void> {
    if (this.checkBuildTime()) return;

    try {
      await this.rls.softDelete(users, eq(users.id, id));
    } catch (error) {
      throw this.handleDatabaseError(error, 'delete');
    }
  }

  async findByOrganizationId(
    _organization_id: string,
    _options?: UserQueryOptions
  ): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];

    console.warn(
      '[DrizzleUserRepository] findByOrganizationId not implemented - users.organization_id removed'
    );
    return [];
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
      const conditions = [
        options.include_deleted ? undefined : isNull(users.deleted_at),
        options.is_active !== undefined
          ? eq(users.is_active, options.is_active)
          : undefined,
        options.is_email_verified !== undefined
          ? eq(users.is_email_verified, options.is_email_verified)
          : undefined,
      ].filter(Boolean);

      const finalConditions =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = finalConditions
        ? this.rls.selectWhere(users, finalConditions)
        : this.rls.select(users);

      let result = await baseQuery.orderBy(desc(users.created_at));

      if (options.limit) {
        result = result.slice(0, options.limit);
      }

      if (options.offset) {
        result = result.slice(options.offset);
      }

      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findMany');
    }
  }

  async findByEmailPattern(
    pattern: string,
    options?: UserQueryOptions
  ): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];

    try {
      const conditions = and(
        like(users.email, `%${pattern}%`),
        options?.include_deleted ? undefined : isNull(users.deleted_at)
      )!;

      let result = await this.rls
        .selectWhere(users, conditions)
        .orderBy(users.email);

      if (options?.limit) {
        result = result.slice(0, options.limit);
      }

      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByEmailPattern');
    }
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

  async findUnverifiedUsers(older_than_hours = 24): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];

    try {
      const cutoff_date = new Date(
        Date.now() - older_than_hours * 60 * 60 * 1000
      );

      const result = await this.rls
        .selectWhere(
          users,
          and(
            eq(users.is_email_verified, false),
            gte(users.created_at, cutoff_date),
            isNull(users.deleted_at)
          )!
        )
        .orderBy(desc(users.created_at));

      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findUnverifiedUsers');
    }
  }

  async findLockedUsers(): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];

    try {
      const now = new Date();

      const result = await this.rls
        .selectWhere(
          users,
          and(gte(users.locked_until, now), isNull(users.deleted_at))!
        )
        .orderBy(desc(users.locked_until));

      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findLockedUsers');
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
    user_entities: readonly UserEntity[]
  ): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [...user_entities];
    if (user_entities.length === 0) return [];

    try {
      return await this.rls.transaction(async tx => {
        const updated_users: UserEntity[] = [];

        for (const user of user_entities) {
          await tx
            .update(users)
            .set({ ...user.toDatabase(), updated_at: new Date() })
            .where(
              and(
                eq(users.tenant_id, tenantContext.getTenantId()),
                eq(users.id, user.id),
                isNull(users.deleted_at)
              )!
            );

          const [result] = await tx
            .select()
            .from(users)
            .where(eq(users.id, user.id))
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

  async existsById(id: string): Promise<boolean> {
    if (this.checkBuildTime()) return false;

    try {
      return await this.rls.exists(
        users,
        and(eq(users.id, id), isNull(users.deleted_at))!
      );
    } catch (error) {
      throw this.handleDatabaseError(error, 'existsById');
    }
  }

  async count(filters?: Pick<UserFilterOptions, 'is_active'>): Promise<number> {
    if (this.checkBuildTime()) return 0;

    try {
      const conditions = [
        isNull(users.deleted_at),
        filters?.is_active !== undefined
          ? eq(users.is_active, filters.is_active)
          : undefined,
      ].filter(Boolean);

      const finalConditions =
        conditions.length > 0 ? and(...conditions) : undefined;

      return await this.rls.count(users, finalConditions);
    } catch (error) {
      throw this.handleDatabaseError(error, 'count');
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

    console.error(`[DrizzleUserRepository.${operation}] Database error:`, {
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

    return new DatabaseError(
      `Database operation failed: ${operation}`,
      err.code,
      err.constraint
    );
  }
}
