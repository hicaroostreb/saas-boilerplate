import type { RateLimitAlgorithm } from '../../domain/types/rate-limit.types.js';

export interface FixedWindowConfig {
  windowMs: number;
  maxRequests: number;
}

export interface FixedWindowResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
  windowStart: number;
}

export class FixedWindowAlgorithm {
  constructor(private readonly config: FixedWindowConfig) {
    if (config.windowMs <= 0) {
      throw new Error('Window duration must be positive');
    }
    if (config.maxRequests <= 0) {
      throw new Error('Max requests must be positive');
    }
  }

  /**
   * Calculate the current window boundaries
   */
  calculateWindow(timestamp: number = Date.now()): {
    windowStart: number;
    windowEnd: number;
    resetTime: number;
  } {
    const windowStart =
      Math.floor(timestamp / this.config.windowMs) * this.config.windowMs;
    const windowEnd = windowStart + this.config.windowMs;

    return {
      windowStart,
      windowEnd,
      resetTime: windowEnd,
    };
  }

  /**
   * Generate a unique key for the current window
   */
  generateWindowKey(baseKey: string, timestamp: number = Date.now()): string {
    const { windowStart } = this.calculateWindow(timestamp);
    return `${baseKey}:${windowStart}`;
  }

  /**
   * Check if a request should be allowed based on current count
   */
  shouldAllow(currentCount: number): FixedWindowResult {
    const now = Date.now();
    const { windowStart, resetTime } = this.calculateWindow(now);
    const newCount = currentCount + 1;

    return {
      allowed: newCount <= this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - newCount),
      resetTime,
      totalHits: newCount,
      windowStart,
    };
  }

  /**
   * Check if the current window has expired
   */
  isWindowExpired(
    windowStart: number,
    currentTime: number = Date.now()
  ): boolean {
    const windowEnd = windowStart + this.config.windowMs;
    return currentTime >= windowEnd;
  }

  /**
   * Get time remaining until window reset
   */
  getTimeUntilReset(timestamp: number = Date.now()): number {
    const { resetTime } = this.calculateWindow(timestamp);
    return Math.max(0, resetTime - timestamp);
  }

  /**
   * Calculate requests per second for the current window
   */
  getRequestsPerSecond(currentCount: number): number {
    return currentCount / (this.config.windowMs / 1000);
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
      type: 'fixed-window',
      windowMs: this.config.windowMs,
      maxRequests: this.config.maxRequests,
      description: 'Fixed time window rate limiting with hard boundaries',
    };
  }

  /**
   * Validate if a timestamp falls within the current window
   */
  isInCurrentWindow(
    timestamp: number,
    referenceTime: number = Date.now()
  ): boolean {
    const { windowStart, windowEnd } = this.calculateWindow(referenceTime);
    return timestamp >= windowStart && timestamp < windowEnd;
  }

  /**
   * Calculate burst capacity (how many requests can be made instantly)
   */
  getBurstCapacity(): number {
    return this.config.maxRequests;
  }

  /**
   * Get window boundaries for a specific timestamp
   */
  getWindowBoundaries(timestamp: number): {
    start: Date;
    end: Date;
    duration: number;
  } {
    const { windowStart, windowEnd } = this.calculateWindow(timestamp);

    return {
      start: new Date(windowStart),
      end: new Date(windowEnd),
      duration: this.config.windowMs,
    };
  }

  /**
   * Check if two timestamps are in the same window
   */
  areInSameWindow(timestamp1: number, timestamp2: number): boolean {
    const window1 = this.calculateWindow(timestamp1);
    const window2 = this.calculateWindow(timestamp2);
    return window1.windowStart === window2.windowStart;
  }

  /**
   * Calculate the next window start time
   */
  getNextWindowStart(timestamp: number = Date.now()): number {
    const { windowEnd } = this.calculateWindow(timestamp);
    return windowEnd;
  }

  /**
   * Calculate how many complete windows have passed since a reference time
   */
  getWindowsSince(
    referenceTime: number,
    currentTime: number = Date.now()
  ): number {
    if (currentTime <= referenceTime) {
      return 0;
    }

    const timeDiff = currentTime - referenceTime;
    return Math.floor(timeDiff / this.config.windowMs);
  }

  /**
   * Create a summary of window statistics
   */
  createWindowSummary(
    currentCount: number,
    timestamp: number = Date.now()
  ): {
    windowInfo: {
      start: Date;
      end: Date;
      duration: number;
    };
    usage: {
      current: number;
      maximum: number;
      percentage: number;
      remaining: number;
    };
    timing: {
      timeUntilReset: number;
      timeUntilResetSeconds: number;
    };
  } {
    const windowInfo = this.getWindowBoundaries(timestamp);
    const timeUntilReset = this.getTimeUntilReset(timestamp);

    return {
      windowInfo,
      usage: {
        current: currentCount,
        maximum: this.config.maxRequests,
        percentage: Math.round((currentCount / this.config.maxRequests) * 100),
        remaining: Math.max(0, this.config.maxRequests - currentCount),
      },
      timing: {
        timeUntilReset,
        timeUntilResetSeconds: Math.ceil(timeUntilReset / 1000),
      },
    };
  }
}

/**
 * Factory function to create a FixedWindowAlgorithm instance
 */
export function createFixedWindow(
  config: FixedWindowConfig
): FixedWindowAlgorithm {
  return new FixedWindowAlgorithm(config);
}

/**
 * Utility functions for working with fixed windows
 */
export const FixedWindowUtils = {
  /**
   * Convert window duration from common time units
   */
  timeUnits: {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  },

  /**
   * Create common window configurations
   */
  presets: {
    perSecond: (maxRequests: number): FixedWindowConfig => ({
      windowMs: FixedWindowUtils.timeUnits.second,
      maxRequests,
    }),

    perMinute: (maxRequests: number): FixedWindowConfig => ({
      windowMs: FixedWindowUtils.timeUnits.minute,
      maxRequests,
    }),

    perHour: (maxRequests: number): FixedWindowConfig => ({
      windowMs: FixedWindowUtils.timeUnits.hour,
      maxRequests,
    }),

    perDay: (maxRequests: number): FixedWindowConfig => ({
      windowMs: FixedWindowUtils.timeUnits.day,
      maxRequests,
    }),
  },

  /**
   * Format window duration as human readable string
   */
  formatDuration: (windowMs: number): string => {
    const units = FixedWindowUtils.timeUnits;

    if (windowMs >= units.day) {
      return `${windowMs / units.day} day(s)`;
    } else if (windowMs >= units.hour) {
      return `${windowMs / units.hour} hour(s)`;
    } else if (windowMs >= units.minute) {
      return `${windowMs / units.minute} minute(s)`;
    } else {
      return `${windowMs / units.second} second(s)`;
    }
  },
};
