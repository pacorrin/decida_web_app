import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session-server";
import { DashboardNavbar } from "@/components/account/dashboard-navbar";
import { DashboardSidebar } from "@/components/account/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <DashboardNavbar user={user} />
      <div className="mx-auto flex w-full max-w-[2560px] flex-1">
        <DashboardSidebar />
        <main
          id="contenido-principal"
          className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
