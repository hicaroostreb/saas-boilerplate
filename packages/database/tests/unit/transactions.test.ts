// packages/database/tests/unit/transactions.test.ts
// ============================================
// TRANSACTIONS WITH RLS TESTS
// ============================================

import { hash } from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { eq } from 'drizzle-orm';
import { getDb } from '../../src';
import { users } from '../../src/schemas';
import {
  cleanupTestData,
  createTestTenant,
  runInTenantContext,
} from '../helpers/test-utils';

describe('Transactions with RLS', () => {
  let tenant: Awaited<ReturnType<typeof createTestTenant>>;

  beforeAll(async () => {
    tenant = await createTestTenant('tx-test');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it('should create user inside transaction with tenant context', async () => {
    await runInTenantContext('tx-test', tenant.user.id, async () => {
      const db = await getDb();
      const testEmail = `tx-${Date.now()}@test.com`;

      await db.transactionWithRLS(async tx => {
        const [newUser] = await tx
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            tenant_id: 'tx-test',
            email: testEmail,
            name: 'TX User',
            password_hash: await hash('TestPass123', 10),
            is_email_verified: true,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        expect(newUser.tenant_id).toBe('tx-test');
      });

      // Verificar que user foi criado
      const [createdUser] = await db.selectWhere(
        users,
        eq(users.email, testEmail)
      );
      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(testEmail);
    });
  });

  it('should rollback transaction on error', async () => {
    await runInTenantContext('tx-test', tenant.user.id, async () => {
      const db = await getDb();
      const testEmail = `rollback-${Date.now()}@test.com`;

      let errorThrown = false;

      try {
        await db.transactionWithRLS(async tx => {
          await tx.insert(users).values({
            id: crypto.randomUUID(),
            tenant_id: 'tx-test',
            email: testEmail,
            name: 'Rollback User',
            password_hash: await hash('TestPass123', 10),
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          });

          throw new Error('Force rollback');
        });
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Force rollback');
      }

      expect(errorThrown).toBe(true);

      // Verificar que user NÃO foi criado (rollback funcionou)
      const [user] = await db.selectWhere(users, eq(users.email, testEmail));
      expect(user).toBeUndefined();
    });
  });
});
