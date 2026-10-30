"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { ChevronDown, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logOut } from "@/app/cuenta/actions";
import { resetAnalytics } from "@/lib/analytics/client";
import { DashboardMobileNav } from "@/components/account/dashboard-sidebar";
import { PlanBadge } from "@/components/account/plan-badge";
import { BetaBadge } from "@/components/beta/beta-badge";

type DashboardNavbarProps = {
  user: {
    user_name: string | null;
    user_email: string;
    user_subscription_status: string;
    user_subscription_plan: string | null;
    user_subscription_period_end: Date | null;
  };
};

export function DashboardNavbar({ user }: DashboardNavbarProps) {
  const [, startTransition] = useTransition();
  const label = user.user_name ?? user.user_email;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background">
      <div className="mx-auto flex h-16 w-full max-w-[2560px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <DashboardMobileNav />
          <Link
            href="/cuenta"
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Decida, mi cuenta"
          >
            <Image src="/logo.svg" alt="" width={44} height={27} aria-hidden />
            <span className="text-lg font-semibold tracking-tight text-primary">
              Decida
            </span>
          </Link>
          <BetaBadge className="shrink-0 px-2 py-0.5 text-[11px]">Beta</BetaBadge>
        </div>

        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <PlanBadge user={user} />
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Menú de ${label}`}
              className="flex items-center gap-2 rounded-lg border border-transparent px-1 py-1.5 sm:px-2 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              data-testid="dashboard-user-menu"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="size-4" aria-hidden />
              </span>
              <span className="hidden max-w-40 truncate sm:inline">{label}</span>
              <ChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem render={<Link href="/cuenta/perfil" />}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/cuenta/cifra" />}>
                Cifra
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/cuenta/creditos" />}>
                Créditos
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/cuenta/suscripcion" />}>
                Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-testid="dashboard-logout"
                onClick={() => {
                  resetAnalytics();
                  startTransition(() => {
                    void logOut();
                  });
                }}
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
