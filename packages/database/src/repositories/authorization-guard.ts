// packages/database/src/repositories/authorization-guard.ts
// ============================================
// AUTHORIZATION GUARD - ENTERPRISE PERMISSION VALIDATION
// ============================================

import { and, eq } from 'drizzle-orm';
import type { Database } from '../connection';
import { tenantContext } from '../connection/tenant-context';
import type { MemberRole, Membership } from '../schemas/business';
import { memberships } from '../schemas/business';

export class ForbiddenError extends Error {
  constructor(
    message: string,
    public readonly userId?: string,
    public readonly organizationId?: string,
    public readonly permission?: string
  ) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class AuthorizationGuard {
  constructor(private readonly db: Database) {}

  /**
   * Verifica se usuário tem permissão específica em uma organização
   */
  async hasPermission(
    userId: string,
    organizationId: string,
    permission: keyof Pick<
      Membership,
      | 'can_invite'
      | 'can_manage_projects'
      | 'can_manage_members'
      | 'can_manage_billing'
      | 'can_manage_settings'
      | 'can_delete_organization'
    >
  ): Promise<boolean> {
    const { tenantId } = tenantContext.getContext();

    const [membership] = await this.db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.tenant_id, tenantId),
          eq(memberships.user_id, userId),
          eq(memberships.organization_id, organizationId),
          eq(memberships.status, 'active')
        )
      )
      .limit(1);

    if (!membership) {
      return false;
    }

    // Owners e admins têm todas as permissões
    if (membership.role === 'owner' || membership.role === 'admin') {
      return true;
    }

    return membership[permission] === true;
  }

  /**
   * Requer permissão - lança ForbiddenError se não tiver
   */
  async requirePermission(
    userId: string,
    organizationId: string,
    permission: keyof Pick<
      Membership,
      | 'can_invite'
      | 'can_manage_projects'
      | 'can_manage_members'
      | 'can_manage_billing'
      | 'can_manage_settings'
      | 'can_delete_organization'
    >
  ): Promise<void> {
    const allowed = await this.hasPermission(
      userId,
      organizationId,
      permission
    );

    if (!allowed) {
      throw new ForbiddenError(
        `User does not have permission: ${permission}`,
        userId,
        organizationId,
        permission
      );
    }
  }

  /**
   * Verifica se usuário pode gerenciar tipo de recurso
   */
  async canManageResource(
    userId: string,
    organizationId: string,
    resourceType: 'projects' | 'members' | 'billing' | 'settings'
  ): Promise<boolean> {
    const permissionMap = {
      projects: 'can_manage_projects' as const,
      members: 'can_manage_members' as const,
      billing: 'can_manage_billing' as const,
      settings: 'can_manage_settings' as const,
    };

    return this.hasPermission(
      userId,
      organizationId,
      permissionMap[resourceType]
    );
  }

  /**
   * Requer gerenciamento de recurso
   */
  async requireManageResource(
    userId: string,
    organizationId: string,
    resourceType: 'projects' | 'members' | 'billing' | 'settings'
  ): Promise<void> {
    const allowed = await this.canManageResource(
      userId,
      organizationId,
      resourceType
    );

    if (!allowed) {
      throw new ForbiddenError(
        `User cannot manage ${resourceType}`,
        userId,
        organizationId,
        `can_manage_${resourceType}`
      );
    }
  }

  /**
   * Verifica se usuário tem role mínima requerida
   */
  async hasMinimumRole(
    userId: string,
    organizationId: string,
    minimumRole: MemberRole
  ): Promise<boolean> {
    const { tenantId } = tenantContext.getContext();

    const roleHierarchy: Record<MemberRole, number> = {
      owner: 5,
      admin: 4,
      manager: 3,
      member: 2,
      viewer: 1,
    };

    const [membership] = await this.db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.tenant_id, tenantId),
          eq(memberships.user_id, userId),
          eq(memberships.organization_id, organizationId),
          eq(memberships.status, 'active')
        )
      )
      .limit(1);

    if (!membership) {
      return false;
    }

    return roleHierarchy[membership.role] >= roleHierarchy[minimumRole];
  }

  /**
   * Requer role mínima
   */
  async requireMinimumRole(
    userId: string,
    organizationId: string,
    minimumRole: MemberRole
  ): Promise<void> {
    const allowed = await this.hasMinimumRole(
      userId,
      organizationId,
      minimumRole
    );

    if (!allowed) {
      throw new ForbiddenError(
        `User must have minimum role: ${minimumRole}`,
        userId,
        organizationId,
        `role:${minimumRole}`
      );
    }
  }

  /**
   * Verifica se usuário é owner da organização
   */
  async isOwner(userId: string, organizationId: string): Promise<boolean> {
    const { tenantId } = tenantContext.getContext();

    const [membership] = await this.db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.tenant_id, tenantId),
          eq(memberships.user_id, userId),
          eq(memberships.organization_id, organizationId),
          eq(memberships.role, 'owner'),
          eq(memberships.status, 'active')
        )
      )
      .limit(1);

    return !!membership;
  }

  /**
   * Requer ownership
   */
  async requireOwner(userId: string, organizationId: string): Promise<void> {
    const isOwner = await this.isOwner(userId, organizationId);

    if (!isOwner) {
      throw new ForbiddenError(
        'Only organization owner can perform this action',
        userId,
        organizationId,
        'role:owner'
      );
    }
  }

  /**
   * Verifica se usuário é membro ativo
   */
  async isActiveMember(
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    const { tenantId } = tenantContext.getContext();

    const [membership] = await this.db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.tenant_id, tenantId),
          eq(memberships.user_id, userId),
          eq(memberships.organization_id, organizationId),
          eq(memberships.status, 'active')
        )
      )
      .limit(1);

    return !!membership;
  }

  /**
   * Requer membership ativo
   */
  async requireActiveMember(
    userId: string,
    organizationId: string
  ): Promise<void> {
    const isActive = await this.isActiveMember(userId, organizationId);

    if (!isActive) {
      throw new ForbiddenError(
        'User must be an active member of the organization',
        userId,
        organizationId
      );
    }
  }

  /**
   * Obtém membership do usuário (com cache potencial)
   */
  async getMembership(
    userId: string,
    organizationId: string
  ): Promise<Membership | null> {
    const { tenantId } = tenantContext.getContext();

    const [membership] = await this.db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.tenant_id, tenantId),
          eq(memberships.user_id, userId),
          eq(memberships.organization_id, organizationId)
        )
      )
      .limit(1);

    return membership || null;
  }

  /**
   * Valida operação em recurso (owner ou permissão específica)
   */
  async validateResourceOperation(
    userId: string,
    organizationId: string,
    operation: 'create' | 'read' | 'update' | 'delete',
    resourceType: 'projects' | 'members' | 'billing' | 'settings'
  ): Promise<void> {
    // Read é permitido para todos membros ativos
    if (operation === 'read') {
      await this.requireActiveMember(userId, organizationId);
      return;
    }

    // Outras operações requerem permissão específica
    await this.requireManageResource(userId, organizationId, resourceType);
  }
}
