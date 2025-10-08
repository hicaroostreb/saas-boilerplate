// packages/rate-limiter/src/infrastructure/gateways/memory.gateway.ts

import { RateLimitEntity } from '../../domain/entities/rate-limit.entity.js';
import { BaseRateLimitRepository } from '../../domain/repositories/rate-limit.repository.js';
import { RateLimitStorageError } from '../../domain/types/rate-limit.types.js';

interface MemoryEntry {
  entity: RateLimitEntity;
  expiresAt: number;
}

export class MemoryRateLimitGateway extends BaseRateLimitRepository {
  private readonly store = new Map<string, MemoryEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly cleanupIntervalMs: number;
  private isShuttingDown = false;

  constructor(
    options: {
      cleanupIntervalMs?: number;
      maxEntries?: number;
    } = {}
  ) {
    super();
    this.cleanupIntervalMs = options.cleanupIntervalMs ?? 60_000; // 1 minute default
    this.startPeriodicCleanup();
  }

  async findByKey(key: string): Promise<RateLimitEntity | null> {
    try {
      const entry = this.store.get(key);

      if (!entry) {
        return null;
      }

      // Check if entry is expired
      if (this.isExpired(entry)) {
        this.store.delete(key);
        return null;
      }

      return entry.entity;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to find rate limit by key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async save(entity: RateLimitEntity): Promise<void> {
    try {
      const entry: MemoryEntry = {
        entity,
        expiresAt: entity.resetTime + 60_000, // Extra 1 minute buffer for cleanup
      };

      this.store.set(entity.key, entry);
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to save rate limit entity for key "${entity.key}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async reset(key: string): Promise<void> {
    try {
      this.store.delete(key);
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to reset rate limit for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
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
      // Clean expired entries first
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
      // Clean expired entries first
      await this.cleanup();

      const keys = Array.from(this.store.keys());

      if (!pattern) {
        return keys;
      }

      // Simple pattern matching (supports * wildcard)
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return keys.filter(key => regex.test(key));
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to get keys with pattern "${pattern}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async healthCheck(): Promise<{
    connected: boolean;
    latency: number;
    error?: string;
  }> {
    try {
      const start = Date.now();

      // Test basic operations
      const testKey = `health_check_${Date.now()}`;
      const testEntity = RateLimitEntity.create({
        key: testKey,
        count: 1,
        resetTime: Date.now() + 1000,
        algorithm: 'fixed-window',
      });

      await this.save(testEntity);
      await this.findByKey(testKey);
      await this.reset(testKey);

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

  override async resetMultiple(keys: string[]): Promise<void> {
    try {
      for (const key of keys) {
        this.store.delete(key);
      }
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to reset multiple keys: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  override async findByKeys(
    keys: string[]
  ): Promise<Map<string, RateLimitEntity>> {
    try {
      const results = new Map<string, RateLimitEntity>();

      // Collect all entities synchronously to avoid await in loop
      const entities = keys.map(key => {
        const entry = this.store.get(key);
        if (!entry || this.isExpired(entry)) {
          if (entry) {
            this.store.delete(key);
          }
          return { key, entity: null };
        }
        return { key, entity: entry.entity };
      });

      // Add valid entities to results
      for (const { key, entity } of entities) {
        if (entity) {
          results.set(key, entity);
        }
      }

      return results;
    } catch (error) {
      throw new RateLimitStorageError(
        `Failed to find multiple keys: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    totalEntries: number;
    memoryUsageBytes: number;
    oldestEntryAge: number;
    newestEntryAge: number;
  } {
    const now = Date.now();
    let oldestTime = now;
    let newestTime = 0;
    let totalSize = 0;

    for (const [key, entry] of this.store.entries()) {
      // Rough estimation of memory usage
      totalSize += key.length * 2; // String overhead
      totalSize += 200; // Rough entity size

      const createdAt = entry.entity.createdAt;
      if (createdAt < oldestTime) {
        oldestTime = createdAt;
      }
      if (createdAt > newestTime) {
        newestTime = createdAt;
      }
    }

    return {
      totalEntries: this.store.size,
      memoryUsageBytes: totalSize,
      oldestEntryAge: this.store.size > 0 ? now - oldestTime : 0,
      newestEntryAge: this.store.size > 0 ? now - newestTime : 0,
    };
  }

  /**
   * Shutdown the gateway and cleanup resources
   */
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
    return now >= entry.expiresAt || entry.entity.isExpired(now);
  }

  private startPeriodicCleanup(): void {
    if (this.isShuttingDown) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      // Synchronous cleanup wrapper to avoid Promise in setInterval
      void this.performCleanup();
    }, this.cleanupIntervalMs);

    // Don't keep the process alive just for cleanup
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
      // Silent cleanup - don't throw errors in background cleanup
      console.warn('Memory gateway cleanup failed:', error);
    }
  }
}
