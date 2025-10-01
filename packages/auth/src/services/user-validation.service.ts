// packages/auth/src/services/user-validation.service.ts - USER VALIDATION BUSINESS LOGIC

import { verifyPassword } from '../password';
import { UserRepository } from '../repositories/user.repository';
import { validateUserSecurity } from '../security';
import type { AuthEventType } from '../types';
import { AuditService } from './audit.service';

// ✅ ENTERPRISE: Simplified user interface for return values
interface UserData {
  id: string;
  email: string;
  passwordHash?: string;
  isActive: boolean;
  loginAttempts?: number | string;
  [key: string]: unknown;
}

/**
 * ✅ ENTERPRISE: User Validation Result
 */
export interface UserValidationResult {
  isValid: boolean;
  user?: UserData;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
  requiresMFA?: boolean;
}

/**
 * ✅ ENTERPRISE: Error codes and messages (fixed type issue)
 */
const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_INACTIVE: 'USER_INACTIVE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
} as const;

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'Account is inactive',
  ACCOUNT_LOCKED: 'Account is temporarily locked',
  SYSTEM_ERROR: 'System error occurred',
} as const;

/**
 * ✅ ENTERPRISE: User Validation Service
 * Single Responsibility: User validation for authentication
 */
export class UserValidationService {
  private userRepository: UserRepository;
  private auditService: AuditService;

  constructor() {
    this.userRepository = new UserRepository();
    this.auditService = new AuditService();
  }

