// packages/database/src/schemas/business/invitation.schema.ts
// ============================================
// INVITATIONS SCHEMA - ENTERPRISE MEMBER INVITATIONS
// ============================================

import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organization.schema';
import { member_role_enum } from './membership.schema';

// Invitation enums
export const invitation_status_enum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'declined',
  'expired',
  'cancelled',
]);

export const invitation_type_enum = pgEnum('invitation_type', [
  'email',      // Email invitation
  'link',       // Shareable link
  'direct',     // Direct assignment (no invitation needed)
]);

export const invitations = pgTable(
  'invitations',
  {
    id: text('id').primaryKey(),
    organization_id: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    
    // Invitation details
    email: text('email').notNull(),
    role: member_role_enum('role').notNull().default('member'),
    type: invitation_type_enum('type').notNull().default('email'),
    
    // Invitation sender
    invited_by: text('invited_by').notNull(), // User ID who sent invitation
    
    // Invitation token for security
    token: text('token').notNull().unique(),
    
    // Status and lifecycle
    status: invitation_status_enum('status').notNull().default('pending'),
    
    // Optional personalization
    message: text('message'), // Personal message from inviter
    title: text('title'), // Suggested job title
    department: text('department'), // Suggested department
    
    // Tracking
    sent_at: timestamp('sent_at').notNull().defaultNow(),
    viewed_at: timestamp('viewed_at'), // When invitation was first viewed
    accepted_at: timestamp('accepted_at'),
    declined_at: timestamp('declined_at'),
    expired_at: timestamp('expired_at'),
    
    // Expiry (calculated from sent_at + organization settings)
    expires_at: timestamp('expires_at').notNull(),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    // Performance indexes
    orgIdx: index('invitations_org_idx').on(table.organization_id),
    emailIdx: index('invitations_email_idx').on(table.email),
    tokenIdx: index('invitations_token_idx').on(table.token),
    invitedByIdx: index('invitations_invited_by_idx').on(table.invited_by),
    
    // Status indexes
    statusIdx: index('invitations_status_idx').on(table.status),
    typeIdx: index('invitations_type_idx').on(table.type),
    roleIdx: index('invitations_role_idx').on(table.role),
    
    // Time-based indexes
    sentIdx: index('invitations_sent_idx').on(table.sent_at),
    expiresIdx: index('invitations_expires_idx').on(table.expires_at),
    viewedIdx: index('invitations_viewed_idx').on(table.viewed_at),
    
    // Composite indexes for common queries
    orgStatusIdx: index('invitations_org_status_idx').on(table.organization_id, table.status),
    emailStatusIdx: index('invitations_email_status_idx').on(table.email, table.status),
    orgPendingIdx: index('invitations_org_pending_idx').on(table.organization_id, table.status, table.expires_at),
    inviterPendingIdx: index('invitations_inviter_pending_idx').on(table.invited_by, table.status),
    
    // Cleanup indexes
    expiredIdx: index('invitations_expired_cleanup_idx').on(table.expires_at, table.status),
    
    // Timestamps
    createdIdx: index('invitations_created_idx').on(table.created_at),
    updatedIdx: index('invitations_updated_idx').on(table.updated_at),
  })
);

// Types
export type Invitation = typeof invitations.$inferSelect;
export type CreateInvitation = typeof invitations.$inferInsert;
export type UpdateInvitation = Partial<Omit<Invitation, 'id' | 'organization_id' | 'token' | 'created_at'>>;
export type InvitationStatus = typeof invitation_status_enum.enumValues[number];
export type InvitationType = typeof invitation_type_enum.enumValues[number];

// Extended invitation types
export interface InvitationWithInviter extends Invitation {
  invited_by_user: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
}

export interface InvitationSummary {
  total_invitations: number;
  pending_invitations: number;
  accepted_invitations: number;
  declined_invitations: number;
  expired_invitations: number;
  cancelled_invitations: number;
  recent_invitations: number; // Last 30 days
}

// Invitation filtering
export interface InvitationFilters {
  status?: InvitationStatus[];
  type?: InvitationType[];
  role?: string[];
  invited_by?: string;
  email?: string;
  is_expired?: boolean;
  is_viewed?: boolean;
  sent_after?: Date;
  sent_before?: Date;
  expires_after?: Date;
  expires_before?: Date;
}

// Helper functions
export function isInvitationPending(invitation: Invitation): boolean {
  return invitation.status === 'pending' && !isInvitationExpired(invitation);
}

export function isInvitationExpired(invitation: Invitation): boolean {
  return new Date() > invitation.expires_at;
}

export function isInvitationAccepted(invitation: Invitation): boolean {
  return invitation.status === 'accepted';
}

export function isInvitationDeclined(invitation: Invitation): boolean {
  return invitation.status === 'declined';
}

export function isInvitationCancelled(invitation: Invitation): boolean {
  return invitation.status === 'cancelled';
}

export function canInvitationBeAccepted(invitation: Invitation): boolean {
  return invitation.status === 'pending' && !isInvitationExpired(invitation);
}

export function canInvitationBeCancelled(invitation: Invitation): boolean {
  return invitation.status === 'pending';
}

// Time helpers
export function getTimeUntilExpiry(invitation: Invitation): number {
  const now = Date.now();
  const expiryTime = invitation.expires_at.getTime();
  return Math.max(0, expiryTime - now);
}

export function getHoursUntilExpiry(invitation: Invitation): number {
  const msUntilExpiry = getTimeUntilExpiry(invitation);
  return Math.floor(msUntilExpiry / (1000 * 60 * 60));
}

