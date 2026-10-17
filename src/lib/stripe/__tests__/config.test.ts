import { afterEach, describe, expect, it, vi } from "vitest";
import { isStripeEnabled, isStripeTestMode } from "../config";

afterEach(() => vi.unstubAllEnvs());

describe("modo de Stripe", () => {
  it("sin clave: deshabilitado y no es modo de prueba", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    expect(isStripeEnabled()).toBe(false);
    expect(isStripeTestMode()).toBe(false);
  });

  it("clave sk_test_: habilitado y en modo de prueba (sin cargos reales)", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_abc");
    expect(isStripeEnabled()).toBe(true);
    expect(isStripeTestMode()).toBe(true);
  });

  it("clave sk_live_: habilitado y NO es modo de prueba", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_abc");
    expect(isStripeEnabled()).toBe(true);
    expect(isStripeTestMode()).toBe(false);
  });
});
