"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUp, verifySignup, type AuthActionState } from "@/app/cuenta/actions";
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
import { fieldValue } from "@/lib/onboarding/schemas";

const initialState: AuthActionState = { success: false, step: "form" };

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [codeStep, setCodeStep] = useState(false);

  const [signUpState, signUpAction, signUpPending] = useActionState(
    async (prev: AuthActionState, formData: FormData) => {
      const result = await signUp(prev, formData);
      if (result.success && result.step === "verify") {
        setCodeStep(true);
        const submittedEmail = formData.get("email");
        if (typeof submittedEmail === "string") setEmail(submittedEmail);
      }
      return result;
    },
    initialState
  );

  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifySignup,
    initialState
  );

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
                  disabled={codeStep}
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
                  disabled={codeStep}
                  aria-invalid={!!signUpState.fieldErrors?.email}
                />
                <FieldError
                  errors={signUpState.fieldErrors?.email?.map((m) => ({ message: m }))}
                />
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
                  disabled={codeStep}
                  aria-invalid={!!signUpState.fieldErrors?.password}
                />
                <FieldError
                  errors={signUpState.fieldErrors?.password?.map((m) => ({ message: m }))}
                />
              </Field>
            </FieldGroup>

            {signUpState.message && (
              <p
                className={`text-sm ${signUpState.success ? "text-[#6baed6]" : "text-destructive"}`}
              >
                {signUpState.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={signUpPending || codeStep}>
              {signUpPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Creando cuenta…
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {codeStep && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confirma tu correo</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={verifyAction} className="space-y-4">
              <input type="hidden" name="email" value={email} readOnly />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="signup-code">Código de verificación</FieldLabel>
                  <Input
                    id="signup-code"
                    name="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    required
                    aria-invalid={!!verifyState.fieldErrors?.code}
                  />
                  <FieldDescription>Revisa tu correo. El código expira en 15 minutos.</FieldDescription>
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
                  "Confirmar y entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/cuenta/iniciar-sesion" className="text-primary underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
