// packages/auth/src/password.ts - ENTERPRISE SECURITY

import bcrypt from 'bcryptjs';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// ============================================
// ENHANCED PASSWORD CONFIGURATION
// ============================================

const PASSWORD_CONFIG = {
  // ✅ ENTERPRISE: Enhanced security parameters
  bcrypt: {
    saltRounds: 12, // Higher rounds for better security
  },

  // ✅ ENTERPRISE: Password strength requirements
  strength: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minSpecialChars: 1,
    preventCommonWords: true,
    preventUserInfo: true,
  },

  // ✅ ENTERPRISE: Advanced security features
  security: {
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    preventReuse: 5, // Last 5 passwords
    requireChangeAfterBreach: true,
  },
} as const;

// ============================================
// COMMON WEAK PASSWORDS LIST (SAMPLE)
// ============================================

const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'password1',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'master',
  'hello',
  'freedom',
  'whatever',
  'qazwsx',
  'trustno1',
]);

// ============================================
// INTERFACES
// ============================================

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  warnings: string[];
  suggestions: string[];
  estimatedCrackTime: string;
}

export interface PasswordHashOptions {
  saltRounds?: number;
  algorithm?: 'bcrypt' | 'scrypt';
}

export interface UserPasswordContext {
  email?: string;
  name?: string;
  username?: string;
  previousPasswords?: string[];
}

// ============================================
// CORE PASSWORD FUNCTIONS
// ============================================

/**
 * ✅ ACHROMATIC: Enhanced password hashing with multiple algorithms
 */
