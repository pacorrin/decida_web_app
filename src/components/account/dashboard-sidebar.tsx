"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Calculator, Coins, FileText, Menu } from "lucide-react";
import { BetaAccountNotice } from "@/components/beta/beta-account-notice";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/cuenta",
    label: "Análisis realizados",
    icon: FileText,
    isActive: (pathname: string) =>
      pathname === "/cuenta" || pathname.startsWith("/cuenta/evaluaciones"),
  },
  {
    href: "/cuenta/cifra",
    label: "Cifra",
    icon: Calculator,
    isActive: (pathname: string) => pathname.startsWith("/cuenta/cifra"),
  },
  {
    href: "/cuenta/creditos",
    label: "Créditos",
    icon: Coins,
    isActive: (pathname: string) => pathname.startsWith("/cuenta/creditos"),
  },
];

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación de la cuenta" className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = item.isActive(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/5 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 self-stretch border-r border-border/80 sm:block">
      {/* Fijo al alto de la ventana (menos el navbar de 4rem): el aviso de beta queda
          siempre abajo de la pantalla, no al final del contenido de la página. */}
      <div className="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col justify-between gap-6 py-8 pr-4">
        <SidebarLinks />
        <BetaAccountNotice />
      </div>
    </aside>
  );
}

/** El mismo menú de la barra lateral, en un panel para pantallas chicas donde la barra se oculta. */
export function DashboardMobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            aria-label="Abrir menú de la cuenta"
            data-testid="dashboard-mobile-menu"
          />
        }
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-2rem,20rem)]">
        <SheetHeader>
          <SheetTitle>Menú</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col justify-between gap-6 px-4 pb-4">
          <SidebarLinks onNavigate={() => setOpen(false)} />
          <BetaAccountNotice />
        </div>
      </SheetContent>
    </Sheet>
  );
}
