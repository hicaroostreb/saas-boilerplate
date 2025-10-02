import type { RateLimitAlgorithm } from '../../domain/types/rate-limit.types.js';

export interface TokenBucketConfig {
  capacity: number; // Maximum tokens in bucket
  refillRate: number; // Tokens added per interval
  refillIntervalMs: number; // How often tokens are added
  initialTokens?: number; // Starting token count
}

export interface TokenBucketState {
  tokens: number;
  lastRefillTime: number;
  totalRequests: number;
  createdAt: number;
}

export interface TokenBucketResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
  tokensConsumed: number;
  nextRefillTime: number;
}

export class TokenBucketAlgorithm {
  constructor(private readonly config: TokenBucketConfig) {
    if (config.capacity <= 0) {
      throw new Error('Bucket capacity must be positive');
    }
    if (config.refillRate <= 0) {
      throw new Error('Refill rate must be positive');
    }
    if (config.refillIntervalMs <= 0) {
      throw new Error('Refill interval must be positive');
    }
    if (config.initialTokens !== undefined && config.initialTokens < 0) {
      throw new Error('Initial tokens cannot be negative');
    }
  }

  /**
   * Create initial bucket state
   */
  createInitialState(currentTime: number = Date.now()): TokenBucketState {
    return {
      tokens: this.config.initialTokens ?? this.config.capacity,
      lastRefillTime: currentTime,
      totalRequests: 0,
      createdAt: currentTime,
    };
  }

  /**
   * Process a request and update bucket state
   */
  processRequest(
    state: TokenBucketState,
    tokensRequested: number = 1,
    currentTime: number = Date.now()
  ): { result: TokenBucketResult; newState: TokenBucketState } {
    // Refill tokens based on elapsed time
    const updatedState = this.refillTokens(state, currentTime);

    // Check if request can be fulfilled
    const canAllow = updatedState.tokens >= tokensRequested;

    const finalState = { ...updatedState };
    if (canAllow) {
      finalState.tokens -= tokensRequested;
      finalState.totalRequests += 1;
    }

    const nextRefillTime = this.calculateNextRefillTime(currentTime);
    const resetTime = this.calculateResetTime(finalState.tokens, currentTime);

    const result: TokenBucketResult = {
      allowed: canAllow,
      remaining: Math.floor(finalState.tokens),
      resetTime,
      totalHits: finalState.totalRequests,
      tokensConsumed: canAllow ? tokensRequested : 0,
      nextRefillTime,
    };

    return { result, newState: finalState };
  }

  /**
   * Refill tokens based on elapsed time since last refill
   */
  refillTokens(
    state: TokenBucketState,
    currentTime: number = Date.now()
  ): TokenBucketState {
    const timeSinceRefill = currentTime - state.lastRefillTime;
    const refillIntervals = Math.floor(
      timeSinceRefill / this.config.refillIntervalMs
    );

    if (refillIntervals <= 0) {
      return state;
    }

    const tokensToAdd = refillIntervals * this.config.refillRate;
    const newTokens = Math.min(
      state.tokens + tokensToAdd,
      this.config.capacity
    );
    const newRefillTime =
      state.lastRefillTime + refillIntervals * this.config.refillIntervalMs;

    return {
      ...state,
      tokens: newTokens,
      lastRefillTime: newRefillTime,
    };
  }

  /**
   * Check if request would be allowed without modifying state
   */
  wouldAllow(
    state: TokenBucketState,
    tokensRequested: number = 1,
    currentTime: number = Date.now()
  ): boolean {
    const updatedState = this.refillTokens(state, currentTime);
    return updatedState.tokens >= tokensRequested;
  }

  /**
   * Calculate when bucket will be full again
   */
  calculateResetTime(
    currentTokens: number,
    currentTime: number = Date.now()
  ): number {
    if (currentTokens >= this.config.capacity) {
      return currentTime;
    }

    const tokensNeeded = this.config.capacity - currentTokens;
    const refillsNeeded = Math.ceil(tokensNeeded / this.config.refillRate);

    return currentTime + refillsNeeded * this.config.refillIntervalMs;
  }

