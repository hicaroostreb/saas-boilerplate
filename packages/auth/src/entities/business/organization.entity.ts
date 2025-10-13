export interface OrganizationEntity {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  logoUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
