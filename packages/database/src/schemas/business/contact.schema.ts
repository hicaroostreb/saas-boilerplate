// packages/database/src/schemas/business/contact.schema.ts
// ============================================
// CONTACTS SCHEMA - ENTERPRISE CRM (REFACTORED)
// ============================================

import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organization.schema';

// Contact enums
export const contact_status_enum = pgEnum('contact_status', [
  'active',
  'inactive',
  'lead',
  'customer',
  'archived',
]);

export const contact_source_enum = pgEnum('contact_source', [
  'web',
  'referral',
  'import',
  'manual',
  'api',
  'integration',
]);

export const contact_priority_enum = pgEnum('contact_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const contacts = pgTable(
  'contacts',
  {
    id: text('id').primaryKey(),
    tenant_id: text('tenant_id').notNull(), // ✅ ADICIONADO
    organization_id: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    // Basic information
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    mobile: text('mobile'),

    // Company information
    company_name: text('company_name'),
    job_title: text('job_title'),
    department: text('department'),
    website: text('website'),
    linkedin_url: text('linkedin_url'),

    // Branding
    avatar_url: text('avatar_url'),

    // Address
    address_street: text('address_street'),
    address_city: text('address_city'),
    address_state: text('address_state'),
    address_zip_code: text('address_zip_code'),
    address_country: text('address_country'),

    // Business details
    tax_id: text('tax_id'),

    // Status and tracking
    status: contact_status_enum('status').notNull().default('active'),
    source: contact_source_enum('source').notNull().default('manual'),
    priority: contact_priority_enum('priority').default('medium'),

    // Assignment
    assigned_to: text('assigned_to'), // FK users
    owner_id: text('owner_id'), // Creator

    // Notes and tags
    notes: text('notes'),
    tags: text('tags'), // JSON array

    // ✅ ADICIONADO - Custom fields extensíveis
    custom_fields: text('custom_fields'), // JSON string

    // ✅ ADICIONADO - Tracking de modificações
    created_by: text('created_by'),
    updated_by: text('updated_by'),

    // Follow-up tracking
    last_contact_at: timestamp('last_contact_at'),
    next_followup_at: timestamp('next_followup_at'),

    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
  },
  table => ({
    // ✅ REFATORADO - tenant_id sempre primeiro
    tenantOrgIdx: index('contacts_tenant_org_idx').on(
      table.tenant_id,
      table.organization_id
    ),
    tenantOrgStatusIdx: index('contacts_tenant_org_status_idx').on(
      table.tenant_id,
      table.organization_id,
      table.status
    ),
    tenantEmailIdx: index('contacts_tenant_email_idx').on(
      table.tenant_id,
      table.email
    ),
    tenantAssignedIdx: index('contacts_tenant_assigned_idx').on(
      table.tenant_id,
      table.assigned_to
    ),

    // Performance indexes
    orgIdx: index('contacts_org_idx').on(table.organization_id),
    nameIdx: index('contacts_name_idx').on(table.name),
    emailIdx: index('contacts_email_idx').on(table.email),
    phoneIdx: index('contacts_phone_idx').on(table.phone),

    // Status and priority
    statusIdx: index('contacts_status_idx').on(table.status),
    sourceIdx: index('contacts_source_idx').on(table.source),
    priorityIdx: index('contacts_priority_idx').on(table.priority),

    // Assignment
    assignedToIdx: index('contacts_assigned_to_idx').on(table.assigned_to),
    ownerIdx: index('contacts_owner_idx').on(table.owner_id),

    // Follow-up
    nextFollowupIdx: index('contacts_next_followup_idx').on(
      table.next_followup_at
    ),
    lastContactIdx: index('contacts_last_contact_idx').on(
      table.last_contact_at
    ),

    // Composite indexes
    orgStatusIdx: index('contacts_org_status_idx').on(
      table.organization_id,
      table.status
    ),
    orgAssignedIdx: index('contacts_org_assigned_idx').on(
      table.organization_id,
      table.assigned_to
    ),

    // Tracking indexes
    createdByIdx: index('contacts_created_by_idx').on(table.created_by),
    updatedByIdx: index('contacts_updated_by_idx').on(table.updated_by),

    // Timestamps
    createdIdx: index('contacts_created_idx').on(table.created_at),
    updatedIdx: index('contacts_updated_idx').on(table.updated_at),
    deletedIdx: index('contacts_deleted_idx').on(table.deleted_at),
  })
);

// Types
export type Contact = typeof contacts.$inferSelect;
export type CreateContact = typeof contacts.$inferInsert;
export type ContactStatus = (typeof contact_status_enum.enumValues)[number];
export type ContactSource = (typeof contact_source_enum.enumValues)[number];
export type ContactPriority = (typeof contact_priority_enum.enumValues)[number];

// ✅ NOVO - Custom fields helpers
export function parseContactCustomFields(
  contact: Contact
): Record<string, any> {
  if (!contact.custom_fields) return {};
  try {
    return JSON.parse(contact.custom_fields);
  } catch {
    return {};
  }
}

export function serializeContactCustomFields(
  fields: Record<string, any>
): string {
  return JSON.stringify(fields);
}

// ✅ NOVO - Tags helpers
export function parseContactTags(contact: Contact): string[] {
  if (!contact.tags) return [];
  try {
    const parsed = JSON.parse(contact.tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeContactTags(tags: string[]): string {
  return JSON.stringify(tags);
}

// Contact utilities
export function getFullContactInfo(contact: Contact): string {
  const parts = [contact.name];

  if (contact.job_title && contact.company_name) {
    parts.push(`${contact.job_title} at ${contact.company_name}`);
  } else if (contact.job_title) {
    parts.push(contact.job_title);
  } else if (contact.company_name) {
    parts.push(contact.company_name);
  }

  return parts.join(' - ');
}

export function isContactOverdue(contact: Contact): boolean {
  if (!contact.next_followup_at) return false;
  return new Date() > contact.next_followup_at;
}

export function getDaysSinceLastContact(contact: Contact): number | null {
  if (!contact.last_contact_at) return null;
  const diff = Date.now() - contact.last_contact_at.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
