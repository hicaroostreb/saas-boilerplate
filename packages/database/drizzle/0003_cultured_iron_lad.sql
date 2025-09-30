CREATE TYPE "public"."contact_status" AS ENUM('active', 'inactive', 'archived', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('lead', 'customer', 'partner', 'vendor', 'employee', 'other');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."invitation_type" AS ENUM('email', 'link', 'direct');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'manager', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'inactive', 'suspended', 'pending');--> statement-breakpoint
CREATE TYPE "public"."project_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'inactive', 'archived', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."project_visibility" AS ENUM('private', 'organization', 'public');--> statement-breakpoint
CREATE TYPE "public"."auth_event_type" AS ENUM('login_success', 'login_failed', 'logout', 'session_expired', 'register_success', 'register_failed', 'email_verification_sent', 'email_verified', 'password_changed', 'password_reset_requested', 'password_reset_completed', 'password_reset_failed', 'account_locked', 'account_unlocked', 'account_suspended', 'account_reactivated', 'account_deleted', 'suspicious_activity', 'multiple_login_attempts', 'login_from_new_device', 'login_from_new_location', 'api_key_created', 'api_key_revoked', 'organization_joined', 'organization_left', 'role_changed', 'permissions_modified');--> statement-breakpoint
CREATE TYPE "public"."auth_risk_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."rate_limit_type" AS ENUM('login_attempts', 'password_reset', 'email_verification', 'registration', 'api_requests', 'api_uploads', 'api_downloads', 'organization_creation', 'invitation_sending', 'project_creation', 'contact_creation', 'requests_per_ip', 'requests_per_user', 'requests_per_endpoint');--> statement-breakpoint
CREATE TYPE "public"."rate_limit_window" AS ENUM('minute', 'hour', 'day', 'week', 'month');--> statement-breakpoint
CREATE TYPE "public"."request_source" AS ENUM('web', 'mobile', 'api', 'admin');--> statement-breakpoint
CREATE TYPE "public"."token_status" AS ENUM('active', 'used', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."activity_category" AS ENUM('organization', 'member', 'project', 'contact', 'system', 'billing', 'security', 'api');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('organization_created', 'organization_updated', 'organization_deleted', 'organization_settings_changed', 'member_invited', 'member_joined', 'member_left', 'member_role_changed', 'member_removed', 'project_created', 'project_updated', 'project_deleted', 'project_archived', 'project_restored', 'project_status_changed', 'contact_created', 'contact_updated', 'contact_deleted', 'contact_imported', 'contact_exported', 'settings_updated', 'integration_connected', 'integration_disconnected', 'data_export', 'data_import', 'subscription_created', 'subscription_updated', 'subscription_cancelled', 'payment_successful', 'payment_failed', 'login_successful', 'login_failed', 'password_changed', 'two_factor_enabled', 'two_factor_disabled', 'api_key_created', 'api_key_revoked', 'webhook_created', 'webhook_updated', 'webhook_deleted');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100),
	"image" text,
	"emailVerified" timestamp,
	"password_hash" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_super_admin" boolean DEFAULT false NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp,
	"last_login_ip" varchar(45),
	"login_attempts" varchar(10) DEFAULT '0',
	"locked_until" timestamp,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"avatar_url" text,
	"timezone" varchar(50) DEFAULT 'UTC',
	"locale" varchar(10) DEFAULT 'en',
	"email_notifications" boolean DEFAULT true NOT NULL,
	"marketing_emails" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'active' NOT NULL,
	"priority" "project_priority" DEFAULT 'medium' NOT NULL,
	"visibility" "project_visibility" DEFAULT 'organization' NOT NULL,
	"color" varchar(7),
	"icon" varchar(50),
	"cover_image_url" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"due_date" timestamp,
	"progress_percentage" integer DEFAULT 0,
	"allow_comments" boolean DEFAULT true NOT NULL,
	"require_approval" boolean DEFAULT false NOT NULL,
	"enable_notifications" boolean DEFAULT true NOT NULL,
	"budget" integer,
	"currency" varchar(3) DEFAULT 'USD',
	"external_url" text,
	"repository_url" text,
	"tags" jsonb,
	"custom_fields" jsonb,
	"metadata" jsonb,
	"view_count" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "auth_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"organization_id" text,
	"event_type" "auth_event_type" NOT NULL,
	"risk_level" "auth_risk_level" DEFAULT 'low' NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"country" varchar(2),
	"region" varchar(100),
	"city" varchar(100),
	"device_id" varchar(100),
	"device_type" varchar(50),
	"browser_name" varchar(50),
	"browser_version" varchar(20),
	"os_name" varchar(50),
	"os_version" varchar(20),
	"session_id" varchar(255),
	"session_token" text,
	"success" boolean NOT NULL,
	"error_code" varchar(50),
	"error_message" text,
	"resource" varchar(200),
	"action" varchar(100),
	"request_headers" jsonb,
	"response_data" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"ip_address" varchar(45),
	"identifier" varchar(255),
	"type" "rate_limit_type" NOT NULL,
	"resource" varchar(200),
	"window_type" "rate_limit_window" NOT NULL,
	"window_size" integer DEFAULT 1 NOT NULL,
	"max_attempts" integer NOT NULL,
	"current_attempts" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp NOT NULL,
	"window_end" timestamp NOT NULL,
	"blocked_until" timestamp,
	"last_attempt_at" timestamp,
	"last_attempt_ip" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "accounts" CASCADE;--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
