import { User } from '../../domain/entities/User';
import type { PasswordHasherPort } from '../../domain/ports/PasswordHasherPort';
import type { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import { Email } from '../../domain/value-objects/Email';
import { generateSecureId } from '../../utils/validation.utils';
import type { UserProfileDTO } from '../dto/UserProfileDTO';

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export class RegisterUserHandler {
  constructor(
    private userRepo: UserRepositoryPort,
    private hasher: PasswordHasherPort
  ) {}

  public async execute(data: RegisterUserDTO): Promise<UserProfileDTO> {
    // ✅ Validar email via Value Object
    const emailVO = Email.create(data.email);

    // ✅ Verificar se usuário já existe
    const existingUser = await this.userRepo.findByEmail(emailVO.value);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // ✅ Criar entidade User
    const newUser = User.create({
      id: generateSecureId(),
      email: emailVO.value,
      name: data.name.trim(),
    });

    // ✅ Hash da senha
    const passwordHash = await this.hasher.hash(data.password);

    // ✅ Persistir no repositório
    const createdUser = await this.userRepo.create(newUser, passwordHash);

    return {
      id: createdUser.id,
      email: createdUser.email.value,
      name: createdUser.name,
      isActive: createdUser.isActive,
    };
  }
}
