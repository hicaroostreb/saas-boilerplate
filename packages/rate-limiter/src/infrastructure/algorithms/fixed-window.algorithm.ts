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

export interface FixedWindowConfig {
  windowMs: number;
  maxRequests: number;
}

export class FixedWindowAlgorithm implements IRateLimitAlgorithm {
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(config: FixedWindowConfig) {
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
    const window = this.calculateWindow(currentTime);

    if (!record || this.isWindowExpired(record.resetTime, currentTime)) {
      return this.createNewWindow(
        record?.key ?? 'unknown',
        window,
        currentTime
      );
    }

    return this.incrementExisting(record, window);
  }

  private calculateWindow(timestamp: number): {
    start: number;
    end: number;
  } {
    const windowStart = Math.floor(timestamp / this.windowMs) * this.windowMs;
    const windowEnd = windowStart + this.windowMs;

    return {
      start: windowStart,
      end: windowEnd,
    };
  }

  private isWindowExpired(resetTime: number, currentTime: number): boolean {
    return currentTime >= resetTime;
  }

  private createNewWindow(
    key: string,
    window: { start: number; end: number },
    currentTime: number
  ): AlgorithmResult {
    const record: RateLimitRecord = {
      key,
      count: 1,
      resetTime: window.end,
      createdAt: currentTime,
      algorithm: 'fixed-window' as RateLimitAlgorithm,
    };

    return {
      record,
      allowed: true,
      remaining: this.maxRequests - 1,
      resetTime: window.end,
      totalHits: 1,
    };
  }

  private incrementExisting(
    record: RateLimitRecord,
    window: { start: number; end: number }
  ): AlgorithmResult {
    const newCount = record.count + 1;
    const allowed = newCount <= this.maxRequests;

    const updatedRecord: RateLimitRecord = {
      ...record,
      count: newCount,
      resetTime: window.end,
    };

    return {
      record: updatedRecord,
      allowed,
      remaining: Math.max(0, this.maxRequests - newCount),
      resetTime: window.end,
      totalHits: newCount,
    };
  }
}

export function createFixedWindow(
  config: FixedWindowConfig
): FixedWindowAlgorithm {
  return new FixedWindowAlgorithm(config);
}
