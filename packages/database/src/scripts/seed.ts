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
    // Hash password
    const hashedPassword = await bcrypt.hash('demo123456', 12);

    // Create demo user
    const demoUser = await db
      .insert(users)
      .values({
        name: 'Demo User',
        email: 'demo@example.com',
        passwordHash: hashedPassword,
        role: 'owner',
      })
      .returning();

    console.log('✅ Demo user created:', demoUser[0].email);

    // Create demo team
    const demoTeam = await db
      .insert(teams)
      .values({
        name: 'Demo Team',
        ownerId: demoUser[0].id,
        planName: 'free',
        subscriptionStatus: 'active',
      })
      .returning();

    console.log('✅ Demo team created:', demoTeam[0].name);

    // Add user to team
    await db.insert(teamMembers).values({
      userId: demoUser[0].id,
      teamId: demoTeam[0].id,
      role: 'owner',
    });

    console.log('✅ User added to team');
    console.log('🎉 Seeding completed!');
    console.log('📧 Login: demo@example.com');
    console.log('🔑 Password: demo123456');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }

  process.exit(0);
}

seed();
