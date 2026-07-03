"use client";

import { useActionState, useState } from "react";
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
import { saveEvaluation } from "@/app/analizar/actions";
import type { ActionState } from "@/lib/onboarding/schemas";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const initialState: ActionState = { success: false };

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const FIXED_COST_OPTIONS = [
  { value: "menos_5k", label: "Menos de $5,000 MXN" },
  { value: "5k_15k", label: "$5,000 – $15,000 MXN" },
  { value: "15k_30k", label: "$15,000 – $30,000 MXN" },
  { value: "30k_50k", label: "$30,000 – $50,000 MXN" },
  { value: "mas_50k", label: "Más de $50,000 MXN" },
];

const COMPETITION_OPTIONS = [
  { value: "baja", label: "Baja — pocos competidores" },
  { value: "media", label: "Media — algunos competidores" },
  { value: "alta", label: "Alta — mucha competencia" },
];

const CHANNEL_OPTIONS = [
  { value: "redes_sociales", label: "Redes sociales" },
  { value: "referidos", label: "Referidos / boca a boca" },
  { value: "publicidad", label: "Publicidad pagada" },
  { value: "presencial", label: "Venta presencial" },
  { value: "otro", label: "Otro" },
];

type EvaluationFormProps = {
  assessment: AssessmentWithRelations;
};

export function EvaluationForm({ assessment }: EvaluationFormProps) {
  const [state, action, pending] = useActionState(saveEvaluation, initialState);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const fin = assessment.financial_inputs;
  const mkt = assessment.market_risk_inputs;

  const handleTimeout = () => {
    setShowTimeoutWarning(true);
  };

  return (
    <>
      <LoadingOverlay
        isLoading={pending}
        onTimeout={handleTimeout}
        timeoutMs={45000}
      />
      <form action={action}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Finanzas básicas</FieldLegend>
          <FieldDescription>
            Estimaciones aproximadas — no tienen que ser perfectas.
          </FieldDescription>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="initialInvestment">Inversión inicial (MXN)</FieldLabel>
              <Input
                id="initialInvestment"
                name="initialInvestment"
                type="number"
                min={0}
                step="100"
                defaultValue={fin?.finp_initial_investment?.toString() ?? ""}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="pricePerSale">Precio por venta (MXN)</FieldLabel>
              <Input
                id="pricePerSale"
                name="pricePerSale"
                type="number"
                min={0}
                step="10"
                defaultValue={fin?.finp_price_per_sale?.toString() ?? ""}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="variableCostPerSale">
                Costo variable por venta (MXN)
              </FieldLabel>
              <Input
                id="variableCostPerSale"
                name="variableCostPerSale"
                type="number"
                min={0}
                step="10"
                defaultValue={fin?.finp_variable_cost_per_sale?.toString() ?? ""}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="estimatedMonthlySales">
                Ventas estimadas al mes
              </FieldLabel>
              <Input
                id="estimatedMonthlySales"
                name="estimatedMonthlySales"
                type="number"
                min={0}
                step="1"
                defaultValue={fin?.finp_estimated_monthly_sales?.toString() ?? ""}
                required
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="fixedMonthlyCostsRange">
              Costos fijos mensuales estimados
            </FieldLabel>
            <select
              id="fixedMonthlyCostsRange"
              name="fixedMonthlyCostsRange"
              defaultValue={fin?.finp_fixed_monthly_costs_range ?? ""}
              required
              className={selectClass}
            >
              <option value="" disabled>
                Selecciona un rango
              </option>
              {FIXED_COST_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          <input type="hidden" name="currency" value="MXN" />
        </FieldSet>

        <FieldSet>
          <FieldLegend>Mercado y riesgos</FieldLegend>

          <Field>
            <FieldLabel htmlFor="hasTalkedToCustomers">
              ¿Has hablado con clientes potenciales?
            </FieldLabel>
            <select
              id="hasTalkedToCustomers"
              name="hasTalkedToCustomers"
              defaultValue={
                mkt?.mrsk_has_talked_to_customers === true
                  ? "true"
                  : mkt?.mrsk_has_talked_to_customers === false
                    ? "false"
                    : ""
              }
              required
              className={selectClass}
            >
              <option value="" disabled>
                Selecciona
              </option>
              <option value="true">Sí</option>
              <option value="false">No, aún no</option>
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="competitionLevel">Nivel de competencia</FieldLabel>
            <select
              id="competitionLevel"
              name="competitionLevel"
              defaultValue={mkt?.mrsk_competition_level ?? ""}
              required
              className={selectClass}
            >
              <option value="" disabled>
                Selecciona
              </option>
              {COMPETITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="acquisitionChannel">
              ¿Cómo conseguirías tus primeros clientes?
            </FieldLabel>
            <select
              id="acquisitionChannel"
              name="acquisitionChannel"
              defaultValue={mkt?.mrsk_acquisition_channel ?? ""}
              required
              className={selectClass}
            >
              <option value="" disabled>
                Selecciona
              </option>
              {CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="mainConcern">¿Cuál es tu mayor preocupación?</FieldLabel>
            <Textarea
              id="mainConcern"
              name="mainConcern"
              rows={3}
              defaultValue={mkt?.mrsk_main_concern ?? ""}
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
              defaultValue={mkt?.mrsk_success_condition ?? ""}
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
