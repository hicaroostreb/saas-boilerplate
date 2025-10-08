// packages/common/src/domain/common/errors/domain.errors.ts

/**
 * Erro base para domínio, garantindo identificação e contexto.
 */
export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.context = context;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação de dados de negócio.
 */
export class ValidationError extends DomainError {
  constructor(message = 'Dados inválidos', field?: string) {
    super(message, 'VALIDATION_ERROR', field ? { field } : undefined);
  }
}

/**
 * Erro de violação de regra de negócio.
 */
export class BusinessRuleError extends DomainError {
  constructor(message: string, rule: string) {
    super(message, 'BUSINESS_RULE_ERROR', { rule });
  }
}
