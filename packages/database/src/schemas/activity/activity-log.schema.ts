// packages/database/src/schemas/activity/activity-log.schema.ts
// ============================================
// ACTIVITY LOGS SCHEMA - ENTERPRISE ACTIVITY TRACKING (REFACTORED)
// ============================================

import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Activity types
export const activity_type_enum = pgEnum('activity_type', [
  'user_created',
  'user_updated',
  'user_deleted',
  'user_login',
  'user_logout',
  'organization_created',
  'organization_updated',
  'organization_deleted',
  'membership_created',
  'membership_updated',
  'membership_deleted',
  'project_created',
  'project_updated',
  'project_deleted',
  'contact_created',
  'contact_updated',
  'contact_deleted',
  'invitation_sent',
  'invitation_accepted',
  'invitation_rejected',
  'session_created',
  'session_terminated',
]);

// Resource types
export const activity_resource_enum = pgEnum('activity_resource', [
  'user',
  'organization',
  'membership',
  'project',
  'contact',
  'invitation',
  'session',
]);

export const activity_logs = pgTable(
  'activity_logs',
  {
    id: text('id').primaryKey(),
    tenant_id: text('tenant_id').notNull(), // ✅ ADICIONADO

    // What happened
    type: activity_type_enum('type').notNull(),
    action: text('action').notNull(),
    description: text('description'),

    // Who did it
    user_id: text('user_id'),
    organization_id: text('organization_id'),

    // What was affected
    resource_type: activity_resource_enum('resource_type').notNull(),
    resource_id: text('resource_id').notNull(),

    // Context and metadata
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
    session_id: text('session_id'),

    // Change tracking
    changes_before: text('changes_before'), // JSON string
    changes_after: text('changes_after'), // JSON string

    // Categorization
    category: text('category'),
    severity: text('severity').default('info').notNull(),

    // Status and flags
    is_sensitive: boolean('is_sensitive').default(false).notNull(),
    is_system_action: boolean('is_system_action').default(false).notNull(),

    // Timestamps
    occurred_at: timestamp('occurred_at').notNull().defaultNow(),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    // ✅ REFATORADO - tenant_id sempre primeiro
    tenantOccurredIdx: index('activity_logs_tenant_occurred_idx').on(
      table.tenant_id,
      table.occurred_at
    ),
    tenantOrgIdx: index('activity_logs_tenant_org_idx').on(
      table.tenant_id,
      table.organization_id
    ),
    tenantUserIdx: index('activity_logs_tenant_user_idx').on(
      table.tenant_id,
      table.user_id
    ),
    tenantResourceIdx: index('activity_logs_tenant_resource_idx').on(
      table.tenant_id,
      table.resource_type,
      table.resource_id
    ),
    tenantTypeIdx: index('activity_logs_tenant_type_idx').on(
      table.tenant_id,
      table.type
    ),

    // Performance indexes
    typeIdx: index('activity_logs_type_idx').on(table.type),
    userIdx: index('activity_logs_user_idx').on(table.user_id),
    orgIdx: index('activity_logs_org_idx').on(table.organization_id),
    resourceIdx: index('activity_logs_resource_idx').on(
      table.resource_type,
      table.resource_id
    ),

    // Time-based
    occurredIdx: index('activity_logs_occurred_idx').on(table.occurred_at),
    createdIdx: index('activity_logs_created_idx').on(table.created_at),

    // Classification
    sensitiveIdx: index('activity_logs_sensitive_idx').on(table.is_sensitive),
    severityIdx: index('activity_logs_severity_idx').on(table.severity),
    categoryIdx: index('activity_logs_category_idx').on(table.category),

    // Composite indexes
    userOrgIdx: index('activity_logs_user_org_idx').on(
      table.user_id,
      table.organization_id
    ),
    typeResourceIdx: index('activity_logs_type_resource_idx').on(
      table.type,
      table.resource_type
    ),
    orgTypeIdx: index('activity_logs_org_type_idx').on(
      table.organization_id,
      table.type
    ),
    sessionIdx: index('activity_logs_session_idx').on(table.session_id),
  })
);

// Types
export type ActivityLog = typeof activity_logs.$inferSelect;
export type CreateActivityLog = typeof activity_logs.$inferInsert;
export type ActivityType = (typeof activity_type_enum.enumValues)[number];
export type ActivityResource =
  (typeof activity_resource_enum.enumValues)[number];

