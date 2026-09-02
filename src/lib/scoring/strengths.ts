import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import type { ReportStrength } from "@/lib/report/sections";
import { parseStoredProducts } from "@/lib/onboarding/products";
import type { CalculatedMetrics } from "./types";
import {
  ACCEPTABLE_LOSS_CEILING,
  CAPITAL_RANGE_CEILING,
  CAPITAL_RANGE_LABELS,
  CHANNEL_LABELS,
  HOURS_RANGE_LABELS,
  LOSS_RANGE_LABELS,
  dependencyRiskPenalty,
  formatMoney,
  formatPercent,
  parseDependencies,
  rangeCeiling,
} from "./ranges";

/**
 * Cap on surfaced strengths. The wiki names Risks "la sección más importante"
 * (`reporte-de-resultado.md`), so a long strengths list above a short risks list
 * would invert the report's intended weight. `/ejemplo` — the quality bar the
 * real report was built to match — shows 4.
 */
const MAX_STRENGTHS = 5;

/** Time buckets scoring >= 65 in `timeScore`. `5_10` is survivable, not a strength. */
const STRONG_HOURS = new Set(["10_20", "20_40", "mas_40"]);

/**
 * Deterministic strengths derived from the user's own answers and calculated
 * metrics — the honest counterpart to `detectFinancialRedFlags` /
 * `detectDependencyRedFlags`. Every item cites a number or a choice the user
 * actually made; nothing here is generic encouragement.
 *
 * Used as the fallback for `arep_strengths` when the AI call fails or returns
 * invalid JSON, and as a quality floor when the AI returns too few.
 *
 * Rules run in priority order — the user's own arithmetic first, then market
 * evidence they gathered, then structural absence of fragility, then
 * self-reported preferences — and the list is capped at MAX_STRENGTHS, so a
 * financially strong profile shows only number-backed strengths.
 *
 * Returns an empty array when nothing fires. A weak idea gets no fabricated
 * strength: that is the whole point of this function.
 */
