// packages/database/src/scripts/seed.ts
// ============================================
// SEED SCRIPT - FIXED MAIN DETECTION
// ============================================

import { config } from 'dotenv';
import { resolve } from 'path';
import { getDb } from '../connection/index.js';
import { developmentSeeder } from '../seeders/development.js';
import { productionSeeder } from '../seeders/production.js';
import { runTestingSeed } from '../seeders/testing.js';

// Load environment variables from root
const envPath = resolve(process.cwd(), '../../.env.local');
config({ path: envPath });

export interface SeedResult {
  success: boolean;
  environment: string;
  recordsCreated: number;
  duration: number;
  errors?: string[];
}

async function runSeed(): Promise<SeedResult> {
  const startTime = Date.now();
  
  try {
    const environment = (process.env.NODE_ENV || 'development') as 'development' | 'testing' | 'production';
    const db = await getDb();
    
    console.log('Starting database seeding...');
    console.log(`   Environment: ${environment}`);
    console.log(`   Database: ${process.env.DATABASE_URL ? 'Connected' : 'No URL'}`);
    console.log('');

    let recordsCreated = 0;

    switch (environment) {
      case 'production':
        console.log('Running production seed...');
        recordsCreated = await productionSeeder(db);
        break;
        
      case 'testing':
        console.log('Running testing seed...');
        recordsCreated = await runTestingSeed(db);
        break;
        
      case 'development':
      default:
        console.log('Running development seed...');
        recordsCreated = await developmentSeeder(db);
        break;
    }

    const duration = Date.now() - startTime;
    
    console.log('');
    console.log('Seeding completed successfully!');
    console.log(`   Records created: ${recordsCreated}`);
    console.log(`   Duration: ${duration}ms`);

    return {
      success: true,
      environment,
      recordsCreated,
      duration,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('');
    console.error('Seeding failed!');
    console.error(`   Error: ${errorMessage}`);
    console.error(`   Duration: ${duration}ms`);
    
    if (error instanceof Error && error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }

    return {
      success: false,
      environment: process.env.NODE_ENV || 'development',
      recordsCreated: 0,
      duration,
      errors: [errorMessage],
    };
  }
}

// FORÇA EXECUÇÃO DIRETA - SEM DETECÇÃO DE MAIN
console.log('SEEDER: Starting execution...');
runSeed()
  .then((result) => {
    console.log('SEEDER: Execution completed');
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('SEEDER: Fatal error:', error);
    process.exit(1);
  });

export { runSeed };
