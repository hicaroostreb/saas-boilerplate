// packages/database/src/entities/business/organization.entity.ts
// ============================================
// ORGANIZATION ENTITY - ENTERPRISE DOMAIN MODEL
// ============================================

import type { Organization, OrganizationPlan } from '../../schemas/business';

export interface OrganizationLimits {
  members: number;
  projects: number;
  storage: number;
}

export interface OrganizationUsage {
  members_used: number;
  projects_used: number;
  storage_used: number;
}

export interface OrganizationQuotaStatus {
  canAddMember: boolean;
  canAddProject: boolean;
  memberUsage: number;
  memberLimit: number;
  projectUsage: number;
  projectLimit: number;
}

export class OrganizationEntity {
  private readonly organization: Organization;

  constructor(organization: Organization) {
    this.organization = organization;
  }

  get id(): string {
    return this.organization.id;
  }

  get tenantId(): string {
    return this.organization.tenant_id;
  }

  get name(): string {
    return this.organization.name;
  }

  get slug(): string {
    return this.organization.slug;
  }

  get ownerId(): string {
    return this.organization.owner_id;
  }

  get planType(): OrganizationPlan {
    return this.organization.plan_type;
  }

  get isActive(): boolean {
    return this.organization.is_active;
  }

  get isVerified(): boolean {
    return this.organization.is_verified;
  }

  get createdAt(): Date {
    return this.organization.created_at;
  }

  getLimits(): OrganizationLimits {
    const settings = this.organization.settings
      ? JSON.parse(this.organization.settings)
      : {};

    const planLimits: Record<OrganizationPlan, OrganizationLimits> = {
      free: { members: 3, projects: 2, storage: 100 },
      starter: { members: 10, projects: 10, storage: 1000 },
      professional: { members: 50, projects: 50, storage: 10000 },
      enterprise: { members: 999, projects: 999, storage: 100000 },
      custom: { members: 999, projects: 999, storage: 999999 },
    };

    return {
      members: settings.limits?.members || planLimits[this.planType].members,
      projects: settings.limits?.projects || planLimits[this.planType].projects,
      storage: settings.limits?.storage || planLimits[this.planType].storage,
    };
  }

  canAddMember(currentUsage: number): boolean {
    const limits = this.getLimits();
    return currentUsage < limits.members;
  }

  canAddProject(currentUsage: number): boolean {
    const limits = this.getLimits();
    return currentUsage < limits.projects;
  }

  hasStorageAvailable(currentUsage: number, requiredMB: number): boolean {
    const limits = this.getLimits();
    return currentUsage + requiredMB <= limits.storage;
  }

  isOnPlan(plan: OrganizationPlan): boolean {
    return this.organization.plan_type === plan;
  }

  isPlanExpired(): boolean {
    if (!this.organization.plan_expires_at) return false;
    return new Date() > this.organization.plan_expires_at;
  }

  isTrialActive(): boolean {
    if (!this.organization.trial_ends_at) return false;
    return new Date() < this.organization.trial_ends_at;
  }

  getDaysUntilTrialEnd(): number {
    if (!this.organization.trial_ends_at) return 0;
    const now = new Date();
    const trialEnd = this.organization.trial_ends_at;
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getQuotaStatus(usage: OrganizationUsage): OrganizationQuotaStatus {
    const limits = this.getLimits();

    return {
      canAddMember: usage.members_used < limits.members,
      canAddProject: usage.projects_used < limits.projects,
      memberUsage: usage.members_used,
      memberLimit: limits.members,
      projectUsage: usage.projects_used,
      projectLimit: limits.projects,
    };
  }

  needsUpgrade(usage: OrganizationUsage): boolean {
    const limits = this.getLimits();
    return (
      usage.members_used >= limits.members ||
      usage.projects_used >= limits.projects
    );
  }

  toDatabase(): Organization {
    return this.organization;
  }

  toPublic() {
    return {
      id: this.organization.id,
      name: this.organization.name,
      slug: this.organization.slug,
      description: this.organization.description,
      logo_url: this.organization.logo_url,
      banner_url: this.organization.banner_url,
      brand_color: this.organization.brand_color,
      website: this.organization.website,
      is_public: this.organization.is_public,
      is_verified: this.organization.is_verified,
      plan_type: this.organization.plan_type,
      created_at: this.organization.created_at,
    };
  }

  static fromDatabase(organization: Organization): OrganizationEntity {
    return new OrganizationEntity(organization);
  }

  static create(
    data: Partial<Organization> & {
      tenant_id: string;
      name: string;
      slug: string;
      owner_id: string;
    }
  ): OrganizationEntity {
    const now = new Date();

    const organization: Organization = {
      id: data.id || crypto.randomUUID(),
      tenant_id: data.tenant_id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      domain: data.domain || null,
      website: data.website || null,
      logo_url: data.logo_url || null,
      banner_url: data.banner_url || null,
      brand_color: data.brand_color || null,
      is_public: data.is_public ?? false,
      allow_join_requests: data.allow_join_requests ?? false,
      require_approval: data.require_approval ?? true,
      settings: data.settings || null,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
      address_street: data.address_street || null,
      address_city: data.address_city || null,
      address_state: data.address_state || null,
      address_zip_code: data.address_zip_code || null,
      address_country: data.address_country || null,
      tax_id: data.tax_id || null,
      industry: data.industry || null,
      company_size: data.company_size || null,
      plan_type: data.plan_type || 'free',
      billing_email: data.billing_email || null,
      plan_started_at: data.plan_started_at || now,
      plan_expires_at: data.plan_expires_at || null,
      trial_ends_at: data.trial_ends_at || null,
      owner_id: data.owner_id,
      is_active: data.is_active ?? true,
      is_verified: data.is_verified ?? false,
      created_at: data.created_at || now,
      updated_at: data.updated_at || now,
      deleted_at: data.deleted_at || null,
    };

    return new OrganizationEntity(organization);
  }

  upgradePlan(newPlan: OrganizationPlan): OrganizationEntity {
    return new OrganizationEntity({
      ...this.organization,
      plan_type: newPlan,
      plan_started_at: new Date(),
      updated_at: new Date(),
    });
  }

  verify(): OrganizationEntity {
    return new OrganizationEntity({
      ...this.organization,
      is_verified: true,
      updated_at: new Date(),
    });
  }

  deactivate(): OrganizationEntity {
    return new OrganizationEntity({
      ...this.organization,
      is_active: false,
      updated_at: new Date(),
    });
  }

  updateSettings(settings: Record<string, any>): OrganizationEntity {
    return new OrganizationEntity({
      ...this.organization,
      settings: JSON.stringify(settings),
      updated_at: new Date(),
    });
  }
}
