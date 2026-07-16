import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { HISTORY_SESSION_TTL_MS } from "./constants";
import { normalizeEmail } from "./verification";

export const HISTORY_SESSION_COOKIE = "decida_history_token";

export type HistorySession = {
  hses_id: string;
  hses_email: string;
  hses_token: string;
  hses_created_at: Date;
  hses_expires_at: Date;
};

export async function createHistorySession(email: string): Promise<HistorySession> {
  const normalizedEmail = normalizeEmail(email);
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + HISTORY_SESSION_TTL_MS);

  const session = await prisma.history_sessions.create({
    data: {
      hses_email: normalizedEmail,
      hses_token: token,
      hses_expires_at: expiresAt,
    },
  });

  await setHistorySessionCookie(token);
  return session;
}

export async function setHistorySessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(HISTORY_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: HISTORY_SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function clearHistorySessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(HISTORY_SESSION_COOKIE);
}

export async function getHistorySession(): Promise<HistorySession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(HISTORY_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.history_sessions.findUnique({
    where: { hses_token: token },
  });

  if (!session || session.hses_expires_at < new Date()) {
    await clearHistorySessionCookie();
    return null;
  }

  return session;
}

export async function requireHistorySession(): Promise<HistorySession> {
  const session = await getHistorySession();
  if (!session) {
    throw new Error("HISTORY_SESSION_REQUIRED");
  }
  return session;
}
