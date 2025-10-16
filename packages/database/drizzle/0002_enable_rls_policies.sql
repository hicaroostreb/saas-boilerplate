-- Migration: 0002_enable_rls_policies
-- Description: Enable Row-Level Security policies for Supabase
-- Created: 2025-10-15

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
-- CREATE TENANT ISOLATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('app.tenant_id', true),
    (current_setting('request.jwt.claims', true)::json->>'tenant_id')::text
  );
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION current_tenant_id IS 'Returns current tenant_id from session variable or JWT claims';

-- ============================================
-- CREATE TENANT ISOLATION POLICIES
-- ============================================

-- Users policies
CREATE POLICY "users_tenant_isolation" ON "users"
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Sessions policies
CREATE POLICY "sessions_tenant_isolation" ON "sessions"
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Accounts policies
CREATE POLICY "accounts_tenant_isolation" ON "accounts"
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Organizations policies
CREATE POLICY "organizations_tenant_isolation" ON "organizations"
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Memberships policies
CREATE POLICY "memberships_tenant_isolation" ON "memberships"
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Invitations policies
CREATE POLICY "invitations_tenant_isolation" ON "invitations"
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Projects policies
CREATE POLICY "projects_tenant_isolation" ON "projects"
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Contacts policies
CREATE POLICY "contacts_tenant_isolation" ON "contacts"
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Auth audit logs policies (nullable tenant_id for system events)
CREATE POLICY "auth_audit_logs_tenant_isolation" ON "auth_audit_logs"
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id());

-- Password reset tokens policies
CREATE POLICY "password_reset_tokens_tenant_isolation" ON "password_reset_tokens"
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id());

-- Rate limits policies
CREATE POLICY "rate_limits_tenant_isolation" ON "rate_limits"
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id());

-- Activity logs policies
CREATE POLICY "activity_logs_tenant_isolation" ON "activity_logs"
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Verification tokens policies
CREATE POLICY "verification_tokens_tenant_isolation" ON "verification_tokens"
  FOR ALL
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id());

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN 
  RAISE NOTICE '✅ RLS policies applied successfully on 13 tables';
  RAISE NOTICE '🔒 Multi-tenant isolation is now enforced at database level';
END $$;