  /**
   * Calculate next refill time
   */
  calculateNextRefillTime(currentTime: number = Date.now()): number {
    return currentTime + this.config.refillIntervalMs;
  }

  /**
   * Get current bucket statistics
   */
  getBucketStats(
    state: TokenBucketState,
    currentTime: number = Date.now()
  ): {
    current: TokenBucketState;
    usage: {
      tokens: number;
      capacity: number;
      percentage: number;
      available: number;
    };
    refill: {
      rate: number;
      intervalMs: number;
      nextRefillTime: number;
      tokensUntilFull: number;
      timeUntilFull: number;
    };
    lifetime: {
      age: number;
      totalRequests: number;
      averageRequestRate: number;
    };
  } {
    const updatedState = this.refillTokens(state, currentTime);
    const tokensUntilFull = this.config.capacity - updatedState.tokens;
    const refillsUntilFull = Math.ceil(
      tokensUntilFull / this.config.refillRate
    );
    const timeUntilFull = refillsUntilFull * this.config.refillIntervalMs;
    const age = currentTime - state.createdAt;

    return {
      current: updatedState,
      usage: {
        tokens: Math.floor(updatedState.tokens),
        capacity: this.config.capacity,
        percentage: Math.round(
          (updatedState.tokens / this.config.capacity) * 100
        ),
        available: Math.floor(updatedState.tokens),
      },
      refill: {
        rate: this.config.refillRate,
        intervalMs: this.config.refillIntervalMs,
        nextRefillTime: this.calculateNextRefillTime(currentTime),
        tokensUntilFull: Math.ceil(tokensUntilFull),
        timeUntilFull,
      },
      lifetime: {
        age,
        totalRequests: updatedState.totalRequests,
        averageRequestRate:
          age > 0 ? (updatedState.totalRequests / age) * 1000 : 0,
      },
    };
  }

  /**
   * Calculate burst capacity (maximum requests that can be made instantly)
   */
  getBurstCapacity(
    state: TokenBucketState,
    currentTime: number = Date.now()
  ): number {
    const updatedState = this.refillTokens(state, currentTime);
    return Math.floor(updatedState.tokens);
  }

  /**
   * Predict when N tokens will be available
   */
  predictTokenAvailability(
    state: TokenBucketState,
    tokensNeeded: number,
    currentTime: number = Date.now()
  ): {
    available: boolean;
    waitTime: number;
    availableAt: number;
  } {
    const updatedState = this.refillTokens(state, currentTime);

    if (updatedState.tokens >= tokensNeeded) {
      return {
        available: true,
        waitTime: 0,
        availableAt: currentTime,
      };
    }

    const tokensToWaitFor = tokensNeeded - updatedState.tokens;
    const refillsNeeded = Math.ceil(tokensToWaitFor / this.config.refillRate);
    const waitTime = refillsNeeded * this.config.refillIntervalMs;

    return {
      available: false,
      waitTime,
      availableAt: currentTime + waitTime,
    };
  }

  /**
   * Get effective rate limit (requests per second)
   */
  getEffectiveRateLimit(): number {
    // Convert refill rate to requests per second
    return (this.config.refillRate / this.config.refillIntervalMs) * 1000;
  }

  /**
   * Check if bucket configuration allows burst traffic
   */
  allowsBurstTraffic(): boolean {
    return this.config.capacity > this.config.refillRate;
  }

