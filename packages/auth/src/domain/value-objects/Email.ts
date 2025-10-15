import { isValidEmail } from '../../utils/validation.utils';

/**
 * Value Object Email
 * Garante formato válido de e-mail
 */
export class Email {
  private constructor(public readonly value: string) {}

  public static create(email: string): Email {
    const normalized = email.toLowerCase().trim();
    if (!isValidEmail(normalized)) {
      throw new Error('Invalid email format');
    }
    return new Email(normalized);
  }
}
