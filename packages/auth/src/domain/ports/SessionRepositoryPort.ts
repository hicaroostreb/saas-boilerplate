import type { EnhancedSessionData } from '../../types/session.types';
import type { Session } from '../entities/Session';

export interface SessionRepositoryPort {
  create(session: Session): Promise<void>;
  findByToken(token: string): Promise<EnhancedSessionData | null>;
  revoke(token: string, revokedBy: string, reason?: string): Promise<void>;
  revokeAllForUser(
    userId: string,
    exceptToken?: string,
    revokedBy?: string,
    reason?: string
  ): Promise<number>;
}
