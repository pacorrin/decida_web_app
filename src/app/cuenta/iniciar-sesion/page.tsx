import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = {
  title: "Iniciar sesión | Decida",
  description: "Inicia sesión para consultar tus diagnósticos de negocio anteriores.",
};

type IniciarSesionPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function IniciarSesionPage({
  searchParams,
}: IniciarSesionPageProps) {
  const { next } = await searchParams;

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
              Inicia sesión
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Accede a tu cuenta de Decida.
            </p>
          </div>
          <SignInForm next={next} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
