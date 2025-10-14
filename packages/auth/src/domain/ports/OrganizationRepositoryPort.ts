import { Organization } from '../entities/Organization';

export interface OrganizationRepositoryPort {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  create(organization: Organization): Promise<Organization>;
  existsBySlug(slug: string): Promise<boolean>;
  findByUserId(userId: string): Promise<Array<{
    organization: Organization;
    role: string;
    status: string;
  }>>;
}
