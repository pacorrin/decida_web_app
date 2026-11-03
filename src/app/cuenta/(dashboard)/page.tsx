import { redirect } from "next/navigation";
import { AccountAssessmentList } from "@/components/account/assessment-list";
import { StartAssessmentButton } from "@/components/onboarding/start-assessment-button";
import { CifraNotice } from "@/components/account/cifra-notice";
import { getCurrentUser } from "@/lib/auth/session-server";
import { getUserAssessments } from "@/app/cuenta/actions";
import { formatCredits } from "@/lib/credits/costs";

export const metadata = {
  title: "Mi cuenta | Decida",
  description: "Panel de tu cuenta de Decida.",
};

export default async function CuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  const assessments = await getUserAssessments(user.user_id);
  const firstName = user.user_name?.trim().split(/\s+/)[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      <section
        aria-labelledby="cuenta-heading"
        className="grid gap-5 rounded-3xl bg-primary p-5 text-white sm:p-6 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-center lg:gap-10 lg:px-8"
      >
        <div className="min-w-0 space-y-4">
          <div className="space-y-2">
            <h1
              id="cuenta-heading"
              className="text-balance text-2xl font-semibold leading-[1.15] tracking-[-0.02em] sm:text-3xl"
            >
              {firstName ? `Hola, ${firstName}` : "Tu cuenta"}
            </h1>
            <p className="max-w-xl text-pretty text-base text-white/80">
              Cuéntanos tu siguiente idea
            </p>
          </div>
          <StartAssessmentButton className="bg-white text-primary! hover:bg-white/90" />
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="space-y-1 rounded-xl bg-white/10 p-4">
            <dt className="text-sm text-white/80">Análisis realizados</dt>
            <dd className="text-3xl font-semibold leading-none tracking-[-0.03em] tabular-nums">
              {assessments.length}
            </dd>
          </div>
          <div className="space-y-1 rounded-xl bg-white/10 p-4">
            <dt className="text-sm text-white/80">Créditos</dt>
            <dd className="text-3xl font-semibold leading-none tracking-[-0.03em] tabular-nums">
              {formatCredits(user.user_credits_balance)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 sm:gap-6 lg:items-start lg:has-[[data-cifra-notice]]:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="analisis-heading" className="space-y-5">
          <h2 id="analisis-heading" className="text-3xl font-semibold tracking-tight text-primary">
            Análisis realizados
          </h2>
          <AccountAssessmentList assessments={assessments} />
        </section>

        <CifraNotice />
      </div>
    </div>
  );
}
