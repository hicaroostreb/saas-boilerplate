-- Migration: 0001_initial_multi_tenant_schema
-- Description: Complete multi-tenant schema with RLS-ready structure
-- Created: 2025-10-15

-- ============================================
-- ENUMS
-- ============================================

-- User enums
CREATE TYPE "user_status" AS ENUM('active', 'inactive', 'suspended', 'pending');
CREATE TYPE "user_role" AS ENUM('super_admin', 'admin', 'member', 'viewer');

-- Organization enums
CREATE TYPE "organization_plan" AS ENUM('free', 'starter', 'professional', 'enterprise', 'custom');
CREATE TYPE "organization_industry" AS ENUM('technology', 'healthcare', 'finance', 'education', 'manufacturing', 'retail', 'consulting', 'nonprofit', 'government', 'other');
CREATE TYPE "company_size" AS ENUM('1-10', '11-50', '51-200', '201-1000', '1000+');

-- Membership enums
CREATE TYPE "member_role" AS ENUM('owner', 'admin', 'manager', 'member', 'viewer');
CREATE TYPE "member_status" AS ENUM('active', 'inactive', 'suspended', 'pending');

-- Invitation enums
CREATE TYPE "invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'expired', 'cancelled');

-- Project enums
CREATE TYPE "project_status" AS ENUM('active', 'inactive', 'completed', 'cancelled', 'on_hold');
CREATE TYPE "project_priority" AS ENUM('low', 'medium', 'high', 'urgent');
CREATE TYPE "project_visibility" AS ENUM('public', 'organization', 'private');

-- Contact enums
CREATE TYPE "contact_status" AS ENUM('active', 'inactive', 'lead', 'customer', 'archived');
CREATE TYPE "contact_source" AS ENUM('web', 'referral', 'import', 'manual', 'api', 'integration');
CREATE TYPE "contact_priority" AS ENUM('low', 'medium', 'high', 'urgent');

-- Security enums
CREATE TYPE "auth_event_type" AS ENUM('login_success', 'login_failure', 'logout', 'password_change', 'password_reset_request', 'password_reset_success', 'email_verification', 'phone_verification', 'account_locked', 'account_unlocked', 'two_factor_enabled', 'two_factor_disabled', 'session_expired', 'token_refresh', 'account_created', 'account_deleted', 'role_changed', 'permissions_changed');
CREATE TYPE "auth_risk_level" AS ENUM('low', 'medium', 'high', 'critical');
CREATE TYPE "password_reset_status" AS ENUM('active', 'used', 'expired', 'revoked');
CREATE TYPE "rate_limit_type" AS ENUM('api_request', 'login_attempt', 'password_reset', 'email_send', 'file_upload', 'search_query', 'export_data', 'invitation_send', 'contact_create', 'project_create');
CREATE TYPE "rate_limit_window" AS ENUM('minute', 'hour', 'day', 'month');

-- Verification token enums
CREATE TYPE "verification_token_type" AS ENUM('email_verification', 'phone_verification', 'password_reset', 'magic_link', 'two_factor');

-- Activity enums
CREATE TYPE "activity_type" AS ENUM('user_created', 'user_updated', 'user_deleted', 'user_login', 'user_logout', 'organization_created', 'organization_updated', 'organization_deleted', 'membership_created', 'membership_updated', 'membership_deleted', 'project_created', 'project_updated', 'project_deleted', 'contact_created', 'contact_updated', 'contact_deleted', 'invitation_sent', 'invitation_accepted', 'invitation_rejected', 'session_created', 'session_terminated');
CREATE TYPE "activity_resource" AS ENUM('user', 'organization', 'membership', 'project', 'contact', 'invitation', 'session');

-- ============================================
-- AUTH TABLES
-- ============================================

-- Users
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "image" TEXT,
  "email_verified" TIMESTAMP,
  "password_hash" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
  "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
  "last_login_at" TIMESTAMP,
  "last_login_ip" TEXT,
  "login_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMP,
  "first_name" TEXT,
  "last_name" TEXT,
  "avatar_url" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "locale" TEXT NOT NULL DEFAULT 'en',
  "phone" TEXT,
  "phone_verified_at" TIMESTAMP,
  "email_notifications" BOOLEAN NOT NULL DEFAULT true,
  "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
  "metadata" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP
);

