// ============================================
// BUSINESS SCHEMAS BARREL EXPORTS
// ============================================

// Table exports
export { contactStatusEnum, contactTypeEnum, contacts } from './contact.schema';
export {
  invitationStatusEnum,
  invitationTypeEnum,
  invitations,
} from './invitation.schema';
export {
  memberRoleEnum,
  memberStatusEnum,
  memberships,
} from './membership.schema';
export { organizations } from './organization.schema';
export {
  projectPriorityEnum,
  projectStatusEnum,
  projectVisibilityEnum,
  projects,
} from './project.schema';

// Type exports - Organizations
export type {
  CompanySize,
  CreateOrganization,
  Organization,
  OrganizationBilling,
  OrganizationProfile,
  OrganizationSettings,
  OrganizationWithOwner,
  PlanType,
  PublicOrganization,
} from './organization.schema';

// Type exports - Memberships
export type {
  CreateMembership,
  FullMembership,
  MemberPermissions,
  MemberRole,
  MemberStatus,
  Membership,
  MembershipWithOrganization,
  MembershipWithUser,
} from './membership.schema';

// Type exports - Invitations
export type {
  CreateInvitation,
  FullInvitation,
  Invitation,
  InvitationStatus,
  InvitationSummary,
  InvitationType,
  InvitationWithInviter,
  InvitationWithOrganization,
} from './invitation.schema';

// Type exports - Projects
export type {
  CreateProject,
  FullProject,
  Project,
  ProjectCard,
  ProjectPriority,
  ProjectStatus,
  ProjectSummary,
  ProjectVisibility,
  ProjectWithOrganization,
  ProjectWithOwner,
} from './project.schema';

// Type exports - Contacts
export type {
  Contact,
  ContactStatus,
  ContactSummary,
  ContactType,
  ContactWithAssignee,
  ContactWithCreator,
  ContactWithOrganization,
  CreateContact,
  FullContact,
} from './contact.schema';
