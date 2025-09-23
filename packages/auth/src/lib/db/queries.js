// packages/auth/src/lib/db/queries.ts
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@your-org/db/lib/db/drizzle";
import {
  users,
  teams,
  teamMembers,
  activityLogs,
} from "@your-org/db/lib/db/schema";
import { cookies } from "next/headers";
import { verifyToken } from "@your-org/auth/lib/auth/session";
export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie?.value) return null;
  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number" ||
    new Date(sessionData.expires) < new Date()
  ) {
    return null;
  }
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);
  return result[0] || null;
}
export async function getUserWithTeam(userId) {
  const result = await db
    .select({ user: users, teamId: teamMembers.teamId })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);
  return result[0] || null;
}
export async function getTeamByStripeCustomerId(customerId) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);
  return result[0] || null;
}
export async function updateTeamSubscription(teamId, subscriptionData) {
  await db
    .update(teams)
    .set({ ...subscriptionData, updatedAt: new Date() })
    .where(eq(teams.id, teamId));
}
export async function getActivityLogs() {
  const user = await getUser();
  if (!user) throw new Error("User not authenticated");
  return db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}
export async function getTeamForUser() {
  const user = await getUser();
  if (!user) return null;
  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    },
  });
  return result?.team || null;
}
