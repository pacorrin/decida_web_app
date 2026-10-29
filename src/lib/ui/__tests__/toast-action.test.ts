import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  loading: vi.fn(() => "toast-1"),
  success: vi.fn(),
  error: vi.fn(),
  dismiss: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: m }));

import { runActionWithToast } from "../toast-action";

const assign = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  m.loading.mockReturnValue("toast-1");
  vi.stubGlobal("window", { location: { assign } });
});
afterEach(() => vi.unstubAllGlobals());

const opts = { loading: "Procesando…", success: "Listo", keepLoadingOnRedirect: true };

describe("runActionWithToast", () => {
  it("salida a Stripe: navega a la URL sin mostrar ningún aviso de error", async () => {
    const result = await runActionWithToast(
      async () => ({ success: true, redirectUrl: "https://checkout.stripe.com/c/pay/cs_test_1" }),
      opts,
    );
    expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/c/pay/cs_test_1");
    expect(m.error).not.toHaveBeenCalled();
    expect(m.success).not.toHaveBeenCalled();
    expect(result?.success).toBe(true);
  });

  it("éxito normal: muestra el aviso de éxito y no navega", async () => {
    await runActionWithToast(async () => ({ success: true }), opts);
    expect(m.success).toHaveBeenCalledWith("Listo", { id: "toast-1" });
    expect(assign).not.toHaveBeenCalled();
  });

  it("fallo devuelto por la acción: aviso de error con su mensaje", async () => {
    await runActionWithToast(async () => ({ success: false, message: "Ese plan no existe." }), opts);
    expect(m.error).toHaveBeenCalledWith("Ese plan no existe.", { id: "toast-1" });
  });

  it("si la acción lanza de verdad, sí avisa del error", async () => {
    await runActionWithToast(async () => {
      throw new Error("boom");
    }, opts);
    expect(m.error).toHaveBeenCalled();
  });

  it("redirección interna (la acción no regresa nada): deja el aviso de espera si se pide", async () => {
    await runActionWithToast(async () => undefined, opts);
    expect(m.dismiss).not.toHaveBeenCalled();
    expect(m.error).not.toHaveBeenCalled();
  });
});
