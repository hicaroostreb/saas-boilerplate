// ============================================
// MEMBERSHIP SCHEMA - SRP: APENAS MEMBERSHIP TABLE
// ============================================

import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../auth/user.schema';
import { organizations } from './organization.schema';

// ============================================
// ENUMS
// ============================================

export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'admin',
  'manager',
  'member',
  'viewer',
]);

export const memberStatusEnum = pgEnum('member_status', [
  'active',
  'inactive',
  'suspended',
  'pending',
]);

// ============================================
// MEMBERSHIP TABLE DEFINITION - ✅ FIXED: Single PK
// ============================================

export const memberships = pgTable(
  'memberships',
  {
    // ✅ FIXED: Remove primaryKey() - será composite PK
    id: text('id')
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),

    // Relations - ✅ THESE WILL BE THE PRIMARY KEY
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    // Role & permissions
    role: memberRoleEnum('role').default('member').notNull(),
    permissions: jsonb('permissions').$type<{
      canInvite?: boolean;
      canManageProjects?: boolean;
      canManageMembers?: boolean;
      canManageBilling?: boolean;
      canManageSettings?: boolean;
      canDeleteOrganization?: boolean;
      customPermissions?: string[];
    }>(),

    // Status
    status: memberStatusEnum('status').default('active').notNull(),

    // Invitation info
    invitedBy: text('invited_by').references(() => users.id),
    invitedAt: timestamp('invited_at', { mode: 'date' }),
    acceptedAt: timestamp('accepted_at', { mode: 'date' }),

    // Activity tracking
    lastActivityAt: timestamp('last_activity_at', { mode: 'date' }),

    // Custom fields
    title: varchar('title', { length: 100 }), // Job title within org
    department: varchar('department', { length: 100 }),

    // Metadata
    metadata: jsonb('metadata').$type<Record<string, any>>(),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
  },
  table => ({
    // ✅ FIXED: This is the ONLY primary key now
    pk: primaryKey({
      columns: [table.userId, table.organizationId],
      name: 'memberships_user_id_organization_id_pk',
    }),

    // Indexes for performance
    userOrgIdx: index('membership_user_org_idx').on(
      table.userId,
      table.organizationId
    ),
    userIdx: index('membership_user_idx').on(table.userId),
    orgIdx: index('membership_org_idx').on(table.organizationId),
    roleIdx: index('membership_role_idx').on(table.role),
    statusIdx: index('membership_status_idx').on(table.status),
    lastActivityIdx: index('membership_last_activity_idx').on(
      table.lastActivityAt
    ),
  })
);

// ============================================
// MEMBERSHIP TYPES
// ============================================

export type Membership = typeof memberships.$inferSelect;
export type CreateMembership = typeof memberships.$inferInsert;

// Enum types
export type MemberRole = (typeof memberRoleEnum.enumValues)[number];
export type MemberStatus = (typeof memberStatusEnum.enumValues)[number];

// Permission structure
export type MemberPermissions = {
  canInvite?: boolean;
  canManageProjects?: boolean;
  canManageMembers?: boolean;
  canManageBilling?: boolean;
  canManageSettings?: boolean;
  canDeleteOrganization?: boolean;
  customPermissions?: string[];
};

// Membership with user info
export type MembershipWithUser = Membership & {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// Membership with organization info
export type MembershipWithOrganization = Membership & {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};

// Full membership info
export type FullMembership = Membership & {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};
