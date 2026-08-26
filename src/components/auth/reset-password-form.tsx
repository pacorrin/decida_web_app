"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  requestPasswordReset,
  verifyResetCode,
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

type Step = "email" | "code" | "password";

export function ResetPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [requestState, requestAction, requestPending] = useActionState(
    async (prev: AuthActionState, formData: FormData) => {
      const result = await requestPasswordReset(prev, formData);
      if (result.success && result.step === "code") {
        const submittedEmail = formData.get("email");
        if (typeof submittedEmail === "string") setEmail(submittedEmail);
        setStep("code");
      }
      return result;
    },
    initialState
  );

  const [verifyState, verifyAction, verifyPending] = useActionState(
    async (prev: AuthActionState, formData: FormData) => {
      const result = await verifyResetCode(prev, formData);
      if (result.success && result.step === "password") {
        const submittedCode = formData.get("code");
        if (typeof submittedCode === "string") setCode(submittedCode);
        setStep("password");
      }
      return result;
    },
    initialState
  );

  const [resetState, resetAction, resetPending] = useActionState(
    async (prev: AuthActionState, formData: FormData) => {
      const result = await resetPassword(prev, formData);
      // Code expired or was spent between screens — bounce back to the code step.
      if (!result.success && result.step === "code") setStep("code");
      return result;
    },
    initialState
  );

  return (
    <div className="mx-auto max-w-md space-y-6">
      {step === "email" && (
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
                    aria-invalid={!!requestState.fieldErrors?.email}
                  />
                  <FieldDescription>
                    Te enviaremos un código de 6 dígitos para restablecerla.
                  </FieldDescription>
                  <FieldError
                    errors={requestState.fieldErrors?.email?.map((m) => ({ message: m }))}
                  />
                </Field>
              </FieldGroup>

              {requestState.message && !requestState.success && (
                <p className="text-sm text-destructive">{requestState.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={requestPending}>
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
      )}

      {step === "code" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ingresa el código</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={verifyAction} className="space-y-4">
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
                    defaultValue={code}
                    aria-invalid={!!verifyState.fieldErrors?.code}
                  />
                  <FieldDescription>
                    Enviado a {email}. El código expira en 15 minutos.
                  </FieldDescription>
                  <FieldError
                    errors={verifyState.fieldErrors?.code?.map((m) => ({ message: m }))}
                  />
                </Field>
              </FieldGroup>

              {verifyState.message && !verifyState.success && (
                <p className="text-sm text-destructive">{verifyState.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={verifyPending}>
                {verifyPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Verificando…
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("email")}
              >
                Usar otro correo
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === "password" && resetState.success && (
        <Card
          role="status"
          aria-live="polite"
          className="border-emerald-500/30 bg-emerald-50/40"
        >
          <CardContent className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-100/50">
              <CheckCircle2 className="size-7" aria-hidden />
            </span>
            <div className="space-y-1.5">
              <p className="font-heading text-lg font-medium text-emerald-900">
                Contraseña actualizada
              </p>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-emerald-900/70">
                Tu contraseña se cambió correctamente. Ya puedes iniciar sesión
                con la nueva.
              </p>
            </div>
            <Button
              render={<Link href="/cuenta/iniciar-sesion" />}
              nativeButton={false}
              className="w-full"
            >
              Ir a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "password" && !resetState.success && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Elige una nueva contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={resetAction} className="space-y-4">
              <input type="hidden" name="email" value={email} readOnly />
              <input type="hidden" name="code" value={code} readOnly />
              <FieldGroup>
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
                <p className="text-sm text-destructive">{resetState.message}</p>
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
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
