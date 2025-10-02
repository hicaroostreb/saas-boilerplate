// packages/rate-limiter/src/index.ts

// ===== DOMAIN EXPORTS =====

// Types and Interfaces
export type {
  IRateLimitRepository,
  IRateLimitService,
  IStorageGateway,
  LegacyRateLimitHeaders,
  RateLimitAlgorithm,
  RateLimitConfig,
  RateLimitHeaders,
  RateLimitMiddlewareOptions,
  RateLimitRecord,
  RateLimitResult,
} from './domain/types/rate-limit.types.js';

export {
  RateLimitAlgorithmSchema,
  RateLimitConfigSchema,
  RateLimitDomainError,
  RateLimitRecordSchema,
  RateLimitResultSchema,
  RateLimitStorageError,
  RateLimitValidationError,
} from './domain/types/rate-limit.types.js';

// Entities
export { RateLimitEntity } from './domain/entities/rate-limit.entity.js';

// Services
export { RateLimitService } from './domain/services/rate-limit.service.js';

// Repository Interfaces
export { BaseRateLimitRepository } from './domain/repositories/rate-limit.repository.js';

// ===== INFRASTRUCTURE EXPORTS =====

// Gateways
export { MemoryRateLimitGateway } from './infrastructure/gateways/memory.gateway.js';

export {
  RedisRateLimitGateway,
  type RedisGatewayOptions,
} from './infrastructure/gateways/redis.gateway.js';

// Algorithms
export {
  createFixedWindow,
  FixedWindowAlgorithm,
  FixedWindowUtils,
  type FixedWindowConfig,
  type FixedWindowResult,
} from './infrastructure/algorithms/fixed-window.algorithm.js';

export {
  createSlidingWindow,
  SlidingWindowAlgorithm,
  SlidingWindowUtils,
  type RequestEntry,
  type SlidingWindowConfig,
  type SlidingWindowResult,
} from './infrastructure/algorithms/sliding-window.algorithm.js';

export {
  createTokenBucket,
  TokenBucketAlgorithm,
  TokenBucketUtils,
  type TokenBucketConfig,
  type TokenBucketResult,
  type TokenBucketState,
} from './infrastructure/algorithms/token-bucket.algorithm.js';

// Middleware
export {
  createExpressRateLimit,
  createFastifyRateLimit,
  createMultipleRateLimits,
  createNextRateLimit,
  createRateLimitMiddleware,
  DefaultRateLimitHandlers,
  IdentifierExtractors,
  MiddlewareUtils,
  type IdentifierExtractor,
  type NextFunction,
  type RateLimitContext,
  type RateLimitHandler,
  type RateLimitRequest,
  type RateLimitResponse,
} from './infrastructure/middleware/rate-limit.middleware.js';

// ===== SHARED EXPORTS =====

// Utilities
export {
  createKeyGenerator,
  defaultKeyGenerator,
  KeyGenerator,
  KeyGeneratorUtils,
  type KeyGeneratorOptions,
  type ParsedKey,
} from './shared/utils/key-generator.util.js';

// ===== FACTORY FUNCTIONS =====

import { RateLimitService } from './domain/services/rate-limit.service.js';
import {
  RateLimitConfigSchema,
  type IRateLimitService,
  type RateLimitConfig,
} from './domain/types/rate-limit.types.js';
import { MemoryRateLimitGateway } from './infrastructure/gateways/memory.gateway.js';
import {
  RedisRateLimitGateway,
  type RedisGatewayOptions,
} from './infrastructure/gateways/redis.gateway.js';

/**
 * Factory function to create a complete rate limiter with memory storage
 */
export function createMemoryRateLimiter(
  config: Partial<RateLimitConfig>
): IRateLimitService {
  // Validate configuration with defaults
  const validatedConfig = RateLimitConfigSchema.parse(config);

  // Create memory gateway
  const gateway = new MemoryRateLimitGateway({
    cleanupIntervalMs: Math.min(validatedConfig.windowMs, 60000), // Cleanup at most every minute
  });

  // Create and return service
  return new RateLimitService(gateway, validatedConfig);
}

/**
 * Factory function to create a complete rate limiter with Redis storage
 */
export function createRedisRateLimiter(
  config: Partial<RateLimitConfig>,
  redisOptions?: RedisGatewayOptions
): IRateLimitService {
  // Validate configuration with defaults
  const validatedConfig = RateLimitConfigSchema.parse(config);

  // Create Redis gateway
  const gateway = new RedisRateLimitGateway(redisOptions);

  // Create and return service
  return new RateLimitService(gateway, validatedConfig);
}

/**
 * Main factory function - auto-selects storage based on config
 */
