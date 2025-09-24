import { db } from "@your-org/db/lib/db/drizzle";
import { users, teams, teamMembers } from "@your-org/db/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken } from "../auth/session";

export type Team = {
  id: number;
  name: string;
  ownerId: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeProductId: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Member = {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  joinedAt: Date;
  user: {
    id: number;
    name: string | null;
    email: string;
    passwordHash: string | null; // ADICIONADO
    createdAt: Date;
    deletedAt: Date | null;
  };
};

export type TeamDataWithMembers = Team & {
  teamMembers: Member[];
};

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie?.value) return null;

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    typeof sessionData.user.id !== "number" ||
    new Date(sessionData.expires) < new Date()
  ) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  return user || null;
}

export async function getTeamForUser(
  userId: number,
): Promise<TeamDataWithMembers | null> {
  const [{ teamId }] = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);
  if (!teamId) return null;

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);
  if (!team) return null;

  const members = await db
    .select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash, // ADICIONADO
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
      },
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));

  return {
    id: team.id,
    name: team.name,
    ownerId: team.ownerId,
    stripeCustomerId: team.stripeCustomerId,
    stripeSubscriptionId: team.stripeSubscriptionId,
    stripeProductId: team.stripeProductId,
    planName: team.planName,
    subscriptionStatus: team.subscriptionStatus,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    teamMembers: members,
  };
}

// Exporte também para uso em payments
export async function getTeamByStripeCustomerId(customerId: string) {
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);
  return team || null;
}

export async function updateTeamSubscription(
  teamId: number,
  data: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  },
): Promise<void> {
  await db
    .update(teams)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(teams.id, teamId));
}
