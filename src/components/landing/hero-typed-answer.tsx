"use client";

import { useEffect, useState } from "react";

const ANSWERS = [
  "Con 10 horas a la semana y un presupuesto corto, conviene validar antes de invertir.",
  "Tu mercado cercano es claro, pero tu nivel de riesgo pide ajustar el primer paso.",
  "Hoy la idea no cabe en tu tiempo ni en tu dinero: lo más sano es pausar y replantear.",
];

/** Color de acento (rótulo y cursor) de cada respuesta: se alterna entre el verde y el azul de la marca. */
const ACCENTS = ["#05422c", "#3a86b8", "#0d5a40"];

const TYPE_MS = 36;
const HOLD_MS = 2800;
const FADE_MS = 500;

/** Una respuesta de IA que se escribe letra por letra, se sostiene, se desvanece y da paso a la siguiente. */
export function HeroTypedAnswer() {
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(true);
  const [accent, setAccent] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      if (reduced) {
        await wait(0);
        if (!cancelled) setText(ANSWERS[0]);
        return;
      }
      await wait(900);
      for (let n = 0; !cancelled; n = (n + 1) % ANSWERS.length) {
        const answer = ANSWERS[n];
        setVisible(true);
        setAccent(n % ACCENTS.length);
        for (let i = 1; i <= answer.length && !cancelled; i++) {
          setText(answer.slice(0, i));
          await wait(TYPE_MS);
        }
        await wait(HOLD_MS);
        setVisible(false);
        await wait(FADE_MS);
        setText("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="absolute left-[34%] top-[43%] w-[38cqw] rounded-2xl bg-white p-[clamp(0.75rem,2.4cqw,1.25rem)] text-primary shadow-[0_4px_24px_rgba(5,66,44,0.08)] transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <p className="mb-1 text-[clamp(0.65rem,1.9cqw,0.8rem)] font-semibold uppercase tracking-[0.14em]" style={{ color: ACCENTS[accent] }}>Decida responde</p>
      <p className="min-h-[4.5em] text-[clamp(0.8rem,2.7cqw,1.15rem)] font-medium leading-snug">
        {text}
        <span className="hero-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em]" style={{ backgroundColor: ACCENTS[accent] }} />
      </p>
    </div>
  );
}
