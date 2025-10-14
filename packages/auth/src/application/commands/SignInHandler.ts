import type { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import type { PasswordHasherPort } from '../../domain/ports/PasswordHasherPort';
import type { SignInDTO } from '../dto/SignInDTO';
import type { UserProfileDTO } from '../dto/UserProfileDTO';
import { Email } from '../../domain/value-objects/Email';

export class SignInHandler {
  constructor(
    private userRepo: UserRepositoryPort,
    private hasher: PasswordHasherPort
  ) {}

  public async execute(data: SignInDTO): Promise<UserProfileDTO> {
    // ✅ Validar email via Value Object
    const emailVO = Email.create(data.email);
    
    // ✅ Buscar usuário
    const user = await this.userRepo.findByEmail(emailVO.value);
    if (!user || !user.canAuthenticate()) {
      throw new Error('Invalid credentials');
    }

    // ✅ Verificar senha
    const isValid = await this.hasher.compare(
      data.password,
      user.passwordHash!
    );
    
    if (!isValid) {
      // ✅ Incrementar tentativas de login
      await this.userRepo.incrementLoginAttempts(user.id);
      throw new Error('Invalid credentials');
    }

    // ✅ Sucesso - atualizar último login
    await this.userRepo.updateLastLogin(user.id);

    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      isActive: user.isActive,
    };
  }
}
