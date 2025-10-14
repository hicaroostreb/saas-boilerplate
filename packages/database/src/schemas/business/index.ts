// packages/database/src/schemas/business/index.ts
// ============================================
// BUSINESS SCHEMAS BARREL EXPORTS - ENTERPRISE
// ============================================

// Organization schema exports
export {
  organizations,
  organization_plan_enum,
  organization_industry_enum,
  company_size_enum,
} from './organization.schema';

export type {
  Organization,
  CreateOrganization,
  UpdateOrganization,
  PublicOrganization,
  OrganizationWithStats,
  OrganizationLimits,
  OrganizationPlan,
  OrganizationIndustry,
  CompanySize,
} from './organization.schema';

export {
  isOrganizationActive,
  canJoinOrganization,
  getOrganizationDisplayName,
  calculateStorageUsagePercentage,
  isStorageLimitExceeded,
  getMemberLimitRemaining,
  getProjectLimitRemaining,
  getPlanLimits,
  canUpgradePlan,
  formatStorageSize,
} from './organization.schema';

// Membership schema exports
export {
  memberships,
  member_role_enum,
  member_status_enum,
} from './membership.schema';

export type {
  Membership,
  CreateMembership,
  UpdateMembership,
  MembershipWithUser,
  MembershipWithOrganization,
  MembershipSummary,
  MemberRole,
  MemberStatus,
  RolePermissions,
} from './membership.schema';

export {
  ROLE_HIERARCHY,
  DEFAULT_ROLE_PERMISSIONS,
  isMembershipActive,
  canManageRole,
  canAssignRole,
  hasPermission,
  getRolePermissions,
  isHigherRole,
  getHighestRole,
  canInviteMembers,
  canManageProjects,
  canManageMembers,
  canManageBilling,
  canManageSettings,
  canDeleteOrganization,
  validateMembershipUpdate,
  shouldUpdateActivity,
  getMembershipDuration,
  formatMembershipDuration,
} from './membership.schema';

// Project schema exports
export {
  projects,
  project_status_enum,
  project_priority_enum,
  project_visibility_enum,
} from './project.schema';

export type {
  Project,
  CreateProject,
  UpdateProject,
  ProjectWithOwner,
  ProjectWithStats,
  ProjectSummary,
  ProjectFilters,
  ProjectStatus,
  ProjectPriority,
  ProjectVisibility,
} from './project.schema';

export {
  isProjectActive,
  isProjectCompleted,
  isProjectOverdue,
  isProjectArchived,
  canUserViewProject,
  getProjectProgress,
  updateProjectProgress,
  getProjectDuration,
  getProjectDurationDays,
  getDaysUntilDue,
  getProjectPhase,
  formatBudget,
  isBudgetSet,
  parseProjectTags,
  serializeProjectTags,
  hasTag as hasProjectTag,
  incrementViewCount,
  shouldUpdateViewCount,
  generateProjectSlug,
  canTransitionToStatus as canTransitionProjectStatus,
} from './project.schema';

// Contact schema exports
export {
  contacts,
  contact_type_enum,
  contact_status_enum,
  contact_source_enum,
  contact_method_enum,
} from './contact.schema';

export type {
  Contact,
  CreateContact,
  UpdateContact,
  ContactWithOwner,
  ContactWithStats,
  ContactSummary,
  ContactFilters,
  ContactType,
  ContactStatus,
  ContactSource,
  ContactMethod,
} from './contact.schema';

export {
  isContactActive,
  getContactDisplayName,
  getContactInitials,
  getFullAddress,
  canSendEmail,
  canSendSMS,
  canSendMarketing,
  isFollowUpOverdue,
  getDaysUntilFollowUp,
  getDaysSinceLastContact,
  getDaysSinceCreated,
  parseContactTags,
  serializeContactTags,
  hasTag as hasContactTag,
  addTag,
  removeTag,
  validateContactData,
  getConversionPath,
  canConvertTo,
  getSearchableText,
  matchesSearchTerm,
} from './contact.schema';

// Invitation schema exports
export {
  invitations,
  invitation_status_enum,
  invitation_type_enum,
} from './invitation.schema';

export type {
  Invitation,
  CreateInvitation,
  UpdateInvitation,
  InvitationWithInviter,
  InvitationSummary,
  InvitationFilters,
  InvitationStatus,
  InvitationType,
  InvitationAnalytics,
  BulkInvitationData,
} from './invitation.schema';

export {
  isInvitationPending,
  isInvitationExpired,
  isInvitationAccepted,
  isInvitationDeclined,
  isInvitationCancelled,
  canInvitationBeAccepted,
  canInvitationBeCancelled,
  getTimeUntilExpiry,
  getHoursUntilExpiry,
  getDaysUntilExpiry,
  getTimeSinceSent,
  getDaysSinceSent,
  hasBeenViewed,
  getResponseTime,
  getResponseTimeHours,
  generateInvitationToken,
  calculateExpiryDate,
  getDefaultExpiryHours,
  validateInvitationEmail,
  canInviteEmail,
  canTransitionToStatus as canTransitionInvitationStatus,
  buildInvitationUrl,
  buildAcceptUrl,
  buildDeclineUrl,
  calculateAcceptanceRate,
  calculateDeclineRate,
  calculateExpiryRate,
  calculateViewRate,
  canResendInvitation,
  shouldAutoExpire,
  validateBulkInvitations,
  shouldSendReminder,
  getReminderType,
} from './invitation.schema';
