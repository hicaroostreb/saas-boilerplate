import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar .env.local da raiz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../../../../.env.local') });

import bcrypt from 'bcryptjs';
import { db } from '../client.js'; // ← .js para ESM
import { teamMembers, teams, users } from '../schema.js'; // ← .js para ESM

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // Hash password para corresponder ao README
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create test user (igual ao README)
    const testUser = await db
      .insert(users)
      .values({
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: hashedPassword,
        role: 'owner',
      })
      .returning();

    console.log('✅ Test user created:', testUser[0].email);

    // Create test team/organization (igual ao README)
    const testTeam = await db
      .insert(teams)
      .values({
        name: 'Test Organization',
        ownerId: testUser[0].id,
        planName: 'free',
        subscriptionStatus: 'active',
      })
      .returning();

    console.log('✅ Test organization created:', testTeam[0].name);

    // Add user to team
    await db.insert(teamMembers).values({
      userId: testUser[0].id,
      teamId: testTeam[0].id,
      role: 'owner',
    });

    console.log('✅ User added to organization');
    console.log('🎉 Seeding completed!');
    console.log('📧 Login: test@test.com');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }

  process.exit(0);
}

seed();
