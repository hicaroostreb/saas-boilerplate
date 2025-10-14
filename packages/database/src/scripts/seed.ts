// packages/database/src/scripts/seed.ts
// ============================================
// BUILD-TIME SAFE SEEDER - ENTERPRISE MINIMAL DATA
// Snake_case fields, auth_audit_logs corrected
// ============================================

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  '../../.env.local',
  '../../../.env.local', 
  '.env.local',
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    config({ path: envPath, override: false });
    if (process.env.DATABASE_URL) {
      console.log(`Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    continue;
  }
}

if (!envLoaded) {
  console.error('Could not load .env.local file');
  process.exit(1);
}

import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { closeConnection, getDb, healthCheck } from '../connection';
import { users } from '../schemas/auth';
import { memberships, organizations } from '../schemas/business';
import { auth_audit_logs } from '../schemas/security';

const SEED_DATA = {
  user: {
    name: 'Test User',
    email: 'test@test.com',
    password: 'Test123!',
    securityLevel: 'normal' as const,
    twoFactorEnabled: false,
  },
  organization: {
    name: 'Test Organization',
    slug: 'test-org',
    description: 'Organization for testing and development purposes.',
    planName: 'free',
    subscriptionStatus: 'active',
    maxMembers: 5,
    maxProjects: 3,
    maxStorage: 1000,
  },
};

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function seed() {
  console.log('Starting Achromatic Enterprise minimal seed...');

  try {
    console.log('Checking database health...');
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    const db = await getDb();

    const now = new Date();
    const tenant_id = randomUUID();
    const organization_id = randomUUID();
    const user_id = randomUUID();

    console.log('Creating test user...');
    const password_hash = await hashPassword(SEED_DATA.user.password);

    const testUserRecord = {
      id: user_id,
      organization_id,
      name: SEED_DATA.user.name,
      email: SEED_DATA.user.email.toLowerCase(),
      image: null,
      email_verified: now,
      password_hash,
      is_active: true,
      is_super_admin: false,
      is_email_verified: true,
      last_login_at: null,
      last_login_ip: null,
      login_attempts: 0,
      locked_until: null,
      first_name: 'Test',
      last_name: 'User',
      avatar_url: null,
      timezone: 'UTC',
      locale: 'en',
      email_notifications: true,
      marketing_emails: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    const [testUser] = await db
      .insert(users)
      .values(testUserRecord)
      .returning();

    if (!testUser) {
      throw new Error('Failed to create test user');
    }

    console.log(`User created: ${testUser.email}`);

    console.log('Creating test organization...');
    
    const testOrgRecord = {
      id: organization_id,
      tenant_id,
      name: SEED_DATA.organization.name,
      slug: SEED_DATA.organization.slug,
      description: SEED_DATA.organization.description,
      website: null,
      logo_url: null,
      banner_url: null,
      brand_color: null,
      is_public: false,
      allow_join_requests: false,
      require_approval: true,
      member_limit: SEED_DATA.organization.maxMembers,
      project_limit: SEED_DATA.organization.maxProjects,
      storage_limit: SEED_DATA.organization.maxStorage * 1024 * 1024,
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
      plan_type: 'free',
      billing_email: null,
      owner_id: user_id,
      is_active: true,
      is_verified: true,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    const [testOrg] = await db
      .insert(organizations)
      .values(testOrgRecord)
      .returning();

    if (!testOrg) {
      throw new Error('Failed to create test organization');
    }

    console.log(`Organization created: ${testOrg.name}`);

    console.log('Creating owner membership...');
    
    const membershipRecord = {
      user_id: testUser.id,
      organization_id: testOrg.id,
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
      last_activity_at: now,
      title: 'Owner',
      department: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    const [membership] = await db
      .insert(memberships)
      .values(membershipRecord)
      .returning();

    if (!membership) {
      throw new Error('Failed to create membership');
    }

    console.log(`Membership created: ${testUser.name} as ${membership.role}`);

    try {
      console.log('Creating audit trail...');
      
      const auditLogRecord = {
        id: randomUUID(),
        user_id: testUser.id,
        organization_id: testOrg.id,
        event_type: 'login_success' as const,
        success: true,
        ip_address: '127.0.0.1',
        user_agent: 'seed-script',
        device_id: null,
        device_fingerprint: null,
        location_country: null,
        location_city: null,
        risk_score: 0,
        risk_level: 'low' as const,
        error_message: null,
        session_id: null,
        created_at: now,
      };

      await db.insert(auth_audit_logs).values(auditLogRecord);
      console.log('Audit log entry created');
    } catch (error) {
      console.warn('Audit log creation failed (table may not exist):', error);
    }

    console.log('Achromatic Enterprise minimal seeding completed successfully!');
    console.log('LOGIN CREDENTIALS:');
    console.log(`   Email: ${SEED_DATA.user.email}`);
    console.log(`   Password: ${SEED_DATA.user.password}`);
  } catch (error) {
    console.error('Enterprise minimal seeding failed:', error);
    process.exit(1);
  } finally {
    console.log('Closing database connection...');
    await closeConnection();
  }

  process.exit(0);
}

export { seed };
export async function runScript(): Promise<void> {
  return seed();
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('Process interrupted, cleaning up...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Process terminated, cleaning up...');
  await closeConnection();
  process.exit(0);
});

console.log('Initializing Achromatic Enterprise minimal seed process...');

if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(async error => {
    console.error('Unexpected error during enterprise seeding:', error);
    await closeConnection();
    process.exit(1);
  });
}
