// packages/database/src/types.ts
// ============================================
// DATABASE TYPES - SHARED TYPES
// ============================================

export interface SeedOptions {
  environment?: 'development' | 'testing' | 'production';
  force?: boolean;
  verbose?: boolean;
}
