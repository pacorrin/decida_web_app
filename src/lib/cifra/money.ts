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

/**
 * Formato mientras se escribe un importe: solo dígitos y un punto, hasta 2
 * decimales, con comas de miles («1234.5» → «1,234.5»).
 */
export function formatMoneyInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  const intPart = (dot === -1 ? cleaned : cleaned.slice(0, dot)).replace(/^0+(?=\d)/, "");
  const decimals =
    dot === -1 ? null : cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (decimals === null) return withCommas;
  return `${withCommas === "" ? "0" : withCommas}.${decimals}`;
}

/** Porcentaje mientras se escribe: dígitos y un punto, hasta 3 enteros y 2 decimales. */
export function formatPercentInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  const intPart = (dot === -1 ? cleaned : cleaned.slice(0, dot)).slice(0, 3);
  if (dot === -1) return intPart;
  const decimals = cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  return `${intPart === "" ? "0" : intPart}.${decimals}`;
}
