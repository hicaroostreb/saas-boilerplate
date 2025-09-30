// ============================================
// PRODUCTION SEEDERS - SRP: APENAS PROD DATA
// ============================================

import { db } from '../connection';
import type { SeedOptions } from '../index';
import { memberships, organizations, users } from '../schemas';

export const productionSeeder = {
  name: 'Production (Minimal)',
  async run(options: SeedOptions): Promise<void> {
    if (options.verbose) {
      console.log('🏭 Running production minimal seed...');
    }

    // ============================================
    // PRODUCTION SAFETY CHECKS
    // ============================================

    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '⚠️  Production seeder should only run in production environment'
      );
      if (!options.force) {
        throw new Error('Production seeder blocked - use --force to override');
      }
    }

    // Check if production data already exists
    const existingUsers = await db.select().from(users).limit(1);

    if (existingUsers.length > 0 && !options.force) {
      if (options.verbose) {
        console.log('  ↳ Production data already exists, skipping');
      }
      return;
    }

    // ============================================
    // MINIMAL PRODUCTION DATA
    // ============================================

    const now = new Date();

    // Create system admin user (minimal)
    const adminUser = {
      id: crypto.randomUUID(),
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      name: 'System Administrator',
      passwordHash: null, // Force password setup on first login
      isActive: true,
      isSuperAdmin: true,
      isEmailVerified: true,
      emailNotifications: true,
      marketingEmails: false,
      timezone: 'UTC',
      locale: 'en',
      loginAttempts: '0',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values(adminUser);

    if (options.verbose) {
      console.log(`  ✅ Created admin user: ${adminUser.email}`);
    }

    // Create default organization (minimal)
    const defaultOrg = {
      id: crypto.randomUUID(),
      name: process.env.DEFAULT_ORG_NAME || 'Default Organization',
      slug: process.env.DEFAULT_ORG_SLUG || 'default',
      description: 'Default organization for production',
      ownerId: adminUser.id,
      isPublic: false,
      allowJoinRequests: false,
      requireApproval: true,
      memberLimit: 100,
      projectLimit: 50,
      storageLimit: 10737418240, // 10GB
      planType: 'enterprise',
      isActive: true,
      isVerified: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(organizations).values(defaultOrg);

    if (options.verbose) {
      console.log(`  ✅ Created default organization: ${defaultOrg.name}`);
    }

    // Create admin membership
    const adminMembership = {
      id: crypto.randomUUID(),
      userId: adminUser.id,
      organizationId: defaultOrg.id,
      role: 'owner' as const,
      status: 'active' as const,
      acceptedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(memberships).values(adminMembership);

    if (options.verbose) {
      console.log('  ✅ Created admin membership');
      console.log('');
      console.log('🔐 PRODUCTION SETUP REQUIRED:');
      console.log(`   📧 Admin Email: ${adminUser.email}`);
      console.log('   🔒 Password: Not set - requires first-time setup');
      console.log(
        `   🏢 Organization: ${defaultOrg.name} (${defaultOrg.slug})`
      );
      console.log('   ⚠️  Complete setup via admin interface');
    }
  },
};
