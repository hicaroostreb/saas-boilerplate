import type { SessionRepositoryPort } from '../../domain/ports/SessionRepositoryPort';
import { SessionRepository } from '../../adapters/repositories/session.repository';
import type { EnhancedSessionData } from '../../types/session.types';

/**
 * Adaptador para SessionRepository implementando SessionRepositoryPort
 */
export class DrizzleSessionRepository implements SessionRepositoryPort {
  private sessionRepo: SessionRepository;

  constructor() {
    this.sessionRepo = new SessionRepository();
  }

  async findByToken(token: string): Promise<EnhancedSessionData | null> {
    return this.sessionRepo.findByToken(token);
  }

  async revoke(token: string, revokedBy: string, reason = 'user_request'): Promise<void> {
    return this.sessionRepo.revoke(token, revokedBy, reason);
  }

  async revokeAllForUser(
    userId: string, 
    exceptToken?: string, 
    revokedBy = 'system', 
    reason = 'password_reset'
  ): Promise<number> {
    return this.sessionRepo.revokeAllForUser(userId, exceptToken, revokedBy, reason);
  }
}