export function createRateLimiter(
  config: Partial<RateLimitConfig>,
  storageOptions?: {
    type?: 'memory' | 'redis';
    redis?: RedisGatewayOptions;
    memory?: { cleanupIntervalMs?: number };
  }
): IRateLimitService {
  // Validate configuration with defaults
  const validatedConfig = RateLimitConfigSchema.parse(config);

  // Determine storage type
  const storageType =
    storageOptions?.type ??
    validatedConfig.store ??
    (validatedConfig.redisUrl ? 'redis' : 'memory');

  switch (storageType) {
    case 'redis':
      return createRedisRateLimiter(validatedConfig, storageOptions?.redis);

    case 'memory':
    default:
      return createMemoryRateLimiter(validatedConfig);
  }
}

/**
 * Quick setup functions for common scenarios
 */
export const RateLimiterPresets = {
  /**
   * API rate limiting - 100 requests per minute with Redis
   */
  api: (redisOptions?: RedisGatewayOptions): IRateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
        algorithm: 'sliding-window',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },

  /**
   * Strict API limiting - 50 requests per minute
   */
  strict: (redisOptions?: RedisGatewayOptions): IRateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: 60 * 1000,
        maxRequests: 50,
        algorithm: 'fixed-window',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },

  /**
   * Burst-friendly limiting - allows traffic spikes
   */
  burstFriendly: (redisOptions?: RedisGatewayOptions): IRateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: 60 * 1000,
        maxRequests: 200,
        algorithm: 'token-bucket',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },

  /**
   * Development/testing - in-memory with generous limits
   */
  development: (): IRateLimitService => {
    return createMemoryRateLimiter({
      windowMs: 60 * 1000,
      maxRequests: 1000,
      algorithm: 'sliding-window',
      standardHeaders: true,
      store: 'memory',
    });
  },

  /**
   * Authentication rate limiting - very strict
   */
  auth: (redisOptions?: RedisGatewayOptions): IRateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        algorithm: 'fixed-window',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },

  /**
   * Global rate limiting across all endpoints
   */
  global: (
    maxRequestsPerMinute: number,
    redisOptions?: RedisGatewayOptions
  ): IRateLimitService => {
    return createRedisRateLimiter(
      {
        windowMs: 60 * 1000,
        maxRequests: maxRequestsPerMinute,
        algorithm: 'sliding-window',
        standardHeaders: true,
        store: 'redis',
      },
      redisOptions
    );
  },
};

/**
 * Utility function to create complete middleware setup
 */
export function createCompleteRateLimit(options: {
  config: Partial<RateLimitConfig>;
  storage?: {
    type?: 'memory' | 'redis';
    redis?: RedisGatewayOptions;
    memory?: { cleanupIntervalMs?: number };
  };
  middleware?: {
    identifierExtractor?: unknown;
    onLimitReached?: unknown;
    framework?: 'express' | 'fastify' | 'next';
  };
}) {
  // Create the service
  const service = createRateLimiter(options.config, options.storage);

  // Create middleware based on framework
  let middleware;
  const {
    createExpressRateLimit,
    createFastifyRateLimit,
    createNextRateLimit,
  } = require('./infrastructure/middleware/rate-limit.middleware.js');

  switch (options.middleware?.framework) {
    case 'fastify':
      middleware = createFastifyRateLimit(service, options.middleware);
      break;
    case 'next':
      middleware = createNextRateLimit(service, options.middleware);
      break;
    case 'express':
    default:
      middleware = createExpressRateLimit(service, options.middleware);
      break;
  }

  return {
    service,
    middleware,
    // Helper methods
    checkLimit: (identifier: string) => service.checkLimit(identifier),
    resetLimit: (identifier: string) => service.resetLimit(identifier),
    getConfig: () => service.getConfig(),
    healthCheck: () => service.getHealthStatus(),
  };
}

// ===== VERSION AND METADATA =====

export const RATE_LIMITER_VERSION = '1.0.0';

export const RATE_LIMITER_INFO = {
  name: '@workspace/rate-limiter',
  version: RATE_LIMITER_VERSION,
  description:
    'Enterprise-grade rate limiting package following Clean Architecture',
  algorithms: ['fixed-window', 'sliding-window', 'token-bucket'],
  storage: ['memory', 'redis'],
  frameworks: ['express', 'fastify', 'next.js', 'generic'],
};

// ===== DEFAULT EXPORT FOR SIMPLE USAGE =====

const RateLimiter = {
  // Main factory
  create: createRateLimiter,

  // Storage-specific factories
  createMemory: createMemoryRateLimiter,
  createRedis: createRedisRateLimiter,

  // Complete setup
  createComplete: createCompleteRateLimit,

  // Presets
  presets: RateLimiterPresets,

  // Metadata
  info: RATE_LIMITER_INFO,
};

export default RateLimiter;
