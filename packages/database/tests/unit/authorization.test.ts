// packages/database/tests/unit/authorization.test.ts
// ============================================
// AUTHORIZATION GUARDS TESTS
// ============================================

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { AuthorizationGuard, getDb } from '../../src';
import {
  cleanupTestData,
  createMemberUser,
  createTestTenant,
  runInTenantContext,
} from '../helpers/test-utils';

describe('Authorization Guards', () => {
  let tenant: Awaited<ReturnType<typeof createTestTenant>>;

  beforeAll(async () => {
    tenant = await createTestTenant('auth-test');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('should allow owner to access organization', async () => {
    await runInTenantContext('auth-test', tenant.user.id, async () => {
      const db = await getDb();
      const guard = new AuthorizationGuard(db);

      const isOwner = await guard.isOwner(tenant.user.id, tenant.org.id);
      expect(isOwner).toBe(true);
    });
  });

  it('should deny non-owner from accessing organization', async () => {
    await runInTenantContext('auth-test', 'other-user-id', async () => {
      const db = await getDb();
      const guard = new AuthorizationGuard(db);

      const isOwner = await guard.isOwner('other-user-id', tenant.org.id);
      expect(isOwner).toBe(false);
    });
  });

  it('should validate active membership', async () => {
    await runInTenantContext('auth-test', tenant.user.id, async () => {
      const db = await getDb();
      const guard = new AuthorizationGuard(db);

      const isActive = await guard.isActiveMember(
        tenant.user.id,
        tenant.org.id
      );
      expect(isActive).toBe(true);
    });
  });

  it('should check if user has minimum role - owner', async () => {
    await runInTenantContext('auth-test', tenant.user.id, async () => {
      const db = await getDb();
      const guard = new AuthorizationGuard(db);

      const hasRole = await guard.hasMinimumRole(
        tenant.user.id,
        tenant.org.id,
        'admin'
      );
      expect(hasRole).toBe(true);
    });
  });

  it('should deny member from having admin role', async () => {
    const memberUser = await createMemberUser(
      'auth-test',
      tenant.org.id,
      'member'
    );

    await runInTenantContext('auth-test', memberUser.id, async () => {
      const db = await getDb();
      const guard = new AuthorizationGuard(db);

      const hasRole = await guard.hasMinimumRole(
        memberUser.id,
        tenant.org.id,
        'admin'
      );
      expect(hasRole).toBe(false);
    });
  });
});
