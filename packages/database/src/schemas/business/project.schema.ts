// ============================================
// PROJECT SCHEMA - SRP: APENAS PROJECT TABLE
// ============================================

import {
  boolean,
  index,
  integer,
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

export const projectStatusEnum = pgEnum('project_status', [
  'active',
  'inactive',
  'archived',
  'deleted',
]);

export const projectPriorityEnum = pgEnum('project_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const projectVisibilityEnum = pgEnum('project_visibility', [
  'private',
  'organization',
  'public',
]);

// ============================================
// PROJECT TABLE DEFINITION
// ============================================

export const projects = pgTable(
  'projects',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Relations
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Basic info
    name: varchar('name', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull(),
    description: text('description'),

    // Project details
    status: projectStatusEnum('status').default('active').notNull(),
    priority: projectPriorityEnum('priority').default('medium').notNull(),
    visibility: projectVisibilityEnum('visibility')
      .default('organization')
      .notNull(),

    // Branding
    color: varchar('color', { length: 7 }), // #FFFFFF format
    icon: varchar('icon', { length: 50 }), // Icon identifier
    coverImageUrl: text('cover_image_url'),

    // Timeline
    startDate: timestamp('start_date', { mode: 'date' }),
    endDate: timestamp('end_date', { mode: 'date' }),
    dueDate: timestamp('due_date', { mode: 'date' }),

    // Progress tracking
    progressPercentage: integer('progress_percentage').default(0),

    // Settings
    allowComments: boolean('allow_comments').default(true).notNull(),
    requireApproval: boolean('require_approval').default(false).notNull(),
    enableNotifications: boolean('enable_notifications')
      .default(true)
      .notNull(),

    // Resources
    budget: integer('budget'), // In cents
    currency: varchar('currency', { length: 3 }).default('USD'), // ISO currency code

    // External integrations
    externalUrl: text('external_url'),
    repositoryUrl: text('repository_url'),

    // Custom fields
    tags: jsonb('tags').$type<string[]>(),
    customFields: jsonb('custom_fields').$type<Record<string, any>>(),

    // Metadata
    metadata: jsonb('metadata').$type<Record<string, any>>(),

    // Analytics
    viewCount: integer('view_count').default(0).notNull(),
    lastViewedAt: timestamp('last_viewed_at', { mode: 'date' }),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    archivedAt: timestamp('archived_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
  },
  table => ({
    // Indexes for performance
    orgIdx: index('project_org_idx').on(table.organizationId),
    ownerIdx: index('project_owner_idx').on(table.ownerId),
    slugIdx: index('project_slug_idx').on(table.slug),
    statusIdx: index('project_status_idx').on(table.status),
    priorityIdx: index('project_priority_idx').on(table.priority),
    visibilityIdx: index('project_visibility_idx').on(table.visibility),
    createdAtIdx: index('project_created_at_idx').on(table.createdAt),
    dueDateIdx: index('project_due_date_idx').on(table.dueDate),

    // Composite indexes
    orgStatusIdx: index('project_org_status_idx').on(
      table.organizationId,
      table.status
    ),
    orgSlugIdx: index('project_org_slug_idx').on(
      table.organizationId,
      table.slug
    ),
    nameIdx: index('project_name_idx').on(table.name),
  })
);

// ============================================
// PROJECT TYPES
// ============================================

export type Project = typeof projects.$inferSelect;
export type CreateProject = typeof projects.$inferInsert;

// Enum types
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
export type ProjectPriority = (typeof projectPriorityEnum.enumValues)[number];
export type ProjectVisibility =
  (typeof projectVisibilityEnum.enumValues)[number];

// Project with organization info
export type ProjectWithOrganization = Project & {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};

// Project with owner info
export type ProjectWithOwner = Project & {
  owner: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// Full project info
export type FullProject = Project & {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  owner: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

// Project summary for lists
export type ProjectSummary = Pick<
  Project,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'status'
  | 'priority'
  | 'color'
  | 'icon'
  | 'progressPercentage'
  | 'dueDate'
  | 'createdAt'
> & {
  organizationName: string;
  ownerName: string | null;
};

// Project card for dashboard
export type ProjectCard = Pick<
  Project,
  | 'id'
  | 'name'
  | 'slug'
  | 'color'
  | 'icon'
  | 'progressPercentage'
  | 'status'
  | 'updatedAt'
>;
