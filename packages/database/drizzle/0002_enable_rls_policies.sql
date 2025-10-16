-- Migration: 0002_enable_rls_policies
-- Description: Enable Row-Level Security policies with superadmin bypass
-- Created: 2025-10-15
-- Updated: 2025-10-16 (Added superadmin bypass support)

-- ============================================
-- ENABLE RLS ON ALL TENANT TABLES
-- ============================================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "password_reset_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TENANT ISOLATION FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('app.tenant_id', true),
    (current_setting('request.jwt.claims', true)::json->>'tenant_id')::text
  );
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_user_is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    current_setting('app.is_super_admin', true)::boolean,
    false
  );
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION current_tenant_id IS 'Returns current tenant_id from session variable or JWT claims';
COMMENT ON FUNCTION current_user_is_super_admin IS 'Returns true if current user is super admin (bypasses RLS)';

-- ============================================
-- RLS POLICIES WITH SUPERADMIN BYPASS
-- ============================================

-- Users
CREATE POLICY "users_tenant_isolation" ON "users"
  FOR ALL
  USING (tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Sessions
CREATE POLICY "sessions_tenant_isolation" ON "sessions"
  FOR ALL
  USING (tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Accounts
CREATE POLICY "accounts_tenant_isolation" ON "accounts"
  FOR ALL
  USING (tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Organizations
CREATE POLICY "organizations_tenant_isolation" ON "organizations"
  FOR ALL
  USING (tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Memberships
CREATE POLICY "memberships_tenant_isolation" ON "memberships"
  FOR ALL
  USING (tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Invitations
CREATE POLICY "invitations_tenant_isolation" ON "invitations"
  FOR ALL
  USING (tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Projects
CREATE POLICY "projects_tenant_isolation" ON "projects"
  FOR ALL
  USING (tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Contacts
CREATE POLICY "contacts_tenant_isolation" ON "contacts"
  FOR ALL
  USING (tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Activity logs
CREATE POLICY "activity_logs_tenant_isolation" ON "activity_logs"
  FOR ALL
  USING (tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Auth audit logs (nullable tenant for system events)
CREATE POLICY "auth_audit_logs_tenant_isolation" ON "auth_audit_logs"
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Password reset tokens
CREATE POLICY "password_reset_tokens_tenant_isolation" ON "password_reset_tokens"
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Rate limits
CREATE POLICY "rate_limits_tenant_isolation" ON "rate_limits"
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- Verification tokens
CREATE POLICY "verification_tokens_tenant_isolation" ON "verification_tokens"
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id() OR current_user_is_super_admin() = true);

-- ============================================
-- SECURITY NOTES
-- ============================================

COMMENT ON POLICY "users_tenant_isolation" ON "users" IS 'Isolates users by tenant_id. Superadmins can access all tenants.';
COMMENT ON POLICY "organizations_tenant_isolation" ON "organizations" IS 'Isolates organizations by tenant_id. Superadmins can access all tenants.';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN 
  RAISE NOTICE '✅ RLS policies applied successfully on 13 tables';
  RAISE NOTICE '🔒 Multi-tenant isolation is now enforced at database level';
  RAISE NOTICE '🔓 Superadmin bypass enabled via current_user_is_super_admin()';
  RAISE NOTICE '⚠️  Use SET LOCAL app.is_super_admin = true in transactions for bypass';
END $$;
