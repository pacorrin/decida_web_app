import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StartAssessmentButton } from "@/components/onboarding/start-assessment-button";
import { getCurrentUser } from "@/lib/auth/session-server";
import { logOut } from "./actions";

export const metadata = {
  title: "Mi cuenta | Decida",
  description: "Panel de tu cuenta de Decida.",
};

export default async function CuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  return (
    <>
      <SiteHeader />
      <main
        id="contenido-principal"
        className="min-h-[calc(100vh-12rem)] bg-gradient-to-b from-accent/20 via-background to-background"
      >
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              Hola{user.user_name ? `, ${user.user_name}` : ""}
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Tu cuenta está lista.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Panel de evaluaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Muy pronto verás aquí el historial completo de tus diagnósticos
                de negocio ligados a esta cuenta. Por ahora, tu correo verificado
                es <span className="font-medium text-foreground">{user.user_email}</span>.
              </p>
              <div className="flex flex-wrap gap-2">
                <StartAssessmentButton />
                <form action={logOut}>
                  <Button type="submit" variant="ghost">
                    Cerrar sesión
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
