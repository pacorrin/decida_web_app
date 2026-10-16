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

  return (
    <OnboardingFlowProvider skipPlan={hasFullAccess(user)}>
      {user && <AnalyticsIdentify userId={user.user_id} />}
      {children}
    </OnboardingFlowProvider>
  );
}
