"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runActionWithToast } from "@/lib/ui/toast-action";
import { buyCreditPackage } from "@/app/cuenta/(dashboard)/creditos/actions";
import type { CreditPackageId } from "@/lib/credits/packages";

export function BuyCreditsButton({
  packageId,
  label,
  highlighted = false,
}: {
  packageId: CreditPackageId;
  label: string;
  highlighted?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const fd = new FormData();
          fd.set("packageId", packageId);
          await runActionWithToast(
            () => buyCreditPackage({ success: false }, fd),
            {
              loading: "Preparando el pago…",
              success: "¡Créditos acreditados!",
              keepLoadingOnRedirect: true,
            },
          );
        });
      }}
    >
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        variant={highlighted ? "default" : "outline"}
        className={
          highlighted
            ? "w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            : "w-full"
        }
        data-testid={`buy-credits-${packageId}`}
      >
        {pending ? "Procesando..." : label}
      </Button>
    </form>
  );
}
