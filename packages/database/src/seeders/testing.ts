// packages/database/src/seeders/testing.ts
// ============================================
// TESTING SEED - SINGLE USER ONLY
// ============================================
import { eq } from 'drizzle-orm';

import { hash } from 'bcryptjs';
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
    // LIMPAR dados de teste existentes primeiro
    console.log('Cleaning existing test data...');
    await db.delete(contacts).where(eq(contacts.id, 'test-contact-1'));
    await db.delete(memberships).where(eq(memberships.user_id, 'test-user-1'));
    await db.delete(organizations).where(eq(organizations.id, 'test-org-1'));
    await db.delete(users).where(eq(users.id, 'test-user-1'));

    // Hash password for test user
    const testPassword = await hash('TestPass123', 12);

    // APENAS 1 USUÁRIO DE TESTE
    const testUser = {
      id: 'test-user-1',
      name: 'Test User',
      email: 'test1@example.com',
      password_hash: testPassword,
      image: null,
      email_verified: new Date(),
      role: 'user' as const,
      status: 'active' as const,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(users).values([testUser]);
    recordsCreated += 1;
    console.log(`Created 1 user with password: TestPass123`);

    // Test organization
    const testOrganization = {
      id: 'test-org-1',
      tenant_id: 'test-tenant-1',
      name: 'Test Organization',
      slug: 'test-org',
      description: 'Test organization for development',
      website: 'https://test.example.com',
      industry: 'technology' as const,
      company_size: '11-50' as const,
      plan_type: 'professional' as const,
      owner_id: 'test-user-1',
      is_active: true,
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(organizations).values([testOrganization]);
    recordsCreated += 1;
    console.log(`Created 1 organization`);

    // Test membership
    const testMembership = {
      user_id: 'test-user-1',
      organization_id: 'test-org-1',
      role: 'owner' as const,
      status: 'active' as const,
      joined_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(memberships).values([testMembership]);
    recordsCreated += 1;
    console.log(`Created 1 membership`);

    // Test contact
    const testContact = {
      id: 'test-contact-1',
      organization_id: 'test-org-1',
      created_by: 'test-user-1',
      full_name: 'John Doe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      company: 'Example Corp',
      job_title: 'Manager',
      source: 'website' as const,
      status: 'active' as const,
      priority: 'medium' as const,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(contacts).values([testContact]);
    recordsCreated += 1;
    console.log(`Created 1 contact`);

    console.log(`Testing seed completed: ${recordsCreated} records created`);
    console.log(`LOGIN CREDENTIALS:`);
    console.log(`Email: test1@example.com`);
    console.log(`Password: TestPass123`);

    return recordsCreated;
  } catch (error) {
    console.error('Testing seed failed:', error);
    throw error;
  }
}
