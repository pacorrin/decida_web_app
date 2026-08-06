import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = {
  title: "Crea tu cuenta | Decida",
  description: "Crea tu cuenta para guardar y consultar tus diagnósticos de negocio.",
};

export default function RegistroPage() {
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
              Crea tu cuenta
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Guarda tus diagnósticos y consúltalos cuando quieras.
            </p>
          </div>
          <SignUpForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
