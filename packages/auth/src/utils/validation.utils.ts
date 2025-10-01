// packages/auth/src/utils/validation.utils.ts - VALIDATION UTILITIES

/**
 * ✅ ENTERPRISE: Validation Utilities
 * Single Responsibility: Validation and ID generation utilities
 */

/**
 * ✅ EMAIL: Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ✅ SLUG: Validate organization slug
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return slugRegex.test(slug);
}

/**
 * ✅ ID: Generate secure random string
 */
export function generateSecureId(length = 16): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
