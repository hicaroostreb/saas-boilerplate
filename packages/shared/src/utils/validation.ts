/**
 * @fileoverview Utilitários para validação
 * Funções helpers para validações customizadas genéricas
 */

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

/**
 * Valida se string não está vazia após trim
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Valida email usando regex otimizada
 */
export const isValidEmail = (email: string): boolean => {
  if (typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de slug (organização, URL-friendly)
 */
export const isValidSlug = (slug: string): boolean => {
  if (typeof slug !== 'string') {
    return false;
  }

  const slugRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return slugRegex.test(slug);
};

/**
 * Valida senha com critérios de segurança
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: Object.freeze(errors),
  };
};

/**
 * Valida email com resultado detalhado
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors: Object.freeze(errors),
  };
};

/**
 * Valida nome de organização
 */
export const validateOrganizationName = (name: string): ValidationResult => {
  const errors: string[] = [];

  if (!name) {
    errors.push('Organization name is required');
  } else if (name.length < 2) {
    errors.push('Organization name must be at least 2 characters long');
  } else if (name.length > 50) {
    errors.push('Organization name must be less than 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors: Object.freeze(errors),
  };
};

/**
 * Valida slug com resultado detalhado
 */
export const validateSlug = (slug: string): ValidationResult => {
  const errors: string[] = [];

  if (!slug) {
    errors.push('Slug is required');
  } else if (!isValidSlug(slug)) {
    errors.push(
      'Slug can only contain lowercase letters, numbers, and hyphens'
    );
  } else if (slug.length < 3) {
    errors.push('Slug must be at least 3 characters long');
  } else if (slug.length > 30) {
    errors.push('Slug must be less than 30 characters');
  }

  return {
    isValid: errors.length === 0,
    errors: Object.freeze(errors),
  };
};

/**
 * Gera ID seguro aleatório
 */
export const generateSecureId = (length = 16): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Valida se valor é obrigatório (não null, undefined ou string vazia)
 */
export const validateRequired = (value: unknown): boolean => {
  return value !== null && value !== undefined && value !== '';
};

/**
 * Valida range de números
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return typeof value === 'number' && value >= min && value <= max;
};

/**
 * Valida URL básica
 */
export const isValidUrl = (url: string): boolean => {
  if (typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
