// packages/database/src/seeders/production.ts
// ============================================
// PRODUCTION SEED - MULTI-TENANT READY
// ============================================

import type { Database } from '../connection/index.js';
import { memberships, organizations, users } from '../schemas/index.js';

export async function productionSeeder(db: Database): Promise<number> {
  console.log('Production seed: Creating essential system data...');

  let recordsCreated = 0;

  try {
    // System tenant ID
    const systemTenantId = 'system-tenant-' + crypto.randomUUID();

    // System admin user
    const systemAdmin = {
      id: 'system-admin-' + crypto.randomUUID(),
      tenant_id: systemTenantId,
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@system.local',
      password_hash: null,
      phone: null,
      image: null,
      email_verified: new Date(),
      role: 'admin' as const,
      status: 'active' as const,
      is_active: true,
      is_super_admin: true,
      is_email_verified: true,
      two_factor_enabled: false,
      two_factor_secret: null,
      locked_until: null,
      failed_login_attempts: 0,
      last_login_at: null,
      password_changed_at: null,
      timezone: 'UTC',
      locale: 'en',
      notification_preferences: null,
      metadata: null,
      bio: null,
      avatar_url: null,
      onboarding_completed: true,
      marketing_emails: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    await db.insert(users).values(systemAdmin);
    recordsCreated++;

    // Default organization
    const defaultOrg = {
      id: 'default-org-' + crypto.randomUUID(),
      tenant_id: systemTenantId,
      name: 'System Organization',
      slug: 'system',
      description: 'Default system organization',
      domain: null,
      website: null,
      logo_url: null,
      banner_url: null,
      brand_color: null,
      is_public: false,
      is_active: true,
      is_verified: true,
      industry: 'technology' as const,
      company_size: '1-10' as const,
      founded_year: null,
      address: null,
      city: null,
      state: null,
      country: null,
      postal_code: null,
      phone: null,
      email: null,
      social_links: null,
      settings: null,
      metadata: null,
      plan_type: 'enterprise' as const,
      subscription_status: 'active' as const,
      trial_ends_at: null,
      billing_email: null,
      tax_id: null,
      owner_id: systemAdmin.id,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    await db.insert(organizations).values(defaultOrg);
    recordsCreated++;

    // System membership
    const systemMembership = {
      tenant_id: systemTenantId,
      user_id: systemAdmin.id,
      organization_id: defaultOrg.id,
      role: 'owner' as const,
      status: 'active' as const,
      permissions: null,
      invited_by: null,
      invited_at: null,
      joined_at: new Date(),
      title: 'System Administrator',
      department: null,
      metadata: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(memberships).values(systemMembership);
    recordsCreated++;

    console.log(
      `✅ Production seed completed: ${recordsCreated} records created`
    );
    console.log(`   Tenant ID: ${systemTenantId}`);
    console.log(`   Admin Email: ${systemAdmin.email}`);

    return recordsCreated;
  } catch (error) {
    console.error('❌ Production seed failed:', error);
    throw error;
  }
}
