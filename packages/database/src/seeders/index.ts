// packages/database/src/seeders/index.ts
// ============================================
// SEEDERS BARREL EXPORTS - FIXED IMPORTS
// ============================================

export { developmentSeeder } from './development';
export { productionSeeder } from './production';
export { runTestingSeed } from './testing';

// Re-export for convenience
export type { SeedResult } from '../scripts/seed';

// Default seeder based on environment
export async function runSeeder() {
  const { runSeed } = await import('../scripts/seed');
  return runSeed();
}