export function getDaysUntilExpiry(invitation: Invitation): number {
  const hoursUntilExpiry = getHoursUntilExpiry(invitation);
  return Math.floor(hoursUntilExpiry / 24);
}

export function getTimeSinceSent(invitation: Invitation): number {
  const now = Date.now();
  const sentTime = invitation.sent_at.getTime();
  return now - sentTime;
}

export function getDaysSinceSent(invitation: Invitation): number {
  const msSinceSent = getTimeSinceSent(invitation);
  return Math.floor(msSinceSent / (1000 * 60 * 60 * 24));
}

// Response tracking
export function hasBeenViewed(invitation: Invitation): boolean {
  return invitation.viewed_at !== null;
}

export function getResponseTime(invitation: Invitation): number | null {
  const responseTime = invitation.accepted_at || invitation.declined_at;
  if (!responseTime) return null;
  
  return responseTime.getTime() - invitation.sent_at.getTime();
}

export function getResponseTimeHours(invitation: Invitation): number | null {
  const responseMs = getResponseTime(invitation);
  if (!responseMs) return null;
  
  return Math.floor(responseMs / (1000 * 60 * 60));
}

// Token generation
export function generateInvitationToken(): string {
  // Generate cryptographically secure token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < 32; i++) {
    token += chars[array[i] % chars.length];
  }
  
  return token;
}

// Expiry calculation
export function calculateExpiryDate(hoursFromNow: number = 168): Date { // Default 7 days
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hoursFromNow);
  return expiry;
}

export function getDefaultExpiryHours(invitationType: InvitationType): number {
  const defaultHours: Record<InvitationType, number> = {
    email: 168,    // 7 days
    link: 720,     // 30 days  
    direct: 24,    // 1 day
  };
  
  return defaultHours[invitationType];
}

// Validation
export function validateInvitationEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function canInviteEmail(email: string, organizationId: string): boolean {
  // This would need to check existing members and pending invitations
  // Implementation would be in the service layer
  return validateInvitationEmail(email);
}

// Status transitions
export function canTransitionToStatus(
  currentStatus: InvitationStatus,
  newStatus: InvitationStatus,
  invitation: Invitation
): boolean {
  const now = new Date();
  
  switch (currentStatus) {
    case 'pending':
      if (now > invitation.expires_at) {
        return newStatus === 'expired';
      }
      return ['accepted', 'declined', 'cancelled', 'expired'].includes(newStatus);
    
    case 'accepted':
    case 'declined':
    case 'expired':
    case 'cancelled':
      return false; // Terminal states
      
    default:
      return false;
  }
}

// Invitation URLs
export function buildInvitationUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/invitations/${token}`;
}

export function buildAcceptUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/invitations/${token}/accept`;
}

export function buildDeclineUrl(token: string, baseUrl: string): string {
  return `${baseUrl}/invitations/${token}/decline`;
}

// Invitation analytics
export interface InvitationAnalytics {
  total_sent: number;
  acceptance_rate: number;      // percentage
  decline_rate: number;         // percentage
  expiry_rate: number;          // percentage
  average_response_time: number; // hours
  view_rate: number;            // percentage
  pending_count: number;
  overdue_count: number;        // pending but > 7 days old
}

export function calculateAcceptanceRate(accepted: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((accepted / total) * 100);
}

export function calculateDeclineRate(declined: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((declined / total) * 100);
}

export function calculateExpiryRate(expired: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((expired / total) * 100);
}

export function calculateViewRate(viewed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((viewed / total) * 100);
}

// Resend logic
export function canResendInvitation(invitation: Invitation): boolean {
  // Can resend if declined or expired, or if pending but > 48 hours old
  if (invitation.status === 'declined' || invitation.status === 'expired') {
    return true;
  }
  
  if (invitation.status === 'pending') {
    const hoursSinceSent = (Date.now() - invitation.sent_at.getTime()) / (1000 * 60 * 60);
    return hoursSinceSent >= 48;
  }
  
  return false;
}

export function shouldAutoExpire(invitation: Invitation): boolean {
  return invitation.status === 'pending' && isInvitationExpired(invitation);
}

// Bulk operations
export interface BulkInvitationData {
  email: string;
  role?: string;
  title?: string;
  department?: string;
  message?: string;
}

export function validateBulkInvitations(invitations: BulkInvitationData[]): {
  valid: BulkInvitationData[];
  invalid: Array<BulkInvitationData & { error: string }>;
} {
  const valid: BulkInvitationData[] = [];
  const invalid: Array<BulkInvitationData & { error: string }> = [];
  
  for (const invitation of invitations) {
    if (!validateInvitationEmail(invitation.email)) {
      invalid.push({ ...invitation, error: 'Invalid email format' });
    } else {
      valid.push(invitation);
    }
  }
  
  return { valid, invalid };
}

// Notification helpers
export function shouldSendReminder(invitation: Invitation): boolean {
  if (invitation.status !== 'pending' || hasBeenViewed(invitation)) {
    return false;
  }
  
  const daysSinceSent = getDaysSinceSent(invitation);
  const daysUntilExpiry = getDaysUntilExpiry(invitation);
  
  // Send reminder after 3 days if not viewed, or 1 day before expiry
  return daysSinceSent >= 3 || daysUntilExpiry <= 1;
}

export function getReminderType(invitation: Invitation): 'follow-up' | 'urgent' | null {
  if (!shouldSendReminder(invitation)) return null;
  
  const daysUntilExpiry = getDaysUntilExpiry(invitation);
  return daysUntilExpiry <= 1 ? 'urgent' : 'follow-up';
}
