// ============================================
// SCHEMAS MASTER BARREL EXPORTS - SRP: APENAS EXPORTS
// ============================================

// ============================================
// DOMAIN EXPORTS
// ============================================

// Auth domain
export * from './auth';

// Business domain
export * from './business';

// Security domain
export * from './security';

// Activity domain
export * from './activity';

// ============================================
// RELATIONS CONFIGURATION
// ============================================

import { relations } from 'drizzle-orm';

// Import all tables
import { activityLogs } from './activity';
import { accounts, sessions, users } from './auth';
import {
  contacts,
  invitations,
  memberships,
  organizations,
  projects,
} from './business';
import { authAuditLogs, passwordResetTokens, rateLimits } from './security';

// ============================================
// AUTH RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  ownedOrganizations: many(organizations),
  memberships: many(memberships),
  sentInvitations: many(invitations, { relationName: 'sentInvitations' }),
  receivedInvitations: many(invitations, {
    relationName: 'receivedInvitations',
  }),
  ownedProjects: many(projects),
  createdContacts: many(contacts, { relationName: 'createdContacts' }),
  assignedContacts: many(contacts, { relationName: 'assignedContacts' }),
  authAuditLogs: many(authAuditLogs),
  rateLimits: many(rateLimits),
  passwordResetTokens: many(passwordResetTokens),
  activityLogs: many(activityLogs),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ============================================
// BUSINESS RELATIONS
// ============================================

export const organizationsRelations = relations(
  organizations,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [organizations.ownerId],
      references: [users.id],
    }),
    memberships: many(memberships),
    invitations: many(invitations),
    projects: many(projects),
    contacts: many(contacts),
    authAuditLogs: many(authAuditLogs),
    activityLogs: many(activityLogs),
  })
);

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [memberships.invitedBy],
    references: [users.id],
    relationName: 'invitedMemberships',
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
    relationName: 'sentInvitations',
  }),
  invitedUser: one(users, {
    fields: [invitations.invitedUserId],
    references: [users.id],
    relationName: 'receivedInvitations',
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  activityLogs: many(activityLogs),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  organization: one(organizations, {
    fields: [contacts.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [contacts.createdBy],
    references: [users.id],
    relationName: 'createdContacts',
  }),
  assignee: one(users, {
    fields: [contacts.assignedTo],
    references: [users.id],
    relationName: 'assignedContacts',
  }),
  referrer: one(contacts, {
    fields: [contacts.referredBy],
    references: [contacts.id],
    relationName: 'referredContacts',
  }),
}));

// ============================================
// SECURITY RELATIONS
// ============================================

export const authAuditLogsRelations = relations(authAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [authAuditLogs.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [authAuditLogs.organizationId],
    references: [organizations.id],
  }),
}));

export const rateLimitsRelations = relations(rateLimits, ({ one }) => ({
  user: one(users, {
    fields: [rateLimits.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
    previousToken: one(passwordResetTokens, {
      fields: [passwordResetTokens.previousTokenId],
      references: [passwordResetTokens.id],
      relationName: 'tokenChain',
    }),
  })
);

// ============================================
// ACTIVITY RELATIONS
// ============================================

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [activityLogs.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [activityLogs.projectId],
    references: [projects.id],
  }),
}));

// ============================================
// SCHEMA SUMMARY
// ============================================

export const schemaInfo = {
  domains: ['auth', 'business', 'security', 'activity'],
  tables: {
    auth: ['users', 'accounts', 'sessions', 'verificationTokens'],
    business: [
      'organizations',
      'memberships',
      'invitations',
      'projects',
      'contacts',
    ],
    security: ['authAuditLogs', 'rateLimits', 'passwordResetTokens'],
    activity: ['activityLogs'],
  },
  totalTables: 12,
  totalRelations: 10,
} as const;