  /**
   * ✅ VALIDATE: User for sign-in (with fixed error codes)
   */
  async validateUserForSignIn(
    email: string,
    password: string,
    context: { ipAddress: string; userAgent: string }
  ): Promise<UserValidationResult> {
    try {
      // Find user
      const rawUser = await this.userRepository.findByEmail(email);
      const user = rawUser as UserData | null;

      if (!user?.passwordHash) {
        await this.auditService.logAuthEvent({
          eventType: 'login_failed' as AuthEventType,
          eventAction: 'user_not_found',
          eventStatus: 'failure',
          eventCategory: 'auth',
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          errorCode: ERROR_CODES.USER_NOT_FOUND,
          errorMessage: 'User not found or no password set',
          eventData: { email },
        });

        return {
          isValid: false,
          error: {
            code: ERROR_CODES.INVALID_CREDENTIALS,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS,
            field: 'general',
          },
        };
      }

      // ✅ FIX: Create a proper EnterpriseUser object without any types
      const userRecord = user as Record<string, unknown>;
      const enterpriseUser = {
        ...user, // Include all original properties first
        // Override with required EnterpriseUser fields
        isEmailVerified: (userRecord.isEmailVerified as boolean) ?? false,
        lastLoginAt: (userRecord.lastLoginAt as Date | null) ?? null,
        createdAt: (userRecord.createdAt as Date) ?? new Date(),
        updatedAt: (userRecord.updatedAt as Date) ?? new Date(),
        deletedAt: (userRecord.deletedAt as Date | null) ?? null,
        isSuperAdmin: (userRecord.isSuperAdmin as boolean) ?? false,
        loginAttempts:
          typeof user.loginAttempts === 'number' ? user.loginAttempts : 0,
      };

      // Basic security validation
      const securityValidation = validateUserSecurity(enterpriseUser);

      if (!securityValidation.isValid) {
        const reason =
          securityValidation.issues[0] ?? 'Security validation failed';

        await this.auditService.logAuthEvent({
          userId: user.id,
          eventType: 'login_failed' as AuthEventType,
          eventAction: 'security_blocked',
          eventStatus: 'failure',
          eventCategory: 'security',
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          eventData: {
            email,
            securityReasons: securityValidation.issues,
          },
        });

        // Fix: Use proper error code type instead of assignment
        let errorCode: keyof typeof ERROR_CODES;
        if (reason.includes('inactive')) {
          errorCode = 'USER_INACTIVE';
        } else if (reason.includes('locked')) {
          errorCode = 'ACCOUNT_LOCKED';
        } else {
          errorCode = 'SYSTEM_ERROR';
        }

        return {
          isValid: false,
          error: {
            code: ERROR_CODES[errorCode],
            message: ERROR_MESSAGES[errorCode] ?? 'Security validation failed',
            field: 'general',
          },
        };
      }

      // Password verification
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        // Safely get current login attempts
        const currentAttempts =
          typeof user.loginAttempts === 'number'
            ? user.loginAttempts
            : (parseInt(String(user.loginAttempts ?? 0), 10) ?? 0);

        const newFailedAttempts = currentAttempts + 1;
        const shouldLock = newFailedAttempts >= 5;

        if (shouldLock) {
          await this.auditService.logAuthEvent({
            userId: user.id,
            eventType: 'login_failed' as AuthEventType,
            eventAction: 'too_many_failures',
            eventStatus: 'failure',
            eventCategory: 'security',
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            eventData: {
              email,
              failedAttempts: newFailedAttempts,
            },
          });

          return {
            isValid: false,
            error: {
              code: ERROR_CODES.ACCOUNT_LOCKED,
              message: ERROR_MESSAGES.ACCOUNT_LOCKED,
              field: 'general',
            },
          };
        } else {
          await this.userRepository.incrementLoginAttempts(user.id);
        }

        await this.auditService.logAuthEvent({
          userId: user.id,
          eventType: 'login_failed' as AuthEventType,
          eventAction: 'invalid_password',
          eventStatus: 'failure',
          eventCategory: 'auth',
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          eventData: {
            email,
            failedAttempts: newFailedAttempts,
          },
        });

        return {
          isValid: false,
          error: {
            code: ERROR_CODES.INVALID_CREDENTIALS,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS,
            field: 'general',
          },
        };
      }

      // Success - reset failed attempts
      await this.userRepository.resetLoginAttempts(user.id);

      // Check if MFA is required (default to false for now)
      const requiresMFA = false;

      return {
        isValid: true,
        user,
        requiresMFA,
      };
    } catch (error) {
      console.error(
        '❌ UserValidationService validateUserForSignIn error:',
        error
      );
      return {
        isValid: false,
        error: {
          code: ERROR_CODES.SYSTEM_ERROR,
          message: ERROR_MESSAGES.SYSTEM_ERROR,
          field: 'general',
        },
      };
    }
  }

  /**
   * ✅ VALIDATE: User exists and is active
   */
  async validateUserExists(email: string): Promise<{
    exists: boolean;
    user?: UserData;
    error?: { code: string; message: string };
  }> {
    try {
      const rawUser = await this.userRepository.findByEmail(email);
      const user = rawUser as UserData | null;

      if (!user) {
        return {
          exists: false,
          error: {
            code: ERROR_CODES.USER_NOT_FOUND,
            message: ERROR_MESSAGES.USER_NOT_FOUND,
          },
        };
      }

      if (!user.isActive) {
        return {
          exists: false,
          error: {
            code: ERROR_CODES.USER_INACTIVE,
            message: ERROR_MESSAGES.USER_INACTIVE,
          },
        };
      }

      return {
        exists: true,
        user,
      };
    } catch (error) {
      console.error(
        '❌ UserValidationService validateUserExists error:',
        error
      );
      return {
        exists: false,
        error: {
          code: ERROR_CODES.SYSTEM_ERROR,
          message: ERROR_MESSAGES.SYSTEM_ERROR,
        },
      };
    }
  }

  /**
   * ✅ CHECK: If user account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    try {
      return await this.userRepository.isAccountLocked(userId);
    } catch (error) {
      console.error('❌ UserValidationService isAccountLocked error:', error);
      return true; // Fail safe - consider locked on error
    }
  }

  /**
   * ✅ RESET: User login attempts
   */
  async resetLoginAttempts(userId: string): Promise<boolean> {
    try {
      return await this.userRepository.resetLoginAttempts(userId);
    } catch (error) {
      console.error(
        '❌ UserValidationService resetLoginAttempts error:',
        error
      );
      return false;
    }
  }
}
