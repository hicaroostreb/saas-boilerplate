// packages/auth/src/lib/auth/session.ts
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;
export async function hashPassword(password) {
  return hash(password, SALT_ROUNDS);
}
export async function comparePasswords(plainTextPassword, hashedPassword) {
  return compare(plainTextPassword, hashedPassword);
}
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day")
    .sign(key);
}
export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
  return payload;
}
export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return verifyToken(session);
}
export async function setSession(user) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const data = {
    user: { id: user.id },
    expires: expires.toISOString(),
  };
  const token = await signToken(data)(await cookies()).set("session", token, {
    expires,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}
