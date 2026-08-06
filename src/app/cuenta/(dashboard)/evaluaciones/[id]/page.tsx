import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ResultReport } from "@/components/onboarding/result-report";
import { getCurrentUser } from "@/lib/auth/session-server";
import { getAssessmentById } from "@/lib/onboarding/session-server";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Evaluación ${id.slice(0, 8)}… | Decida`,
  };
}

export default async function CuentaEvaluacionDetallePage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  const { id } = await params;
  const assessment = await getAssessmentById(id);

  if (
    !assessment ||
    assessment.asmt_user_id !== user.user_id ||
    !assessment.assessment_report ||
    (assessment.asmt_status !== "completed" &&
      assessment.asmt_status !== "report_generated")
  ) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/cuenta"
        className="-ml-3 inline-flex h-8 items-center gap-1 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        data-testid="account-back-to-list"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Análisis realizados
      </Link>

      <ResultReport
        assessment={assessment}
        showFeedback={false}
        showAnalyzeAnother={false}
      />
    </div>
  );
}
