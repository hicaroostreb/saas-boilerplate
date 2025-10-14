import { Session } from '../../domain/entities/Session';
import type { SessionRepositoryPort } from '../../domain/ports/SessionRepositoryPort';
import type { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import { Email } from '../../domain/value-objects/Email';

export interface ForgotPasswordDTO {
  email: string;
}

export interface ForgotPasswordResult {
  message: string;
}

export class ForgotPasswordHandler {
  constructor(
    private userRepo: UserRepositoryPort,
    private sessionRepo: SessionRepositoryPort
  ) {}

  public async execute(data: ForgotPasswordDTO): Promise<ForgotPasswordResult> {
    const emailVO = Email.create(data.email);
    const user = await this.userRepo.findByEmail(emailVO.value);

    // Security: Sempre retornar sucesso para não vazar informações
    if (!user) {
      return {
        message: 'If the email exists, a reset link has been sent',
      };
    }

    // Gerar token de reset
    const resetToken = this.generateResetToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    // Criar sessão de reset no banco
    const resetSession = Session.create({
      userId: user.id,
      sessionToken: resetToken,
      expires: expiresAt,
      sessionData: {
        type: 'password_reset',
        email: user.email.value,
        createdAt: new Date().toISOString(),
      },
    });

    await this.sessionRepo.create(resetSession);

    // LOG TOKEN PARA DESENVOLVIMENTO (usando console.warn/error permitidos)
    const resetUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3001'}/auth/reset-password?token=${resetToken}`;

    console.warn('Password reset requested for user:', user.id);
    console.warn('��� RESET PASSWORD LINK (DEV):');
    console.warn(resetUrl);
    console.warn(`⏰ Expires: ${expiresAt.toLocaleString()}`);

    // TODO: Implementar envio de email com o resetUrl
    // Por enquanto apenas log do token para desenvolvimento

    return {
      message: 'If the email exists, a reset link has been sent',
    };
  }

  private generateResetToken(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }
}
