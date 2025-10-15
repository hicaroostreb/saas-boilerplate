import type {
  AlgorithmConfig,
  AlgorithmResult,
  IRateLimitAlgorithm,
} from '../../domain/ports/rate-limit-algorithm.port.js';
import { RateLimitValidationError } from '../../domain/types/errors.js';
import type {
  RateLimitAlgorithm,
  RateLimitRecord,
} from '../../domain/types/rate-limit.types.js';

export interface SlidingWindowConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RequestEntry {
  timestamp: number;
  id?: string;
}

export class SlidingWindowAlgorithm implements IRateLimitAlgorithm {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly requestStore: Map<string, RequestEntry[]> = new Map();

  constructor(config: SlidingWindowConfig) {
    if (config.windowMs <= 0) {
      throw new RateLimitValidationError(
        'Window duration must be positive',
        'windowMs'
      );
    }
    if (config.maxRequests <= 0) {
      throw new RateLimitValidationError(
        'Max requests must be positive',
        'maxRequests'
      );
    }

    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
  }

  process(
    record: RateLimitRecord | null,
    config: AlgorithmConfig,
    currentTime: number
  ): AlgorithmResult {
    const key = record?.key ?? 'unknown';
    const existingRequests = this.requestStore.get(key) ?? [];

    const validRequests = this.removeExpiredRequests(
      existingRequests,
      currentTime
    );

    const canAllow = validRequests.length < this.maxRequests;

    if (canAllow) {
      validRequests.push({ timestamp: currentTime });
      this.requestStore.set(key, validRequests);
    }

    const resetTime = this.calculateResetTime(validRequests, currentTime);
    const newCount = validRequests.length;

    const updatedRecord: RateLimitRecord = {
      key,
      count: newCount,
      resetTime,
      createdAt: record?.createdAt ?? currentTime,
      algorithm: 'sliding-window' as RateLimitAlgorithm,
    };

    return {
      record: updatedRecord,
      allowed: canAllow,
      remaining: Math.max(0, this.maxRequests - newCount),
      resetTime,
      totalHits: newCount,
    };
  }

  private removeExpiredRequests(
    requests: RequestEntry[],
    currentTime: number
  ): RequestEntry[] {
    const cutoffTime = currentTime - this.windowMs;
    return requests.filter(request => request.timestamp > cutoffTime);
  }

  private calculateResetTime(
    requests: RequestEntry[],
    currentTime: number
  ): number {
    if (requests.length === 0) {
      return currentTime + this.windowMs;
    }

    const oldestRequest = Math.min(...requests.map(r => r.timestamp));

    if (requests.length >= this.maxRequests) {
      return oldestRequest + this.windowMs;
    }

    return currentTime + this.windowMs;
  }
}

export function createSlidingWindow(
  config: SlidingWindowConfig
): SlidingWindowAlgorithm {
  return new SlidingWindowAlgorithm(config);
}
