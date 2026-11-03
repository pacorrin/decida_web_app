import { Card, CardContent } from "@/components/ui/card";
import { ReportSection } from "@/components/report/report-section";
import { SignalBadge, formatCurrency } from "@/components/report/signal-badge";
import {
  BreakEvenChart,
  PaybackRuler,
  MarginBars,
  ScoreBar,
  SplitBar,
  SPLIT_COLORS,
  type SplitSegment,
} from "@/components/report/report-charts";
import {
  ReportToc,
  REPORT_TOC_SECTION_IDS,
  type ReportTocSectionId,
} from "@/components/report/report-toc";
import {
  RECOMMENDATION_LABELS,
  SIGNAL_LABELS,
  type SignalLevel,
  type RecommendationType,
} from "@/lib/example-report-data";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import { parseStoredProducts } from "@/lib/onboarding/products";
import {
  parseStoredRisks,
  parseStoredStrengths,
  parseStoredValidationPlan,
} from "@/lib/report/sections";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { ReportSources } from "@/components/report/report-sources";
import { TrackEvent } from "@/components/analytics/track-event";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportErrorState } from "@/components/onboarding/report-error-state";
import { FeedbackForm } from "@/components/onboarding/feedback-form";
import { AnalyzeAnotherButton } from "@/components/onboarding/analyze-another-button";
import { UnlockReportButtons } from "@/components/onboarding/unlock-report-buttons";
import { CREDIT_COST_BASIC, CREDIT_COST_RESEARCH, formatCredits } from "@/lib/credits/costs";
import { CREDITS_PLANS_PATH } from "@/lib/credits/paths";
import { Markdown } from "@/components/ui/markdown";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

const DIMENSION_MAP = [
  {
    label: "Compatibilidad personal",
    scoreKey: "ascs_personal_fit_score" as const,
    signalKey: "ascs_personal_fit_signal" as const,
  },
  {
    label: "Viabilidad financiera",
    scoreKey: "ascs_financial_viability_score" as const,
    signalKey: "ascs_financial_viability_signal" as const,
  },
  {
    label: "Viabilidad comercial",
    scoreKey: "ascs_commercial_viability_score" as const,
    signalKey: "ascs_commercial_viability_signal" as const,
  },
  {
    label: "Nivel de riesgo",
    scoreKey: "ascs_risk_level_score" as const,
    signalKey: "ascs_risk_level_signal" as const,
  },
  {
    label: "Tiempo y operación",
    scoreKey: "ascs_time_fit_score" as const,
    signalKey: "ascs_time_fit_signal" as const,
  },
  {
    label: "Escalabilidad",
    scoreKey: "ascs_scalability_score" as const,
    signalKey: "ascs_scalability_signal" as const,
  },
];

/** Color de marca de cada recomendación, el mismo que usa la lista de análisis. */
const RECOMMENDATION_FILL: Record<RecommendationType, string> = {
  proceed_small_test: "#81c784",
  validate_first: "#6baed6",
  adjust_idea: "#ffb74d",
  pause_for_now: "#ff7043",
};

const FULL_REPORT_INCLUDES = [
  "Cómo reducir cada riesgo",
  "Alertas detectadas en tus números",
  "Desglose financiero completo",
  "Compatibilidad personal",
  "Tiempo y operación",
  "Escalabilidad",
  "Plan de validación completo",
  "Recomendación final",
] as const;

/** Quién mira el reporte: si tiene un plan vigente, los candados se abren con sus créditos. */
export type ReportViewer = { hasPlan: boolean; creditsBalance: number };

type ResultReportProps = {
  assessment: AssessmentWithRelations;
  showFeedback?: boolean;
  showAnalyzeAnother?: boolean;
  access?: "full" | "free";
  viewer?: ReportViewer;
};

