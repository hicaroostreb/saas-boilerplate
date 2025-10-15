/**
 * @fileoverview Testes para utilitários de número
 * Foco em formatação de moeda e números
 */

import { describe, expect, it } from 'vitest';
import {
  formatCentsToReais,
  formatCompactNumber,
  formatCurrency,
  formatEUR,
  formatInteger,
  formatNumber,
  formatPercentage,
  formatUSD,
} from '../number';

describe('Number Utils', () => {
  describe('formatCurrency', () => {
    it('should format BRL currency correctly', () => {
      const result = formatCurrency(1999.5);
      expect(result).toMatch(/R\$\s*1\.999,50/);
      expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
      expect(formatCurrency(1000000)).toMatch(/R\$\s*1\.000\.000,00/);
    });

    it('should handle currency options', () => {
      const result = formatCurrency(1999.5, { showSymbol: false });
      expect(result).toMatch(/1\.999,50/);
    });

    it('should throw error for invalid numbers', () => {
      expect(() => formatCurrency(NaN)).toThrow(
        'Valor deve ser um número válido'
      );
    });
  });

  describe('formatUSD', () => {
    it('should format USD currency correctly', () => {
      const result = formatUSD(1999.5);
      expect(result).toMatch(/\$1,999\.50/);
    });
  });

  describe('formatEUR', () => {
    it('should format EUR currency correctly', () => {
      const result = formatEUR(1999.5);
      expect(result).toMatch(/1\.999,50\s*€/);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with grouping', () => {
      expect(formatNumber(1999.5)).toMatch(/1\.999,\d+/);
      expect(formatNumber(1000000)).toMatch(/1\.000\.000/);
    });

    it('should handle formatting options', () => {
      const result = formatNumber(1999.567, { maximumFractionDigits: 2 });
      expect(result).toMatch(/1\.999,\d{2}/);
    });
  });

  describe('formatInteger', () => {
    it('should format as integer', () => {
      const result = formatInteger(1999.99);
      expect(result).toMatch(/2\.000/);
    });
  });

  describe('formatCompactNumber', () => {
    it('should format large numbers compactly', () => {
      expect(formatCompactNumber(1500)).toMatch(/1,5\s*mil/);
      expect(formatCompactNumber(1500000)).toMatch(/1,5\s*mi/);
      expect(formatCompactNumber(1500000000)).toMatch(/1,5\s*bi/);
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(15.5)).toBe('15,50%');
      expect(formatPercentage(100)).toBe('100,00%');
    });
  });

  describe('formatCentsToReais', () => {
    it('should convert cents to reais', () => {
      const result1 = formatCentsToReais(199950);
      const result2 = formatCentsToReais(0);
      expect(result1).toMatch(/R\$\s*1\.999,50/);
      expect(result2).toMatch(/R\$\s*0,00/);
    });
  });
});
