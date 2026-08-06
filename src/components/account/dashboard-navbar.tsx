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

type DashboardNavbarProps = {
  user: { user_name: string | null; user_email: string };
};

export function DashboardNavbar({ user }: DashboardNavbarProps) {
  const [, startTransition] = useTransition();
  const label = user.user_name ?? user.user_email;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/cuenta"
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Decida, mi cuenta"
        >
          <Image src="/logo.svg" alt="" width={28} height={28} aria-hidden />
          <span className="text-lg font-semibold tracking-tight text-primary">
            Decida
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            data-testid="dashboard-user-menu"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="size-4" aria-hidden />
            </span>
            <span className="max-w-40 truncate">{label}</span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem render={<Link href="/cuenta/perfil" />}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="dashboard-logout"
              onClick={() => {
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
    </header>
  );
}
