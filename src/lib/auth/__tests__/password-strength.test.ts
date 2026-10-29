import { describe, expect, it } from "vitest";
import { passwordStrength } from "../password-strength";

describe("passwordStrength", () => {
  it("vacía no muestra nivel", () => {
    expect(passwordStrength("").level).toBe(0);
  });

  it("menos de 8 caracteres es débil y pide más largo", () => {
    const s = passwordStrength("Ab1!");
    expect(s.level).toBe(1);
    expect(s.hint).toContain("8 caracteres");
  });

  it("contraseñas comunes, repetidas o consecutivas son débiles", () => {
    for (const p of ["password", "12345678", "aaaaaaaa", "abcdefgh", "Password123"]) {
      expect(passwordStrength(p).level, p).toBe(1);
    }
  });

  it("sube con variedad y longitud", () => {
    expect(passwordStrength("rojoazul").level).toBe(1);
    expect(passwordStrength("Rojoazul7").level).toBe(2);
    expect(passwordStrength("Rojoazul7!").level).toBe(4);
    expect(passwordStrength("Rojo-azul-verde-77").level).toBe(4);
  });

  it("una contraseña fuerte no muestra sugerencia", () => {
    expect(passwordStrength("Rojo-azul-verde-77").hint).toBe("");
  });
});
