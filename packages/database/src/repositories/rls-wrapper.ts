// packages/database/src/repositories/rls-wrapper.ts
// ============================================
// RLS WRAPPER - ENTERPRISE ROW-LEVEL SECURITY (FINAL)
// ============================================

import { and, eq, SQL, sql } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { Database } from '../connection';
import {
  tenantContext,
  TenantContextError,
} from '../connection/tenant-context';

export class RLSViolationError extends Error {
  constructor(
    message: string,
    public readonly tableName?: string
  ) {
    super(message);
    this.name = 'RLSViolationError';
  }
}

export class RLSRepositoryWrapper {
  constructor(private readonly db: Database) {}

  private hasTenantColumn(table: PgTable): boolean {
    return 'tenant_id' in (table || {});
  }

  /**
   * Injeta filtro de tenant_id em queries
   * ✅ BYPASS: System context (migrations/seeders)
   * ✅ BYPASS: Superadmin context (acesso cross-tenant auditado)
   */
  private injectTenantFilter<T extends PgTable>(
    table: T,
    additionalConditions?: SQL
  ): SQL {
    // ✅ ADICIONADO: Bypass para system context
    if (tenantContext.isSystemContext()) {
      return additionalConditions || sql`true`;
    }

    // ✅ ADICIONADO: Bypass para superadmin context
    if (tenantContext.isSuperAdminContext()) {
      return additionalConditions || sql`true`;
    }

    const { tenantId } = tenantContext.getContext();

    if (!this.hasTenantColumn(table)) {
      console.warn(
        `[RLS] Table ${String(table)} has no tenant_id column - skipping RLS filter`
      );
      return additionalConditions || sql`true`;
    }

    const tenantFilter = eq((table as any).tenant_id, tenantId);

    return additionalConditions
      ? and(tenantFilter, additionalConditions)!
      : tenantFilter;
  }

  select<T extends PgTable>(table: T): any {
    const conditions = this.injectTenantFilter(table);

    return this.db
      .select()
      .from(table as any)
      .where(conditions);
  }

  selectWhere<T extends PgTable>(table: T, conditions: SQL): any {
    const finalConditions = this.injectTenantFilter(table, conditions);

    return this.db
      .select()
      .from(table as any)
      .where(finalConditions);
  }

  updateWhere<T extends PgTable>(table: T, conditions: SQL) {
    const finalConditions = this.injectTenantFilter(table, conditions);
    const db = this.db;

    return {
      set: (values: any) => {
        return db
          .update(table as any)
          .set(values)
          .where(finalConditions);
      },
    };
  }

  deleteWhere<T extends PgTable>(table: T, conditions: SQL) {
    const finalConditions = this.injectTenantFilter(table, conditions);

    return this.db.delete(table as any).where(finalConditions);
  }

  async insert<T extends PgTable>(table: T, values: any | any[]) {
    // System context não injeta tenant_id automaticamente
    if (tenantContext.isSystemContext()) {
      return this.db.insert(table as any).values(values);
    }

    // ✅ ADICIONADO: Superadmin ainda injeta tenant_id (para auditoria)
    // Se superadmin quer criar em outro tenant, deve passar tenant_id explícito
    if (tenantContext.isSuperAdminContext()) {
      const { tenantId } = tenantContext.getContext();

      if (!this.hasTenantColumn(table)) {
        return this.db.insert(table as any).values(values);
      }

      // Se valores já têm tenant_id, usa ele (superadmin pode especificar)
      // Se não tem, usa o tenant_id do contexto
      const valuesWithTenant = Array.isArray(values)
        ? values.map(v => ({ tenant_id: tenantId, ...v }))
        : { tenant_id: tenantId, ...values };

      return this.db.insert(table as any).values(valuesWithTenant);
    }

    if (!this.hasTenantColumn(table)) {
      return this.db.insert(table as any).values(values);
    }

    const { tenantId } = tenantContext.getContext();

    const valuesWithTenant = Array.isArray(values)
      ? values.map(v => ({ ...v, tenant_id: tenantId }))
      : { ...values, tenant_id: tenantId };

    return this.db.insert(table as any).values(valuesWithTenant);
  }

  async transaction<T>(callback: (tx: Database) => Promise<T>): Promise<T> {
    if (!tenantContext.hasContext() && !tenantContext.isSystemContext()) {
      throw new TenantContextError(
        'Cannot start transaction without TenantContext'
      );
    }

    const context = tenantContext.getContextOrNull();

    return this.db.transaction(async tx => {
      if (context) {
        return tenantContext.runAsync(context, () => callback(tx));
      }
      return callback(tx);
    });
  }

