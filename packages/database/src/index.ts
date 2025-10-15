// packages/database/src/index.ts
// ============================================
// DATABASE PACKAGE MAIN BARREL (REFACTORED)
// ============================================

// Schemas (com todos os tipos)
export * from './schemas';

// Entities (sem PublicUser/UserProfile pois schemas já exporta)
export { MembershipEntity, OrganizationEntity, UserEntity } from './entities';
export type {
  MemberPermission,
  OrganizationLimits,
  OrganizationQuotaStatus,
  OrganizationUsage,
  ResourceType,
} from './entities';

// Repositories
export * from './repositories';

// Connection
export * from './connection';
