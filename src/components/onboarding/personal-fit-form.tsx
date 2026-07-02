"use client";

import { useActionState } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { StepNavigation } from "@/components/onboarding/step-navigation";
import { savePersonalFit } from "@/app/analizar/actions";
import {
  ENJOYED_ACTIVITIES_OPTIONS,
  WORK_PREFERENCE_OPTIONS,
  HIRING_PREFERENCE_OPTIONS,
  COMFORT_SCALE_OPTIONS,
} from "@/lib/onboarding/options";
import type { ActionState } from "@/lib/onboarding/schemas";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type PersonalFitFormProps = {
  assessment: AssessmentWithRelations;
};

export function PersonalFitForm({ assessment }: PersonalFitFormProps) {
  const [state, action, pending] = useActionState(savePersonalFit, initialState);
  const fit = assessment.personal_fit_answers;
  const enjoyed = (fit?.pfit_enjoyed_activities as string[]) ?? [];

  return (
    <form action={action}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>¿Qué actividades disfrutas más?</FieldLegend>
          <FieldDescription>Selecciona todas las que apliquen.</FieldDescription>
          <div className="grid gap-2 sm:grid-cols-2">
            {ENJOYED_ACTIVITIES_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5"
              >
                <input
                  type="checkbox"
                  name="enjoyedActivities"
                  value={opt.value}
                  defaultChecked={enjoyed.includes(opt.value)}
                  className="size-4 rounded border-input"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <FieldError
            errors={state.fieldErrors?.enjoyedActivities?.map((m) => ({
              message: m,
            }))}
          />
        </FieldSet>

        <Field>
          <FieldLabel htmlFor="workPreference">
            ¿Prefieres trabajo físico, digital o mixto?
          </FieldLabel>
          <select
            id="workPreference"
            name="workPreference"
            defaultValue={fit?.pfit_work_preference ?? ""}
            required
            className={selectClass}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {WORK_PREFERENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FieldError
            errors={state.fieldErrors?.workPreference?.map((m) => ({
              message: m,
            }))}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="salesComfortScore">
            ¿Qué tan cómodo te sientes vendiendo?
          </FieldLabel>
          <select
            id="salesComfortScore"
            name="salesComfortScore"
            defaultValue={String(fit?.pfit_sales_comfort_score ?? "")}
            required
            className={selectClass}
          >
            <option value="" disabled>
              Selecciona
            </option>
            {COMFORT_SCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel htmlFor="uncertaintyComfortScore">
            ¿Qué tanto toleras la incertidumbre?
          </FieldLabel>
          <select
            id="uncertaintyComfortScore"
            name="uncertaintyComfortScore"
            defaultValue={String(fit?.pfit_uncertainty_comfort_score ?? "")}
            required
            className={selectClass}
          >
            <option value="" disabled>
              Selecciona
            </option>
            {COMFORT_SCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel htmlFor="hiringPreference">
            ¿Te gustaría contratar personas?
          </FieldLabel>
          <select
            id="hiringPreference"
            name="hiringPreference"
            defaultValue={fit?.pfit_hiring_preference ?? ""}
            required
            className={selectClass}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {HIRING_PREFERENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field>
          <FieldLabel htmlFor="processComfortScore">
            ¿Qué tanto te gusta seguir procesos?
          </FieldLabel>
          <select
            id="processComfortScore"
            name="processComfortScore"
            defaultValue="3"
            required
            className={selectClass}
          >
            {COMFORT_SCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      </FieldGroup>

      <StepNavigation currentSlug="ajuste" isPending={pending} />
    </form>
  );
}
