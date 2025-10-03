/**
 * @workspace/ui/utils - Enterprise Utilities
 *
 * Utilitários fundamentais para o design system.
 * Essa camada só pode importar tokens - mantenha puro.
 */

// === CN UTILITIES ===
export {
  cn,
  cnFast,
  createVariants,
  default,
  disabled,
  focusRing,
  interactive,
} from './cn';
export type { ClassValue } from './cn';

// === RE-EXPORTS FOR CONVENIENCE ===
// Re-export clsx and twMerge for advanced usage
export { clsx } from 'clsx';
export { twMerge } from 'tailwind-merge';
