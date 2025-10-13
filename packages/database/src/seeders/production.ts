import { getDb } from '../connection';
import type { SeedOptions } from '../index';
import { memberships, organizations, users } from '../schemas';

export const productionSeeder = {
  name: 'Production (Minimal)',
  async run(options: SeedOptions): Promise<void> {
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

    const db = await getDb();
    const existingUsers = await db.select().from(users).limit(1);

    if (existingUsers.length > 0 && !options.force) {
      if (options.verbose) {
        console.log('Production data already exists, skipping');
      }
      return;
    }

    const now = new Date();
    const tenantId = crypto.randomUUID();

    const defaultOrg = {
      id: crypto.randomUUID(),
      tenantId: tenantId,
      name: process.env.DEFAULT_ORG_NAME || 'Default Organization',
      slug: process.env.DEFAULT_ORG_SLUG || 'default',
      description: 'Default organization for production',
      ownerId: '',
      isPublic: false,
      allowJoinRequests: false,
      requireApproval: true,
      memberLimit: 100,
      projectLimit: 50,
      storageLimit: 10737418240,
      planType: 'enterprise',
      isActive: true,
      isVerified: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const adminUser = {
      id: crypto.randomUUID(),
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      name: 'System Administrator',
      passwordHash: null,
      emailVerified: now,
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
      deletedAt: null,
    };

    defaultOrg.ownerId = adminUser.id;

    await db.insert(users).values(adminUser);

    if (options.verbose) {
      console.log(`Created admin user: ${adminUser.email}`);
    }

    await db.insert(organizations).values(defaultOrg);

    if (options.verbose) {
      console.log(`Created default organization: ${defaultOrg.name}`);
    }

    const adminMembership = {
      id: crypto.randomUUID(),
      userId: adminUser.id,
      organizationId: defaultOrg.id,
      role: 'owner' as const,
      status: 'active' as const,
      acceptedAt: now,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await db.insert(memberships).values(adminMembership);

    if (options.verbose) {
      console.log('Created admin membership');
      console.log('');
      console.log('PRODUCTION SETUP REQUIRED:');
      console.log(`Admin Email: ${adminUser.email}`);
      console.log('Password: Not set - requires first-time setup');
      console.log(`Organization: ${defaultOrg.name} (${defaultOrg.slug})`);
      console.log(`Tenant ID: ${tenantId}`);
      console.log('Complete setup via admin interface');
    }
  },
};
