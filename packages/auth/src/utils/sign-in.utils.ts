// packages/auth/src/utils/sign-in.utils.ts - SIGN-IN UTILITIES

/**
 * ✅ ENTERPRISE: Sign-in Input Validation
 * Single Responsibility: Input validation utilities
 */

export interface SignInCredentials {
  email: string;
  password: string;
  organizationSlug?: string;
  returnTo?: string;
  rememberMe?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  field?: 'email' | 'password' | 'general';
  errors?: string[];
}

/**
 * ✅ EMAIL VALIDATION: Simple email validation
 * Replace the import with inline function
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ✅ VALIDATE: Sign-in input
 */
export function validateSignInInput(
  credentials: SignInCredentials
): ValidationResult {
  const _errors: string[] = [];

  // Email validation
  if (!credentials.email) {
    return {
      isValid: false,
      error: 'Email is required',
      field: 'email',
      errors: ['Email is required'],
    };
  }

  if (!isValidEmail(credentials.email)) {
    return {
      isValid: false,
      error: 'Invalid email format',
      field: 'email',
      errors: ['Invalid email format'],
    };
  }

  // Password validation
  if (!credentials.password) {
    return {
      isValid: false,
      error: 'Password is required',
      field: 'password',
      errors: ['Password is required'],
    };
  }

  if (credentials.password.length < 1) {
    return {
      isValid: false,
      error: 'Password cannot be empty',
      field: 'password',
      errors: ['Password cannot be empty'],
    };
  }

  return { isValid: true };
}

/**
 * ✅ SANITIZE: Return URL
 */
export function sanitizeReturnUrl(
  returnTo?: string,
  baseUrl: string = 'http://localhost:3001'
): string {
  if (returnTo) {
    try {
      const returnUrl = new URL(returnTo, baseUrl);
      // Only allow same-origin redirects
      if (returnUrl.origin === new URL(baseUrl).origin) {
        return returnUrl.toString();
      }
    } catch {
      // Invalid URL, fall through to default
    }
  }

  // Always redirect to organization selection page
  return `${baseUrl}/organizations`;
}

/**
 * ✅ EXTRACT: Request context
 */
export async function extractRequestContext(): Promise<{
  ipAddress: string;
  userAgent: string;
}> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();

    return {
      ipAddress:
        headersList.get('x-forwarded-for') ??
        headersList.get('x-real-ip') ??
        'unknown',
      userAgent: headersList.get('user-agent') ?? 'unknown',
    };
  } catch (error) {
    console.error('❌ extractRequestContext error:', error);
    return {
      ipAddress: 'unknown',
      userAgent: 'unknown',
    };
  }
}

/**
 * ✅ DETECT: Next.js redirect error
 */
export function isRedirectError(error: Error & { digest?: string }): boolean {
  return !!error.digest?.startsWith('NEXT_REDIRECT');
}