CREATE INDEX "users_tenant_idx" ON "users"("tenant_id");
CREATE INDEX "users_tenant_email_idx" ON "users"("tenant_id", "email");
CREATE INDEX "users_tenant_active_idx" ON "users"("tenant_id", "is_active");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_active_idx" ON "users"("is_active");
CREATE INDEX "users_created_idx" ON "users"("created_at");
CREATE INDEX "users_deleted_idx" ON "users"("deleted_at");

-- ✅ ADICIONADO: Email único por tenant (soft delete aware)
CREATE UNIQUE INDEX "users_tenant_email_unique" 
  ON "users"("tenant_id", "email") 
  WHERE "deleted_at" IS NULL;

-- ✅ ADICIONADO: Index otimizado para superadmin
CREATE INDEX "users_super_admin_idx" 
  ON "users"("is_super_admin") 
  WHERE "is_super_admin" = true;

-- Sessions
CREATE TABLE "sessions" (
  "session_token" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "last_accessed_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ip_address" TEXT,
  "user_agent" TEXT,
  "device_type" TEXT,
  "device_name" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "location" TEXT
);

CREATE INDEX "sessions_tenant_user_idx" ON "sessions"("tenant_id", "user_id");
CREATE INDEX "sessions_tenant_expires_idx" ON "sessions"("tenant_id", "expires");
CREATE INDEX "sessions_user_idx" ON "sessions"("user_id");
CREATE INDEX "sessions_expires_idx" ON "sessions"("expires");

-- Accounts (OAuth)
CREATE TABLE "accounts" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "accounts_tenant_user_idx" ON "accounts"("tenant_id", "user_id");
CREATE INDEX "accounts_tenant_provider_idx" ON "accounts"("tenant_id", "provider");
CREATE INDEX "accounts_user_idx" ON "accounts"("user_id");
CREATE INDEX "accounts_provider_account_idx" ON "accounts"("provider", "provider_account_id");

-- Verification Tokens
CREATE TABLE "verification_tokens" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT,
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "type" "verification_token_type" NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  "used_at" TIMESTAMP,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "last_attempt_at" TIMESTAMP,
  "metadata" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "verification_tokens_tenant_identifier_idx" ON "verification_tokens"("tenant_id", "identifier");
CREATE INDEX "verification_tokens_token_idx" ON "verification_tokens"("token");
CREATE INDEX "verification_tokens_identifier_type_idx" ON "verification_tokens"("identifier", "type");
CREATE INDEX "verification_tokens_expires_idx" ON "verification_tokens"("expires");

-- ============================================
-- BUSINESS TABLES
-- ============================================

-- Organizations
CREATE TABLE "organizations" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "domain" TEXT,
  "website" TEXT,
  "logo_url" TEXT,
  "banner_url" TEXT,
  "brand_color" TEXT,
  "is_public" BOOLEAN NOT NULL DEFAULT false,
  "allow_join_requests" BOOLEAN NOT NULL DEFAULT false,
  "require_approval" BOOLEAN NOT NULL DEFAULT true,
  "settings" TEXT,
  "contact_email" TEXT,
  "contact_phone" TEXT,
  "address_street" TEXT,
  "address_city" TEXT,
  "address_state" TEXT,
  "address_zip_code" TEXT,
  "address_country" TEXT,
  "tax_id" TEXT,
  "industry" "organization_industry",
  "company_size" "company_size",
  "plan_type" "organization_plan" NOT NULL DEFAULT 'free',
  "billing_email" TEXT,
  "plan_started_at" TIMESTAMP,
  "plan_expires_at" TIMESTAMP,
  "trial_ends_at" TIMESTAMP,
  "owner_id" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP
);

