// packages/database/src/seeders/development.ts
// ============================================
// DEVELOPMENT SEED - SCHEMA COMPLIANT
// ============================================

import type { Database } from '../connection/index.js';
import { runTestingSeed } from './testing.js';

// Development seeder uses testing data for rich development experience
export async function developmentSeeder(db: Database): Promise<number> {
  console.log('Development seed: Creating rich development data...');
  
  try {
    // Use testing seed data for development
    const recordsCreated = await runTestingSeed(db);
    
    console.log(`Development seed completed: ${recordsCreated} records created`);
    return recordsCreated;
    
  } catch (error) {
    console.error('Development seed failed:', error);
    throw error;
  }
}
