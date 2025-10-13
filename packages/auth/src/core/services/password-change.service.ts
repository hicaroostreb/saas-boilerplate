// packages/auth/src/core/services/password-change.service.ts - BUILD-TIME SAFE PASSWORD SERVICE

import { getDb, users } from '@workspace/database';
import { eq } from 'drizzle-orm';
import { UserRepository } from '../../adapters/repositories/user.repository';
import { AuditService } from './audit.service';
import { hashPassword, verifyPassword } from './password.service';

/**
 * ✅ ENTERPRISE: Build-Time Safe Password Change Service
 */
export class PasswordChangeService {
  private userRepository: UserRepository;
  private auditService: AuditService;

  constructor() {
    this.userRepository = new UserRepository();
    this.auditService = new AuditService();
  }

  /**
   * ✅ CHANGE: User password (build-time safe)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{
    success: boolean;
    error?: string;
    warnings?: string[];
    recommendations?: string[];
  }> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user?.passwordHash) {
        await this.auditService.logAuthEvent({
          userId,
          eventType: 'password_reset',
          eventAction: 'password_change_failed',
          eventStatus: 'failure',
          eventCategory: 'security',
          ipAddress: context.ipAddress ?? null,
          userAgent: context.userAgent ?? null,
          errorMessage: 'User not found or no password set',
        });

        return {
          success: false,
          error: 'Invalid user or password not set',
        };
      }

      const isCurrentPasswordValid = await verifyPassword(
        currentPassword,
        user.passwordHash
      );
      if (!isCurrentPasswordValid) {
        await this.auditService.logAuthEvent({
          userId,
          eventType: 'password_reset',
          eventAction: 'invalid_current_password',
          eventStatus: 'failure',
          eventCategory: 'security',
          ipAddress: context.ipAddress ?? null,
          userAgent: context.userAgent ?? null,
          errorMessage: 'Invalid current password',
        });

        return {
          success: false,
          error: 'Current password is incorrect',
        };
      }

      const newPasswordHash = await hashPassword(newPassword);

      // Update password using lazy-loaded database
      const db = await getDb();
      const [updated] = await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updated) {
        await this.auditService.logAuthEvent({
          userId,
          eventType: 'password_reset',
          eventAction: 'password_update_failed',
          eventStatus: 'failure',
          eventCategory: 'security',
          ipAddress: context.ipAddress ?? null,
          userAgent: context.userAgent ?? null,
          errorMessage: 'Failed to update password in database',
        });

        return {
          success: false,
          error: 'Failed to update password',
        };
      }

      await this.auditService.logAuthEvent({
        userId,
        eventType: 'password_reset',
        eventAction: 'password_changed',
        eventStatus: 'success',
        eventCategory: 'security',
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        eventData: {
          changedAt: new Date(),
        },
      });

      return {
        success: true,
        warnings: [],
        recommendations: ['Consider enabling two-factor authentication'],
      };
    } catch (error) {
      console.error('❌ PasswordChangeService changePassword error:', error);

      await this.auditService.logAuthEvent({
        userId,
        eventType: 'password_reset',
        eventAction: 'password_change_error',
        eventStatus: 'error',
        eventCategory: 'security',
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: 'Password change failed due to system error',
      };
    }
  }

  /**
   * ✅ VALIDATE: Password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      issues.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('Password must contain at least one special character');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * ✅ VALIDATE: Password strength only (alias for lib/actions)
   */
  validatePasswordStrengthOnly(password: string): {
    isValid: boolean;
    issues: string[];
  } {
    return this.validatePasswordStrength(password);
  }

  /**
   * ✅ RESET: Password (admin action with build-time safety)
   */
  async resetPassword(
    userId: string,
    newPassword: string,
    resetBy: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const newPasswordHash = await hashPassword(newPassword);

      // Update password using lazy-loaded database
      const db = await getDb();
      const [updated] = await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updated) {
        return {
          success: false,
          error: 'Failed to reset password',
        };
      }

      await this.auditService.logAuthEvent({
        userId,
        eventType: 'password_reset',
        eventAction: 'password_reset_by_admin',
        eventStatus: 'success',
        eventCategory: 'admin',
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        eventData: {
          resetBy,
          resetAt: new Date(),
        },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ PasswordChangeService resetPassword error:', error);
      return {
        success: false,
        error: 'Password reset failed',
      };
    }
  }
}
