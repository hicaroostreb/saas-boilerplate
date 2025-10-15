/**
 * @fileoverview Testes para utilitários de data
 * Cobertura de funções críticas com casos edge
 */

import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateISO,
  formatDateTime,
  formatDateTimeISO,
  formatMonthYear,
  formatRelativeTime,
  formatTime,
} from '../date';

describe('Date Utils', () => {
  const testDate = new Date('2024-01-15T14:30:00.000Z');
  const testDateString = '2024-01-15T14:30:00.000Z';

  describe('formatDate', () => {
    it('should format Date object correctly', () => {
      expect(formatDate(testDate)).toBe('15/01/2024');
    });

    it('should format string date correctly', () => {
      expect(formatDate(testDateString)).toBe('15/01/2024');
    });

    it('should throw error for invalid date', () => {
      expect(() => formatDate('invalid-date')).toThrow(
        'Data inválida fornecida'
      );
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      expect(formatDateTime(testDate)).toMatch(/15\/01\/2024 às \d{2}:\d{2}/);
    });

    it('should throw error for invalid date', () => {
      expect(() => formatDateTime('invalid')).toThrow(
        'Data inválida fornecida'
      );
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(testDate)).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatDateISO', () => {
    it('should format date in ISO format', () => {
      expect(formatDateISO(testDate)).toBe('2024-01-15');
    });
  });

  describe('formatDateTimeISO', () => {
    it('should format datetime in ISO format', () => {
      expect(formatDateTimeISO(testDate)).toBe('2024-01-15T14:30:00.000Z');
    });
  });

  describe('formatMonthYear', () => {
    it('should format month and year in Portuguese', () => {
      expect(formatMonthYear(testDate)).toBe('janeiro 2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time correctly', () => {
      const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const result = formatRelativeTime(pastDate);
      expect(result).toMatch(/há \d+ dias?/);
    });
  });
});
