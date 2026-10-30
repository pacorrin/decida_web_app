"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Coins, FileText } from "lucide-react";
import { BetaAccountNotice } from "@/components/beta/beta-account-notice";
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

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 self-stretch border-r border-border/80 sm:block">
      {/* Fijo al alto de la ventana (menos el navbar de 4rem): el aviso de beta queda
          siempre abajo de la pantalla, no al final del contenido de la página. */}
      <div className="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col justify-between gap-6 py-8 pr-4">
        <nav aria-label="Navegación de la cuenta" className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
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
        <BetaAccountNotice />
      </div>
    </aside>
  );
}
