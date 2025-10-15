export type {
  LegacyRateLimitHeaders,
  RateLimitAlgorithm,
  RateLimitConfig,
  RateLimitHeaders,
  RateLimitRecord,
  RateLimitRequest,
  RateLimitResponse,
  RateLimitResult,
} from './domain/types/rate-limit.types.js';

export {
  RateLimitAlgorithmSchema,
  RateLimitConfigSchema,
  RateLimitRecordSchema,
  RateLimitResultSchema,
} from './domain/types/rate-limit.types.js';

export {
  RateLimitDomainError,
  RateLimitStorageError,
  RateLimitValidationError,
} from './domain/types/errors.js';

export type { IRateLimitService } from './domain/services/rate-limit.service.js';

export { RateLimitService } from './domain/services/rate-limit.service.js';

export type {
  HealthCheckResult,
  IRateLimitRepository,
} from './domain/ports/rate-limit-repository.port.js';

export type {
  AlgorithmConfig,
  AlgorithmResult,
  IRateLimitAlgorithm,
} from './domain/ports/rate-limit-algorithm.port.js';

export type { IKeyGenerator } from './domain/ports/key-generator.port.js';

export type { ILogger, LogContext } from './domain/ports/logger.port.js';

export { RateLimitEntity } from './domain/entities/rate-limit.entity.js';

export {
  MemoryRateLimitGateway,
  type MemoryGatewayOptions,
} from './infrastructure/gateways/memory.gateway.js';

export {
  RedisRateLimitGateway,
  type RedisGatewayOptions,
} from './infrastructure/gateways/redis.gateway.js';

export {
  createFixedWindow,
  FixedWindowAlgorithm,
  type FixedWindowConfig,
} from './infrastructure/algorithms/fixed-window.algorithm.js';

export {
  createSlidingWindow,
  SlidingWindowAlgorithm,
  type RequestEntry,
  type SlidingWindowConfig,
} from './infrastructure/algorithms/sliding-window.algorithm.js';

export {
  createTokenBucket,
  TokenBucketAlgorithm,
  type TokenBucketConfig,
  type TokenBucketState,
} from './infrastructure/algorithms/token-bucket.algorithm.js';

export { ConsoleLoggerAdapter } from './infrastructure/logger/console-logger.adapter.js';

export {
  createMultipleRateLimits,
  createRateLimitMiddleware,
  type RateLimitMiddlewareOptions,
} from './infrastructure/middleware/rate-limit.middleware.js';

export {
  IdentifierExtractors,
  type IdentifierExtractor,
} from './infrastructure/middleware/identifier-extractors.js';

export {
  DefaultRateLimitHandlers,
  type RateLimitContext,
  type RateLimitHandler,
} from './infrastructure/middleware/rate-limit-handlers.js';

export {
  MiddlewareUtils,
  type NextFunction,
} from './infrastructure/middleware/middleware-utils.js';

export {
  createExpressRateLimit,
  createFastifyRateLimit,
  createNextRateLimit,
} from './infrastructure/middleware/framework-adapters.js';

export {
  createKeyGenerator,
  defaultKeyGenerator,
  KeyGenerator,
  type KeyGeneratorOptions,
} from './shared/utils/key-generator.util.js';

export { IpExtractor } from './shared/utils/ip-extractor.util.js';

export { TIME_UNITS, type TimeUnit } from './shared/constants/time-units.js';

export {
  createMemoryRateLimiter,
  createRateLimiter,
  createRedisRateLimiter,
} from './factories/rate-limiter.factory.js';

export { RateLimiterPresets } from './factories/preset.factory.js';

export {
  createCompleteRateLimit,
  type CompleteSetupOptions,
} from './factories/complete-setup.factory.js';

import { createCompleteRateLimit } from './factories/complete-setup.factory.js';
import { RateLimiterPresets } from './factories/preset.factory.js';
import {
  createMemoryRateLimiter,
  createRateLimiter,
  createRedisRateLimiter,
} from './factories/rate-limiter.factory.js';

export const RATE_LIMITER_VERSION = '1.0.0';

export const RATE_LIMITER_INFO = {
  name: '@workspace/rate-limiter',
  version: RATE_LIMITER_VERSION,
  description:
    'Enterprise-grade rate limiting package following Clean Architecture',
  algorithms: ['fixed-window', 'sliding-window', 'token-bucket'] as const,
  storage: ['memory', 'redis'] as const,
  frameworks: ['express', 'fastify', 'next.js', 'generic'] as const,
};

const RateLimiter = {
  create: createRateLimiter,
  createMemory: createMemoryRateLimiter,
  createRedis: createRedisRateLimiter,
  createComplete: createCompleteRateLimit,
  presets: RateLimiterPresets,
  info: RATE_LIMITER_INFO,
};

export default RateLimiter;
