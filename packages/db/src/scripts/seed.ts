import { db } from "../lib/db/drizzle.js";
import { users, teams, teamMembers } from "../lib/db/schema.js";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Seed the database with a default user, team, and membership if they don't exist.
 *
 * Ensures a user with email `test@test.com` and password `admin123` exists (creates one if missing),
 * ensures a "Default Team" owned by that user exists (creates if missing), and ensures the user is
 * a member of that team with the "owner" role (adds membership if missing). Logs progress and
 * outcomes to the console.
 *
 * Side effects:
 * - Inserts into users, teams, and teamMembers tables as needed.
 * - Writes console output.
 * - On error, logs the error and exits the process with code 1.
 */
async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Verificar se já existe usuário padrão
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "test@test.com"))
      .limit(1);

    let user;
    if (existingUser.length > 0) {
      console.log("ℹ️  Default user already exists: test@test.com");
      user = existingUser[0];
    } else {
      // Criar usuário padrão
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const [newUser] = await db
        .insert(users)
        .values({
          email: "test@test.com",
          name: "Test User",
          passwordHash: hashedPassword,
        })
        .returning();

      user = newUser;
      console.log("✅ Created default user:", user.email);
    }

    // Verificar se já existe time padrão
    const existingTeam = await db
      .select()
      .from(teams)
      .where(eq(teams.ownerId, user.id))
      .limit(1);

    let team;
    if (existingTeam.length > 0) {
      console.log("ℹ️  Default team already exists for user");
      team = existingTeam[0];
    } else {
      // Criar time padrão
      const [newTeam] = await db
        .insert(teams)
        .values({
          name: "Default Team",
          ownerId: user.id,
        })
        .returning();

      team = newTeam;
      console.log("✅ Created default team:", team.name);
    }

    // Verificar se usuário já está no time
    const existingMember = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, user.id)))
      .limit(1);

    if (existingMember.length === 0) {
      // Adicionar usuário ao time
      await db.insert(teamMembers).values({
        teamId: team.id,
        userId: user.id,
        role: "owner",
      });

      console.log("✅ Added user to team");
    } else {
      console.log("ℹ️  User already member of team");
    }

    console.log("\n🎉 Seed completed!");
    console.log("📋 Default login:");
    console.log("Email: test@test.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
