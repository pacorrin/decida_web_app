import { Suspense } from "react";
import { ResumeNotice } from "@/components/onboarding/resume-notice";
import { getCurrentAssessment } from "@/lib/onboarding/session-server";
import { AnalyticsIdentify } from "@/components/analytics/analytics-identify";
import { OnboardingFlowProvider } from "@/components/onboarding/flow-context";
import { getCurrentUser } from "@/lib/auth/session-server";
import { hasFullAccess } from "@/lib/subscription/access";

export default async function AnalizarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const assessment = user ? await getCurrentAssessment() : null;
  const idea = assessment?.business_idea?.bide_original_description?.trim();
  const ideaSnippet = idea && idea.length > 80 ? `${idea.slice(0, 80)}…` : idea;

  return (
    <OnboardingFlowProvider skipPlan={hasFullAccess(user)}>
      {user && <AnalyticsIdentify userId={user.user_id} />}
      {ideaSnippet && (
        <Suspense fallback={null}>
          <ResumeNotice ideaSnippet={ideaSnippet} />
        </Suspense>
      )}
      {children}
    </OnboardingFlowProvider>
  );
}
