import type { ILogger } from '../domain/ports/logger.port.js';
import { RateLimitService } from '../domain/services/rate-limit.service.js';
import {
  RateLimitConfigSchema,
  type RateLimitConfig,
} from '../domain/types/rate-limit.types.js';
import { FixedWindowAlgorithm } from '../infrastructure/algorithms/fixed-window.algorithm.js';
import { SlidingWindowAlgorithm } from '../infrastructure/algorithms/sliding-window.algorithm.js';
import { TokenBucketAlgorithm } from '../infrastructure/algorithms/token-bucket.algorithm.js';
import { MemoryRateLimitGateway } from '../infrastructure/gateways/memory.gateway.js';
import {
  RedisRateLimitGateway,
  type RedisGatewayOptions,
} from '../infrastructure/gateways/redis.gateway.js';
import { KeyGenerator } from '../shared/utils/key-generator.util.js';

export function createMemoryRateLimiter(
  config: Partial<RateLimitConfig>,
  options?: {
    cleanupIntervalMs?: number;
    logger?: ILogger;
  }
): RateLimitService {
  const validatedConfig = RateLimitConfigSchema.parse(config);

  const repository = new MemoryRateLimitGateway({
    cleanupIntervalMs:
      options?.cleanupIntervalMs ?? Math.min(validatedConfig.windowMs, 60000),
    logger: options?.logger,
  });

  const algorithm = createAlgorithm(validatedConfig);
  const keyGenerator = new KeyGenerator();

  return new RateLimitService(
    repository,
    algorithm,
    keyGenerator,
    validatedConfig
  );
}

export function createRedisRateLimiter(
  config: Partial<RateLimitConfig>,
  redisOptions?: RedisGatewayOptions
): RateLimitService {
  const validatedConfig = RateLimitConfigSchema.parse(config);

  const repository = new RedisRateLimitGateway(redisOptions);
  const algorithm = createAlgorithm(validatedConfig);
  const keyGenerator = new KeyGenerator();

  return new RateLimitService(
    repository,
    algorithm,
    keyGenerator,
    validatedConfig
  );
}

export function createRateLimiter(
  config: Partial<RateLimitConfig>,
  storageOptions?: {
    type?: 'memory' | 'redis';
    redis?: RedisGatewayOptions;
    memory?: { cleanupIntervalMs?: number; logger?: ILogger };
  }
): RateLimitService {
  const validatedConfig = RateLimitConfigSchema.parse(config);

  const storageType =
    storageOptions?.type ??
    validatedConfig.store ??
    (validatedConfig.redisUrl ? 'redis' : 'memory');

  switch (storageType) {
    case 'redis': {
      return createRedisRateLimiter(validatedConfig, storageOptions?.redis);
    }
    case 'memory':
    default: {
      return createMemoryRateLimiter(validatedConfig, storageOptions?.memory);
    }
  }
}

function createAlgorithm(config: RateLimitConfig) {
  switch (config.algorithm) {
    case 'sliding-window':
      return new SlidingWindowAlgorithm({
        windowMs: config.windowMs,
        maxRequests: config.maxRequests,
      });
    case 'token-bucket':
      return new TokenBucketAlgorithm({
        capacity: config.maxRequests,
        refillRate: Math.ceil(config.maxRequests / (config.windowMs / 1000)),
        refillIntervalMs: 1000,
      });
    case 'fixed-window':
    default:
      return new FixedWindowAlgorithm({
        windowMs: config.windowMs,
        maxRequests: config.maxRequests,
      });
  }
}
