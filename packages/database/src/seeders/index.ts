// packages/database/src/seeders/index.ts
// ============================================
// SEEDERS ORCHESTRATOR - ENTERPRISE
// ============================================

import type { Database } from '../connection';
import { getDb } from '../connection';
import type { SeedOptions } from '../index';

// Seeder imports
import { developmentSeeder } from './development';
import { productionSeeder } from './production';
import { testingSeeder } from './testing';

// ENTERPRISE: Seeder registry
const SEEDERS = {
  development: developmentSeeder,
  testing: testingSeeder,
  production: productionSeeder,
} as const;

export async function runSeeder(
  environment: keyof typeof SEEDERS,
  options: Omit<SeedOptions, 'environment'> = {}
): Promise<void> {
  const db = await getDb();
  const seeder = SEEDERS[environment];

  if (!seeder) {
    throw new Error(`Seeder not found for environment: ${environment}`);
  }

  const fullOptions: SeedOptions = {
    environment,
    ...options,
  };

  if (fullOptions.verbose) {
    console.log(`Running ${environment} seeder...`);
  }

  await seeder(db, fullOptions);

  if (fullOptions.verbose) {
    console.log(`${environment} seeder completed`);
  }
}

export async function runAllSeeders(
  options: SeedOptions
): Promise<void> {
  await runSeeder(options.environment, options);
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const environment = (args[0] || 'development') as keyof typeof SEEDERS;
  const forceFlag = args.includes('--force');
  const verboseFlag = args.includes('--verbose');

  if (!SEEDERS[environment]) {
    console.error(`Invalid environment: ${environment}`);
    console.error('Available environments:', Object.keys(SEEDERS).join(', '));
    process.exit(1);
  }

  runAllSeeders({
    environment,
    force: forceFlag,
    verbose: verboseFlag || true,
  })
    .then(() => {
      console.log('All seeders completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}
