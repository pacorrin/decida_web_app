"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import { Lightbulb, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import {
  confirmIdea,
  editIdeaRedirect,
  refineIdea,
} from "@/app/analizar/actions";
import { unpackIdeaAiPayload } from "@/lib/ai/schemas/idea-assumptions";
import type { AssumptionItem } from "@/lib/ai/schemas/idea-assumptions";
import {
  getStructuredEntries,
  type StructuredUnderstanding,
} from "@/lib/ai/schemas/structured-understanding";
import type { RefineIdeaState } from "@/lib/onboarding/schemas";
import type { AssessmentWithRelations } from "@/lib/onboarding/assessment-utils";

const CATEGORY_LABELS: Record<string, string> = {
  cliente: "Cliente",
  operacion: "Operación",
  precio: "Precio",
  mercado: "Mercado",
  tiempo: "Tiempo",
  otro: "General",
};

type IdeaConfirmationProps = {
  assessment: AssessmentWithRelations;
};

const initialRefineState: RefineIdeaState = { success: false };

function UnderstandingSections({
  summary,
  structured,
  refining,
}: {
  summary: string;
  structured?: StructuredUnderstanding | null;
  refining?: boolean;
}) {
  const entries = getStructuredEntries(structured);

  if (refining) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border/40 p-3">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted/70" />
            </div>
          ))}
        </div>
        <p className="flex items-center gap-2 text-sm text-[#6baed6]">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Reestructurando tu idea...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-base font-medium leading-relaxed text-primary">
        {summary}
      </p>

      {entries.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map(({ key, label, value }) => (
            <div
              key={key}
              className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[#6baed6]">
                {label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>
      )}
    </div>
  );
}

export function IdeaConfirmation({ assessment }: IdeaConfirmationProps) {
  const idea = assessment.business_idea;
  const initialPayload = unpackIdeaAiPayload(idea?.bide_ai_detected_assumptions);

  const [summary, setSummary] = useState(idea?.bide_ai_summary ?? "");
  const [structured, setStructured] = useState<StructuredUnderstanding | undefined>(
    initialPayload.structured
  );
  const [assumptions, setAssumptions] =
    useState<AssumptionItem[]>(initialPayload.assumptions);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [clarifications, setClarifications] = useState<Record<string, string>>(
    {}
  );
  const [improvements, setImprovements] = useState<string[]>([]);
  const [wasRefined, setWasRefined] = useState(false);

  const [refineState, refineAction, refining] = useActionState(
    refineIdea,
    initialRefineState
  );

  useEffect(() => {
    if (refineState.refined && refineState.summary) {
      setSummary(refineState.summary);
      if (refineState.structuredUnderstanding) {
        setStructured(refineState.structuredUnderstanding);
      }
      if (refineState.assumptions) {
        setAssumptions(refineState.assumptions as AssumptionItem[]);
      }
      setImprovements(refineState.improvements ?? []);
      setWasRefined(true);
      setSelectedIds(new Set());
      setClarifications({});
    }
  }, [refineState]);

  function toggleAssumption(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setClarification(id: string, value: string) {
    setClarifications((prev) => ({ ...prev, [id]: value }));
  }

  const hasAssumptions = assumptions.length > 0;

  return (
    <div className="space-y-6">
      <Card
        className={`border-primary/20 shadow-md transition-all duration-500 ${
          wasRefined ? "ring-2 ring-[#6baed6]/40" : ""
        } ${refining ? "opacity-90" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="size-5" aria-hidden />
              <CardTitle className="text-lg">Nuestro entendimiento</CardTitle>
            </div>
            {wasRefined && !refining && (
              <Badge className="bg-[#6baed6]/15 text-primary">
                <Sparkles className="mr-1 size-3" aria-hidden />
                Idea pulida
              </Badge>
            )}
            {refining && (
              <Badge variant="outline" className="text-[#6baed6]">
                Actualizando...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <UnderstandingSections
            summary={summary}
            structured={structured}
            refining={refining}
          />
        </CardContent>
      </Card>

      {improvements.length > 0 && !refining && (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-emerald-900">
              <CheckCircle2 className="size-4" aria-hidden />
              Lo que pulimos juntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {improvements.map((item, i) => (
                <li key={i} className="text-sm text-emerald-900">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {hasAssumptions && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-primary">
              Supuestos detectados
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona los puntos que quieras aclarar. Al pulir, reestructuramos
              tu idea arriba con lo que nos compartas.
            </p>
          </div>

          <form action={refineAction} className="space-y-4">
            <ul className="space-y-3">
              {assumptions.map((assumption) => {
                const isSelected = selectedIds.has(assumption.id);
                return (
                  <li key={assumption.id}>
                    <label
                      className={`block cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 bg-muted/20 hover:border-primary/30"
                      } ${refining ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          name="selectedIds"
                          value={assumption.id}
                          checked={isSelected}
                          onChange={() => toggleAssumption(assumption.id)}
                          disabled={refining}
                          className="mt-1 size-4 rounded border-input accent-primary"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {assumption.category && (
                              <Badge variant="outline" className="text-xs">
                                {CATEGORY_LABELS[assumption.category] ??
                                  assumption.category}
                              </Badge>
                            )}
                            <span className="text-xs text-[#6baed6]">
                              Recomendado pulir
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {assumption.text}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assumption.refinementHint}
                          </p>
                          {isSelected && (
                            <Input
                              placeholder="Tu aclaración (opcional)"
                              value={clarifications[assumption.id] ?? ""}
                              onChange={(e) =>
                                setClarification(assumption.id, e.target.value)
                              }
                              disabled={refining}
                              className="mt-2 bg-background"
                            />
                          )}
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>

            <input
              type="hidden"
              name="clarifications"
              value={JSON.stringify(clarifications)}
              readOnly
            />

            {refineState.message && !refineState.success && (
              <p className="text-sm text-destructive">{refineState.message}</p>
            )}
            <FieldError
              errors={refineState.fieldErrors?.selectedIds?.map((m) => ({
                message: m,
              }))}
            />

            <Button
              type="submit"
              variant="secondary"
              disabled={refining || selectedIds.size === 0}
              className="w-full sm:w-auto"
            >
              {refining ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-4" aria-hidden />
              )}
              {refining ? "Puliendo tu idea..." : "Pulir mi idea con IA"}
            </Button>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row">
        <form action={confirmIdea} className="flex-1">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={refining}
          >
            {wasRefined || !hasAssumptions
              ? "Confirmar y continuar"
              : "Confirmar — es correcto"}
          </Button>
        </form>
        <form action={editIdeaRedirect} className="flex-1">
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            size="lg"
            disabled={refining}
          >
            Editar mi idea
          </Button>
        </form>
      </div>
    </div>
  );
}
