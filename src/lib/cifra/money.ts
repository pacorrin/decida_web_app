import { MAX_AMOUNT_CENTS } from "./constants";

/**
 * Convierte lo que escribe la persona («$1,234.50», «1234.5») a centavos.
 * Devuelve null si no es un importe válido (vacío, negativo, más de 2 decimales
 * o por encima del tope).
 */
export function parseMoneyToCents(input: string): number | null {
  const clean = input.trim().replace(/^\$/, "").replace(/[,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const [whole, frac = ""] = clean.split(".");
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > MAX_AMOUNT_CENTS) return null;
  return cents;
}

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function formatMxn(cents: number): string {
  return mxn.format(cents / 100);
}

/** Valor para rellenar un campo de importe al editar («1234.50»). */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}
