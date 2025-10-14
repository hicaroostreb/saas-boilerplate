import type { SessionRepositoryPort } from '../../domain/ports/SessionRepositoryPort';
import { PasswordChangeAdapter } from '../../infrastructure/services/PasswordChangeAdapter';

export interface ResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword?: string;
}

export interface ResetPasswordResult {
  message: string;
}

export class ResetPasswordHandler {
  constructor(private sessionRepo: SessionRepositoryPort) {}

  public async execute(data: ResetPasswordDTO): Promise<ResetPasswordResult> {
    // ✅ Verificar se token existe e é válido
    const resetSession = await this.sessionRepo.findByToken(data.token);
    if (!resetSession) {
      throw new Error('Invalid or expired reset token');
    }

    // ✅ Verificar se é realmente uma sessão de reset de senha
    const sessionData = resetSession.sessionData;
    if (sessionData?.type !== 'password_reset') {
      throw new Error('Invalid reset token');
    }

    // ✅ Verificar se token não expirou
    const now = new Date();
    if (resetSession.expires < now) {
      await this.sessionRepo.revoke(data.token, 'system', 'expired');
      throw new Error('Reset token has expired');
    }

    // ✅ Validar força da nova senha
    const passwordAdapter = new PasswordChangeAdapter();
    const passwordValidation = passwordAdapter.validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.issues[0] ?? 'Password does not meet requirements');
    }

    // ✅ Resetar senha usando PasswordChangeAdapter
    const resetResult = await passwordAdapter.resetPassword(
      resetSession.userId,
      data.password,
      'password_reset_flow'
    );

    if (!resetResult.success) {
      throw new Error(resetResult.error ?? 'Failed to reset password');
    }

    // ✅ Invalidar token após uso
    await this.sessionRepo.revoke(data.token, 'system', 'password_reset_completed');

    // ✅ Revogar todas as outras sessões do usuário por segurança
    await this.sessionRepo.revokeAllForUser(
      resetSession.userId,
      undefined,
      'system',
      'password_reset_security'
    );

    console.warn('Password reset completed for user:', {
      userId: resetSession.userId,
      token: data.token,
      completedAt: new Date().toISOString(),
    });

    return {
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    };
  }
}
