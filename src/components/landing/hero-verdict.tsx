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
    <div role="group" aria-label={label} className="space-y-1.5">
      <p className="text-sm font-medium text-primary">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((o, i) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={cn(
              "min-h-11 rounded-lg px-2 py-1.5 text-sm font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === i ? "bg-primary text-white" : "bg-muted text-primary hover:bg-[#e3ece8]",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Qué tanto pesa cada límite en la decisión: se mueve con lo que elige la persona. */
function Weight({ label, level }: { label: string; level: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm text-white">
        <span>{label}</span>
        <span className="text-white/80">{["Holgado", "Justo", "Al límite"][level]}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("h-2 rounded-full transition-colors duration-300", i <= level ? "bg-[#6baed6]" : "bg-white/15")}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * El mismo negocio, con distintos límites: la recomendación cambia. Tres piezas de la propia
 * herramienta (tus límites, lo que pesan, el veredicto) puestas en perspectiva. Ejemplo ilustrativo.
 */
export function HeroVerdict() {
  const [time, setTime] = useState(1);
  const [money, setMoney] = useState(1);
  const [risk, setRisk] = useState(0);
  const verdict = verdictFor(time + money + risk);

  return (
    <div
      data-ui
      role="group"
      aria-label="Ejemplo de diagnóstico con distintos límites"
      className="hero-deck relative mx-auto w-full max-w-[34rem] lg:max-w-none"
    >
      <div className="hero-deck-card hero-deck-weights hero-deck-in hidden w-[15rem] space-y-4 rounded-2xl bg-[#0d5a3e] py-5 pl-7 pr-5 xl:block">
        <p className="text-base font-semibold text-white">Lo que más pesa</p>
        <Weight label="Tu tiempo" level={2 - time} />
        <Weight label="Tu dinero" level={2 - money} />
        <Weight label="El riesgo que aguantas" level={risk} />
      </div>

      <div className="hero-deck-card hero-deck-limits hero-deck-in space-y-4 rounded-2xl bg-white p-5">
        <div>
          <p className="text-sm text-muted-foreground">Ejemplo ilustrativo</p>
          <p className="text-lg font-semibold text-primary">Servicio de detailing móvil</p>
        </div>
        <Group label="Tu tiempo" options={TIME} value={time} onChange={setTime} />
        <Group label="Tu dinero para empezar" options={MONEY} value={money} onChange={setMoney} />
        <Group label="El riesgo que aguantas" options={RISK} value={risk} onChange={setRisk} />
      </div>

      <div
        key={verdict.title}
        aria-live="polite"
        className="hero-deck-card hero-deck-verdict hero-deck-in rounded-2xl bg-[#e8f4fa] p-5"
      >
        <p className="text-sm text-muted-foreground">Decida recomienda</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-primary">{verdict.title}</p>
        <p className="mt-2 text-base leading-relaxed text-foreground">{verdict.next}</p>
      </div>
    </div>
  );
}
