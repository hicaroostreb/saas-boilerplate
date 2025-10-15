import {
  ChangePasswordData,
  validateChangePasswordInput,
} from '../../utils/password-validation.utils';

/**
 * Value Object PasswordPolicy
 * Garante regras de senha ao criar ou alterar
 */
export class PasswordPolicy {
  private constructor(public readonly password: string) {}

  public static validate(data: ChangePasswordData): void {
    const result = validateChangePasswordInput(data);
    if (!result.isValid) {
      throw new Error(result.error);
    }
  }

  public static create(password: string): PasswordPolicy {
    // Validar novo password frente a política mínima
    this.validate({
      currentPassword: '',
      newPassword: password,
      confirmPassword: password,
    });
    return new PasswordPolicy(password);
  }
}
