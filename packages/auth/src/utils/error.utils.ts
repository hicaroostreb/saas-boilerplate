// packages/auth/src/utils/error.utils.ts - ERROR UTILITIES

/**
 * ✅ ENTERPRISE: Error Utilities
 * Single Responsibility: Error handling and formatting utilities
 */

/**
 * ✅ FORMAT: Auth error for display
 */
export function formatAuthError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * ✅ CHECK: If error is auth-related
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const authErrorCodes = [
      'INVALID_CREDENTIALS',
      'USER_NOT_FOUND',
      'ACCOUNT_LOCKED',
      'MFA_REQUIRED',
      'RATE_LIMITED',
    ];

    return authErrorCodes.some(code => error.message.includes(code));
  }

  return false;
}
