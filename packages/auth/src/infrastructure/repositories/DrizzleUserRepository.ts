import type { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import {
  and,
  eq,
  getDb,
  isNull,
  users,
} from '@workspace/database';

/**
 * Implementação concreta do UserRepositoryPort usando Drizzle
 * Única camada com acesso ao @workspace/database
 */
export class DrizzleUserRepository implements UserRepositoryPort {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const db = await getDb();
      const [dbUser] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, email.toLowerCase().trim()),
            isNull(users.deletedAt)
          )
        )
        .limit(1);

      return dbUser ? this.mapToDomainEntity(dbUser) : null;
    } catch (error) {
      console.error('❌ DrizzleUserRepository findByEmail error:', error);
      return null;
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const db = await getDb();
      const [dbUser] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, userId), isNull(users.deletedAt)))
        .limit(1);

      return dbUser ? this.mapToDomainEntity(dbUser) : null;
    } catch (error) {
      console.error('❌ DrizzleUserRepository findById error:', error);
      return null;
    }
  }

  async create(user: User, passwordHash: string): Promise<User> {
    try {
      const db = await getDb();
      const now = new Date();

      const [dbUser] = await db
        .insert(users)
        .values({
          id: user.id,
          email: user.email.value,
          name: user.name,
          passwordHash,
          isActive: user.isActive,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

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
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('❌ DrizzleUserRepository updateLastLogin error:', error);
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
      console.error('❌ DrizzleUserRepository incrementLoginAttempts error:', error);
    }
  }

  private mapToDomainEntity(dbUser: Record<string, unknown>): User {
    const email = Email.create(dbUser.email as string);
    
    return User.reconstitute({
      id: dbUser.id as string,
      email: email.value,
      name: dbUser.name as string,
      passwordHash: dbUser.passwordHash as string | null,
      isActive: dbUser.isActive as boolean,
      createdAt: dbUser.createdAt as Date,
      updatedAt: dbUser.updatedAt as Date,
    });
  }
}
