import { redirect } from "next/navigation";
import { z } from "zod";
import type { InferModel } from "drizzle-orm";
import { users } from "@workspace/database/lib/db/schema";
import {
  getUser,
  getTeamForUser,
  Team,
  Member,
  TeamDataWithMembers,
} from "../db/queries";

type User = InferModel<typeof users, "select">;

// Usar os tipos importados do queries.ts em vez de redefinir
export type { Team, Member, TeamDataWithMembers };

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: unknown; // Evita 'any', mais seguro mesmo para valores diversos
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData) => {
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }
    return action(parsed.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User,
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user) throw new Error("User not authenticated");
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }
    return action(parsed.data, formData, user);
  };
}

export function withTeam<T>(
  action: (formData: FormData, team: TeamDataWithMembers) => Promise<T>,
) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) redirect("/sign-in");
    const team = await getTeamForUser(user.id);
    if (!team) throw new Error("Team not found");
    return action(formData, team);
  };
}
