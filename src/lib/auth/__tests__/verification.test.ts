import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { findFirst, update } = vi.hoisted(() => ({ findFirst: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { verification_codes: { findFirst, update } },
}));

import { verifyAuthCode } from "../verification";

const record = (over: Partial<{ vc_code: string; vc_attempts: number }> = {}) => ({
  vc_id: "c1",
  vc_code: "123456",
  vc_attempts: 0,
  ...over,
});

describe("verifyAuthCode", () => {
  beforeEach(() => {
    findFirst.mockReset();
    update.mockReset();
  });

  it("acepta el código correcto y lo marca como usado", async () => {
    findFirst.mockResolvedValue(record());
    const result = await verifyAuthCode("a@b.com", " 123456 ", "signup_verification");
    expect(result).toEqual({ success: true });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { vc_used_at: expect.any(Date) } }),
    );
  });

  it("cuenta un intento fallido sin invalidar el código", async () => {
    findFirst.mockResolvedValue(record({ vc_attempts: 1 }));
    const result = await verifyAuthCode("a@b.com", "000000", "signup_verification");
    expect(result.success).toBe(false);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { vc_attempts: 2 } }),
    );
  });

  it("invalida el código al llegar al quinto intento fallido", async () => {
    findFirst.mockResolvedValue(record({ vc_attempts: 4 }));
    const result = await verifyAuthCode("a@b.com", "000000", "signup_verification");
    expect(result).toMatchObject({ success: false, message: expect.stringContaining("intentos") });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { vc_attempts: 5, vc_used_at: expect.any(Date) },
      }),
    );
  });

  it("rechaza aunque el código sea correcto si ya agotó los intentos", async () => {
    findFirst.mockResolvedValue(record({ vc_attempts: 5 }));
    const result = await verifyAuthCode("a@b.com", "123456", "signup_verification");
    expect(result.success).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("rechaza si no hay código vigente", async () => {
    findFirst.mockResolvedValue(null);
    const result = await verifyAuthCode("a@b.com", "123456", "signup_verification");
    expect(result.success).toBe(false);
  });
});
