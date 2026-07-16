import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { ResultReport } from "@/components/onboarding/result-report";
import { StartNewFromHistoryButton } from "@/components/history/start-new-from-history-button";
import { getHistorySession } from "@/lib/history/session-server";
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

export default async function MisEvaluacionDetallePage({ params }: PageProps) {
  const session = await getHistorySession();
  if (!session) {
    redirect("/mis-evaluaciones");
  }

  const { id } = await params;
  const assessment = await getAssessmentById(id);

  if (
    !assessment ||
    assessment.asmt_email !== session.hses_email ||
    !assessment.assessment_report ||
    (assessment.asmt_status !== "completed" &&
      assessment.asmt_status !== "report_generated")
  ) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main
        id="contenido-principal"
        className="min-h-screen bg-gradient-to-b from-accent/20 via-background to-background"
      >
        <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/mis-evaluaciones"
              className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              data-testid="history-back-to-list"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Mis evaluaciones
            </Link>
            <StartNewFromHistoryButton />
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <ResultReport
            assessment={assessment}
            showFeedback={false}
            showAnalyzeAnother={false}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
