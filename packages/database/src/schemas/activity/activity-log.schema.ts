// packages/database/src/schemas/activity/activity-log.schema.ts
// ============================================
// ACTIVITY LOGS SCHEMA - ENTERPRISE AUDIT TRAIL
// ============================================

import { boolean, index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Activity enums
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
]);

export const activity_resource_enum = pgEnum('activity_resource', [
  'user',
  'organization',
  'membership',
  'project',
  'contact',
  'invitation',
  'session',
]);

// Activity logs table
export const activity_logs = pgTable(
  'activity_logs',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id'), // Who performed the action
    organization_id: text('organization_id'), // Organization context
    activity_type: activity_type_enum('activity_type').notNull(),
    resource_type: activity_resource_enum('resource_type').notNull(),
    resource_id: text('resource_id').notNull(), // ID of the affected resource
    resource_name: text('resource_name'), // Human-readable name
    description: text('description').notNull(),
    
    // Change tracking
    old_values: text('old_values'), // JSON string of previous values
    new_values: text('new_values'), // JSON string of new values
    
    // Context information
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
    session_id: text('session_id'),
    
    // Metadata
    tags: text('tags'), // Comma-separated tags for filtering
    severity: text('severity').default('info'), // info, warning, error
    is_system_action: boolean('is_system_action').default(false),
    
    // Timestamps
    occurred_at: timestamp('occurred_at').notNull().defaultNow(),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    // Performance indexes
    userIdx: index('activity_logs_user_idx').on(table.user_id),
    orgIdx: index('activity_logs_org_idx').on(table.organization_id),
    typeIdx: index('activity_logs_type_idx').on(table.activity_type),
    resourceIdx: index('activity_logs_resource_idx').on(table.resource_type, table.resource_id),
    occurredIdx: index('activity_logs_occurred_idx').on(table.occurred_at),
    
    // Composite indexes for common queries
    userOrgIdx: index('activity_logs_user_org_idx').on(table.user_id, table.organization_id),
    orgTypeIdx: index('activity_logs_org_type_idx').on(table.organization_id, table.activity_type),
    resourceOrgIdx: index('activity_logs_resource_org_idx').on(table.resource_type, table.organization_id),
  })
);

// Types
export type ActivityLog = typeof activity_logs.$inferSelect;
export type CreateActivityLog = typeof activity_logs.$inferInsert;
export type ActivityType = typeof activity_type_enum.enumValues[number];
export type ActivityResource = typeof activity_resource_enum.enumValues[number];

// Helper types for structured data
export interface ActivityChangeData {
  field: string;
  old_value: any;
  new_value: any;
  field_label?: string;
}

export interface ActivityMetadata {
  changes?: ActivityChangeData[];
  additional_info?: Record<string, any>;
  related_resources?: Array<{
    type: ActivityResource;
    id: string;
    name?: string;
  }>;
}

export interface CreateActivityLogData {
  user_id?: string;
  organization_id?: string;
  activity_type: ActivityType;
  resource_type: ActivityResource;
  resource_id: string;
  resource_name?: string;
  description: string;
  old_values?: string;
  new_values?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  tags?: string;
  severity?: 'info' | 'warning' | 'error';
  is_system_action?: boolean;
}

// Activity log builder utility
export class ActivityLogBuilder {
  private data: Partial<CreateActivityLogData> = {};

  constructor(
    activityType: ActivityType,
    resourceType: ActivityResource,
    resourceId: string,
    description: string
  ) {
    this.data = {
      id: crypto.randomUUID(),
      activity_type: activityType,
      resource_type: resourceType,
      resource_id: resourceId,
      description,
      severity: 'info',
      is_system_action: false,
    };
  }

  withUser(userId: string): ActivityLogBuilder {
    this.data.user_id = userId;
    return this;
  }

  withOrganization(organizationId: string): ActivityLogBuilder {
    this.data.organization_id = organizationId;
    return this;
  }

  withResourceName(name: string): ActivityLogBuilder {
    this.data.resource_name = name;
    return this;
  }

  withChanges(oldValues: any, newValues: any): ActivityLogBuilder {
    this.data.old_values = typeof oldValues === 'string' ? oldValues : JSON.stringify(oldValues);
    this.data.new_values = typeof newValues === 'string' ? newValues : JSON.stringify(newValues);
    return this;
  }

  withContext(ipAddress?: string, userAgent?: string, sessionId?: string): ActivityLogBuilder {
    this.data.ip_address = ipAddress;
    this.data.user_agent = userAgent;
    this.data.session_id = sessionId;
    return this;
  }

  withSeverity(severity: 'info' | 'warning' | 'error'): ActivityLogBuilder {
    this.data.severity = severity;
    return this;
  }

  withTags(tags: string[]): ActivityLogBuilder {
    this.data.tags = tags.join(',');
    return this;
  }

  asSystemAction(): ActivityLogBuilder {
    this.data.is_system_action = true;
    return this;
  }

  build(): CreateActivityLogData {
    if (!this.data.activity_type || !this.data.resource_type || !this.data.resource_id || !this.data.description) {
      throw new Error('Missing required fields for ActivityLog');
    }
    
    return this.data as CreateActivityLogData;
  }
}