export function ResultReport({
  assessment,
  showFeedback = true,
  showAnalyzeAnother = true,
  access = "full",
  viewer,
}: ResultReportProps) {
  const isFree = access === "free";
  const hasPlan = viewer?.hasPlan ?? false;
  const report = assessment.assessment_report;
  const scores = assessment.assessment_score;
  const financial = assessment.financial_inputs;
  const products = parseStoredProducts(financial?.finp_products);
  const strengths = parseStoredStrengths(report?.arep_strengths);
  const risks = parseStoredRisks(report?.arep_risks);
  const validationPlan = parseStoredValidationPlan(report?.arep_validation_plan);
  const redFlags = (scores?.ascs_red_flags as string[]) ?? [];

  const recommendation = scores?.ascs_final_recommendation as
    | RecommendationType
    | null
    | undefined;
  const showRiskSection = risks.length > 0 || redFlags.length > 0;

  const monthlySales = Number(financial?.finp_estimated_monthly_sales ?? 0);
  const breakEvenSales = Number(financial?.finp_break_even_sales ?? 0);
  const breakEvenChart =
    financial?.finp_estimated_monthly_sales != null &&
    financial?.finp_break_even_sales != null &&
    monthlySales > 0 &&
    breakEvenSales > 0 ? (
      <BreakEvenChart sales={monthlySales} breakEven={breakEvenSales} />
    ) : null;
  const monthlyRevenue = Number(financial?.finp_price_per_sale ?? 0) * monthlySales;
  const monthlyVariable = Number(financial?.finp_variable_cost_per_sale ?? 0) * monthlySales;
  // La utilidad es la que ya muestra el reporte; lo que falta para llegar a ella son los costos fijos.
  const monthlyProfit =
    financial?.finp_estimated_monthly_net_profit != null
      ? Number(financial.finp_estimated_monthly_net_profit)
      : monthlyRevenue - monthlyVariable - Number(financial?.finp_fixed_monthly_costs_amount ?? 0);
  const monthlyFixed = Math.max(0, monthlyRevenue - monthlyVariable - monthlyProfit);
  const splitSegments: SplitSegment[] | null =
    monthlyRevenue > 0 && monthlyProfit >= 0
      ? [
          { label: "Costos variables", value: monthlyVariable, color: SPLIT_COLORS.cost },
          ...(monthlyFixed > 0
            ? [{ label: "Costos fijos", value: monthlyFixed, color: SPLIT_COLORS.fixed }]
            : []),
          { label: "Utilidad", value: monthlyProfit, color: SPLIT_COLORS.profit },
        ]
      : null;

  const visibleValidationPlan = isFree
    ? validationPlan.slice(0, 1)
    : validationPlan;
  const lockedWeeks = validationPlan.length - visibleValidationPlan.length;
  const tocSectionIds: ReportTocSectionId[] | undefined = isFree
    ? [
        ...(report?.arep_executive_summary ? (["resumen"] as const) : []),
        ...(scores ? (["viabilidad"] as const) : []),
        ...(report?.arep_business_understanding ? (["negocio"] as const) : []),
        ...(financial ? (["financiero"] as const) : []),
        ...(report ? (["fortalezas"] as const) : []),
        ...(showRiskSection ? (["riesgos"] as const) : []),
        ...(report
          ? (["personal", "tiempo", "escalabilidad"] as const)
          : []),
        ...(visibleValidationPlan.length > 0 ? (["validacion"] as const) : []),
        ...(report ? (["recomendacion"] as const) : []),
        ...(report?.arep_research ? (["fuentes"] as const) : []),
        ...(report && showFeedback ? (["feedback"] as const) : []),
      ]
    : // Con acceso completo se listan todas las secciones, salvo «Fuentes» si no hubo investigación.
      report?.arep_research
      ? undefined
      : REPORT_TOC_SECTION_IDS.filter((id) => id !== "fuentes");

  /** Cuerpo del análisis financiero (gráficas, tablas y texto), compartido por la sección. */
  const financialRest = financial ? (
    <>
            {/* Charts */}
            {!isFree && (breakEvenChart || splitSegments) && (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {breakEvenChart && (
                  <div className="rounded-2xl rc-tile bg-[var(--rc-tile,#ffffff)] shadow-[0_4px_12px_rgba(5,66,44,0.07)] p-6">{breakEvenChart}</div>
                )}
                {splitSegments && (
                  <div className="rounded-2xl rc-tile bg-[var(--rc-tile,#ffffff)] shadow-[0_4px_12px_rgba(5,66,44,0.07)] p-6">
                    <SplitBar
                      title="Cómo se reparten tus ventas mensuales"
                      segments={splitSegments}
                      format={(v) => formatCurrency(v, financial.finp_currency ?? "MXN")}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Products & Services */}
            {!isFree && products.length > 0 && (
              <div className="mt-4 space-y-6 rounded-2xl rc-tile bg-[var(--rc-tile,#ffffff)] shadow-[0_4px_12px_rgba(5,66,44,0.07)] p-6">
                <MarginBars
                  rows={products.map((p) => ({
                    name: p.name,
                    kind: p.kind,
                    price: p.price,
                    variableCost: p.variableCost,
                  }))}
                />
                <h3 className="text-base font-medium text-foreground">
                  Productos y servicios
                </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Nombre
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Precio
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Costo var.
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Uds./mes
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Margen
                          </TableCell>
                        </TableRow>
                        {products.map((p, i) => {
                          const marginPct =
                            p.price > 0
                              ? ((p.price - p.variableCost) / p.price) * 100
                              : null;
                          return (
                            <TableRow key={i}>
                              <TableCell className="font-medium">
                                {p.name}
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {p.kind}
                                </span>
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatCurrency(
                                  p.price,
                                  financial?.finp_currency ?? "MXN"
                                )}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatCurrency(
                                  p.variableCost,
                                  financial?.finp_currency ?? "MXN"
                                )}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {p.monthlyUnits}
                              </TableCell>
                              <TableCell
                                className={`text-right tabular-nums ${
                                  marginPct != null && marginPct <= 0
                                    ? "text-destructive"
                                    : ""
                                }`}
                              >
                                {marginPct == null
                                  ? "—"
                                  : `${marginPct.toFixed(0)}%`}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
              </div>
            )}

            {/* Financial Details Table */}
            {!isFree && (
            <div className="mt-4 rounded-2xl rc-tile bg-[var(--rc-tile,#ffffff)] shadow-[0_4px_12px_rgba(5,66,44,0.07)] p-6">
              <h3 className="mb-3 text-base font-medium text-foreground">Inputs y cálculos</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableBody>
                      {financial.finp_initial_investment != null && (
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            Inversión inicial estimada
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(
                              Number(financial.finp_initial_investment),
                              financial.finp_currency ?? "MXN"
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                      {financial.finp_price_per_sale != null && (
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            {products.length > 1
                              ? "Precio promedio por venta (ponderado)"
                              : "Precio por venta"}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(
                              Number(financial.finp_price_per_sale),
                              financial.finp_currency ?? "MXN"
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                      {financial.finp_variable_cost_per_sale != null && (
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            {products.length > 1
                              ? "Costo variable promedio (ponderado)"
                              : "Costo variable por venta"}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(
                              Number(financial.finp_variable_cost_per_sale),
                              financial.finp_currency ?? "MXN"
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                      {financial.finp_estimated_monthly_sales != null && (
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            Ventas mensuales estimadas
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {financial.finp_estimated_monthly_sales}
                          </TableCell>
                        </TableRow>
                      )}
                      {financial.finp_fixed_monthly_costs_amount != null && (
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            Costos fijos mensuales
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(
                              Number(financial.finp_fixed_monthly_costs_amount),
                              financial.finp_currency ?? "MXN"
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                      {financial.finp_break_even_sales != null && (
                        <TableRow>
                          <TableCell className="text-muted-foreground">
                            Punto de equilibrio (ventas/mes)
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {financial.finp_break_even_sales}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
            </div>
            )}

            {isFree && (
              <LockedNote>
                El desglose de productos, los cálculos y el análisis financiero
                completo se desbloquean {hasPlan ? "con tus créditos" : "con un plan"}.
              </LockedNote>
            )}

            {/* AI Analysis */}
            {!isFree && report?.arep_financial_analysis && (
              <div className="mt-6">
                <Markdown 
                  content={report.arep_financial_analysis} 
                  className="text-sm leading-relaxed" 
                />
              </div>
            )}
    </>
  ) : null;

  const financialSection = financial ? (
          <ReportSection id="financiero" title="Análisis financiero">
            {/* Financial Metrics */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
              {!isFree && financial.finp_gross_margin_per_sale != null && (
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Margen bruto por venta</dt>
                  <dd className="text-3xl font-semibold tabular-nums tracking-tight text-primary xl:text-4xl">
                    {formatCurrency(
                      Number(financial.finp_gross_margin_per_sale),
                      financial.finp_currency ?? "MXN"
                   )}
                  </dd>
                </div>
              )}
              {financial.finp_gross_margin_percentage != null && (
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Margen bruto %</dt>
                  <dd className="text-3xl font-semibold tabular-nums tracking-tight text-primary xl:text-4xl">
                    {Number(financial.finp_gross_margin_percentage).toFixed(1)}%
                  </dd>
                </div>
              )}
              {financial.finp_estimated_monthly_net_profit != null && (
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Utilidad neta mensual est.</dt>
                  <dd className="text-3xl font-semibold tabular-nums tracking-tight text-primary xl:text-4xl">
                    {formatCurrency(
                      Number(financial.finp_estimated_monthly_net_profit),
                      financial.finp_currency ?? "MXN"
                    )}
                  </dd>
                </div>
              )}
              {financial.finp_payback_months != null && (
                <div className="space-y-1">
                  <dt className="text-sm text-muted-foreground">Recuperación estimada</dt>
                  <dd className="text-3xl font-semibold tabular-nums tracking-tight text-primary xl:text-4xl">
                    {Number(financial.finp_payback_months).toFixed(1)} meses
                  </dd>
                </div>
              )}
            </dl>

            {financial.finp_payback_months != null && (
              <PaybackRuler payback={Number(financial.finp_payback_months)} />
            )}

            {financialRest}
          </ReportSection>
  ) : null;

  if (assessment.asmt_status === "failed") {
    return <ReportErrorState assessmentId={assessment.asmt_id} />;
  }

  if (!report && assessment.asmt_status === "in_progress") {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-blue-600" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Tu diagnóstico se está procesando
              </p>
              <p className="text-sm text-blue-700">
                Esto puede tomar unos momentos. La página se actualizará automáticamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-8">
      <div className="min-w-0 space-y-4 sm:space-y-6">
        {report && (
          <TrackEvent
            event={ANALYTICS_EVENTS.reportViewed}
            props={{ access: isFree ? "free" : "full" }}
          />
        )}
        {isFree && report && (
          <p
            className="rounded-2xl bg-white shadow-[0_4px_12px_rgba(5,66,44,0.07)] px-5 py-4 text-base text-foreground"
            data-testid="free-preview-legend"
          >
            Esta es tu prueba gratuita: incluye una vista previa del diagnóstico{" "}
            <strong className="font-medium text-foreground">
              sin investigación de mercado
            </strong>
            . Las cifras de mercado son tus supuestos.{" "}
            {hasPlan
              ? "Esta evaluación aún no está desbloqueada: usa tus créditos para ver el reporte completo."
              : "Desbloquea el reporte completo con un plan cuando quieras."}
          </p>
        )}
        {isFree && report && hasPlan && (
          <FullReportCta
            assessmentId={assessment.asmt_id}
            viewer={viewer}
          />
        )}
        {/* Table of Contents - Mobile */}
        <div className="lg:hidden">
          <ReportToc sectionIds={tocSectionIds} />
        </div>

        {/* Executive Summary */}
        {report?.arep_executive_summary && (
          <ReportSection id="resumen" title="Resumen ejecutivo" tone="hero">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
              <Markdown
                content={report.arep_executive_summary}
                className="text-base leading-relaxed text-white [&_*]:text-inherit"
              />
              {recommendation && (
                <div className="space-y-3 rounded-2xl bg-white/10 p-6">
                  <p className="text-sm text-white/80">Recomendación</p>
                  <p className="flex items-start gap-3 text-2xl font-semibold leading-tight">
                    <span
                      aria-hidden
                      className="mt-2 size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: RECOMMENDATION_FILL[recommendation] }}
                    />
                    {RECOMMENDATION_LABELS[recommendation]}
                  </p>
                </div>
              )}
            </div>
          </ReportSection>
        )}

        {/* Viability Signals */}
        {scores && (
          <ReportSection id="viabilidad" title="Semáforos por dimensión">
            <div className="grid gap-3 sm:grid-cols-2">
              {DIMENSION_MAP.map((dim) => {
                const signal = scores[dim.signalKey] as SignalLevel | null;
                const score = scores[dim.scoreKey];
                if (!signal) return null;
                return (
                  <div key={dim.label} className="space-y-3 rounded-2xl bg-white shadow-[0_4px_12px_rgba(5,66,44,0.07)] p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-medium text-foreground">
                        {dim.label}
                      </h3>
                      <SignalBadge signal={signal} />
                    </div>
                    <p className="text-4xl font-semibold leading-none tracking-tight text-primary tabular-nums">
                      {score ?? "—"}
                      <span className="text-base font-normal text-muted-foreground">
                        {" "}
                        / 100
                      </span>
                    </p>
                    <ScoreBar score={score} signal={signal} label={dim.label} />
                    <p className="text-sm text-muted-foreground">
                      {SIGNAL_LABELS[signal]}
                      {dim.scoreKey === "ascs_risk_level_score" &&
                        " · más puntos = más riesgo"}
                    </p>
                  </div>
                );
              })}
            </div>
          </ReportSection>
        )}

        {/* Business Understanding */}
        {report?.arep_business_understanding && (
          <ReportSection id="negocio" title="Entendimiento del negocio">
            <Markdown 
              content={report.arep_business_understanding} 
              className="text-base leading-relaxed" 
            />
          </ReportSection>
        )}

        {/* Financial Snapshot */}
        {financialSection}

        {/* Strengths */}
        {report && (
          <ReportSection id="fortalezas" title="Fortalezas">
            {strengths.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {strengths.map((item, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl bg-[#81c784]/10 p-5">
                    <CheckCircle2
                      className="mt-1 size-5 shrink-0 text-[#4caf50]"
                      aria-hidden
                    />
                    <div className="min-w-0 space-y-2">
                      <p className="text-base font-semibold leading-snug text-foreground">
                        {item.title}
                      </p>
                      {item.whyItMatters && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {item.whyItMatters}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
                Con los datos que nos diste, todavía no encontramos una fortaleza
                que se sostenga por sí sola. No es un veredicto sobre ti ni sobre
                la idea: significa que aún no hay evidencia — ni números ni
                conversaciones con clientes — que la respalde. El plan de
                validación de abajo es exactamente el trabajo que falta para
                generarla.
              </p>
            )}
          </ReportSection>
        )}

        {/* Risks */}
        {showRiskSection && (
          <ReportSection id="riesgos" title="Riesgos">
            {risks.length > 0 && (
              <ul className="grid gap-3 lg:grid-cols-2">
                {risks.map((risk, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl bg-[#ffb74d]/12 p-5">
                    <AlertTriangle
                      className="mt-1 size-5 shrink-0 text-[#ff7043]"
                      aria-hidden
                    />
                    <div className="min-w-0 space-y-2">
                      <p className="text-base font-semibold leading-snug text-foreground">
                        {risk.title}
                      </p>
                      {risk.whyItMatters && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {risk.whyItMatters}
                        </p>
                      )}
                      {!isFree && risk.howToReduce && (
                        <p className="rounded-xl bg-white/70 p-3 text-sm">
                          <span className="font-medium text-primary">
                            Cómo reducirlo:{" "}
                          </span>
                          <span className="text-foreground/80">
                            {risk.howToReduce}
                          </span>
                        </p>
                      )}
                      {isFree && risk.howToReduce && (
                        <LockedNote className="mt-0 !bg-white/70 !shadow-none">
                          Cómo reducirlo: disponible {hasPlan ? "al desbloquear con tus créditos" : "con un plan"}.
                        </LockedNote>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {isFree && redFlags.length > 0 && (
              <LockedNote>
                {redFlags.length === 1
                  ? "Detectamos 1 alerta en tus números."
                  : `Detectamos ${redFlags.length} alertas en tus números.`}{" "}
                {hasPlan ? "Desbloquea con tus créditos para ver cuáles son." : "Elige un plan para ver cuáles son."}
              </LockedNote>
            )}

            {!isFree && redFlags.length > 0 && (
              <div className="mt-6 rounded-2xl bg-[#ff7043]/10 p-5">
                <p className="mb-3 text-base font-medium text-primary">
                  Alertas detectadas en tus números
                </p>
                <ul className="space-y-2">
                  {redFlags.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle
                        className="mt-0.5 size-4 shrink-0 text-destructive"
                        aria-hidden
                      />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ReportSection>
        )}

        {/* Personal Fit */}
        {!isFree && report?.arep_personal_fit_analysis && (
          <ReportSection id="personal" title="Compatibilidad personal">
            <Markdown 
              content={report.arep_personal_fit_analysis} 
              className="text-sm leading-relaxed" 
            />
          </ReportSection>
        )}
        {isFree && report && (
          <LockedSection
            hasPlan={hasPlan}
            id="personal"
            title="Compatibilidad personal"
            description="Qué tan bien encajan tu perfil, tu experiencia y tus objetivos con esta idea, y dónde te conviene apoyarte."
          />
        )}

        {/* Time & Operation */}
        {!isFree && report?.arep_time_operation_analysis && (
          <ReportSection id="tiempo" title="Tiempo y operación">
            <Markdown 
              content={report.arep_time_operation_analysis} 
              className="text-sm leading-relaxed" 
            />
          </ReportSection>
        )}
        {isFree && report && (
          <LockedSection
            hasPlan={hasPlan}
            id="tiempo"
            title="Tiempo y operación"
            description="Cuánta dedicación pide el negocio, cómo sería tu operación del día a día y qué puede saturarte."
          />
        )}

        {/* Scalability */}
        {!isFree && report?.arep_scalability_analysis && (
          <ReportSection id="escalabilidad" title="Escalabilidad">
            <Markdown
              content={report.arep_scalability_analysis}
              className="text-sm leading-relaxed"
            />
          </ReportSection>
        )}
        {isFree && report && (
          <LockedSection
            hasPlan={hasPlan}
            id="escalabilidad"
            title="Escalabilidad"
            description="Qué tanto puede crecer la idea sin crecer tu carga, y qué la frenaría."
          />
        )}

        {/* Validation Plan */}
        {visibleValidationPlan.length > 0 && (
          <ReportSection id="validacion" title="Plan de validación">
            <ol className="grid gap-3 sm:grid-cols-2">
              {visibleValidationPlan.map((week) => (
                <li key={week.week} className="rounded-2xl bg-white shadow-[0_4px_12px_rgba(5,66,44,0.07)] p-5">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold tabular-nums text-white"
                    >
                      {week.week}
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-primary">
                        Semana {week.week}
                      </p>
                      {week.title && (
                        <p className="text-sm text-muted-foreground">{week.title}</p>
                      )}
                    </div>
                  </div>
                  <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/80">
                    {week.tasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            {isFree && lockedWeeks > 0 && (
              <LockedNote>
                {lockedWeeks === 1
                  ? "Falta 1 semana del plan de validación."
                  : `Faltan ${lockedWeeks} semanas del plan de validación.`}{" "}
                Se desbloquean {hasPlan ? "con tus créditos" : "con un plan"}.
              </LockedNote>
            )}
          </ReportSection>
        )}

        {/* Final Recommendation */}
        {!isFree && report?.arep_final_recommendation_text && (
          <ReportSection id="recomendacion" title="Recomendación final">
            <Markdown 
              content={report.arep_final_recommendation_text} 
              className="text-base" 
            />
          </ReportSection>
        )}

        {isFree && report && (
          <>
            <LockedSection
            hasPlan={hasPlan}
              id="recomendacion"
              title="Recomendación final"
              description="El veredicto explicado y los siguientes pasos concretos para tu caso."
            />
            <FullReportCta assessmentId={assessment.asmt_id} viewer={viewer} />
          </>
        )}

        {report && <ReportSources research={report.arep_research} />}

        {!report && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-6 text-sm text-amber-900">
              Tu diagnóstico se está procesando. Si ves este mensaje, recarga la
              página en unos momentos.
            </CardContent>
          </Card>
        )}

        {report && showFeedback && (
          <ReportSection id="feedback" title="¿Te fue útil este diagnóstico?">
            <FeedbackForm
              assessment={isFree ? assessmentWithoutPaidCopy(assessment) : assessment}
            />
          </ReportSection>
        )}

        {report && showAnalyzeAnother && (
          <div className="flex flex-col items-center gap-3 pt-6">
            <p className="text-center text-sm text-muted-foreground">
              ¿Tienes otra idea que quieras evaluar?
            </p>
            <AnalyzeAnotherButton />
          </div>
        )}
      </div>

      {/* Table of Contents - Desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <ReportToc sectionIds={tocSectionIds} />
        </div>
      </aside>
    </div>
  );
}

function assessmentWithoutPaidCopy(
  assessment: AssessmentWithRelations,
): AssessmentWithRelations {
  return {
    ...assessment,
    assessment_report: null,
    financial_inputs: null,
    assessment_score: assessment.assessment_score
      ? { ...assessment.assessment_score, ascs_red_flags: [] }
      : null,
  };
}

function LockedSection({
  id,
  title,
  description,
  hasPlan,
}: {
  id: ReportTocSectionId;
  title: string;
  description: string;
  hasPlan: boolean;
}) {
  return (
    <ReportSection id={id} title={title}>
      <div className="flex items-start gap-3 rounded-2xl bg-white shadow-[0_4px_12px_rgba(5,66,44,0.07)] p-5">
        <Lock
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="space-y-2">
          <p className="text-base text-muted-foreground">{description}</p>
          <TrackedLink
            event={ANALYTICS_EVENTS.subscribeClicked}
            eventProps={{ location: "report_lock" }}
            href={hasPlan ? "#desbloquear" : CREDITS_PLANS_PATH}
            className="text-base font-medium text-primary underline-offset-4 hover:underline"
          >
            {hasPlan ? "Desbloquear con tus créditos" : "Elegir un plan para desbloquear"}
          </TrackedLink>
        </div>
      </div>
    </ReportSection>
  );
}

function LockedNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`mt-4 flex items-start gap-2 rounded-2xl bg-white shadow-[0_4px_12px_rgba(5,66,44,0.07)] px-4 py-3 text-sm text-muted-foreground ${className ?? ""}`}
    >
      <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

function FullReportCta({
  assessmentId,
  viewer,
  className,
}: {
  assessmentId: string;
  viewer?: ReportViewer;
  className?: string;
}) {
  return (
    <div id="desbloquear" className={cn("scroll-mt-24", className)}>
      <div className="rounded-3xl bg-white shadow-[0_4px_12px_rgba(5,66,44,0.07)] p-6 sm:p-8 lg:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          Desbloquea el diagnóstico completo
        </h2>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Con {CREDIT_COST_BASIC} créditos ves todo lo ya generado. Con{" "}
          {CREDIT_COST_RESEARCH} regeneramos el reporte incluyendo
          investigación de mercado.
          {viewer?.hasPlan && (
            <>
              {" "}
              Tu saldo: <strong className="font-medium text-foreground">{formatCredits(viewer.creditsBalance)} créditos</strong>.
            </>
          )}
        </p>
        <div className="mt-6 space-y-6">
          <ul className="grid gap-3 sm:grid-cols-2">
            {FULL_REPORT_INCLUDES.map((title) => (
              <li
                key={title}
                className="flex items-start gap-2 text-base text-foreground"
              >
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden
                />
                {title}
              </li>
            ))}
          </ul>
          <UnlockReportButtons assessmentId={assessmentId} />
        </div>
      </div>
    </div>
  );
}
