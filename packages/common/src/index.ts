// packages/common/src/index.ts

// === DOMAIN EXPORTS ===

// Domain - Billing
export * from './domain/billing/constants/billing.constants';
export * from './domain/billing/types/plan.types';
export * from './domain/billing/validators/billing.validators';

// Domain - User
export * from './domain/user/types/preferences.types';
export * from './domain/user/types/user.types';
export * from './domain/user/validators/user.validators';

// Domain - Common
export * from './domain/common/constants/app.constants';
export * from './domain/common/errors/domain.errors';

// === INFRASTRUCTURE EXPORTS ===

// Infrastructure - API
export * from './infrastructure/api/errors/api.errors';
export * from './infrastructure/api/types/api.types';
export * from './infrastructure/api/types/pagination.types';

// === SHARED EXPORTS ===

// Shared - Formatters
export * from './shared/formatters/currency.formatter';
export * from './shared/formatters/date.formatter';
export * from './shared/formatters/number.formatter';

// Shared - Utils
export * from './shared/utils/file.utils';
