import { Invitation } from '../../../domain/entities/Invitation';
import type { InvitationRepositoryPort } from '../../../domain/ports/InvitationRepositoryPort';
import type { OrganizationRepositoryPort } from '../../../domain/ports/OrganizationRepositoryPort';
import type {
  SendInvitationDTO,
  SendInvitationResult,
} from '../../dto/organization/SendInvitationDTO';

export class SendInvitationHandler {
  constructor(
    private orgRepo: OrganizationRepositoryPort,
    private inviteRepo: InvitationRepositoryPort
  ) {}

  public async execute(
    data: SendInvitationDTO,
    invitedBy: string
  ): Promise<SendInvitationResult> {
    // ✅ Verificar se organização existe
    const organization = await this.orgRepo.findById(data.organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // ✅ Verificar se usuário tem permissão (por enquanto só owner)
    if (!organization.isOwnedBy(invitedBy)) {
      throw new Error('Only organization owner can send invitations');
    }

    // ✅ Criar convite
    const invitation = Invitation.create({
      organizationId: data.organizationId,
      invitedBy,
      email: data.email,
      role: data.role,
      message: data.message,
    });

    // ✅ Persistir convite
    const createdInvitation = await this.inviteRepo.create(invitation);

    return {
      id: createdInvitation.id,
      email: createdInvitation.email.value,
      role: createdInvitation.role,
      token: createdInvitation.token,
      expiresAt: createdInvitation.expiresAt,
    };
  }
}
