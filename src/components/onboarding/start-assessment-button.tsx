"use client";

import { useTransition } from "react";
import { startAssessmentForCurrentUser } from "@/app/analizar/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

export function StartAssessmentButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        startTransition(() => {
          void startAssessmentForCurrentUser();
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
          <Sparkles className="size-4 text-[#ff7043]" aria-hidden />
          Analizar una idea
        </>
      )}
    </Button>
  );
}
