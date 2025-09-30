// ============================================
// ORGANIZATION SCHEMA - SRP: APENAS ORGANIZATION TABLE
// ============================================

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../auth/user.schema';

// ============================================
// ORGANIZATION TABLE DEFINITION
// ============================================

export const organizations = pgTable(
  'organizations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Basic info
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    website: varchar('website', { length: 255 }),

    // Branding
    logoUrl: text('logo_url'),
    bannerUrl: text('banner_url'),
    brandColor: varchar('brand_color', { length: 7 }), // #FFFFFF format

    // Settings
    isPublic: boolean('is_public').default(false).notNull(),
    allowJoinRequests: boolean('allow_join_requests').default(false).notNull(),
    requireApproval: boolean('require_approval').default(true).notNull(),

    // Limits & quotas
    memberLimit: integer('member_limit').default(50).notNull(),
    projectLimit: integer('project_limit').default(10).notNull(),
    storageLimit: integer('storage_limit').default(1073741824).notNull(), // 1GB in bytes

    // Contact info
    contactEmail: varchar('contact_email', { length: 255 }),
    contactPhone: varchar('contact_phone', { length: 20 }),

    // Address
    address: jsonb('address').$type<{
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    }>(),

    // Business info
    taxId: varchar('tax_id', { length: 50 }),
    industry: varchar('industry', { length: 100 }),
    companySize: varchar('company_size', { length: 50 }), // '1-10', '11-50', etc.

    // Subscription & billing
    planType: varchar('plan_type', { length: 50 }).default('free').notNull(),
    billingEmail: varchar('billing_email', { length: 255 }),

    // Metadata
    metadata: jsonb('metadata').$type<Record<string, any>>(),

    // Ownership
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Status
    isActive: boolean('is_active').default(true).notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
  },
  table => ({
    // Indexes for performance
    slugIdx: uniqueIndex('org_slug_idx').on(table.slug),
    ownerIdx: index('org_owner_idx').on(table.ownerId),
    nameIdx: index('org_name_idx').on(table.name),
    publicIdx: index('org_public_idx').on(table.isPublic),
    activeIdx: index('org_active_idx').on(table.isActive),
    createdAtIdx: index('org_created_at_idx').on(table.createdAt),
    planTypeIdx: index('org_plan_type_idx').on(table.planType),
  })
);

// ============================================
// ORGANIZATION TYPES
// ============================================

export type Organization = typeof organizations.$inferSelect;
export type CreateOrganization = typeof organizations.$inferInsert;

// Specific organization types
export type PublicOrganization = Pick<
  Organization,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'logoUrl'
  | 'website'
  | 'isPublic'
  | 'createdAt'
>;
export type OrganizationProfile = Pick<
  Organization,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'logoUrl'
  | 'bannerUrl'
  | 'website'
  | 'brandColor'
>;
export type OrganizationSettings = Pick<
  Organization,
  | 'id'
  | 'isPublic'
  | 'allowJoinRequests'
  | 'requireApproval'
  | 'memberLimit'
  | 'projectLimit'
>;
export type OrganizationBilling = Pick<
  Organization,
  | 'id'
  | 'planType'
  | 'billingEmail'
  | 'memberLimit'
  | 'projectLimit'
  | 'storageLimit'
>;

// Organization with owner info
export type OrganizationWithOwner = Organization & {
  owner: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// Plan types enum
export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';
