export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  memberCount: number;
  maxMembers: number;
  ownerId: string;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  status: MemberStatus;
  isActive: boolean;
  customPermissions?: Record<string, boolean>;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export type MemberRole = 'owner' | 'admin' | 'member';
export type MemberStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  role: MemberRole;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  organization: Organization;
}

export interface OrganizationStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  storageUsed: number;
  storageLimit: number;
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  website?: string;
  logo?: string;
}
