"use client";

import { useActionState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { StepNavigation } from "@/components/onboarding/step-navigation";
import {
  LoadingOverlay,
  IDEA_LOADING_MESSAGES,
} from "@/components/onboarding/loading-overlay";
import { saveIdea } from "@/app/analizar/actions";
import { fieldValue, type ActionState } from "@/lib/onboarding/schemas";
import { IDEA_PLACEHOLDER } from "@/lib/onboarding/copy";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

type IdeaFormProps = {
  assessment: AssessmentWithRelations;
};

export function IdeaForm({ assessment }: IdeaFormProps) {
  const [state, action, pending] = useActionState(saveIdea, initialState);
  const v = state.values;

  return (
    <>
      <LoadingOverlay
        isLoading={pending}
        title="Analizando tu idea"
        messages={IDEA_LOADING_MESSAGES}
        timeoutMs={45000}
        footerHint="Esto puede tomar unos segundos. Por favor no cierres esta ventana."
      />
      <form key={v ? "error" : "initial"} action={action} data-testid="idea-form">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="description">Describe tu idea de negocio</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={6}
            defaultValue={fieldValue(
              v,
              "description",
              assessment.business_idea?.bide_original_description ?? ""
            )}
            placeholder={IDEA_PLACEHOLDER}
            required
            className="min-h-36 resize-y"
            aria-invalid={!!state.fieldErrors?.description}
          />
          <FieldDescription>
            Incluye qué harías, para quién y cuándo operarías si lo sabes.
          </FieldDescription>
          <FieldError
            errors={state.fieldErrors?.description?.map((m) => ({ message: m }))}
          />
        </Field>
      </FieldGroup>

      <StepNavigation
        currentSlug="idea"
        isPending={pending}
        submitLabel={pending ? "Analizando tu idea..." : "Continuar"}
      />
    </form>
    </>
  );
}
