// packages/database/src/scripts/seed.ts - ACHROMATIC ENTERPRISE MINIMAL SEED

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ============================================
// ENVIRONMENT SETUP
// ============================================

// Load environment from multiple possible locations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(__dirname, '../../../../.env.local'), // From packages/database/src/scripts
  path.resolve(process.cwd(), '.env.local'), // From root
  path.resolve(__dirname, '../../../.env.local'), // Alternative
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
// IMPORTS - ✅ FIXED: Updated import paths
// ============================================

import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
// ✅ FIXED: Import from new connection structure
import { closeConnection, db, healthCheck } from '../connection/index.js';
// ✅ FIXED: Import from new schemas structure
import { users } from '../schemas/auth/index.js';
import { memberships, organizations } from '../schemas/business/index.js';
import { authAuditLogs } from '../schemas/security/index.js';

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

/**
 * ✅ ENTERPRISE: Generate secure password hash
 */
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
    // ✅ ENTERPRISE: Health check first
    console.log('🏥 Checking database health...');
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    // ✅ ENTERPRISE: Create single test user
    console.log('👤 Creating test user...');
    const now = new Date();
    const passwordHash = await hashPassword(SEED_DATA.user.password);
    const userId = randomUUID();

    const testUserRecord = {
      id: userId,
      name: SEED_DATA.user.name,
      email: SEED_DATA.user.email.toLowerCase(),
      passwordHash,
      emailVerified: now, // ✅ ENTERPRISE: Pre-verified for seed user
      image: null,

      // ✅ ENTERPRISE: Account status
      isActive: true,
      isSuperAdmin: false,
      isEmailVerified: true,
      lastLoginAt: null,
      lastLoginIp: null,
      loginAttempts: '0',
      lockedUntil: null,

      // ✅ ENTERPRISE: User preferences & metadata
      firstName: null,
      lastName: null,
      avatarUrl: null,
      timezone: 'UTC',
      locale: 'en',
      emailNotifications: true,
      marketingEmails: false,

      // ✅ ENTERPRISE: Timestamps
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const [testUser] = await db
      .insert(users)
      .values(testUserRecord)
      .returning();

    // ✅ CORRIGIDO: Verificação para testUser possivelmente undefined
    if (testUser) {
      console.log(`  ✅ User created: ${testUser.email} (ID: ${testUser.id})`);
    }

    // ✅ CORRIGIDO: Verificação para testUser antes de usar
    if (!testUser) {
      throw new Error('Failed to create test user');
    }

    // ✅ ENTERPRISE: Create single test organization
    console.log('🏢 Creating test organization...');
    const organizationId = randomUUID();

    const testOrgRecord = {
      id: organizationId,
      name: SEED_DATA.organization.name,
      slug: SEED_DATA.organization.slug,
      description: SEED_DATA.organization.description,
      ownerId: testUser.id,

      // ✅ ENTERPRISE: Branding & customization
      logoUrl: null,
      website: null,
      brandColor: '#3b82f6', // Default blue

      // ✅ ENTERPRISE: Settings
      isPublic: false,
      allowJoinRequests: false,
      requireApproval: true,
      memberLimit: SEED_DATA.organization.maxMembers,
      projectLimit: SEED_DATA.organization.maxProjects,
      storageLimit: SEED_DATA.organization.maxStorage * 1024 * 1024, // Convert MB to bytes

      // ✅ ENTERPRISE: Contact & billing
      contactEmail: null,
      contactPhone: null,
      address: null,
      taxId: null,
      industry: null,
      companySize: null,
      planType: SEED_DATA.organization.planName,
      billingEmail: null,

      // ✅ ENTERPRISE: Status
      isActive: true,
      isVerified: true,

      // ✅ ENTERPRISE: Metadata
      metadata: {
        source: 'seed',
        createdBy: 'system',
        industry: 'technology',
        seedVersion: '1.0.0',
      },

      // ✅ ENTERPRISE: Timestamps
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const [testOrg] = await db
      .insert(organizations)
      .values(testOrgRecord)
      .returning();

    // ✅ CORRIGIDO: Verificação para testOrg possivelmente undefined
    if (testOrg) {
      console.log(
        `  ✅ Organization created: ${testOrg.name} (ID: ${testOrg.id})`
      );
    }

    // ✅ CORRIGIDO: Verificação para testOrg antes de usar
    if (!testOrg) {
      throw new Error('Failed to create test organization');
    }

    // ✅ ENTERPRISE: Create owner membership
    console.log('👥 Creating owner membership...');
    const membershipId = randomUUID();

    const membershipRecord = {
      id: membershipId,
      userId: testUser.id,
      organizationId: testOrg.id,

      role: 'owner' as const,

      // ✅ ENTERPRISE: Permissions & access
      permissions: null,

      // ✅ ENTERPRISE: Status
      status: 'active' as const,

      // ✅ ENTERPRISE: Invitation & joining
      invitedBy: null,
      invitedAt: null,
      acceptedAt: now,

      // ✅ ENTERPRISE: Activity
      lastActivityAt: null,

      // ✅ ENTERPRISE: Custom fields
      title: null,
      department: null,

      // ✅ ENTERPRISE: Metadata
      metadata: {
        source: 'seed',
        joinMethod: 'creation',
        initialRole: 'owner',
        seedVersion: '1.0.0',
      },

      // ✅ ENTERPRISE: Timestamps
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const [membership] = await db
      .insert(memberships)
      .values(membershipRecord)
      .returning();

    // ✅ CORRIGIDO: Verificação para membership possivelmente undefined
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

      // ✅ ENTERPRISE: Event classification
      eventType: 'login_success' as const, // Era 'login', agora 'login_success'
      riskLevel: 'low' as const,

      // ✅ ENTERPRISE: Context
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',

      // ✅ ENTERPRISE: Location
      country: null,
      region: null,
      city: null,

      // ✅ ENTERPRISE: Device info
      deviceId: null,
      deviceType: null,
      browserName: null,
      browserVersion: null,
      osName: null,
      osVersion: null,

      // ✅ ENTERPRISE: Session
      sessionId: null,
      sessionToken: null,

      // ✅ ENTERPRISE: Event data
      success: true,
      errorCode: null,
      errorMessage: null,
      resource: 'seed-operation',
      action: 'minimal_seed_complete',

      // ✅ ENTERPRISE: Raw data
      requestHeaders: null,
      responseData: {
        userEmail: testUser.email,
        organizationSlug: testOrg.slug,
        seedVersion: '1.0.0',
      },
      metadata: {
        source: 'seed',
        operation: 'minimal_seed_complete',
        timestamp: now.toISOString(),
      },

      // ✅ ENTERPRISE: Timestamps
      createdAt: now,
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
// ERROR HANDLING & EXECUTION
// ============================================

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('❌ Reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
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

// Execute seed with comprehensive error handling
console.log('🚀 Initializing Achromatic Enterprise minimal seed process...');

// ✅ FIXED: Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(async error => {
    console.error('❌ Unexpected error during enterprise seeding:', error);
    await closeConnection();
    process.exit(1);
  });
}
