// packages/database/tests/unit/superadmin.test.ts
// ============================================
// SUPERADMIN BYPASS TESTS
// ============================================

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq } from 'drizzle-orm';
import { getDb, tenantContext } from '../../src';
import { users } from '../../src/schemas';
import { cleanupTestData, createTestTenant } from '../helpers/test-utils';

describe('Superadmin Bypass', () => {
  let tenant1: Awaited<ReturnType<typeof createTestTenant>>;
  let tenant2: Awaited<ReturnType<typeof createTestTenant>>;

  beforeAll(async () => {
    tenant1 = await createTestTenant('super-1');
    tenant2 = await createTestTenant('super-2');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('should allow superadmin to access all tenants', async () => {
    await tenantContext.runAsync(
      {
        tenantId: '__superadmin__',
        userId: 'admin-user',
        isSuperAdmin: true,
        source: 'system',
      },
      async () => {
        const db = await getDb();

        const [user1] = await db.selectWhere(
          users,
          eq(users.id, tenant1.user.id)
        );
        const [user2] = await db.selectWhere(
          users,
          eq(users.id, tenant2.user.id)
        );

        expect(user1).toBeDefined();
        expect(user2).toBeDefined();
        expect(user1?.tenant_id).toBe('super-1');
        expect(user2?.tenant_id).toBe('super-2');
      }
    );
  });

  it('should deny regular user even in superadmin tenant', async () => {
    await tenantContext.runAsync(
      {
        tenantId: 'super-1',
        userId: tenant1.user.id,
        isSuperAdmin: false,
        source: 'test',
      },
      async () => {
        const db = await getDb();

        const [user2] = await db.selectWhere(
          users,
          eq(users.id, tenant2.user.id)
        );
        expect(user2).toBeUndefined();
      }
    );
  });
});