CREATE INDEX "organizations_tenant_idx" ON "organizations"("tenant_id");
CREATE INDEX "organizations_tenant_active_idx" ON "organizations"("tenant_id", "is_active");
CREATE INDEX "organizations_tenant_plan_idx" ON "organizations"("tenant_id", "plan_type");
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");
CREATE INDEX "organizations_owner_idx" ON "organizations"("owner_id");
CREATE INDEX "organizations_domain_idx" ON "organizations"("domain");
CREATE INDEX "organizations_deleted_idx" ON "organizations"("deleted_at");

-- ✅ ADICIONADO: Slug único por tenant em organizations (soft delete aware)
CREATE UNIQUE INDEX "organizations_tenant_slug_unique" 
  ON "organizations"("tenant_id", "slug") 
  WHERE "deleted_at" IS NULL;

-- Memberships
CREATE TABLE "memberships" (
  "user_id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "tenant_id" TEXT NOT NULL,
  "role" "member_role" NOT NULL DEFAULT 'member',
  "can_invite" BOOLEAN NOT NULL DEFAULT false,
  "can_manage_projects" BOOLEAN NOT NULL DEFAULT false,
  "can_manage_members" BOOLEAN NOT NULL DEFAULT false,
  "can_manage_billing" BOOLEAN NOT NULL DEFAULT false,
  "can_manage_settings" BOOLEAN NOT NULL DEFAULT false,
  "can_delete_organization" BOOLEAN NOT NULL DEFAULT false,
  "status" "member_status" NOT NULL DEFAULT 'active',
  "invited_by" TEXT,
  "invited_at" TIMESTAMP,
  "accepted_at" TIMESTAMP,
  "last_activity_at" TIMESTAMP,
  "title" TEXT,
  "department" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP,
  PRIMARY KEY ("user_id", "organization_id")
);

CREATE INDEX "memberships_tenant_org_idx" ON "memberships"("tenant_id", "organization_id");
CREATE INDEX "memberships_tenant_user_idx" ON "memberships"("tenant_id", "user_id");
CREATE INDEX "memberships_tenant_org_role_idx" ON "memberships"("tenant_id", "organization_id", "role");
CREATE INDEX "memberships_tenant_org_status_idx" ON "memberships"("tenant_id", "organization_id", "status");
CREATE INDEX "memberships_org_idx" ON "memberships"("organization_id");
CREATE INDEX "memberships_user_idx" ON "memberships"("user_id");

-- Invitations
CREATE TABLE "invitations" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "invited_by" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "message" TEXT,
  "token" TEXT NOT NULL,
  "status" "invitation_status" NOT NULL DEFAULT 'pending',
  "accepted_by" TEXT,
  "accepted_at" TIMESTAMP,
  "rejected_at" TIMESTAMP,
  "expires_at" TIMESTAMP NOT NULL,
  "sent_at" TIMESTAMP,
  "reminder_sent_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "invitations_tenant_org_idx" ON "invitations"("tenant_id", "organization_id");
CREATE INDEX "invitations_tenant_email_idx" ON "invitations"("tenant_id", "email");
CREATE INDEX "invitations_tenant_org_status_idx" ON "invitations"("tenant_id", "organization_id", "status");
CREATE INDEX "invitations_token_idx" ON "invitations"("token");
CREATE INDEX "invitations_org_idx" ON "invitations"("organization_id");

-- Projects
CREATE TABLE "projects" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "status" "project_status" NOT NULL DEFAULT 'active',
  "priority" "project_priority" NOT NULL DEFAULT 'medium',
  "visibility" "project_visibility" NOT NULL DEFAULT 'organization',
  "color" TEXT,
  "icon" TEXT,
  "cover_image_url" TEXT,
  "owner_id" TEXT NOT NULL,
  "start_date" TIMESTAMP,
  "end_date" TIMESTAMP,
  "due_date" TIMESTAMP,
  "progress_percentage" INTEGER DEFAULT 0,
  "allow_comments" BOOLEAN NOT NULL DEFAULT true,
  "require_approval" BOOLEAN NOT NULL DEFAULT false,
  "enable_notifications" BOOLEAN NOT NULL DEFAULT true,
  "budget" INTEGER,
  "currency" TEXT DEFAULT 'USD',
  "external_url" TEXT,
  "repository_url" TEXT,
  "tags" TEXT,
  "custom_fields" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "view_count" INTEGER NOT NULL DEFAULT 0,
  "last_viewed_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "archived_at" TIMESTAMP,
  "deleted_at" TIMESTAMP
);

