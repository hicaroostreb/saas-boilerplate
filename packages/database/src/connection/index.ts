// packages/database/src/connection/index.ts
// ============================================
// CONNECTION BARREL EXPORTS - ENTERPRISE
// ============================================

// Core database connection
export {
  getDatabaseConnection,
  getDb,
  db,
  healthCheck,
  closeConnection,
  getConnectionInfo,
  type Database,
} from './database.connection';

// Configuration
export {
  createDatabaseConfig,
  createPostgresTypes,
  type DatabaseConfig,
  type PoolConfig,
  type SSLConfig,
} from './config';

// Error handling
export {
  DatabaseError,
  isDuplicateKeyError,
  isForeignKeyError,
  isNotNullError,
  isCheckConstraintError,
  isUniqueConstraintError,
  isDeadlockError,
  isConnectionError,
  withQueryPerformance,
  formatDatabaseError,
} from './errors';
