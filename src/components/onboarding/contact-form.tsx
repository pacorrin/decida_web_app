"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { StepNavigation } from "@/components/onboarding/step-navigation";
import { saveContact } from "@/app/analizar/actions";
import { fieldValue, isFieldChecked, type ActionState } from "@/lib/onboarding/schemas";
import { COUNTRY_OPTIONS } from "@/lib/onboarding/options";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

type ContactFormProps = {
  assessment: AssessmentWithRelations | null;
};

export function ContactForm({ assessment }: ContactFormProps) {
  const [state, action, pending] = useActionState(saveContact, initialState);
  const v = state.values;

  return (
    <form key={v ? "error" : "initial"} action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input
            id="name"
            name="name"
            defaultValue={fieldValue(v, "name", assessment?.asmt_name ?? "")}
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
            defaultValue={fieldValue(v, "email", assessment?.asmt_email ?? "")}
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
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            required
            aria-invalid={!!state.fieldErrors?.password}
          />
          <FieldDescription>
            Con esto creamos tu cuenta para guardar este diagnóstico y los que hagas después.
          </FieldDescription>
          <FieldError errors={state.fieldErrors?.password?.map((m) => ({ message: m }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={fieldValue(v, "phone", assessment?.asmt_phone ?? "")}
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
            defaultValue={fieldValue(v, "country", assessment?.asmt_country ?? "MX")}
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

        <Field>
          <label
            htmlFor="acceptedTerms"
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 px-3 py-3 text-sm hover:bg-muted/40 has-checked:border-primary has-checked:bg-primary/5"
          >
            <input
              id="acceptedTerms"
              type="checkbox"
              name="acceptedTerms"
              value="on"
              defaultChecked={isFieldChecked(v, "acceptedTerms")}
              required
              aria-invalid={!!state.fieldErrors?.acceptedTerms}
              className="mt-0.5 size-4 rounded border-input"
            />
            <span>
              <span className="font-medium">
                Acepto los términos y la política de privacidad
              </span>
              <span className="mt-1 block text-muted-foreground">
                He leído y acepto los{" "}
                <Link
                  href="/terminos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Términos de servicio
                </Link>{" "}
                y la{" "}
                <Link
                  href="/privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Política de privacidad
                </Link>
                , y autorizo el tratamiento de mis datos para enviarme el
                reporte.
              </span>
            </span>
          </label>
          <FieldError
            errors={state.fieldErrors?.acceptedTerms?.map((m) => ({ message: m }))}
          />
        </Field>
      </FieldGroup>

      {state.message && !state.success && (
        <p className="mt-4 text-sm text-destructive">
          {state.message}{" "}
          <Link
            href="/cuenta/iniciar-sesion?next=/analizar"
            className="font-medium underline underline-offset-4"
          >
            Iniciar sesión
          </Link>
        </p>
      )}

      <StepNavigation currentSlug="contacto" isPending={pending} showBack={false} />

      <LegalFooterLinks className="mt-8 justify-center border-t border-border/60 pt-6" />
    </form>
  );
}
