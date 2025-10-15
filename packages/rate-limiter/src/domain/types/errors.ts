export class RateLimitDomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'RateLimitDomainError';
  }
}

export class RateLimitValidationError extends RateLimitDomainError {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'RateLimitValidationError';
  }
}

export class RateLimitStorageError extends RateLimitDomainError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR');
    this.name = 'RateLimitStorageError';
  }
}
