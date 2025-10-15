export interface SendInvitationDTO {
  organizationId: string;
  email: string;
  role: string;
  message?: string;
}

export interface SendInvitationResult {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: Date;
}
