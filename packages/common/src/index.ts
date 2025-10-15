// packages/common/src/index.ts

// === DOMAIN EXPORTS ===

// Domain - Billing
export * from './domain/billing/types/plan.types';
export * from './domain/billing/validators/billing.validators';

// Domain - Billing Interfaces (Foundation Layer)
export type {
  BillingEvent,
  BillingWebhookConfig,
  IBillingNotifier,
} from './types/billing.types';

// Domain - User
export * from './domain/user/types/preferences.types';
export * from './domain/user/types/user.types';
export * from './domain/user/validators/user.validators';

// === INFRASTRUCTURE EXPORTS ===

// Infrastructure - API
export * from './infrastructure/api/errors/api.errors';
export * from './infrastructure/api/types/api.types';
export * from './infrastructure/api/types/pagination.types';
