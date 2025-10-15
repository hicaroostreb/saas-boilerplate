// packages/database/src/repositories/implementations/drizzle-user.repository.ts
// ============================================
// DRIZZLE USER REPOSITORY - ENTERPRISE BUILD SAFE FINAL
// ============================================

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  like,
} from 'drizzle-orm';
import type { Database } from '../../connection';
import { DatabaseError } from '../../connection';
import { UserEntity } from '../../entities/auth/user.entity';
import { users, type User } from '../../schemas/auth';
import type { 
  IUserRepository,
  UserFilterOptions,
  UserQueryOptions,
} from '../contracts/user.repository.interface';

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  private checkBuildTime(): boolean {
    return process.env.NODE_ENV === 'production' && 
           (process.env.NEXT_PHASE === 'phase-production-build' || 
            process.env.CI === 'true');
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deleted_at)))
        .limit(1);

      return result[0] ? UserEntity.fromDatabase(result[0]) : null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findById');
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(and(eq(users.email, email), isNull(users.deleted_at)))
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
      const result = await this.db
        .select()
        .from(users)
        .where(and(inArray(users.id, [...ids]), isNull(users.deleted_at)))
        .orderBy(desc(users.created_at));

      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByIds');
    }
  }

  async create(user: UserEntity): Promise<UserEntity> {
    if (this.checkBuildTime()) return user;
    
    try {
      const [result] = await this.db
        .insert(users)
        .values(user.toDatabase())
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to create user - no result returned');
      }

      return UserEntity.fromDatabase(result);
    } catch (error) {
      throw this.handleDatabaseError(error, 'create');
    }
  }

  async update(user: UserEntity): Promise<UserEntity> {
    if (this.checkBuildTime()) return user;
    
    try {
      const [result] = await this.db
        .update(users)
        .set({ ...user.toDatabase(), updated_at: new Date() })
        .where(and(eq(users.id, user.id), isNull(users.deleted_at)))
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to update user - user not found or deleted');
      }

      return UserEntity.fromDatabase(result);
    } catch (error) {
      throw this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    if (this.checkBuildTime()) return;
    
    try {
      await this.db
        .update(users)
        .set({ deleted_at: new Date() })
        .where(and(eq(users.id, id), isNull(users.deleted_at)));
    } catch (error) {
      throw this.handleDatabaseError(error, 'delete');
    }
  }

  async findByOrganizationId(
    organization_id: string, 
    options?: UserQueryOptions
  ): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      let query = this.db
        .select()
        .from(users)
        .where(
          and(
            eq(users.organization_id, organization_id), 
            options?.include_deleted ? undefined : isNull(users.deleted_at)
          )
        )
        .orderBy(desc(users.created_at)) as any;

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.offset(options.offset);
      }

      const result = await query;
      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByOrganizationId');
    }
  }

  async softDelete(id: string): Promise<void> {
    if (this.checkBuildTime()) return;
    
    try {
      await this.db
        .update(users)
        .set({ deleted_at: new Date() })
        .where(eq(users.id, id));
    } catch (error) {
      throw this.handleDatabaseError(error, 'softDelete');
    }
  }

  async restore(id: string): Promise<UserEntity | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const [result] = await this.db
        .update(users)
        .set({ deleted_at: null, updated_at: new Date() })
        .where(eq(users.id, id))
        .returning();

      return result ? UserEntity.fromDatabase(result) : null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'restore');
    }
  }

  async findMany(options: UserFilterOptions): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const conditions = [
        options.include_deleted ? undefined : isNull(users.deleted_at),
        options.is_active !== undefined ? eq(users.is_active, options.is_active) : undefined,
        options.organization_id ? eq(users.organization_id, options.organization_id) : undefined,
        options.is_email_verified !== undefined ? eq(users.is_email_verified, options.is_email_verified) : undefined,
      ].filter(Boolean);

      let query = this.db
        .select()
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.created_at)) as any;

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

  async findByEmailPattern(
    pattern: string, 
    options?: UserQueryOptions
  ): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      let query = this.db
        .select()
        .from(users)
        .where(
          and(
            like(users.email, `%${pattern}%`), 
            options?.include_deleted ? undefined : isNull(users.deleted_at)
          )
        )
        .orderBy(asc(users.email)) as any;

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const result = await query;
      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByEmailPattern');
    }
  }

  async findForAuthentication(email: string): Promise<UserEntity | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, email),
            eq(users.is_active, true),
            isNull(users.deleted_at)
          )
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
      const cutoff_date = new Date(Date.now() - older_than_hours * 60 * 60 * 1000);

      const result = await this.db
        .select()
        .from(users)
        .where(
          and(
            eq(users.is_email_verified, false),
            gte(users.created_at, cutoff_date),
            isNull(users.deleted_at)
          )
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

      const result = await this.db
        .select()
        .from(users)
        .where(
          and(
            gte(users.locked_until, now), 
            isNull(users.deleted_at)
          )
        )
        .orderBy(desc(users.locked_until));

      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findLockedUsers');
    }
  }

  async createMany(user_entities: readonly UserEntity[]): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [...user_entities];
    if (user_entities.length === 0) return [];

    try {
      const user_data = user_entities.map(user => user.toDatabase());
      const result = await this.db
        .insert(users)
        .values(user_data)
        .returning();

      return result.map((user: User) => UserEntity.fromDatabase(user));
    } catch (error) {
      throw this.handleDatabaseError(error, 'createMany');
    }
  }

  async updateMany(user_entities: readonly UserEntity[]): Promise<UserEntity[]> {
    if (this.checkBuildTime()) return [...user_entities];
    if (user_entities.length === 0) return [];

    try {
      return await this.db.transaction(async (tx) => {
        const updated_users: UserEntity[] = [];

        const batch_size = 100;
        for (let i = 0; i < user_entities.length; i += batch_size) {
          const batch = user_entities.slice(i, i + batch_size);
          
          for (const user of batch) {
            const [result] = await tx
              .update(users)
              .set({ ...user.toDatabase(), updated_at: new Date() })
              .where(and(eq(users.id, user.id), isNull(users.deleted_at)))
              .returning();

            if (result) {
              updated_users.push(UserEntity.fromDatabase(result));
            }
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
      await this.db
        .update(users)
        .set({ deleted_at: new Date() })
        .where(inArray(users.id, [...ids]));
    } catch (error) {
      throw this.handleDatabaseError(error, 'deleteMany');
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    if (this.checkBuildTime()) return false;
    
    try {
      const result = await this.db
        .select({ count: count() })
        .from(users)
        .where(and(eq(users.email, email), isNull(users.deleted_at)))
        .limit(1);

      return (result[0]?.count ?? 0) > 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'existsByEmail');
    }
  }

  async existsById(id: string): Promise<boolean> {
    if (this.checkBuildTime()) return false;
    
    try {
      const result = await this.db
        .select({ count: count() })
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deleted_at)))
        .limit(1);

      return (result[0]?.count ?? 0) > 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'existsById');
    }
  }

  async count(filters?: Pick<UserFilterOptions, 'is_active' | 'organization_id'>): Promise<number> {
    if (this.checkBuildTime()) return 0;
    
    try {
      const conditions = [
        isNull(users.deleted_at),
        filters?.is_active !== undefined ? eq(users.is_active, filters.is_active) : undefined,
        filters?.organization_id ? eq(users.organization_id, filters.organization_id) : undefined,
      ].filter(Boolean);

      const result = await this.db
        .select({ count: count() })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return result[0]?.count ?? 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'count');
    }
  }

  private handleDatabaseError(error: unknown, operation: string): DatabaseError {
    const err = error as { code?: string; message?: string; constraint?: string };

    console.error(`[DrizzleUserRepository.${operation}] Database error:`, {
      code: err.code,
      message: err.message?.substring(0, 200),
      constraint: err.constraint,
    });

    if (err.code === '23505') {
      return new DatabaseError(
        'User already exists',
        err.code,
        err.constraint
      );
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
