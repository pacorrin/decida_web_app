"use client";

import { useActionState } from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { StepNavigation } from "@/components/onboarding/step-navigation";
import { saveProfile } from "@/app/analizar/actions";
import {
  CURRENT_SITUATION_OPTIONS,
  MAIN_GOAL_OPTIONS,
  EXPERIENCE_OPTIONS,
} from "@/lib/onboarding/options";
import type { ActionState } from "@/lib/onboarding/schemas";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type ProfileFormProps = {
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

export function ProfileForm({ assessment }: ProfileFormProps) {
  const [state, action, pending] = useActionState(saveProfile, initialState);
  const profile = assessment.assessment_profile;

  return (
    <form action={action}>
      <FieldGroup>
        <SelectField
          id="currentSituation"
          name="currentSituation"
          label="¿Cuál es tu situación actual?"
          options={CURRENT_SITUATION_OPTIONS}
          defaultValue={profile?.aprf_current_situation}
          error={state.fieldErrors?.currentSituation}
        />
        <SelectField
          id="mainGoal"
          name="mainGoal"
          label="¿Cuál es tu objetivo principal?"
          options={MAIN_GOAL_OPTIONS}
          defaultValue={profile?.aprf_main_goal}
          error={state.fieldErrors?.mainGoal}
        />
        <SelectField
          id="entrepreneurshipExperience"
          name="entrepreneurshipExperience"
          label="¿Cuánta experiencia tienes emprendiendo?"
          options={EXPERIENCE_OPTIONS}
          defaultValue={profile?.aprf_entrepreneurship_experience}
          error={state.fieldErrors?.entrepreneurshipExperience}
        />
      </FieldGroup>
      <StepNavigation currentSlug="perfil" isPending={pending} />
    </form>
  );
}
