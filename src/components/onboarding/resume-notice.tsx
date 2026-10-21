"use client";

import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { discardDraftAndRestart } from "@/app/analizar/actions";
import { Button } from "@/components/ui/button";

/**
 * Aviso al retomar un análisis en curso desde la cuenta («Analizar una idea»):
 * dice qué idea se retomó y permite empezar de cero con otra.
 */
export function ResumeNotice({ ideaSnippet }: { ideaSnippet: string }) {
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  if (params.get("retomado") !== "1") return null;

  return (
    <div
      role="status"
      data-testid="resume-notice"
      className="mx-auto mb-4 mt-3 flex w-[calc(100%-2rem)] max-w-2xl flex-col gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-foreground">
        Retomamos tu análisis en curso: <span className="font-medium">«{ideaSnippet}»</span>
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        data-testid="resume-notice-restart"
        onClick={() => {
          if (!window.confirm("Se descartará este borrador y empezarás con otra idea. ¿Continuar?")) return;
          startTransition(() => {
            void discardDraftAndRestart();
          });
        }}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Empezar con otra idea
      </Button>
    </div>
  );
}
