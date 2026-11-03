import { describe, expect, it } from "vitest";
import { splitCardPayment } from "../card-payment";

describe("pago de tarjeta", () => {
  it("el saldo cubre el capital y los intereses van aparte", () => {
    expect(splitCardPayment(365_000, 195_000, 10_000)).toEqual({
      appliedCents: 185_000,
      interestCents: 10_000,
      untrackedCents: 0,
    });
  });

  it("lo que excede el saldo conocido son compras sin detalle", () => {
    expect(splitCardPayment(50_000, 500_000, 0)).toEqual({
      appliedCents: 50_000,
      interestCents: 0,
      untrackedCents: 450_000,
    });
  });

  it("sin saldo conocido todo el pago es compras sin detalle", () => {
    expect(splitCardPayment(0, 180_000, 0)).toEqual({
      appliedCents: 0,
      interestCents: 0,
      untrackedCents: 180_000,
    });
  });

  it("los intereses no pueden pasar del pago", () => {
    expect(splitCardPayment(100_000, 20_000, 50_000)).toEqual({
      appliedCents: 0,
      interestCents: 20_000,
      untrackedCents: 0,
    });
  });

  it("las tres partes siempre suman el pago", () => {
    for (const [b, p, i] of [[0, 1, 0], [10, 7, 3], [5, 100, 40], [99, 99, 0]]) {
      const s = splitCardPayment(b, p, i);
      expect(s.appliedCents + s.interestCents + s.untrackedCents).toBe(p);
    }
  });
});
