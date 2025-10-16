import { getDb, users, type CreateUser } from '@workspace/database';
import { tenantContext } from '@workspace/database/connection';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { User } from '../../domain/entities/User';
import type { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';

/**
 * Implementação concreta do UserRepositoryPort usando Drizzle
 * Única camada com acesso ao @workspace/database
 * ✅ REFATORADO: Usa DatabaseWrapper (RLS automático)
 */
export class DrizzleUserRepository implements UserRepositoryPort {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const db = await getDb();
      const condition = and(
        eq(users.email, email.toLowerCase().trim()),
        isNull(users.deleted_at)
      );
      if (!condition) {
        return null;
      }

      const [dbUser] = await db.selectWhere(users, condition);

      return dbUser ? this.mapToDomainEntity(dbUser) : null;
    } catch (error) {
      console.error('❌ DrizzleUserRepository findByEmail error:', error);
      return null;
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const db = await getDb();
      const condition = and(eq(users.id, userId), isNull(users.deleted_at));
      if (!condition) {
        return null;
      }

      const [dbUser] = await db.selectWhere(users, condition);

      return dbUser ? this.mapToDomainEntity(dbUser) : null;
    } catch (error) {
      console.error('❌ DrizzleUserRepository findById error:', error);
      return null;
    }
  }

  async create(user: User, passwordHash: string): Promise<User> {
    try {
      const db = await getDb();
      const tenantId = tenantContext.getTenantIdOrNull() ?? 'system-tenant';

      const createData: CreateUser = {
        id: user.id,
        tenant_id: tenantId,
        email: user.email.value,
        name: user.name,
        password_hash: passwordHash,
        is_active: user.isActive,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      };

      const [dbUser] = await db.insert(users, createData);

      if (!dbUser) {
        throw new Error('Failed to create user');
      }

      return this.mapToDomainEntity(dbUser);
    } catch (error) {
      console.error('❌ DrizzleUserRepository create error:', error);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.updateWhere(users, eq(users.id, userId)).set({
        last_login_at: new Date(),
        updated_at: new Date(),
      });
    } catch (error) {
      console.error('❌ DrizzleUserRepository updateLastLogin error:', error);
    }
  }

  async incrementLoginAttempts(userId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.updateWhere(users, eq(users.id, userId)).set({
        login_attempts: sql`COALESCE(${users.login_attempts}, 0) + 1`,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error(
        '❌ DrizzleUserRepository incrementLoginAttempts error:',
        error
      );
    }
  }

  private mapToDomainEntity(dbUser: typeof users.$inferSelect): User {
    return User.reconstitute({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      passwordHash: dbUser.password_hash,
      isActive: dbUser.is_active ?? true,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    });
  }
}
