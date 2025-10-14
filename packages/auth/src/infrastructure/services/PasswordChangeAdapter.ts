import { PasswordResetService } from './PasswordResetService';

/**
 * Adaptador para PasswordResetService
 */
export class PasswordChangeAdapter {
  private passwordService: PasswordResetService;

  constructor() {
    this.passwordService = new PasswordResetService();
  }

  async resetPassword(
    userId: string, 
    newPassword: string, 
    resetBy: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.passwordService.resetPassword(userId, newPassword, resetBy);
  }

  validatePasswordStrength(password: string): { isValid: boolean; issues: string[] } {
    return this.passwordService.validatePasswordStrength(password);
  }
}
