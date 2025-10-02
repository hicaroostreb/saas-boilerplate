import type { RateLimitAlgorithm } from '../../domain/types/rate-limit.types.js';

export interface SlidingWindowConfig {
  windowMs: number;
  maxRequests: number;
}

export interface SlidingWindowResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
  windowStart: number;
  oldestRequestTime?: number;
}

export interface RequestEntry {
  timestamp: number;
  id?: string;
}

export class SlidingWindowAlgorithm {
  constructor(private readonly config: SlidingWindowConfig) {
    if (config.windowMs <= 0) {
      throw new Error('Window duration must be positive');
    }
    if (config.maxRequests <= 0) {
      throw new Error('Max requests must be positive');
    }
  }

  /**
   * Process a new request and return rate limit result
   */
  processRequest(
    existingRequests: RequestEntry[] = [],
    currentTime: number = Date.now()
  ): SlidingWindowResult {
    // Remove expired requests
    const validRequests = this.removeExpiredRequests(
      existingRequests,
      currentTime
    );

    // Check if new request can be allowed
    const canAllow = validRequests.length < this.config.maxRequests;

    if (canAllow) {
      // Add new request
      validRequests.push({ timestamp: currentTime });
    }

    // Calculate reset time (when oldest request expires)
    const resetTime = this.calculateResetTime(validRequests, currentTime);
    const oldestRequestTime =
      validRequests.length > 0
        ? Math.min(...validRequests.map(r => r.timestamp))
        : undefined;

    return {
      allowed: canAllow,
      remaining: Math.max(0, this.config.maxRequests - validRequests.length),
      resetTime,
      totalHits: validRequests.length,
      windowStart: currentTime - this.config.windowMs,
      oldestRequestTime,
    };
  }

  /**
   * Remove expired requests from the sliding window
   */
  removeExpiredRequests(
    requests: RequestEntry[],
    currentTime: number = Date.now()
  ): RequestEntry[] {
    const cutoffTime = currentTime - this.config.windowMs;
    return requests.filter(request => request.timestamp > cutoffTime);
  }

  /**
   * Check if a request should be allowed without modifying state
   */
  shouldAllow(
    existingRequests: RequestEntry[] = [],
    currentTime: number = Date.now()
  ): boolean {
    const validRequests = this.removeExpiredRequests(
      existingRequests,
      currentTime
    );
    return validRequests.length < this.config.maxRequests;
  }

  /**
   * Calculate when the next request will be allowed (reset time)
   */
  calculateResetTime(
    requests: RequestEntry[],
    currentTime: number = Date.now()
  ): number {
    if (requests.length === 0) {
      return currentTime;
    }

    // Find the oldest request that's still valid
    const oldestRequest = Math.min(...requests.map(r => r.timestamp));

    // If we're at capacity, reset time is when the oldest request expires
    if (requests.length >= this.config.maxRequests) {
      return oldestRequest + this.config.windowMs;
    }

    // Otherwise, reset time is the end of current window
    return currentTime + this.config.windowMs;
  }

  /**
   * Get current window boundaries
   */
  getCurrentWindow(currentTime: number = Date.now()): {
    start: number;
    end: number;
    duration: number;
  } {
    return {
      start: currentTime - this.config.windowMs,
      end: currentTime,
      duration: this.config.windowMs,
    };
  }

  /**
   * Calculate request rate (requests per second) for current window
   */
  getRequestRate(
    requests: RequestEntry[],
    currentTime: number = Date.now()
  ): number {
    const validRequests = this.removeExpiredRequests(requests, currentTime);
    return validRequests.length / (this.config.windowMs / 1000);
  }

  /**
   * Get detailed window statistics
   */
  getWindowStats(
    requests: RequestEntry[],
    currentTime: number = Date.now()
  ): {
    totalRequests: number;
    validRequests: number;
    expiredRequests: number;
    usage: {
      current: number;
      maximum: number;
      percentage: number;
      remaining: number;
    };
    timing: {
      windowStart: number;
      windowEnd: number;
      oldestValidRequest?: number;
      newestRequest?: number;
      averageInterval?: number;
    };
  } {
    const validRequests = this.removeExpiredRequests(requests, currentTime);
    const expiredCount = requests.length - validRequests.length;
    const window = this.getCurrentWindow(currentTime);

    const timing: {
      windowStart: number;
      windowEnd: number;
      oldestValidRequest?: number;
      newestRequest?: number;
      averageInterval?: number;
    } = {
      windowStart: window.start,
      windowEnd: window.end,
    };

    if (validRequests.length > 0) {
      const timestamps = validRequests
        .map(r => r.timestamp)
        .sort((a, b) => a - b);
      timing.oldestValidRequest = timestamps[0];
      timing.newestRequest = timestamps[timestamps.length - 1];

      if (timestamps.length > 1) {
        const firstTimestamp = timestamps[0];
        const lastTimestamp = timestamps[timestamps.length - 1];
        if (firstTimestamp !== undefined && lastTimestamp !== undefined) {
          const totalSpan = lastTimestamp - firstTimestamp;
          timing.averageInterval = totalSpan / (timestamps.length - 1);
        }
      }
    }

    return {
      totalRequests: requests.length,
      validRequests: validRequests.length,
      expiredRequests: expiredCount,
      usage: {
        current: validRequests.length,
        maximum: this.config.maxRequests,
        percentage: Math.round(
          (validRequests.length / this.config.maxRequests) * 100
        ),
        remaining: Math.max(0, this.config.maxRequests - validRequests.length),
      },
      timing,
    };
  }

