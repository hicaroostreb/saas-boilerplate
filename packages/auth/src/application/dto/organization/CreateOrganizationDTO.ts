export interface CreateOrganizationDTO {
  name: string;
  slug: string;
  description?: string;
}

export interface CreateOrganizationResult {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  isActive: boolean;
}
