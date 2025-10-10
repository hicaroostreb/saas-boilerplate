// packages/database/src/scripts/seed.ts

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
import { closeConnection, db, healthCheck } from '../connection';
import { users } from '../schemas/auth';
import { memberships, organizations } from '../schemas/business';
import { authAuditLogs } from '../schemas/security';

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

    const now = new Date();
    const tenantId = randomUUID();
    const organizationId = randomUUID();
    const userId = randomUUID();

    console.log('Creating test user...');
    const passwordHash = await hashPassword(SEED_DATA.user.password);

    const testUserRecord = {
      id: userId,
      name: SEED_DATA.user.name,
      email: SEED_DATA.user.email.toLowerCase(),
      organizationId: organizationId,
      passwordHash,
      emailVerified: now,
      image: null,
      isActive: true,
      isSuperAdmin: false,
      isEmailVerified: true,
      lastLoginAt: null,
      lastLoginIp: null,
      loginAttempts: '0',
      lockedUntil: null,
      firstName: null,
      lastName: null,
      avatarUrl: null,
      timezone: 'UTC',
      locale: 'en',
      emailNotifications: true,
      marketingEmails: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
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
      id: organizationId,
      tenantId: tenantId,
      name: SEED_DATA.organization.name,
      slug: SEED_DATA.organization.slug,
      description: SEED_DATA.organization.description,
      ownerId: userId,
      logoUrl: null,
      website: null,
      brandColor: '#3b82f6',
      isPublic: false,
      allowJoinRequests: false,
      requireApproval: true,
      memberLimit: SEED_DATA.organization.maxMembers,
      projectLimit: SEED_DATA.organization.maxProjects,
      storageLimit: SEED_DATA.organization.maxStorage * 1024 * 1024,
      contactEmail: null,
      contactPhone: null,
      address: null,
      taxId: null,
      industry: null,
      companySize: null,
      planType: SEED_DATA.organization.planName,
      billingEmail: null,
      isActive: true,
      isVerified: true,
      metadata: {
        source: 'seed',
        createdBy: 'system',
        industry: 'technology',
        seedVersion: '1.0.0',
      },
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
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
      id: randomUUID(),
      userId: testUser.id,
      organizationId: testOrg.id,
      role: 'owner' as const,
      permissions: null,
      status: 'active' as const,
      invitedBy: null,
      invitedAt: null,
      acceptedAt: now,
      lastActivityAt: null,
      title: null,
      department: null,
      metadata: {
        source: 'seed',
        joinMethod: 'creation',
        initialRole: 'owner',
        seedVersion: '1.0.0',
      },
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const [membership] = await db
      .insert(memberships)
      .values(membershipRecord)
      .returning();

    if (!membership) {
      throw new Error('Failed to create membership');
    }

    console.log(`Membership created: ${testUser.name} as ${membership.role}`);

    console.log('Creating audit trail...');
    const auditLogRecord = {
      id: randomUUID(),
      userId: testUser.id,
      organizationId: testOrg.id,
      eventType: 'login_success' as const,
      riskLevel: 'low' as const,
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
      country: null,
      region: null,
      city: null,
      deviceId: null,
      deviceType: null,
      browserName: null,
      browserVersion: null,
      osName: null,
      osVersion: null,
      sessionId: null,
      sessionToken: null,
      success: true,
      errorCode: null,
      errorMessage: null,
      resource: 'seed-operation',
      action: 'minimal_seed_complete',
      requestHeaders: null,
      responseData: {
        userEmail: testUser.email,
        organizationSlug: testOrg.slug,
        tenantId: tenantId,
        seedVersion: '1.0.0',
      },
      metadata: {
        source: 'seed',
        operation: 'minimal_seed_complete',
        tenantId: tenantId,
        timestamp: now.toISOString(),
      },
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      expiresAt: null,
    };

    await db.insert(authAuditLogs).values(auditLogRecord);
    console.log('Audit log entry created');

    console.log(
      'Achromatic Enterprise minimal seeding completed successfully!'
    );
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

// Only execute when run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(async error => {
    console.error('Unexpected error during enterprise seeding:', error);
    await closeConnection();
    process.exit(1);
  });
}
