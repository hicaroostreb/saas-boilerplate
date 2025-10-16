// packages/database/src/seeders/testing.ts
// ============================================
// TESTING SEED - MULTI-TENANT READY
// ============================================

import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { Database } from '../connection/index.js';
import {
  contacts,
  memberships,
  organizations,
  users,
} from '../schemas/index.js';

export async function runTestingSeed(db: Database): Promise<number> {
  console.log('Testing seed: Creating comprehensive test data...');

  let recordsCreated = 0;

  try {
    // Test tenant ID
    const testTenantId = 'test-tenant-' + crypto.randomUUID();

    // LIMPAR dados de teste existentes primeiro
    console.log('Cleaning existing test data...');
    await db.delete(contacts).where(eq(contacts.id, 'test-contact-1'));
    await db.delete(memberships).where(eq(memberships.user_id, 'test-user-1'));
    await db.delete(organizations).where(eq(organizations.id, 'test-org-1'));
    await db.delete(users).where(eq(users.id, 'test-user-1'));

    // Hash password for test user
    const testPassword = await hash('TestPass123', 12);

    // Test user
    const testUser = {
      id: 'test-user-1',
      tenant_id: testTenantId,
      name: 'Test User',
      email: 'test1@example.com',
      password_hash: testPassword,
      phone: null,
      image: null,
      email_verified: new Date(),
      role: 'user' as const,
      status: 'active' as const,
      is_active: true,
      is_super_admin: false,
      is_email_verified: true,
      two_factor_enabled: false,
      two_factor_secret: null,
      locked_until: null,
      failed_login_attempts: 0,
      last_login_at: null,
      password_changed_at: new Date(),
      timezone: 'UTC',
      locale: 'en',
      notification_preferences: null,
      metadata: null,
      bio: 'Test user for development',
      avatar_url: null,
      onboarding_completed: true,
      marketing_emails: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    await db.insert(users).values([testUser]);
    recordsCreated += 1;
    console.log(`✅ Created 1 user with password: TestPass123`);

    // Test organization
    const testOrganization = {
      id: 'test-org-1',
      tenant_id: testTenantId,
      name: 'Test Organization',
      slug: 'test-org',
      description: 'Test organization for development',
      domain: null,
      website: 'https://test.example.com',
      logo_url: null,
      banner_url: null,
      brand_color: null,
      is_public: false,
      is_active: true,
      is_verified: true,
      industry: 'technology' as const,
      company_size: '11-50' as const,
      founded_year: null,
      address: null,
      city: null,
      state: null,
      country: null,
      postal_code: null,
      phone: null,
      email: null,
      social_links: null,
      settings: null,
      metadata: null,
      plan_type: 'professional' as const,
      subscription_status: 'active' as const,
      trial_ends_at: null,
      billing_email: null,
      tax_id: null,
      owner_id: 'test-user-1',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    await db.insert(organizations).values([testOrganization]);
    recordsCreated += 1;
    console.log(`✅ Created 1 organization`);

    // Test membership
    const testMembership = {
      tenant_id: testTenantId,
      user_id: 'test-user-1',
      organization_id: 'test-org-1',
      role: 'owner' as const,
      status: 'active' as const,
      permissions: null,
      invited_by: null,
      invited_at: null,
      joined_at: new Date(),
      title: 'Owner',
      department: null,
      metadata: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(memberships).values([testMembership]);
    recordsCreated += 1;
    console.log(`✅ Created 1 membership`);

    // Test contact
    const testContact = {
      id: 'test-contact-1',
      tenant_id: testTenantId,
      name: 'John Doe',
      organization_id: 'test-org-1',
      created_by: 'test-user-1',
      full_name: 'John Doe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      company: 'Example Corp',
      job_title: 'Manager',
      source: 'web' as const,
      status: 'active' as const,
      priority: 'medium' as const,
      tags: null,
      notes: null,
      address: null,
      city: null,
      state: null,
      country: null,
      postal_code: null,
      website: null,
      linkedin_url: null,
      twitter_url: null,
      custom_fields: null,
      lead_score: null,
      last_contacted_at: null,
      next_followup_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    await db.insert(contacts).values([testContact]);
    recordsCreated += 1;
    console.log(`✅ Created 1 contact`);

    console.log(
      `\n✅ Testing seed completed: ${recordsCreated} records created`
    );
    console.log(`\n��� LOGIN CREDENTIALS:`);
    console.log(`   Tenant ID: ${testTenantId}`);
    console.log(`   Email: test1@example.com`);
    console.log(`   Password: TestPass123`);

    return recordsCreated;
  } catch (error) {
    console.error('❌ Testing seed failed:', error);
    throw error;
  }
}
