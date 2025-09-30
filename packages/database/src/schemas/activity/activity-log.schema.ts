// ============================================
// ACTIVITY LOG SCHEMA - SRP: APENAS ACTIVITY LOG TABLE
// ============================================

import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from '../auth/user.schema';
import { organizations } from '../business/organization.schema';
import { projects } from '../business/project.schema';

// ============================================
// ENUMS
// ============================================

export const activityTypeEnum = pgEnum('activity_type', [
  // Organization activities
  'organization_created',
  'organization_updated',
  'organization_deleted',
  'organization_settings_changed',

  // Member activities
  'member_invited',
  'member_joined',
  'member_left',
  'member_role_changed',
  'member_removed',

  // Project activities
  'project_created',
  'project_updated',
  'project_deleted',
  'project_archived',
  'project_restored',
  'project_status_changed',

  // Contact activities
  'contact_created',
  'contact_updated',
  'contact_deleted',
  'contact_imported',
  'contact_exported',

  // System activities
  'settings_updated',
  'integration_connected',
  'integration_disconnected',
  'data_export',
  'data_import',

  // Billing activities
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'payment_successful',
  'payment_failed',

  // Security activities
  'login_successful',
  'login_failed',
  'password_changed',
  'two_factor_enabled',
  'two_factor_disabled',

  // API activities
  'api_key_created',
  'api_key_revoked',
  'webhook_created',
  'webhook_updated',
  'webhook_deleted',
]);

export const activityCategoryEnum = pgEnum('activity_category', [
  'organization',
  'member',
  'project',
  'contact',
  'system',
  'billing',
  'security',
  'api',
]);

// ============================================
// ACTIVITY LOG TABLE DEFINITION
// ============================================

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Relations
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }), // Nullable for system actions
    projectId: text('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),

    // Activity details
    type: activityTypeEnum('type').notNull(),
    category: activityCategoryEnum('category').notNull(),
    action: varchar('action', { length: 100 }).notNull(), // Human readable action
    description: text('description').notNull(), // Full description

    // Entity information
    entityType: varchar('entity_type', { length: 50 }), // Type of entity affected
    entityId: text('entity_id'), // ID of entity affected
    entityName: varchar('entity_name', { length: 200 }), // Name of entity for display

    // Change tracking
    changes: jsonb('changes').$type<
      {
        field: string;
        from: any;
        to: any;
      }[]
    >(),

    // Context information
    metadata: jsonb('metadata').$type<Record<string, any>>(),

    // Request information
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),

    // API context
    apiEndpoint: varchar('api_endpoint', { length: 200 }),
    apiMethod: varchar('api_method', { length: 10 }), // GET, POST, etc.
    apiVersion: varchar('api_version', { length: 10 }),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),

    // Data retention
    expiresAt: timestamp('expires_at', { mode: 'date' }), // For compliance
  },
  table => ({
    // Indexes for performance
    orgIdx: index('activity_log_org_idx').on(table.organizationId),
    userIdx: index('activity_log_user_idx').on(table.userId),
    projectIdx: index('activity_log_project_idx').on(table.projectId),
    typeIdx: index('activity_log_type_idx').on(table.type),
    categoryIdx: index('activity_log_category_idx').on(table.category),
    entityTypeIdx: index('activity_log_entity_type_idx').on(table.entityType),
    entityIdIdx: index('activity_log_entity_id_idx').on(table.entityId),
    createdAtIdx: index('activity_log_created_at_idx').on(table.createdAt),
    expiresAtIdx: index('activity_log_expires_at_idx').on(table.expiresAt),

    // Composite indexes for common queries
    orgUserIdx: index('activity_log_org_user_idx').on(
      table.organizationId,
      table.userId
    ),
    orgTypeIdx: index('activity_log_org_type_idx').on(
      table.organizationId,
      table.type
    ),
    orgCategoryIdx: index('activity_log_org_category_idx').on(
      table.organizationId,
      table.category
    ),
    orgCreatedIdx: index('activity_log_org_created_idx').on(
      table.organizationId,
      table.createdAt
    ),
    userCreatedIdx: index('activity_log_user_created_idx').on(
      table.userId,
      table.createdAt
    ),
    entityCreatedIdx: index('activity_log_entity_created_idx').on(
      table.entityType,
      table.entityId,
      table.createdAt
    ),

    // Performance indexes for feeds
    orgProjectUserIdx: index('activity_log_org_project_user_idx').on(
      table.organizationId,
      table.projectId,
      table.userId
    ),
  })
);

// ============================================
// ACTIVITY LOG TYPES
// ============================================

export type ActivityLog = typeof activityLogs.$inferSelect;
export type CreateActivityLog = typeof activityLogs.$inferInsert;

// Enum types
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];
export type ActivityCategory = (typeof activityCategoryEnum.enumValues)[number];

// Change tracking structure
export type ActivityChange = {
  field: string;
  from: any;
  to: any;
};

// Activity with user info
export type ActivityLogWithUser = ActivityLog & {
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// Activity with organization info
export type ActivityLogWithOrganization = ActivityLog & {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};

// Activity with project info
export type ActivityLogWithProject = ActivityLog & {
  project?: {
    id: string;
    name: string;
    slug: string;
  };
};

// Full activity info
export type FullActivityLog = ActivityLog & {
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  project?: {
    id: string;
    name: string;
    slug: string;
  };
};

// Activity feed item for UI
export type ActivityFeedItem = {
  id: string;
  type: ActivityType;
  category: ActivityCategory;
  action: string;
  description: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
  metadata?: Record<string, any>;
};

// Activity summary for analytics
export type ActivitySummary = {
  category: ActivityCategory;
  type: ActivityType;
  count: number;
  lastActivity: Date;
  uniqueUsers: number;
};

// Activity timeline item
export type TimelineItem = {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  user?: {
    name: string | null;
    image: string | null;
  };
  metadata?: Record<string, any>;
};
