// packages/database/src/schemas/business/project.schema.ts
// ============================================
// PROJECTS SCHEMA - ENTERPRISE PROJECT MANAGEMENT (FIXED ENUMS)
// ============================================

import { boolean, index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organization.schema';

// Project enums
export const project_status_enum = pgEnum('project_status', [
  'active',
  'inactive',
  'completed',
  'cancelled',
  'on_hold',
]);

export const project_priority_enum = pgEnum('project_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

// ADDED MISSING ENUM
export const project_visibility_enum = pgEnum('project_visibility', [
  'public',
  'organization',
  'private',
]);

export const projects = pgTable(
  'projects',
  {
    id: text('id').primaryKey(),
    organization_id: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    
    // Basic information
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    
    // Status and priority
    status: project_status_enum('status').notNull().default('active'),
    priority: project_priority_enum('priority').notNull().default('medium'),
    visibility: project_visibility_enum('visibility').notNull().default('organization'),
    
    // Branding and display
    color: text('color'),
    icon: text('icon'),
    cover_image_url: text('cover_image_url'),
    
    // Ownership and management
    owner_id: text('owner_id').notNull(),
    
    // Timeline
    start_date: timestamp('start_date'),
    end_date: timestamp('end_date'),
    due_date: timestamp('due_date'),
    
    // Progress tracking
    progress_percentage: integer('progress_percentage').default(0),
    
    // Settings
    allow_comments: boolean('allow_comments').notNull().default(true),
    require_approval: boolean('require_approval').notNull().default(false),
    enable_notifications: boolean('enable_notifications').notNull().default(true),
    
    // Budget
    budget: integer('budget'), // In cents
    currency: text('currency').default('USD'),
    
    // External integration
    external_url: text('external_url'),
    repository_url: text('repository_url'),
    
    // Metadata
    tags: text('tags'), // JSON array
    
    // Analytics
    view_count: integer('view_count').notNull().default(0),
    last_viewed_at: timestamp('last_viewed_at'),
    
    // Timestamps
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    archived_at: timestamp('archived_at'),
    deleted_at: timestamp('deleted_at'), // Soft delete
  },
  (table) => ({
    // Organization and owner relationships
    orgIdx: index('projects_org_idx').on(table.organization_id),
    ownerIdx: index('projects_owner_idx').on(table.owner_id),
    
    // Unique constraint per organization
    orgSlugUniqueIdx: index('projects_org_slug_unique_idx').on(table.organization_id, table.slug),
    
    // Performance indexes
    slugIdx: index('projects_slug_idx').on(table.slug),
    nameIdx: index('projects_name_idx').on(table.name),
    
    // Status and priority
    statusIdx: index('projects_status_idx').on(table.status),
    priorityIdx: index('projects_priority_idx').on(table.priority),
    visibilityIdx: index('projects_visibility_idx').on(table.visibility),
    
    // Timeline indexes
    startDateIdx: index('projects_start_date_idx').on(table.start_date),
    endDateIdx: index('projects_end_date_idx').on(table.end_date),
    dueDateIdx: index('projects_due_date_idx').on(table.due_date),
    
    // Soft delete
    archivedIdx: index('projects_archived_idx').on(table.archived_at),
    deletedIdx: index('projects_deleted_idx').on(table.deleted_at),
    
    // Composite indexes for common queries
    orgStatusIdx: index('projects_org_status_idx').on(table.organization_id, table.status),
    orgVisibilityIdx: index('projects_org_visibility_idx').on(table.organization_id, table.visibility),
    ownerStatusIdx: index('projects_owner_status_idx').on(table.owner_id, table.status),
    orgActiveIdx: index('projects_org_active_idx').on(table.organization_id, table.status, table.deleted_at),
    orgDueDateIdx: index('projects_org_due_date_idx').on(table.organization_id, table.due_date),
    statusDueDateIdx: index('projects_status_due_date_idx').on(table.status, table.due_date),
    
    // Analytics indexes
    viewCountIdx: index('projects_view_count_idx').on(table.view_count),
    lastViewedIdx: index('projects_last_viewed_idx').on(table.last_viewed_at),
    
    // Timestamps
    createdIdx: index('projects_created_idx').on(table.created_at),
    updatedIdx: index('projects_updated_idx').on(table.updated_at),
  })
);

// Types
export type Project = typeof projects.$inferSelect;
export type CreateProject = typeof projects.$inferInsert;
export type ProjectStatus = typeof project_status_enum.enumValues[number];
export type ProjectPriority = typeof project_priority_enum.enumValues[number];
export type ProjectVisibility = typeof project_visibility_enum.enumValues[number];
