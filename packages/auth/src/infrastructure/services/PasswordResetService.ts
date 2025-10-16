import { getDb, users } from '@workspace/database';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

/**
 * Service para reset de senha - migrado do PasswordChangeService
 * ✅ REFATORADO: Usa DatabaseWrapper (RLS automático)
 */
export class PasswordResetService {
  async resetPassword(
    userId: string,
    newPassword: string,
    resetBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const newPasswordHash = await hash(newPassword, 12);

      const db = await getDb();
      await db.updateWhere(users, eq(users.id, userId)).set({
        password_hash: newPasswordHash,
        updated_at: new Date(),
      });

      // Verificar se update foi bem-sucedido
      const [updated] = await db.selectWhere(users, eq(users.id, userId));

      if (!updated) {
        return {
          success: false,
          error: 'Failed to reset password',
        };
      }

      console.error(`✅ Password reset for user ${userId} by ${resetBy}`);
      return { success: true };
    } catch (error) {
      console.error('❌ PasswordResetService error:', error);
      return {
        success: false,
        error: 'Password reset failed',
      };
    }
  }

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
}
