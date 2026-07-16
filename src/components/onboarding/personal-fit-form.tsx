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
import { OptionCardGroup } from "@/components/onboarding/option-card-group";
import { savePersonalFit } from "@/app/analizar/actions";
import {
  ENJOYED_ACTIVITIES_OPTIONS,
  WORK_PREFERENCE_OPTIONS,
  HIRING_PREFERENCE_OPTIONS,
  COMFORT_SCALE_CARD_OPTIONS,
} from "@/lib/onboarding/options";
import { fieldValue, fieldValues, type ActionState } from "@/lib/onboarding/schemas";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

type PersonalFitFormProps = {
  assessment: AssessmentWithRelations;
};

export function PersonalFitForm({ assessment }: PersonalFitFormProps) {
  const [state, action, pending] = useActionState(savePersonalFit, initialState);
  const fit = assessment.personal_fit_answers;
  const enjoyed = (fit?.pfit_enjoyed_activities as string[]) ?? [];
  const v = state.values;
  const enjoyedValues = fieldValues(v, "enjoyedActivities", enjoyed);

  return (
    <form key={v ? "error" : "initial"} action={action}>
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
                  defaultChecked={enjoyedValues.includes(opt.value)}
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
          <FieldLabel>¿Prefieres trabajo físico, digital o mixto?</FieldLabel>
          <OptionCardGroup
            name="workPreference"
            options={WORK_PREFERENCE_OPTIONS}
            defaultValue={fieldValue(v, "workPreference", fit?.pfit_work_preference ?? "")}
            layout="stack"
            columns={1}
            required
            ariaLabel="Preferencia de trabajo"
          />
          <FieldError
            errors={state.fieldErrors?.workPreference?.map((m) => ({
              message: m,
            }))}
          />
        </Field>

        <Field>
          <FieldLabel>¿Qué tan cómodo te sientes vendiendo?</FieldLabel>
          <OptionCardGroup
            name="salesComfortScore"
            options={COMFORT_SCALE_CARD_OPTIONS}
            defaultValue={fieldValue(
              v,
              "salesComfortScore",
              fit?.pfit_sales_comfort_score != null
                ? String(fit.pfit_sales_comfort_score)
                : ""
            )}
            columns={5}
            required
            ariaLabel="Comodidad vendiendo"
          />
        </Field>

        <Field>
          <FieldLabel>¿Qué tanto toleras la incertidumbre?</FieldLabel>
          <OptionCardGroup
            name="uncertaintyComfortScore"
            options={COMFORT_SCALE_CARD_OPTIONS}
            defaultValue={fieldValue(
              v,
              "uncertaintyComfortScore",
              fit?.pfit_uncertainty_comfort_score != null
                ? String(fit.pfit_uncertainty_comfort_score)
                : ""
            )}
            columns={5}
            required
            ariaLabel="Tolerancia a la incertidumbre"
          />
        </Field>

        <Field>
          <FieldLabel>¿Te gustaría contratar personas?</FieldLabel>
          <OptionCardGroup
            name="hiringPreference"
            options={HIRING_PREFERENCE_OPTIONS}
            defaultValue={fieldValue(v, "hiringPreference", fit?.pfit_hiring_preference ?? "")}
            layout="stack"
            columns={1}
            required
            ariaLabel="Preferencia de contratación"
          />
        </Field>

        <Field>
          <FieldLabel>¿Qué tanto te gusta seguir procesos?</FieldLabel>
          <OptionCardGroup
            name="processComfortScore"
            options={COMFORT_SCALE_CARD_OPTIONS}
            defaultValue={fieldValue(v, "processComfortScore", "3")}
            columns={5}
            required
            ariaLabel="Comodidad siguiendo procesos"
          />
        </Field>
      </FieldGroup>

      <StepNavigation currentSlug="ajuste" isPending={pending} />
    </form>
  );
}
