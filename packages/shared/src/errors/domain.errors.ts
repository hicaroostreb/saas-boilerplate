/**
 * @fileoverview Erros específicos de domínio
 * Classes de erro consolidadas para regras de negócio
 */

import { BaseError, ValidationError } from './base.errors';

/**
 * Erro base para domínio com contexto adicional
 */
export abstract class DomainError extends BaseError {
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode = 422,
    context?: Record<string, unknown>
  ) {
    super(message, code, statusCode);
    this.context = context;
  }
}

/**
 * Erro de violação de regra de negócio
 */
export class BusinessRuleError extends DomainError {
  constructor(message: string, rule: string) {
    super(message, 'BUSINESS_RULE_ERROR', 422, { rule });
  }
}

/**
 * Erro de conflito (recurso já existe)
 */
export class ConflictError extends DomainError {
  constructor(resource: string, field?: string) {
    const message = field
      ? `${resource} with this ${field} already exists`
      : `${resource} already exists`;
    super(message, 'CONFLICT', 409, { resource, field });
  }
}

/**
 * Erro de serviço externo indisponível
 */
export class ExternalServiceError extends DomainError {
  constructor(service: string, details?: Record<string, unknown>) {
    super(
      `External service ${service} is unavailable`,
      'EXTERNAL_SERVICE_ERROR',
      503,
      { service, ...details }
    );
  }
}

/**
 * Erro de limite excedido
 */
export class LimitExceededError extends DomainError {
  constructor(resource: string, limit: number, current: number) {
    super(
      `${resource} limit exceeded. Maximum: ${limit}, current: ${current}`,
      'LIMIT_EXCEEDED',
      429,
      { resource, limit, current }
    );
  }
}

/**
 * Erro de operação não permitida
 */
export class OperationNotAllowedError extends DomainError {
  constructor(operation: string, reason: string) {
    super(
      `Operation ${operation} not allowed: ${reason}`,
      'OPERATION_NOT_ALLOWED',
      403,
      { operation, reason }
    );
  }
}

// Re-export ValidationError from base for convenience
export { ValidationError };
