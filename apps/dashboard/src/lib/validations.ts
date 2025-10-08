export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePassword(password: string): ValidationResult {
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
    errors,
  };
}

export function validateOrganizationName(name: string): ValidationResult {
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
    errors,
  };
}

export function validateSlug(slug: string): ValidationResult {
  const errors: string[] = [];

  if (!slug) {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
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
    errors,
  };
}
