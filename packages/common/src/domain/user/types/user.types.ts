// packages/common/src/domain/user/types/user.types.ts

/**
 * Roles disponíveis para usuários
 */
export type UserRole = 'owner' | 'admin' | 'member';

/**
 * Status de um usuário no sistema
 */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Entidade base de usuário
 */
export interface BaseUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  image: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Informações de time associado ao usuário
 */
export interface UserTeamInfo {
  id: number;
  name: string;
  memberCount: number;
  role: UserRole;
  joinedAt: Date;
}

/**
 * Usuário com informações completas de times
 */
export interface UserWithTeams extends BaseUser {
  ownedTeams: Array<{
    id: number;
    name: string;
    memberCount: number;
  }>;
  teamMemberships: Array<{
    teamId: number;
    teamName: string;
    role: string;
    joinedAt: Date;
  }>;
}

/**
 * Perfil público de usuário (dados seguros para exposição)
 */
export interface UserProfile {
  id: number;
  name: string | null;
  image: string | null;
  role: UserRole;
  joinedAt: Date;
}

/**
 * Dados para criação de usuário
 */
export interface CreateUserData {
  email: string;
  name: string;
  password?: string; // Opcional para OAuth
  role?: UserRole;
  image?: string;
}

/**
 * Dados para atualização de usuário
 */
export interface UpdateUserData {
  name?: string;
  image?: string;
  role?: UserRole;
  status?: UserStatus;
}
