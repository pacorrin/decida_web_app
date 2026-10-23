"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runActionWithToast } from "@/lib/ui/toast-action";
import {
  unlockReportBasic,
  unlockReportWithResearch,
} from "@/app/analizar/actions";
import { CREDITS_PACKAGES_PATH } from "@/lib/credits/paths";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UnlockReportButtons({
  compact = false,
  assessmentId,
}: {
  compact?: boolean;
  assessmentId?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={
        compact
          ? "flex flex-col gap-2"
          : "flex flex-col gap-3 sm:flex-row sm:flex-wrap"
      }
    >
      <Button
        type="button"
        size={compact ? "sm" : "lg"}
        disabled={pending}
        className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
        data-testid="unlock-report-basic"
        onClick={() => {
          startTransition(async () => {
            await runActionWithToast(() => unlockReportBasic(assessmentId), {
              loading: "Desbloqueando…",
              success: "Reporte desbloqueado.",
              keepLoadingOnRedirect: true,
            });
          });
        }}
      >
        {pending ? "Procesando…" : "Desbloquear (0.5 créditos)"}
      </Button>
      <Button
        type="button"
        size={compact ? "sm" : "lg"}
        variant="outline"
        disabled={pending}
        data-testid="unlock-report-research"
        onClick={() => {
          startTransition(async () => {
            await runActionWithToast(
              () => unlockReportWithResearch(assessmentId),
              {
                loading: "Generando con investigación…",
                success: "Reporte actualizado con investigación.",
                keepLoadingOnRedirect: true,
              },
            );
          });
        }}
      >
        Con investigación (1.5 créditos)
      </Button>
      {!compact && (
        <Link
          href={CREDITS_PACKAGES_PATH}
          className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
        >
          Comprar créditos
        </Link>
      )}
    </div>
  );
}
