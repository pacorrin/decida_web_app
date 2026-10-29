import "dotenv/config";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { prisma } from "@/lib/prisma";
import { createSuggestion } from "../create";
import {
  SUGGESTION_MAX_LENGTH,
  SUGGESTION_MAX_PER_HOUR,
  sanitizePage,
} from "../schema";

const suffix = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const ids: string[] = [];

async function trackUser() {
  const user = await prisma.users.create({
    data: { user_email: `suggest-${suffix()}@example.com`, user_password_hash: "test" },
  });
  ids.push(user.user_id);
  return user;
}

beforeAll(async () => {
  await prisma.$queryRaw`SELECT 1`;
});
afterEach(async () => {
  const list = [...ids];
  ids.length = 0;
  if (!list.length) return;
  await prisma.suggestions.deleteMany({ where: { sugg_user_id: { in: list } } });
  await prisma.users.deleteMany({ where: { user_id: { in: list } } });
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe("createSuggestion", () => {
  it("guarda el mensaje ligado a la cuenta de la sesión y la ruta de origen", async () => {
    const user = await trackUser();
    const result = await createSuggestion({
      userId: user.user_id,
      message: "  Me gustaría comparar dos ideas lado a lado  ",
      page: "/cuenta/creditos?x=1",
    });
    expect(result).toEqual({ ok: true });
    const rows = await prisma.suggestions.findMany({ where: { sugg_user_id: user.user_id } });
    expect(rows).toHaveLength(1);
    expect(rows[0].sugg_message).toBe("Me gustaría comparar dos ideas lado a lado");
    expect(rows[0].sugg_page).toBe("/cuenta/creditos");
  });

  it("rechaza mensajes muy cortos, vacíos o demasiado largos sin guardar nada", async () => {
    const user = await trackUser();
    for (const message of ["", "   ", "corto", "x".repeat(SUGGESTION_MAX_LENGTH + 1), null]) {
      const r = await createSuggestion({ userId: user.user_id, message });
      expect(r.ok).toBe(false);
      expect(r.ok === false && r.reason).toBe("invalid");
    }
    expect(await prisma.suggestions.count({ where: { sugg_user_id: user.user_id } })).toBe(0);
  });

  it("limita a unas pocas por hora y vuelve a aceptar pasada la hora", async () => {
    const user = await trackUser();
    const now = new Date();
    for (let i = 0; i < SUGGESTION_MAX_PER_HOUR; i++) {
      const r = await createSuggestion({ userId: user.user_id, message: `Sugerencia número ${i} de prueba`, now });
      expect(r.ok).toBe(true);
    }
    const blocked = await createSuggestion({ userId: user.user_id, message: "Una más de prueba", now });
    expect(blocked.ok === false && blocked.reason).toBe("rate_limited");

    const later = new Date(now.getTime() + 61 * 60 * 1000);
    expect((await createSuggestion({ userId: user.user_id, message: "Ya pasó una hora", now: later })).ok).toBe(true);
  });

  it("el límite es por persona, no global", async () => {
    const a = await trackUser();
    const b = await trackUser();
    const now = new Date();
    for (let i = 0; i < SUGGESTION_MAX_PER_HOUR; i++) {
      await createSuggestion({ userId: a.user_id, message: `Sugerencia de A número ${i}`, now });
    }
    expect((await createSuggestion({ userId: b.user_id, message: "Sugerencia de B distinta", now })).ok).toBe(true);
  });
});

describe("sanitizePage", () => {
  it("solo acepta rutas internas cortas y quita query y hash", () => {
    expect(sanitizePage("/cuenta?x=1#a")).toBe("/cuenta");
    expect(sanitizePage("https://evil.example/x")).toBeNull();
    expect(sanitizePage("//evil.example")).toBeNull();
    expect(sanitizePage("/" + "a".repeat(200))).toBeNull();
    expect(sanitizePage(null)).toBeNull();
  });
});
