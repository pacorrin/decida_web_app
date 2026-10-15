import { AnalyticsIdentify } from "@/components/analytics/analytics-identify";
import { getCurrentUser } from "@/lib/auth/session-server";

export default async function AnalizarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <>
      {user && (
        <AnalyticsIdentify userId={user.user_id} />
      )}
      {children}
    </>
  );
}
