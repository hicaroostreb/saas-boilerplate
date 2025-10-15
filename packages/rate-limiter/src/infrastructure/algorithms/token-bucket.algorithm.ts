import type {
  AlgorithmConfig,
  AlgorithmResult,
  IRateLimitAlgorithm,
} from '../../domain/ports/rate-limit-algorithm.port.js';
import { RateLimitValidationError } from '../../domain/types/errors.js';
import type { RateLimitRecord } from '../../domain/types/rate-limit.types.js';

export interface TokenBucketConfig {
  capacity: number;
  refillRate: number;
  refillIntervalMs: number;
  initialTokens?: number;
}

export interface TokenBucketState {
  tokens: number;
  lastRefillTime: number;
  totalRequests: number;
  createdAt: number;
}

export class TokenBucketAlgorithm implements IRateLimitAlgorithm {
  private readonly capacity: number;
  private readonly refillRate: number;
  private readonly refillIntervalMs: number;
  private readonly initialTokens: number;
  private readonly stateStore: Map<string, TokenBucketState> = new Map();

  constructor(config: TokenBucketConfig) {
    if (config.capacity <= 0) {
      throw new RateLimitValidationError(
        'Bucket capacity must be positive',
        'capacity'
      );
    }
    if (config.refillRate <= 0) {
      throw new RateLimitValidationError(
        'Refill rate must be positive',
        'refillRate'
      );
    }
    if (config.refillIntervalMs <= 0) {
      throw new RateLimitValidationError(
        'Refill interval must be positive',
        'refillIntervalMs'
      );
    }

    this.capacity = config.capacity;
    this.refillRate = config.refillRate;
    this.refillIntervalMs = config.refillIntervalMs;
    this.initialTokens = config.initialTokens ?? config.capacity;
  }

  process(
    record: RateLimitRecord | null,
    _config: AlgorithmConfig,
    currentTime: number
  ): AlgorithmResult {
    const key = record?.key ?? 'unknown';
    let state = this.stateStore.get(key);

    state ??= this.createInitialState(currentTime);

    const updatedState = this.refillTokens(state, currentTime);
    const canAllow = updatedState.tokens >= 1;

    if (canAllow) {
      updatedState.tokens -= 1;
      updatedState.totalRequests += 1;
    }

    this.stateStore.set(key, updatedState);

    const resetTime = this.calculateResetTime(updatedState.tokens, currentTime);

    const updatedRecord: RateLimitRecord = {
      key,
      count: updatedState.totalRequests,
      resetTime,
      createdAt: state.createdAt,
      algorithm: 'token-bucket',
    };

    return {
      record: updatedRecord,
      allowed: canAllow,
      remaining: Math.floor(updatedState.tokens),
      resetTime,
      totalHits: updatedState.totalRequests,
    };
  }

  private createInitialState(currentTime: number): TokenBucketState {
    return {
      tokens: this.initialTokens,
      lastRefillTime: currentTime,
      totalRequests: 0,
      createdAt: currentTime,
    };
  }

  private refillTokens(
    state: TokenBucketState,
    currentTime: number
  ): TokenBucketState {
    const timeSinceRefill = currentTime - state.lastRefillTime;
    const refillIntervals = Math.floor(timeSinceRefill / this.refillIntervalMs);

    if (refillIntervals <= 0) {
      return state;
    }

    const tokensToAdd = refillIntervals * this.refillRate;
    const newTokens = Math.min(state.tokens + tokensToAdd, this.capacity);
    const newRefillTime =
      state.lastRefillTime + refillIntervals * this.refillIntervalMs;

    return {
      ...state,
      tokens: newTokens,
      lastRefillTime: newRefillTime,
    };
  }

  private calculateResetTime(
    currentTokens: number,
    currentTime: number
  ): number {
    if (currentTokens >= this.capacity) {
      return currentTime;
    }

    const tokensNeeded = this.capacity - currentTokens;
    const refillsNeeded = Math.ceil(tokensNeeded / this.refillRate);

    return currentTime + refillsNeeded * this.refillIntervalMs;
  }
}

export function createTokenBucket(
  config: TokenBucketConfig
): TokenBucketAlgorithm {
  return new TokenBucketAlgorithm(config);
}
