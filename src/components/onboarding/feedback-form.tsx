"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThumbsDown, ThumbsUp, CheckCircle2 } from "lucide-react";
import { saveFeedback } from "@/app/analizar/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";
import type { ActionState } from "@/lib/onboarding/schemas";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";
import { cn } from "@/lib/utils";

const initialState: ActionState = { success: false };

const RATING_OPTIONS = [
  { value: 1, label: "1", hint: "Nada útil" },
  { value: 2, label: "2", hint: "Poco útil" },
  { value: 3, label: "3", hint: "Regular" },
  { value: 4, label: "4", hint: "Útil" },
  { value: 5, label: "5", hint: "Muy útil" },
] as const;

type FeedbackFormProps = {
  assessment: AssessmentWithRelations;
};

export function FeedbackForm({ assessment }: FeedbackFormProps) {
  const router = useRouter();
  const existingFeedback = assessment.feedback;
  const [state, action, pending] = useActionState(saveFeedback, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  if (existingFeedback) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex items-start gap-3 py-6">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-emerald-900">
              ¡Gracias por tu opinión!
            </p>
            <p className="text-sm text-emerald-800">
              Tu feedback nos ayuda a mejorar la calidad de los diagnósticos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel>¿Te fue útil este diagnóstico?</FieldLabel>
          <FieldDescription>
            Califica del 1 (nada útil) al 5 (muy útil).
          </FieldDescription>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Calificación de utilidad"
          >
            {RATING_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex min-w-[3.25rem] cursor-pointer flex-col items-center rounded-lg border border-border/70 px-3 py-2 text-center transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5"
                )}
              >
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  required
                  className="sr-only"
                  aria-label={`${option.value} — ${option.hint}`}
                />
                <span className="text-base font-semibold text-primary">
                  {option.label}
                </span>
                <span className="mt-0.5 text-[0.65rem] leading-tight text-muted-foreground">
                  {option.hint}
                </span>
              </label>
            ))}
          </div>
          <FieldError
            errors={state.fieldErrors?.rating?.map((message) => ({ message }))}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="feedback-comment">
            Comentarios (opcional)
          </FieldLabel>
          <Textarea
            id="feedback-comment"
            name="comment"
            placeholder="¿Qué te gustó o qué mejorarías del diagnóstico?"
            rows={3}
            maxLength={2000}
            aria-invalid={!!state.fieldErrors?.comment}
          />
          <FieldError
            errors={state.fieldErrors?.comment?.map((message) => ({ message }))}
          />
        </Field>

        <Field>
          <FieldLabel>¿Recomendarías Decida?</FieldLabel>
          <FieldDescription>
            Tu respuesta nos ayuda a entender si estamos cumpliendo tu
            expectativa.
          </FieldDescription>
          <div
            className="flex flex-wrap gap-3"
            role="radiogroup"
            aria-label="¿Recomendarías Decida?"
          >
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5">
              <input
                type="radio"
                name="wouldRecommend"
                value="true"
                required
                className="sr-only"
              />
              <ThumbsUp className="size-4 text-emerald-600" aria-hidden />
              Sí, la recomendaría
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5">
              <input
                type="radio"
                name="wouldRecommend"
                value="false"
                required
                className="sr-only"
              />
              <ThumbsDown className="size-4 text-amber-600" aria-hidden />
              No la recomendaría
            </label>
          </div>
          <FieldError
            errors={state.fieldErrors?.wouldRecommend?.map((message) => ({
              message,
            }))}
          />
        </Field>

        <Field>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 px-3 py-3 text-sm hover:bg-muted/40 has-checked:border-primary has-checked:bg-primary/5">
            <input
              type="checkbox"
              name="testimonialConsent"
              value="on"
              className="mt-0.5 size-4 rounded border-input"
            />
            <span>
              <span className="font-medium">
                Autorizo usar mi comentario como testimonio
              </span>
              <span className="mt-1 block text-muted-foreground">
                Solo si marcas esta casilla podremos mostrar tu opinión de forma
                anónima en nuestro sitio.
              </span>
            </span>
          </label>
        </Field>

        {state.message && !state.success && (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        )}

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Enviando..." : "Enviar feedback"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
