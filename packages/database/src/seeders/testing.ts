// packages/database/src/seeders/testing.ts
// ============================================
// TESTING SEEDERS - COMPREHENSIVE TEST DATA
// ============================================

import type { Database } from '../connection';
import type { SeedOptions } from '../index';
import {
  contacts,
  memberships,
  organizations,
  projects,
  users,
} from '../schemas';

export async function testingSeeder(
  db: Database,
  options: SeedOptions
): Promise<void> {
  if (options.verbose) {
    console.log('Running testing comprehensive seed...');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Testing seeder cannot run in production environment');
  }

  const existingUsers = await db.select().from(users).limit(1);

  if (existingUsers.length > 0 && !options.force) {
    if (options.verbose) {
      console.log('Test data already exists, skipping');
    }
    return;
  }

  const now = new Date();
  const tenant_id_alpha = crypto.randomUUID();
  const tenant_id_beta = crypto.randomUUID();

  const testUsers = [
    {
      id: crypto.randomUUID(),
      organization_id: '',
      name: 'Test Admin',
      email: 'test.admin@test.com',
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
      first_name: 'Test',
      last_name: 'Admin',
      avatar_url: null,
      timezone: 'UTC',
      locale: 'en',
      email_notifications: true,
      marketing_emails: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      id: crypto.randomUUID(),
      organization_id: '',
      name: 'Test User',
      email: 'test.user@test.com',
      image: null,
      email_verified: now,
      password_hash: null,
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
      timezone: 'America/New_York',
      locale: 'en',
      email_notifications: true,
      marketing_emails: true,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      id: crypto.randomUUID(),
      organization_id: null,
      name: 'Inactive User',
      email: 'test.inactive@test.com',
      image: null,
      email_verified: null,
      password_hash: null,
      is_active: false,
      is_super_admin: false,
      is_email_verified: false,
      last_login_at: null,
      last_login_ip: null,
      login_attempts: 3,
      locked_until: null,
      first_name: 'Inactive',
      last_name: 'User',
      avatar_url: null,
      timezone: 'UTC',
      locale: 'en',
      email_notifications: false,
      marketing_emails: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
  ];

  const testOrganizations = [
    {
      id: crypto.randomUUID(),
      tenant_id: tenant_id_alpha,
      name: 'Test Organization Alpha',
      slug: 'test-org-alpha',
      description: 'Primary test organization for comprehensive testing',
      website: null,
      logo_url: null,
      banner_url: null,
      brand_color: '#3b82f6',
      is_public: false,
      allow_join_requests: true,
      require_approval: false,
      member_limit: 10,
      project_limit: 5,
      storage_limit: 1073741824,
      contact_email: null,
      contact_phone: null,
      address_street: null,
      address_city: null,
      address_state: null,
      address_zip_code: null,
      address_country: null,
      tax_id: null,
      industry: 'technology',
      company_size: '11-50',
      plan_type: 'professional',
      billing_email: null,
      owner_id: testUsers[0]!.id,
      is_active: true,
      is_verified: true,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      id: crypto.randomUUID(),
      tenant_id: tenant_id_beta,
      name: 'Test Organization Beta',
      slug: 'test-org-beta',
      description: 'Secondary test organization for multi-org testing',
      website: null,
      logo_url: null,
      banner_url: null,
      brand_color: '#10b981',
      is_public: true,
      allow_join_requests: false,
      require_approval: true,
      member_limit: 5,
      project_limit: 3,
      storage_limit: 536870912,
      contact_email: null,
      contact_phone: null,
      address_street: null,
      address_city: null,
      address_state: null,
      address_zip_code: null,
      address_country: null,
      tax_id: null,
      industry: 'consulting',
      company_size: '1-10',
      plan_type: 'starter',
      billing_email: null,
      owner_id: testUsers[1]!.id,
      is_active: true,
      is_verified: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
  ];

  testUsers[0]!.organization_id = testOrganizations[0]!.id;
  testUsers[1]!.organization_id = testOrganizations[1]!.id;

  await db.insert(users).values(testUsers);

  if (options.verbose) {
    console.log(`Created ${testUsers.length} test users`);
  }

  await db.insert(organizations).values(testOrganizations);

  if (options.verbose) {
    console.log(`Created ${testOrganizations.length} test organizations`);
  }

  const adminUser = testUsers[0]!;
  const regularUser = testUsers[1]!;
  const orgAlpha = testOrganizations[0]!;
  const orgBeta = testOrganizations[1]!;

  const testMemberships = [
    {
      user_id: adminUser.id,
      organization_id: orgAlpha.id,
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
    },
    {
      user_id: regularUser.id,
      organization_id: orgAlpha.id,
      role: 'admin' as const,
      can_invite: true,
      can_manage_projects: true,
      can_manage_members: false,
      can_manage_billing: false,
      can_manage_settings: false,
      can_delete_organization: false,
      status: 'active' as const,
      invited_by: adminUser.id,
      invited_at: now,
      accepted_at: now,
      last_activity_at: null,
      title: 'Project Manager',
      department: 'Operations',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
    {
      user_id: regularUser.id,
      organization_id: orgBeta.id,
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
      title: 'Founder',
      department: null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
  ];

  await db.insert(memberships).values(testMemberships);

  if (options.verbose) {
    console.log(`Created ${testMemberships.length} test memberships`);
  }

  try {
    const testProjects = [
      {
        id: crypto.randomUUID(),
        organization_id: orgAlpha.id,
        owner_id: adminUser.id,
        name: 'Test Project Alpha',
        slug: 'test-project-alpha',
        description: 'Primary test project for comprehensive testing',
        status: 'active' as const,
        priority: 'high' as const,
        visibility: 'organization' as const,
        color: '#3b82f6',
        icon: 'project',
        cover_image_url: null,
        start_date: null,
        end_date: null,
        due_date: null,
        progress_percentage: 45,
        allow_comments: true,
        require_approval: false,
        enable_notifications: true,
        budget: null,
        currency: 'USD',
        external_url: null,
        repository_url: null,
        tags: 'testing,alpha,primary',
        view_count: 0,
        last_viewed_at: null,
        created_at: now,
        updated_at: now,
        archived_at: null,
        deleted_at: null,
      },
      {
        id: crypto.randomUUID(),
        organization_id: orgAlpha.id,
        owner_id: regularUser.id,
        name: 'Test Project Beta',
        slug: 'test-project-beta',
        description: 'Secondary test project for feature testing',
        status: 'inactive' as const,
        priority: 'medium' as const,
        visibility: 'private' as const,
        color: '#10b981',
        icon: 'test',
        cover_image_url: null,
        start_date: null,
        end_date: null,
        due_date: null,
        progress_percentage: 20,
        allow_comments: false,
        require_approval: true,
        enable_notifications: false,
        budget: null,
        currency: 'USD',
        external_url: null,
        repository_url: null,
        tags: 'testing,beta,features',
        view_count: 0,
        last_viewed_at: null,
        created_at: now,
        updated_at: now,
        archived_at: null,
        deleted_at: null,
      },
    ];

    await db.insert(projects).values(testProjects);

    if (options.verbose) {
      console.log(`Created ${testProjects.length} test projects`);
    }
  } catch (error) {
    if (options.verbose) {
      console.warn('Projects table not available, skipping projects seed');
    }
  }

  try {
    const testContacts = [
      {
        id: crypto.randomUUID(),
        organization_id: orgAlpha.id,
        created_by: adminUser.id,
        assigned_to: regularUser.id,
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        mobile: '+1-555-0124',
        company_name: 'Example Corp',
        job_title: 'Senior Developer',
        department: 'Engineering',
        address_street: '123 Main St',
        address_city: 'New York',
        address_state: 'NY',
        address_zip_code: '10001',
        address_country: 'USA',
        website: 'https://example.com',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        twitter_handle: '@johndoe',
        type: 'customer' as const,
        status: 'active' as const,
        source: 'website',
        referred_by: null,
        tags: 'vip,enterprise',
        notes: 'Important customer contact',
        email_opt_in: true,
        sms_opt_in: false,
        marketing_opt_in: true,
        last_contacted_at: null,
        last_contact_method: null,
        next_follow_up_at: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: crypto.randomUUID(),
        organization_id: orgAlpha.id,
        created_by: regularUser.id,
        assigned_to: null,
        first_name: 'Jane',
        last_name: 'Smith',
        full_name: 'Jane Smith',
        email: 'jane.smith@test.com',
        phone: '+1-555-0456',
        mobile: null,
        company_name: 'Test Industries',
        job_title: 'Product Manager',
        department: 'Product',
        address_street: null,
        address_city: null,
        address_state: null,
        address_zip_code: null,
        address_country: null,
        website: null,
        linkedin_url: null,
        twitter_handle: null,
        type: 'lead' as const,
        status: 'active' as const,
        source: 'referral',
        referred_by: null,
        tags: 'hot-lead,enterprise',
        notes: null,
        email_opt_in: true,
        sms_opt_in: true,
        marketing_opt_in: false,
        last_contacted_at: null,
        last_contact_method: null,
        next_follow_up_at: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ];

    await db.insert(contacts).values(testContacts);

    if (options.verbose) {
      console.log(`Created ${testContacts.length} test contacts`);
    }
  } catch (error) {
    if (options.verbose) {
      console.warn('Contacts table not available, skipping contacts seed');
    }
  }

  if (options.verbose) {
    console.log('');
    console.log('TESTING DATA SUMMARY:');
    console.log(`Users: ${testUsers.length} (1 admin, 1 active, 1 inactive)`);
    console.log(`Organizations: ${testOrganizations.length} (1 private, 1 public)`);
    console.log(`Tenants: 2 (Alpha: ${tenant_id_alpha.slice(0, 8)}..., Beta: ${tenant_id_beta.slice(0, 8)}...)`);
    console.log(`Memberships: ${testMemberships.length} (various roles)`);
    console.log('');
    console.log('TEST LOGIN CREDENTIALS:');
    console.log('Admin: test.admin@test.com');
    console.log('User: test.user@test.com');
    console.log('Password: Not set - use password reset');
  }
}
