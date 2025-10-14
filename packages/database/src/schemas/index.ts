// packages/database/src/schemas/index.ts
// ============================================
// SCHEMAS MAIN BARREL EXPORTS - ENTERPRISE (COMPLETE FIXED)
// ============================================

// Auth schemas
export {
  accounts,
  sessions,
  user_role_enum,
  user_status_enum,
  users, verification_token_type_enum, verification_tokens, type Account,
  type CreateAccount,
  type CreateSession,
  type CreateUser,
  type CreateVerificationToken,
  type PublicUser,
  type Session,
  type User,
  type UserProfile,
  type UserRole,
  type UserStatus,
  type VerificationToken,
  type VerificationTokenType
} from './auth';

// Business schemas  
export {
  company_size_enum,
  contact_priority_enum,
  contact_source_enum,
  contact_status_enum,
  contacts,
  invitation_status_enum,
  invitations,
  member_role_enum,
  member_status_enum,
  memberships,
  organization_industry_enum,
  organization_plan_enum,
  organizations,
  project_priority_enum,
  project_status_enum,
  project_visibility_enum,
  projects,
  type CompanySize,
  type Contact,
  type ContactPriority,
  type ContactSource,
  type ContactStatus,
  type CreateContact,
  type CreateInvitation,
  type CreateMembership,
  type CreateOrganization,
  type CreateProject,
  type Invitation,
  type InvitationStatus,
  type MemberRole,
  type MemberStatus,
  type Membership,
  type Organization,
  type OrganizationIndustry,
  type OrganizationPlan,
  type Project,
  type ProjectPriority,
  type ProjectStatus,
  type ProjectVisibility,
} from './business';

// Activity schemas
export {
  activity_logs,
  activity_type_enum,
  activity_resource_enum,
  type ActivityLog,
  type ActivityType,
  type ActivityResource,
  type CreateActivityLog
} from './activity';

// Security schemas - FIXED: ADDED MISSING password_reset_status_enum
export {
  auth_audit_logs,
  auth_event_type_enum,
  auth_risk_level_enum,
  password_reset_status_enum,  // <-- ESTAVA FALTANDO ESTA LINHA!
  password_reset_tokens,
  rate_limit_type_enum,
  rate_limit_window_enum,
  rate_limits,
  type AuthAuditLog,
  type AuthEventType,
  type AuthRiskLevel,
  type CreateAuthAuditLog,
  type CreatePasswordResetToken,
  type CreateRateLimit,
  type PasswordResetStatus,     // <-- TAMBÉM FALTAVA O TYPE!
  type PasswordResetToken,
  type RateLimit,
  type RateLimitResult,
  type RateLimitType,
  type RateLimitWindow
} from './security';
