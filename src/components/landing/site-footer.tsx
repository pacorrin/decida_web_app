import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS } from "@/components/landing/landing-content";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image src="/logo.svg" alt="" width={24} height={24} aria-hidden />
              <span className="font-semibold text-primary">Decida</span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              No es una plantilla. Es una herramienta para tomar mejores
              decisiones antes de invertir en una idea de negocio.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Este diagnóstico no reemplaza asesoría financiera, fiscal o legal
              personalizada. Usa estimaciones básicas para darte claridad inicial.
            </p>
          </div>
          <nav aria-label="Enlaces del pie de página">
            <p className="mb-3 text-sm font-medium text-primary">Secciones</p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Separator className="my-8" />
        <LegalFooterLinks className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-1" />
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Decida. Business Viability Assessment.
        </p>
      </div>
    </footer>
  );
}
