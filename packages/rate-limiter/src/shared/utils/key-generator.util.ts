// packages/rate-limiter/src/shared/utils/key-generator.util.ts

import type { RateLimitAlgorithm } from '../../domain/types/rate-limit.types.js';

export interface KeyGeneratorOptions {
  prefix?: string;
  separator?: string;
  includeAlgorithm?: boolean;
  includeTimestamp?: boolean;
  maxLength?: number;
  sanitizeInput?: boolean;
}

export interface ParsedKey {
  prefix?: string;
  algorithm?: RateLimitAlgorithm;
  identifier: string;
  timestamp?: number;
  originalKey: string;
}

export class KeyGenerator {
  private readonly options: Required<KeyGeneratorOptions>;

  constructor(options: KeyGeneratorOptions = {}) {
    this.options = {
      prefix: options.prefix ?? 'rl',
      separator: options.separator ?? ':',
      includeAlgorithm: options.includeAlgorithm ?? true,
      includeTimestamp: options.includeTimestamp ?? false,
      maxLength: options.maxLength ?? 250, // Redis key limit is 512MB but practical limit
      sanitizeInput: options.sanitizeInput ?? true,
    };

    this.validateOptions();
  }

  /**
   * Generate a rate limit key
   */
  generate(
    identifier: string,
    algorithm: RateLimitAlgorithm,
    additionalContext?: Record<string, string | number>
  ): string {
    if (!identifier || identifier.trim().length === 0) {
      throw new Error('Identifier cannot be empty');
    }

    const parts: string[] = [];

    // Add prefix
    if (this.options.prefix) {
      parts.push(this.options.prefix);
    }

    // Add algorithm
    if (this.options.includeAlgorithm) {
      parts.push(algorithm);
    }

    // Sanitize and add identifier
    const sanitizedIdentifier = this.options.sanitizeInput
      ? this.sanitizeIdentifier(identifier)
      : identifier;
    parts.push(sanitizedIdentifier);

    // Add timestamp if required
    if (this.options.includeTimestamp) {
      parts.push(Date.now().toString());
    }

    // Add additional context
    if (additionalContext) {
      for (const [key, value] of Object.entries(additionalContext)) {
        const sanitizedKey = this.options.sanitizeInput
          ? this.sanitizeIdentifier(key)
          : key;
        const sanitizedValue = this.options.sanitizeInput
          ? this.sanitizeIdentifier(String(value))
          : String(value);
        parts.push(`${sanitizedKey}=${sanitizedValue}`);
      }
    }

    const key = parts.join(this.options.separator);

    // Check length limit
    if (key.length > this.options.maxLength) {
      throw new Error(
        `Generated key exceeds maximum length (${key.length} > ${this.options.maxLength}): ${key}`
      );
    }

    return key;
  }

  /**
   * Generate a key for a specific window (for fixed-window algorithm)
   */
  generateWindowKey(
    identifier: string,
    algorithm: RateLimitAlgorithm,
    windowStart: number,
    additionalContext?: Record<string, string | number>
  ): string {
    const context = {
      ...additionalContext,
      window: windowStart.toString(),
    };

    return this.generate(identifier, algorithm, context);
  }

  /**
   * Generate multiple keys with different identifiers
   */
  generateBatch(
    identifiers: string[],
    algorithm: RateLimitAlgorithm,
    additionalContext?: Record<string, string | number>
  ): Map<string, string> {
    const keys = new Map<string, string>();

    for (const identifier of identifiers) {
      try {
        const key = this.generate(identifier, algorithm, additionalContext);
        keys.set(identifier, key);
      } catch (error) {
        // Skip invalid identifiers but log the error
        console.warn(
          `Failed to generate key for identifier "${identifier}":`,
          error
        );
      }
    }

    return keys;
  }

  /**
   * Parse a generated key back to its components
   */
  parseKey(key: string): ParsedKey {
    if (!key) {
      throw new Error('Key cannot be empty');
    }

    const parts = key.split(this.options.separator);
    const result: ParsedKey = {
      originalKey: key,
      identifier: key, // fallback
    };

    let partIndex = 0;

    // Extract prefix
    if (
      this.options.prefix &&
      parts.length > partIndex &&
      parts[partIndex] === this.options.prefix
    ) {
      result.prefix = parts[partIndex];
      partIndex++;
    }

    // Extract algorithm
    if (this.options.includeAlgorithm && partIndex < parts.length) {
      const algorithmCandidate = parts[partIndex];
      if (algorithmCandidate && this.isValidAlgorithm(algorithmCandidate)) {
        result.algorithm = algorithmCandidate as RateLimitAlgorithm;
        partIndex++;
      }
    }

    // Extract identifier (main part)
    if (partIndex < parts.length) {
      const identifierPart = parts[partIndex];
      if (identifierPart) {
        result.identifier = identifierPart;
      }
      partIndex++;
    }

    // Extract timestamp if included
    if (this.options.includeTimestamp && partIndex < parts.length) {
      const timestampStr = parts[partIndex];
      if (timestampStr) {
        const timestamp = parseInt(timestampStr, 10);
        if (!isNaN(timestamp)) {
          result.timestamp = timestamp;
          partIndex++;
        }
      }
    }

    return result;
  }

