"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Choice = { label: string };

const TIME: Choice[] = [{ label: "Pocas horas" }, { label: "Medio tiempo" }, { label: "Tiempo completo" }];
const MONEY: Choice[] = [{ label: "Menos de $10,000" }, { label: "$10,000 a $50,000" }, { label: "Más de $50,000" }];
const RISK: Choice[] = [{ label: "Bajo" }, { label: "Medio" }, { label: "Alto" }];

const VERDICTS = [
  {
    title: "Pausar por ahora",
    next: "Con estos límites, la idea pide más de lo que puedes poner hoy. Junta presupuesto o tiempo antes de gastar.",
  },
  {
    title: "Ajustar la idea",
    next: "Empieza con un solo servicio y sin comprar equipo: cotiza lo mínimo y mide cuánto cuesta cada trabajo.",
  },
  {
    title: "Validar primero",
    next: "Habla con 10 clientes potenciales y cotiza costos reales antes de gastar más de $10,000.",
  },
  {
    title: "Probar a pequeña escala",
    next: "Haz 3 servicios piloto con lo que ya tienes y decide con números reales si crece.",
  },
] as const;

function verdictFor(score: number) {
  if (score <= 1) return VERDICTS[0];
  if (score === 2) return VERDICTS[1];
  if (score <= 4) return VERDICTS[2];
  return VERDICTS[3];
}

function Group({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Choice[];
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <div role="group" aria-label={label} className="space-y-2">
      <p className="text-base font-medium text-primary">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((o, i) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={cn(
              "min-h-11 rounded-lg px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === i ? "bg-primary text-white" : "bg-white text-primary hover:bg-white/60",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** El mismo negocio, con distintos límites: la recomendación cambia. Ejemplo ilustrativo. */
export function HeroVerdict() {
  const [time, setTime] = useState(1);
  const [money, setMoney] = useState(1);
  const [risk, setRisk] = useState(0);
  const verdict = verdictFor(time + money + risk);

  return (
    <aside
      data-ui
      aria-label="Ejemplo de diagnóstico con distintos límites"
      className="space-y-6 rounded-2xl bg-[#e8f4fa] p-5 sm:p-8"
    >
      <p className="text-lg font-semibold text-primary">Servicio de detailing móvil</p>
      <Group label="Tu tiempo" options={TIME} value={time} onChange={setTime} />
      <Group label="Tu dinero para empezar" options={MONEY} value={money} onChange={setMoney} />
      <Group label="El riesgo que aguantas" options={RISK} value={risk} onChange={setRisk} />
      <div key={verdict.title} className="decida-reveal rounded-xl bg-white p-5" aria-live="polite">
        <p className="text-sm text-muted-foreground">Decida recomienda</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-primary">{verdict.title}</p>
        <p className="mt-2 text-base leading-relaxed text-foreground">{verdict.next}</p>
      </div>
      <p className="text-sm text-muted-foreground">Ejemplo ilustrativo. Tu diagnóstico usa tus respuestas.</p>
    </aside>
  );
}
