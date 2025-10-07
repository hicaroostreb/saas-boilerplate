// packages/auth/src/services/authentication.service.ts - AUTHENTICATION SERVICE

import { UserRepository } from '../../adapters/repositories/user.repository';
import type { User } from '../../types';
import { verifyPassword } from './password.service';

/**
 * ✅ ENTERPRISE: Authentication Result
 */
interface AuthenticationResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * ✅ ENTERPRISE: Authentication Service
 * Single Responsibility: Core authentication operations
 */
export class AuthenticationService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * ✅ AUTHENTICATE: User with email and password
   */
  async authenticate(
    email: string,
    password: string,
    _context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<AuthenticationResult> {
    try {
      // Get user
      const user = await this.userRepository.findByEmail(email);
      if (!user?.passwordHash) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          error: 'Account is disabled',
        };
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        await this.userRepository.incrementLoginAttempts(user.id);

        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      // Success - reset login attempts
      await this.userRepository.resetLoginAttempts(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isActive: user.isActive,
          isSuperAdmin: user.isSuperAdmin,
        },
      };
    } catch (error) {
      console.error('❌ AuthenticationService authenticate error:', error);
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  /**
   * ✅ VALIDATE: User credentials (simplified)
   */
  async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const result = await this.authenticate(email, password);
      return result.success ? (result.user ?? null) : null;
    } catch (error) {
      console.error(
        '❌ AuthenticationService validateCredentials error:',
        error
      );
      return null;
    }
  }

  /**
   * ✅ CHECK: If user exists and is active
   */
  async isUserActive(email: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findByEmail(email);
      return user ? user.isActive : false;
    } catch (error) {
      console.error('❌ AuthenticationService isUserActive error:', error);
      return false;
    }
  }

  /**
   * ✅ GET: User by email (for auth providers)
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        isActive: user.isActive,
        isSuperAdmin: user.isSuperAdmin,
      };
    } catch (error) {
      console.error('❌ AuthenticationService getUserByEmail error:', error);
      return null;
    }
  }

  /**
   * ✅ UPDATE: User last login
   */
  async updateLastLogin(userId: string): Promise<boolean> {
    try {
      return await this.userRepository.updateLastLogin(userId);
    } catch (error) {
      console.error('❌ AuthenticationService updateLastLogin error:', error);
      return false;
    }
  }

  /**
   * ✅ CHECK: User account status
   */
  async getAccountStatus(email: string): Promise<{
    exists: boolean;
    active: boolean;
    locked: boolean;
    loginAttempts: number;
  }> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return {
          exists: false,
          active: false,
          locked: false,
          loginAttempts: 0,
        };
      }

      const loginAttempts =
        typeof user.loginAttempts === 'number'
          ? user.loginAttempts
          : (parseInt(String(user.loginAttempts ?? 0), 10) ?? 0);

      return {
        exists: true,
        active: user.isActive,
        locked: loginAttempts >= 5, // Simple lock logic
        loginAttempts,
      };
    } catch (error) {
      console.error('❌ AuthenticationService getAccountStatus error:', error);
      return {
        exists: false,
        active: false,
        locked: false,
        loginAttempts: 0,
      };
    }
  }
}
