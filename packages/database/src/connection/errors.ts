// packages/database/src/connection/errors.ts
// ============================================
// DATABASE ERROR HANDLING - ENTERPRISE
// ============================================

export class DatabaseError extends Error {
  public readonly code?: string;
  public readonly constraint?: string;
  public readonly severity?: string;
  public readonly detail?: string;
  public readonly hint?: string;
  public readonly position?: string;
  public readonly internalPosition?: string;
  public readonly internalQuery?: string;
  public readonly where?: string;
  public readonly schema?: string;
  public readonly table?: string;
  public readonly column?: string;
  public readonly dataType?: string;
  public readonly constraintName?: string;

  constructor(
    message: string,
    code?: string,
    constraint?: string,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.constraint = constraint;

    // Copy PostgreSQL error details if available
    if (originalError && typeof originalError === 'object') {
      const pgError = originalError as Record<string, unknown>;
      this.severity = pgError.severity as string;
      this.detail = pgError.detail as string;
      this.hint = pgError.hint as string;
      this.position = pgError.position as string;
      this.internalPosition = pgError.internalPosition as string;
      this.internalQuery = pgError.internalQuery as string;
      this.where = pgError.where as string;
      this.schema = pgError.schema as string;
      this.table = pgError.table as string;
      this.column = pgError.column as string;
      this.dataType = pgError.dataType as string;
      this.constraintName = pgError.constraintName as string;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      constraint: this.constraint,
      severity: this.severity,
      detail: this.detail,
      hint: this.hint,
      position: this.position,
      internalPosition: this.internalPosition,
      internalQuery: this.internalQuery,
      where: this.where,
      schema: this.schema,
      table: this.table,
      column: this.column,
      dataType: this.dataType,
      constraintName: this.constraintName,
      stack: this.stack,
    };
  }
}

// Helper functions for common error types
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof DatabaseError &&
    error.code === '23505'
  );
}

export function isForeignKeyError(error: unknown): boolean {
  return (
    error instanceof DatabaseError &&
    error.code === '23503'
  );
}

export function isNotNullError(error: unknown): boolean {
  return (
    error instanceof DatabaseError &&
    error.code === '23502'
  );
}

export function isCheckConstraintError(error: unknown): boolean {
  return (
    error instanceof DatabaseError &&
    error.code === '23514'
  );
}

export function isUniqueConstraintError(error: unknown): boolean {
  return isDuplicateKeyError(error);
}

export function isDeadlockError(error: unknown): boolean {
  return (
    error instanceof DatabaseError &&
    error.code === '40P01'
  );
}

export function isConnectionError(error: unknown): boolean {
  if (!(error instanceof DatabaseError)) {
    return false;
  }

  const connectionErrorCodes = [
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08004', // sqlserver_rejected_establishment_of_sqlconnection
    '08007', // transaction_resolution_unknown
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
  ];

  return connectionErrorCodes.includes(error.code ?? '');
}

// Query performance monitoring
export async function withQueryPerformance<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = process.hrtime.bigint();

  try {
    const result = await queryFn();
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1000000;

    if (durationMs > 1000) { // Log slow queries > 1s
      console.warn(`[SLOW QUERY] ${queryName} took ${durationMs.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1000000;

    console.error(`[QUERY ERROR] ${queryName} failed after ${durationMs.toFixed(2)}ms:`, error);
    throw error;
  }
}

// Error formatter for logging
export function formatDatabaseError(error: unknown): string {
  if (!(error instanceof DatabaseError)) {
    return `Non-database error: ${String(error)}`;
  }

  const parts = [
    `DatabaseError: ${error.message}`,
    error.code ? `Code: ${error.code}` : null,
    error.constraint ? `Constraint: ${error.constraint}` : null,
    error.table ? `Table: ${error.table}` : null,
    error.column ? `Column: ${error.column}` : null,
    error.detail ? `Detail: ${error.detail}` : null,
    error.hint ? `Hint: ${error.hint}` : null,
  ].filter(Boolean);

  return parts.join(' | ');
}
