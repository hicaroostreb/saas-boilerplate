// packages/database/src/connection/index.ts
// ============================================
// CONNECTION BARREL EXPORTS (REFACTORED - SECURE)
// ============================================

export {
  DatabaseConnection,
  closeConnection,
  getConnectionInfo,
  getDatabaseConnection,
  getDb,
  getDbRaw,
  healthCheck,
  type Database,
  type DatabaseWrapper,
} from './database.connection';

// ❌ REMOVIDO: export { db } - Proxy singleton inseguro

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
