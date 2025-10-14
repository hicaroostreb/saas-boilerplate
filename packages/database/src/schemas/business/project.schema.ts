// packages/database/src/schemas/business/project.schema.ts
// ============================================
// PROJECTS SCHEMA - ENTERPRISE PROJECT MANAGEMENT
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

export const project_visibility_enum = pgEnum('project_visibility', [
  'public',      // Visible to everyone
  'private',     // Only visible to project members
  'organization', // Visible to all organization members
  'team',        // Visible to specific team members
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
    
    // Project management
    status: project_status_enum('status').notNull().default('active'),
    priority: project_priority_enum('priority').notNull().default('medium'),
    visibility: project_visibility_enum('visibility').notNull().default('organization'),
    
    // Visual customization
    color: text('color'), // Hex color for UI
    icon: text('icon'), // Icon identifier
    cover_image_url: text('cover_image_url'),
    
    // Ownership and management
    owner_id: text('owner_id').notNull(), // User who owns/leads the project
    
    // Timeline
    start_date: timestamp('start_date'),
    end_date: timestamp('end_date'),
    due_date: timestamp('due_date'),
    
    // Progress tracking
    progress_percentage: integer('progress_percentage').default(0), // 0-100
    
    // Settings
    allow_comments: boolean('allow_comments').notNull().default(true),
    require_approval: boolean('require_approval').notNull().default(false),
    enable_notifications: boolean('enable_notifications').notNull().default(true),
    
    // Budget tracking
    budget: integer('budget'), // In cents
    currency: text('currency').default('USD'),
    
    // External integrations
    external_url: text('external_url'),
    repository_url: text('repository_url'),
    
    // Metadata
    tags: text('tags'), // Comma-separated tags
    
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
    // Performance indexes
    orgIdx: index('projects_org_idx').on(table.organization_id),
    ownerIdx: index('projects_owner_idx').on(table.owner_id),
    slugIdx: index('projects_slug_idx').on(table.slug),
    nameIdx: index('projects_name_idx').on(table.name),
    
    // Status and visibility indexes
    statusIdx: index('projects_status_idx').on(table.status),
    priorityIdx: index('projects_priority_idx').on(table.priority),
    visibilityIdx: index('projects_visibility_idx').on(table.visibility),
    
    // Timeline indexes
    startDateIdx: index('projects_start_date_idx').on(table.start_date),
    endDateIdx: index('projects_end_date_idx').on(table.end_date),
    dueDateIdx: index('projects_due_date_idx').on(table.due_date),
    
    // Archive and delete indexes
    archivedIdx: index('projects_archived_idx').on(table.archived_at),
    deletedIdx: index('projects_deleted_idx').on(table.deleted_at),
    
    // Composite indexes for common queries
    orgStatusIdx: index('projects_org_status_idx').on(table.organization_id, table.status),
    orgVisibilityIdx: index('projects_org_visibility_idx').on(table.organization_id, table.visibility),
    ownerStatusIdx: index('projects_owner_status_idx').on(table.owner_id, table.status),
    orgActiveIdx: index('projects_org_active_idx').on(table.organization_id, table.status, table.deleted_at),
    
    // Timeline composite indexes
    orgDueDateIdx: index('projects_org_due_date_idx').on(table.organization_id, table.due_date),
    statusDueDateIdx: index('projects_status_due_date_idx').on(table.status, table.due_date),
    
    // Analytics indexes
    viewCountIdx: index('projects_view_count_idx').on(table.view_count),
    lastViewedIdx: index('projects_last_viewed_idx').on(table.last_viewed_at),
    
    // Timestamps
    createdIdx: index('projects_created_idx').on(table.created_at),
    updatedIdx: index('projects_updated_idx').on(table.updated_at),
    
    // Unique constraints
    orgSlugIdx: index('projects_org_slug_unique_idx').on(table.organization_id, table.slug),
  })
);

// Types
export type Project = typeof projects.$inferSelect;
export type CreateProject = typeof projects.$inferInsert;
export type UpdateProject = Partial<Omit<Project, 'id' | 'organization_id' | 'created_at'>>;
export type ProjectStatus = typeof project_status_enum.enumValues[number];
export type ProjectPriority = typeof project_priority_enum.enumValues[number];
export type ProjectVisibility = typeof project_visibility_enum.enumValues[number];

