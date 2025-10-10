// packages/auth/src/core/flows/reset-password.flow.ts

import type { ResetPasswordSchema } from '../../types/schemas/reset-password.schema';

// Resultado do flow
export interface ResetPasswordResult {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
}

// Flow principal de reset password
export async function resetPasswordFlow(
  input: ResetPasswordSchema
): Promise<ResetPasswordResult> {
  try {
    const { token, password } = input;

    // Importação dinâmica dos services enterprise
    const { SessionRepository } = await import(
      '../../adapters/repositories/session.repository'
    );
    const { PasswordChangeService } = await import(
      '../services/password-change.service'
    );
    const { validatePasswordStrength } = await import(
      '../services/password.service'
    );

    const sessionRepository = new SessionRepository();

    // 1. Verificar se token existe e é válido
    const resetSession = await sessionRepository.findByToken(token);
    if (!resetSession) {
      return {
        success: false,
        error: 'Invalid or expired reset token',
      };
    }

    // 2. Verificar se é realmente uma sessão de reset de senha
    const sessionData = resetSession.sessionData as Record<
      string,
      unknown
    > | null;
    if (sessionData?.type !== 'password_reset') {
      return {
        success: false,
        error: 'Invalid reset token',
      };
    }

    // 3. Verificar se token não expirou
    const now = new Date();
    if (resetSession.expires < now) {
      await sessionRepository.revoke(token, 'system', 'expired');
      return {
        success: false,
        error: 'Reset token has expired',
      };
    }

    // 4. Validar força da nova senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error:
          passwordValidation.errors[0] ?? 'Password does not meet requirements',
      };
    }

    // 5. Usar PasswordChangeService para resetar senha
    const passwordChangeService = new PasswordChangeService();
    const resetResult = await passwordChangeService.resetPassword(
      resetSession.userId,
      password,
      'password_reset_flow'
    );

    if (!resetResult.success) {
      return {
        success: false,
        error: resetResult.error ?? 'Failed to reset password',
      };
    }

    // 6. Invalidar token após uso
    await sessionRepository.revoke(token, 'system', 'password_reset_completed');

    // 7. Revogar todas as outras sessões do usuário por segurança
    await sessionRepository.revokeAllForUser(
      resetSession.userId,
      undefined,
      'system',
      'password_reset_security'
    );

    // ✅ ESLint fix: Usar console.warn ao invés de console.log
    console.warn('Password reset completed for user:', {
      userId: resetSession.userId,
      token,
      completedAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        message:
          'Password has been reset successfully. You can now sign in with your new password.',
      },
    };
  } catch (error) {
    console.error('ResetPassword Flow Error:', error);

    return {
      success: false,
      // ✅ ESLint fix: Usar ?? ao invés de ||
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
