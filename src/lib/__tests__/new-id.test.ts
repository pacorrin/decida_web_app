import { afterEach, describe, expect, it, vi } from "vitest";
import { newId } from "../new-id";

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => vi.unstubAllGlobals());

describe("newId", () => {
  it("devuelve un UUID v4", () => {
    expect(newId()).toMatch(V4);
  });

  it("sin crypto.randomUUID (contexto http) arma un UUID v4 válido y distinto cada vez", () => {
    vi.stubGlobal("crypto", { getRandomValues: crypto.getRandomValues.bind(crypto) });
    const a = newId();
    expect(a).toMatch(V4);
    expect(newId()).not.toBe(a);
  });
});
