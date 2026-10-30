"use client";

import { useState } from "react";
import { PrimaryCtaButton } from "@/components/landing/cta-link";
import { cn } from "@/lib/utils";
import { CIFRA_SIGNUP } from "./content";

type Row = { id: string; name: string; priceMxn: number; credits: number; captures: number; highlighted: boolean };

/** Los planes son una lista de nombres; el precio que se ve es el del nombre elegido. */
export function PricingSelector({ rows, captureCost }: { rows: Row[]; captureCost: number }) {
  const [selected, setSelected] = useState(rows.find((r) => r.highlighted)?.id ?? rows[0].id);
  const plan = rows.find((r) => r.id === selected) ?? rows[0];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div role="group" aria-label="Plan" className="lg:col-span-6 lg:row-start-1">
        {rows.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={selected === r.id}
            onClick={() => setSelected(r.id)}
            className={cn(
              "flex w-full items-center gap-4 py-1 text-left text-5xl font-semibold leading-[1.1] tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-6xl lg:text-7xl",
              selected === r.id ? "text-primary" : "text-primary/35 hover:text-primary/60",
            )}
          >
            <span className={cn("size-3 shrink-0 rounded-full bg-secondary transition-opacity", selected === r.id ? "opacity-100" : "opacity-0")} aria-hidden />
            {r.name}
          </button>
        ))}
      </div>
      <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
        <Stage plan={plan} captureCost={captureCost} />
      </div>
    </div>
  );
}

function Stage({ plan, captureCost }: { plan: Row; captureCost: number }) {
  return (
    <div key={plan.id} className="decida-reveal space-y-5">
      <p className="text-6xl font-semibold tracking-tight text-primary sm:text-7xl">
        ${plan.priceMxn}
        <span className="ml-2 text-lg font-medium text-muted-foreground">MXN al mes</span>
      </p>
      <p className="max-w-md text-lg leading-relaxed text-foreground">
        {plan.credits.toLocaleString("es-MX")} créditos cada mes: unas {plan.captures} capturas inteligentes de {captureCost} créditos si no los usas en otros
        análisis. Registrar a mano es ilimitado y no gasta créditos.
      </p>
      <PrimaryCtaButton href={CIFRA_SIGNUP.href} location={`cifra_pricing_${plan.id}`}>
        Empezar con {plan.name}
      </PrimaryCtaButton>
    </div>
  );
}
