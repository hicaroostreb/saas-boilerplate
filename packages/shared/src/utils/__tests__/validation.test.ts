/**
 * @fileoverview Testes para utilitários de validação
 * Cobertura de validações críticas
 */

import { describe, expect, it } from 'vitest';
import {
  generateSecureId,
  isNonEmptyString,
  isValidEmail,
  isValidSlug,
  isValidUrl,
  validateEmail,
  validateNumberRange,
  validateOrganizationName,
  validatePassword,
  validateRequired,
  validateSlug,
} from '../validation';

describe('Validation Utils', () => {
  describe('isNonEmptyString', () => {
    it('should validate non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('  ')).toBe(false);
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidSlug', () => {
    it('should validate slugs', () => {
      expect(isValidSlug('valid-slug-123')).toBe(true);
      expect(isValidSlug('invalid_slug')).toBe(false);
      expect(isValidSlug('Invalid-Slug')).toBe(false);
      expect(isValidSlug('-invalid')).toBe(false);
      expect(isValidSlug('invalid-')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide detailed error messages', () => {
      const result = validatePassword('short');
      expect(result.errors).toContain(
        'Password must be at least 8 characters long'
      );
    });
  });

  describe('validateEmail', () => {
    it('should validate email with detailed result', () => {
      const validResult = validateEmail('user@example.com');
      expect(validResult.isValid).toBe(true);

      const invalidResult = validateEmail('invalid');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain(
        'Please enter a valid email address'
      );
    });
  });

  describe('validateOrganizationName', () => {
    it('should validate organization names', () => {
      const validResult = validateOrganizationName('My Company');
      expect(validResult.isValid).toBe(true);

      const invalidResult = validateOrganizationName('A');
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('validateSlug', () => {
    it('should validate slugs with detailed result', () => {
      const validResult = validateSlug('valid-slug');
      expect(validResult.isValid).toBe(true);

      const invalidResult = validateSlug('ab');
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('generateSecureId', () => {
    it('should generate secure IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();

      expect(id1).toHaveLength(16);
      expect(id2).toHaveLength(16);
      expect(id1).not.toBe(id2);
    });

    it('should respect custom length', () => {
      const id = generateSecureId(32);
      expect(id).toHaveLength(32);
    });
  });

  describe('validateRequired', () => {
    it('should validate required values', () => {
      expect(validateRequired('value')).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(false)).toBe(true);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
      expect(validateRequired('')).toBe(false);
    });
  });

  describe('validateNumberRange', () => {
    it('should validate number ranges', () => {
      expect(validateNumberRange(5, 1, 10)).toBe(true);
      expect(validateNumberRange(0, 1, 10)).toBe(false);
      expect(validateNumberRange(15, 1, 10)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(true);
    });
  });
});