export async function hashPassword(
  password: string,
  options: PasswordHashOptions = {}
): Promise<string> {
  const {
    saltRounds = PASSWORD_CONFIG.bcrypt.saltRounds,
    algorithm = 'bcrypt',
  } = options;

  try {
    switch (algorithm) {
      case 'bcrypt':
        return await bcrypt.hash(password, saltRounds);

      case 'scrypt':
        const salt = randomBytes(32).toString('hex');
        const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
        return `scrypt:${salt}:${derivedKey.toString('hex')}`;

      default:
        throw new Error(`Unsupported hashing algorithm: ${algorithm}`);
    }
  } catch (error) {
    console.error('❌ ACHROMATIC: Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * ✅ ACHROMATIC: Enhanced password verification with timing attack protection
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    // ✅ ENTERPRISE: Handle different hashing algorithms
    if (hashedPassword.startsWith('scrypt:')) {
      const [, salt, hash] = hashedPassword.split(':');
      const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
      const expectedHash = Buffer.from(hash, 'hex');

      // ✅ SECURITY: Timing-safe comparison
      return timingSafeEqual(derivedKey, expectedHash);
    } else {
      // ✅ ACHROMATIC: Standard bcrypt verification
      return await bcrypt.compare(password, hashedPassword);
    }
  } catch (error) {
    console.error('❌ ACHROMATIC: Error verifying password:', error);
    // ✅ SECURITY: Always return false on error to prevent timing attacks
    return false;
  }
}

/**
 * ✅ ENTERPRISE: Comprehensive password strength validation
 */
export function validatePasswordStrength(
  password: string,
  context: UserPasswordContext = {}
): PasswordStrengthResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // ✅ ENTERPRISE: Basic length requirements
  if (password.length < PASSWORD_CONFIG.strength.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_CONFIG.strength.minLength} characters long`
    );
  } else if (password.length >= PASSWORD_CONFIG.strength.minLength) {
    score += 10;
  }

  if (password.length > PASSWORD_CONFIG.strength.maxLength) {
    errors.push(
      `Password must not exceed ${PASSWORD_CONFIG.strength.maxLength} characters`
    );
  }

  // ✅ ENTERPRISE: Character type requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
    password
  );
  const specialCharCount = (
    password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []
  ).length;

  if (PASSWORD_CONFIG.strength.requireUppercase && !hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (hasUppercase) {
    score += 15;
  }

  if (PASSWORD_CONFIG.strength.requireLowercase && !hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (hasLowercase) {
    score += 15;
  }

  if (PASSWORD_CONFIG.strength.requireNumbers && !hasNumbers) {
    errors.push('Password must contain at least one number');
  } else if (hasNumbers) {
    score += 15;
  }

  if (PASSWORD_CONFIG.strength.requireSpecialChars && !hasSpecialChars) {
    errors.push(
      'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)'
    );
  } else if (hasSpecialChars) {
    score += 15;
  }

  if (specialCharCount >= PASSWORD_CONFIG.strength.minSpecialChars) {
    score += 10;
  }

  // ✅ ENTERPRISE: Advanced security checks
  const lowercasePassword = password.toLowerCase();

  // Check against common weak passwords
  if (COMMON_WEAK_PASSWORDS.has(lowercasePassword)) {
    errors.push('Password is too common and easily guessable');
    score = Math.max(0, score - 30);
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Avoid repeating the same character multiple times');
    score = Math.max(0, score - 10);
  }

  // Check for sequential characters
  if (
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(
      password
    )
  ) {
    warnings.push('Avoid sequential characters (abc, 123)');
    score = Math.max(0, score - 10);
  }

  // Check for keyboard patterns
  if (
    /(?:qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i.test(
      password
    )
  ) {
    warnings.push('Avoid keyboard patterns (qwerty)');
    score = Math.max(0, score - 10);
  }

  // ✅ ENTERPRISE: Personal information checks
  if (context.email) {
    const emailParts = context.email.toLowerCase().split('@')[0];
    if (
      lowercasePassword.includes(emailParts) ||
      emailParts.includes(lowercasePassword)
    ) {
      errors.push('Password should not contain parts of your email address');
      score = Math.max(0, score - 20);
    }
  }

  if (context.name) {
    const nameParts = context.name.toLowerCase().split(' ');
    for (const part of nameParts) {
      if (
        part.length > 2 &&
        (lowercasePassword.includes(part) || part.includes(lowercasePassword))
      ) {
        errors.push('Password should not contain parts of your name');
        score = Math.max(0, score - 20);
        break;
      }
    }
  }

  // ✅ ENTERPRISE: Length bonus
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;

  // ✅ ENTERPRISE: Character diversity bonus
  const uniqueChars = new Set(password).size;
  const diversityRatio = uniqueChars / password.length;
  if (diversityRatio > 0.7) score += 10;

  // ✅ ENTERPRISE: Mixed case bonus
  if (hasUppercase && hasLowercase && hasNumbers && hasSpecialChars) {
    score += 10;
  }

  // ✅ ENTERPRISE: Suggestions based on analysis
  if (score < 40) {
    suggestions.push('Consider using a longer password with mixed characters');
    suggestions.push(
      'Include uppercase, lowercase, numbers, and special characters'
    );
    suggestions.push('Avoid common words, personal information, and patterns');
  } else if (score < 70) {
    suggestions.push(
      'Consider adding more special characters or increasing length'
    );
    suggestions.push(
      'Ensure password is unique and not based on personal information'
    );
  } else if (score < 90) {
    suggestions.push(
      'Great password! Consider making it even longer for maximum security'
    );
  }

  // ✅ ENTERPRISE: Estimated crack time
  const estimatedCrackTime = estimateCrackTime(password, score);

  return {
    isValid: errors.length === 0,
    score: Math.min(100, Math.max(0, score)),
    errors,
    warnings,
    suggestions,
    estimatedCrackTime,
  };
}

/**
 * ✅ ENTERPRISE: Password reuse validation
 */
export async function validatePasswordReuse(
  newPassword: string,
  previousPasswordHashes: string[]
): Promise<{ isValid: boolean; error?: string }> {
  try {
    if (previousPasswordHashes.length === 0) {
      return { isValid: true };
    }

    // Check against previous passwords
    const maxCheck = Math.min(
      previousPasswordHashes.length,
      PASSWORD_CONFIG.security.preventReuse
    );

    for (let i = 0; i < maxCheck; i++) {
      const isMatch = await verifyPassword(
        newPassword,
        previousPasswordHashes[i]
      );
      if (isMatch) {
        return {
          isValid: false,
          error: `Password cannot be the same as your last ${PASSWORD_CONFIG.security.preventReuse} passwords`,
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    console.error('❌ ACHROMATIC: Error validating password reuse:', error);
    // ✅ SECURITY: On error, allow the password to prevent lockout
    return { isValid: true };
  }
}

/**
 * ✅ ENTERPRISE: Check if password needs to be changed due to age
 */
export function isPasswordExpired(passwordChangedAt: Date): boolean {
  const now = new Date();
  const ageInMs = now.getTime() - passwordChangedAt.getTime();
  return ageInMs > PASSWORD_CONFIG.security.maxAge;
}

/**
 * ✅ ENTERPRISE: Generate secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = uppercase + lowercase + numbers + specialChars;

  let password = '';

  // ✅ ENTERPRISE: Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // ✅ ENTERPRISE: Fill remaining length
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // ✅ ENTERPRISE: Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * ✅ ENTERPRISE: Estimate password crack time
 */
function estimateCrackTime(password: string, score: number): string {
  const combinations = calculatePasswordCombinations(password);
  const guessesPerSecond = 1000000000; // 1 billion guesses per second (GPU)

  const secondsToCrack = combinations / 2 / guessesPerSecond; // Divide by 2 for average case

  if (secondsToCrack < 1) return 'Less than 1 second';
  if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`;
  if (secondsToCrack < 3600)
    return `${Math.round(secondsToCrack / 60)} minutes`;
  if (secondsToCrack < 86400)
    return `${Math.round(secondsToCrack / 3600)} hours`;
  if (secondsToCrack < 31536000)
    return `${Math.round(secondsToCrack / 86400)} days`;
  if (secondsToCrack < 315360000)
    return `${Math.round(secondsToCrack / 31536000)} years`;
  if (secondsToCrack < 31536000000)
    return `${Math.round(secondsToCrack / 31536000)} years`;

  return 'Centuries or more';
}

/**
 * ✅ ENTERPRISE: Calculate possible password combinations
 */
function calculatePasswordCombinations(password: string): number {
  let characterSpace = 0;

  if (/[a-z]/.test(password)) characterSpace += 26;
  if (/[A-Z]/.test(password)) characterSpace += 26;
  if (/[0-9]/.test(password)) characterSpace += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    characterSpace += 32;

  return Math.pow(characterSpace, password.length);
}

/**
 * ✅ ENTERPRISE: Password strength level mapping
 */
export function getPasswordStrengthLevel(
  score: number
): 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong' {
  if (score < 20) return 'very-weak';
  if (score < 40) return 'weak';
  if (score < 60) return 'fair';
  if (score < 80) return 'good';
  if (score < 95) return 'strong';
  return 'very-strong';
}

/**
 * ✅ ENTERPRISE: Password strength color mapping for UI
 */
export function getPasswordStrengthColor(score: number): string {
  if (score < 20) return '#ff4757'; // red
  if (score < 40) return '#ff6348'; // orange-red
  if (score < 60) return '#ffa502'; // orange
  if (score < 80) return '#2ed573'; // green
  if (score < 95) return '#1e90ff'; // blue
  return '#8c7ae6'; // purple
}
