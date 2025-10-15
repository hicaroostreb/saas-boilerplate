import type { ILogger } from '../../domain/ports/logger.port.js';
import type {
  HealthCheckResult,
  IRateLimitRepository,
} from '../../domain/ports/rate-limit-repository.port.js';
import { RateLimitStorageError } from '../../domain/types/errors.js';
import type { RateLimitRecord } from '../../domain/types/rate-limit.types.js';

interface MemoryEntry {
  record: RateLimitRecord;
  expiresAt: number;
}

export interface MemoryGatewayOptions {
  cleanupIntervalMs?: number;
  maxEntries?: number;
  logger?: ILogger;
}

export class MemoryRateLimitGateway implements IRateLimitRepository {
  private readonly store = new Map<string, MemoryEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly cleanupIntervalMs: number;
  private readonly logger?: ILogger;
  private isShuttingDown = false;

  constructor(options: MemoryGatewayOptions = {}) {
    this.cleanupIntervalMs = options.cleanupIntervalMs ?? 60_000;
    this.logger = options.logger;
    this.startPeriodicCleanup();
  }

  async findByKey(key: string): Promise<RateLimitRecord | null> {
    try {
      const entry = this.store.get(key);

      if (!entry) {
        return null;
      }

      if (this.isExpired(entry)) {
        this.store.delete(key);
        return null;
      }

      return entry.record;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to find rate limit by key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async save(record: RateLimitRecord, ttlMs: number): Promise<void> {
    try {
      const entry: MemoryEntry = {
        record,
        expiresAt: Date.now() + ttlMs,
      };

      this.store.set(record.key, entry);
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to save rate limit record for key "${record.key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.store.delete(key);
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to delete rate limit for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteMultiple(keys: string[]): Promise<void> {
    try {
      for (const key of keys) {
        this.store.delete(key);
      }
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to delete multiple keys: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByKeys(keys: string[]): Promise<Map<string, RateLimitRecord>> {
    try {
      const results = new Map<string, RateLimitRecord>();

      const entries = keys.map(key => {
        const entry = this.store.get(key);
        if (!entry || this.isExpired(entry)) {
          if (entry) {
            this.store.delete(key);
          }
          return { key, record: null };
        }
        return { key, record: entry.record };
      });

      for (const { key, record } of entries) {
        if (record) {
          results.set(key, record);
        }
      }

      return results;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to find multiple keys: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const entry = this.store.get(key);

      if (!entry) {
        return false;
      }

      if (this.isExpired(entry)) {
        this.store.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to check existence for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async count(): Promise<number> {
    try {
      await this.cleanup();
      return this.store.size;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to count rate limit entries: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async cleanup(): Promise<number> {
    try {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, entry] of this.store.entries()) {
        if (this.isExpired(entry, now)) {
          this.store.delete(key);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to cleanup expired entries: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getKeys(pattern?: string): Promise<string[]> {
    try {
      await this.cleanup();

      const keys = Array.from(this.store.keys());

      if (!pattern) {
        return keys;
      }

      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return keys.filter(key => regex.test(key));
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to get keys with pattern "${pattern ?? '*'}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const start = Date.now();

      const testKey = `health_check_${Date.now()}`;
      const testRecord: RateLimitRecord = {
        key: testKey,
        count: 1,
        resetTime: Date.now() + 1000,
        createdAt: Date.now(),
        algorithm: 'fixed-window',
      };

      await this.save(testRecord, 1000);
      await this.findByKey(testKey);
      await this.delete(testKey);

      const latency = Date.now() - start;

      return {
        connected: true,
        latency,
      };
    } catch (error) {
      return {
        connected: false,
        latency: -1,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    await this.cleanup();
    this.store.clear();
  }

  private isExpired(entry: MemoryEntry, currentTime?: number): boolean {
    const now = currentTime ?? Date.now();
    return now >= entry.expiresAt || now >= entry.record.resetTime;
  }

  private startPeriodicCleanup(): void {
    if (this.isShuttingDown) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      void this.performCleanup();
    }, this.cleanupIntervalMs);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private async performCleanup(): Promise<void> {
    try {
      if (!this.isShuttingDown) {
        await this.cleanup();
      }
    } catch (error) {
      this.logger?.warn('Memory gateway cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
