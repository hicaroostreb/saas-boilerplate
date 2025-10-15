import { Organization } from '../../../domain/entities/Organization';
import type { OrganizationRepositoryPort } from '../../../domain/ports/OrganizationRepositoryPort';
import type {
  CreateOrganizationDTO,
  CreateOrganizationResult,
} from '../../dto/organization/CreateOrganizationDTO';

export class CreateOrganizationHandler {
  constructor(private orgRepo: OrganizationRepositoryPort) {}

  public async execute(
    data: CreateOrganizationDTO,
    ownerId: string
  ): Promise<CreateOrganizationResult> {
    // ✅ Verificar se slug já existe
    const slugExists = await this.orgRepo.existsBySlug(data.slug);
    if (slugExists) {
      throw new Error('Organization slug already exists');
    }

    // ✅ Criar entidade Organization
    const organization = Organization.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      ownerId,
    });

    // ✅ Persistir no repositório
    const createdOrg = await this.orgRepo.create(organization);

    return {
      id: createdOrg.id,
      name: createdOrg.name,
      slug: createdOrg.slug,
      ownerId: createdOrg.ownerId,
      isActive: createdOrg.isActive,
    };
  }
}
