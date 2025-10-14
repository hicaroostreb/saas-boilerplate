// packages/database/src/seeders/testing.ts
// ============================================
// TESTING SEED - EXACT FIELD NAMES FROM SCHEMA
// ============================================

import type { Database } from '../connection/index.js';
import { 
  users, 
  organizations, 
  memberships,
  contacts,
} from '../schemas/index.js';

export async function runTestingSeed(db: Database): Promise<number> {
  console.log('Testing seed: Creating comprehensive test data...');
  
  let recordsCreated = 0;

  try {
    // Test users - EXACT FIELD NAMES
    const testUsers = [
      {
        id: 'test-user-1',
        name: 'Test User One',
        email: 'test1@example.com',
        image: null,
        email_verified: new Date(),
        role: 'user' as const,
        status: 'active' as const,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await db.insert(users).values(testUsers);
    recordsCreated += testUsers.length;
    console.log(`Created ${testUsers.length} users`);

    // Test organizations - EXACT FIELD NAMES
    const testOrganizations = [
      {
        id: 'test-org-1',
        tenant_id: 'test-tenant-1',
        name: 'Test Organization Alpha',
        slug: 'test-alpha',  
        description: 'First test organization',
        website: 'https://alpha.test.com',
        industry: 'technology' as const,
        company_size: '11-50' as const,
        plan_type: 'professional' as const,
        owner_id: 'test-user-1',
        is_active: true,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await db.insert(organizations).values(testOrganizations);
    recordsCreated += testOrganizations.length;
    console.log(`Created ${testOrganizations.length} organizations`);

    // Test memberships - EXACT FIELD NAMES (NO ID FIELD!)
    const testMemberships = [
      {
        user_id: 'test-user-1',
        organization_id: 'test-org-1',
        role: 'owner' as const,
        status: 'active' as const,
        joined_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }
    ];

    await db.insert(memberships).values(testMemberships);
    recordsCreated += testMemberships.length;
    console.log(`Created ${testMemberships.length} memberships`);

    // Test contacts - EXACT FIELD NAMES
    const testContacts = [
      {
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
      }
    ];

    await db.insert(contacts).values(testContacts);
    recordsCreated += testContacts.length;
    console.log(`Created ${testContacts.length} contacts`);

    console.log(`Testing seed completed: ${recordsCreated} records created`);
    return recordsCreated;

  } catch (error) {
    console.error('Testing seed failed:', error);
    throw error;
  }
}
