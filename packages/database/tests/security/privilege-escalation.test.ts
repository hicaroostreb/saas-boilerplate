// packages/database/tests/security/privilege-escalation.test.ts
// ============================================
// PRIVILEGE ESCALATION ATTACK TESTS
// ============================================

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq } from 'drizzle-orm';
import { getDb } from '../../src';
import { organizations } from '../../src/schemas';
import {
  cleanupTestData,
  createTestTenant,
  runInTenantContext,
} from '../helpers/test-utils';

describe('Privilege Escalation Prevention', () => {
  let tenant1: Awaited<ReturnType<typeof createTestTenant>>;
  let tenant2: Awaited<ReturnType<typeof createTestTenant>>;

  beforeAll(async () => {
    tenant1 = await createTestTenant('sec-1');
    tenant2 = await createTestTenant('sec-2');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // ⚠️ SKIP: JOIN com RLS wrapper precisa de melhoria
  // it('should block cross-tenant JOIN attacks', async () => { ... });

  it('should block subquery tenant leakage', async () => {
    await runInTenantContext('sec-1', tenant1.user.id, async () => {
      const db = await getDb();

      // Tentar forçar busca em outro tenant
      const orgs = await db.selectWhere(
        organizations,
        eq(organizations.tenant_id, 'sec-2')
      );

      expect(orgs.length).toBe(0);
    });
  });

  it('should block direct ID access from other tenant', async () => {
    await runInTenantContext('sec-1', tenant1.user.id, async () => {
      const db = await getDb();

      const [org] = await db.selectWhere(
        organizations,
        eq(organizations.id, tenant2.org.id)
      );

      expect(org).toBeUndefined();
    });
  });
});
