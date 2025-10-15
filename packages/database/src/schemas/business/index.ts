// packages/database/src/schemas/business/index.ts
// ============================================
// BUSINESS SCHEMAS BARREL EXPORTS (REFACTORED)
// ============================================

// Organization schema
export {
  company_size_enum,
  getOrganizationLimits,
  organization_industry_enum,
  organization_plan_enum,
  organizations,
  parseOrganizationSettings,
  serializeOrganizationSettings,
  type CompanySize,
  type CreateOrganization,
  type Organization,
  type OrganizationIndustry,
  type OrganizationPlan,
  type OrganizationSettings,
} from './organization.schema';

// Membership schema
export {
  canAccessResource,
  getRolePermissions,
  hasPermission,
  isActiveMember,
  member_role_enum,
  member_status_enum,
  memberships,
  type CreateMembership,
  type MemberRole,
  type MemberStatus,
  type Membership,
} from './membership.schema';

// Invitation schema
export {
  canInvitationBeAccepted,
  createInvitationExpiry,
  formatInvitationUrl,
  generateInvitationToken,
  getInvitationAge,
  getInvitationAgeInDays,
  getInvitationExpiryTime,
  invitation_status_enum,
  invitations,
  isInvitationExpired,
  isInvitationPending,
  shouldSendReminder,
  type CreateInvitation,
  type Invitation,
  type InvitationStatus,
} from './invitation.schema';

// Project schema
export {
  parseProjectCustomFields,
  parseProjectTags,
  project_priority_enum,
  project_status_enum,
  project_visibility_enum,
  projects,
  serializeProjectCustomFields,
  serializeProjectTags,
  type CreateProject,
  type Project,
  type ProjectPriority,
  type ProjectStatus,
  type ProjectVisibility,
} from './project.schema';

// Contact schema
export {
  contact_priority_enum,
  contact_source_enum,
  contact_status_enum,
  contacts,
  getDaysSinceLastContact,
  getFullContactInfo,
  isContactOverdue,
  parseContactCustomFields,
  parseContactTags,
  serializeContactCustomFields,
  serializeContactTags,
  type Contact,
  type ContactPriority,
  type ContactSource,
  type ContactStatus,
  type CreateContact,
} from './contact.schema';
