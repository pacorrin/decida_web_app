import type { Metadata } from "next";
import { ReportHeader } from "@/components/report/report-header";
import { SiteFooter } from "@/components/landing/site-footer";

type LegalPageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function createLegalMetadata(
  title: string,
  description: string
): Metadata {
  return {
    title: `${title} | Decida`,
    description,
  };
}

export function LegalPageShell({
  title,
  description,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <a
        href="#contenido-legal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <ReportHeader />
      <main
        id="contenido-legal"
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <header className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </header>
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium text-primary">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
