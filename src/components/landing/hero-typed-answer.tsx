"use client";

import { useEffect, useRef, useState } from "react";

const ANSWERS = [
  "Con 10 horas a la semana y un presupuesto corto, conviene validar antes de invertir.",
  "Tu mercado cercano es claro, pero tu nivel de riesgo pide ajustar el primer paso.",
  "Hoy la idea no cabe en tu tiempo ni en tu dinero: lo más sano es pausar y replantear.",
];

/** Color de acento (cursor) de cada respuesta: se alterna entre el verde y el azul de la marca. */
const ACCENTS = ["#05422c", "#2b6f9e", "#0d5a40"];

const TYPE_MS = 36;
const HOLD_MS = 2800;
const FADE_MS = 500;

/** Una respuesta de IA que se escribe letra por letra, se sostiene, se desvanece y da paso a la siguiente. */
export function HeroTypedAnswer({ paused }: { paused: boolean }) {
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(true);
  const [accent, setAccent] = useState(0);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    /** Mientras el hero esté en pausa, el tipeo espera. */
    const gate = async () => {
      while (pausedRef.current && !cancelled) await wait(200);
    };

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
          await gate();
          setText(answer.slice(0, i));
          await wait(TYPE_MS);
        }
        await wait(HOLD_MS);
        await gate();
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
      data-keepout
      className="absolute left-[34%] top-[43%] hidden w-[38cqw] rounded-2xl sm:block bg-white p-[clamp(0.75rem,2.4cqw,1.25rem)] text-primary shadow-[0_4px_24px_rgba(5,66,44,0.08)] transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <p className="min-h-[4.5em] text-[clamp(0.875rem,2.7cqw,1.15rem)] font-medium leading-snug">
        {text}
        <span className="hero-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em]" style={{ backgroundColor: ACCENTS[accent] }} />
      </p>
    </div>
  );
}
