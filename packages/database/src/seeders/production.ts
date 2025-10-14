// packages/database/src/seeders/production.ts
// ============================================
// PRODUCTION SEED - EXACT FIELD NAMES
// ============================================

import type { Database } from '../connection/index.js';
import { 
  users, 
  organizations, 
  memberships,
} from '../schemas/index.js';

export async function productionSeeder(db: Database): Promise<number> {
  console.log('Production seed: Creating essential system data...');
  
  let recordsCreated = 0;

  try {
    // System admin user - EXACT FIELD NAMES
    const systemAdmin = {
      id: 'system-admin-' + crypto.randomUUID(),
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@system.local',
      image: null,
      email_verified: new Date(),
      role: 'admin' as const,
      status: 'active' as const,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(users).values(systemAdmin);
    recordsCreated++;

    // Default organization - EXACT FIELD NAMES
    const defaultOrg = {
      id: 'default-org-' + crypto.randomUUID(),
      tenant_id: 'system-tenant-' + crypto.randomUUID(),
      name: 'System Organization',
      slug: 'system',
      description: 'Default system organization',
      industry: 'technology' as const,
      company_size: '1-10' as const,
      plan_type: 'enterprise' as const,
      owner_id: systemAdmin.id,
      is_active: true,
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(organizations).values(defaultOrg);
    recordsCreated++;

    // System membership - EXACT FIELD NAMES (NO ID!)
    const systemMembership = {
      user_id: systemAdmin.id,
      organization_id: defaultOrg.id,
      role: 'owner' as const,
      status: 'active' as const,
      joined_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.insert(memberships).values(systemMembership);
    recordsCreated++;

    console.log(`Production seed completed: ${recordsCreated} records created`);
    return recordsCreated;

  } catch (error) {
    console.error('Production seed failed:', error);
    throw error;
  }
}
