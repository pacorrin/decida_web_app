/** Categorías fijas de Cifra: el código se guarda en la base y la etiqueta se muestra. */
export const EXPENSE_CATEGORIES = [
  { code: "vivienda", label: "Vivienda" },
  { code: "servicios", label: "Servicios (luz, agua, internet)" },
  { code: "alimentos", label: "Alimentos" },
  { code: "transporte", label: "Transporte" },
  { code: "salud", label: "Salud" },
  { code: "educacion", label: "Educación" },
  { code: "deudas", label: "Pago de deudas" },
  { code: "suscripciones", label: "Suscripciones" },
  { code: "ocio", label: "Ocio y compras" },
  { code: "otros", label: "Otros" },
] as const;

export const INCOME_CATEGORIES = [
  { code: "sueldo", label: "Sueldo" },
  { code: "negocio", label: "Negocio" },
  { code: "extra", label: "Ingreso extra" },
  { code: "otros", label: "Otros" },
] as const;

export type CifraFlow = "income" | "expense";

export const DEBT_KINDS = [
  { code: "credit_card", label: "Tarjeta de crédito" },
  { code: "loan", label: "Préstamo" },
  { code: "vehicle", label: "Automóvil" },
  { code: "housing", label: "Vivienda (hipoteca)" },
  { code: "other", label: "Otra deuda" },
] as const;

export const ACCOUNT_KINDS = [
  { code: "cash", label: "Efectivo" },
  { code: "bank", label: "Cuenta bancaria" },
  { code: "savings", label: "Ahorro" },
  { code: "other", label: "Otra" },
] as const;

/** Categoría con la que se registra el pago de una deuda. */
export const DEBT_PAYMENT_CATEGORY = "deudas";

/** Tope por importe: el valor se guarda como entero de centavos (Int de Postgres). */
export const MAX_AMOUNT_CENTS = 2_000_000_000;

export const CIFRA_PATH = "/cuenta/cifra";

export function categoriesFor(flow: CifraFlow) {
  return flow === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function isCategory(flow: CifraFlow, code: string): boolean {
  return categoriesFor(flow).some((c) => c.code === code);
}

export function categoryLabel(flow: CifraFlow, code: string): string {
  return categoriesFor(flow).find((c) => c.code === code)?.label ?? code;
}
