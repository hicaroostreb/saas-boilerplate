import { User } from '../entities/User';

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
  create(user: User, passwordHash: string): Promise<User>;
  updateLastLogin(userId: string): Promise<void>;
  incrementLoginAttempts(userId: string): Promise<void>;
}
