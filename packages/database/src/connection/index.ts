// packages/database/src/connection/index.ts
// ============================================
// CONNECTION BARREL EXPORTS (REFACTORED)
// ============================================

export {
  DatabaseConnection,
  closeConnection,
  db,
  getConnectionInfo,
  getDatabaseConnection,
  getDb,
  healthCheck,
  type Database,
} from './database.connection';

export {
  DatabaseError,
  formatDatabaseError,
  isCheckConstraintError,
  isConnectionError,
  isDeadlockError,
  isDuplicateKeyError,
  isForeignKeyError,
  isNotNullError,
  isUniqueConstraintError,
  withQueryPerformance,
} from './errors';

export {
  createDatabaseConfig,
  createPostgresTypes,
  type BuildContext,
  type DatabaseConfig,
  type PoolConfig,
  type SSLConfig,
} from './config';

export {
  AllowSystemContext,
  RequiresTenantContext,
  TenantContextError,
  tenantContext,
  type TenantContext,
} from './tenant-context';
