// packages/database/src/schemas/business/membership.schema.ts
// ============================================
// MEMBERSHIPS SCHEMA - ENTERPRISE RBAC (FIXED ENUM)
// ============================================

import { boolean, index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organization.schema';

// Membership enums
export const member_role_enum = pgEnum('member_role', [
  'owner',
  'admin', 
  'manager',
  'member',
  'viewer',
]);

// FIXED: member_status enum (estava declarado mas não foi incluído)
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
    
    // Role and permissions
    role: member_role_enum('role').notNull().default('member'),
    
    // Granular permissions
    can_invite: boolean('can_invite').notNull().default(false),
    can_manage_projects: boolean('can_manage_projects').notNull().default(false),
    can_manage_members: boolean('can_manage_members').notNull().default(false),
    can_manage_billing: boolean('can_manage_billing').notNull().default(false),
    can_manage_settings: boolean('can_manage_settings').notNull().default(false),
    can_delete_organization: boolean('can_delete_organization').notNull().default(false),
    
    // Status
    status: member_status_enum('status').notNull().default('active'),
    
    // Invitation tracking
    invited_by: text('invited_by'), // User ID who sent the invitation
    invited_at: timestamp('invited_at'),
    accepted_at: timestamp('accepted_at'),
    
    // Activity tracking
    last_activity_at: timestamp('last_activity_at'),
    
    // Additional info
    title: text('title'), // Job title within organization
    department: text('department'),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'), // Soft delete
  },
  (table) => ({
    // Primary key composite
    primaryKey: { columns: [table.user_id, table.organization_id] },
    
    // Performance indexes
    userIdx: index('memberships_user_idx').on(table.user_id),
    orgIdx: index('memberships_org_idx').on(table.organization_id),
    roleIdx: index('memberships_role_idx').on(table.role),
    statusIdx: index('memberships_status_idx').on(table.status),
    
    // Activity indexes
    lastActivityIdx: index('memberships_last_activity_idx').on(table.last_activity_at),
    invitedByIdx: index('memberships_invited_by_idx').on(table.invited_by),
    
    // Composite indexes for common queries
    orgRoleIdx: index('memberships_org_role_idx').on(table.organization_id, table.role),
    orgStatusIdx: index('memberships_org_status_idx').on(table.organization_id, table.status),
    userStatusIdx: index('memberships_user_status_idx').on(table.user_id, table.status),
    orgActiveIdx: index('memberships_org_active_idx').on(table.organization_id, table.status, table.deleted_at),
    
    // Permission indexes for authorization queries
    canInviteIdx: index('memberships_can_invite_idx').on(table.organization_id, table.can_invite),
    canManageProjectsIdx: index('memberships_can_manage_projects_idx').on(table.organization_id, table.can_manage_projects),
    canManageMembersIdx: index('memberships_can_manage_members_idx').on(table.organization_id, table.can_manage_members),
    canManageBillingIdx: index('memberships_can_manage_billing_idx').on(table.organization_id, table.can_manage_billing),
    
    // Timestamps
    createdIdx: index('memberships_created_idx').on(table.created_at),
    deletedIdx: index('memberships_deleted_idx').on(table.deleted_at),
  })
);

// Types
export type Membership = typeof memberships.$inferSelect;
export type CreateMembership = typeof memberships.$inferInsert;
export type MemberRole = typeof member_role_enum.enumValues[number];
export type MemberStatus = typeof member_status_enum.enumValues[number];
