// USER REPOSITORY - BUILD-TIME SAFE + SCHEMA CORRETO
import {
  and,
  desc,
  eq,
  getDb,
  gt,
  isNull,
  sql,
  users,
} from '@workspace/database';
import bcrypt from 'bcryptjs';
import type { UserEntity } from '../../entities/auth/user.entity';

export class UserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    try {
      const db = await getDb();
      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .limit(1);
      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      console.error('❌ UserRepository findById error:', error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const db = await getDb();
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, email.toLowerCase().trim()),
            isNull(users.deletedAt)
          )
        )
        .limit(1);
      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      console.error('❌ UserRepository findByEmail error:', error);
      return null;
    }
  }

  async create(userData: {
    email: string;
    password: string;
    name?: string;
    emailVerified?: Date | null;
    image?: string | null;
  }): Promise<UserEntity> {
    try {
      const db = await getDb();
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const now = new Date();

      const [user] = await db
        .insert(users)
        .values({
          email: userData.email.toLowerCase().trim(),
          passwordHash: hashedPassword, // ✅ CORRETO
          name: userData.name ?? null,
          emailVerified: userData.emailVerified ?? null,
          image: userData.image ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (!user) {
        throw new Error('Failed to create user');
      }
      return this.mapToEntity(user);
    } catch (error) {
      console.error('❌ UserRepository create error:', error);
      throw error;
    }
  }

  async verifyPassword(
    email: string,
    password: string
  ): Promise<UserEntity | null> {
    try {
      const db = await getDb();
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, email.toLowerCase().trim()),
            isNull(users.deletedAt)
          )
        )
        .limit(1);

      if (!user?.passwordHash) {
        // ✅ CORRETO
        return null;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash); // ✅ CORRETO
      if (!isValid) {
        return null;
      }

      await this.updateLastLogin(user.id);
      return this.mapToEntity(user);
    } catch (error) {
      console.error('❌ UserRepository verifyPassword error:', error);
      return null;
    }
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const user = await this.findById(userId);
      return user?.lockedUntil ? user.lockedUntil > new Date() : false;
    } catch (error) {
      console.error('❌ UserRepository isAccountLocked error:', error);
      return false;
    }
  }

  async incrementLoginAttempts(userId: string): Promise<void> {
    try {
      const db = await getDb();
      await db
        .update(users)
        .set({
          loginAttempts: sql`CAST(COALESCE(${users.loginAttempts}, '0') AS INTEGER) + 1`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('❌ UserRepository incrementLoginAttempts error:', error);
    }
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    try {
      const db = await getDb();
      await db
        .update(users)
        .set({
          loginAttempts: '0',
          lockedUntil: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('❌ UserRepository resetLoginAttempts error:', error);
    }
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    try {
      const db = await getDb();
      const [updated] = await db
        .update(users)
        .set({
          lastLoginAt: new Date(), // ✅ CORRETO - existe no schema
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      return !!updated;
    } catch (error) {
      console.error('❌ UserRepository updateLastLogin error:', error);
      return false;
    }
  }

  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    try {
      const db = await getDb();
      const [updated] = await db
        .update(users)
        .set({
          passwordHash, // ✅ CORRETO
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      return !!updated;
    } catch (error) {
      console.error('❌ UserRepository updatePassword error:', error);
      return false;
    }
  }

  async updateActiveStatus(
    userId: string,
    isActive: boolean
  ): Promise<boolean> {
    try {
      const db = await getDb();
      const [updated] = await db
        .update(users)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      return !!updated;
    } catch (error) {
      console.error('❌ UserRepository updateActiveStatus error:', error);
      return false;
    }
  }

  async findRecentlyActive(days = 30, limit = 100): Promise<UserEntity[]> {
    try {
      const db = await getDb();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentUsers = await db
        .select()
        .from(users)
        .where(
          and(
            gt(users.lastLoginAt, cutoffDate), // ✅ CORRETO
            isNull(users.deletedAt)
          )
        )
        .orderBy(desc(users.lastLoginAt)) // ✅ CORRETO
        .limit(limit);

      return recentUsers.map(user => this.mapToEntity(user));
    } catch (error) {
      console.error('❌ UserRepository findRecentlyActive error:', error);
      return [];
    }
  }

  async update(
    id: string,
    updateData: Partial<UserEntity>
  ): Promise<UserEntity> {
    try {
      const db = await getDb();
      const updateValues: Record<string, unknown> = {
        ...updateData,
        updatedAt: new Date(),
      };

      if (updateData.passwordHash) {
        updateValues.passwordHash = await bcrypt.hash(
          updateData.passwordHash,
          12
        );
      }

      const [user] = await db
        .update(users)
        .set(updateValues)
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .returning();

      if (!user) {
        throw new Error('User not found or update failed');
      }
      return this.mapToEntity(user);
    } catch (error) {
      console.error('❌ UserRepository update error:', error);
      throw error;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const db = await getDb();
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(
          and(
            eq(users.email, email.toLowerCase().trim()),
            isNull(users.deletedAt)
          )
        )
        .limit(1);
      return Number(result?.count ?? 0) > 0;
    } catch (error) {
      console.error('❌ UserRepository existsByEmail error:', error);
      return false;
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db
        .update(users)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));
      console.warn('✅ UserRepository: User soft deleted:', id);
    } catch (error) {
      console.error('❌ UserRepository softDelete error:', error);
      throw error;
    }
  }

  async countTotal(): Promise<number> {
    try {
      const db = await getDb();
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(isNull(users.deletedAt));
      return Number(result?.count ?? 0);
    } catch (error) {
      console.error('❌ UserRepository countTotal error:', error);
      return 0;
    }
  }

  private mapToEntity(dbUser: Record<string, unknown>): UserEntity {
    return {
      id: dbUser.id as string,
      organizationId: dbUser.organizationId as string | null,
      name: dbUser.name as string | null,
      email: dbUser.email as string,
      image: dbUser.image as string | null,
      emailVerified: dbUser.emailVerified as Date | null,
      passwordHash: dbUser.passwordHash as string | null, // ✅ CORRETO
      isActive: dbUser.isActive as boolean,
      isSuperAdmin: dbUser.isSuperAdmin as boolean,
      isEmailVerified: dbUser.isEmailVerified as boolean,
      lastLoginAt: dbUser.lastLoginAt as Date | null, // ✅ CORRETO
      lastLoginIp: dbUser.lastLoginIp as string | null,
      loginAttempts: dbUser.loginAttempts as string,
      lockedUntil: dbUser.lockedUntil as Date | null,
      firstName: dbUser.firstName as string | null,
      lastName: dbUser.lastName as string | null,
      avatarUrl: dbUser.avatarUrl as string | null,
      timezone: dbUser.timezone as string,
      locale: dbUser.locale as string,
      emailNotifications: dbUser.emailNotifications as boolean,
      marketingEmails: dbUser.marketingEmails as boolean,
      createdAt: dbUser.createdAt as Date,
      updatedAt: dbUser.updatedAt as Date,
      deletedAt: dbUser.deletedAt as Date | null,
    };
  }
}
