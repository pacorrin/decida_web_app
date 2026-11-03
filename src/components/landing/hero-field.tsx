import type { CSSProperties, ReactNode } from "react";
import { HeroTypedAnswer } from "@/components/landing/hero-typed-answer";

/**
 * Panel del hero: fragmentos de un reporte (veredictos, cifras, cuadros y gráficas) dibujados a distintos
 * tamaños, opacidades y profundidades. Cada pieza aparece con un fundido, se desvanece y reaparece en otro
 * punto del panel (tres posiciones por ciclo), y entre tanto flota despacio; las lejanas son grandes y tenues,
 * las cercanas nítidas y pequeñas. Solo transform y opacity.
 */
type Depth = "far" | "mid" | "near";

const DEPTH: Record<Depth, { opacity: number; drift: string; seconds: number }> = {
  far: { opacity: 0.1, drift: "0.9rem", seconds: 11 },
  mid: { opacity: 0.3, drift: "0.6rem", seconds: 8 },
  near: { opacity: 0.9, drift: "0.35rem", seconds: 6 },
};

type Tone = "green" | "teal" | "blue";

/** Verde de la marca, su variante más clara y el azul-guía, que se alternan entre las piezas. */
const TONE: Record<Tone, string> = { green: "#05422c", teal: "#0d5a40", blue: "#6baed6" };

type Piece = { x: number; y: number; depth: Depth; tone: Tone; opacity?: number; node: ReactNode };

const BARS = [38, 62, 48, 80, 100];

/** Hexágono de seis ejes (uno por filtro) con la forma de un resultado de ejemplo. */
function radarPoints(values: number[]) {
  return values
    .map((v, k) => {
      const angle = ((-90 + 60 * k) * Math.PI) / 180;
      return `${(50 + 45 * v * Math.cos(angle)).toFixed(1)},${(50 + 45 * v * Math.sin(angle)).toFixed(1)}`;
    })
    .join(" ");
}

/** Desplazamientos (en cqw) a los que reaparece cada pieza, dos por pieza respecto a su posición base. */
const JUMPS: [number, number, number, number][] = [
  [22, 14, -18, 24],
  [-16, 20, 20, -12],
  [14, -20, -22, 16],
  [-24, 18, 12, 26],
  [18, 22, -14, -18],
  [-20, -14, 16, 20],
  [12, 26, -22, 10],
  [-14, 16, 24, -16],
  [20, -12, -18, 22],
  [-22, 24, 14, -20],
  [16, 12, -12, 28],
  [-18, -22, 22, 14],
];

const PIECES: Piece[] = [
  { x: -4, y: 2, depth: "far", tone: "green", node: <span className="text-[26cqw] font-semibold leading-none tracking-[-0.05em]">Validar</span> },
  { x: 24, y: 72, depth: "far", tone: "blue", node: <span className="text-[22cqw] font-semibold leading-none tracking-[-0.05em]">Pausar</span> },
  {
    x: 6,
    y: 38,
    depth: "far",
    tone: "teal",
    node: (
      <svg viewBox="0 0 100 100" className="size-[34cqw]" fill="none" strokeWidth="1.5" aria-hidden>
        <polygon points={radarPoints([1, 1, 1, 1, 1, 1])} stroke="currentColor" />
        <polygon points={radarPoints([0.66, 0.66, 0.66, 0.66, 0.66, 0.66])} stroke="currentColor" opacity="0.5" />
        <polygon points={radarPoints([0.9, 0.6, 0.8, 0.5, 0.7, 0.4])} fill="currentColor" fillOpacity="0.5" stroke="currentColor" />
      </svg>
    ),
  },
  { x: 48, y: 13, depth: "mid", tone: "green", node: <span className="text-[14cqw] font-semibold leading-none tracking-[-0.04em]">Probar</span> },
  {
    x: 62,
    y: 50,
    depth: "mid",
    tone: "blue",
    node: (
      <svg viewBox="0 0 100 100" className="size-[26cqw]" fill="none" strokeWidth="14" aria-hidden>
        <circle cx="50" cy="50" r="38" stroke="currentColor" opacity="0.25" />
        <circle cx="50" cy="50" r="38" stroke="currentColor" pathLength="100" strokeDasharray="63 100" transform="rotate(-90 50 50)" />
      </svg>
    ),
  },
  { x: 54, y: 33, depth: "mid", tone: "teal", opacity: 0.45, node: <span className="text-[8cqw] font-semibold leading-none tracking-[-0.04em]">Ajustar</span> },
  {
    x: 82,
    y: 6,
    depth: "mid",
    tone: "green",
    node: (
      <svg viewBox="0 0 100 56" className="w-[15cqw]" fill="none" strokeWidth="12" aria-hidden>
        <path d="M6 50 A44 44 0 0 1 94 50" stroke="currentColor" opacity="0.25" />
        <path d="M6 50 A44 44 0 0 1 94 50" stroke="currentColor" pathLength="100" strokeDasharray="70 100" />
      </svg>
    ),
  },
  {
    x: 9,
    y: 21,
    depth: "near",
    tone: "green",
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
    tone: "green",
    node: (
      <div className="flex h-[16cqw] items-end gap-[1.6cqw]">
        {BARS.map((h, i) => (
          <span
            key={h}
            className="block w-[3.2cqw]"
            style={{ height: `${h}%`, backgroundColor: i % 2 === 1 ? TONE.blue : TONE.green }}
          />
        ))}
      </div>
    ),
  },
  {
    x: 7,
    y: 62,
    depth: "near",
    tone: "teal",
    opacity: 0.75,
    node: (
      <svg viewBox="0 0 120 50" className="w-[36cqw]" fill="none" strokeWidth="2" aria-hidden>
        <polyline points="0,42 20,34 40,38 62,20 84,24 120,4" stroke="currentColor" strokeLinejoin="round" />
        <circle cx="120" cy="4" r="3.5" fill={TONE.blue} />
      </svg>
    ),
  },
  {
    x: 40,
    y: 5,
    depth: "near",
    tone: "blue",
    node: (
      <svg viewBox="0 0 60 40" className="w-[13cqw]" aria-hidden>
        {[
          [8, 30, 3],
          [18, 22, 4.5],
          [30, 26, 2.5],
          [38, 12, 5],
          [50, 8, 3],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" />
        ))}
      </svg>
    ),
  },
  {
    x: 78,
    y: 88,
    depth: "near",
    tone: "teal",
    node: (
      <svg viewBox="0 0 100 100" className="size-[6cqw]" aria-hidden>
        <circle cx="50" cy="50" r="50" fill="currentColor" opacity="0.25" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="50" pathLength="100" strokeDasharray="35 100" transform="rotate(-90 50 50)" />
      </svg>
    ),
  },
];

export function HeroField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden [container-type:inline-size]">
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
                color: TONE[p.tone],
                "--o": p.opacity ?? d.opacity,
                "--x1": `${JUMPS[i][0]}cqw`,
                "--y1": `${JUMPS[i][1]}cqw`,
                "--x2": `${JUMPS[i][2]}cqw`,
                "--y2": `${JUMPS[i][3]}cqw`,
                animationDelay: `${150 + i * 350}ms`,
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
      <HeroTypedAnswer />
    </div>
  );
}
