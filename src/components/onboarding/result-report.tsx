import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportSection } from "@/components/report/report-section";
import { SignalBadge, formatCurrency } from "@/components/report/signal-badge";
import { ReportToc } from "@/components/report/report-toc";
import {
  RECOMMENDATION_LABELS,
  SIGNAL_LABELS,
  type SignalLevel,
  type RecommendationType,
} from "@/lib/example-report-data";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import { CheckCircle2, AlertTriangle, AlertCircle, TrendingUp } from "lucide-react";
import { ReportErrorState } from "@/components/onboarding/report-error-state";
import { FeedbackForm } from "@/components/onboarding/feedback-form";
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

type ResultReportProps = {
  assessment: AssessmentWithRelations;
};

export function ResultReport({ assessment }: ResultReportProps) {
  const report = assessment.assessment_report;
  const scores = assessment.assessment_score;
  const financial = assessment.financial_inputs;
  const strengths = (report?.arep_strengths as string[]) ?? [];
  const risks = (report?.arep_risks as string[]) ?? [];
  const validationPlan = report?.arep_validation_plan as
    | { week1?: string[]; week2?: string[] }
    | null;
  const redFlags = (scores?.ascs_red_flags as string[]) ?? [];

  const recommendation = scores?.ascs_final_recommendation as
    | RecommendationType
    | null
    | undefined;

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
    <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
      {/* Table of Contents - Desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <ReportToc />
        </div>
      </aside>

      <div className="min-w-0 space-y-2">
        {/* Table of Contents - Mobile */}
        <div className="lg:hidden">
          <ReportToc className="mb-8" />
        </div>

        {/* Executive Summary */}
        {report?.arep_executive_summary && (
          <ReportSection id="resumen" title="Resumen ejecutivo">
            <Markdown 
              content={report.arep_executive_summary} 
              className="text-base" 
            />
            {recommendation && (
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary">Recomendación</p>
                <p className="mt-1 text-lg font-semibold">
                  {RECOMMENDATION_LABELS[recommendation]}
                </p>
              </div>
            )}
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
                  <Card key={dim.label} className="border-border/60">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm font-medium">
                          {dim.label}
                        </CardTitle>
                        <SignalBadge signal={signal} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold text-primary">
                        {score ?? "—"}
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}
                          / 100
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {SIGNAL_LABELS[signal]}
                      </p>
                    </CardContent>
                  </Card>
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
        {financial && (
          <ReportSection id="financiero" title="Análisis financiero">
            {/* Financial Metrics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {financial.finp_gross_margin_per_sale != null && (
                <Card className="border-border/70">
                  <CardContent className="pt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Margen bruto por venta
                    </p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-primary">
                      {formatCurrency(
                        Number(financial.finp_gross_margin_per_sale),
                        financial.finp_currency ?? "MXN"
                      )}
                    </p>
                  </CardContent>
                </Card>
              )}
              {financial.finp_gross_margin_percentage != null && (
                <Card className="border-border/70">
                  <CardContent className="pt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Margen bruto %
                    </p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-primary">
                      {Number(financial.finp_gross_margin_percentage).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              )}
              {financial.finp_estimated_monthly_net_profit != null && (
                <Card className="border-border/70">
                  <CardContent className="pt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Utilidad neta mensual est.
                    </p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-primary">
                      {formatCurrency(
                        Number(financial.finp_estimated_monthly_net_profit),
                        financial.finp_currency ?? "MXN"
                      )}
                    </p>
                  </CardContent>
                </Card>
              )}
              {financial.finp_payback_months != null && (
                <Card className="border-border/70">
                  <CardContent className="pt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Recuperación estimada
                    </p>
                    <p className="mt-2 text-xl font-semibold tabular-nums text-primary">
                      {Number(financial.finp_payback_months).toFixed(1)} meses
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Financial Details Table */}
            <Card className="mt-6 border-border/70">
              <CardHeader>
                <CardTitle className="text-base">Inputs y cálculos</CardTitle>
              </CardHeader>
              <CardContent>
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
                            Precio por venta
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
                            Costo variable por venta
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
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {report?.arep_financial_analysis && (
              <div className="mt-6">
                <Markdown 
                  content={report.arep_financial_analysis} 
                  className="text-sm leading-relaxed" 
                />
              </div>
            )}
          </ReportSection>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <ReportSection id="fortalezas" title="Fortalezas">
            <ul className="space-y-2">
              {strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </ReportSection>
        )}

        {/* Risks */}
        {(risks.length > 0 || redFlags.length > 0) && (
          <ReportSection id="riesgos" title="Riesgos">
            <ul className="space-y-2">
              {[...risks, ...redFlags].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-amber-600"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </ReportSection>
        )}

        {/* Personal Fit */}
        {report?.arep_personal_fit_analysis && (
          <ReportSection id="personal" title="Compatibilidad personal">
            <Markdown 
              content={report.arep_personal_fit_analysis} 
              className="text-sm leading-relaxed" 
            />
          </ReportSection>
        )}

        {/* Time & Operation */}
        {report?.arep_time_operation_analysis && (
          <ReportSection id="tiempo" title="Tiempo y operación">
            <Markdown 
              content={report.arep_time_operation_analysis} 
              className="text-sm leading-relaxed" 
            />
          </ReportSection>
        )}

        {/* Scalability */}
        {report?.arep_scalability_analysis && (
          <ReportSection id="escalabilidad" title="Escalabilidad">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="size-4 text-[#6baed6]" aria-hidden />
                  Análisis de escalabilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Markdown 
                  content={report.arep_scalability_analysis} 
                  className="text-sm leading-relaxed text-muted-foreground" 
                />
              </CardContent>
            </Card>
          </ReportSection>
        )}

        {/* Validation Plan */}
        {validationPlan && (
          <ReportSection id="validacion" title="Plan de validación">
            <div className="grid gap-4 sm:grid-cols-2">
              {validationPlan.week1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Semana 1</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {validationPlan.week1.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {validationPlan.week2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Semana 2</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {validationPlan.week2.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </ReportSection>
        )}

        {/* Final Recommendation */}
        {report?.arep_final_recommendation_text && (
          <ReportSection id="recomendacion" title="Recomendación final">
            <Markdown 
              content={report.arep_final_recommendation_text} 
              className="text-base" 
            />
          </ReportSection>
        )}

        {!report && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-6 text-sm text-amber-900">
              Tu diagnóstico se está procesando. Si ves este mensaje, recarga la
              página en unos momentos.
            </CardContent>
          </Card>
        )}

        {report && (
          <ReportSection id="feedback" title="¿Te fue útil este diagnóstico?">
            <FeedbackForm assessment={assessment} />
          </ReportSection>
        )}
      </div>
    </div>
  );
}
