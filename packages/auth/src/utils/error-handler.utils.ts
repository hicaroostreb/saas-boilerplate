/**
 * @fileoverview Wrapper centralizado para captura de erros
 * Elimina duplicação de try/catch nos controllers
 */

import { DomainError } from '@workspace/shared';
import { NextRequest, NextResponse } from 'next/server';
import { AuthLogger, type LogContext } from './logger.utils';

/**
 * Tipo para métodos do controller que retornam NextResponse
 */
export type ControllerMethod = (request: NextRequest) => Promise<NextResponse>;

/**
 * Interface para configuração do wrapper de erro
 */
export interface ErrorHandlerConfig {
  handlerName: string;
  successMessage?: string;
  extractContextData?: (
    request: NextRequest,
    body?: Record<string, unknown>
  ) => Partial<LogContext>;
}

/**
 * Interface para sessão do usuário
 */
interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Extensão do NextRequest para incluir sessão
 */
interface RequestWithSession extends NextRequest {
  _session?: UserSession;
}

/**
 * Interface para erros Zod
 */
interface ZodError extends Error {
  name: 'ZodError';
  errors: Array<{
    code: string;
    expected?: string;
    received?: string;
    path: Array<string | number>;
    message: string;
  }>;
}

/**
 * Wrapper principal que captura e trata erros uniformemente
 */
export function withErrorHandler(
  method: ControllerMethod,
  config: ErrorHandlerConfig
): ControllerMethod {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = AuthLogger.createRequestContext(
      request,
      config.handlerName
    );

    try {
      // Log início da operação
      AuthLogger.info(`${config.handlerName} started`, context);

      // Executar o método original
      const response = await method(request);

      // Extrair dados adicionais de contexto se configurado
      if (config.extractContextData) {
        const body =
          request.method !== 'GET'
            ? await request.json().catch(() => ({}))
            : {};
        const additionalContext = config.extractContextData(request, body);
        Object.assign(context, additionalContext);
      }

      // Log sucesso
      const successMsg =
        config.successMessage ?? `${config.handlerName} completed successfully`;
      AuthLogger.info(successMsg, context);

      return response;
    } catch (error) {
      // Log erro com contexto completo
      AuthLogger.error(`${config.handlerName} failed`, error, context);

      // Retornar resposta baseada no tipo de erro
      return handleErrorResponse(error);
    }
  };
}

/**
 * Função para verificar se é erro Zod
 */
function isZodError(error: unknown): error is ZodError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'ZodError'
  );
}

/**
 * Função para tratar diferentes tipos de erro e retornar resposta adequada
 */
export function handleErrorResponse(error: unknown): NextResponse {
  // Erros de domínio específicos
  if (error instanceof DomainError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        success: false,
      },
      { status: error.statusCode }
    );
  }

  // Erros de validação Zod
  if (isZodError(error)) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors,
        success: false,
      },
      { status: 400 }
    );
  }

  // Erro genérico
  return NextResponse.json(
    {
      error: 'Internal server error',
      success: false,
    },
    { status: 500 }
  );
}

/**
 * Decorator para métodos que precisam de sessão autenticada
 */
export function withAuth(
  method: ControllerMethod,
  config: ErrorHandlerConfig
): ControllerMethod {
  return withErrorHandler(async (request: NextRequest) => {
    // Verificar autenticação antes de executar o método
    const { getServerSession } = await import('@workspace/auth/server');
    const session = await getServerSession();

    if (!session?.user?.id) {
      const { UnauthenticatedError } = await import('../domain/exceptions');
      throw new UnauthenticatedError();
    }

    // Adicionar userId ao request para uso no método
    const requestWithSession = request as RequestWithSession;
    requestWithSession._session = {
      user: {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
      },
    };

    return method(request);
  }, config);
}

/**
 * Helper para extrair dados comuns de contexto
 */
export const contextExtractors = {
  /**
   * Extrator para operações de auth (email do body)
   */
  authOperation: (
    request: NextRequest,
    body?: Record<string, unknown>
  ): Partial<LogContext> => ({
    userId: body?.email as string | undefined,
  }),

  /**
   * Extrator para operações de organização
   */
  organizationOperation: (
    request: NextRequest,
    body?: Record<string, unknown>
  ): Partial<LogContext> => {
    const sessionRequest = request as RequestWithSession;
    const session = sessionRequest._session;
    return {
      userId: session?.user?.id,
      organizationId: body?.organizationId as string | undefined,
    };
  },

  /**
   * Extrator para operações com sessão
   */
  sessionOperation: (request: NextRequest): Partial<LogContext> => {
    const sessionRequest = request as RequestWithSession;
    const session = sessionRequest._session;
    return {
      userId: session?.user?.id,
    };
  },
};
