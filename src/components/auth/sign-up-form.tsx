"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUp, type AuthActionState } from "@/app/cuenta/actions";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { fieldValue } from "@/lib/onboarding/schemas";

const initialState: AuthActionState = { success: false, step: "form" };

export function SignUpForm({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);

  const v = signUpState.values;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Crea tu cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form key={v ? "error" : "initial"} action={signUpAction} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  defaultValue={fieldValue(v, "name")}
                  placeholder="Tu nombre"
                  required
                  aria-invalid={!!signUpState.fieldErrors?.name}
                />
                <FieldError
                  errors={signUpState.fieldErrors?.name?.map((m) => ({ message: m }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-email">Correo electrónico</FieldLabel>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={fieldValue(v, "email")}
                  placeholder="tu@correo.com"
                  required
                  aria-invalid={!!signUpState.fieldErrors?.email}
                />
                <FieldError
                  errors={signUpState.fieldErrors?.email?.map((m) => ({ message: m }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <PasswordField
                  id="password"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  aria-invalid={!!signUpState.fieldErrors?.password}
                />
                <FieldError
                  errors={signUpState.fieldErrors?.password?.map((m) => ({ message: m }))}
                />
              </Field>
            </FieldGroup>

            {turnstileSiteKey && (
              <TurnstileWidget siteKey={turnstileSiteKey} resetSignal={signUpState} />
            )}

            {signUpState.message && (
              <p
                className={`text-sm ${signUpState.success ? "text-[#6baed6]" : "text-destructive"}`}
              >
                {signUpState.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={signUpPending}>
              {signUpPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Enviando código…
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/cuenta/iniciar-sesion" className="text-primary underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