// Extended project types
export interface ProjectWithOwner extends Project {
  owner: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface ProjectWithStats extends Project {
  member_count: number;
  task_count: number;
  completed_task_count: number;
  overdue_task_count: number;
}

export interface ProjectSummary {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  overdue_projects: number;
  on_hold_projects: number;
  cancelled_projects: number;
  archived_projects: number;
}

// Project filtering and search
export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  visibility?: ProjectVisibility[];
  owner_id?: string;
  tags?: string[];
  has_due_date?: boolean;
  is_overdue?: boolean;
  created_after?: Date;
  created_before?: Date;
  search?: string; // Search in name, description
}

// Helper functions
export function isProjectActive(project: Project): boolean {
  return project.status === 'active' && !project.archived_at && !project.deleted_at;
}

export function isProjectCompleted(project: Project): boolean {
  return project.status === 'completed';
}

export function isProjectOverdue(project: Project): boolean {
  if (!project.due_date) return false;
  return project.status === 'active' && new Date() > project.due_date;
}

export function isProjectArchived(project: Project): boolean {
  return project.archived_at !== null;
}

export function canUserViewProject(project: Project, userId: string, organizationId: string): boolean {
  // Project is deleted
  if (project.deleted_at) return false;
  
  // Owner can always view
  if (project.owner_id === userId) return true;
  
  // Check visibility rules
  switch (project.visibility) {
    case 'public':
      return true;
    case 'organization':
      return project.organization_id === organizationId;
    case 'private':
    case 'team':
      // These would need additional checks for team membership
      return false;
    default:
      return false;
  }
}

export function getProjectProgress(project: Project): number {
  return Math.max(0, Math.min(100, project.progress_percentage || 0));
}

export function updateProjectProgress(taskCount: number, completedTasks: number): number {
  if (taskCount === 0) return 0;
  return Math.round((completedTasks / taskCount) * 100);
}

// Timeline helpers
export function getProjectDuration(project: Project): number | null {
  if (!project.start_date || !project.end_date) return null;
  return project.end_date.getTime() - project.start_date.getTime();
}

export function getProjectDurationDays(project: Project): number | null {
  const duration = getProjectDuration(project);
  if (!duration) return null;
  return Math.ceil(duration / (1000 * 60 * 60 * 24));
}

export function getDaysUntilDue(project: Project): number | null {
  if (!project.due_date) return null;
  const now = Date.now();
  const dueTime = project.due_date.getTime();
  return Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
}

export function getProjectPhase(project: Project): 'planning' | 'active' | 'finishing' | 'completed' {
  if (project.status === 'completed') return 'completed';
  
  const progress = getProjectProgress(project);
  if (progress < 25) return 'planning';
  if (progress < 75) return 'active';
  return 'finishing';
}

// Budget helpers
export function formatBudget(budget: number | null, currency: string = 'USD'): string {
  if (!budget) return 'No budget set';
  
  const amount = budget / 100; // Convert from cents
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function isBudgetSet(project: Project): boolean {
  return project.budget !== null && project.budget > 0;
}

// Tag helpers
export function parseProjectTags(project: Project): string[] {
  if (!project.tags) return [];
  return project.tags.split(',').map(tag => tag.trim()).filter(Boolean);
}

export function serializeProjectTags(tags: string[]): string {
  return tags.filter(Boolean).map(tag => tag.trim()).join(',');
}

export function hasTag(project: Project, tag: string): boolean {
  const tags = parseProjectTags(project);
  return tags.includes(tag.toLowerCase());
}

// Analytics helpers
export function incrementViewCount(project: Project): Partial<UpdateProject> {
  return {
    view_count: (project.view_count || 0) + 1,
    last_viewed_at: new Date(),
  };
}

export function shouldUpdateViewCount(project: Project): boolean {
  if (!project.last_viewed_at) return true;
  
  // Only update view count if last viewed more than 1 hour ago
  const hoursSinceLastView = (Date.now() - project.last_viewed_at.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastView >= 1;
}

// Project slug generation
export function generateProjectSlug(name: string, existingSlugs: string[] = []): string {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (baseSlug.length === 0) {
    baseSlug = 'project';
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Status validation
export function canTransitionToStatus(currentStatus: ProjectStatus, newStatus: ProjectStatus): boolean {
  const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
    active: ['completed', 'cancelled', 'on_hold'],
    inactive: ['active', 'cancelled'],
    completed: ['active'], // Can reopen completed projects
    cancelled: ['active'], // Can restart cancelled projects
    on_hold: ['active', 'cancelled'],
  };
  
  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
}
