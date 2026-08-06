import { redirect } from "next/navigation";
import { AccountAssessmentList } from "@/components/account/assessment-list";
import { StartAssessmentButton } from "@/components/onboarding/start-assessment-button";
import { getCurrentUser } from "@/lib/auth/session-server";
import { getUserAssessments } from "@/app/cuenta/actions";

export const metadata = {
  title: "Mi cuenta | Decida",
  description: "Panel de tu cuenta de Decida.",
};

export default async function CuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  const assessments = await getUserAssessments(user.user_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            Análisis realizados
          </h1>
          <p className="text-sm text-muted-foreground">
            Evaluaciones completadas con esta cuenta.
          </p>
        </div>
        <StartAssessmentButton />
      </div>

      <AccountAssessmentList assessments={assessments} />
    </div>
  );
}