export function detectDeterministicStrengths(
  assessment: AssessmentWithRelations,
  metrics: CalculatedMetrics
): ReportStrength[] {
  const profile = assessment.assessment_profile;
  const fit = assessment.personal_fit_answers;
  const financial = assessment.financial_inputs;
  const market = assessment.market_risk_inputs;

  const out: ReportStrength[] = [];
  const investment = Number(financial?.finp_initial_investment ?? 0);
  const monthlySales = financial?.finp_estimated_monthly_sales ?? 0;

  // ── Tier 1 · the user's own numbers ───────────────────────────────────────
  const pct = metrics.grossMarginPercentage;
  const marginPerSale = metrics.grossMarginPerSale;
  if (pct != null && pct >= 40 && marginPerSale != null && marginPerSale > 0) {
    out.push({
      title: `Margen bruto de ${formatPercent(pct)} por venta`,
      whyItMatters: `De cada venta te quedan ${formatMoney(marginPerSale)} antes de gastos fijos. Ese margen es lo que financia tu operación y absorbe los errores del arranque; por debajo de 30% dependerías de vender mucho volumen desde el primer mes.`,
    });
  }

  const net = metrics.estimatedMonthlyNetProfit;
  if (net != null && net > 0) {
    out.push({
      title: `Utilidad neta estimada de ${formatMoney(net)} al mes`,
      whyItMatters: `Con el precio, el costo y el volumen que declaraste, el negocio cubre sus costos fijos y deja ${formatMoney(net)} mensuales. Es un punto de partida en papel, no un resultado: depende de que ese volumen se cumpla.`,
    });
  }

  const payback = metrics.paybackMonths;
  if (payback != null && payback <= 12 && investment > 0) {
    out.push({
      title: `Recuperas la inversión en ~${payback.toFixed(1)} meses`,
      whyItMatters: `Tu inversión de ${formatMoney(investment)} se recupera en aproximadamente ${payback.toFixed(1)} meses al ritmo que estimaste. Recuperar en menos de un año significa que, si te equivocas, no quedas amarrado a esta idea durante años.`,
    });
  }

  const breakEven = metrics.breakEvenSales;
  if (breakEven != null && monthlySales > 0 && breakEven <= monthlySales * 0.6) {
    const gapPct = ((monthlySales - breakEven) / monthlySales) * 100;
    out.push({
      title: `Tu punto de equilibrio son ${breakEven} ventas al mes`,
      whyItMatters: `Estimaste ${monthlySales} ventas mensuales, así que puedes quedarte ${formatPercent(gapPct)} corto de tu propio pronóstico y aun así no perder dinero. Ese colchón importa porque casi nadie vende lo que planeó el primer trimestre.`,
    });
  }

  const lossRange = profile?.aprf_acceptable_loss_range;
  if (investment > 0 && lossRange) {
    const lossCeiling = rangeCeiling(lossRange, ACCEPTABLE_LOSS_CEILING);
    if (investment <= lossCeiling) {
      out.push({
        title: `Tu inversión de ${formatMoney(investment)} cabe en lo que puedes perder`,
        whyItMatters: `Dijiste que podrías perder hasta ${LOSS_RANGE_LABELS[lossRange] ?? "tu límite declarado"} sin afectar tu estabilidad. Si esto no funciona, el golpe es soportable — y eso es justamente lo que te permite probarlo en serio en lugar de a medias.`,
      });
    }
  }

  const capitalRange = profile?.aprf_capital_available_range;
  if (investment > 0 && capitalRange) {
    const capitalCeiling = rangeCeiling(capitalRange, CAPITAL_RANGE_CEILING);
    if (
      Number.isFinite(capitalCeiling) &&
      investment <= capitalCeiling * 0.6
    ) {
      const sharePct = (investment / capitalCeiling) * 100;
      out.push({
        title: "Te queda capital de reserva después de invertir",
        whyItMatters: `Tu inversión inicial usa como máximo el ${formatPercent(sharePct)} del capital que declaraste (${CAPITAL_RANGE_LABELS[capitalRange] ?? "tu rango"}). El resto es tu colchón para los meses en que el negocio todavía no se paga solo.`,
      });
    }
  }

  // ── Tier 2 · market evidence the user gathered ────────────────────────────
  if (market?.mrsk_has_talked_to_customers === true) {
    out.push({
      title: "Ya hablaste con clientes potenciales",
      whyItMatters:
        "La mayoría de las ideas se evalúan solo en papel. Tú ya tienes contacto con la demanda real; el siguiente paso es confirmar disposición a pagar tu precio, no solo interés en la idea.",
    });
  }

  if (market?.mrsk_competition_level === "baja") {
    out.push({
      title: "Competencia baja en tu mercado",
      whyItMatters:
        "Menos competidores te dan margen para probar precio sin entrar a una guerra de descuentos. Vale confirmar que sea por falta de oferta y no por falta de demanda — a veces nadie compite porque nadie compra.",
    });
  }

  const channel = market?.mrsk_acquisition_channel;
  if (channel && channel !== "otro") {
    out.push({
      title: `Ya tienes un canal en mente: ${CHANNEL_LABELS[channel] ?? channel}`,
      whyItMatters:
        "Tener una hipótesis de canal te deja probarla la primera semana; sin ella la validación empieza desde cero. Falta confirmar que ese canal te traiga clientes a un costo que tu margen aguante.",
    });
  }

  // ── Tier 3 · structural ───────────────────────────────────────────────────
  // `deps.length > 0` is required: an unanswered question must never be read
  // as "no dependencies".
  const deps = parseDependencies(market?.mrsk_business_dependencies);
  if (deps.length > 0 && dependencyRiskPenalty(deps) === 0) {
    out.push({
      title: "No dependes de una plataforma, un permiso ni un cliente único",
      whyItMatters:
        "Nada externo puede apagarte el negocio de un día para otro. Es una de las diferencias más grandes entre un negocio frágil y uno que aguanta un mal trimestre.",
    });
  }

  const hours = profile?.aprf_hours_per_week_range;
  if (hours && STRONG_HOURS.has(hours)) {
    out.push({
      title: `${HOURS_RANGE_LABELS[hours] ?? "Tus horas"} disponibles a la semana`,
      whyItMatters:
        "Con ese tiempo puedes operar y conseguir clientes a la vez. Debajo de 10 horas semanales casi todo negocio se estanca justo en la parte de vender, que es la que no se puede posponer.",
    });
  }

  const products = parseStoredProducts(financial?.finp_products).filter(
    (p) => p.monthlyUnits > 0
  );
  if (products.length >= 2) {
    out.push({
      title: `Más de una fuente de ingreso (${products.length} productos)`,
      whyItMatters:
        "Si uno no pega, el otro sostiene. No dependes de acertarle a un solo producto en el primer intento.",
    });
  }

  // ── Tier 4 · self-reported fit ────────────────────────────────────────────
  const sales = fit?.pfit_sales_comfort_score;
  if (sales != null && sales >= 4) {
    out.push({
      title: `Te sientes cómodo vendiendo (${sales}/5)`,
      whyItMatters:
        "Vender es la tarea que más se subestima y la que más negocios detiene. Empezar cómodo con ella te quita de encima el cuello de botella más común de los primeros meses.",
    });
  }

  const uncertainty = fit?.pfit_uncertainty_comfort_score;
  if (uncertainty != null && uncertainty >= 4) {
    out.push({
      title: `Toleras bien la incertidumbre (${uncertainty}/5)`,
      whyItMatters:
        "Los primeros meses casi nunca se parecen al plan. Aguantar esa etapa sin cambiar de rumbo cada semana es lo que permite que una prueba dé información útil.",
    });
  }

  const process = fit?.pfit_process_comfort_score;
  if (process != null && process >= 4) {
    out.push({
      title: `Te acomoda el trabajo de proceso y orden (${process}/5)`,
      whyItMatters:
        "Cobrar, agendar, dar seguimiento y llevar cuentas es donde se cae la operación de la mayoría. Que eso no te pese hace el negocio sostenible más allá del entusiasmo inicial.",
    });
  }

  const experience = profile?.aprf_entrepreneurship_experience;
  if (experience === "negocio_activo" || experience === "varios_intentos") {
    out.push({
      title:
        experience === "negocio_activo"
          ? "Ya tienes o tuviste un negocio activo"
          : "Ya intentaste emprender antes",
      whyItMatters:
        "Conoces el costo real de arrancar, no solo la idea. Eso acorta la curva de aprendizaje en cosas que no se ven en un plan: cobranza, proveedores y tiempos muertos.",
    });
  }

  return out.slice(0, MAX_STRENGTHS);
}
