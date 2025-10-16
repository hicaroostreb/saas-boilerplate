// packages/database/src/schemas/business/invitation.schema.ts
// ============================================
// INVITATION SCHEMA - ENTERPRISE INVITATIONS (REFACTORED)
// ============================================

import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Invitation status enum
export const invitation_status_enum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'rejected',
  'expired',
  'cancelled',
]);

export const invitations = pgTable(
  'invitations',
  {
    id: text('id').primaryKey(),
    tenant_id: text('tenant_id').notNull(), // ✅ ADICIONADO

    // Context
    organization_id: text('organization_id').notNull(),
    invited_by: text('invited_by').notNull(),

    // Invitation details
    email: text('email').notNull(),
    role: text('role').notNull(),
    message: text('message'),

    // Token and security
    token: text('token').notNull(),

    // Status and responses
    status: invitation_status_enum('status').default('pending').notNull(),
    accepted_by: text('accepted_by'),
    accepted_at: timestamp('accepted_at'),
    rejected_at: timestamp('rejected_at'),

    // Expiry
    expires_at: timestamp('expires_at').notNull(),

    // Tracking
    sent_at: timestamp('sent_at'),
    reminder_sent_at: timestamp('reminder_sent_at'),

    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    // ✅ REFATORADO - tenant_id sempre primeiro
    tenantOrgIdx: index('invitations_tenant_org_idx').on(
      table.tenant_id,
      table.organization_id
    ),
    tenantEmailIdx: index('invitations_tenant_email_idx').on(
      table.tenant_id,
      table.email
    ),
    tenantOrgStatusIdx: index('invitations_tenant_org_status_idx').on(
      table.tenant_id,
      table.organization_id,
      table.status
    ),
    tenantEmailStatusIdx: index('invitations_tenant_email_status_idx').on(
      table.tenant_id,
      table.email,
      table.status
    ),

    // Primary access patterns
    orgIdx: index('invitations_org_idx').on(table.organization_id),
    emailIdx: index('invitations_email_idx').on(table.email),
    tokenIdx: index('invitations_token_idx').on(table.token),
    invitedByIdx: index('invitations_invited_by_idx').on(table.invited_by),

    // Status and expiry
    statusIdx: index('invitations_status_idx').on(table.status),
    expiresIdx: index('invitations_expires_idx').on(table.expires_at),

    // Response tracking
    acceptedByIdx: index('invitations_accepted_by_idx').on(table.accepted_by),
    acceptedAtIdx: index('invitations_accepted_at_idx').on(table.accepted_at),
    rejectedAtIdx: index('invitations_rejected_at_idx').on(table.rejected_at),

    // Composite indexes
    orgStatusIdx: index('invitations_org_status_idx').on(
      table.organization_id,
      table.status
    ),
    emailStatusIdx: index('invitations_email_status_idx').on(
      table.email,
      table.status
    ),

    // Timestamps
    createdIdx: index('invitations_created_idx').on(table.created_at),
    updatedIdx: index('invitations_updated_idx').on(table.updated_at),
    sentIdx: index('invitations_sent_idx').on(table.sent_at),
    reminderIdx: index('invitations_reminder_idx').on(table.reminder_sent_at),
  })
);

// Types
export type Invitation = typeof invitations.$inferSelect;
export type CreateInvitation = typeof invitations.$inferInsert;
export type InvitationStatus =
  (typeof invitation_status_enum.enumValues)[number];

// Token generation
export function generateInvitationToken(length = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      const arrayValue = array[i];
      if (arrayValue !== undefined) {
        token += chars[arrayValue % chars.length];
      }
    }
  } else {
    for (let i = 0; i < length; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return token;
}

// Invitation utilities
export function isInvitationExpired(invitation: Invitation): boolean {
  return new Date() > invitation.expires_at;
}

export function isInvitationPending(invitation: Invitation): boolean {
  return invitation.status === 'pending' && !isInvitationExpired(invitation);
}

export function canInvitationBeAccepted(invitation: Invitation): boolean {
  return invitation.status === 'pending' && !isInvitationExpired(invitation);
}

export function getInvitationExpiryTime(invitation: Invitation): number {
  return Math.max(0, invitation.expires_at.getTime() - Date.now());
}

export function shouldSendReminder(
  invitation: Invitation,
  reminderAfterHours = 72
): boolean {
  if (invitation.status !== 'pending') return false;
  if (isInvitationExpired(invitation)) return false;
  if (invitation.reminder_sent_at) return false;

  const reminderTime = new Date(invitation.created_at);
  reminderTime.setHours(reminderTime.getHours() + reminderAfterHours);

  return new Date() >= reminderTime;
}

export function createInvitationExpiry(daysFromNow = 7): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysFromNow);
  return expiry;
}

export function formatInvitationUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/invite/${token}`;
}

export function getInvitationAge(invitation: Invitation): number {
  return Date.now() - invitation.created_at.getTime();
}

export function getInvitationAgeInDays(invitation: Invitation): number {
  return Math.floor(getInvitationAge(invitation) / (1000 * 60 * 60 * 24));
}
