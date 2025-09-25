// User-related types
export type UserRole = 'owner' | 'admin' | 'member';

export interface BaseUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
}
