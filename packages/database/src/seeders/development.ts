// packages/database/src/seeders/development.ts
// ============================================
// DEVELOPMENT SEEDERS - SRP: APENAS DEV DATA
// Enterprise Multi-Tenancy and Soft Delete
// ============================================

import type { Database } from '../connection';
import type { SeedOptions } from '../index';
import { runScript } from '../scripts/seed';

export async function developmentSeeder(
  _db: Database,
  options: SeedOptions
): Promise<void> {
  if (options.verbose) {
    console.log('Running Achromatic Enterprise development seed...');
  }

  // Execute seu seed existente
  await runScript();

  if (options.verbose) {
    console.log('Achromatic development seed completed');
  }
}
