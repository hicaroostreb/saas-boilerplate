// packages/database/src/schemas/business/contact.schema.ts
// ============================================
// CONTACTS SCHEMA - ENTERPRISE CRM
// ============================================

import { boolean, index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organization.schema';

// Contact enums
export const contact_type_enum = pgEnum('contact_type', [
  'lead',
  'prospect',
  'customer',
  'partner',
  'vendor',
  'other',
]);

export const contact_status_enum = pgEnum('contact_status', [
  'active',
  'inactive',
  'archived',
  'deleted',
]);

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

export const contact_method_enum = pgEnum('contact_method', [
  'email',
  'phone',
  'meeting',
  'social_media',
  'mail',
  'other',
]);

export const contacts = pgTable(
  'contacts',
  {
    id: text('id').primaryKey(),
    organization_id: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    
    // Ownership
    created_by: text('created_by').notNull(), // User who created the contact
    assigned_to: text('assigned_to'), // User responsible for this contact
    
    // Personal information
    first_name: text('first_name'),
    last_name: text('last_name'),
    full_name: text('full_name').notNull(), // Computed or manually set
    email: text('email'),
    phone: text('phone'),
    mobile: text('mobile'),
    
    // Professional information
    company_name: text('company_name'),
    job_title: text('job_title'),
    department: text('department'),
    
    // Address information
    address_street: text('address_street'),
    address_city: text('address_city'),
    address_state: text('address_state'),
    address_zip_code: text('address_zip_code'),
    address_country: text('address_country'),
    
    // Social and web presence
    website: text('website'),
    linkedin_url: text('linkedin_url'),
    twitter_handle: text('twitter_handle'),
    
    // Classification
    type: contact_type_enum('type').notNull().default('lead'),
    status: contact_status_enum('status').notNull().default('active'),
    source: contact_source_enum('source').default('manual'),
    referred_by: text('referred_by'), // Contact ID who referred this contact
    
    // Metadata
    tags: text('tags'), // Comma-separated tags
    notes: text('notes'), // Internal notes
    
    // Communication preferences
    email_opt_in: boolean('email_opt_in').notNull().default(true),
    sms_opt_in: boolean('sms_opt_in').notNull().default(false),
    marketing_opt_in: boolean('marketing_opt_in').notNull().default(false),
    
    // Activity tracking
    last_contacted_at: timestamp('last_contacted_at'),
    last_contact_method: contact_method_enum('last_contact_method'),
    next_follow_up_at: timestamp('next_follow_up_at'),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'), // Soft delete
  },
  (table) => ({
    // Performance indexes
    orgIdx: index('contacts_org_idx').on(table.organization_id),
    createdByIdx: index('contacts_created_by_idx').on(table.created_by),
    assignedToIdx: index('contacts_assigned_to_idx').on(table.assigned_to),
    
    // Search indexes
    nameIdx: index('contacts_name_idx').on(table.full_name),
    emailIdx: index('contacts_email_idx').on(table.email),
    phoneIdx: index('contacts_phone_idx').on(table.phone),
    companyIdx: index('contacts_company_idx').on(table.company_name),
    
    // Classification indexes
    typeIdx: index('contacts_type_idx').on(table.type),
    statusIdx: index('contacts_status_idx').on(table.status),
    sourceIdx: index('contacts_source_idx').on(table.source),
    
    // Activity indexes
    lastContactedIdx: index('contacts_last_contacted_idx').on(table.last_contacted_at),
    nextFollowUpIdx: index('contacts_next_follow_up_idx').on(table.next_follow_up_at),
    
    // Communication preferences
    emailOptInIdx: index('contacts_email_opt_in_idx').on(table.email_opt_in),
    marketingOptInIdx: index('contacts_marketing_opt_in_idx').on(table.marketing_opt_in),
    
    // Soft delete
    deletedIdx: index('contacts_deleted_idx').on(table.deleted_at),
    
    // Composite indexes for common queries
    orgTypeIdx: index('contacts_org_type_idx').on(table.organization_id, table.type),
    orgStatusIdx: index('contacts_org_status_idx').on(table.organization_id, table.status),
    assignedStatusIdx: index('contacts_assigned_status_idx').on(table.assigned_to, table.status),
    orgActiveIdx: index('contacts_org_active_idx').on(table.organization_id, table.status, table.deleted_at),
    
    // Follow-up queries
    dueTasks: index('contacts_due_follow_up_idx').on(table.next_follow_up_at, table.status),
    assignedFollowUp: index('contacts_assigned_follow_up_idx').on(table.assigned_to, table.next_follow_up_at),
    
    // Timestamps
    createdIdx: index('contacts_created_idx').on(table.created_at),
    updatedIdx: index('contacts_updated_idx').on(table.updated_at),
  })
);

// Types
export type Contact = typeof contacts.$inferSelect;
export type CreateContact = typeof contacts.$inferInsert;
export type UpdateContact = Partial<Omit<Contact, 'id' | 'organization_id' | 'created_at'>>;
export type ContactType = typeof contact_type_enum.enumValues[number];
export type ContactStatus = typeof contact_status_enum.enumValues[number];
export type ContactSource = typeof contact_source_enum.enumValues[number];
export type ContactMethod = typeof contact_method_enum.enumValues[number];

// Extended contact types
export interface ContactWithOwner extends Contact {
  created_by_user: {
    id: string;
    name: string | null;
    email: string;
  };
  assigned_to_user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ContactWithStats extends Contact {
  interaction_count: number;
  last_interaction_at: Date | null;
  conversion_probability: number; // 0-100
  days_since_created: number;
  days_since_last_contact: number | null;
}

export interface ContactSummary {
  total_contacts: number;
  active_contacts: number;
  leads: number;
  prospects: number;
  customers: number;
  partners: number;
  overdue_follow_ups: number;
  recent_contacts: number; // Last 30 days
}

// Contact filtering
export interface ContactFilters {
  type?: ContactType[];
  status?: ContactStatus[];
  source?: ContactSource[];
  assigned_to?: string;
  created_by?: string;
  has_email?: boolean;
  has_phone?: boolean;
  email_opt_in?: boolean;
  marketing_opt_in?: boolean;
  has_follow_up?: boolean;
  is_overdue?: boolean;
  created_after?: Date;
  created_before?: Date;
  last_contacted_after?: Date;
  last_contacted_before?: Date;
  tags?: string[];
  search?: string;
}

// Helper functions
export function isContactActive(contact: Contact): boolean {
  return contact.status === 'active' && !contact.deleted_at;
}

export function getContactDisplayName(contact: Contact): string {
  if (contact.full_name) return contact.full_name;
  if (contact.first_name && contact.last_name) {
    return `${contact.first_name} ${contact.last_name}`;
  }
  if (contact.first_name) return contact.first_name;
  if (contact.email) return contact.email;
  return 'Unnamed Contact';
}

export function getContactInitials(contact: Contact): string {
  const name = getContactDisplayName(contact);
  const parts = name.split(' ').filter(Boolean);
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return 'C';
}

export function getFullAddress(contact: Contact): string | null {
  const parts = [
    contact.address_street,
    contact.address_city,
    contact.address_state,
    contact.address_zip_code,
    contact.address_country,
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : null;
}

// Communication helpers
export function canSendEmail(contact: Contact): boolean {
  return Boolean(contact.email && contact.email_opt_in);
}

export function canSendSMS(contact: Contact): boolean {
  return Boolean((contact.phone || contact.mobile) && contact.sms_opt_in);
}

export function canSendMarketing(contact: Contact): boolean {
  return Boolean(contact.marketing_opt_in && canSendEmail(contact));
}

// Follow-up helpers
export function isFollowUpOverdue(contact: Contact): boolean {
  if (!contact.next_follow_up_at) return false;
  return new Date() > contact.next_follow_up_at;
}

export function getDaysUntilFollowUp(contact: Contact): number | null {
  if (!contact.next_follow_up_at) return null;
  const now = Date.now();
  const followUpTime = contact.next_follow_up_at.getTime();
  return Math.ceil((followUpTime - now) / (1000 * 60 * 60 * 24));
}

export function getDaysSinceLastContact(contact: Contact): number | null {
  if (!contact.last_contacted_at) return null;
  const now = Date.now();
  const lastContactTime = contact.last_contacted_at.getTime();
  return Math.floor((now - lastContactTime) / (1000 * 60 * 60 * 24));
}

export function getDaysSinceCreated(contact: Contact): number {
  const now = Date.now();
  const createdTime = contact.created_at.getTime();
  return Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
}

// Tag helpers
export function parseContactTags(contact: Contact): string[] {
  if (!contact.tags) return [];
  return contact.tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

export function serializeContactTags(tags: string[]): string {
  return tags.filter(Boolean).map(tag => tag.trim()).join(',');
}

export function hasTag(contact: Contact, tag: string): boolean {
  const tags = parseContactTags(contact);
  return tags.some(t => t.toLowerCase() === tag.toLowerCase());
}

export function addTag(contact: Contact, newTag: string): string {
  const currentTags = parseContactTags(contact);
  if (!hasTag(contact, newTag)) {
    currentTags.push(newTag.trim());
  }
  return serializeContactTags(currentTags);
}

export function removeTag(contact: Contact, tagToRemove: string): string {
  const currentTags = parseContactTags(contact);
  const filteredTags = currentTags.filter(
    tag => tag.toLowerCase() !== tagToRemove.toLowerCase()
  );
  return serializeContactTags(filteredTags);
}

// Contact validation
export function validateContactData(contact: Partial<CreateContact>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Require at least name or email
  if (!contact.full_name && !contact.email) {
    errors.push('Contact must have either a name or email address');
  }

  // Validate email format if provided
  if (contact.email && !isValidEmail(contact.email)) {
    errors.push('Invalid email address format');
  }

  // Validate phone format if provided
  if (contact.phone && !isValidPhone(contact.phone)) {
    errors.push('Invalid phone number format');
  }

  // Validate URLs if provided
  if (contact.website && !isValidUrl(contact.website)) {
    errors.push('Invalid website URL format');
  }

  if (contact.linkedin_url && !isValidUrl(contact.linkedin_url)) {
    errors.push('Invalid LinkedIn URL format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Utility validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Contact conversion helpers
export function getConversionPath(contact: Contact): ContactType[] {
  // Define typical conversion paths
  const paths: Record<ContactType, ContactType[]> = {
    lead: ['prospect', 'customer'],
    prospect: ['customer', 'partner'],
    customer: ['partner'],
    partner: [],
    vendor: [],
    other: ['lead', 'prospect', 'customer'],
  };
  
  return paths[contact.type] || [];
}

export function canConvertTo(currentType: ContactType, targetType: ContactType): boolean {
  const allowedConversions = getConversionPath({ type: currentType } as Contact);
  return allowedConversions.includes(targetType);
}

// Search helpers
export function getSearchableText(contact: Contact): string {
  return [
    contact.full_name,
    contact.first_name,
    contact.last_name,
    contact.email,
    contact.phone,
    contact.mobile,
    contact.company_name,
    contact.job_title,
    contact.department,
    contact.notes,
    parseContactTags(contact).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function matchesSearchTerm(contact: Contact, searchTerm: string): boolean {
  const searchableText = getSearchableText(contact);
  const normalizedTerm = searchTerm.toLowerCase().trim();
  return searchableText.includes(normalizedTerm);
}
