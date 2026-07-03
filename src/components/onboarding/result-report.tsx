import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportSection } from "@/components/report/report-section";
import { SignalBadge } from "@/components/report/signal-badge";
import {
  RECOMMENDATION_LABELS,
  SIGNAL_LABELS,
  type SignalLevel,
  type RecommendationType,
} from "@/lib/example-report-data";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { ReportErrorState } from "@/components/onboarding/report-error-state";

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
    <div className="space-y-2">
      {report?.arep_executive_summary && (
        <ReportSection title="Resumen ejecutivo">
          <p className="text-base leading-relaxed text-muted-foreground">
            {report.arep_executive_summary}
          </p>
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

      {scores && (
        <ReportSection title="Semáforos por dimensión">
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

      {strengths.length > 0 && (
        <ReportSection title="Fortalezas">
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

      {(risks.length > 0 || redFlags.length > 0) && (
        <ReportSection title="Riesgos">
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

      {report?.arep_financial_analysis && (
        <ReportSection title="Análisis financiero">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {report.arep_financial_analysis}
          </p>
        </ReportSection>
      )}

      {report?.arep_personal_fit_analysis && (
        <ReportSection title="Compatibilidad personal">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {report.arep_personal_fit_analysis}
          </p>
        </ReportSection>
      )}

      {validationPlan && (
        <ReportSection title="Plan de validación">
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

      {report?.arep_final_recommendation_text && (
        <ReportSection title="Recomendación final">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
            {report.arep_final_recommendation_text}
          </p>
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
    </div>
  );
}
