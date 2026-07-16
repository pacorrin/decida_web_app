import Link from "next/link";
import {
  RECOMMENDATION_LABELS,
  type RecommendationType,
} from "@/lib/example-report-data";
import type { getHistoryAssessments } from "@/app/mis-evaluaciones/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

type AssessmentListItem = Awaited<ReturnType<typeof getHistoryAssessments>>[number];

function formatDate(date: Date | null | undefined): string {
  if (!date) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function ideaSummary(assessment: AssessmentListItem): string {
  const idea = assessment.business_idea;
  if (idea?.bide_ai_summary) {
    return idea.bide_ai_summary.length > 120
      ? `${idea.bide_ai_summary.slice(0, 120)}…`
      : idea.bide_ai_summary;
  }
  if (idea?.bide_original_description) {
    return idea.bide_original_description.length > 120
      ? `${idea.bide_original_description.slice(0, 120)}…`
      : idea.bide_original_description;
  }
  return "Idea sin título";
}

type AssessmentListProps = {
  assessments: AssessmentListItem[];
};

export function AssessmentList({ assessments }: AssessmentListProps) {
  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Aún no tienes evaluaciones completadas con este correo.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="space-y-3" data-testid="history-assessment-list">
      {assessments.map((assessment) => {
        const recommendation = assessment.assessment_score
          ?.ascs_final_recommendation as RecommendationType | null | undefined;

        return (
          <li key={assessment.asmt_id}>
            <Link
              href={`/mis-evaluaciones/${assessment.asmt_id}`}
              className="group block rounded-lg border border-border/80 bg-card transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid={`history-assessment-${assessment.asmt_id}`}
            >
              <Card className="border-0 shadow-none">
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium leading-snug">
                      {ideaSummary(assessment)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(
                        assessment.asmt_report_generated_at ??
                          assessment.asmt_completed_at ??
                          assessment.asmt_created_at
                      )}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </CardHeader>
                {recommendation && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-[#6baed6]">
                      {RECOMMENDATION_LABELS[recommendation]}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
