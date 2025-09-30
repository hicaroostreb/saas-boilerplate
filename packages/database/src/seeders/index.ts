// ============================================
// SEEDERS MASTER INDEX - ENTERPRISE FRAMEWORK
// ============================================

import type { SeedOptions } from '../index';
import { seed as developmentSeed } from '../scripts/seed';
import { productionSeeder } from './production';
import { testingSeeder } from './testing';

// ============================================
// DEVELOPMENT SEEDER (Your existing seed)
// ============================================

const developmentSeeder = {
  name: 'Development (Achromatic)',
  async run(options: SeedOptions): Promise<void> {
    if (options.verbose) {
      console.log('🚀 Running Achromatic Enterprise development seed...');
    }

    // Execute your existing seed
    await developmentSeed();

    if (options.verbose) {
      console.log('✅ Achromatic development seed completed');
    }
  },
};

// ============================================
// ENVIRONMENT-SPECIFIC SEEDERS
// ============================================

const seedersByEnvironment = {
  development: [developmentSeeder],
  production: [productionSeeder],
  test: [testingSeeder],
} as const;

// ============================================
// MAIN SEEDER FUNCTION
// ============================================

export async function runAllSeeders(options: SeedOptions = {}): Promise<void> {
  const env = (process.env.NODE_ENV ||
    'development') as keyof typeof seedersByEnvironment;
  const seeders = seedersByEnvironment[env] ?? seedersByEnvironment.development;

  if (options.verbose) {
    console.log(`🌱 Running ${env} seeders...`);
    console.log(`   Environment: ${env}`);
    console.log(`   Force mode: ${options.force ? 'ON' : 'OFF'}`);
    console.log(`   Verbose mode: ${options.verbose ? 'ON' : 'OFF'}`);
    console.log('---');
  }

  for (const seeder of seeders) {
    try {
      if (options.verbose) {
        console.log(`🔄 Running seeder: ${seeder.name}`);
      }
      await seeder.run(options);
    } catch (error) {
      console.error(`❌ Seeder "${seeder.name}" failed:`, error);
      throw error;
    }
  }

  if (options.verbose) {
    console.log('---');
    console.log(`✅ All ${seeders.length} seeders completed successfully`);
  }
}

// ============================================
// INDIVIDUAL SEEDER EXPORTS
// ============================================

export { productionSeeder } from './production';
export { testingSeeder } from './testing';
export { developmentSeeder };

// ============================================
// CLI RUNNER (FOR STANDALONE EXECUTION)
// ============================================

if (import.meta.url === `file://${process.argv[1]}`) {
  // This file is being run directly
  const forceFlag = process.argv.includes('--force');
  const verboseFlag = process.argv.includes('--verbose');

  runAllSeeders({
    force: forceFlag,
    verbose: verboseFlag || true,
  })
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
