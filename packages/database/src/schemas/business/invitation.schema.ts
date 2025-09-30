// ============================================
// INVITATION SCHEMA - SRP: APENAS INVITATION TABLE
// ============================================

import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../auth/user.schema';
import { memberRoleEnum } from './membership.schema';
import { organizations } from './organization.schema';

// ============================================
// ENUMS
// ============================================

export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'declined',
  'expired',
  'cancelled',
]);

export const invitationTypeEnum = pgEnum('invitation_type', [
  'email',
  'link',
  'direct',
]);

// ============================================
// INVITATION TABLE DEFINITION
// ============================================

export const invitations = pgTable(
  'invitations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Relations
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    invitedBy: text('invited_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    invitedUserId: text('invited_user_id').references(() => users.id), // Null if inviting by email

    // Invitation details
    email: varchar('email', { length: 255 }).notNull(),
    role: memberRoleEnum('role').default('member').notNull(),

    // Invitation method
    type: invitationTypeEnum('type').default('email').notNull(),

    // Tokens & security
    token: text('token').notNull().unique(),

    // Status
    status: invitationStatusEnum('status').default('pending').notNull(),

    // Personal message
    message: text('message'),

    // Timing
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    sentAt: timestamp('sent_at', { mode: 'date' }),
    acceptedAt: timestamp('accepted_at', { mode: 'date' }),
    declinedAt: timestamp('declined_at', { mode: 'date' }),

    // Tracking
    reminderSentAt: timestamp('reminder_sent_at', { mode: 'date' }),
    reminderCount: varchar('reminder_count', { length: 2 })
      .default('0')
      .notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    // Indexes for performance
    tokenIdx: index('invitation_token_idx').on(table.token),
    emailIdx: index('invitation_email_idx').on(table.email),
    orgIdx: index('invitation_org_idx').on(table.organizationId),
    invitedByIdx: index('invitation_invited_by_idx').on(table.invitedBy),
    statusIdx: index('invitation_status_idx').on(table.status),
    expiresAtIdx: index('invitation_expires_at_idx').on(table.expiresAt),
    createdAtIdx: index('invitation_created_at_idx').on(table.createdAt),

    // Composite indexes
    orgStatusIdx: index('invitation_org_status_idx').on(
      table.organizationId,
      table.status
    ),
    emailOrgIdx: index('invitation_email_org_idx').on(
      table.email,
      table.organizationId
    ),
  })
);

// ============================================
// INVITATION TYPES
// ============================================

export type Invitation = typeof invitations.$inferSelect;
export type CreateInvitation = typeof invitations.$inferInsert;

// Enum types
export type InvitationStatus = (typeof invitationStatusEnum.enumValues)[number];
export type InvitationType = (typeof invitationTypeEnum.enumValues)[number];

// Invitation with organization info
export type InvitationWithOrganization = Invitation & {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};

// Invitation with inviter info
export type InvitationWithInviter = Invitation & {
  inviter: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// Full invitation info
export type FullInvitation = Invitation & {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  inviter: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  invitedUser?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// Invitation summary for dashboard
export type InvitationSummary = Pick<
  Invitation,
  'id' | 'email' | 'role' | 'status' | 'createdAt' | 'expiresAt'
> & {
  organizationName: string;
  inviterName: string | null;
};