  /**
   * Get algorithm metadata
   */
  getAlgorithmInfo(): {
    type: RateLimitAlgorithm;
    capacity: number;
    refillRate: number;
    refillIntervalMs: number;
    effectiveRateLimit: number;
    allowsBurst: boolean;
    description: string;
  } {
    return {
      type: 'token-bucket',
      capacity: this.config.capacity,
      refillRate: this.config.refillRate,
      refillIntervalMs: this.config.refillIntervalMs,
      effectiveRateLimit: this.getEffectiveRateLimit(),
      allowsBurst: this.allowsBurstTraffic(),
      description:
        'Token bucket rate limiting with burst capacity and smooth refill',
    };
  }

  /**
   * Simulate traffic pattern and predict behavior
   */
  simulateTraffic(
    initialState: TokenBucketState,
    requests: Array<{ time: number; tokens?: number }>,
    startTime: number = Date.now()
  ): Array<{
    time: number;
    tokensRequested: number;
    allowed: boolean;
    tokensAfter: number;
    totalRequests: number;
  }> {
    let currentState = { ...initialState };
    const results: Array<{
      time: number;
      tokensRequested: number;
      allowed: boolean;
      tokensAfter: number;
      totalRequests: number;
    }> = [];

    for (const request of requests) {
      const tokensRequested = request.tokens ?? 1;
      const { result, newState } = this.processRequest(
        currentState,
        tokensRequested,
        startTime + request.time
      );

      results.push({
        time: request.time,
        tokensRequested,
        allowed: result.allowed,
        tokensAfter: newState.tokens,
        totalRequests: newState.totalRequests,
      });

      currentState = newState;
    }

    return results;
  }
}

/**
 * Factory function to create a TokenBucketAlgorithm instance
 */
export function createTokenBucket(
  config: TokenBucketConfig
): TokenBucketAlgorithm {
  return new TokenBucketAlgorithm(config);
}

/**
 * Utility functions and presets for token bucket configurations
 */
export const TokenBucketUtils = {
  /**
   * Time unit constants
   */
  timeUnits: {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  },

  /**
   * Common token bucket configurations
   */
  presets: {
    /**
     * High burst capacity, steady refill
     */
    burstFriendly: (
      requestsPerSecond: number,
      burstSize: number
    ): TokenBucketConfig => ({
      capacity: burstSize,
      refillRate: requestsPerSecond,
      refillIntervalMs: TokenBucketUtils.timeUnits.second,
      initialTokens: burstSize,
    }),

    /**
     * Steady rate limiting without burst
     */
    steady: (requestsPerSecond: number): TokenBucketConfig => ({
      capacity: requestsPerSecond,
      refillRate: requestsPerSecond,
      refillIntervalMs: TokenBucketUtils.timeUnits.second,
      initialTokens: requestsPerSecond,
    }),

    /**
     * API rate limiting with reasonable burst
     */
    api: (requestsPerMinute: number): TokenBucketConfig => {
      const burstSize = Math.max(10, Math.floor(requestsPerMinute * 0.2)); // 20% burst capacity
      return {
        capacity: burstSize,
        refillRate: Math.max(1, Math.floor(requestsPerMinute / 60)),
        refillIntervalMs: TokenBucketUtils.timeUnits.second,
        initialTokens: burstSize,
      };
    },

    /**
     * Conservative rate limiting
     */
    conservative: (requestsPerHour: number): TokenBucketConfig => ({
      capacity: Math.max(1, Math.floor(requestsPerHour / 60)), // Small burst
      refillRate: Math.max(1, Math.floor(requestsPerHour / 3600)),
      refillIntervalMs: TokenBucketUtils.timeUnits.second,
      initialTokens: 1,
    }),
  },

  /**
   * Calculate optimal configuration for given requirements
   */
  calculateOptimal: (
    targetRps: number,
    allowedBurstMultiplier: number = 2
  ): TokenBucketConfig => ({
    capacity: Math.floor(targetRps * allowedBurstMultiplier),
    refillRate: targetRps,
    refillIntervalMs: TokenBucketUtils.timeUnits.second,
    initialTokens: Math.floor(targetRps * allowedBurstMultiplier),
  }),
};
