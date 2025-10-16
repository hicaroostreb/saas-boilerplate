// packages/database/tests/helpers/test-utils.ts
// ============================================
// TEST UTILITIES - HELPERS FOR E2E TESTS
// ============================================

import { hash } from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';
import { getDbRaw, tenantContext } from '../../src';
import type { MemberRole } from '../../src/schemas';
import { memberships, organizations, users } from '../../src/schemas';

const rootPath = resolve(__dirname, '../../../..');
config({ path: resolve(rootPath, '.env.local') });

export async function createTestTenant(tenantId: string) {
  const db = await getDbRaw();

  const [user] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      email: `test@${tenantId}.com`,
      name: 'Test User',
      password_hash: await hash('TestPass123', 10),
      is_email_verified: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  const [org] = await db
    .insert(organizations)
    .values({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      name: `Test Org ${tenantId}`,
      slug: tenantId,
      owner_id: user.id,
      plan_type: 'free',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  // ✅ OWNER com TODAS as permissões explícitas
  const [membership] = await db
    .insert(memberships)
    .values({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      user_id: user.id,
      organization_id: org.id,
      role: 'owner',
      status: 'active',
      can_invite: true,
      can_manage_projects: true,
      can_manage_members: true,
      can_manage_billing: true,
      can_manage_settings: true,
      can_delete_organization: true,
      joined_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  return { user, org, membership };
}

export async function createMemberUser(
  tenantId: string,
  orgId: string,
  role: MemberRole
) {
  const db = await getDbRaw();

  const [user] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      email: `${role}@${tenantId}.com`,
      name: `${role} User`,
      password_hash: await hash('TestPass123', 10),
      is_email_verified: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  // ✅ Permissões baseadas em role
  const permissions = {
    owner: {
      can_invite: true,
      can_manage_projects: true,
      can_manage_members: true,
      can_manage_billing: true,
      can_manage_settings: true,
      can_delete_organization: true,
    },
    admin: {
      can_invite: true,
      can_manage_projects: true,
      can_manage_members: true,
      can_manage_billing: true,
      can_manage_settings: true,
      can_delete_organization: false,
    },
    manager: {
      can_invite: true,
      can_manage_projects: true,
      can_manage_members: false,
      can_manage_billing: false,
      can_manage_settings: false,
      can_delete_organization: false,
    },
    member: {
      can_invite: false,
      can_manage_projects: false,
      can_manage_members: false,
      can_manage_billing: false,
      can_manage_settings: false,
      can_delete_organization: false,
    },
    viewer: {
      can_invite: false,
      can_manage_projects: false,
      can_manage_members: false,
      can_manage_billing: false,
      can_manage_settings: false,
      can_delete_organization: false,
    },
  };

  await db.insert(memberships).values({
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    user_id: user.id,
    organization_id: orgId,
    role,
    status: 'active',
    ...permissions[role],
    joined_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  });

  return user;
}

export async function cleanupTestData() {
  const db = await getDbRaw();
  await db.delete(memberships);
  await db.delete(organizations);
  await db.delete(users);
}

export function runInTenantContext<T>(
  tenantId: string,
  userId: string,
  callback: () => Promise<T>
): Promise<T> {
  return tenantContext.runAsync({ tenantId, userId, source: 'test' }, callback);
}
