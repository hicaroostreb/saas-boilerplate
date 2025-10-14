import type { InvitationRepositoryPort } from '../../domain/ports/InvitationRepositoryPort';
import { Invitation } from '../../domain/entities/Invitation';
import {
  and,
  eq,
  getDb,
  invitations,
  type CreateInvitation,
} from '@workspace/database';

/**
 * Implementação concreta do InvitationRepositoryPort usando Drizzle
 */
export class DrizzleInvitationRepository implements InvitationRepositoryPort {
  async create(invitation: Invitation): Promise<Invitation> {
    try {
      const db = await getDb();
      
      const createData: CreateInvitation = {
        id: invitation.id,
        organization_id: invitation.organizationId,
        invited_by: invitation.invitedBy,
        email: invitation.email.value,
        role: invitation.role,
        message: invitation.message,
        token: invitation.token,
        status: invitation.status as any,
        expires_at: invitation.expiresAt,
        created_at: invitation.createdAt,
        updated_at: invitation.updatedAt,
      };

      const [dbInvitation] = await db
        .insert(invitations)
        .values(createData)
        .returning();

      if (!dbInvitation) {
        throw new Error('Failed to create invitation');
      }

      return this.mapToDomainEntity(dbInvitation);
    } catch (error) {
      console.error('❌ DrizzleInvitationRepository create error:', error);
      throw error;
    }
  }

  async findByToken(token: string): Promise<Invitation | null> {
    try {
      const db = await getDb();
      const [dbInvitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.token, token))
        .limit(1);

      return dbInvitation ? this.mapToDomainEntity(dbInvitation) : null;
    } catch (error) {
      console.error('❌ DrizzleInvitationRepository findByToken error:', error);
      return null;
    }
  }

  async findByOrganization(organizationId: string): Promise<Invitation[]> {
    try {
      const db = await getDb();
      const dbInvitations = await db
        .select()
        .from(invitations)
        .where(eq(invitations.organization_id, organizationId))
        .orderBy(invitations.created_at);

      return dbInvitations.map(invite => this.mapToDomainEntity(invite));
    } catch (error) {
      console.error('❌ DrizzleInvitationRepository findByOrganization error:', error);
      return [];
    }
  }

  async update(invitation: Invitation): Promise<Invitation> {
    try {
      const db = await getDb();
      
      const [updated] = await db
        .update(invitations)
        .set({
          status: invitation.status as any,
          updated_at: invitation.updatedAt,
        })
        .where(eq(invitations.id, invitation.id))
        .returning();

      if (!updated) {
        throw new Error('Invitation not found or update failed');
      }

      return this.mapToDomainEntity(updated);
    } catch (error) {
      console.error('❌ DrizzleInvitationRepository update error:', error);
      throw error;
    }
  }

  private mapToDomainEntity(dbInvitation: any): Invitation {
    return Invitation.reconstitute({
      id: dbInvitation.id,
      organizationId: dbInvitation.organization_id,
      invitedBy: dbInvitation.invited_by,
      email: dbInvitation.email,
      role: dbInvitation.role,
      message: dbInvitation.message,
      token: dbInvitation.token,
      status: dbInvitation.status,
      expiresAt: dbInvitation.expires_at,
      createdAt: dbInvitation.created_at,
      updatedAt: dbInvitation.updated_at,
    });
  }
}
