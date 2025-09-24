// packages/auth/src/lib/auth/session.ts

import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { InferModel } from "drizzle-orm";
import { users } from "@workspace/database/lib/db/schema";

type SessionData = {
  user: { id: number };
  expires: string;
};

type NewUser = InferModel<typeof users, "insert">;

const key = new TextEncoder().encode(process.env.AUTH_SECRET!);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string,
) {
  return compare(plainTextPassword, hashedPassword);
}

export async function signToken(payload: SessionData): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day")
    .sign(key);
}

export async function verifyToken(token: string): Promise<SessionData> {
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
  return payload as SessionData;
}

export async function getSession(): Promise<SessionData | null> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return verifyToken(session);
}

export async function setSession(user: NewUser): Promise<void> {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const data: SessionData = {
    user: { id: user.id! },
    expires: expires.toISOString(),
  };
  const token: string = await signToken(data);
  (await cookies()).set("session", token, {
    expires,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}
