/**
 * @fileoverview Testes para utilitários de string
 * Validação de formatação e sanitização
 */

import { describe, expect, it } from 'vitest';
import {
  capitalize,
  formatCPF,
  formatPhone,
  removeAccents,
  slugify,
  truncate,
} from '../string';

describe('String Utils', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello world')).toBe('Hello world');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('')).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(capitalize(123 as unknown as string)).toBe(123);
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('This is a very long text', 10)).toBe('This is...');
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should handle edge cases', () => {
      expect(truncate('123', 3)).toBe('123');
      expect(truncate('1234', 3)).toBe('...');
    });
  });

  describe('removeAccents', () => {
    it('should remove accents from text', () => {
      expect(removeAccents('João')).toBe('Joao');
      expect(removeAccents('Ação')).toBe('Acao');
      expect(removeAccents('Coração')).toBe('Coracao');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Meu Título Especial')).toBe('meu-titulo-especial');
      expect(slugify('João & Maria')).toBe('joao-maria');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('should handle special characters', () => {
      const result = slugify('Test!@#$%^&*()_+');
      // Test that it removes special chars and keeps only valid slug chars
      expect(result).toMatch(/^[a-z0-9-]*$/);
      expect(result).toContain('test');
    });
  });

  describe('formatCPF', () => {
    it('should format CPF correctly', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
    });

    it('should handle non-string inputs', () => {
      expect(formatCPF(123 as unknown as string)).toBe(123);
    });
  });

  describe('formatPhone', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
      expect(formatPhone('1187654321')).toBe('(11) 8765-4321');
    });

    it('should return original for invalid lengths', () => {
      expect(formatPhone('123')).toBe('123');
    });
  });
});
