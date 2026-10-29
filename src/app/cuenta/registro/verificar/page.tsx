import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import {
  getPendingVerification,
  maskEmail,
} from "@/lib/auth/pending-verification";

export const metadata = {
  title: "Confirma tu correo | Decida",
  description: "Ingresa el código que enviamos a tu correo para activar tu cuenta.",
};

export default async function VerificarRegistroPage() {
  const pending = await getPendingVerification();
  if (!pending || pending.flow !== "registro") redirect("/cuenta/registro");

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
              Revisa tu correo
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Para activar tu cuenta, ingresa el código que te enviamos.
            </p>
          </div>
          <VerifyEmailForm maskedEmail={maskEmail(pending.email)} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
