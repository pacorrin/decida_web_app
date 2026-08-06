"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  requestPasswordReset,
  resetPassword,
  type AuthActionState,
} from "@/app/cuenta/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: AuthActionState = { success: false, step: "form" };

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [codeStep, setCodeStep] = useState(false);

  const [requestState, requestAction, requestPending] = useActionState(
    async (prev: AuthActionState, formData: FormData) => {
      const result = await requestPasswordReset(prev, formData);
      if (result.success && result.step === "verify") {
        setCodeStep(true);
        const submittedEmail = formData.get("email");
        if (typeof submittedEmail === "string") setEmail(submittedEmail);
      }
      return result;
    },
    initialState
  );

  const [resetState, resetAction, resetPending] = useActionState(
    resetPassword,
    initialState
  );

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recupera tu contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={requestAction} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reset-email">Correo electrónico</FieldLabel>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  disabled={codeStep}
                  aria-invalid={!!requestState.fieldErrors?.email}
                />
                <FieldError
                  errors={requestState.fieldErrors?.email?.map((m) => ({ message: m }))}
                />
              </Field>
            </FieldGroup>

            {requestState.message && (
              <p
                className={`text-sm ${requestState.success ? "text-[#6baed6]" : "text-destructive"}`}
              >
                {requestState.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={requestPending || codeStep}>
              {requestPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Enviando…
                </>
              ) : (
                "Enviar código"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {codeStep && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Elige una nueva contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={resetAction} className="space-y-4">
              <input type="hidden" name="email" value={email} readOnly />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="reset-code">Código de verificación</FieldLabel>
                  <Input
                    id="reset-code"
                    name="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    required
                    aria-invalid={!!resetState.fieldErrors?.code}
                  />
                  <FieldDescription>Revisa tu correo. El código expira en 15 minutos.</FieldDescription>
                  <FieldError
                    errors={resetState.fieldErrors?.code?.map((m) => ({ message: m }))}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="new-password">Nueva contraseña</FieldLabel>
                  <Input
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    required
                    aria-invalid={!!resetState.fieldErrors?.password}
                  />
                  <FieldError
                    errors={resetState.fieldErrors?.password?.map((m) => ({ message: m }))}
                  />
                </Field>
              </FieldGroup>

              {resetState.message && (
                <p
                  className={`text-sm ${resetState.success ? "text-[#6baed6]" : "text-destructive"}`}
                >
                  {resetState.message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={resetPending}>
                {resetPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Actualizando…
                  </>
                ) : (
                  "Actualizar contraseña"
                )}
              </Button>

              {resetState.success && (
                <Button
                  render={<Link href="/cuenta/iniciar-sesion" />}
                  nativeButton={false}
                  variant="outline"
                  className="w-full"
                >
                  Ir a iniciar sesión
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
