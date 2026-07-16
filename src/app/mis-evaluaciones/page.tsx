import Link from "next/link";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { HistoryLoginForm } from "@/components/history/history-login-form";
import { AssessmentList } from "@/components/history/assessment-list";
import { StartNewFromHistoryButton } from "@/components/history/start-new-from-history-button";
import { getHistorySession } from "@/lib/history/session-server";
import { getHistoryAssessments, signOutHistory } from "@/app/mis-evaluaciones/actions";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Mis evaluaciones | Decida",
  description: "Consulta tus diagnósticos de ideas de negocio anteriores.",
};

export default async function MisEvaluacionesPage() {
  const session = await getHistorySession();

  return (
    <>
      <SiteHeader />
      <main
        id="contenido-principal"
        className="min-h-[calc(100vh-12rem)] bg-gradient-to-b from-accent/20 via-background to-background"
      >
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              Mis evaluaciones
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              {session
                ? "Aquí están tus diagnósticos anteriores."
                : "Ingresa tu correo y el código de verificación para ver tus diagnósticos."}
            </p>
          </div>

          {session ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Sesión: <span className="font-medium text-foreground">{session.hses_email}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <StartNewFromHistoryButton />
                  <form action={signOutHistory}>
                    <Button type="submit" variant="ghost" size="sm" data-testid="history-sign-out">
                      Cerrar sesión
                    </Button>
                  </form>
                </div>
              </div>
              <AssessmentList
                assessments={await getHistoryAssessments(session.hses_email)}
              />
            </div>
          ) : (
            <HistoryLoginForm />
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿Primera vez?{" "}
            <Link href="/analizar" className="text-primary underline-offset-4 hover:underline">
              Analiza una idea
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