DROP TABLE "verification_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_user_organization_unique";--> statement-breakpoint
DROP INDEX "activity_logs_organization_id_idx";--> statement-breakpoint
DROP INDEX "activity_logs_user_id_idx";--> statement-breakpoint
DROP INDEX "activity_logs_timestamp_idx";--> statement-breakpoint
DROP INDEX "activity_logs_action_idx";--> statement-breakpoint
DROP INDEX "contacts_organization_id_idx";--> statement-breakpoint
DROP INDEX "contacts_email_idx";--> statement-breakpoint
DROP INDEX "contacts_created_by_idx";--> statement-breakpoint
DROP INDEX "invitations_organization_id_idx";--> statement-breakpoint
DROP INDEX "invitations_email_idx";--> statement-breakpoint
DROP INDEX "invitations_status_idx";--> statement-breakpoint
DROP INDEX "invitations_expires_at_idx";--> statement-breakpoint
DROP INDEX "memberships_user_id_idx";--> statement-breakpoint
DROP INDEX "memberships_organization_id_idx";--> statement-breakpoint
DROP INDEX "memberships_role_idx";--> statement-breakpoint
DROP INDEX "organizations_slug_idx";--> statement-breakpoint
DROP INDEX "organizations_owner_id_idx";--> statement-breakpoint
DROP INDEX "organizations_subscription_status_idx";--> statement-breakpoint
DROP INDEX "password_reset_tokens_user_id_idx";--> statement-breakpoint
DROP INDEX "password_reset_tokens_token_idx";--> statement-breakpoint
DROP INDEX "password_reset_tokens_expires_at_idx";--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "action" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "role" SET DATA TYPE member_role;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "role" SET DEFAULT 'member';--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "invited_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "status" SET DATA TYPE invitation_status;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "memberships" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "memberships" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "memberships" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "memberships" ALTER COLUMN "role" SET DATA TYPE member_role;--> statement-breakpoint
ALTER TABLE "memberships" ALTER COLUMN "role" SET DEFAULT 'member';--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "owner_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "expires_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id");--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "project_id" text;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "type" "activity_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "category" "activity_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "entity_type" varchar(50);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "entity_id" text;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "entity_name" varchar(200);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "changes" jsonb;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "api_endpoint" varchar(200);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "api_method" varchar(10);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "api_version" varchar(10);--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "assigned_to" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "first_name" varchar(100);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_name" varchar(100);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "full_name" varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "mobile" varchar(20);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "company_name" varchar(200);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "job_title" varchar(100);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "department" varchar(100);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "address" jsonb;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "linkedin_url" varchar(255);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "twitter_handle" varchar(50);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "type" "contact_type" DEFAULT 'lead' NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "status" "contact_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "source" varchar(100);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "referred_by" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "email_opt_in" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "sms_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "marketing_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_contacted_at" timestamp;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "last_contact_method" varchar(50);--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "next_follow_up_at" timestamp;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "custom_fields" jsonb;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "invited_user_id" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "type" "invitation_type" DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "message" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "declined_at" timestamp;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "reminder_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "reminder_count" varchar(2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "permissions" jsonb;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "status" "member_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "invited_by" text;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "invited_at" timestamp;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "last_activity_at" timestamp;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "title" varchar(100);--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "department" varchar(100);--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "brand_color" varchar(7);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "allow_join_requests" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "require_approval" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "member_limit" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "project_limit" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "storage_limit" integer DEFAULT 1073741824 NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_email" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "address" jsonb;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "tax_id" varchar(50);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "industry" varchar(100);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "company_size" varchar(50);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "plan_type" varchar(50) DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "billing_email" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "hashed_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "status" "token_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "used_at" timestamp;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "revoked_at" timestamp;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "request_ip" varchar(45);--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "request_user_agent" text;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "request_source" "request_source" DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "use_ip" varchar(45);--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "use_user_agent" text;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "single_use" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "max_attempts" varchar(2) DEFAULT '3' NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "current_attempts" varchar(2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "previous_token_id" text;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_audit_logs" ADD CONSTRAINT "auth_audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_audit_logs" ADD CONSTRAINT "auth_audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limits" ADD CONSTRAINT "rate_limits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "account_provider_idx" ON "account" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_expires_idx" ON "session" USING btree ("expires");--> statement-breakpoint
CREATE INDEX "session_last_accessed_idx" ON "session" USING btree ("last_accessed_at");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_active_idx" ON "user" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_last_login_idx" ON "user" USING btree ("last_login_at");--> statement-breakpoint
CREATE INDEX "verification_token_idx" ON "verificationToken" USING btree ("token");--> statement-breakpoint
CREATE INDEX "verification_expires_idx" ON "verificationToken" USING btree ("expires");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verificationToken" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "project_org_idx" ON "projects" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "project_owner_idx" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "project_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "project_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_priority_idx" ON "projects" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "project_visibility_idx" ON "projects" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "project_created_at_idx" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "project_due_date_idx" ON "projects" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "project_org_status_idx" ON "projects" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "project_org_slug_idx" ON "projects" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "project_name_idx" ON "projects" USING btree ("name");--> statement-breakpoint
CREATE INDEX "auth_audit_user_idx" ON "auth_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_audit_org_idx" ON "auth_audit_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "auth_audit_event_type_idx" ON "auth_audit_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "auth_audit_risk_level_idx" ON "auth_audit_logs" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "auth_audit_ip_address_idx" ON "auth_audit_logs" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "auth_audit_created_at_idx" ON "auth_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "auth_audit_success_idx" ON "auth_audit_logs" USING btree ("success");--> statement-breakpoint
CREATE INDEX "auth_audit_device_id_idx" ON "auth_audit_logs" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "auth_audit_session_id_idx" ON "auth_audit_logs" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "auth_audit_expires_at_idx" ON "auth_audit_logs" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "auth_audit_user_event_idx" ON "auth_audit_logs" USING btree ("user_id","event_type");--> statement-breakpoint
CREATE INDEX "auth_audit_user_created_idx" ON "auth_audit_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "auth_audit_ip_event_idx" ON "auth_audit_logs" USING btree ("ip_address","event_type");--> statement-breakpoint
CREATE INDEX "auth_audit_risk_event_idx" ON "auth_audit_logs" USING btree ("risk_level","event_type");--> statement-breakpoint
CREATE INDEX "rate_limit_user_idx" ON "rate_limits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rate_limit_ip_idx" ON "rate_limits" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "rate_limit_identifier_idx" ON "rate_limits" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "rate_limit_type_idx" ON "rate_limits" USING btree ("type");--> statement-breakpoint
CREATE INDEX "rate_limit_window_end_idx" ON "rate_limits" USING btree ("window_end");--> statement-breakpoint
CREATE INDEX "rate_limit_blocked_until_idx" ON "rate_limits" USING btree ("blocked_until");--> statement-breakpoint
CREATE INDEX "rate_limit_created_at_idx" ON "rate_limits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rate_limit_user_type_idx" ON "rate_limits" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "rate_limit_ip_type_idx" ON "rate_limits" USING btree ("ip_address","type");--> statement-breakpoint
CREATE INDEX "rate_limit_identifier_type_idx" ON "rate_limits" USING btree ("identifier","type");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_user_type_resource_idx" ON "rate_limits" USING btree ("user_id","type","resource");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_ip_type_resource_idx" ON "rate_limits" USING btree ("ip_address","type","resource");--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_identifier_type_resource_idx" ON "rate_limits" USING btree ("identifier","type","resource");--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_user_id_user_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_org_idx" ON "activity_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "activity_log_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_log_project_idx" ON "activity_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "activity_log_type_idx" ON "activity_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "activity_log_category_idx" ON "activity_logs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "activity_log_entity_type_idx" ON "activity_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "activity_log_entity_id_idx" ON "activity_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "activity_log_created_at_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "activity_log_expires_at_idx" ON "activity_logs" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "activity_log_org_user_idx" ON "activity_logs" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "activity_log_org_type_idx" ON "activity_logs" USING btree ("organization_id","type");--> statement-breakpoint
CREATE INDEX "activity_log_org_category_idx" ON "activity_logs" USING btree ("organization_id","category");--> statement-breakpoint
CREATE INDEX "activity_log_org_created_idx" ON "activity_logs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_log_user_created_idx" ON "activity_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_log_entity_created_idx" ON "activity_logs" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_log_org_project_user_idx" ON "activity_logs" USING btree ("organization_id","project_id","user_id");--> statement-breakpoint
CREATE INDEX "contact_org_idx" ON "contacts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "contact_created_by_idx" ON "contacts" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "contact_assigned_to_idx" ON "contacts" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "contact_email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_full_name_idx" ON "contacts" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "contact_company_idx" ON "contacts" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "contact_type_idx" ON "contacts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "contact_status_idx" ON "contacts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_created_at_idx" ON "contacts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_last_contacted_idx" ON "contacts" USING btree ("last_contacted_at");--> statement-breakpoint
CREATE INDEX "contact_next_follow_up_idx" ON "contacts" USING btree ("next_follow_up_at");--> statement-breakpoint
CREATE INDEX "contact_referred_by_idx" ON "contacts" USING btree ("referred_by");--> statement-breakpoint
CREATE INDEX "contact_org_type_idx" ON "contacts" USING btree ("organization_id","type");--> statement-breakpoint
CREATE INDEX "contact_org_status_idx" ON "contacts" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "contact_name_email_idx" ON "contacts" USING btree ("full_name","email");--> statement-breakpoint
CREATE INDEX "invitation_token_idx" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitation_org_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_invited_by_idx" ON "invitations" USING btree ("invited_by");--> statement-breakpoint
CREATE INDEX "invitation_status_idx" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invitation_expires_at_idx" ON "invitations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invitation_created_at_idx" ON "invitations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "invitation_org_status_idx" ON "invitations" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "invitation_email_org_idx" ON "invitations" USING btree ("email","organization_id");--> statement-breakpoint
CREATE INDEX "membership_user_org_idx" ON "memberships" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "membership_user_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "membership_org_idx" ON "memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "membership_role_idx" ON "memberships" USING btree ("role");--> statement-breakpoint
CREATE INDEX "membership_status_idx" ON "memberships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "membership_last_activity_idx" ON "memberships" USING btree ("last_activity_at");--> statement-breakpoint
CREATE UNIQUE INDEX "org_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "org_owner_idx" ON "organizations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "org_name_idx" ON "organizations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "org_public_idx" ON "organizations" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "org_active_idx" ON "organizations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "org_created_at_idx" ON "organizations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "org_plan_type_idx" ON "organizations" USING btree ("plan_type");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "password_reset_hashed_token_idx" ON "password_reset_tokens" USING btree ("hashed_token");--> statement-breakpoint
CREATE INDEX "password_reset_user_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_email_idx" ON "password_reset_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "password_reset_status_idx" ON "password_reset_tokens" USING btree ("status");--> statement-breakpoint
CREATE INDEX "password_reset_expires_at_idx" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "password_reset_created_at_idx" ON "password_reset_tokens" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "password_reset_request_ip_idx" ON "password_reset_tokens" USING btree ("request_ip");--> statement-breakpoint
CREATE INDEX "password_reset_previous_token_idx" ON "password_reset_tokens" USING btree ("previous_token_id");--> statement-breakpoint
CREATE INDEX "password_reset_user_status_idx" ON "password_reset_tokens" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "password_reset_email_status_idx" ON "password_reset_tokens" USING btree ("email","status");--> statement-breakpoint
CREATE INDEX "password_reset_active_tokens_idx" ON "password_reset_tokens" USING btree ("status","expires_at");--> statement-breakpoint
ALTER TABLE "activity_logs" DROP COLUMN "details";--> statement-breakpoint
ALTER TABLE "activity_logs" DROP COLUMN "timestamp";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "company";--> statement-breakpoint
ALTER TABLE "invitations" DROP COLUMN "invited_at";--> statement-breakpoint
ALTER TABLE "memberships" DROP COLUMN "joined_at";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "stripe_subscription_id";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "stripe_product_id";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "plan_name";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "subscription_status";--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_token_unique" UNIQUE("token");