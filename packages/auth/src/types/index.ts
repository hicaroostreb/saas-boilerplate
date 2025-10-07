// ============================================
// SCHEMAS (CRITICAL - FIRST EXPORT)
// ============================================
export * from './schemas';

// ============================================
// EXISTING TYPES (sem conflitos)
// ============================================
export * from './base';
export * from './config.types';
// Não exportar session.types para evitar conflitos com base

// ============================================
// UTILITY TYPES
// ============================================
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// ============================================
// VALIDATION RESULT TYPE
// ============================================
export type ValidationResult = {
  isValid: boolean;
  issues: string[];
  requiresMFA?: boolean;
};