// Data types for activity tracking
export type CreateActivityLogData = Omit<
  CreateActivityLog,
  'id' | 'created_at'
>;

// Builder pattern for creating activity logs
export class ActivityLogBuilder {
  private data: Partial<CreateActivityLogData> = {};

  static create() {
    return new ActivityLogBuilder();
  }

  tenantId(tenantId: string) {
    this.data.tenant_id = tenantId;
    return this;
  }

  type(type: ActivityType) {
    this.data.type = type;
    return this;
  }

  action(action: string) {
    this.data.action = action;
    return this;
  }

  description(description: string) {
    this.data.description = description;
    return this;
  }

  user(userId: string) {
    this.data.user_id = userId;
    return this;
  }

  organization(organizationId: string) {
    this.data.organization_id = organizationId;
    return this;
  }

  resource(type: ActivityResource, id: string) {
    this.data.resource_type = type;
    this.data.resource_id = id;
    return this;
  }

  context(ipAddress?: string, userAgent?: string, sessionId?: string) {
    if (ipAddress) this.data.ip_address = ipAddress;
    if (userAgent) this.data.user_agent = userAgent;
    if (sessionId) this.data.session_id = sessionId;
    return this;
  }

  changes(before?: any, after?: any) {
    if (before) this.data.changes_before = JSON.stringify(before);
    if (after) this.data.changes_after = JSON.stringify(after);
    return this;
  }

  category(category: string) {
    this.data.category = category;
    return this;
  }

  severity(severity: 'info' | 'warning' | 'error' | 'critical') {
    this.data.severity = severity;
    return this;
  }

  sensitive(isSensitive = true) {
    this.data.is_sensitive = isSensitive;
    return this;
  }

  systemAction(isSystem = true) {
    this.data.is_system_action = isSystem;
    return this;
  }

  occurredAt(date: Date) {
    this.data.occurred_at = date;
    return this;
  }

  build(): CreateActivityLog {
    if (
      !this.data.tenant_id ||
      !this.data.type ||
      !this.data.action ||
      !this.data.resource_type ||
      !this.data.resource_id
    ) {
      throw new Error(
        'ActivityLog requires tenant_id, type, action, resource_type, and resource_id'
      );
    }

    return {
      ...this.data,
      occurred_at: this.data.occurred_at || new Date(),
    } as CreateActivityLog;
  }
}

// Helper functions
export function createUserActivityLog(
  tenantId: string,
  type: ActivityType,
  action: string,
  userId: string,
  resourceType: ActivityResource,
  resourceId: string,
  organizationId?: string,
  context?: { ip?: string; userAgent?: string; sessionId?: string }
): CreateActivityLog {
  return ActivityLogBuilder.create()
    .tenantId(tenantId)
    .type(type)
    .action(action)
    .user(userId)
    .resource(resourceType, resourceId)
    .organization(organizationId || '')
    .context(context?.ip, context?.userAgent, context?.sessionId)
    .build();
}

export function createSystemActivityLog(
  tenantId: string,
  type: ActivityType,
  action: string,
  resourceType: ActivityResource,
  resourceId: string,
  description?: string
): CreateActivityLog {
  return ActivityLogBuilder.create()
    .tenantId(tenantId)
    .type(type)
    .action(action)
    .resource(resourceType, resourceId)
    .description(description || '')
    .systemAction(true)
    .build();
}

// Analytics helpers
export function parseChanges(activityLog: ActivityLog): {
  before: any;
  after: any;
} {
  return {
    before: activityLog.changes_before
      ? JSON.parse(activityLog.changes_before)
      : null,
    after: activityLog.changes_after
      ? JSON.parse(activityLog.changes_after)
      : null,
  };
}

export function isSignificantChange(activityLog: ActivityLog): boolean {
  return (
    ['created', 'deleted'].includes(activityLog.action.toLowerCase()) ||
    (activityLog.severity !== 'info' && activityLog.severity !== null) ||
    activityLog.is_sensitive === true
  );
}

export function getActivitySummary(activityLog: ActivityLog): string {
  const resource = `${activityLog.resource_type}:${activityLog.resource_id}`;
  return `${activityLog.action} ${resource}${activityLog.description ? ` - ${activityLog.description}` : ''}`;
}
