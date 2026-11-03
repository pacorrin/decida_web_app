"use client";

import { type CSSProperties, type ReactNode, useEffect, useState } from "react";

/**
 * Colores de texto que rotan sobre el verde-confianza de la columna izquierda: blanco, azul-guía y un verde
 * muy claro. Los tres superan 4,5:1 sobre #05422c. El coral queda reservado al botón principal.
 */
const TEXT_TONES = ["#ffffff", "#6baed6", "#bfe0cf"];
const ROTATE_MS = 7000;

/** La sección del hero: publica tres variables de color (--hero-c0..2) que giran una posición cada pocos segundos. */
export function HeroTheme({ children, className }: { children: ReactNode; className?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => s + 1), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const style = Object.fromEntries(
    TEXT_TONES.map((_, i) => [`--hero-c${i}`, TEXT_TONES[(i + step) % TEXT_TONES.length]]),
  ) as CSSProperties;

  return (
    <section aria-labelledby="hero-heading" className={className} style={style}>
      {children}
    </section>
  );
}
