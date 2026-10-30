"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { LOGIN_LINK, NAV_LINKS } from "@/components/landing/landing-content";
import { CtaLink, PrimaryCtaButton } from "@/components/landing/cta-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="border-b border-border/80">
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

          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Navegación principal"
          >
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Inicio
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <CtaLink
              href={LOGIN_LINK.href}
              location="header_login"
              variant="outline"
            >
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
              <nav
                className="mt-4 flex flex-col gap-2 border-t border-border/80 px-4 pt-6"
                aria-labelledby="menu-navegacion"
              >
                <p
                  id="menu-navegacion"
                  className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Navegación
                </p>
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Inicio
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <nav
        className="border-b border-border/80 bg-muted/40"
        aria-label="Secciones de la página de inicio"
      >
        <ul className="mx-auto flex h-10 max-w-6xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8 md:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                className="block rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
