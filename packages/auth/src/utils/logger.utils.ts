/**
 * @fileoverview Logger estruturado para observabilidade
 * Logs em formato JSON com contexto consistente
 */

import { DomainError } from '@workspace/shared/errors';

/**
 * Contexto base para todos os logs
 */
export interface LogContext {
  requestId?: string;
  route?: string;
  handlerName?: string;
  userId?: string;
  organizationId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

/**
 * Níveis de log disponíveis
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Estrutura padronizada do log
 */
export interface StructuredLog {
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    code?: string;
    statusCode?: number;
    stack?: string;
  };
}

/**
 * Type guard para DomainError
 */
function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/**
 * Type guard para Error básico
 */
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Logger estruturado para o domínio auth
 */
export class AuthLogger {
  /**
   * Log de informação
   */
  static info(message: string, context: LogContext = {}): void {
    this.log('info', message, context);
  }

  /**
   * Log de warning
   */
  static warn(message: string, context: LogContext = {}): void {
    this.log('warn', message, context);
  }

  /**
   * Log de erro
   */
  static error(
    message: string,
    error?: unknown,
    context: LogContext = {}
  ): void {
    const structuredLog: StructuredLog = {
      level: 'error',
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    };

    if (error) {
      structuredLog.error = this.serializeError(error);
    }

    // Em produção, isso seria enviado para um sistema de logging centralizado
    console.error(
      JSON.stringify(
        structuredLog,
        null,
        process.env.NODE_ENV === 'development' ? 2 : 0
      )
    );
  }

  /**
   * Log de debug
   */
  static debug(message: string, context: LogContext = {}): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }

  /**
   * Log genérico
   */
  private static log(
    level: LogLevel,
    message: string,
    context: LogContext
  ): void {
    const structuredLog: StructuredLog = {
      level,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    };

    const logMethod =
      level === 'error'
        ? console.error
        : level === 'warn'
          ? console.warn
          : console.warn; // Usar warn em vez de log

    logMethod(
      JSON.stringify(
        structuredLog,
        null,
        process.env.NODE_ENV === 'development' ? 2 : 0
      )
    );
  }

  /**
   * Serializar erro para JSON seguro
   */
  private static serializeError(error: unknown): StructuredLog['error'] {
    if (isDomainError(error)) {
      return {
        name: error.constructor.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }

    if (isError(error)) {
      return {
        name: error.constructor.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }

    return {
      name: 'UnknownError',
      message: String(error),
    };
  }

  /**
   * Extrair requestId do Request do Next.js
   */
  static extractRequestId(request: Request): string | undefined {
    // Tentar extrair de headers comuns
    const headers = request.headers;

    return (
      headers.get('x-request-id') ??
      headers.get('x-correlation-id') ??
      headers.get('x-trace-id') ??
      undefined
    );
  }

  /**
   * Criar contexto base para requisição
   */
  static createRequestContext(
    request: Request,
    handlerName: string
  ): LogContext {
    const url = new URL(request.url);

    return {
      requestId:
        this.extractRequestId(request) ??
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      route: `${request.method} ${url.pathname}`,
      handlerName,
    };
  }
}
