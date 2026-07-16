"use client";

import { useActionState, useState } from "react";
import { requestHistoryCode, verifyHistoryCode } from "@/app/mis-evaluaciones/actions";
import type { HistoryActionState } from "@/app/mis-evaluaciones/actions";
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
import { Loader2 } from "lucide-react";

const initialState: HistoryActionState = { success: false, step: "email" };

type HistoryLoginFormProps = {
  defaultEmail?: string;
};

export function HistoryLoginForm({ defaultEmail = "" }: HistoryLoginFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [codeStep, setCodeStep] = useState(false);

  const [requestState, requestAction, requestPending] = useActionState(
    async (prev: HistoryActionState, formData: FormData) => {
      const result = await requestHistoryCode(prev, formData);
      if (result.success && result.step === "code") {
        setCodeStep(true);
        const submittedEmail = formData.get("email");
        if (typeof submittedEmail === "string") {
          setEmail(submittedEmail);
        }
      }
      return result;
    },
    initialState
  );

  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyHistoryCode,
    initialState
  );

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accede con tu correo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={requestAction} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="history-email">Correo electrónico</FieldLabel>
                <Input
                  id="history-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="history-email"
                  aria-invalid={!!requestState.fieldErrors?.email}
                />
                <FieldDescription>
                  Usa el mismo correo con el que completaste tu diagnóstico.
                </FieldDescription>
                <FieldError
                  errors={requestState.fieldErrors?.email?.map((m) => ({
                    message: m,
                  }))}
                />
              </Field>
            </FieldGroup>
            {requestState.message && (
              <p
                className={`text-sm ${
                  requestState.success ? "text-[#6baed6]" : "text-destructive"
                }`}
                data-testid="history-request-message"
              >
                {requestState.message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={requestPending}
              data-testid="history-request-code"
            >
              {requestPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Generando código…
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
            <CardTitle className="text-lg">Ingresa el código</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={verifyAction} className="space-y-4">
              <input type="hidden" name="email" value={email} readOnly />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="history-code">Código de verificación</FieldLabel>
                  <Input
                    id="history-code"
                    name="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    required
                    data-testid="history-code"
                    aria-invalid={!!verifyState.fieldErrors?.code}
                  />
                  <FieldDescription>
                    El código expira en 15 minutos. Consúltalo en la base de datos.
                  </FieldDescription>
                  <FieldError
                    errors={verifyState.fieldErrors?.code?.map((m) => ({
                      message: m,
                    }))}
                  />
                </Field>
              </FieldGroup>
              {verifyState.message && !verifyState.success && (
                <p className="text-sm text-destructive" data-testid="history-verify-error">
                  {verifyState.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={verifyPending}
                data-testid="history-verify-code"
              >
                {verifyPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Verificando…
                  </>
                ) : (
                  "Ver mis evaluaciones"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
