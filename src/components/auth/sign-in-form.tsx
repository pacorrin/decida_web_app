"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { logIn, type AuthActionState } from "@/app/cuenta/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fieldValue } from "@/lib/onboarding/schemas";

const initialState: AuthActionState = { success: false, step: "form" };

type SignInFormProps = {
  /** Same-site path to return to after a successful login (e.g. "/analizar"). */
  next?: string;
};

export function SignInForm({ next }: SignInFormProps) {
  const [state, action, pending] = useActionState(logIn, initialState);
  const v = state.values;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inicia sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form key={v ? "error" : "initial"} action={action} className="space-y-4">
            {next && <input type="hidden" name="next" value={next} readOnly />}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="login-email">Correo electrónico</FieldLabel>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={fieldValue(v, "email")}
                  placeholder="tu@correo.com"
                  required
                  aria-invalid={!!state.fieldErrors?.email}
                />
                <FieldError errors={state.fieldErrors?.email?.map((m) => ({ message: m }))} />
              </Field>

              <Field>
                <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={!!state.fieldErrors?.password}
                />
                <FieldError errors={state.fieldErrors?.password?.map((m) => ({ message: m }))} />
              </Field>
            </FieldGroup>

            {state.message && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Entrando…
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <Link href="/cuenta/recuperar" className="text-primary underline-offset-4 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
        <p>
          ¿Primera vez?{" "}
          <Link href="/cuenta/registro" className="text-primary underline-offset-4 hover:underline">
            Crea tu cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
