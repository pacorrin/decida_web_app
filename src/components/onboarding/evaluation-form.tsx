"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { StepNavigation } from "@/components/onboarding/step-navigation";
import { LoadingOverlay } from "@/components/onboarding/loading-overlay";
import { OptionCardGroup } from "@/components/onboarding/option-card-group";
import { saveEvaluation } from "@/app/analizar/actions";
import {
  fieldValue,
  fieldValues,
  type ActionState,
} from "@/lib/onboarding/schemas";
import {
  FIXED_COST_OPTIONS,
  COMPETITION_OPTIONS,
  CHANNEL_OPTIONS,
  CUSTOMER_EVIDENCE_LEVEL_OPTIONS,
  BUSINESS_DEPENDENCY_OPTIONS,
} from "@/lib/onboarding/options";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

type EvaluationFormProps = {
  assessment: AssessmentWithRelations;
};

export function EvaluationForm({ assessment }: EvaluationFormProps) {
  const [state, action, pending] = useActionState(saveEvaluation, initialState);
  const fin = assessment.financial_inputs;
  const mkt = assessment.market_risk_inputs;
  const v = state.values;

  const customerEvidenceFallback =
    mkt?.mrsk_customer_evidence_level ??
    (mkt?.mrsk_has_talked_to_customers === true
      ? "4_10"
      : mkt?.mrsk_has_talked_to_customers === false
        ? "ninguno"
        : "");

  const dependencyValues = fieldValues(
    v,
    "businessDependencies",
    (mkt?.mrsk_business_dependencies as string[] | undefined) ?? []
  );

  return (
    <>
      <LoadingOverlay
        isLoading={pending}
        timeoutMs={45000}
      />
      <form key={v ? "error" : "initial"} action={action}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Finanzas básicas</FieldLegend>
          <FieldDescription>
            El precio y las ventas de cada producto ya los capturamos en el paso
            anterior. Estimaciones aproximadas — no tienen que ser perfectas.
          </FieldDescription>

          <Field>
            <FieldLabel htmlFor="initialInvestment">
              Inversión inicial (MXN)
            </FieldLabel>
            <Input
              id="initialInvestment"
              name="initialInvestment"
              type="number"
              min={0}
              step="100"
              defaultValue={fieldValue(
                v,
                "initialInvestment",
                fin?.finp_initial_investment?.toString() ?? ""
              )}
              required
            />
            <FieldDescription>
              Lo que necesitas gastar una vez para arrancar (equipo, permisos,
              inventario inicial).
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Costos fijos mensuales estimados</FieldLabel>
            <OptionCardGroup
              name="fixedMonthlyCostsRange"
              options={FIXED_COST_OPTIONS}
              defaultValue={fieldValue(
                v,
                "fixedMonthlyCostsRange",
                fin?.finp_fixed_monthly_costs_range ?? ""
              )}
              layout="stack"
              columns={1}
              required
              ariaLabel="Costos fijos mensuales"
            />
          </Field>
          <input type="hidden" name="currency" value="MXN" />
        </FieldSet>

        <FieldSet>
          <FieldLegend>Mercado y riesgos</FieldLegend>

          <Field>
            <FieldLabel>¿Has hablado con clientes potenciales?</FieldLabel>
            <OptionCardGroup
              name="customerEvidenceLevel"
              options={CUSTOMER_EVIDENCE_LEVEL_OPTIONS}
              defaultValue={fieldValue(
                v,
                "customerEvidenceLevel",
                customerEvidenceFallback
              )}
              layout="stack"
              columns={1}
              required
              ariaLabel="Evidencia de clientes"
            />
          </Field>

          <Field>
            <FieldLabel>Nivel de competencia</FieldLabel>
            <OptionCardGroup
              name="competitionLevel"
              options={COMPETITION_OPTIONS}
              defaultValue={fieldValue(
                v,
                "competitionLevel",
                mkt?.mrsk_competition_level ?? ""
              )}
              layout="stack"
              columns={1}
              required
              ariaLabel="Nivel de competencia"
            />
          </Field>

          <Field>
            <FieldLabel>¿Cómo conseguirías tus primeros clientes?</FieldLabel>
            <OptionCardGroup
              name="acquisitionChannel"
              options={CHANNEL_OPTIONS}
              defaultValue={fieldValue(
                v,
                "acquisitionChannel",
                mkt?.mrsk_acquisition_channel ?? ""
              )}
              layout="stack"
              columns={1}
              required
              ariaLabel="Canal de adquisición"
            />
          </Field>

          <Field>
            <FieldLabel>¿De qué depende tu negocio para funcionar?</FieldLabel>
            <FieldDescription>Selecciona todo lo que aplique.</FieldDescription>
            <div className="grid gap-2">
              {BUSINESS_DEPENDENCY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5"
                >
                  <input
                    type="checkbox"
                    name="businessDependencies"
                    value={opt.value}
                    defaultChecked={dependencyValues.includes(opt.value)}
                    className="mt-0.5 size-4 rounded border-input"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <FieldError
              errors={state.fieldErrors?.businessDependencies?.map((m) => ({
                message: m,
              }))}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="mainConcern">¿Cuál es tu mayor preocupación?</FieldLabel>
            <Textarea
              id="mainConcern"
              name="mainConcern"
              rows={3}
              defaultValue={fieldValue(v, "mainConcern", mkt?.mrsk_main_concern ?? "")}
              placeholder="Ej: No sé si la gente pagaría lo suficiente..."
              required
            />
            <FieldError
              errors={state.fieldErrors?.mainConcern?.map((m) => ({ message: m }))}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="successCondition">
              ¿Qué tendría que pasar para que consideres esto un éxito?
            </FieldLabel>
            <Textarea
              id="successCondition"
              name="successCondition"
              rows={3}
              defaultValue={fieldValue(
                v,
                "successCondition",
                mkt?.mrsk_success_condition ?? ""
              )}
              placeholder="Ej: Generar $15,000 MXN extra al mes en 6 meses..."
              required
            />
            <FieldError
              errors={state.fieldErrors?.successCondition?.map((m) => ({
                message: m,
              }))}
            />
          </Field>
        </FieldSet>
      </FieldGroup>

      <StepNavigation
        currentSlug="evaluacion"
        isPending={pending}
        submitLabel={pending ? "Generando tu diagnóstico..." : "Obtener mi diagnóstico"}
      />
    </form>
    </>
  );
}
