import { PasswordChangeService } from '../../core/services/password-change.service';

/**
 * Adaptador para PasswordChangeService
 */
export class PasswordChangeAdapter {
  private passwordService: PasswordChangeService;

  constructor() {
    this.passwordService = new PasswordChangeService();
  }

  async resetPassword(userId: string, newPassword: string, resetBy: string): Promise<{ success: boolean; error?: string }> {
    return this.passwordService.resetPassword(userId, newPassword, resetBy);
  }

  validatePasswordStrength(password: string): { isValid: boolean; issues: string[] } {
    return this.passwordService.validatePasswordStrength(password);
  }
}
