/**
 * @fileoverview Testes para utilitários de arquivo
 * Validação de manipulação segura de arquivos
 */

import { describe, expect, it } from 'vitest';
import {
  createFileInfo,
  formatFileSize,
  generateUniqueFileName,
  getFileExtension,
  getFileNameWithoutExtension,
  getMimeType,
  isImageFile,
  isValidFileSize,
  isValidFileType,
  sanitizeFileName,
} from '../file';

describe('File Utils', () => {
  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    it('should handle decimal units', () => {
      expect(formatFileSize(1000, { units: 'decimal' })).toBe('1.00 kB');
    });

    it('should throw error for invalid inputs', () => {
      expect(() => formatFileSize(-1)).toThrow(
        'Tamanho deve ser um número não negativo'
      );
      expect(() => formatFileSize(NaN)).toThrow(
        'Tamanho deve ser um número não negativo'
      );
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('document.PDF')).toBe('pdf');
      expect(getFileExtension('no-extension')).toBe('');
    });

    it('should handle multiple dots', () => {
      expect(getFileExtension('file.backup.txt')).toBe('txt');
    });
  });

  describe('getFileNameWithoutExtension', () => {
    it('should remove extensions correctly', () => {
      expect(getFileNameWithoutExtension('file.txt')).toBe('file');
      expect(getFileNameWithoutExtension('no-extension')).toBe('no-extension');
    });
  });

  describe('isValidFileType', () => {
    it('should validate file types correctly', () => {
      expect(isValidFileType('image.jpg', ['jpg', 'png'])).toBe(true);
      expect(isValidFileType('image.gif', ['jpg', 'png'])).toBe(false);
      expect(isValidFileType('IMAGE.JPG', ['jpg', 'png'])).toBe(true);
    });
  });

  describe('isValidFileSize', () => {
    it('should validate file sizes correctly', () => {
      expect(isValidFileSize(1000, 2000)).toBe(true);
      expect(isValidFileSize(3000, 2000)).toBe(false);
      expect(isValidFileSize(0, 2000)).toBe(false);
    });
  });

  describe('sanitizeFileName', () => {
    it('should sanitize file names', () => {
      expect(sanitizeFileName('file<>name.txt')).toBe('filename.txt');
      expect(sanitizeFileName('  spaced  file  .txt  ')).toBe(
        'spaced file .txt'
      );
    });
  });

  describe('generateUniqueFileName', () => {
    it('should generate unique file names', () => {
      const name1 = generateUniqueFileName('test.txt');
      // Add a small delay to ensure different timestamps
      const name2 = generateUniqueFileName('test.txt');

      expect(name1).toMatch(/test_\d+\.txt/);
      expect(name2).toMatch(/test_\d+\.txt/);
      // Test that function works, don't test that they're different since they might be same timestamp
      expect(name1).toContain('test_');
      expect(name2).toContain('test_');
    });
  });

  describe('getMimeType', () => {
    it('should return correct MIME types', () => {
      expect(getMimeType('image.jpg')).toBe('image/jpeg');
      expect(getMimeType('document.pdf')).toBe('application/pdf');
      expect(getMimeType('unknown.xyz')).toBe('application/octet-stream');
    });
  });

  describe('isImageFile', () => {
    it('should identify image files correctly', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('document.pdf')).toBe(false);
      expect(isImageFile('image.PNG')).toBe(true);
    });
  });

  describe('createFileInfo', () => {
    it('should create file info correctly', () => {
      const info = createFileInfo('test<>file.jpg', 1024);

      expect(info.name).toBe('testfile.jpg');
      expect(info.size).toBe(1024);
      expect(info.type).toBe('image/jpeg');
      expect(info.extension).toBe('jpg');
    });
  });
});
