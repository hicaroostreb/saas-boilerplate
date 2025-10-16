// packages/database/src/repositories/implementations/drizzle-organization.repository.ts
// ============================================
// DRIZZLE ORGANIZATION REPOSITORY - ENTERPRISE MULTI-TENANT (FINAL)
// ============================================

import { and, desc, eq, isNull, like, sql } from 'drizzle-orm';
import type { DatabaseWrapper } from '../../connection';
import { DatabaseError } from '../../connection';
import { tenantContext } from '../../connection/tenant-context';
import {
  memberships,
  organizations,
  projects,
  type Organization,
} from '../../schemas';
import { logger } from '../../utils/logger';
import { AuthorizationGuard } from '../authorization-guard';
import type { IOrganizationRepository } from '../contracts/organization.repository.interface';

export class QuotaExceededError extends Error {
  constructor(
    message: string,
    public readonly organizationId: string,
    public readonly quotaType: 'members' | 'projects' | 'storage',
    public readonly current: number,
    public readonly limit: number
  ) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class DrizzleOrganizationRepository implements IOrganizationRepository {
  private guard: AuthorizationGuard;

  constructor(private readonly rls: DatabaseWrapper) {
    this.guard = new AuthorizationGuard(rls);
  }

  private get db() {
    return (this.rls as any).db;
  }

  private checkBuildTime(): boolean {
    return (
      process.env.NODE_ENV === 'production' &&
      (process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.CI === 'true')
    );
  }

  async findById(id: string): Promise<Organization | null> {
    if (this.checkBuildTime()) {
      return null;
    }

    try {
      const result = await this.rls.selectWhere(
        organizations,
        and(eq(organizations.id, id), isNull(organizations.deleted_at))!
      );
      return result[0] || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findById');
    }
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    if (this.checkBuildTime()) {
      return null;
    }

    try {
      const result = await this.rls.selectWhere(
        organizations,
        and(eq(organizations.slug, slug), isNull(organizations.deleted_at))!
      );
      return result[0] || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findBySlug');
    }
  }

  async findByTenantId(tenantId: string): Promise<Organization[]> {
    if (this.checkBuildTime()) {
      return [];
    }

    try {
      tenantContext.validateTenant(tenantId);
      return await this.rls
        .selectWhere(organizations, isNull(organizations.deleted_at))
        .orderBy(desc(organizations.created_at));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByTenantId');
    }
  }

  async findPublicOrganizations(): Promise<Organization[]> {
    if (this.checkBuildTime()) {
      return [];
    }

    try {
      return await this.rls
        .selectWhere(
          organizations,
          and(
            eq(organizations.is_public, true),
            eq(organizations.is_active, true),
            isNull(organizations.deleted_at)
          )!
        )
        .orderBy(desc(organizations.created_at));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findPublicOrganizations');
    }
  }

  async findUserOrganizations(userId: string): Promise<Organization[]> {
    if (this.checkBuildTime()) {
      return [];
    }

    try {
      return await this.rls
        .selectWhere(
          organizations,
          and(
            eq(organizations.owner_id, userId),
            isNull(organizations.deleted_at)
          )!
        )
        .orderBy(desc(organizations.created_at));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findUserOrganizations');
    }
  }

  async create(
    organization: Omit<Organization, 'created_at' | 'updated_at'>
  ): Promise<Organization> {
    if (this.checkBuildTime()) {
      return {
        ...organization,
        created_at: new Date(),
        updated_at: new Date(),
      } as Organization;
    }

    return this.rls.transactionWithRLS(async tx => {
      const now = new Date();
      const [result] = await tx
        .insert(organizations)
        .values({ ...organization, created_at: now, updated_at: now })
        .returning();

      if (!result) {
        throw new DatabaseError(
          'Failed to create organization - no result returned'
        );
      }

      return result;
    });
  }

  async update(
    organization: Organization,
    requestingUserId?: string
  ): Promise<Organization> {
    if (this.checkBuildTime()) {
      return organization;
    }

    return this.rls.transactionWithRLS(async tx => {
      if (requestingUserId) {
        await this.guard.requirePermission(
          requestingUserId,
          organization.id,
          'can_manage_settings'
        );
      }

      const [result] = await tx
        .update(organizations)
        .set({ ...organization, updated_at: new Date() })
        .where(
          and(
            eq(organizations.id, organization.id),
            isNull(organizations.deleted_at)
          )!
        )
        .returning();

      if (!result) {
        throw new DatabaseError(
          'Failed to update organization - organization not found or deleted'
        );
      }

      return result;
    });
  }

  async delete(id: string, requestingUserId?: string): Promise<void> {
    if (this.checkBuildTime()) {
      return;
    }

    try {
      if (requestingUserId) {
        await this.guard.requireOwner(requestingUserId, id);
      }
      await this.rls.softDelete(organizations, eq(organizations.id, id));
    } catch (error) {
      throw this.handleDatabaseError(error, 'delete');
    }
  }

  async softDelete(id: string, requestingUserId?: string): Promise<void> {
    if (this.checkBuildTime()) {
      return;
    }

    try {
      if (requestingUserId) {
        await this.guard.requireOwner(requestingUserId, id);
      }
      await this.rls.softDelete(organizations, eq(organizations.id, id));
    } catch (error) {
      throw this.handleDatabaseError(error, 'softDelete');
    }
  }

  async restore(id: string): Promise<Organization | null> {
    if (this.checkBuildTime()) {
      return null;
    }

    try {
      const [result] = await this.rls.restore(
        organizations,
        eq(organizations.id, id)
      );
      return result || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'restore');
    }
  }

