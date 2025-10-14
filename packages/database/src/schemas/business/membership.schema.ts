// packages/database/src/schemas/business/membership.schema.ts
// ============================================
// MEMBERSHIPS SCHEMA - ENTERPRISE RBAC
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
export type UpdateMembership = Partial<Omit<Membership, 'user_id' | 'organization_id' | 'created_at'>>;
export type MemberRole = typeof member_role_enum.enumValues[number];
export type MemberStatus = typeof member_status_enum.enumValues[number];

// Extended membership types
export interface MembershipWithUser extends Membership {
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
    is_active: boolean;
  };
}

export interface MembershipWithOrganization extends Membership {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    is_active: boolean;
  };
}

export interface MembershipSummary {
  total_members: number;
  active_members: number;
  pending_members: number;
  suspended_members: number;
  owners: number;
  admins: number;
  managers: number;
  members: number;
  viewers: number;
}

// Permission definitions
export interface RolePermissions {
  can_invite: boolean;
  can_manage_projects: boolean;
  can_manage_members: boolean;
  can_manage_billing: boolean;
  can_manage_settings: boolean;
  can_delete_organization: boolean;
}

// Role hierarchy and permissions
export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  viewer: 1,
  member: 2,
  manager: 3,
  admin: 4,
  owner: 5,
};

export const DEFAULT_ROLE_PERMISSIONS: Record<MemberRole, RolePermissions> = {
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
    can_manage_billing: false,
    can_manage_settings: false,
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

// Helper functions
export function isMembershipActive(membership: Membership): boolean {
  return membership.status === 'active' && !membership.deleted_at;
}

export function canManageRole(actorRole: MemberRole, targetRole: MemberRole): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

export function canAssignRole(actorRole: MemberRole, roleToAssign: MemberRole): boolean {
  // Can only assign roles lower than your own
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[roleToAssign];
}

export function hasPermission(membership: Membership, permission: keyof RolePermissions): boolean {
  if (!isMembershipActive(membership)) {
    return false;
  }
  
  // Check explicit permission
  return membership[permission] === true;
}

export function getRolePermissions(role: MemberRole): RolePermissions {
  return DEFAULT_ROLE_PERMISSIONS[role];
}

export function isHigherRole(role1: MemberRole, role2: MemberRole): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

export function getHighestRole(roles: MemberRole[]): MemberRole {
  return roles.reduce((highest, current) => 
    isHigherRole(current, highest) ? current : highest
  );
}

export function canInviteMembers(membership: Membership): boolean {
  return hasPermission(membership, 'can_invite');
}

export function canManageProjects(membership: Membership): boolean {
  return hasPermission(membership, 'can_manage_projects');
}

export function canManageMembers(membership: Membership): boolean {
  return hasPermission(membership, 'can_manage_members');
}

export function canManageBilling(membership: Membership): boolean {
  return hasPermission(membership, 'can_manage_billing');
}

export function canManageSettings(membership: Membership): boolean {
  return hasPermission(membership, 'can_manage_settings');
}

export function canDeleteOrganization(membership: Membership): boolean {
  return hasPermission(membership, 'can_delete_organization');
}

// Membership validation
export function validateMembershipUpdate(
  currentMembership: Membership,
  updates: UpdateMembership,
  actorMembership: Membership
): { isValid: boolean; error?: string } {
  // Check if actor can manage the target member
  if (!canManageRole(actorMembership.role, currentMembership.role)) {
    return {
      isValid: false,
      error: 'Insufficient permissions to modify this membership',
    };
  }

  // Check if actor can assign the new role
  if (updates.role && !canAssignRole(actorMembership.role, updates.role)) {
    return {
      isValid: false,
      error: 'Cannot assign a role equal to or higher than your own',
    };
  }

  // Prevent removing the last owner
  if (currentMembership.role === 'owner' && updates.role !== 'owner') {
    // This check should be done at the service level with a count query
    return {
      isValid: false,
      error: 'Cannot remove the last owner of an organization',
    };
  }

  return { isValid: true };
}

// Activity tracking
export function shouldUpdateActivity(membership: Membership): boolean {
  if (!membership.last_activity_at) {
    return true;
  }
  
  const hoursSinceLastActivity = (Date.now() - membership.last_activity_at.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastActivity >= 1; // Update if more than 1 hour since last update
}

export function getMembershipDuration(membership: Membership): number {
  const start = membership.accepted_at || membership.created_at;
  return Date.now() - start.getTime();
}

export function formatMembershipDuration(membership: Membership): string {
  const duration = getMembershipDuration(membership);
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  
  if (days < 1) {
    return 'Less than a day';
  } else if (days < 30) {
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
}