CREATE INDEX "projects_tenant_org_idx" ON "projects"("tenant_id", "organization_id");
CREATE INDEX "projects_tenant_org_status_idx" ON "projects"("tenant_id", "organization_id", "status");
CREATE INDEX "projects_tenant_owner_idx" ON "projects"("tenant_id", "owner_id");
CREATE INDEX "projects_org_idx" ON "projects"("organization_id");
CREATE INDEX "projects_deleted_idx" ON "projects"("deleted_at");

-- ✅ ADICIONADO: Slug único por organization em projects (soft delete aware)
CREATE UNIQUE INDEX "projects_org_slug_unique" 
  ON "projects"("organization_id", "slug") 
  WHERE "deleted_at" IS NULL;

-- Contacts
CREATE TABLE "contacts" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "company_name" TEXT,
  "job_title" TEXT,
  "department" TEXT,
  "website" TEXT,
  "linkedin_url" TEXT,
  "avatar_url" TEXT,
  "address_street" TEXT,
  "address_city" TEXT,
  "address_state" TEXT,
  "address_zip_code" TEXT,
  "address_country" TEXT,
  "tax_id" TEXT,
  "status" "contact_status" NOT NULL DEFAULT 'active',
  "source" "contact_source" NOT NULL DEFAULT 'manual',
  "priority" "contact_priority" DEFAULT 'medium',
  "assigned_to" TEXT,
  "owner_id" TEXT,
  "notes" TEXT,
  "tags" TEXT,
  "custom_fields" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "last_contact_at" TIMESTAMP,
  "next_followup_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMP
);

CREATE INDEX "contacts_tenant_org_idx" ON "contacts"("tenant_id", "organization_id");
CREATE INDEX "contacts_tenant_org_status_idx" ON "contacts"("tenant_id", "organization_id", "status");
CREATE INDEX "contacts_tenant_email_idx" ON "contacts"("tenant_id", "email");
CREATE INDEX "contacts_tenant_assigned_idx" ON "contacts"("tenant_id", "assigned_to");
CREATE INDEX "contacts_org_idx" ON "contacts"("organization_id");
CREATE INDEX "contacts_deleted_idx" ON "contacts"("deleted_at");

-- ============================================
-- SECURITY TABLES
-- ============================================

-- Auth Audit Logs
CREATE TABLE "auth_audit_logs" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT,
  "event_type" "auth_event_type" NOT NULL,
  "event_description" TEXT,
  "user_id" TEXT,
  "organization_id" TEXT,
  "session_id" TEXT,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "location" TEXT,
  "risk_level" "auth_risk_level" NOT NULL DEFAULT 'low',
  "risk_factors" TEXT,
  "risk_score" INTEGER NOT NULL DEFAULT 0,
  "metadata" TEXT,
  "is_success" BOOLEAN NOT NULL,
  "failure_reason" TEXT,
  "occurred_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "auth_audit_logs_tenant_occurred_idx" ON "auth_audit_logs"("tenant_id", "occurred_at");
CREATE INDEX "auth_audit_logs_tenant_user_idx" ON "auth_audit_logs"("tenant_id", "user_id");
CREATE INDEX "auth_audit_logs_tenant_org_idx" ON "auth_audit_logs"("tenant_id", "organization_id");
CREATE INDEX "auth_audit_logs_event_type_idx" ON "auth_audit_logs"("event_type");
CREATE INDEX "auth_audit_logs_occurred_idx" ON "auth_audit_logs"("occurred_at");

