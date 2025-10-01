// packages/auth/src/utils/password-validation.utils.ts - PASSWORD VALIDATION UTILITIES

/**
 * ✅ ENTERPRISE: Change Password Data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOtherSessions?: boolean;
}

/**
 * ✅ ENTERPRISE: Password Validation Result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  field?: 'currentPassword' | 'newPassword' | 'confirmPassword' | 'general';
  errors?: string[];
}

/**
 * ✅ ENTERPRISE: Password Change Validation Utilities
 * Single Responsibility: Password change input validation
 */

/**
 * ✅ VALIDATE: Change password input
 */
export function validateChangePasswordInput(
  data: ChangePasswordData
): PasswordValidationResult {
  const _errors: string[] = [];

  // Current password validation
  if (!data.currentPassword) {
    return {
      isValid: false,
      error: 'Current password is required',
      field: 'currentPassword',
      errors: ['Current password is required'],
    };
  }

  // New password validation
  if (!data.newPassword) {
    return {
      isValid: false,
      error: 'New password is required',
      field: 'newPassword',
      errors: ['New password is required'],
    };
  }

  if (data.newPassword.length < 8) {
    return {
      isValid: false,
      error: 'New password must be at least 8 characters long',
      field: 'newPassword',
      errors: ['New password must be at least 8 characters long'],
    };
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    return {
      isValid: false,
      error: 'Password confirmation is required',
      field: 'confirmPassword',
      errors: ['Password confirmation is required'],
    };
  }

  if (data.newPassword !== data.confirmPassword) {
    return {
      isValid: false,
      error: 'New passwords do not match',
      field: 'confirmPassword',
      errors: ['New passwords do not match'],
    };
  }

  // Same as current password check
  if (data.currentPassword === data.newPassword) {
    return {
      isValid: false,
      error: 'New password must be different from current password',
      field: 'newPassword',
      errors: ['New password must be different from current password'],
    };
  }

  return { isValid: true };
}

/**
 * ✅ SANITIZE: Password change options
 */
export function sanitizePasswordChangeOptions(
  data: Partial<ChangePasswordData>
): ChangePasswordData {
  return {
    currentPassword: data.currentPassword?.trim() ?? '',
    newPassword: data.newPassword ?? '',
    confirmPassword: data.confirmPassword ?? '',
    revokeOtherSessions: data.revokeOtherSessions ?? false,
  };
}
