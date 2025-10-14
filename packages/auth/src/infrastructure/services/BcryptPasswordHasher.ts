import { compare, hash } from 'bcryptjs';
import type { PasswordHasherPort } from '../../domain/ports/PasswordHasherPort';

/**
 * Implementação concreta para hashing de senhas usando bcrypt
 */
export class BcryptPasswordHasher implements PasswordHasherPort {
  async hash(password: string): Promise<string> {
    return hash(password, 12);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}
