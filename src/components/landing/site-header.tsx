"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { LOGIN_LINK } from "@/components/landing/landing-content";
import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Páginas del sitio que aparecen en el menú principal. */
const PAGE_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/cifra", label: "Cifra" },
] as const;

const LINK_CLASS =
  "rounded-md px-1 text-base font-medium text-foreground/75 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Navbar único de todas las páginas públicas: logo a la izquierda; Inicio, Cifra,
 * inicio de sesión y llamada a la acción a la derecha. No cambia de una página a otra.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Decida, inicio"
        >
          <Image src="/logo.svg" alt="" width={44} height={27} aria-hidden />
          <span className="text-lg font-semibold tracking-tight text-primary">
            Decida
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-6" aria-label="Navegación principal">
            {PAGE_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={LINK_CLASS}>
                {link.label}
              </Link>
            ))}
          </nav>
          <CtaLink href={LOGIN_LINK.href} location="header_login" variant="outline">
            {LOGIN_LINK.label}
          </CtaLink>
          <PrimaryCtaButton href="/analizar" location="header">
            Analizar mi idea gratis
          </PrimaryCtaButton>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menú de navegación"
              />
            }
          >
            <Menu className="size-5" aria-hidden />
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-3 px-4">
              <CtaLink
                href={LOGIN_LINK.href}
                location="header_mobile_login"
                variant="outline"
                className="w-full sm:w-full"
              >
                {LOGIN_LINK.label}
              </CtaLink>
              <PrimaryCtaButton href="/analizar" location="header_mobile">
                Analizar mi idea gratis
              </PrimaryCtaButton>
            </div>
            <nav className="mt-4 flex flex-col gap-2 px-4 pt-6" aria-labelledby="menu-navegacion">
              <p
                id="menu-navegacion"
                className="px-3 text-sm font-medium text-muted-foreground"
              >
                Explorar
              </p>
              {PAGE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
