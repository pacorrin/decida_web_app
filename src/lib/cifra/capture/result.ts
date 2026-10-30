import { z } from "zod";
import { categoriesFor, SYSTEM_EXPENSE_CATEGORIES, type CifraFlow } from "../constants";
import { type CalendarDate, compareDates, formatDateInput, parseDateInput } from "../dates";
import { parseMoneyToCents } from "../money";

/** Lo que devuelve el modelo, antes de validarlo. Todo es sospechoso hasta pasar por `normalizeCapture`. */
const rawSchema = z.object({
  flow: z.string().optional(),
  amount: z.union([z.number(), z.string()]).nullable().optional(),
  category: z.string().optional(),
  date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  confidence: z.string().optional(),
  note: z.string().nullable().optional(),
});

export type CaptureProposal = {
  flow: CifraFlow;
  /** Texto con el formato que usa el formulario («1,234.50»); vacío si no se pudo leer el monto. */
  amount: string;
  category: string;
  /** AAAA-MM-DD */
  date: string;
  description: string;
  confidence: "high" | "medium" | "low";
  /** Aviso corto para el usuario (monto ilegible, moneda distinta, fecha supuesta…). */
  warnings: string[];
};

const MAX_DESCRIPTION = 120;
const MAX_NOTE = 160;

/**
 * Convierte la respuesta del modelo en una propuesta segura para precargar el formulario:
 * categoría solo de la lista fija, fecha válida y no futura, monto positivo. Lo que no se pueda
 * confiar se deja vacío o con un valor por defecto y se avisa, nunca se inventa.
 */
export function normalizeCapture(raw: unknown, today: CalendarDate): CaptureProposal | null {
  const parsed = rawSchema.safeParse(raw);
  if (!parsed.success) return null;
  const r = parsed.data;
  const warnings: string[] = [];

  const flow: CifraFlow = r.flow === "income" ? "income" : "expense";

  let amount = "";
  if (r.amount != null) {
    const text = typeof r.amount === "number" ? r.amount.toFixed(2) : r.amount;
    const cents = parseMoneyToCents(text);
    if (typeof cents === "number" && cents > 0) amount = text.replace(/[^0-9.,]/g, "");
  }
  if (!amount) warnings.push("No pudimos leer el monto. Escríbelo para continuar.");

  // Intereses y «compras sin detalle» las genera Cifra al pagar una tarjeta; la IA nunca las elige.
  const category =
    categoriesFor(flow).some((c) => c.code === r.category) && !SYSTEM_EXPENSE_CATEGORIES.includes(r.category!)
      ? r.category!
      : "otros";

  let date = formatDateInput(today);
  const parsedDate = r.date ? parseDateInput(r.date) : null;
  if (parsedDate && compareDates(parsedDate, today) <= 0) date = formatDateInput(parsedDate);
  else if (r.date) warnings.push("La fecha no se veía clara; puse la de hoy.");

  const description = (r.description ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_DESCRIPTION);
  const note = (r.note ?? "").trim().slice(0, MAX_NOTE);
  if (note) warnings.push(note);

  const confidence = r.confidence === "high" || r.confidence === "low" ? r.confidence : "medium";

  return { flow, amount, category, date, description, confidence, warnings };
}