  async findMany(options: {
    is_active?: boolean;
    is_public?: boolean;
    plan_type?: string;
    search?: string;
    limit?: number;
    offset?: number;
    include_deleted?: boolean;
  }): Promise<Organization[]> {
    if (this.checkBuildTime()) {
      return [];
    }

    try {
      const conditions = [
        options.include_deleted ? undefined : isNull(organizations.deleted_at),
        options.is_active !== undefined
          ? eq(organizations.is_active, options.is_active)
          : undefined,
        options.is_public !== undefined
          ? eq(organizations.is_public, options.is_public)
          : undefined,
        options.plan_type
          ? eq(organizations.plan_type, options.plan_type as any)
          : undefined,
        options.search
          ? like(organizations.name, `%${options.search}%`)
          : undefined,
      ].filter(Boolean);

      const finalConditions =
        conditions.length > 0 ? and(...conditions) : undefined;

      let result = finalConditions
        ? await this.rls
            .selectWhere(organizations, finalConditions)
            .orderBy(desc(organizations.created_at))
        : await this.rls
            .select(organizations)
            .orderBy(desc(organizations.created_at));

      if (options.offset) {
        result = result.slice(options.offset);
      }

      if (options.limit) {
        result = result.slice(0, options.limit);
      }

      return result;
    } catch (error) {
      throw this.handleDatabaseError(error, 'findMany');
    }
  }

  async count(filters?: {
    is_active?: boolean;
    is_public?: boolean;
    plan_type?: string;
  }): Promise<number> {
    if (this.checkBuildTime()) {
      return 0;
    }

    try {
      const conditions = [
        isNull(organizations.deleted_at),
        filters?.is_active !== undefined
          ? eq(organizations.is_active, filters.is_active)
          : undefined,
        filters?.is_public !== undefined
          ? eq(organizations.is_public, filters.is_public)
          : undefined,
        filters?.plan_type
          ? eq(organizations.plan_type, filters.plan_type as any)
          : undefined,
      ].filter(Boolean);

      const finalConditions =
        conditions.length > 0 ? and(...conditions) : undefined;
      return await this.rls.count(organizations, finalConditions);
    } catch (error) {
      throw this.handleDatabaseError(error, 'count');
    }
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    if (this.checkBuildTime()) {
      return false;
    }

    try {
      const conditions = [
        eq(organizations.slug, slug),
        isNull(organizations.deleted_at),
        excludeId ? sql`${organizations.id} != ${excludeId}` : undefined,
      ].filter(Boolean);

      return await this.rls.exists(organizations, and(...conditions)!);
    } catch (error) {
      throw this.handleDatabaseError(error, 'existsBySlug');
    }
  }

  async findByOwner(ownerId: string): Promise<Organization[]> {
    if (this.checkBuildTime()) {
      return [];
    }

    try {
      return await this.rls
        .selectWhere(
          organizations,
          and(
            eq(organizations.owner_id, ownerId),
            isNull(organizations.deleted_at)
          )!
        )
        .orderBy(desc(organizations.created_at));
    } catch (error) {
      throw this.handleDatabaseError(error, 'findByOwner');
    }
  }

