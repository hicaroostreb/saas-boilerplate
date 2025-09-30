// ============================================
// DRIZZLE USER REPOSITORY - SRP: APENAS USER DATA ACCESS
// ============================================

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  like,
  sql,
} from 'drizzle-orm';
import type { Database } from '../../connection';
import { UserEntity } from '../../entities/auth/user.entity';
import { users } from '../../schemas/auth';
import type { IUserRepository } from '../contracts/user.repository.interface';

export class DrizzleUserRepository implements IUserRepository {
  constructor(private db: Database) {}

  // ============================================
  // BASIC CRUD OPERATIONS
  // ============================================

  async findById(id: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] ? UserEntity.fromDatabase(result[0]) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ? UserEntity.fromDatabase(result[0]) : null;
  }

  async findByIds(ids: string[]): Promise<UserEntity[]> {
    if (ids.length === 0) return [];

    const result = await this.db
      .select()
      .from(users)
      .where(inArray(users.id, ids));

    return result.map(user => UserEntity.fromDatabase(user));
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const [result] = await this.db
      .insert(users)
      .values(user.toDatabase())
      .returning();

    if (!result) {
      throw new Error('Failed to create user');
    }

    return UserEntity.fromDatabase(result);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const [result] = await this.db
      .update(users)
      .set({ ...user.toDatabase(), updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();

    if (!result) {
      throw new Error('Failed to update user');
    }

    return UserEntity.fromDatabase(result);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id));
  }

  // ============================================
  // QUERY OPERATIONS - ✅ COMPLETE REWRITE
  // ============================================

  async findAll(options?: {
    limit?: number;
    offset?: number;
    isActive?: boolean;
  }): Promise<UserEntity[]> {
    // ✅ FIXED: Use direct SQL building approach
    const baseSelect = this.db.select().from(users);

    // Build conditions array
    const conditions = [];
    if (options?.isActive !== undefined) {
      conditions.push(eq(users.isActive, options.isActive));
    }

    // Execute query with all conditions at once
    let result;
    if (conditions.length > 0) {
      if (options?.limit && options?.offset) {
        result = await baseSelect
          .where(and(...conditions))
          .orderBy(desc(users.createdAt))
          .limit(options.limit)
          .offset(options.offset);
      } else if (options?.limit) {
        result = await baseSelect
          .where(and(...conditions))
          .orderBy(desc(users.createdAt))
          .limit(options.limit);
      } else {
        result = await baseSelect
          .where(and(...conditions))
          .orderBy(desc(users.createdAt));
      }
    } else {
      if (options?.limit && options?.offset) {
        result = await baseSelect
          .orderBy(desc(users.createdAt))
          .limit(options.limit)
          .offset(options.offset);
      } else if (options?.limit) {
        result = await baseSelect
          .orderBy(desc(users.createdAt))
          .limit(options.limit);
      } else {
        result = await baseSelect.orderBy(desc(users.createdAt));
      }
    }

    return result.map(user => UserEntity.fromDatabase(user));
  }

  async findByEmailPattern(pattern: string, limit = 10): Promise<UserEntity[]> {
    const result = await this.db
      .select()
      .from(users)
      .where(like(users.email, `%${pattern}%`))
      .limit(limit);

    return result.map(user => UserEntity.fromDatabase(user));
  }

  async findRecentlyActive(days = 30, limit = 100): Promise<UserEntity[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.isActive, true), gte(users.lastLoginAt, cutoffDate)))
      .orderBy(desc(users.lastLoginAt))
      .limit(limit);

    return result.map(user => UserEntity.fromDatabase(user));
  }

  // ============================================
  // BUSINESS OPERATIONS
  // ============================================

  async findByLoginCredentials(email: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1);

    return result[0] ? UserEntity.fromDatabase(result[0]) : null;
  }

  async findUnverifiedUsers(olderThanHours = 24): Promise<UserEntity[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

    const result = await this.db
      .select()
      .from(users)
      .where(
        and(eq(users.isEmailVerified, false), gte(users.createdAt, cutoffDate))
      );

    return result.map(user => UserEntity.fromDatabase(user));
  }

  async findLockedUsers(): Promise<UserEntity[]> {
    const now = new Date();

    const result = await this.db
      .select()
      .from(users)
      .where(gte(users.lockedUntil, now));

    return result.map(user => UserEntity.fromDatabase(user));
  }

  async findInactiveUsers(olderThanDays = 90): Promise<UserEntity[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.isActive, false), gte(users.updatedAt, cutoffDate)));

    return result.map(user => UserEntity.fromDatabase(user));
  }

  // ============================================
  // ANALYTICS & REPORTING
  // ============================================

  async countTotal(): Promise<number> {
    const [result] = await this.db.select({ count: count() }).from(users);

    return result?.count ?? 0;
  }

  async countActive(): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    return result?.count ?? 0;
  }

  async countVerified(): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isEmailVerified, true));

    return result?.count ?? 0;
  }

  async getRegistrationStats(
    days = 30
  ): Promise<{ date: string; count: number }[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, cutoffDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(asc(sql`DATE(${users.createdAt})`));

    return result;
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  async createMany(userEntities: UserEntity[]): Promise<UserEntity[]> {
    if (userEntities.length === 0) return [];

    const userData = userEntities.map(user => user.toDatabase());
    const result = await this.db.insert(users).values(userData).returning();

    return result.map(user => UserEntity.fromDatabase(user));
  }

  async updateMany(userEntities: UserEntity[]): Promise<UserEntity[]> {
    if (userEntities.length === 0) return [];

    const updatedUsers: UserEntity[] = [];

    for (const user of userEntities) {
      const updated = await this.update(user);
      updatedUsers.push(updated);
    }

    return updatedUsers;
  }

  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(inArray(users.id, ids));
  }

  // ============================================
  // EXISTENCE CHECKS
  // ============================================

  async existsByEmail(email: string): Promise<boolean> {
    const [result] = await this.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.email, email));

    return (result?.count ?? 0) > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const [result] = await this.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.id, id));

    return (result?.count ?? 0) > 0;
  }
}