  /**
   * Validate if a key was generated by this generator
   */
  validateKey(key: string): boolean {
    try {
      const parsed = this.parseKey(key);

      // Check if key has expected structure
      if (this.options.prefix && parsed.prefix !== this.options.prefix) {
        return false;
      }

      if (this.options.includeAlgorithm && !parsed.algorithm) {
        return false;
      }

      if (!parsed.identifier || parsed.identifier.trim().length === 0) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract just the identifier from a generated key
   */
  extractIdentifier(key: string): string {
    const parsed = this.parseKey(key);
    return parsed.identifier;
  }

  /**
   * Get key statistics
   */
  getKeyStats(keys: string[]): {
    totalKeys: number;
    validKeys: number;
    invalidKeys: number;
    averageLength: number;
    algorithmDistribution: Record<string, number>;
    prefixDistribution: Record<string, number>;
  } {
    const stats = {
      totalKeys: keys.length,
      validKeys: 0,
      invalidKeys: 0,
      averageLength: 0,
      algorithmDistribution: {} as Record<string, number>,
      prefixDistribution: {} as Record<string, number>,
    };

    let totalLength = 0;

    for (const key of keys) {
      totalLength += key.length;

      if (this.validateKey(key)) {
        stats.validKeys++;

        try {
          const parsed = this.parseKey(key);

          if (parsed.algorithm) {
            stats.algorithmDistribution[parsed.algorithm] =
              (stats.algorithmDistribution[parsed.algorithm] ?? 0) + 1;
          }

          if (parsed.prefix) {
            stats.prefixDistribution[parsed.prefix] =
              (stats.prefixDistribution[parsed.prefix] ?? 0) + 1;
          }
        } catch {
          // Skip parsing errors
        }
      } else {
        stats.invalidKeys++;
      }
    }

    stats.averageLength =
      keys.length > 0 ? Math.round(totalLength / keys.length) : 0;

    return stats;
  }

  /**
   * Sanitize identifier to be safe for storage keys
   */
  private sanitizeIdentifier(identifier: string): string {
    return (
      identifier
        // Remove/replace unsafe characters
        .replace(/[^\w\-._@]/g, '_')
        // Remove multiple consecutive underscores
        .replace(/_+/g, '_')
        // Remove leading/trailing underscores
        .replace(/^_|_$/g, '') ||
      // ✅ CORREÇÃO: Usado || em vez de ?? para string vazia
      // Ensure not empty
      'empty'
    );
  }

  /**
   * Check if string is a valid algorithm
   */
  private isValidAlgorithm(str: string): boolean {
    return ['fixed-window', 'sliding-window', 'token-bucket'].includes(str);
  }

  /**
   * Validate constructor options
   */
  private validateOptions(): void {
    if (this.options.separator.length === 0) {
      throw new Error('Separator cannot be empty');
    }

    if (this.options.maxLength < 10) {
      throw new Error('Max length must be at least 10 characters');
    }

    if (this.options.prefix?.includes(this.options.separator)) {
      // ✅ CORREÇÃO: Usado optional chain (?.) na linha 325
      throw new Error('Prefix cannot contain the separator character');
    }
  }
}

/**
 * Default key generator instance
 */
export const defaultKeyGenerator = new KeyGenerator();

/**
 * Utility functions for common key generation patterns
 */
export const KeyGeneratorUtils = {
  /**
   * Create a key generator for IP-based rate limiting
   */
  forIpAddress: (options?: Partial<KeyGeneratorOptions>) =>
    new KeyGenerator({
      prefix: 'rl_ip',
      sanitizeInput: true,
      includeAlgorithm: true,
      ...options,
    }),

  /**
   * Create a key generator for user-based rate limiting
   */
  forUser: (options?: Partial<KeyGeneratorOptions>) =>
    new KeyGenerator({
      prefix: 'rl_user',
      sanitizeInput: true,
      includeAlgorithm: true,
      ...options,
    }),

  /**
   * Create a key generator for API endpoint rate limiting
   */
  forEndpoint: (options?: Partial<KeyGeneratorOptions>) =>
    new KeyGenerator({
      prefix: 'rl_endpoint',
      sanitizeInput: true,
      includeAlgorithm: true,
      ...options,
    }),

  /**
   * Create a key generator for global rate limiting
   */
  forGlobal: (options?: Partial<KeyGeneratorOptions>) =>
    new KeyGenerator({
      prefix: 'rl_global',
      sanitizeInput: false,
      includeAlgorithm: true,
      ...options,
    }),

  /**
   * Generate a simple key without complex parsing
   */
  simple: (
    prefix: string,
    identifier: string,
    algorithm: RateLimitAlgorithm
  ): string => {
    const sanitized = identifier.replace(/[^\w\-._@]/g, '_');
    return `${prefix}:${algorithm}:${sanitized}`;
  },

  /**
   * Generate a key for testing purposes
   */
  test: (identifier: string): string => {
    return `test_rl:${identifier}:${Date.now()}`;
  },

  /**
   * Extract IP address from various formats
   */
  extractIpFromIdentifier: (identifier: string): string => {
    // Handle IPv4, IPv6, and forwarded headers
    const ipRegex =
      /(?:\d{1,3}\.){3}\d{1,3}|(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/;
    const match = identifier.match(ipRegex);
    return match ? match[0] : identifier;
  },

  /**
   * Normalize user identifier
   */
  normalizeUserIdentifier: (identifier: string): string => {
    return identifier.toLowerCase().trim();
  },
};

/**
 * Factory functions for common scenarios
 */
export function createKeyGenerator(
  scenario: 'ip' | 'user' | 'endpoint' | 'global' | 'custom',
  options?: KeyGeneratorOptions
): KeyGenerator {
  switch (scenario) {
    case 'ip':
      return KeyGeneratorUtils.forIpAddress(options);
    case 'user':
      return KeyGeneratorUtils.forUser(options);
    case 'endpoint':
      return KeyGeneratorUtils.forEndpoint(options);
    case 'global':
      return KeyGeneratorUtils.forGlobal(options);
    case 'custom':
    default:
      return new KeyGenerator(options);
  }
}
