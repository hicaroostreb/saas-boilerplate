import type { SessionRepositoryPort } from '../../domain/ports/SessionRepositoryPort';

export interface ValidateResetTokenDTO {
  token: string;
}

export interface ValidateResetTokenResult {
  valid: boolean;
  token?: string;
}

export class ValidateResetTokenHandler {
  constructor(private sessionRepo: SessionRepositoryPort) {}

  public async execute(data: ValidateResetTokenDTO): Promise<ValidateResetTokenResult> {
    try {
      // ✅ Buscar token no repositório
      const resetSession = await this.sessionRepo.findByToken(data.token);
      if (!resetSession) {
        return { valid: false };
      }

      // ✅ Verificar se é realmente uma sessão de reset de senha
      const sessionData = resetSession.sessionData;
      if (sessionData?.type !== 'password_reset') {
        return { valid: false };
      }

      // ✅ Verificar se token não expirou
      const now = new Date();
      if (resetSession.expires < now) {
        // ✅ Invalidar token expirado
        await this.sessionRepo.revoke(data.token, 'system', 'expired');
        return { valid: false };
      }

      console.warn('Reset token validated successfully:', data.token);

      return {
        valid: true,
        token: data.token,
      };
    } catch (error) {
      console.error('❌ ValidateResetTokenHandler error:', error);
      return { valid: false };
    }
  }
}
