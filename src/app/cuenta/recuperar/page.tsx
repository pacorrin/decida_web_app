import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Recuperar contraseña | Decida",
  description: "Restablece la contraseña de tu cuenta de Decida.",
};

export default function RecuperarPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="contenido-principal"
        className="min-h-[calc(100vh-12rem)] bg-gradient-to-b from-accent/20 via-background to-background"
      >
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              Recupera tu contraseña
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Te enviaremos un código a tu correo para restablecerla.
            </p>
          </div>
          <ResetPasswordForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
