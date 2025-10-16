// packages/database/tests/integration/soft-delete.test.ts
// ============================================
// SOFT DELETE TESTS
// ============================================

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb } from '../../src';
import { users } from '../../src/schemas';
import {
  cleanupTestData,
  createTestTenant,
  runInTenantContext,
} from '../helpers/test-utils';

describe('Soft Delete', () => {
  let tenant: Awaited<ReturnType<typeof createTestTenant>>;

  beforeAll(async () => {
    tenant = await createTestTenant('soft-del');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('should soft delete and set deleted_at timestamp', async () => {
    await runInTenantContext('soft-del', tenant.user.id, async () => {
      const db = await getDb();

      await db.softDelete(users, eq(users.id, tenant.user.id));

      // ✅ Buscar SEM filtro de deleted_at para verificar que foi marcado
      const [deletedUser] = await db.selectWhere(
        users,
        eq(users.id, tenant.user.id)
      );

      expect(deletedUser?.deleted_at).not.toBeNull();
      expect(deletedUser?.deleted_at).toBeInstanceOf(Date);
    });
  });

  it('should exclude soft-deleted from normal queries with isNull filter', async () => {
    await runInTenantContext('soft-del', tenant.user.id, async () => {
      const db = await getDb();

      // ✅ Query com filtro explícito de deleted_at
      const [activeUser] = await db.selectWhere(
        users,
        and(eq(users.id, tenant.user.id), isNull(users.deleted_at))!
      );

      expect(activeUser).toBeUndefined(); // Já foi deletado no teste anterior
    });
  });

  it('should restore soft-deleted record', async () => {
    await runInTenantContext('soft-del', tenant.user.id, async () => {
      const db = await getDb();

      await db.restore(users, eq(users.id, tenant.user.id));

      const [restoredUser] = await db.selectWhere(
        users,
        eq(users.id, tenant.user.id)
      );
      expect(restoredUser).toBeDefined();
      expect(restoredUser?.deleted_at).toBeNull();
    });
  });
});
