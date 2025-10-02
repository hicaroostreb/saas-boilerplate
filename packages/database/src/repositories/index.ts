// packages/database/src/repositories/index.ts

// ============================================
// REPOSITORIES MASTER BARREL EXPORTS
// ============================================

// Contracts (interfaces)
export * from './contracts';

// Implementations
export * from './implementations';

// Repository factory
import type { Database } from '../connection';
import { DrizzleUserRepository } from './implementations';

export class RepositoryFactory {
  constructor(private db: Database) {}

  createUserRepository() {
    return new DrizzleUserRepository(this.db);
  }

  // Add more repository factories as we implement them
}

// Convenience function
export function createRepositories(db: Database) {
  return new RepositoryFactory(db);
}
