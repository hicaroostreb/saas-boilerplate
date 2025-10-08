// packages/auth/src/repositories/user.repository.ts - USER DATA ACCESS

import { db, users } from '@workspace/database';
import { randomUUID } from 'crypto';
import { and, eq, isNull } from 'drizzle-orm';

/**
 * ✅ ENTERPRISE: User Repository (Database Compatible)
 * Single Responsibility: User data access operations compatible with actual DB schema
 */
export class UserRepository {
  /**
   * ✅ CREATE: New user (DB compatible)
   */
  async create(userData: {
    email: string;
    name?: string | null;
    passwordHash?: string | null;
    isActive?: boolean;
    isSuperAdmin?: boolean;
  }): Promise<{
    id: string;
    email: string;
    name: string | null;
    isActive: boolean;
    isSuperAdmin: boolean;
    createdAt: Date;
  } | null> {
    try {
      const userId = randomUUID();

      // Use only fields that definitely exist in the schema
      const newUser = {
        id: userId,
        email: userData.email,
        name: userData.name ?? null,
        passwordHash: userData.passwordHash ?? null,
        isActive: userData.isActive ?? true,
        isSuperAdmin: userData.isSuperAdmin ?? false,
        createdAt: new Date(),
      };

      const [insertedUser] = await db.insert(users).values(newUser).returning({
        id: users.id,
        email: users.email,
        name: users.name,
        isActive: users.isActive,
        isSuperAdmin: users.isSuperAdmin,
        createdAt: users.createdAt,
      });

      return insertedUser ?? null;
    } catch (error) {
      console.error('❌ UserRepository create error:', error);
      return null;
    }
  }

  /**
   * ✅ GET: User by email (return raw DB result)
   */
  async findByEmail(email: string) {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), isNull(users.deletedAt)))
        .limit(1);

      return user ?? null;
    } catch (error) {
      console.error('❌ UserRepository findByEmail error:', error);
      return null;
    }
  }

  /**
   * ✅ GET: User by ID (return raw DB result)
   */
  async findById(id: string) {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .limit(1);

      return user ?? null;
    } catch (error) {
      console.error('❌ UserRepository findById error:', error);
      return null;
    }
  }

  /**
   * ✅ UPDATE: User password hash
   */
  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('❌ UserRepository updatePassword error:', error);
      return false;
    }
  }

  /**
   * ✅ UPDATE: Login attempts (safe increment)
   */
  async incrementLoginAttempts(userId: string): Promise<boolean> {
    try {
      // Get current user data first
      const [user] = await db
        .select({ loginAttempts: users.loginAttempts })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return false;
      }

      // Handle both number and string types safely
      const currentAttempts =
        typeof user.loginAttempts === 'number'
          ? user.loginAttempts
          : (parseInt(String(user.loginAttempts ?? 0), 10) ?? 0);

      const newAttempts = currentAttempts + 1;

      await db
        .update(users)
        .set({
          loginAttempts: String(newAttempts), // Store as string to match schema
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('❌ UserRepository incrementLoginAttempts error:', error);
      return false;
    }
  }

  /**
   * ✅ UPDATE: Reset login attempts
   */
  async resetLoginAttempts(userId: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({
          loginAttempts: '0', // Store as string to match schema
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('❌ UserRepository resetLoginAttempts error:', error);
      return false;
    }
  }

  /**
   * ✅ UPDATE: Last login timestamp
   */
  async updateLastLogin(userId: string): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          loginAttempts: '0', // Reset attempts on successful login
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('❌ UserRepository updateLastLogin error:', error);
      return false;
    }
  }

  /**
   * ✅ UPDATE: User active status
   */
  async updateActiveStatus(
    userId: string,
    isActive: boolean
  ): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('❌ UserRepository updateActiveStatus error:', error);
      return false;
    }
  }

  /**
   * ✅ UPDATE: Email verification status
   */
  async updateEmailVerification(
    userId: string,
    isVerified: boolean
  ): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({
          isEmailVerified: isVerified,
          emailVerified: isVerified ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('❌ UserRepository updateEmailVerification error:', error);
      return false;
    }
  }

  /**
   * ✅ CHECK: If user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), isNull(users.deletedAt)))
        .limit(1);

      return !!user;
    } catch (error) {
      console.error('❌ UserRepository existsByEmail error:', error);
      return false;
    }
  }

  /**
   * ✅ CHECK: If user is locked (safe type handling)
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const [user] = await db
        .select({
          loginAttempts: users.loginAttempts,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.isActive) {
        return true; // Consider inactive users as "locked"
      }

      const maxAttempts = 5;
      const currentAttempts =
        typeof user.loginAttempts === 'number'
          ? user.loginAttempts
          : (parseInt(String(user.loginAttempts ?? 0), 10) ?? 0);

      return currentAttempts >= maxAttempts;
    } catch (error) {
      console.error('❌ UserRepository isAccountLocked error:', error);
      return true; // Fail safe - consider locked on error
    }
  }

  /**
   * ✅ GET: User security info (safe type conversion)
   */
  async getSecurityInfo(userId: string): Promise<{
    loginAttempts: number;
    lastLoginAt: Date | null;
    isActive: boolean;
    isEmailVerified: boolean;
  } | null> {
    try {
      const [user] = await db
        .select({
          loginAttempts: users.loginAttempts,
          lastLoginAt: users.lastLoginAt,
          isActive: users.isActive,
          isEmailVerified: users.isEmailVerified,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return null;
      }

      // Safely convert loginAttempts to number
      const loginAttempts =
        typeof user.loginAttempts === 'number'
          ? user.loginAttempts
          : (parseInt(String(user.loginAttempts ?? 0), 10) ?? 0);

      return {
        loginAttempts,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      console.error('❌ UserRepository getSecurityInfo error:', error);
      return null;
    }
  }
}
