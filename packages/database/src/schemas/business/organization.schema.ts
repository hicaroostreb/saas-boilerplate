// packages/database/src/schemas/business/organization.schema.ts
// ============================================
// ORGANIZATIONS SCHEMA - ENTERPRISE MULTI-TENANT (REFACTORED)
// ============================================

import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Organization enums
export const organization_plan_enum = pgEnum('organization_plan', [
  'free',
  'starter',
  'professional',
  'enterprise',
  'custom',
]);

export const organization_industry_enum = pgEnum('organization_industry', [
  'technology',
  'healthcare',
  'finance',
  'education',
  'manufacturing',
  'retail',
  'consulting',
  'nonprofit',
  'government',
  'other',
]);

export const company_size_enum = pgEnum('company_size', [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+',
]);

export const organizations = pgTable(
  'organizations',
  {
    id: text('id').primaryKey(),
    tenant_id: text('tenant_id').notNull(), // Multi-tenancy key (geralmente igual ao id)

    // Basic information
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),

    // ✅ ADICIONADO - White-label domain
    domain: text('domain'),

    // Branding
    website: text('website'),
    logo_url: text('logo_url'),
    banner_url: text('banner_url'),
    brand_color: text('brand_color'),

    // Settings
    is_public: boolean('is_public').notNull().default(false),
    allow_join_requests: boolean('allow_join_requests')
      .notNull()
      .default(false),
    require_approval: boolean('require_approval').notNull().default(true),

    // ✅ REFATORADO - Limits migrados para settings JSONB
    // settings: { limits: { members: 10, projects: 5, storage_bytes: 1GB }, features: {...}, customization: {...} }
    settings: text('settings'), // JSON string

    // Contact information
    contact_email: text('contact_email'),
    contact_phone: text('contact_phone'),

    // Address
    address_street: text('address_street'),
    address_city: text('address_city'),
    address_state: text('address_state'),
    address_zip_code: text('address_zip_code'),
    address_country: text('address_country'),

    // Business details
    tax_id: text('tax_id'),
    industry: organization_industry_enum('industry'),
    company_size: company_size_enum('company_size'),

    // Subscription
    plan_type: organization_plan_enum('plan_type').notNull().default('free'),
    billing_email: text('billing_email'),
    plan_started_at: timestamp('plan_started_at'),
    plan_expires_at: timestamp('plan_expires_at'),
    trial_ends_at: timestamp('trial_ends_at'),

    // Ownership
    owner_id: text('owner_id').notNull(),

    // Status
    is_active: boolean('is_active').notNull().default(true),
    is_verified: boolean('is_verified').notNull().default(false),

    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
  },
  table => ({
    // ✅ REFATORADO - tenant_id sempre primeiro
    tenantIdx: index('organizations_tenant_idx').on(table.tenant_id),
    tenantActiveIdx: index('organizations_tenant_active_idx').on(
      table.tenant_id,
      table.is_active
    ),
    tenantPlanIdx: index('organizations_tenant_plan_idx').on(
      table.tenant_id,
      table.plan_type
    ),

    // Performance indexes
    slugIdx: index('organizations_slug_idx').on(table.slug),
    ownerIdx: index('organizations_owner_idx').on(table.owner_id),
    nameIdx: index('organizations_name_idx').on(table.name),
    domainIdx: index('organizations_domain_idx').on(table.domain),

    // Status indexes
    activeIdx: index('organizations_active_idx').on(table.is_active),
    verifiedIdx: index('organizations_verified_idx').on(table.is_verified),
    publicIdx: index('organizations_public_idx').on(table.is_public),
    deletedIdx: index('organizations_deleted_idx').on(table.deleted_at),

    // Business indexes
    industryIdx: index('organizations_industry_idx').on(table.industry),
    planIdx: index('organizations_plan_idx').on(table.plan_type),
    sizeIdx: index('organizations_size_idx').on(table.company_size),

    // Composite indexes
    ownerActiveIdx: index('organizations_owner_active_idx').on(
      table.owner_id,
      table.is_active
    ),
    publicActiveIdx: index('organizations_public_active_idx').on(
      table.is_public,
      table.is_active
    ),

    // Timestamps
    createdIdx: index('organizations_created_idx').on(table.created_at),
    updatedIdx: index('organizations_updated_idx').on(table.updated_at),
  })
);

// Types
export type Organization = typeof organizations.$inferSelect;
export type CreateOrganization = typeof organizations.$inferInsert;
export type OrganizationPlan =
  (typeof organization_plan_enum.enumValues)[number];
export type OrganizationIndustry =
  (typeof organization_industry_enum.enumValues)[number];
export type CompanySize = (typeof company_size_enum.enumValues)[number];

// ✅ NOVO - Settings structure
export interface OrganizationSettings {
  limits?: {
    members?: number;
    projects?: number;
    storage_bytes?: number;
    api_calls_per_month?: number;
  };
  features?: {
    custom_domain?: boolean;
    sso?: boolean;
    advanced_analytics?: boolean;
    webhooks?: boolean;
    api_access?: boolean;
  };
  customization?: {
    custom_css?: string;
    custom_logo?: boolean;
    white_label?: boolean;
  };
  notifications?: {
    email?: boolean;
    slack?: boolean;
    webhook_url?: string;
  };
}

// Helper functions
export function parseOrganizationSettings(
  org: Organization
): OrganizationSettings {
  if (!org.settings) {
    return {
      limits: {
        members: 10,
        projects: 5,
        storage_bytes: 1073741824, // 1GB
      },
    };
  }

  try {
    return JSON.parse(org.settings);
  } catch {
    return {
      limits: {
        members: 10,
        projects: 5,
        storage_bytes: 1073741824,
      },
    };
  }
}

export function serializeOrganizationSettings(
  settings: OrganizationSettings
): string {
  return JSON.stringify(settings);
}

export function getOrganizationLimits(org: Organization): {
  members: number;
  projects: number;
  storage_bytes: number;
} {
  const settings = parseOrganizationSettings(org);
  return {
    members: settings.limits?.members || 10,
    projects: settings.limits?.projects || 5,
    storage_bytes: settings.limits?.storage_bytes || 1073741824,
  };
}
