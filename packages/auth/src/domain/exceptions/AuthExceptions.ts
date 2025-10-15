/**
 * @fileoverview Exceções específicas do domínio de autenticação
 * Classes de erro para casos de uso de auth
 */

import { ConflictError, DomainError } from '@workspace/shared/errors';

/**
 * Erro de credenciais inválidas
 */
export class InvalidCredentialsError extends DomainError {
  constructor(message = 'Invalid credentials') {
    super(message, 'INVALID_CREDENTIALS', 401);
  }
}

/**
 * Erro de usuário não autenticado
 */
export class UnauthenticatedError extends DomainError {
  constructor(message = 'Not authenticated') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

/**
 * Erro de token inválido ou expirado
 */
export class InvalidTokenError extends DomainError {
  constructor(message = 'Invalid or expired token') {
    super(message, 'INVALID_TOKEN', 400);
  }
}

/**
 * Erro de usuário já existente
 */
export class UserAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super('User', 'email');
    // Usar Object.assign para evitar erro de tipagem
    Object.assign(this, { context: { ...this.context, email } });
  }
}

/**
 * Erro de organização já existente
 */
export class OrganizationAlreadyExistsError extends ConflictError {
  constructor(slug: string) {
    super('Organization', 'slug');
    // Usar Object.assign para evitar erro de tipagem
    Object.assign(this, { context: { ...this.context, slug } });
  }
}

/**
 * Erro de organização não encontrada
 */
export class OrganizationNotFoundError extends DomainError {
  constructor(organizationId?: string) {
    super(
      organizationId
        ? `Organization with id ${organizationId} not found`
        : 'Organization not found',
      'ORGANIZATION_NOT_FOUND',
      404,
      { organizationId }
    );
  }
}

/**
 * Erro de permissão insuficiente
 */
export class InsufficientPermissionError extends DomainError {
  constructor(action: string, resource = 'resource') {
    super(
      `Insufficient permission to ${action} ${resource}`,
      'INSUFFICIENT_PERMISSION',
      403,
      { action, resource }
    );
  }
}

/**
 * Erro de token obrigatório
 */
export class TokenRequiredError extends DomainError {
  constructor(message = 'Token is required') {
    super(message, 'TOKEN_REQUIRED', 400);
  }
}
