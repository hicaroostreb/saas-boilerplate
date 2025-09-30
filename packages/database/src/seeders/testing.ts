// ============================================
// TESTING SEEDERS - SRP: APENAS TEST DATA
// ============================================

import { db } from '../connection';
import type { SeedOptions } from '../index';
import {
  contacts,
  memberships,
  organizations,
  projects,
  users,
} from '../schemas';

export const testingSeeder = {
  name: 'Testing (Comprehensive)',
  async run(options: SeedOptions): Promise<void> {
    if (options.verbose) {
      console.log('🧪 Running testing comprehensive seed...');
    }

    // ============================================
    // TESTING ENVIRONMENT CHECK
    // ============================================

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Testing seeder cannot run in production environment');
    }

    // Check if test data already exists
    const existingUsers = await db.select().from(users).limit(1);

    if (existingUsers.length > 0 && !options.force) {
      if (options.verbose) {
        console.log('  ↳ Test data already exists, skipping');
      }
      return;
    }

    const now = new Date();

    // ============================================
    // TEST USERS DATA
    // ============================================

    const testUsers = [
      {
        id: crypto.randomUUID(),
        email: 'test.admin@test.com',
        name: 'Test Admin',
        image: null,
        emailVerified: now,
        passwordHash: null,
        isActive: true,
        isSuperAdmin: true,
        isEmailVerified: true,
        lastLoginAt: null,
        lastLoginIp: null,
        loginAttempts: '0',
        lockedUntil: null,
        firstName: 'Test',
        lastName: 'Admin',
        avatarUrl: null,
        timezone: 'UTC',
        locale: 'en',
        emailNotifications: true,
        marketingEmails: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: crypto.randomUUID(),
        email: 'test.user@test.com',
        name: 'Test User',
        image: null,
        emailVerified: now,
        passwordHash: null,
        isActive: true,
        isSuperAdmin: false,
        isEmailVerified: true,
        lastLoginAt: null,
        lastLoginIp: null,
        loginAttempts: '0',
        lockedUntil: null,
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: null,
        timezone: 'America/New_York',
        locale: 'en',
        emailNotifications: true,
        marketingEmails: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: crypto.randomUUID(),
        email: 'test.inactive@test.com',
        name: 'Inactive User',
        image: null,
        emailVerified: null,
        passwordHash: null,
        isActive: false,
        isSuperAdmin: false,
        isEmailVerified: false,
        lastLoginAt: null,
        lastLoginIp: null,
        loginAttempts: '3',
        lockedUntil: null,
        firstName: 'Inactive',
        lastName: 'User',
        avatarUrl: null,
        timezone: 'UTC',
        locale: 'en',
        emailNotifications: false,
        marketingEmails: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];

    await db.insert(users).values(testUsers);

    if (options.verbose) {
      console.log(`  ✅ Created ${testUsers.length} test users`);
    }

    // ============================================
    // TEST ORGANIZATIONS DATA - ✅ FIXED: Safe array access
    // ============================================

    const adminUser = testUsers[0]; // Safe - we know it exists
    const regularUser = testUsers[1]; // Safe - we know it exists

    if (!adminUser || !regularUser) {
      throw new Error('Failed to create test users');
    }

    const testOrganizations = [
      {
        id: crypto.randomUUID(),
        name: 'Test Organization Alpha',
        slug: 'test-org-alpha',
        description: 'Primary test organization for comprehensive testing',
        website: null,
        logoUrl: null,
        bannerUrl: null,
        brandColor: '#3b82f6',
        ownerId: adminUser.id, // ✅ FIXED: Safe access
        isPublic: false,
        allowJoinRequests: true,
        requireApproval: false,
        memberLimit: 10,
        projectLimit: 5,
        storageLimit: 1073741824, // 1GB
        contactEmail: null,
        contactPhone: null,
        address: null,
        taxId: null,
        industry: 'technology',
        companySize: '11-50',
        planType: 'professional',
        billingEmail: null,
        metadata: { source: 'test' },
        isActive: true,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: crypto.randomUUID(),
        name: 'Test Organization Beta',
        slug: 'test-org-beta',
        description: 'Secondary test organization for multi-org testing',
        website: null,
        logoUrl: null,
        bannerUrl: null,
        brandColor: '#10b981',
        ownerId: regularUser.id, // ✅ FIXED: Safe access
        isPublic: true,
        allowJoinRequests: false,
        requireApproval: true,
        memberLimit: 5,
        projectLimit: 3,
        storageLimit: 536870912, // 512MB
        contactEmail: null,
        contactPhone: null,
        address: null,
        taxId: null,
        industry: 'consulting',
        companySize: '1-10',
        planType: 'starter',
        billingEmail: null,
        metadata: { source: 'test' },
        isActive: true,
        isVerified: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];

    await db.insert(organizations).values(testOrganizations);

    if (options.verbose) {
      console.log(
        `  ✅ Created ${testOrganizations.length} test organizations`
      );
    }

    // ============================================
    // TEST MEMBERSHIPS DATA - ✅ FIXED: Safe access
    // ============================================

    const orgAlpha = testOrganizations[0];
    const orgBeta = testOrganizations[1];

    if (!orgAlpha || !orgBeta) {
      throw new Error('Failed to create test organizations');
    }

    const testMemberships = [
      {
        id: crypto.randomUUID(),
        userId: adminUser.id, // ✅ FIXED: Safe access
        organizationId: orgAlpha.id, // ✅ FIXED: Safe access
        role: 'owner' as const,
        permissions: null,
        status: 'active' as const,
        invitedBy: null,
        invitedAt: null,
        acceptedAt: now,
        lastActivityAt: null,
        title: 'System Administrator',
        department: 'IT',
        metadata: { source: 'test' },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: crypto.randomUUID(),
        userId: regularUser.id, // ✅ FIXED: Safe access
        organizationId: orgAlpha.id, // ✅ FIXED: Safe access
        role: 'admin' as const,
        permissions: null,
        status: 'active' as const,
        invitedBy: adminUser.id,
        invitedAt: now,
        acceptedAt: now,
        lastActivityAt: null,
        title: 'Project Manager',
        department: 'Operations',
        metadata: { source: 'test' },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: crypto.randomUUID(),
        userId: regularUser.id, // ✅ FIXED: Safe access
        organizationId: orgBeta.id, // ✅ FIXED: Safe access
        role: 'owner' as const,
        permissions: null,
        status: 'active' as const,
        invitedBy: null,
        invitedAt: null,
        acceptedAt: now,
        lastActivityAt: null,
        title: 'Founder',
        department: null,
        metadata: { source: 'test' },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];

    await db.insert(memberships).values(testMemberships);

    if (options.verbose) {
      console.log(`  ✅ Created ${testMemberships.length} test memberships`);
    }

    // ============================================
    // TEST PROJECTS DATA - ✅ FIXED: Safe access
    // ============================================

    const testProjects = [
      {
        id: crypto.randomUUID(),
        organizationId: orgAlpha.id, // ✅ FIXED: Safe access
        ownerId: adminUser.id, // ✅ FIXED: Safe access
        name: 'Test Project Alpha',
        slug: 'test-project-alpha',
        description: 'Primary test project for comprehensive testing',
        status: 'active' as const,
        priority: 'high' as const,
        visibility: 'organization' as const,
        color: '#3b82f6',
        icon: 'project',
        coverImageUrl: null,
        startDate: null,
        endDate: null,
        dueDate: null,
        progressPercentage: 45,
        allowComments: true,
        requireApproval: false,
        enableNotifications: true,
        budget: null,
        currency: 'USD',
        externalUrl: null,
        repositoryUrl: null,
        tags: ['testing', 'alpha', 'primary'],
        customFields: null,
        metadata: { source: 'test' },
        viewCount: 0,
        lastViewedAt: null,
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
        deletedAt: null,
      },
      {
        id: crypto.randomUUID(),
        organizationId: orgAlpha.id, // ✅ FIXED: Safe access
        ownerId: regularUser.id, // ✅ FIXED: Safe access
        name: 'Test Project Beta',
        slug: 'test-project-beta',
        description: 'Secondary test project for feature testing',
        status: 'inactive' as const,
        priority: 'medium' as const,
        visibility: 'private' as const,
        color: '#10b981',
        icon: 'test',
        coverImageUrl: null,
        startDate: null,
        endDate: null,
        dueDate: null,
        progressPercentage: 20,
        allowComments: false,
        requireApproval: true,
        enableNotifications: false,
        budget: null,
        currency: 'USD',
        externalUrl: null,
        repositoryUrl: null,
        tags: ['testing', 'beta', 'features'],
        customFields: null,
        metadata: { source: 'test' },
        viewCount: 0,
        lastViewedAt: null,
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
        deletedAt: null,
      },
    ];

    await db.insert(projects).values(testProjects);

    if (options.verbose) {
      console.log(`  ✅ Created ${testProjects.length} test projects`);
    }

    // ============================================
    // TEST CONTACTS DATA - ✅ FIXED: Safe access
    // ============================================

    const testContacts = [
      {
        id: crypto.randomUUID(),
        organizationId: orgAlpha.id, // ✅ FIXED: Safe access
        createdBy: adminUser.id, // ✅ FIXED: Safe access
        assignedTo: regularUser.id, // ✅ FIXED: Safe access
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        mobile: '+1-555-0124',
        companyName: 'Example Corp',
        jobTitle: 'Senior Developer',
        department: 'Engineering',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        website: 'https://example.com',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        twitterHandle: '@johndoe',
        type: 'customer' as const,
        status: 'active' as const,
        source: 'website',
        referredBy: null,
        tags: ['vip', 'enterprise'],
        notes: 'Important customer contact',
        emailOptIn: true,
        smsOptIn: false,
        marketingOptIn: true,
        lastContactedAt: null,
        lastContactMethod: null,
        nextFollowUpAt: null,
        customFields: null,
        metadata: { source: 'test' },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      {
        id: crypto.randomUUID(),
        organizationId: orgAlpha.id, // ✅ FIXED: Safe access
        createdBy: regularUser.id, // ✅ FIXED: Safe access
        assignedTo: null,
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
        email: 'jane.smith@test.com',
        phone: '+1-555-0456',
        mobile: null,
        companyName: 'Test Industries',
        jobTitle: 'Product Manager',
        department: 'Product',
        address: null,
        website: null,
        linkedinUrl: null,
        twitterHandle: null,
        type: 'lead' as const,
        status: 'active' as const,
        source: 'referral',
        referredBy: null,
        tags: ['hot-lead', 'enterprise'],
        notes: null,
        emailOptIn: true,
        smsOptIn: true,
        marketingOptIn: false,
        lastContactedAt: null,
        lastContactMethod: null,
        nextFollowUpAt: null,
        customFields: null,
        metadata: { source: 'test' },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ];

    await db.insert(contacts).values(testContacts);

    if (options.verbose) {
      console.log(`  ✅ Created ${testContacts.length} test contacts`);
      console.log('');
      console.log('🧪 TESTING DATA SUMMARY:');
      console.log(
        `   👤 Users: ${testUsers.length} (1 admin, 1 active, 1 inactive)`
      );
      console.log(
        `   🏢 Organizations: ${testOrganizations.length} (1 private, 1 public)`
      );
      console.log(
        `   👥 Memberships: ${testMemberships.length} (various roles)`
      );
      console.log(
        `   📊 Projects: ${testProjects.length} (1 active, 1 inactive)`
      );
      console.log(`   📇 Contacts: ${testContacts.length} (various types)`);
      console.log('');
      console.log('🔑 TEST LOGIN CREDENTIALS:');
      console.log('   📧 Admin: test.admin@test.com');
      console.log('   📧 User: test.user@test.com');
      console.log('   🔒 Password: Not set - use password reset');
    }
  },
};
