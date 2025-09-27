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
// IMPORTS
// ============================================

import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { closeConnection, db, healthCheck } from '../client.js';
import { authAuditLogs, memberships, organizations, users } from '../schema.js';

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
      lastLoginAt: null,

      // ✅ ENTERPRISE: Security settings
      twoFactorEnabled: SEED_DATA.user.twoFactorEnabled,
      twoFactorSecret: null,
      backupCodes: null,
      securityLevel: SEED_DATA.user.securityLevel,

      // ✅ ENTERPRISE: Password management
      passwordChangedAt: now,
      accountLockedAt: null,
      accountLockedUntil: null,
      failedLoginAttempts: 0,

      // ✅ ENTERPRISE: User preferences & metadata
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          security: true,
        },
        privacy: {
          profileVisible: true,
          activityVisible: false,
        },
      },
      metadata: {
        source: 'seed',
        createdBy: 'system',
        initialSecurityLevel: SEED_DATA.user.securityLevel,
        seedVersion: '1.0.0',
      },

      // ✅ ENTERPRISE: Timestamps
      createdAt: now,
      updatedAt: now,
    };

    const [testUser] = await db
      .insert(users)
      .values(testUserRecord)
      .returning();

    console.log(`  ✅ User created: ${testUser.email} (ID: ${testUser.id})`);

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
      logo: null,
      website: null,
      primaryColor: '#3b82f6', // Default blue

      // ✅ ENTERPRISE: Subscription & billing
      planName: SEED_DATA.organization.planName,
      subscriptionStatus: SEED_DATA.organization.subscriptionStatus,
      subscriptionId: null,
      billingEmail: null,
      billingAddress: null,
      taxId: null,

      // ✅ ENTERPRISE: Resource limits
      maxMembers: SEED_DATA.organization.maxMembers,
      maxProjects: SEED_DATA.organization.maxProjects,
      maxStorage: SEED_DATA.organization.maxStorage,

      // ✅ ENTERPRISE: Current usage
      currentMembers: 1, // Just the owner
      currentProjects: 0,
      currentStorage: 0,

      // ✅ ENTERPRISE: Organization status
      isActive: true,
      isVerified: true,
      isSuspended: false,
      suspendedAt: null,
      suspendedReason: null,

      // ✅ ENTERPRISE: Settings & policies
      settings: {
        allowPublicSignup: false,
        requireEmailVerification: true,
        enforceSSO: false,
        allowGuests: true,
        defaultMemberRole: 'member',
        sessionTimeout: 30 * 24 * 60 * 60, // 30 days
      },
      features: {
        advancedReporting: false, // Free plan
        customBranding: false, // Free plan
        prioritySupport: false, // Free plan
        apiAccess: false, // Free plan
        webhooks: false, // Free plan
        singleSignOn: false, // Free plan
        auditLogs: false, // Free plan
      },
      securityPolicy: {
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        passwordMaxAge: 90, // days
        sessionMaxAge: 30, // days
        mfaRequired: false,
        ipWhitelisting: false,
        allowedDomains: null,
      },

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
    };

    const [testOrg] = await db
      .insert(organizations)
      .values(testOrgRecord)
      .returning();

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

      // ✅ ENTERPRISE: Permissions & access
      permissions: null, // Uses default owner permissions
      customPermissions: null,

      // ✅ ENTERPRISE: Invitation & joining
      invitedBy: null, // Self-created as owner
      invitedAt: null,
      joinedAt: now,

      // ✅ ENTERPRISE: Status
      isActive: true,

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
    };

    const [membership] = await db
      .insert(memberships)
      .values(membershipRecord)
      .returning();

    console.log(
      `  ✅ Membership created: ${testUser.name} as ${membership.role}`
    );

    // ✅ ENTERPRISE: Create audit log for seed operation
    console.log('📊 Creating audit trail...');
    const auditLogRecord = {
      id: randomUUID(),
      userId: testUser.id,
      sessionToken: null,
      organizationId: testOrg.id,

      // ✅ ENTERPRISE: Event classification
      eventType: 'login' as const,
      eventAction: 'seed_data_created',
      eventStatus: 'success' as const,
      eventCategory: 'admin' as const,

      // ✅ ENTERPRISE: Context
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
      deviceFingerprint: null,
      deviceInfo: null,

      // ✅ ENTERPRISE: Location
      country: null,
      city: null,
      timezone: null,

      // ✅ ENTERPRISE: Security
      riskScore: 0,
      riskFactors: null,
      securityFlags: null,

      // ✅ ENTERPRISE: Event data
      eventData: {
        source: 'seed',
        operation: 'minimal_seed_complete',
        userEmail: testUser.email,
        organizationSlug: testOrg.slug,
        seedVersion: '1.0.0',
        timestamp: now.toISOString(),
      },
      errorCode: null,
      errorMessage: null,

      // ✅ ENTERPRISE: Processing
      timestamp: now,
      source: 'seed-script',
      requestId: null,
      processed: true,
      alertsSent: null,
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
    console.log(`   🛡️  Security Level: ${SEED_DATA.user.securityLevel}`);
    console.log(
      `   🔐 Two-Factor: ${SEED_DATA.user.twoFactorEnabled ? 'Enabled' : 'Disabled'}`
    );
    console.log('');
    console.log('🏢 ORGANIZATION:');
    console.log(`   📛 Name: ${SEED_DATA.organization.name}`);
    console.log(`   🔗 Slug: ${SEED_DATA.organization.slug}`);
    console.log(`   📦 Plan: ${SEED_DATA.organization.planName}`);
    console.log(`   ✅ Status: ${SEED_DATA.organization.subscriptionStatus}`);
    console.log(`   👥 Max Members: ${SEED_DATA.organization.maxMembers}`);
    console.log(`   📊 Max Projects: ${SEED_DATA.organization.maxProjects}`);
    console.log(`   💾 Max Storage: ${SEED_DATA.organization.maxStorage}MB`);
    console.log('');
    console.log('🌐 ACCESS URLS:');
    console.log('   🔐 Sign In: http://localhost:3001/auth/sign-in');
    console.log('   🏠 Dashboard: http://localhost:3001/dashboard');
    console.log(
      `   📊 Organization: http://localhost:3001/${SEED_DATA.organization.slug}`
    );
    console.log('');
    console.log('🛡️  ENTERPRISE FEATURES:');
    console.log('   ✅ Enhanced user security');
    console.log('   ✅ Organization-based access');
    console.log('   ✅ Comprehensive audit logging');
    console.log('   ✅ Enterprise-grade password policies');
    console.log('   ✅ Resource usage tracking');
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

    // ✅ ENTERPRISE: Enhanced error handling
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as any;

      switch (dbError.code) {
        case '23505':
          console.error('🚫 Duplicate key error - data might already exist');
          console.log(
            '💡 Tip: Clear your database or use different email/slug values'
          );
          console.log(
            "💡 Run: DELETE FROM users WHERE email = 'test@test.com';"
          );
          break;
        case '23503':
          console.error('🔗 Foreign key constraint error');
          console.log(
            '💡 Tip: Check table dependencies and schema consistency'
          );
          break;
        case '42P01':
          console.error('🗃️  Table does not exist error');
          console.log('💡 Tip: Run database migrations first: pnpm db:push');
          break;
        case '42703':
          console.error('🏗️  Column does not exist error');
          console.log(
            '💡 Tip: Update your database schema to match the latest version'
          );
          break;
        default:
          console.error(`🔍 Database error code: ${dbError.code}`);
      }
    }

    process.exit(1);
  } finally {
    console.log('🔌 Closing database connection...');
    await closeConnection();
  }

  process.exit(0);
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

seed().catch(async error => {
  console.error('❌ Unexpected error during enterprise seeding:', error);
  await closeConnection();
  process.exit(1);
});
