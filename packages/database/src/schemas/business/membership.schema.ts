// packages/database/src/schemas/business/membership.schema.ts
// ============================================
// MEMBERSHIPS SCHEMA - ENTERPRISE RBAC (REFACTORED)
// ============================================

import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { organizations } from './organization.schema';

// Membership enums
export const member_role_enum = pgEnum('member_role', [
  'owner',
  'admin',
  'manager',
  'member',
  'viewer',
]);

export const member_status_enum = pgEnum('member_status', [
  'active',
  'inactive',
  'suspended',
  'pending',
]);

export const memberships = pgTable(
  'memberships',
  {
    user_id: text('user_id').notNull(),
    organization_id: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    tenant_id: text('tenant_id').notNull(), // ✅ ADICIONADO - CRÍTICO!

    // Role and permissions
    role: member_role_enum('role').notNull().default('member'),

    // Granular permissions
    can_invite: boolean('can_invite').notNull().default(false),
    can_manage_projects: boolean('can_manage_projects')
      .notNull()
      .default(false),
    can_manage_members: boolean('can_manage_members').notNull().default(false),
    can_manage_billing: boolean('can_manage_billing').notNull().default(false),
    can_manage_settings: boolean('can_manage_settings')
      .notNull()
      .default(false),
    can_delete_organization: boolean('can_delete_organization')
      .notNull()
      .default(false),

    // Status
    status: member_status_enum('status').notNull().default('active'),

    // Invitation tracking
    invited_by: text('invited_by'),
    invited_at: timestamp('invited_at'),
    accepted_at: timestamp('accepted_at'),

    // Activity tracking
    last_activity_at: timestamp('last_activity_at'),

    // Additional info
    title: text('title'), // Job title
    department: text('department'),

    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
  },
  table => ({
    // Primary key composite
    primaryKey: { columns: [table.user_id, table.organization_id] },

    // ✅ REFATORADO - tenant_id SEMPRE PRIMEIRO
    tenantOrgIdx: index('memberships_tenant_org_idx').on(
      table.tenant_id,
      table.organization_id
    ),
    tenantUserIdx: index('memberships_tenant_user_idx').on(
      table.tenant_id,
      table.user_id
    ),
    tenantOrgRoleIdx: index('memberships_tenant_org_role_idx').on(
      table.tenant_id,
      table.organization_id,
      table.role
    ),
    tenantOrgStatusIdx: index('memberships_tenant_org_status_idx').on(
      table.tenant_id,
      table.organization_id,
      table.status
    ),
    tenantUserStatusIdx: index('memberships_tenant_user_status_idx').on(
      table.tenant_id,
      table.user_id,
      table.status
    ),

    // Performance indexes
    userIdx: index('memberships_user_idx').on(table.user_id),
    orgIdx: index('memberships_org_idx').on(table.organization_id),
    roleIdx: index('memberships_role_idx').on(table.role),
    statusIdx: index('memberships_status_idx').on(table.status),

    // Activity indexes
    lastActivityIdx: index('memberships_last_activity_idx').on(
      table.last_activity_at
    ),
    invitedByIdx: index('memberships_invited_by_idx').on(table.invited_by),

    // Composite indexes for common queries
    orgRoleIdx: index('memberships_org_role_idx').on(
      table.organization_id,
      table.role
    ),
    orgStatusIdx: index('memberships_org_status_idx').on(
      table.organization_id,
      table.status
    ),
    userStatusIdx: index('memberships_user_status_idx').on(
      table.user_id,
      table.status
    ),
    orgActiveIdx: index('memberships_org_active_idx').on(
      table.organization_id,
      table.status,
      table.deleted_at
    ),

    // Permission indexes for authorization queries
    canInviteIdx: index('memberships_can_invite_idx').on(
      table.organization_id,
      table.can_invite
    ),
    canManageProjectsIdx: index('memberships_can_manage_projects_idx').on(
      table.organization_id,
      table.can_manage_projects
    ),
    canManageMembersIdx: index('memberships_can_manage_members_idx').on(
      table.organization_id,
      table.can_manage_members
    ),
    canManageBillingIdx: index('memberships_can_manage_billing_idx').on(
      table.organization_id,
      table.can_manage_billing
    ),

    // Timestamps
    createdIdx: index('memberships_created_idx').on(table.created_at),
    deletedIdx: index('memberships_deleted_idx').on(table.deleted_at),
  })
);

// Types
export type Membership = typeof memberships.$inferSelect;
export type CreateMembership = typeof memberships.$inferInsert;
export type MemberRole = (typeof member_role_enum.enumValues)[number];
export type MemberStatus = (typeof member_status_enum.enumValues)[number];

// ✅ NOVO - Permission helpers
export function hasPermission(
  membership: Membership,
  permission: keyof Pick<
    Membership,
    | 'can_invite'
    | 'can_manage_projects'
    | 'can_manage_members'
    | 'can_manage_billing'
    | 'can_manage_settings'
    | 'can_delete_organization'
  >
): boolean {
  // Owners e admins têm todas as permissões
  if (membership.role === 'owner' || membership.role === 'admin') {
    return true;
  }

  return membership[permission] === true;
}

export function getRolePermissions(role: MemberRole): {
  can_invite: boolean;
  can_manage_projects: boolean;
  can_manage_members: boolean;
  can_manage_billing: boolean;
  can_manage_settings: boolean;
  can_delete_organization: boolean;
} {
  switch (role) {
    case 'owner':
      return {
        can_invite: true,
        can_manage_projects: true,
        can_manage_members: true,
        can_manage_billing: true,
        can_manage_settings: true,
        can_delete_organization: true,
      };
    case 'admin':
      return {
        can_invite: true,
        can_manage_projects: true,
        can_manage_members: true,
        can_manage_billing: true,
        can_manage_settings: true,
        can_delete_organization: false, // Apenas owner
      };
    case 'manager':
      return {
        can_invite: true,
        can_manage_projects: true,
        can_manage_members: false,
        can_manage_billing: false,
        can_manage_settings: false,
        can_delete_organization: false,
      };
    case 'member':
      return {
        can_invite: false,
        can_manage_projects: false,
        can_manage_members: false,
        can_manage_billing: false,
        can_manage_settings: false,
        can_delete_organization: false,
      };
    case 'viewer':
      return {
        can_invite: false,
        can_manage_projects: false,
        can_manage_members: false,
        can_manage_billing: false,
        can_manage_settings: false,
        can_delete_organization: false,
      };
  }
}

export function isActiveMember(membership: Membership): boolean {
  return membership.status === 'active' && membership.deleted_at === null;
}

export function canAccessResource(
  membership: Membership,
  resourceType: 'projects' | 'members' | 'billing' | 'settings'
): boolean {
  const permissionMap = {
    projects: 'can_manage_projects' as const,
    members: 'can_manage_members' as const,
    billing: 'can_manage_billing' as const,
    settings: 'can_manage_settings' as const,
  };

  return hasPermission(membership, permissionMap[resourceType]);
}
