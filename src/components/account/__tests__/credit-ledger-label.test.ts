import { describe, expect, it } from "vitest";
import { entryLabel } from "../credit-ledger-list";

describe("entryLabel", () => {
  it("nombra la captura inteligente de Cifra en cobros y reembolsos", () => {
    expect(entryLabel({ cled_type: "spend", cled_metadata: { feature: "cifra_capture", images: 2 } })).toBe("Cifra - Captura inteligente");
    expect(entryLabel({ cled_type: "refund", cled_metadata: { feature: "cifra_capture_voice", reason: "failed" } })).toBe(
      "Reembolso: Cifra - Captura inteligente",
    );
  });

  it("deja el tipo de siempre en los demás movimientos", () => {
    expect(entryLabel({ cled_type: "spend", cled_metadata: { level: "basic" } })).toBe("Gasto");
    expect(entryLabel({ cled_type: "purchase", cled_metadata: null })).toBe("Compra");
  });
});
