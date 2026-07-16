"use client";

import { useTransition } from "react";
import { startNewAssessment } from "@/app/analizar/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

export function AnalyzeAnotherButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="lg"
      className="w-full sm:w-auto"
      data-testid="analyze-another-idea"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void startNewAssessment();
        });
      }}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Preparando…
        </>
      ) : (
        <>
          <Sparkles className="size-4" aria-hidden />
          Analizar otra idea
        </>
      )}
    </Button>
  );
}
