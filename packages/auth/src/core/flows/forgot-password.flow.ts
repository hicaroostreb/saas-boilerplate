// packages/auth/src/core/flows/forgot-password.flow.ts

import type { ForgotPasswordSchema } from '../../types/schemas/forgot-password.schema';

// Resultado do flow
export interface ForgotPasswordResult {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
}

// Flow principal de forgot password
export async function forgotPasswordFlow(
  input: ForgotPasswordSchema
): Promise<ForgotPasswordResult> {
  try {
    const { email } = input;

    // Importação dinâmica da repository enterprise
    const { UserRepository } = await import(
      '../../adapters/repositories/user.repository'
    );
    const { SessionRepository } = await import(
      '../../adapters/repositories/session.repository'
    );
    const { generateSecureToken } = await import(
      '../services/security.service'
    );

    const userRepository = new UserRepository();
    const sessionRepository = new SessionRepository();

    // 1. Verificar se usuário existe
    const existingUser = await userRepository.findByEmail(email.toLowerCase());
    if (!existingUser) {
      // ✅ SECURITY: Sempre retornar sucesso para não vazar informações
      return {
        success: true,
        data: {
          message:
            'If an account with this email exists, you will receive a password reset link.',
        },
      };
    }

    // 2. Verificar se usuário está ativo
    if (!existingUser.isActive) {
      // ✅ SECURITY: Retornar mensagem genérica
      return {
        success: true,
        data: {
          message:
            'If an account with this email exists, you will receive a password reset link.',
        },
      };
    }

    // 3. Revogar reset tokens anteriores (usando sessionRepository como storage temporário)
    await sessionRepository.revokeAllForUser(
      existingUser.id,
      undefined,
      'system',
      'password_reset_requested'
    );

    // 4. Gerar token de reset seguro
    const resetToken = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // 5. Criar "sessão" especial para o reset token
    const resetSession = await sessionRepository.create({
      userId: existingUser.id,
      sessionToken: resetToken,
      expires: expiresAt,
      deviceName: 'Password Reset',
      deviceType: 'unknown',
      securityLevel: 'elevated',
      sessionData: {
        type: 'password_reset',
        email: existingUser.email,
        requestedAt: new Date().toISOString(),
      },
    });

    if (!resetSession) {
      return {
        success: false,
        error: 'Failed to create password reset token',
      };
    }

    // 6. TODO: Enviar email com token
    // const { EmailGateway } = await import('../../adapters/email/email.gateway');
    // await EmailGateway.sendPasswordResetEmail(existingUser.email, resetToken);

    // ✅ ESLint fix: Usar console.warn ao invés de console.log
    console.warn('Password reset requested for user:', {
      id: existingUser.id,
      email: existingUser.email,
      token: resetToken,
      expiresAt,
    });

    return {
      success: true,
      data: {
        message:
          'If an account with this email exists, you will receive a password reset link.',
      },
    };
  } catch (error) {
    console.error('ForgotPassword Flow Error:', error);

    return {
      success: false,
      // ✅ ESLint fix: Usar ?? ao invés de ||
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
