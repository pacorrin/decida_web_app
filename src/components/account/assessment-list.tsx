import Link from "next/link";
import {
  RECOMMENDATION_LABELS,
  type RecommendationType,
} from "@/lib/example-report-data";
import type { getUserAssessments } from "@/app/cuenta/actions";
import { ChevronRight } from "lucide-react";

type AssessmentListItem = Awaited<ReturnType<typeof getUserAssessments>>[number];

function formatDay(date: Date | null | undefined): string {
  if (!date) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
}

function formatTime(date: Date | null | undefined): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("es-MX", { timeStyle: "short" }).format(date);
}

/** Cada recomendación lleva un color de la marca: la franja de la fila y el fondo pálido de su etiqueta. */
const TONE: Record<RecommendationType, { bar: string; chip: string }> = {
  proceed_small_test: { bar: "bg-[#81c784]", chip: "bg-[#81c784]/30" },
  validate_first: { bar: "bg-[#6baed6]", chip: "bg-[#6baed6]/30" },
  adjust_idea: { bar: "bg-[#ffb74d]", chip: "bg-[#ffb74d]/30" },
  pause_for_now: { bar: "bg-[#ff7043]", chip: "bg-[#ff7043]/25" },
};

function ideaSummary(assessment: AssessmentListItem): string {
  const idea = assessment.business_idea;
  if (idea?.bide_ai_summary) {
    return idea.bide_ai_summary.length > 160
      ? `${idea.bide_ai_summary.slice(0, 160)}…`
      : idea.bide_ai_summary;
  }
  if (idea?.bide_original_description) {
    return idea.bide_original_description.length > 160
      ? `${idea.bide_original_description.slice(0, 160)}…`
      : idea.bide_original_description;
  }
  return "Idea sin título";
}

type AccountAssessmentListProps = {
  assessments: AssessmentListItem[];
};

export function AccountAssessmentList({ assessments }: AccountAssessmentListProps) {
  if (assessments.length === 0) {
    return (
      <p className="rounded-2xl bg-muted p-5 text-base text-foreground">
        Aún no tienes evaluaciones completadas con esta cuenta.
      </p>
    );
  }

  return (
    <ul className="space-y-2" data-testid="account-assessment-list">
      {assessments.map((assessment) => {
        const recommendation = assessment.assessment_score
          ?.ascs_final_recommendation as RecommendationType | null | undefined;
        const tone = recommendation ? TONE[recommendation] : null;
        const when =
          assessment.asmt_report_generated_at ?? assessment.asmt_completed_at ?? assessment.asmt_created_at;

        return (
          <li key={assessment.asmt_id}>
            <Link
              href={`/cuenta/evaluaciones/${assessment.asmt_id}`}
              className="group flex items-stretch overflow-hidden rounded-2xl bg-muted transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px"
              data-testid={`account-assessment-${assessment.asmt_id}`}
            >
              <span aria-hidden className={`w-1.5 shrink-0 ${tone?.bar ?? "bg-border"}`} />
              <div className="grid min-w-0 flex-1 gap-x-6 gap-y-2 px-5 py-4 lg:grid-cols-[7.5rem_minmax(0,1fr)_auto] lg:items-center">
                <p className="text-sm text-muted-foreground">
                  <span className="block font-medium text-foreground">{formatDay(when)}</span>
                  {formatTime(when)}
                </p>
                <p className="line-clamp-2 text-base font-medium leading-snug text-foreground">
                  {ideaSummary(assessment)}
                </p>
                {recommendation && tone && (
                  <p className={`w-fit rounded-full px-3 py-1 text-sm font-medium text-foreground ${tone.chip}`}>
                    {RECOMMENDATION_LABELS[recommendation]}
                  </p>
                )}
              </div>
              <ChevronRight
                className="my-auto mr-4 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
