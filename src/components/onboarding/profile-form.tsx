"use client";

import { useActionState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { StepNavigation } from "@/components/onboarding/step-navigation";
import { OptionCardGroup } from "@/components/onboarding/option-card-group";
import { saveSituation } from "@/app/analizar/actions";
import {
  CURRENT_SITUATION_OPTIONS,
  MAIN_GOAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  CAPITAL_RANGE_OPTIONS,
  LOSS_RANGE_OPTIONS,
  HOURS_RANGE_OPTIONS,
  SCHEDULE_OPTIONS,
  INCOME_TIMEFRAME_OPTIONS,
} from "@/lib/onboarding/options";
import { fieldValue, type ActionState } from "@/lib/onboarding/schemas";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

type ProfileFormProps = {
  assessment: AssessmentWithRelations;
};

function CardSelectField({
  name,
  label,
  options,
  defaultValue,
  error,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  error?: string[];
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <OptionCardGroup
        name={name}
        options={options}
        defaultValue={defaultValue}
        layout="stack"
        columns={1}
        required
        ariaLabel={label}
      />
      <FieldError errors={error?.map((m) => ({ message: m }))} />
    </Field>
  );
}

export function ProfileForm({ assessment }: ProfileFormProps) {
  const [state, action, pending] = useActionState(saveSituation, initialState);
  const profile = assessment.assessment_profile;
  const v = state.values;

  return (
    <form key={v ? "error" : "initial"} action={action}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Sobre ti</FieldLegend>
          <CardSelectField
            name="currentSituation"
            label="¿Cuál es tu situación actual?"
            options={CURRENT_SITUATION_OPTIONS}
            defaultValue={fieldValue(v, "currentSituation", profile?.aprf_current_situation ?? "")}
            error={state.fieldErrors?.currentSituation}
          />
          <CardSelectField
            name="mainGoal"
            label="¿Cuál es tu objetivo principal?"
            options={MAIN_GOAL_OPTIONS}
            defaultValue={fieldValue(v, "mainGoal", profile?.aprf_main_goal ?? "")}
            error={state.fieldErrors?.mainGoal}
          />
          <CardSelectField
            name="entrepreneurshipExperience"
            label="¿Cuánta experiencia tienes emprendiendo?"
            options={EXPERIENCE_OPTIONS}
            defaultValue={fieldValue(
              v,
              "entrepreneurshipExperience",
              profile?.aprf_entrepreneurship_experience ?? ""
            )}
            error={state.fieldErrors?.entrepreneurshipExperience}
          />
        </FieldSet>

        <FieldSet>
          <FieldLegend>Tus recursos</FieldLegend>
          <CardSelectField
            name="capitalAvailableRange"
            label="¿Cuánto capital tienes disponible para invertir?"
            options={CAPITAL_RANGE_OPTIONS}
            defaultValue={fieldValue(
              v,
              "capitalAvailableRange",
              profile?.aprf_capital_available_range ?? ""
            )}
            error={state.fieldErrors?.capitalAvailableRange}
          />
          <CardSelectField
            name="acceptableLossRange"
            label="¿Cuánto estarías dispuesto a perder sin afectar tu estabilidad?"
            options={LOSS_RANGE_OPTIONS}
            defaultValue={fieldValue(
              v,
              "acceptableLossRange",
              profile?.aprf_acceptable_loss_range ?? ""
            )}
            error={state.fieldErrors?.acceptableLossRange}
          />
          <CardSelectField
            name="hoursPerWeekRange"
            label="¿Cuántas horas por semana puedes dedicar?"
            options={HOURS_RANGE_OPTIONS}
            defaultValue={fieldValue(
              v,
              "hoursPerWeekRange",
              profile?.aprf_hours_per_week_range ?? ""
            )}
            error={state.fieldErrors?.hoursPerWeekRange}
          />
          <CardSelectField
            name="availableSchedule"
            label="¿Cuándo tienes disponibilidad?"
            options={SCHEDULE_OPTIONS}
            defaultValue={fieldValue(
              v,
              "availableSchedule",
              profile?.aprf_available_schedule ?? ""
            )}
            error={state.fieldErrors?.availableSchedule}
          />
          <CardSelectField
            name="expectedIncomeTimeframe"
            label="¿En cuánto tiempo esperas ver resultados?"
            options={INCOME_TIMEFRAME_OPTIONS}
            defaultValue={fieldValue(
              v,
              "expectedIncomeTimeframe",
              profile?.aprf_expected_income_timeframe ?? ""
            )}
            error={state.fieldErrors?.expectedIncomeTimeframe}
          />
        </FieldSet>
      </FieldGroup>
      <StepNavigation currentSlug="perfil" isPending={pending} />
    </form>
  );
}
