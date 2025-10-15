// packages/database/src/entities/business/membership.entity.ts
// ============================================
// MEMBERSHIP ENTITY - ENTERPRISE RBAC MODEL
// ============================================

import type {
  MemberRole,
  Membership,
  MemberStatus,
} from '../../schemas/business';

export type MemberPermission =
  | 'can_invite'
  | 'can_manage_projects'
  | 'can_manage_members'
  | 'can_manage_billing'
  | 'can_manage_settings'
  | 'can_delete_organization';

export type ResourceType =
  | 'projects'
  | 'members'
  | 'billing'
  | 'settings'
  | 'organization';

export class MembershipEntity {
  private readonly membership: Membership;

  constructor(membership: Membership) {
    this.membership = membership;
  }

  get userId(): string {
    return this.membership.user_id;
  }

  get organizationId(): string {
    return this.membership.organization_id;
  }

  get tenantId(): string {
    return this.membership.tenant_id;
  }

  get role(): MemberRole {
    return this.membership.role;
  }

  get status(): MemberStatus {
    return this.membership.status;
  }

  get isActive(): boolean {
    return this.membership.status === 'active';
  }

  get createdAt(): Date {
    return this.membership.created_at;
  }

  isOwner(): boolean {
    return this.membership.role === 'owner';
  }

  isAdmin(): boolean {
    return this.membership.role === 'admin';
  }

  isManager(): boolean {
    return this.membership.role === 'manager';
  }

  hasMinimumRole(minimumRole: MemberRole): boolean {
    const roleHierarchy: Record<MemberRole, number> = {
      owner: 5,
      admin: 4,
      manager: 3,
      member: 2,
      viewer: 1,
    };

    return roleHierarchy[this.membership.role] >= roleHierarchy[minimumRole];
  }

  hasPermission(permission: MemberPermission): boolean {
    if (this.membership.role === 'owner' || this.membership.role === 'admin') {
      return true;
    }

    return this.membership[permission] === true;
  }

  canManageResource(resource: ResourceType): boolean {
    if (this.membership.role === 'owner' || this.membership.role === 'admin') {
      return true;
    }

    const permissionMap: Record<ResourceType, MemberPermission> = {
      projects: 'can_manage_projects',
      members: 'can_manage_members',
      billing: 'can_manage_billing',
      settings: 'can_manage_settings',
      organization: 'can_delete_organization',
    };

    return this.hasPermission(permissionMap[resource]);
  }

  canInvite(): boolean {
    return this.hasPermission('can_invite');
  }

  canDeleteOrganization(): boolean {
    return this.membership.role === 'owner';
  }

  canManageRole(targetRole: MemberRole): boolean {
    if (!this.hasPermission('can_manage_members')) {
      return false;
    }

    const roleHierarchy: Record<MemberRole, number> = {
      owner: 5,
      admin: 4,
      manager: 3,
      member: 2,
      viewer: 1,
    };

    return roleHierarchy[this.membership.role] > roleHierarchy[targetRole];
  }

  isExpired(): boolean {
    return (
      this.membership.status === 'inactive' ||
      this.membership.status === 'suspended'
    );
  }

  toDatabase(): Membership {
    return this.membership;
  }

  toPublic() {
    return {
      user_id: this.membership.user_id,
      organization_id: this.membership.organization_id,
      role: this.membership.role,
      status: this.membership.status,
      title: this.membership.title,
      department: this.membership.department,
      created_at: this.membership.created_at,
      accepted_at: this.membership.accepted_at,
    };
  }

  static fromDatabase(membership: Membership): MembershipEntity {
    return new MembershipEntity(membership);
  }

  static create(data: {
    user_id: string;
    organization_id: string;
    tenant_id: string;
    role?: MemberRole;
    invited_by?: string;
    title?: string;
    department?: string;
  }): MembershipEntity {
    const now = new Date();

    const membership: Membership = {
      user_id: data.user_id,
      organization_id: data.organization_id,
      tenant_id: data.tenant_id,
      role: data.role || 'member',
      can_invite: false,
      can_manage_projects: false,
      can_manage_members: false,
      can_manage_billing: false,
      can_manage_settings: false,
      can_delete_organization: false,
      status: 'active',
      invited_by: data.invited_by || null,
      invited_at: now,
      accepted_at: now,
      last_activity_at: null,
      title: data.title || null,
      department: data.department || null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    return new MembershipEntity(membership);
  }

  changeRole(newRole: MemberRole): MembershipEntity {
    const permissions = this.getDefaultPermissionsForRole(newRole);

    return new MembershipEntity({
      ...this.membership,
      role: newRole,
      ...permissions,
      updated_at: new Date(),
    });
  }

  activate(): MembershipEntity {
    return new MembershipEntity({
      ...this.membership,
      status: 'active',
      accepted_at: new Date(),
      updated_at: new Date(),
    });
  }

  suspend(): MembershipEntity {
    return new MembershipEntity({
      ...this.membership,
      status: 'suspended',
      updated_at: new Date(),
    });
  }

  updateActivity(): MembershipEntity {
    return new MembershipEntity({
      ...this.membership,
      last_activity_at: new Date(),
      updated_at: new Date(),
    });
  }

  private getDefaultPermissionsForRole(role: MemberRole) {
    const permissionPresets: Record<MemberRole, Partial<Membership>> = {
      owner: {
        can_invite: true,
        can_manage_projects: true,
        can_manage_members: true,
        can_manage_billing: true,
        can_manage_settings: true,
        can_delete_organization: true,
      },
      admin: {
        can_invite: true,
        can_manage_projects: true,
        can_manage_members: true,
        can_manage_billing: true,
        can_manage_settings: true,
        can_delete_organization: false,
      },
      manager: {
        can_invite: true,
        can_manage_projects: true,
        can_manage_members: false,
        can_manage_billing: false,
        can_manage_settings: false,
        can_delete_organization: false,
      },
      member: {
        can_invite: false,
        can_manage_projects: false,
        can_manage_members: false,
        can_manage_billing: false,
        can_manage_settings: false,
        can_delete_organization: false,
      },
      viewer: {
        can_invite: false,
        can_manage_projects: false,
        can_manage_members: false,
        can_manage_billing: false,
        can_manage_settings: false,
        can_delete_organization: false,
      },
    };

    return permissionPresets[role];
  }
}
