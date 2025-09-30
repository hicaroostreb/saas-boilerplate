// ============================================
// CONTACT SCHEMA - SRP: APENAS CONTACT TABLE
// ============================================

import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../auth/user.schema';
import { organizations } from './organization.schema';

// ============================================
// ENUMS
// ============================================

export const contactTypeEnum = pgEnum('contact_type', [
  'lead',
  'customer',
  'partner',
  'vendor',
  'employee',
  'other',
]);

export const contactStatusEnum = pgEnum('contact_status', [
  'active',
  'inactive',
  'archived',
  'blocked',
]);

// ============================================
// CONTACT TABLE DEFINITION
// ============================================

export const contacts = pgTable(
  'contacts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Relations
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assignedTo: text('assigned_to').references(() => users.id),

    // Basic info
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    fullName: varchar('full_name', { length: 200 }).notNull(), // Computed or manual

    // Contact details
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    mobile: varchar('mobile', { length: 20 }),

    // Company info
    companyName: varchar('company_name', { length: 200 }),
    jobTitle: varchar('job_title', { length: 100 }),
    department: varchar('department', { length: 100 }),

    // Address
    address: jsonb('address').$type<{
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    }>(),

    // Social & web
    website: varchar('website', { length: 255 }),
    linkedinUrl: varchar('linkedin_url', { length: 255 }),
    twitterHandle: varchar('twitter_handle', { length: 50 }),

    // Classification
    type: contactTypeEnum('type').default('lead').notNull(),
    status: contactStatusEnum('status').default('active').notNull(),

    // Relationship
    source: varchar('source', { length: 100 }), // How we got this contact
    // ✅ FIXED: Self-reference with proper typing
    referredBy: text('referred_by'),

    // Business details
    tags: jsonb('tags').$type<string[]>(),
    notes: text('notes'),

    // Preferences
    emailOptIn: boolean('email_opt_in').default(true).notNull(),
    smsOptIn: boolean('sms_opt_in').default(false).notNull(),
    marketingOptIn: boolean('marketing_opt_in').default(false).notNull(),

    // Activity tracking
    lastContactedAt: timestamp('last_contacted_at', { mode: 'date' }),
    lastContactMethod: varchar('last_contact_method', { length: 50 }),
    nextFollowUpAt: timestamp('next_follow_up_at', { mode: 'date' }),

    // Custom fields
    customFields: jsonb('custom_fields').$type<Record<string, any>>(),

    // Metadata
    metadata: jsonb('metadata').$type<Record<string, any>>(),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
  },
  table => ({
    // Indexes for performance
    orgIdx: index('contact_org_idx').on(table.organizationId),
    createdByIdx: index('contact_created_by_idx').on(table.createdBy),
    assignedToIdx: index('contact_assigned_to_idx').on(table.assignedTo),
    emailIdx: index('contact_email_idx').on(table.email),
    fullNameIdx: index('contact_full_name_idx').on(table.fullName),
    companyIdx: index('contact_company_idx').on(table.companyName),
    typeIdx: index('contact_type_idx').on(table.type),
    statusIdx: index('contact_status_idx').on(table.status),
    createdAtIdx: index('contact_created_at_idx').on(table.createdAt),
    lastContactedIdx: index('contact_last_contacted_idx').on(
      table.lastContactedAt
    ),
    nextFollowUpIdx: index('contact_next_follow_up_idx').on(
      table.nextFollowUpAt
    ),
    referredByIdx: index('contact_referred_by_idx').on(table.referredBy),

    // Composite indexes
    orgTypeIdx: index('contact_org_type_idx').on(
      table.organizationId,
      table.type
    ),
    orgStatusIdx: index('contact_org_status_idx').on(
      table.organizationId,
      table.status
    ),
    nameEmailIdx: index('contact_name_email_idx').on(
      table.fullName,
      table.email
    ),
  })
);

// ============================================
// CONTACT TYPES
// ============================================

export type Contact = typeof contacts.$inferSelect;
export type CreateContact = typeof contacts.$inferInsert;

// Enum types
export type ContactType = (typeof contactTypeEnum.enumValues)[number];
export type ContactStatus = (typeof contactStatusEnum.enumValues)[number];

// Contact with organization info
export type ContactWithOrganization = Contact & {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};

// Contact with creator info
export type ContactWithCreator = Contact & {
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
};

// Contact with assigned user
export type ContactWithAssignee = Contact & {
  assignee?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// Full contact info
export type FullContact = Contact & {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  assignee?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  referrer?: {
    id: string;
    fullName: string;
  };
};

// Contact summary for lists
export type ContactSummary = Pick<
  Contact,
  | 'id'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'companyName'
  | 'jobTitle'
  | 'type'
  | 'status'
  | 'lastContactedAt'
  | 'createdAt'
>;
