// packages/database/src/scripts/seed.ts

// ============================================
// ACHROMATIC ENTERPRISE MINIMAL SEED - Enterprise Multi-Tenancy
// ============================================

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ============================================
// ENVIRONMENT SETUP
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(__dirname, '../../../../.env.local'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(__dirname, '../../../.env.local'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    config({ path: envPath, override: false });
    if (process.env.DATABASE_URL) {
      console.log(`✅ Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    continue;
  }
}

if (!envLoaded) {
  console.error('❌ Could not load .env.local file');
  process.exit(1);
}

// ============================================
// IMPORTS - FIXED PATHS
// ============================================

import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
// ✅ CORRIGIDO: Remover extensões .js e usar paths corretos
import { closeConnection, db, healthCheck } from '../connection';
import { users } from '../schemas/auth';
import { memberships, organizations } from '../schemas/business';
import { authAuditLogs } from '../schemas/security';

// ============================================
// MINIMAL SEED CONFIGURATION
// ============================================

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
    maxStorage: 1000, // 1GB in MB
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seed() {
  console.log('🌱 Starting Achromatic Enterprise minimal seed...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    console.log('🏥 Checking database health...');
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    const now = new Date();
    const tenantId = randomUUID(); // ✅ ENTERPRISE: Multi-tenancy

    // ✅ ENTERPRISE: Create organization first for FK constraint
    console.log('🏢 Creating test organization...');
    const organizationId = randomUUID();

    const testOrgRecord = {
      id: organizationId,
      tenantId: tenantId, // ✅ ENTERPRISE: Multi-tenancy
      name: SEED_DATA.organization.name,
      slug: SEED_DATA.organization.slug,
      description: SEED_DATA.organization.description,
      ownerId: '', // Will be set after user creation

      // Branding & customization
      logoUrl: null,
      website: null,
      brandColor: '#3b82f6',

      // Settings
      isPublic: false,
      allowJoinRequests: false,
      requireApproval: true,
      memberLimit: SEED_DATA.organization.maxMembers,
      projectLimit: SEED_DATA.organization.maxProjects,
      storageLimit: SEED_DATA.organization.maxStorage * 1024 * 1024,

      // Contact & billing
      contactEmail: null,
      contactPhone: null,
      address: null,
      taxId: null,
      industry: null,
      companySize: null,
      planType: SEED_DATA.organization.planName,
      billingEmail: null,

      // Status
      isActive: true,
      isVerified: true,

      // Metadata
      metadata: {
        source: 'seed',
        createdBy: 'system',
        industry: 'technology',
        seedVersion: '1.0.0',
      },

      // Timestamps
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    // ✅ ENTERPRISE: Create test user
    console.log('👤 Creating test user...');
    const passwordHash = await hashPassword(SEED_DATA.user.password);
    const userId = randomUUID();

    const testUserRecord = {
      id: userId,
      name: SEED_DATA.user.name,
      email: SEED_DATA.user.email.toLowerCase(),
      organizationId: organizationId, // ✅ ENTERPRISE: Multi-tenancy
      passwordHash,
      emailVerified: now,
      image: null,

      // Account status
      isActive: true,
      isSuperAdmin: false,
      isEmailVerified: true,
      lastLoginAt: null,
      lastLoginIp: null,
      loginAttempts: '0',
      lockedUntil: null,

      // User preferences & metadata
      firstName: null,
      lastName: null,
      avatarUrl: null,
      timezone: 'UTC',
      locale: 'en',
      emailNotifications: true,
      marketingEmails: false,

      // Timestamps
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    // Update organization with owner ID
    testOrgRecord.ownerId = userId;

    const [testUser] = await db
      .insert(users)
      .values(testUserRecord)
      .returning();

    if (!testUser) {
      throw new Error('Failed to create test user');
    }

    console.log(`  ✅ User created: ${testUser.email} (ID: ${testUser.id})`);

    const [testOrg] = await db
      .insert(organizations)
      .values(testOrgRecord)
      .returning();

    if (!testOrg) {
      throw new Error('Failed to create test organization');
    }

    console.log(
      `  ✅ Organization created: ${testOrg.name} (ID: ${testOrg.id})`
    );

    // ✅ ENTERPRISE: Create owner membership
    console.log('👥 Creating owner membership...');
    const membershipId = randomUUID();

    const membershipRecord = {
      id: membershipId,
      userId: testUser.id,
      organizationId: testOrg.id,

      role: 'owner' as const,

      // Permissions & access
      permissions: null,

      // Status
      status: 'active' as const,

      // Invitation & joining
      invitedBy: null,
      invitedAt: null,
      acceptedAt: now,

      // Activity
      lastActivityAt: null,

      // Custom fields
      title: null,
      department: null,

      // Metadata
      metadata: {
        source: 'seed',
        joinMethod: 'creation',
        initialRole: 'owner',
        seedVersion: '1.0.0',
      },

      // Timestamps
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const [membership] = await db
      .insert(memberships)
      .values(membershipRecord)
      .returning();

    if (membership) {
      console.log(
        `  ✅ Membership created: ${testUser.name} as ${membership.role}`
      );
    }

    // ✅ ENTERPRISE: Create audit log for seed operation
    console.log('📊 Creating audit trail...');
    const auditLogRecord = {
      id: randomUUID(),
      userId: testUser.id,
      organizationId: testOrg.id,

      // Event classification
      eventType: 'login_success' as const,
      riskLevel: 'low' as const,

      // Context
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',

      // Location
      country: null,
      region: null,
      city: null,

      // Device info
      deviceId: null,
      deviceType: null,
      browserName: null,
      browserVersion: null,
      osName: null,
      osVersion: null,

      // Session
      sessionId: null,
      sessionToken: null,

      // Event data
      success: true,
      errorCode: null,
      errorMessage: null,
      resource: 'seed-operation',
      action: 'minimal_seed_complete',

      // Raw data
      requestHeaders: null,
      responseData: {
        userEmail: testUser.email,
        organizationSlug: testOrg.slug,
        tenantId: tenantId, // ✅ ENTERPRISE: Include tenant ID
        seedVersion: '1.0.0',
      },
      metadata: {
        source: 'seed',
        operation: 'minimal_seed_complete',
        tenantId: tenantId, // ✅ ENTERPRISE: Include tenant ID
        timestamp: now.toISOString(),
      },

      // Timestamps
      createdAt: now,
      updatedAt: now, // ✅ ENTERPRISE: Add updatedAt
      deletedAt: null, // ✅ ENTERPRISE: Add deletedAt
      expiresAt: null,
    };

    await db.insert(authAuditLogs).values(auditLogRecord);
    console.log(`  ✅ Audit log entry created`);

    // ✅ ENTERPRISE: Success summary
    console.log(
      '\n🎉 Achromatic Enterprise minimal seeding completed successfully!'
    );
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SEED SUMMARY:');
    console.log(`   👤 Users: 1`);
    console.log(`   🏢 Organizations: 1`);
    console.log(`   👥 Memberships: 1`);
    console.log(`   📋 Audit Logs: 1`);
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log(`   📧 Email: ${SEED_DATA.user.email}`);
    console.log(`   🔒 Password: ${SEED_DATA.user.password}`);
    console.log(`   👑 Role: Owner`);
    console.log('');
    console.log('🏢 ORGANIZATION:');
    console.log(`   📛 Name: ${SEED_DATA.organization.name}`);
    console.log(`   🔗 Slug: ${SEED_DATA.organization.slug}`);
    console.log(`   🏗️  Tenant ID: ${tenantId}`);
    console.log(`   📦 Plan: ${SEED_DATA.organization.planName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Enterprise minimal seeding failed:', error);

    if (error instanceof Error) {
      console.error('💥 Error details:', {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }

    process.exit(1);
  } finally {
    console.log('🔌 Closing database connection...');
    await closeConnection();
  }

  process.exit(0);
}

// ============================================
// EXPORT FOR SEEDER FRAMEWORK
// ============================================

export { seed };
export async function runScript(): Promise<void> {
  return seed();
}

// ============================================
// ERROR HANDLING & EXECUTION - ✅ FIXED
// ============================================

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  Process interrupted, cleaning up...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Process terminated, cleaning up...');
  await closeConnection();
  process.exit(0);
});

console.log('🚀 Initializing Achromatic Enterprise minimal seed process...');

// ✅ FIXED: Always execute seed when script is run directly
seed().catch(async error => {
  console.error('❌ Unexpected error during enterprise seeding:', error);
  await closeConnection();
  process.exit(1);
});
