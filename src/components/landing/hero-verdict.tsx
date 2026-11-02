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
    short: "Pausar",
    next: "Con estos límites, la idea pide más de lo que puedes poner hoy. Junta presupuesto o tiempo antes de gastar.",
  },
  {
    title: "Ajustar la idea",
    short: "Ajustar",
    next: "Empieza con un solo servicio y sin comprar equipo: cotiza lo mínimo y mide cuánto cuesta cada trabajo.",
  },
  {
    title: "Validar primero",
    short: "Validar",
    next: "Habla con 10 clientes potenciales y cotiza costos reales antes de gastar más de $10,000.",
  },
  {
    title: "Probar a pequeña escala",
    short: "Probar",
    next: "Haz 3 servicios piloto con lo que ya tienes y decide con números reales si crece.",
  },
] as const;

function verdictIndex(score: number) {
  if (score <= 1) return 0;
  if (score === 2) return 1;
  if (score <= 4) return 2;
  return 3;
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
      <p className="text-base font-medium text-white">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((o, i) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={cn(
              "min-h-11 rounded-lg px-2 py-2 text-sm font-medium leading-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              value === i ? "bg-[#6baed6] text-primary" : "bg-white/10 text-white hover:bg-white/20",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * El mismo negocio, con distintos límites: la recomendación cambia. Tres límites que la persona
 * mueve y una gráfica de cuatro escalones que sube o baja con ellos. Ejemplo ilustrativo.
 */
export function HeroVerdict() {
  const [time, setTime] = useState(1);
  const [money, setMoney] = useState(1);
  const [risk, setRisk] = useState(0);
  const active = verdictIndex(time + money + risk);
  const verdict = VERDICTS[active];

  return (
    <div data-ui role="group" aria-label="Ejemplo de diagnóstico con distintos límites" className="space-y-8">
      <p className="text-base text-white/80">Ejemplo ilustrativo: servicio de detailing móvil</p>

      <div className="space-y-5">
        <Group label="Tu tiempo" options={TIME} value={time} onChange={setTime} />
        <Group label="Tu dinero para empezar" options={MONEY} value={money} onChange={setMoney} />
        <Group label="El riesgo que aguantas" options={RISK} value={risk} onChange={setRisk} />
      </div>

      <div className="grid items-end gap-6 sm:grid-cols-[auto_1fr]" aria-live="polite">
        <div className="flex h-44 items-end gap-2.5" aria-hidden>
          {VERDICTS.map((v, i) => (
            <div key={v.short} className="flex w-[calc((100%-1.875rem)/4)] max-w-16 flex-col items-center gap-2 sm:w-16">
              <div
                className={cn(
                  "w-full rounded-md transition-colors duration-300",
                  i === active ? "bg-[#6baed6]" : "bg-white/15",
                )}
                style={{ height: `${(i + 1) * 30}px` }}
              />
              <span className={cn("text-sm", i === active ? "font-semibold text-white" : "text-white/70")}>{v.short}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm text-white/80">Decida recomienda</p>
          <p className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-white">{verdict.title}</p>
          <p className="mt-2 text-base leading-relaxed text-white/85">{verdict.next}</p>
        </div>
      </div>
    </div>
  );
}
