/**
 * Color fijo de cada tipo y categoría de Cifra. Fondo del mismo tono con poca opacidad y texto
 * oscuro del mismo tono. Las clases van escritas completas para que Tailwind las detecte.
 */
const TONES = {
  slate: "bg-slate-500/15 text-slate-900 dark:text-slate-200",
  orange: "bg-orange-500/15 text-orange-900 dark:text-orange-200",
  amber: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  lime: "bg-lime-500/15 text-lime-900 dark:text-lime-200",
  emerald: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200",
  teal: "bg-teal-500/15 text-teal-900 dark:text-teal-200",
  cyan: "bg-cyan-500/15 text-cyan-900 dark:text-cyan-200",
  sky: "bg-sky-500/15 text-sky-900 dark:text-sky-200",
  blue: "bg-blue-500/15 text-blue-900 dark:text-blue-200",
  fuchsia: "bg-fuchsia-500/15 text-fuchsia-900 dark:text-fuchsia-200",
  pink: "bg-pink-500/15 text-pink-900 dark:text-pink-200",
} as const;

export type Tone = keyof typeof TONES;

const ACCOUNT_KIND_TONE: Record<string, Tone> = {
  cash: "lime",
  bank: "blue",
  savings: "emerald",
  other: "slate",
};

const DEBT_KIND_TONE: Record<string, Tone> = {
  credit_card: "blue",
  loan: "orange",
  vehicle: "amber",
  housing: "teal",
  other: "slate",
};

const EXPENSE_CATEGORY_TONE: Record<string, Tone> = {
  vivienda: "teal",
  servicios: "sky",
  alimentos: "lime",
  transporte: "amber",
  salud: "pink",
  educacion: "blue",
  salarios: "emerald",
  deudas: "orange",
  suscripciones: "fuchsia",
  ocio: "cyan",
  otros: "slate",
};

const toneClass = (map: Record<string, Tone>, code: string) => TONES[map[code] ?? "slate"];

export const accountKindColor = (code: string) => toneClass(ACCOUNT_KIND_TONE, code);
export const debtKindColor = (code: string) => toneClass(DEBT_KIND_TONE, code);
export const expenseCategoryColor = (code: string) => toneClass(EXPENSE_CATEGORY_TONE, code);
