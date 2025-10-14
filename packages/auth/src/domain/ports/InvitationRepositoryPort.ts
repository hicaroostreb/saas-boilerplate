import { Invitation } from '../entities/Invitation';

export interface InvitationRepositoryPort {
  create(invitation: Invitation): Promise<Invitation>;
  findByToken(token: string): Promise<Invitation | null>;
  findByOrganization(organizationId: string): Promise<Invitation[]>;
  update(invitation: Invitation): Promise<Invitation>;
}
