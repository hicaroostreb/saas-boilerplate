// packages/database/src/repositories/implementations/drizzle-organization.repository.ts
// ============================================
// DRIZZLE ORGANIZATION REPOSITORY - ENTERPRISE MULTI-TENANT
// ============================================

import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNull,
  like,
  sql,
} from 'drizzle-orm';
import type { Database } from '../../connection';
import { DatabaseError } from '../../connection';
import { organizations, type Organization } from '../../schemas/business';
import type { IOrganizationRepository } from '../contracts/organization.repository.interface';

export class DrizzleOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly db: Database) {}

  private checkBuildTime(): boolean {
    return process.env.NODE_ENV === 'production' && 
           (process.env.NEXT_PHASE === 'phase-production-build' || 
            process.env.CI === 'true');
  }

  async findById(id: string): Promise<Organization | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const result = await this.db
        .select()
        .from(organizations)
        .where(and(eq(organizations.id, id), isNull(organizations.deleted_at)))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findById');
    }
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const result = await this.db
        .select()
        .from(organizations)
        .where(and(eq(organizations.slug, slug), isNull(organizations.deleted_at)))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findBySlug');
    }
  }

  async findByTenantId(tenant_id: string): Promise<Organization[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(organizations)
        .where(and(eq(organizations.tenant_id, tenant_id), isNull(organizations.deleted_at)))
        .orderBy(desc(organizations.created_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByTenantId');
    }
  }

  async findPublicOrganizations(): Promise<Organization[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(organizations)
        .where(
          and(
            eq(organizations.is_public, true),
            eq(organizations.is_active, true),
            isNull(organizations.deleted_at)
          )
        )
        .orderBy(desc(organizations.created_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findPublicOrganizations');
    }
  }

  async findUserOrganizations(user_id: string): Promise<Organization[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(organizations)
        .where(
          and(
            eq(organizations.owner_id, user_id),
            isNull(organizations.deleted_at)
          )
        )
        .orderBy(desc(organizations.created_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findUserOrganizations');
    }
  }

  async create(organization: Omit<Organization, 'created_at' | 'updated_at'>): Promise<Organization> {
    if (this.checkBuildTime()) {
      return {
        ...organization,
        created_at: new Date(),
        updated_at: new Date(),
      } as Organization;
    }
    
    try {
      const now = new Date();
      const [result] = await this.db
        .insert(organizations)
        .values({
          ...organization,
          created_at: now,
          updated_at: now,
        })
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to create organization - no result returned');
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'create');
    }
  }

  async update(organization: Organization): Promise<Organization> {
    if (this.checkBuildTime()) return organization;
    
    try {
      const [result] = await this.db
        .update(organizations)
        .set({ ...organization, updated_at: new Date() })
        .where(and(eq(organizations.id, organization.id), isNull(organizations.deleted_at)))
        .returning();

      if (!result) {
        throw new DatabaseError('Failed to update organization - organization not found or deleted');
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    if (this.checkBuildTime()) return;
    
    try {
      await this.db
        .update(organizations)
        .set({ deleted_at: new Date() })
        .where(and(eq(organizations.id, id), isNull(organizations.deleted_at)));
    } catch (error) {
      throw this.handleDatabaseError(error, 'delete');
    }
  }

  async softDelete(id: string): Promise<void> {
    if (this.checkBuildTime()) return;
    
    try {
      await this.db
        .update(organizations)
        .set({ deleted_at: new Date(), updated_at: new Date() })
        .where(eq(organizations.id, id));
    } catch (error) {
      throw this.handleDatabaseError(error, 'softDelete');
    }
  }

  async restore(id: string): Promise<Organization | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const [result] = await this.db
        .update(organizations)
        .set({ deleted_at: null, updated_at: new Date() })
        .where(eq(organizations.id, id))
        .returning();

      return result || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'restore');
    }
  }

  async findMany(options: {
    tenant_id?: string;
    is_active?: boolean;
    is_public?: boolean;
    plan_type?: string;
    search?: string;
    limit?: number;
    offset?: number;
    include_deleted?: boolean;
  }): Promise<Organization[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const conditions = [
        options.include_deleted ? undefined : isNull(organizations.deleted_at),
        options.tenant_id ? eq(organizations.tenant_id, options.tenant_id) : undefined,
        options.is_active !== undefined ? eq(organizations.is_active, options.is_active) : undefined,
        options.is_public !== undefined ? eq(organizations.is_public, options.is_public) : undefined,
        options.plan_type ? eq(organizations.plan_type, options.plan_type) : undefined,
        options.search ? like(organizations.name, `%${options.search}%`) : undefined,
      ].filter(Boolean);

      let query = this.db
        .select()
        .from(organizations)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(organizations.created_at)) as any;

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.offset(options.offset);
      }

      const result = await query;
      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findMany');
    }
  }

  async count(filters?: {
    tenant_id?: string;
    is_active?: boolean;
    is_public?: boolean;
    plan_type?: string;
  }): Promise<number> {
    if (this.checkBuildTime()) return 0;
    
    try {
      const conditions = [
        isNull(organizations.deleted_at),
        filters?.tenant_id ? eq(organizations.tenant_id, filters.tenant_id) : undefined,
        filters?.is_active !== undefined ? eq(organizations.is_active, filters.is_active) : undefined,
        filters?.is_public !== undefined ? eq(organizations.is_public, filters.is_public) : undefined,
        filters?.plan_type ? eq(organizations.plan_type, filters.plan_type) : undefined,
      ].filter(Boolean);

      const result = await this.db
        .select({ count: count() })
        .from(organizations)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return result[0]?.count ?? 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'count');
    }
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    if (this.checkBuildTime()) return false;
    
    try {
      const conditions = [
        eq(organizations.slug, slug),
        isNull(organizations.deleted_at),
        excludeId ? sql`${organizations.id} != ${excludeId}` : undefined,
      ].filter(Boolean);

      const result = await this.db
        .select({ count: count() })
        .from(organizations)
        .where(and(...conditions))
        .limit(1);

      return (result[0]?.count ?? 0) > 0;
    } catch (error) {
      throw this.handleDatabaseError(error, 'existsBySlug');
    }
  }

  async findByOwner(owner_id: string): Promise<Organization[]> {
    if (this.checkBuildTime()) return [];
    
    try {
      const result = await this.db
        .select()
        .from(organizations)
        .where(
          and(
            eq(organizations.owner_id, owner_id),
            isNull(organizations.deleted_at)
          )
        )
        .orderBy(desc(organizations.created_at));

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByOwner');
    }
  }

  async updatePlan(id: string, plan_type: string): Promise<Organization | null> {
    if (this.checkBuildTime()) return null;
    
    try {
      const [result] = await this.db
        .update(organizations)
        .set({ 
          plan_type, 
          updated_at: new Date() 
        })
        .where(and(eq(organizations.id, id), isNull(organizations.deleted_at)))
        .returning();

      return result || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'updatePlan');
    }
  }

  async incrementUsage(id: string, type: 'members' | 'projects' | 'storage', amount: number): Promise<void> {
    if (this.checkBuildTime()) return;
    
    try {
      // This would require additional usage tracking tables
      // For now, this is a placeholder for the interface
      console.warn('incrementUsage not implemented - requires usage tracking tables');
    } catch (error) {
      throw this.handleDatabaseError(error, 'incrementUsage');
    }
  }

  async getUsageStats(id: string): Promise<{
    members_used: number;
    projects_used: number;
    storage_used: number;
  }> {
    if (this.checkBuildTime()) return { members_used: 0, projects_used: 0, storage_used: 0 };
    
    try {
      // This would require joins with memberships, projects, and file tables
      // For now, return default values
      return {
        members_used: 0,
        projects_used: 0,
        storage_used: 0,
      };
    } catch (error) {
      throw this.handleDatabaseError(error, 'getUsageStats');
    }
  }

  private handleDatabaseError(error: unknown, operation: string): DatabaseError {
    const err = error as { code?: string; message?: string; constraint?: string };

    console.error(`[DrizzleOrganizationRepository.${operation}] Database error:`, {
      code: err.code,
      message: err.message?.substring(0, 200),
      constraint: err.constraint,
    });

    if (err.code === '23505') {
      return new DatabaseError(
        'Organization with this slug already exists',
        err.code,
        err.constraint
      );
    }

    if (err.code === '23503') {
      return new DatabaseError(
        'Referenced resource not found',
        err.code,
        err.constraint
      );
    }

    if (err.code === '23502') {
      return new DatabaseError(
        'Required field is missing',
        err.code,
        err.constraint
      );
    }

    return new DatabaseError(
      `Organization operation failed: ${operation}`,
      err.code,
      err.constraint
    );
  }
}
