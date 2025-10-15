import type { IKeyGenerator } from '../../domain/ports/key-generator.port.js';
import { RateLimitValidationError } from '../../domain/types/errors.js';
import type { RateLimitAlgorithm } from '../../domain/types/rate-limit.types.js';

export interface KeyGeneratorOptions {
  prefix?: string;
  separator?: string;
  includeAlgorithm?: boolean;
  maxLength?: number;
  sanitizeInput?: boolean;
}

export class KeyGenerator implements IKeyGenerator {
  private readonly options: Required<KeyGeneratorOptions>;

  constructor(options: KeyGeneratorOptions = {}) {
    this.options = {
      prefix: options.prefix ?? 'rl',
      separator: options.separator ?? ':',
      includeAlgorithm: options.includeAlgorithm ?? true,
      maxLength: options.maxLength ?? 250,
      sanitizeInput: options.sanitizeInput ?? true,
    };

    this.validateOptions();
  }

  generate(identifier: string, algorithm: RateLimitAlgorithm): string {
    if (!identifier?.trim()?.length) {
      throw new RateLimitValidationError(
        'Identifier cannot be empty',
        'identifier'
      );
    }

    const parts: string[] = [];

    if (this.options.prefix) {
      parts.push(this.options.prefix);
    }

    if (this.options.includeAlgorithm) {
      parts.push(algorithm);
    }

    const sanitizedIdentifier = this.options.sanitizeInput
      ? this.sanitize(identifier)
      : identifier;
    parts.push(sanitizedIdentifier);

    const key = parts.join(this.options.separator);

    if (key.length > this.options.maxLength) {
      throw new RateLimitValidationError(
        `Generated key exceeds maximum length (${key.length} > ${this.options.maxLength})`,
        'key'
      );
    }

    return key;
  }

  generateWithContext(
    identifier: string,
    algorithm: RateLimitAlgorithm,
    context: Record<string, string | number>
  ): string {
    if (!identifier?.trim()?.length) {
      throw new RateLimitValidationError(
        'Identifier cannot be empty',
        'identifier'
      );
    }

    const parts: string[] = [];

    if (this.options.prefix) {
      parts.push(this.options.prefix);
    }

    if (this.options.includeAlgorithm) {
      parts.push(algorithm);
    }

    const sanitizedIdentifier = this.options.sanitizeInput
      ? this.sanitize(identifier)
      : identifier;
    parts.push(sanitizedIdentifier);

    for (const [key, value] of Object.entries(context)) {
      const sanitizedKey = this.options.sanitizeInput
        ? this.sanitize(key)
        : key;
      const sanitizedValue = this.options.sanitizeInput
        ? this.sanitize(String(value))
        : String(value);
      parts.push(`${sanitizedKey}=${sanitizedValue}`);
    }

    const generatedKey = parts.join(this.options.separator);

    if (generatedKey.length > this.options.maxLength) {
      throw new RateLimitValidationError(
        `Generated key exceeds maximum length (${generatedKey.length} > ${this.options.maxLength})`,
        'key'
      );
    }

    return generatedKey;
  }

  private sanitize(input: string): string {
    const sanitized = input
      .replace(/[^\w\-._@]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return sanitized.length > 0 ? sanitized : 'empty';
  }

  private validateOptions(): void {
    if (this.options.separator.length === 0) {
      throw new RateLimitValidationError(
        'Separator cannot be empty',
        'separator'
      );
    }

    if (this.options.maxLength < 10) {
      throw new RateLimitValidationError(
        'Max length must be at least 10 characters',
        'maxLength'
      );
    }

    if (this.options.prefix?.includes(this.options.separator)) {
      throw new RateLimitValidationError(
        'Prefix cannot contain the separator character',
        'prefix'
      );
    }
  }
}

export const defaultKeyGenerator = new KeyGenerator();

export function createKeyGenerator(
  scenario: 'ip' | 'user' | 'endpoint' | 'global' | 'custom',
  options?: KeyGeneratorOptions
): KeyGenerator {
  switch (scenario) {
    case 'ip':
      return new KeyGenerator({
        prefix: 'rl_ip',
        sanitizeInput: true,
        includeAlgorithm: true,
        ...options,
      });
    case 'user':
      return new KeyGenerator({
        prefix: 'rl_user',
        sanitizeInput: true,
        includeAlgorithm: true,
        ...options,
      });
    case 'endpoint':
      return new KeyGenerator({
        prefix: 'rl_endpoint',
        sanitizeInput: true,
        includeAlgorithm: true,
        ...options,
      });
    case 'global':
      return new KeyGenerator({
        prefix: 'rl_global',
        sanitizeInput: false,
        includeAlgorithm: true,
        ...options,
      });
    case 'custom':
    default:
      return new KeyGenerator(options);
  }
}
