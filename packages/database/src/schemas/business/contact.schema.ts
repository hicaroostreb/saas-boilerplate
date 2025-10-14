// packages/database/src/schemas/business/contact.schema.ts
// ============================================
// CONTACTS SCHEMA - ENTERPRISE CRM (FIXED ENUM)
// ============================================

import { boolean, index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Contact enums
export const contact_source_enum = pgEnum('contact_source', [
  'website',
  'referral',
  'social_media',
  'email_campaign',
  'cold_outreach',
  'event',
  'import',
  'api',
  'manual',
]);

export const contact_status_enum = pgEnum('contact_status', [
  'active',
  'inactive',
  'archived',
  'deleted',
]);

// ADDED MISSING ENUM
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
    organization_id: text('organization_id').notNull(),
    
    // Assignment
    created_by: text('created_by').notNull(),
    assigned_to: text('assigned_to'),
    
    // Basic information
    full_name: text('full_name').notNull(),
    first_name: text('first_name'),
    last_name: text('last_name'),
    email: text('email'),
    phone: text('phone'),
    
    // Company information
    company: text('company'),
    job_title: text('job_title'),
    
    // Classification
    source: contact_source_enum('source'),
    status: contact_status_enum('status').notNull().default('active'),
    priority: contact_priority_enum('priority').notNull().default('medium'),
    
    // Metadata
    tags: text('tags'), // JSON array
    notes: text('notes'),
    address: text('address'), // JSON object
    social_profiles: text('social_profiles'), // JSON object
    custom_fields: text('custom_fields'), // JSON object
    
    // Activity tracking
    last_contacted_at: timestamp('last_contacted_at'),
    next_follow_up_at: timestamp('next_follow_up_at'),
    
    // Classification flags
    is_lead: boolean('is_lead').notNull().default(false),
    is_customer: boolean('is_customer').notNull().default(false),
    is_archived: boolean('is_archived').notNull().default(false),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'), // Soft delete
  },
  (table) => ({
    // Organization and assignment
    orgIdx: index('contacts_org_idx').on(table.organization_id),
    createdByIdx: index('contacts_created_by_idx').on(table.created_by),
    assignedToIdx: index('contacts_assigned_to_idx').on(table.assigned_to),
    
    // Contact information
    emailIdx: index('contacts_email_idx').on(table.email),
    phoneIdx: index('contacts_phone_idx').on(table.phone),
    companyIdx: index('contacts_company_idx').on(table.company),
    
    // Classification
    statusIdx: index('contacts_status_idx').on(table.status),
    priorityIdx: index('contacts_priority_idx').on(table.priority),
    sourceIdx: index('contacts_source_idx').on(table.source),
    
    // Activity tracking
    lastContactedIdx: index('contacts_last_contacted_idx').on(table.last_contacted_at),
    nextFollowUpIdx: index('contacts_next_follow_up_idx').on(table.next_follow_up_at),
    
    // Flags
    isLeadIdx: index('contacts_is_lead_idx').on(table.is_lead),
    isCustomerIdx: index('contacts_is_customer_idx').on(table.is_customer),
    isArchivedIdx: index('contacts_is_archived_idx').on(table.is_archived),
    
    // Composite indexes
    orgStatusIdx: index('contacts_org_status_idx').on(table.organization_id, table.status),
    assignedStatusIdx: index('contacts_assigned_status_idx').on(table.assigned_to, table.status),
    
    // Timestamps
    createdIdx: index('contacts_created_idx').on(table.created_at),
    updatedIdx: index('contacts_updated_idx').on(table.updated_at),
    deletedIdx: index('contacts_deleted_idx').on(table.deleted_at),
  })
);

// Types
export type Contact = typeof contacts.$inferSelect;
export type CreateContact = typeof contacts.$inferInsert;
export type ContactSource = typeof contact_source_enum.enumValues[number];
export type ContactStatus = typeof contact_status_enum.enumValues[number];
export type ContactPriority = typeof contact_priority_enum.enumValues[number];
