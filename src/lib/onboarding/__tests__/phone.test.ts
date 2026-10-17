import { describe, expect, it } from "vitest";
import { formatMexicoPhone, isCompleteMexicoPhone } from "../phone";

describe("formatMexicoPhone", () => {
  it("empieza en +52 y agrupa como el ejemplo +52 55 1234 5678", () => {
    expect(formatMexicoPhone("")).toBe("+52");
    expect(formatMexicoPhone("+52")).toBe("+52");
    expect(formatMexicoPhone("+525")).toBe("+52 5");
    expect(formatMexicoPhone("+5255")).toBe("+52 55");
    expect(formatMexicoPhone("+5255123456")).toBe("+52 55 1234 56");
    expect(formatMexicoPhone("+525512345678")).toBe("+52 55 1234 5678");
    expect(formatMexicoPhone("5512345678")).toBe("+52 55 1234 5678");
  });

  it("recorta dígitos de más y conserva un número local de 10 dígitos", () => {
    expect(formatMexicoPhone("551234567899")).toBe("+52 55 1234 5678");
    expect(formatMexicoPhone("525512345678")).toBe("+52 55 1234 5678");
  });
});

describe("isCompleteMexicoPhone", () => {
  it("exige los 10 dígitos nacionales", () => {
    expect(isCompleteMexicoPhone("+52")).toBe(false);
    expect(isCompleteMexicoPhone("+52 12")).toBe(false);
    expect(isCompleteMexicoPhone("+52 55 1234 5678")).toBe(true);
  });
});