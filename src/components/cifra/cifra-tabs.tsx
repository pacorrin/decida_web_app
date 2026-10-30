"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/cuenta/cifra", label: "Resumen" },
  { href: "/cuenta/cifra/cuentas", label: "Mis cuentas" },
  { href: "/cuenta/cifra/pagos", label: "Pagos" },
  { href: "/cuenta/cifra/movimientos", label: "Movimientos" },
] as const;

export function CifraTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones de Cifra" className="-mx-1 flex gap-1 overflow-x-auto border-b border-border/80 pb-px">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
