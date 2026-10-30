import Link from "next/link";
import { LEGAL_LINKS, LOGIN_LINK } from "@/components/landing/landing-content";
import { BETA_FOOTER_TEXT } from "@/lib/beta";

const PAGE_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/cifra", label: "Cifra" },
  LOGIN_LINK,
] as const;

const LINK_CLASS =
  "rounded-md text-base text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

/** Pie único de todas las páginas públicas. */
export function SiteFooter() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <p
          data-testid="beta-footer-notice"
          className="max-w-xl text-lg font-medium leading-snug"
        >
          {BETA_FOOTER_TEXT}
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="space-y-3 text-base leading-relaxed text-white/85">
            <p>
              ¿Dudas? Escríbenos a{" "}
              <a
                href="mailto:hello@decida.mx"
                className="font-medium text-white underline underline-offset-4"
              >
                hello@decida.mx
              </a>
            </p>
            <p>
              Decida no reemplaza asesoría financiera, fiscal o legal
              personalizada. Usa estimaciones básicas para darte claridad
              inicial.
            </p>
          </div>
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16 md:justify-end">
            <nav aria-label="Enlaces del pie de página">
              <ul className="space-y-2">
                {PAGE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK_CLASS}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Enlaces legales">
              <ul className="space-y-2">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK_CLASS}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <p
          className="mt-14 text-[22vw] font-semibold leading-[0.85] tracking-tight sm:text-[16vw] lg:text-[12rem]"
          aria-hidden
        >
          Decida
        </p>
        <p className="mt-8 text-sm text-white/75">
          © {new Date().getFullYear()} Decida
        </p>
      </div>
    </footer>
  );
}
