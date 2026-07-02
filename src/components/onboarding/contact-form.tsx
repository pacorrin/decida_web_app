"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { StepNavigation } from "@/components/onboarding/step-navigation";
import { saveContact } from "@/app/analizar/actions";
import type { ActionState } from "@/lib/onboarding/schemas";
import { COUNTRY_OPTIONS } from "@/lib/onboarding/options";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

type ContactFormProps = {
  assessment: AssessmentWithRelations | null;
};

export function ContactForm({ assessment }: ContactFormProps) {
  const [state, action, pending] = useActionState(saveContact, initialState);

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input
            id="name"
            name="name"
            defaultValue={assessment?.asmt_name ?? ""}
            placeholder="Tu nombre"
            required
            aria-invalid={!!state.fieldErrors?.name}
          />
          <FieldError errors={state.fieldErrors?.name?.map((m) => ({ message: m }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={assessment?.asmt_email ?? ""}
            placeholder="tu@correo.com"
            required
            aria-invalid={!!state.fieldErrors?.email}
          />
          <FieldDescription>
            Te enviaremos tu reporte a este correo.
          </FieldDescription>
          <FieldError errors={state.fieldErrors?.email?.map((m) => ({ message: m }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={assessment?.asmt_phone ?? ""}
            placeholder="+52 55 1234 5678"
            required
            aria-invalid={!!state.fieldErrors?.phone}
          />
          <FieldError errors={state.fieldErrors?.phone?.map((m) => ({ message: m }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="country">País</FieldLabel>
          <select
            id="country"
            name="country"
            defaultValue={assessment?.asmt_country ?? "MX"}
            required
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-invalid={!!state.fieldErrors?.country}
          >
            {COUNTRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.country?.map((m) => ({ message: m }))} />
        </Field>
      </FieldGroup>

      <StepNavigation currentSlug="contacto" isPending={pending} showBack={false} />
    </form>
  );
}
