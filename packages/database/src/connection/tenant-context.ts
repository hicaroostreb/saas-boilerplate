// packages/database/src/connection/tenant-context.ts
// ============================================
// TENANT CONTEXT - ENTERPRISE MULTI-TENANT (ASYNC LOCAL STORAGE)
// ============================================

import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  userId?: string;
  organizationId?: string;
  isSuperAdmin?: boolean; // ✅ ADICIONADO: Flag de superadmin para bypass de RLS
  source: 'jwt' | 'session' | 'api_key' | 'system';
  metadata?: Record<string, any>;
}

export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantContextError';
  }
}

/**
 * Gerenciador global de contexto de tenant usando AsyncLocalStorage
 * Garante isolamento automático por request/transação
 */
class TenantContextManager {
  private storage = new AsyncLocalStorage<TenantContext>();

  /**
   * Obtém o contexto atual - lança erro se não definido
   */
  getContext(): TenantContext {
    const context = this.storage.getStore();
    if (!context) {
      throw new TenantContextError(
        'TenantContext not set. Ensure middleware has initialized the context before accessing database.'
      );
    }
    return context;
  }

  /**
   * Obtém o contexto atual ou retorna null se não definido
   */
  getContextOrNull(): TenantContext | null {
    return this.storage.getStore() || null;
  }

  /**
   * Obtém apenas o tenantId - lança erro se não definido
   */
  getTenantId(): string {
    return this.getContext().tenantId;
  }

  /**
   * Obtém o tenantId ou retorna null
   */
  getTenantIdOrNull(): string | null {
    const context = this.getContextOrNull();
    return context?.tenantId || null;
  }

  /**
   * Verifica se há contexto definido
   */
  hasContext(): boolean {
    return this.storage.getStore() !== undefined;
  }

  /**
   * ✅ ADICIONADO: Verifica se o contexto atual é de superadmin
   * Superadmins bypassam RLS mas ainda tem tenant context para auditoria
   */
  isSuperAdminContext(): boolean {
    const context = this.getContextOrNull();
    return context?.isSuperAdmin === true;
  }

  /**
   * Executa uma função dentro de um contexto de tenant (síncrono)
   */
  run<T>(context: TenantContext, callback: () => T): T {
    if (!context.tenantId) {
      throw new TenantContextError('tenantId is required in TenantContext');
    }
    return this.storage.run(context, callback);
  }

  /**
   * Executa uma função assíncrona dentro de um contexto de tenant
   */
  async runAsync<T>(
    context: TenantContext,
    callback: () => Promise<T>
  ): Promise<T> {
    if (!context.tenantId) {
      throw new TenantContextError('tenantId is required in TenantContext');
    }
    return this.storage.run(context, callback);
  }

  /**
   * Executa uma função como system (sem tenant - apenas para operações globais)
   * ⚠️ Use com EXTREMO cuidado - bypassa RLS
   * ⚠️ Diferente de superadmin: system não tem userId, superadmin sim
   */
  runAsSystem<T>(callback: () => T): T {
    const systemContext: TenantContext = {
      tenantId: '__system__',
      source: 'system',
    };
    return this.storage.run(systemContext, callback);
  }

  /**
   * Executa uma função assíncrona como system
   * ⚠️ Use com EXTREMO cuidado - bypassa RLS
   */
  async runAsSystemAsync<T>(callback: () => Promise<T>): Promise<T> {
    const systemContext: TenantContext = {
      tenantId: '__system__',
      source: 'system',
    };
    return this.storage.run(systemContext, callback);
  }

  /**
   * Valida se o contexto atual pertence ao tenant especificado
   */
  validateTenant(expectedTenantId: string): void {
    const context = this.getContext();
    if (context.tenantId !== expectedTenantId) {
      throw new TenantContextError(
        `Tenant mismatch: expected ${expectedTenantId}, got ${context.tenantId}`
      );
    }
  }

  /**
   * Verifica se está executando como system
   * System = operações de infraestrutura (migrations, seeders)
   * Superadmin = usuário humano com acesso cross-tenant
   */
  isSystemContext(): boolean {
    const context = this.getContextOrNull();
    return context?.tenantId === '__system__' || context?.source === 'system';
  }

  /**
   * Atualiza metadata do contexto atual (não cria novo contexto)
   */
  updateMetadata(metadata: Record<string, any>): void {
    const context = this.getContext();
    context.metadata = { ...context.metadata, ...metadata };
  }

  /**
   * Helper para criar contexto de JWT
   */
  static fromJWT(payload: {
    tenantId: string;
    userId?: string;
    organizationId?: string;
    isSuperAdmin?: boolean; // ✅ ADICIONADO
    [key: string]: any;
  }): TenantContext {
    return {
      tenantId: payload.tenantId,
      userId: payload.userId,
      organizationId: payload.organizationId,
      isSuperAdmin: payload.isSuperAdmin ?? false, // ✅ ADICIONADO: Default false
      source: 'jwt',
      metadata: payload,
    };
  }

  /**
   * Helper para criar contexto de Session
   */
  static fromSession(session: {
    tenantId: string;
    userId: string;
    organizationId?: string;
    isSuperAdmin?: boolean; // ✅ ADICIONADO
  }): TenantContext {
    return {
      tenantId: session.tenantId,
      userId: session.userId,
      organizationId: session.organizationId,
      isSuperAdmin: session.isSuperAdmin ?? false, // ✅ ADICIONADO
      source: 'session',
    };
  }

  /**
   * Helper para criar contexto de API Key
   */
  static fromApiKey(apiKey: {
    tenantId: string;
    organizationId?: string;
  }): TenantContext {
    return {
      tenantId: apiKey.tenantId,
      organizationId: apiKey.organizationId,
      source: 'api_key',
    };
  }

  /**
   * ✅ ADICIONADO: Helper para criar contexto de superadmin
   * Superadmin mantém tenantId original para auditoria, mas seta flag isSuperAdmin
   *
   * @param adminUserId - ID do usuário superadmin (obrigatório para auditoria)
   * @param tenantId - Tenant que o superadmin está acessando (para logging)
   */
  static fromSuperAdmin(
    adminUserId: string,
    tenantId = '__superadmin__'
  ): TenantContext {
    return {
      tenantId,
      userId: adminUserId,
      isSuperAdmin: true,
      source: 'system',
      metadata: {
        superadmin_access: true,
        accessed_at: new Date().toISOString(),
      },
    };
  }
}

// Singleton global
export const tenantContext = new TenantContextManager();

/**
 * Decorator para garantir que método sempre tem tenant context
 */
export function RequiresTenantContext() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: any, ...args: any[]) {
      if (!tenantContext.hasContext()) {
        throw new TenantContextError(
          `Method ${propertyKey} requires TenantContext but none was found`
        );
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Decorator para permitir execução como system (bypass RLS)
 */
export function AllowSystemContext() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: any, ...args: any[]) {
      // Se não há contexto, executa como system
      if (!tenantContext.hasContext()) {
        return tenantContext.runAsSystem(() =>
          originalMethod.apply(this, args)
        );
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
