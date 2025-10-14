import type { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import { Email } from '../../domain/value-objects/Email';

export interface ForgotPasswordDTO {
  email: string;
}

export interface ForgotPasswordResult {
  message: string;
}

export class ForgotPasswordHandler {
  constructor(private userRepo: UserRepositoryPort) {}

  public async execute(data: ForgotPasswordDTO): Promise<ForgotPasswordResult> {
    // ✅ Validar email via Value Object
    const emailVO = Email.create(data.email);
    
    // ✅ Verificar se usuário existe
    const user = await this.userRepo.findByEmail(emailVO.value);
    
    // ✅ Security: Sempre retornar sucesso para não vazar informações
    if (!user) {
      return {
        message: 'If the email exists, a reset link has been sent',
      };
    }

    // TODO: Implementar geração de token e envio de email
    // Por enquanto apenas log
    console.warn('Password reset requested for user:', user.id);

    return {
      message: 'If the email exists, a reset link has been sent',
    };
  }
}
