import { generateSecureId } from '../../utils/validation.utils';
import { Email } from '../value-objects/Email';

export interface InvitationProps {
  id: string;
  organizationId: string;
  invitedBy: string;
  email: Email;
  role: string;
  message?: string | null;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade Invitation - Convites para organizações
 */
export class Invitation {
  private constructor(private props: InvitationProps) {}

  public static create(data: {
    organizationId: string;
    invitedBy: string;
    email: string;
    role: string;
    message?: string;
    expiresInDays?: number;
  }): Invitation {
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays ?? 7));

    return new Invitation({
      id: generateSecureId(),
      organizationId: data.organizationId,
      invitedBy: data.invitedBy,
      email: Email.create(data.email),
      role: data.role,
      message: data.message?.trim() ?? null,
      token: generateSecureId(32),
      status: 'pending',
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: Omit<InvitationProps, 'email'> & { email: string }): Invitation {
    return new Invitation({
      ...props,
      email: Email.create(props.email),
    });
  }

  // Getters
  public get id(): string { return this.props.id; }
  public get organizationId(): string { return this.props.organizationId; }
  public get invitedBy(): string { return this.props.invitedBy; }
  public get email(): Email { return this.props.email; }
  public get role(): string { return this.props.role; }
  public get message(): string | null { return this.props.message; }
  public get token(): string { return this.props.token; }
  public get status(): string { return this.props.status; }
  public get expiresAt(): Date { return this.props.expiresAt; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  // Business methods
  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  public isPending(): boolean {
    return this.props.status === 'pending' && !this.isExpired();
  }

  public canBeAccepted(): boolean {
    return this.props.status === 'pending' && !this.isExpired();
  }

  public accept(acceptedBy: string): Invitation {
    if (!this.canBeAccepted()) {
      throw new Error('Invitation cannot be accepted');
    }

    return new Invitation({
      ...this.props,
      status: 'accepted',
      updatedAt: new Date(),
    });
  }

  public reject(): Invitation {
    if (!this.canBeAccepted()) {
      throw new Error('Invitation cannot be rejected');
    }

    return new Invitation({
      ...this.props,
      status: 'rejected',
      updatedAt: new Date(),
    });
  }

  public cancel(): Invitation {
    if (this.props.status !== 'pending') {
      throw new Error('Only pending invitations can be cancelled');
    }

    return new Invitation({
      ...this.props,
      status: 'cancelled',
      updatedAt: new Date(),
    });
  }
}
