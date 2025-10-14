import type { UserRepositoryPort } from '../../domain/ports/UserRepositoryPort';
import type { UserProfileDTO } from '../dto/UserProfileDTO';

export class GetUserProfileHandler {
  constructor(private userRepo: UserRepositoryPort) {}

  public async execute(userId: string): Promise<UserProfileDTO> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      isActive: user.isActive,
    };
  }
}