  /**
   * Transação com RLS enforced no PostgreSQL
   * ✅ ADICIONADO: Seta app.is_super_admin para bypass de policies
   */
  async transactionWithRLS<T>(
    callback: (tx: Database) => Promise<T>
  ): Promise<T> {
    const context = tenantContext.getContextOrNull();

    if (!context) {
      throw new TenantContextError(
        'Cannot start RLS transaction without TenantContext'
      );
    }

    return this.db.transaction(async tx => {
      // Seta tenant_id para RLS policies
      await tx.execute(sql`SET LOCAL app.tenant_id = ${context.tenantId}`);

      // ✅ ADICIONADO: Seta flag de superadmin para bypass de policies
      await tx.execute(
        sql`SET LOCAL app.is_super_admin = ${context.isSuperAdmin ?? false}`
      );

      return tenantContext.runAsync(context, () => callback(tx));
    });
  }

  async count<T extends PgTable>(table: T, conditions?: SQL): Promise<number> {
    const finalConditions = this.injectTenantFilter(table, conditions);

    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(table as any)
      .where(finalConditions);

    return Number(result?.count ?? 0);
  }

  async exists<T extends PgTable>(table: T, conditions: SQL): Promise<boolean> {
    const finalConditions = this.injectTenantFilter(table, conditions);

    const [result] = await this.db
      .select({ exists: sql<boolean>`1` })
      .from(table as any)
      .where(finalConditions)
      .limit(1);

    return !!result?.exists;
  }

  /**
   * Valida que um resource pertence ao tenant atual
   * ✅ ADICIONADO: Bypass para system e superadmin
   */
  async validateTenantOwnership<T extends PgTable>(
    table: T,
    resourceId: string,
    idColumn: string = 'id'
  ): Promise<void> {
    // ✅ ADICIONADO: Bypass para system context
    if (tenantContext.isSystemContext()) {
      return;
    }

    // ✅ ADICIONADO: Bypass para superadmin context
    if (tenantContext.isSuperAdminContext()) {
      return;
    }

    const { tenantId } = tenantContext.getContext();

    if (!this.hasTenantColumn(table)) {
      throw new RLSViolationError(
        `Cannot validate tenant ownership on table without tenant_id`,
        String(table)
      );
    }

    const conditions = and(
      eq((table as any)[idColumn], resourceId),
      eq((table as any).tenant_id, tenantId)
    );

    const exists = await this.exists(table, conditions!);

    if (!exists) {
      throw new RLSViolationError(
        `Resource ${resourceId} not found or does not belong to tenant ${tenantId}`,
        String(table)
      );
    }
  }

  async batchInsert<T extends PgTable>(
    table: T,
    values: any[],
    batchSize = 100
  ): Promise<void> {
    if (values.length === 0) return;

    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      await this.insert(table, batch);
    }
  }

  async softDelete<T extends PgTable>(
    table: T,
    conditions: SQL
  ): Promise<void> {
    const finalConditions = this.injectTenantFilter(table, conditions);

    await this.db
      .update(table as any)
      .set({ deleted_at: new Date(), updated_at: new Date() } as any)
      .where(finalConditions);
  }

  restore<T extends PgTable>(table: T, conditions: SQL): any {
    const finalConditions = this.injectTenantFilter(table, conditions);

    return this.db
      .update(table as any)
      .set({ deleted_at: null, updated_at: new Date() } as any)
      .where(finalConditions)
      .returning();
  }
}

export function createTenantFilterSQL(tenantId: string): SQL {
  return sql`tenant_id = ${tenantId}`;
}

/**
 * Valida que resultado de query contém apenas dados do tenant esperado
 * ✅ ADICIONADO: Bypass para superadmin
 */
export function validateTenantResult<T extends { tenant_id?: string | null }>(
  result: T | T[] | null | undefined,
  expectedTenantId: string
): void {
  if (!result) return;

  // ✅ ADICIONADO: Bypass validação para superadmin
  const context = tenantContext.getContextOrNull();
  if (context?.isSuperAdmin) {
    return;
  }

  const results = Array.isArray(result) ? result : [result];

  for (const item of results) {
    if (item.tenant_id && item.tenant_id !== expectedTenantId) {
      throw new RLSViolationError(
        `Result contains data from different tenant: expected ${expectedTenantId}, got ${item.tenant_id}`
      );
    }
  }
}