-- Password Reset Tokens
CREATE TABLE "password_reset_tokens" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT,
  "user_id" TEXT NOT NULL,
  "organization_id" TEXT,
  "token" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "status" "password_reset_status" NOT NULL DEFAULT 'active',
  "expires_at" TIMESTAMP NOT NULL,
  "used_at" TIMESTAMP,
  "revoked_at" TIMESTAMP,
  "revoked_by" TEXT,
  "revoked_reason" TEXT,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "last_attempt_at" TIMESTAMP,
  "is_rate_limited" BOOLEAN NOT NULL DEFAULT false,
  "rate_limit_expires_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "password_reset_tokens_tenant_user_idx" ON "password_reset_tokens"("tenant_id", "user_id");
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens"("user_id");

-- Rate Limits
CREATE TABLE "rate_limits" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT,
  "type" "rate_limit_type" NOT NULL,
  "identifier" TEXT NOT NULL,
  "organization_id" TEXT,
  "user_id" TEXT,
  "window_type" "rate_limit_window" NOT NULL,
  "window_size" INTEGER NOT NULL DEFAULT 1,
  "max_requests" INTEGER NOT NULL,
  "current_count" INTEGER NOT NULL DEFAULT 0,
  "window_start" TIMESTAMP NOT NULL,
  "window_end" TIMESTAMP NOT NULL,
  "first_request_at" TIMESTAMP NOT NULL,
  "last_request_at" TIMESTAMP NOT NULL,
  "metadata" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "rate_limits_tenant_type_identifier_idx" ON "rate_limits"("tenant_id", "type", "identifier");
CREATE INDEX "rate_limits_type_identifier_idx" ON "rate_limits"("type", "identifier");
CREATE INDEX "rate_limits_window_end_idx" ON "rate_limits"("window_end");

-- ============================================
-- ACTIVITY TABLES
-- ============================================

-- Activity Logs
CREATE TABLE "activity_logs" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "type" "activity_type" NOT NULL,
  "action" TEXT NOT NULL,
  "description" TEXT,
  "user_id" TEXT,
  "organization_id" TEXT,
  "resource_type" "activity_resource" NOT NULL,
  "resource_id" TEXT NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "session_id" TEXT,
  "changes_before" TEXT,
  "changes_after" TEXT,
  "category" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'info',
  "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
  "is_system_action" BOOLEAN NOT NULL DEFAULT false,
  "occurred_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "activity_logs_tenant_occurred_idx" ON "activity_logs"("tenant_id", "occurred_at");
CREATE INDEX "activity_logs_tenant_org_idx" ON "activity_logs"("tenant_id", "organization_id");
CREATE INDEX "activity_logs_tenant_user_idx" ON "activity_logs"("tenant_id", "user_id");
CREATE INDEX "activity_logs_tenant_resource_idx" ON "activity_logs"("tenant_id", "resource_type", "resource_id");
CREATE INDEX "activity_logs_occurred_idx" ON "activity_logs"("occurred_at");

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE "users" IS 'Core users table with multi-tenant support';
COMMENT ON TABLE "organizations" IS 'Multi-tenant organizations with settings JSONB for flexibility';
COMMENT ON TABLE "memberships" IS 'User-Organization relationship with RBAC permissions';
COMMENT ON TABLE "sessions" IS 'Active user sessions with device tracking';
COMMENT ON TABLE "auth_audit_logs" IS 'Security audit trail for authentication events';
COMMENT ON TABLE "activity_logs" IS 'Business activity audit trail';
COMMENT ON COLUMN "users"."is_super_admin" IS 'Superadmin flag - bypasses RLS policies. Only creatable via CLI.';
COMMENT ON INDEX "users_tenant_email_unique" IS 'Ensures email uniqueness per tenant (ignores soft-deleted records)';
COMMENT ON INDEX "users_super_admin_idx" IS 'Optimized index for superadmin queries (partial index)';
COMMENT ON INDEX "organizations_tenant_slug_unique" IS 'Ensures slug uniqueness per tenant (ignores soft-deleted records)';
COMMENT ON INDEX "projects_org_slug_unique" IS 'Ensures slug uniqueness per organization (ignores soft-deleted records)';
