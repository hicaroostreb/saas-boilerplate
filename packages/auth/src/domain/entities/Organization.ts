import { generateSecureId } from '../../utils/validation.utils';

export interface OrganizationProps {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string | null;
  ownerId: string;
  isActive: boolean;
  isVerified: boolean;
  planType: 'free' | 'starter' | 'professional' | 'enterprise' | 'custom';
  memberLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade Organization - Modelo rico com invariantes de domínio
 */
export class Organization {
  private constructor(private props: OrganizationProps) {}

  public static create(data: {
    name: string;
    slug: string;
    ownerId: string;
    tenantId?: string;
    description?: string;
  }): Organization {
    const now = new Date();

    return new Organization({
      id: generateSecureId(),
      tenantId: data.tenantId ?? generateSecureId(8),
      name: data.name.trim(),
      slug: data.slug.toLowerCase().trim(),
      description: data.description?.trim() ?? null,
      ownerId: data.ownerId,
      isActive: true,
      isVerified: false,
      planType: 'free',
      memberLimit: 10,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: OrganizationProps): Organization {
    return new Organization(props);
  }

  // Getters
  public get id(): string {
    return this.props.id;
  }
  public get tenantId(): string {
    return this.props.tenantId;
  }
  public get name(): string {
    return this.props.name;
  }
  public get slug(): string {
    return this.props.slug;
  }
  public get description(): string | null {
    return this.props.description ?? null;
  }
  public get ownerId(): string {
    return this.props.ownerId;
  }
  public get isActive(): boolean {
    return this.props.isActive;
  }
  public get isVerified(): boolean {
    return this.props.isVerified;
  }
  public get planType(): string {
    return this.props.planType;
  }
  public get memberLimit(): number {
    return this.props.memberLimit;
  }
  public get createdAt(): Date {
    return this.props.createdAt;
  }
  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business methods
  public canAddMember(currentMemberCount: number): boolean {
    return currentMemberCount < this.props.memberLimit;
  }

  public isOwnedBy(userId: string): boolean {
    return this.props.ownerId === userId;
  }

  public deactivate(): Organization {
    return new Organization({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  public updateDetails(data: {
    name?: string;
    description?: string;
  }): Organization {
    return new Organization({
      ...this.props,
      name: data.name?.trim() ?? this.props.name,
      description: data.description?.trim() ?? this.props.description,
      updatedAt: new Date(),
    });
  }

  public verify(): Organization {
    return new Organization({
      ...this.props,
      isVerified: true,
      updatedAt: new Date(),
    });
  }
}
