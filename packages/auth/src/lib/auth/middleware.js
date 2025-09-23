// packages/auth/src/lib/auth/middleware.ts
import { redirect } from "next/navigation";
import { getUser, getTeamForUser } from "@your-org/auth/lib/db/queries";
export function validatedAction(schema, action) {
  return async (prevState, formData) => {
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }
    return action(parsed.data, formData);
  };
}
export function validatedActionWithUser(schema, action) {
  return async (prevState, formData) => {
    const user = await getUser();
    if (!user) throw new Error("User not authenticated");
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }
    return action(parsed.data, formData, user);
  };
}
export function withTeam(action) {
  return async (formData) => {
    const user = await getUser();
    if (!user) redirect("/sign-in");
    const team = await getTeamForUser();
    if (!team) throw new Error("Team not found");
    return action(formData, team);
  };
}