  /**
   * Predict when the next N requests can be made
   */
  predictNextAllowedTimes(
    requests: RequestEntry[],
    count: number,
    currentTime: number = Date.now()
  ): number[] {
    const validRequests = this.removeExpiredRequests(requests, currentTime);
    const allowedTimes: number[] = [];

    if (validRequests.length < this.config.maxRequests) {
      // Some requests can be made immediately
      const immediateSlots = this.config.maxRequests - validRequests.length;
      const immediateCount = Math.min(count, immediateSlots);

      for (let i = 0; i < immediateCount; i++) {
        allowedTimes.push(currentTime);
      }

      count -= immediateCount;
    }

    // Calculate when remaining requests can be made
    if (count > 0 && validRequests.length > 0) {
      const sortedRequests = validRequests
        .map(r => r.timestamp)
        .sort((a, b) => a - b);

      for (let i = 0; i < count && i < sortedRequests.length; i++) {
        const requestToExpire = sortedRequests[i];
        if (requestToExpire !== undefined) {
          allowedTimes.push(requestToExpire + this.config.windowMs);
        }
      }
    }

    return allowedTimes.sort((a, b) => a - b);
  }

  /**
   * Create request entries with optional IDs for tracking
   */
  createRequestEntry(
    timestamp: number = Date.now(),
    id?: string
  ): RequestEntry {
    const entry: RequestEntry = { timestamp };
    if (id !== undefined) {
      entry.id = id;
    }
    return entry;
  }

  /**
   * Merge multiple request arrays and sort by timestamp
   */
  mergeRequestArrays(...requestArrays: RequestEntry[][]): RequestEntry[] {
    return requestArrays.flat().sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get algorithm metadata
   */
  getAlgorithmInfo(): {
    type: RateLimitAlgorithm;
    windowMs: number;
    maxRequests: number;
    description: string;
  } {
    return {
      type: 'sliding-window',
      windowMs: this.config.windowMs,
      maxRequests: this.config.maxRequests,
      description:
        'Sliding time window rate limiting with smooth request distribution',
    };
  }

  /**
   * Check if requests are distributed evenly within the window
   */
  analyzeRequestDistribution(
    requests: RequestEntry[],
    currentTime: number = Date.now()
  ): {
    isEvenlyDistributed: boolean;
    burstFactor: number;
    distribution: Array<{ timeSlot: number; requestCount: number }>;
  } {
    const validRequests = this.removeExpiredRequests(requests, currentTime);

    if (validRequests.length === 0) {
      return {
        isEvenlyDistributed: true,
        burstFactor: 0,
        distribution: [],
      };
    }

    // Divide window into 10 time slots for analysis
    const slotCount = 10;
    const slotDuration = this.config.windowMs / slotCount;
    const windowStart = currentTime - this.config.windowMs;

    const distribution: Array<{ timeSlot: number; requestCount: number }> = [];

    for (let i = 0; i < slotCount; i++) {
      const slotStart = windowStart + i * slotDuration;
      const slotEnd = slotStart + slotDuration;

      const requestsInSlot = validRequests.filter(
        r => r.timestamp >= slotStart && r.timestamp < slotEnd
      ).length;

      distribution.push({
        timeSlot: i,
        requestCount: requestsInSlot,
      });
    }

    // Calculate burst factor (max requests in any slot vs average)
    const maxRequestsInSlot = Math.max(
      ...distribution.map(d => d.requestCount)
    );
    const avgRequestsPerSlot = validRequests.length / slotCount;
    const burstFactor =
      avgRequestsPerSlot > 0 ? maxRequestsInSlot / avgRequestsPerSlot : 0;

    // Consider distribution even if burst factor is less than 2
    const isEvenlyDistributed = burstFactor < 2;

    return {
      isEvenlyDistributed,
      burstFactor,
      distribution,
    };
  }
}

/**
 * Factory function to create a SlidingWindowAlgorithm instance
 */
export function createSlidingWindow(
  config: SlidingWindowConfig
): SlidingWindowAlgorithm {
  return new SlidingWindowAlgorithm(config);
}

/**
 * Utility functions for sliding window operations
 */
export const SlidingWindowUtils = {
  /**
   * Convert time units (same as FixedWindowUtils for consistency)
   */
  timeUnits: {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  },

  /**
   * Create common sliding window configurations
   */
  presets: {
    perSecond: (maxRequests: number): SlidingWindowConfig => ({
      windowMs: SlidingWindowUtils.timeUnits.second,
      maxRequests,
    }),

    perMinute: (maxRequests: number): SlidingWindowConfig => ({
      windowMs: SlidingWindowUtils.timeUnits.minute,
      maxRequests,
    }),

    perHour: (maxRequests: number): SlidingWindowConfig => ({
      windowMs: SlidingWindowUtils.timeUnits.hour,
      maxRequests,
    }),

    smooth: (maxRequests: number, windowMs: number): SlidingWindowConfig => ({
      windowMs,
      maxRequests,
    }),
  },

  /**
   * Convert request entries to simple timestamp array
   */
  toTimestamps: (requests: RequestEntry[]): number[] => {
    return requests.map(r => r.timestamp);
  },

  /**
   * Convert timestamp array to request entries
   */
  fromTimestamps: (timestamps: number[]): RequestEntry[] => {
    return timestamps.map(timestamp => ({ timestamp }));
  },
};
