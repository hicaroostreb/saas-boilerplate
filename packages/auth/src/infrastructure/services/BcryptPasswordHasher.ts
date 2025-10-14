import type { PasswordHasherPort } from '../../domain/ports/PasswordHasherPort';
import { hashPassword, verifyPassword } from '../../core/services/password.service';

/**
 * Adaptador concreto para hashing de senhas usando bcrypt
 * Implementa PasswordHasherPort
 */
export class BcryptPasswordHasher implements PasswordHasherPort {
  async hash(password: string): Promise<string> {
    return hashPassword(password, { algorithm: 'bcrypt', saltRounds: 12 });
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return verifyPassword(password, hash);
  }
}
