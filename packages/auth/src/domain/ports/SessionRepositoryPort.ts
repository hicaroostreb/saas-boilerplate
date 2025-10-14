import type { EnhancedSessionData } from '../../types/session.types';

export interface SessionRepositoryPort {
  findByToken(token: string): Promise<EnhancedSessionData | null>;
  revoke(token: string, revokedBy: string, reason?: string): Promise<void>;
  revokeAllForUser(userId: string, exceptToken?: string, revokedBy?: string, reason?: string): Promise<number>;
}
