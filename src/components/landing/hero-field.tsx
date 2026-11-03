import type { CSSProperties, ReactNode } from "react";

/**
 * Panel del hero: fragmentos de un reporte (veredictos, cifras, cuadros y gráficas) dibujados a distintos
 * tamaños, opacidades y profundidades. Cada pieza se dibuja al entrar y luego flota despacio; las lejanas
 * son grandes y tenues, las cercanas nítidas y pequeñas. Solo transform y opacity.
 */
type Depth = "far" | "mid" | "near";

const DEPTH: Record<Depth, { opacity: number; drift: string; seconds: number }> = {
  far: { opacity: 0.1, drift: "0.9rem", seconds: 11 },
  mid: { opacity: 0.3, drift: "0.6rem", seconds: 8 },
  near: { opacity: 0.9, drift: "0.35rem", seconds: 6 },
};

type Piece = { x: number; y: number; depth: Depth; opacity?: number; node: ReactNode };

const BARS = [38, 62, 48, 80, 100];

const PIECES: Piece[] = [
  { x: -4, y: 2, depth: "far", node: <span className="text-[26cqw] font-semibold leading-none tracking-[-0.05em]">Validar</span> },
  { x: 24, y: 72, depth: "far", node: <span className="text-[22cqw] font-semibold leading-none tracking-[-0.05em]">Pausar</span> },
  { x: 8, y: 40, depth: "far", node: <span className="block size-[30cqw] bg-primary" /> },
  { x: 48, y: 13, depth: "mid", node: <span className="text-[14cqw] font-semibold leading-none tracking-[-0.04em]">Probar</span> },
  {
    x: 62,
    y: 50,
    depth: "mid",
    node: (
      <svg viewBox="0 0 100 100" className="size-[26cqw]" fill="none" strokeWidth="14" aria-hidden>
        <circle cx="50" cy="50" r="38" className="stroke-primary/25" />
        <circle cx="50" cy="50" r="38" className="stroke-primary" strokeDasharray="150 239" transform="rotate(-90 50 50)" />
      </svg>
    ),
  },
  { x: 54, y: 33, depth: "mid", opacity: 0.45, node: <span className="text-[8cqw] font-semibold leading-none tracking-[-0.04em]">Ajustar</span> },
  { x: 84, y: 6, depth: "mid", node: <span className="block size-[9cqw] border-2 border-primary" /> },
  {
    x: 9,
    y: 21,
    depth: "near",
    node: (
      <div>
        <p className="text-[15cqw] font-semibold leading-none tracking-[-0.05em]">72%</p>
        <p className="mt-1 text-[clamp(0.75rem,2.4cqw,1rem)] font-medium">Encaje con tu tiempo</p>
      </div>
    ),
  },
  {
    x: 52,
    y: 71,
    depth: "near",
    node: (
      <div className="flex h-[16cqw] items-end gap-[1.6cqw]">
        {BARS.map((h, i) => (
          <span
            key={h}
            className={`block w-[3.2cqw] ${i === BARS.length - 1 ? "bg-[#6baed6]" : "bg-primary"}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    x: 7,
    y: 62,
    depth: "near",
    opacity: 0.75,
    node: (
      <svg viewBox="0 0 120 50" className="w-[36cqw]" fill="none" strokeWidth="2" aria-hidden>
        <polyline points="0,42 20,34 40,38 62,20 84,24 120,4" className="stroke-primary" strokeLinejoin="round" />
        <circle cx="120" cy="4" r="3.5" className="fill-[#6baed6] stroke-none" />
      </svg>
    ),
  },
  { x: 42, y: 6, depth: "near", node: <span className="block size-[4.5cqw] bg-[#6baed6]" /> },
  { x: 78, y: 90, depth: "near", node: <span className="block size-[3cqw] bg-primary" /> },
];

export function HeroField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden text-primary [container-type:inline-size]">
      {PIECES.map((p, i) => {
        const d = DEPTH[p.depth];
        return (
          <div
            key={i}
            className="hero-draw absolute"
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                "--o": p.opacity ?? d.opacity,
                animationDelay: `${150 + i * 110}ms`,
              } as CSSProperties
            }
          >
            <div
              className="hero-drift"
              style={{ "--d": d.drift, animationDuration: `${d.seconds}s`, animationDelay: `-${i * 1.3}s` } as CSSProperties}
            >
              {p.node}
            </div>
          </div>
        );
      })}
    </div>
  );
}
