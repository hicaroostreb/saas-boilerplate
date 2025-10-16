// packages/database/tests/multi-tenant.test.ts
// ============================================
// MULTI-TENANT ISOLATION TESTS
// ============================================

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq } from 'drizzle-orm';
import { getDb } from '../../src';
import { organizations, users } from '../../src/schemas';
import {
  cleanupTestData,
  createTestTenant,
  runInTenantContext,
} from '../helpers/test-utils';

describe('Multi-Tenant Isolation', () => {
  let tenant1: Awaited<ReturnType<typeof createTestTenant>>;
  let tenant2: Awaited<ReturnType<typeof createTestTenant>>;

  beforeAll(async () => {
    tenant1 = await createTestTenant('tenant-1');
    tenant2 = await createTestTenant('tenant-2');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('should only return data from current tenant', async () => {
    await runInTenantContext('tenant-1', tenant1.user.id, async () => {
      const db = await getDb();

      // ✅ Buscar diretamente do DB (não via repository que retorna Entity)
      const [user] = await db.selectWhere(users, eq(users.id, tenant1.user.id));

      expect(user).not.toBeNull();
      expect(user?.tenant_id).toBe('tenant-1');
    });
  });

  it('should not access data from other tenant', async () => {
    await runInTenantContext('tenant-1', tenant1.user.id, async () => {
      const db = await getDb();

      // Tentar buscar user de outro tenant pelo ID (RLS deve bloquear)
      const [user] = await db.selectWhere(users, eq(users.id, tenant2.user.id));

      expect(user).toBeUndefined(); // RLS bloqueia
    });
  });

  it('should filter organizations by tenant', async () => {
    await runInTenantContext('tenant-2', tenant2.user.id, async () => {
      const db = await getDb();

      const [org] = await db.selectWhere(
        organizations,
        eq(organizations.id, tenant2.org.id)
      );

      expect(org).not.toBeNull();
      expect(org?.tenant_id).toBe('tenant-2');
    });
  });
});
