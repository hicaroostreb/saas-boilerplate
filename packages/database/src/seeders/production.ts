// packages/database/src/seeders/production.ts
// ============================================
// PRODUCTION SEEDERS - MINIMAL ENTERPRISE DATA
// ============================================

import type { Database } from '../connection';
import type { SeedOptions } from '../index';
import { memberships, organizations, users } from '../schemas';

export async function productionSeeder(
  db: Database,
  options: SeedOptions
): Promise<void> {
  if (options.verbose) {
    console.log('Running production minimal seed...');
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'Production seeder should only run in production environment'
    );
    if (!options.force) {
      throw new Error('Production seeder blocked - use --force to override');
    }
  }

  const existingUsers = await db.select().from(users).limit(1);

  if (existingUsers.length > 0 && !options.force) {
    if (options.verbose) {
      console.log('Production data already exists, skipping');
    }
    return;
  }

  const now = new Date();
  const tenant_id = crypto.randomUUID();

  const adminUser = {
    id: crypto.randomUUID(),
    organization_id: '',
    name: 'System Administrator',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    image: null,
    email_verified: now,
    password_hash: null,
    is_active: true,
    is_super_admin: true,
    is_email_verified: true,
    last_login_at: null,
    last_login_ip: null,
    login_attempts: 0,
    locked_until: null,
    first_name: 'System',
    last_name: 'Administrator',
    avatar_url: null,
    timezone: 'UTC',
    locale: 'en',
    email_notifications: true,
    marketing_emails: false,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };

  const defaultOrg = {
    id: crypto.randomUUID(),
    tenant_id,
    name: process.env.DEFAULT_ORG_NAME || 'Default Organization',
    slug: process.env.DEFAULT_ORG_SLUG || 'default',
    description: 'Default organization for production',
    website: null,
    logo_url: null,
    banner_url: null,
    brand_color: null,
    is_public: false,
    allow_join_requests: false,
    require_approval: true,
    member_limit: 100,
    project_limit: 50,
    storage_limit: 10737418240,
    contact_email: null,
    contact_phone: null,
    address_street: null,
    address_city: null,
    address_state: null,
    address_zip_code: null,
    address_country: null,
    tax_id: null,
    industry: null,
    company_size: null,
    plan_type: 'enterprise',
    billing_email: null,
    owner_id: adminUser.id,
    is_active: true,
    is_verified: true,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };

  adminUser.organization_id = defaultOrg.id;

  await db.insert(users).values(adminUser);

  if (options.verbose) {
    console.log(`Created admin user: ${adminUser.email}`);
  }

  await db.insert(organizations).values(defaultOrg);

  if (options.verbose) {
    console.log(`Created default organization: ${defaultOrg.name}`);
  }

  const adminMembership = {
    user_id: adminUser.id,
    organization_id: defaultOrg.id,
    role: 'owner' as const,
    can_invite: true,
    can_manage_projects: true,
    can_manage_members: true,
    can_manage_billing: true,
    can_manage_settings: true,
    can_delete_organization: true,
    status: 'active' as const,
    invited_by: null,
    invited_at: null,
    accepted_at: now,
    last_activity_at: null,
    title: 'System Administrator',
    department: 'IT',
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };

  await db.insert(memberships).values(adminMembership);

  if (options.verbose) {
    console.log('Created admin membership');
    console.log('');
    console.log('PRODUCTION SETUP REQUIRED:');
    console.log(`Admin Email: ${adminUser.email}`);
    console.log('Password: Not set - requires first-time setup');
    console.log(`Organization: ${defaultOrg.name} (${defaultOrg.slug})`);
    console.log(`Tenant ID: ${tenant_id}`);
    console.log('Complete setup via admin interface');
  }
}