  async updatePlan(
    id: string,
    planType: string,
    requestingUserId?: string
  ): Promise<Organization | null> {
    if (this.checkBuildTime()) {
      return null;
    }

    try {
      if (requestingUserId) {
        await this.guard.requirePermission(
          requestingUserId,
          id,
          'can_manage_billing'
        );
      }

      await this.rls
        .updateWhere(
          organizations,
          and(eq(organizations.id, id), isNull(organizations.deleted_at))!
        )
        .set({
          plan_type: planType as any,
          updated_at: new Date(),
        });

      const [result] = await this.db
        .select()
        .from(organizations)
        .where(eq(organizations.id, id))
        .limit(1);

      return result || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'updatePlan');
    }
  }

  async getUsageStats(id: string): Promise<{
    members_used: number;
    projects_used: number;
    storage_used: number;
  }> {
    if (this.checkBuildTime()) {
      return { members_used: 0, projects_used: 0, storage_used: 0 };
    }

    try {
      const { tenantId } = tenantContext.getContext();

      const [stats] = await this.db
        .select({
          members_used: sql<number>`COUNT(DISTINCT CASE WHEN ${memberships.status} = 'active' THEN ${memberships.user_id} END)`,
          projects_used: sql<number>`COUNT(DISTINCT ${projects.id})`,
          storage_used: sql<number>`0`,
        })
        .from(organizations)
        .leftJoin(
          memberships,
          and(
            eq(memberships.organization_id, organizations.id),
            eq(memberships.tenant_id, tenantId)
          )!
        )
        .leftJoin(
          projects,
          and(
            eq(projects.organization_id, organizations.id),
            eq(projects.tenant_id, tenantId),
            isNull(projects.deleted_at)
          )!
        )
        .where(
          and(eq(organizations.tenant_id, tenantId), eq(organizations.id, id))!
        );

      return {
        members_used: Number(stats?.members_used || 0),
        projects_used: Number(stats?.projects_used || 0),
        storage_used: Number(stats?.storage_used || 0),
      };
    } catch (error) {
      throw this.handleDatabaseError(error, 'getUsageStats');
    }
  }

  async canAddMember(organizationId: string): Promise<boolean> {
    if (this.checkBuildTime()) {
      return true;
    }

    try {
      const org = await this.findById(organizationId);
      if (!org) {
        return false;
      }

      const { members_used } = await this.getUsageStats(organizationId);
      const settings = org.settings ? JSON.parse(org.settings) : {};
      const memberLimit = settings.limits?.members || 10;

      return members_used < memberLimit;
    } catch (error) {
      throw this.handleDatabaseError(error, 'canAddMember');
    }
  }

  async canAddProject(organizationId: string): Promise<boolean> {
    if (this.checkBuildTime()) {
      return true;
    }

    try {
      const org = await this.findById(organizationId);
      if (!org) {
        return false;
      }

      const { projects_used } = await this.getUsageStats(organizationId);
      const settings = org.settings ? JSON.parse(org.settings) : {};
      const projectLimit = settings.limits?.projects || 5;

      return projects_used < projectLimit;
    } catch (error) {
      throw this.handleDatabaseError(error, 'canAddProject');
    }
  }

  async validateMemberQuota(organizationId: string): Promise<void> {
    const canAdd = await this.canAddMember(organizationId);
    if (!canAdd) {
      const org = await this.findById(organizationId);
      const stats = await this.getUsageStats(organizationId);
      const settings = org?.settings ? JSON.parse(org.settings) : {};
      const limit = settings.limits?.members || 10;

      throw new QuotaExceededError(
        `Member quota exceeded for organization ${organizationId}`,
        organizationId,
        'members',
        stats.members_used,
        limit
      );
    }
  }

  async validateProjectQuota(organizationId: string): Promise<void> {
    const canAdd = await this.canAddProject(organizationId);
    if (!canAdd) {
      const org = await this.findById(organizationId);
      const stats = await this.getUsageStats(organizationId);
      const settings = org?.settings ? JSON.parse(org.settings) : {};
      const limit = settings.limits?.projects || 5;

      throw new QuotaExceededError(
        `Project quota exceeded for organization ${organizationId}`,
        organizationId,
        'projects',
        stats.projects_used,
        limit
      );
    }
  }

  private handleDatabaseError(
    error: unknown,
    operation: string
  ): DatabaseError {
    const err = error as {
      code?: string;
      message?: string;
      constraint?: string;
    };

    logger.error('Organization database operation failed', {
      operation,
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
