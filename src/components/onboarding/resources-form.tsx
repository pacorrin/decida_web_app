"use client";

import { useActionState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { StepNavigation } from "@/components/onboarding/step-navigation";
import { saveResources } from "@/app/analizar/actions";
import {
  CAPITAL_RANGE_OPTIONS,
  LOSS_RANGE_OPTIONS,
  HOURS_RANGE_OPTIONS,
  SCHEDULE_OPTIONS,
  INCOME_TIMEFRAME_OPTIONS,
} from "@/lib/onboarding/options";
import type { ActionState } from "@/lib/onboarding/schemas";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type ResourcesFormProps = {
  assessment: AssessmentWithRelations;
};

function SelectField({
  id,
  name,
  label,
  options,
  defaultValue,
  error,
}: {
  id: string;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  error?: string[];
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        required
        className={selectClass}
        aria-invalid={!!error?.length}
      >
        <option value="" disabled>
          Selecciona una opción
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldError errors={error?.map((m) => ({ message: m }))} />
    </Field>
  );
}

export function ResourcesForm({ assessment }: ResourcesFormProps) {
  const [state, action, pending] = useActionState(saveResources, initialState);
  const profile = assessment.assessment_profile;

  return (
    <form action={action}>
      <FieldGroup>
        <SelectField
          id="capitalAvailableRange"
          name="capitalAvailableRange"
          label="¿Cuánto capital tienes disponible para invertir?"
          options={CAPITAL_RANGE_OPTIONS}
          defaultValue={profile?.aprf_capital_available_range}
          error={state.fieldErrors?.capitalAvailableRange}
        />
        <SelectField
          id="acceptableLossRange"
          name="acceptableLossRange"
          label="¿Cuánto estarías dispuesto a perder sin afectar tu estabilidad?"
          options={LOSS_RANGE_OPTIONS}
          defaultValue={profile?.aprf_acceptable_loss_range}
          error={state.fieldErrors?.acceptableLossRange}
        />
        <SelectField
          id="hoursPerWeekRange"
          name="hoursPerWeekRange"
          label="¿Cuántas horas por semana puedes dedicar?"
          options={HOURS_RANGE_OPTIONS}
          defaultValue={profile?.aprf_hours_per_week_range}
          error={state.fieldErrors?.hoursPerWeekRange}
        />
        <SelectField
          id="availableSchedule"
          name="availableSchedule"
          label="¿Cuándo tienes disponibilidad?"
          options={SCHEDULE_OPTIONS}
          defaultValue={profile?.aprf_available_schedule}
          error={state.fieldErrors?.availableSchedule}
        />
        <SelectField
          id="expectedIncomeTimeframe"
          name="expectedIncomeTimeframe"
          label="¿En cuánto tiempo esperas ver resultados?"
          options={INCOME_TIMEFRAME_OPTIONS}
          defaultValue={profile?.aprf_expected_income_timeframe}
          error={state.fieldErrors?.expectedIncomeTimeframe}
        />
      </FieldGroup>
      <StepNavigation currentSlug="recursos" isPending={pending} />
    </form>
  );
}
