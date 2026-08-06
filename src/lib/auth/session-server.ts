import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_SESSION_TTL_MS } from "./constants";

export const USER_SESSION_COOKIE = "decida_user_token";

export async function createUserSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + AUTH_SESSION_TTL_MS);

  const session = await prisma.user_sessions.create({
    data: {
      usess_user_id: userId,
      usess_token: token,
      usess_expires_at: expiresAt,
    },
  });

  await setUserSessionCookie(token);
  return session;
}

export async function setUserSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function clearUserSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.user_sessions.findUnique({
    where: { usess_token: token },
    include: { user: true },
  });

  if (!session || session.usess_expires_at < new Date()) {
    if (session) {
      await prisma.user_sessions.delete({ where: { usess_id: session.usess_id } });
    }
    await clearUserSessionCookie();
    return null;
  }

  return session.user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("USER_SESSION_REQUIRED");
  }
  return user;
}
