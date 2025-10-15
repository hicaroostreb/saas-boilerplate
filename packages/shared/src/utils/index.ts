/**
 * @fileoverview Utils centralizados do package shared
 * Re-exportações organizadas por categoria para facilitar imports
 */

// ===== DATE UTILITIES =====
export {
  formatDate,
  formatDateISO,
  formatDateTime,
  formatDateTimeISO,
  formatMonthYear,
  formatRelativeTime,
  formatTime,
} from './date';

// ===== FILE UTILITIES =====
export {
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
} from './file';

export type { FileInfo, FileSizeOptions } from './file';

// ===== NUMBER & CURRENCY UTILITIES =====
export {
  formatCentsToReais,
  formatCompactNumber,
  formatCurrency,
  formatEUR,
  formatInteger,
  formatNumber,
  formatPercentage,
  formatUSD,
} from './number';

export type { CurrencyOptions, NumberFormatOptions } from './number';

// ===== STRING UTILITIES =====
export {
  capitalize,
  formatCPF,
  formatPhone,
  removeAccents,
  slugify,
  truncate,
} from './string';

// ===== VALIDATION UTILITIES =====
export {
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
} from './validation';

export type { ValidationResult } from './validation';

// ===== CONVENIENCE GROUPED EXPORTS =====

// Import all functions for grouped exports
import {
  formatDate,
  formatDateISO,
  formatDateTime,
  formatDateTimeISO,
  formatMonthYear,
  formatRelativeTime,
  formatTime,
} from './date';

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
} from './file';

import {
  formatCentsToReais,
  formatCompactNumber,
  formatCurrency,
  formatEUR,
  formatInteger,
  formatNumber,
  formatPercentage,
  formatUSD,
} from './number';

import {
  capitalize,
  formatCPF,
  formatPhone,
  removeAccents,
  slugify,
  truncate,
} from './string';

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
} from './validation';

/**
 * Utilitários de data agrupados para conveniência
 */
export const dateUtils = {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTime,
  formatDateISO,
  formatDateTimeISO,
  formatMonthYear,
} as const;

/**
 * Utilitários de arquivo agrupados para conveniência
 */
export const fileUtils = {
  formatFileSize,
  getFileExtension,
  getFileNameWithoutExtension,
  isValidFileType,
  isValidFileSize,
  sanitizeFileName,
  generateUniqueFileName,
  getMimeType,
  isImageFile,
  createFileInfo,
} as const;

/**
 * Utilitários de número/moeda agrupados para conveniência
 */
export const numberUtils = {
  formatCurrency,
  formatUSD,
  formatEUR,
  formatNumber,
  formatInteger,
  formatCompactNumber,
  formatPercentage,
  formatCentsToReais,
} as const;

/**
 * Utilitários de string agrupados para conveniência
 */
export const stringUtils = {
  capitalize,
  truncate,
  removeAccents,
  slugify,
  formatCPF,
  formatPhone,
} as const;

/**
 * Utilitários de validação agrupados para conveniência
 */
export const validationUtils = {
  isNonEmptyString,
  isValidEmail,
  isValidSlug,
  validatePassword,
  validateEmail,
  validateOrganizationName,
  validateSlug,
  generateSecureId,
  validateRequired,
  validateNumberRange,
  isValidUrl,
} as const;
