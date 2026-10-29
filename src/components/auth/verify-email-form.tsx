"use client";

import { useActionState, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { AuthActionState } from "@/app/cuenta/actions";
import {
  cancelVerification,
  resendVerificationCode,
  verifyEmailCode,
} from "@/app/cuenta/verification-actions";
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

const initialState: AuthActionState = { success: false };

type VerifyEmailFormProps = {
  /** Correo ya enmascarado para mostrarlo. */
  maskedEmail: string;
};

export function VerifyEmailForm({ maskedEmail }: VerifyEmailFormProps) {
  const [state, action, pending] = useActionState(verifyEmailCode, initialState);
  const [resendMessage, setResendMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [resending, startResend] = useTransition();

  const resend = () =>
    startResend(async () => {
      const result = await resendVerificationCode();
      setResendMessage({ ok: result.success, text: result.message ?? "" });
    });

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Confirma tu correo</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="verify-code">Código de verificación</FieldLabel>
              <Input
                id="verify-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                required
                autoFocus
                aria-invalid={!!state.fieldErrors?.code}
              />
              <FieldDescription>
                Enviamos un código de 6 dígitos a {maskedEmail}. Expira en 15
                minutos.
              </FieldDescription>
              <FieldError
                errors={state.fieldErrors?.code?.map((m) => ({ message: m }))}
              />
            </Field>
          </FieldGroup>

          {state.message && !state.success && (
            <p className="text-sm text-destructive" role="alert">
              {state.message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Verificando…
              </>
            ) : (
              "Confirmar y continuar"
            )}
          </Button>
        </form>

        <div className="mt-4 space-y-2 text-center text-sm">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={resend}
            disabled={resending}
          >
            {resending ? "Enviando…" : "Reenviar código"}
          </Button>
          {resendMessage && (
            <p
              role="status"
              className={resendMessage.ok ? "text-[#6baed6]" : "text-destructive"}
            >
              {resendMessage.text}
            </p>
          )}
          <form action={cancelVerification}>
            <Button type="submit" variant="link" className="h-auto p-0 text-muted-foreground">
              Usar otro correo
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
