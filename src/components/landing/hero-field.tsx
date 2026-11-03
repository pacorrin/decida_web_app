"use client";

import { Pause, Play } from "lucide-react";
import { type AnimationEvent, type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { HeroTypedAnswer } from "@/components/landing/hero-typed-answer";

/**
 * Panel del hero: fragmentos de un reporte (veredictos, cifras y gráficas) a distintos tamaños, opacidades y
 * profundidades. Cada pieza tiene su propio ciclo: aparece con un fundido lento, se queda, se desvanece y, ya
 * invisible, reaparece en otro punto del panel (buscando un hueco libre) y con valores nuevos al azar. Los ciclos
 * tienen duraciones y arranques distintos para que nunca aparezcan ni cambien todas a la vez. Hay un botón para
 * pausar todo el movimiento. Solo opacity.
 */
type Depth = "far" | "mid" | "near";

const DEPTH: Record<Depth, { opacity: number }> = {
  far: { opacity: 0.1 },
  mid: { opacity: 0.22 },
  near: { opacity: 0.72 },
};

/**
 * Sobre el verde oscuro domina el blanco (con la transparencia de cada profundidad) y cada pieza intercala
 * un acento de marca —coral, azul o amarillo— al reaparecer.
 */
const TONES = ["#ffffff", "#ff7043", "#ffffff", "#6baed6", "#ffffff", "#ffb74d"];
const ACCENT_SOFT: Record<string, number> = { "#ff7043": 0.5, "#6baed6": 0.65, "#ffb74d": 0.6 };
/** Los acentos del panel se atenúan para que el botón principal siga siendo lo único intenso. */
const soft = (color: string) => ACCENT_SOFT[color] ?? 1;

const LABELS = ["Encaje con tu tiempo", "Capacidad de inversión", "Afinidad con tu perfil", "Demanda en tu zona"];

/** Valores de una pieza: los gráficos se vuelven a sortear en cada reaparición. */
type Data = {
  bars: number[];
  pct: number;
  label: string;
  radar: number[];
  donut: number;
  gauge: number;
  line: number[];
  dots: [number, number, number][];
  pie: number;
};

const between = (min: number, max: number) => min + Math.random() * (max - min);
const whole = (min: number, max: number) => Math.round(between(min, max));

/** Sortea todos los valores de los gráficos. */
export function randomChartData(): Data {
  const up = Math.random() > 0.3;
  let y = up ? between(34, 44) : between(8, 18);
  const line = Array.from({ length: 6 }, () => {
    y = Math.min(44, Math.max(4, y + (up ? -1 : 1) * between(-4, 12)));
    return y;
  });
  return {
    bars: Array.from({ length: 5 }, () => whole(28, 100)),
    pct: whole(35, 96),
    label: LABELS[whole(0, LABELS.length - 1)],
    radar: Array.from({ length: 6 }, () => between(0.3, 0.95)),
    donut: whole(25, 92),
    gauge: whole(30, 95),
    line,
    dots: Array.from({ length: 5 }, (_, i) => [8 + i * 10.5 + between(-3, 3), between(6, 34), between(2.5, 5.5)] as [number, number, number]),
    pie: whole(15, 85),
  };
}

/** Valores de la primera pintura: fijos, para que el servidor y el cliente coincidan. */
const INITIAL_DATA: Data = {
  bars: [38, 62, 48, 80, 100],
  pct: 72,
  label: LABELS[0],
  radar: [0.9, 0.6, 0.8, 0.5, 0.7, 0.4],
  donut: 63,
  gauge: 70,
  line: [42, 34, 38, 20, 24, 4],
  dots: [
    [8, 30, 3],
    [18, 22, 4.5],
    [30, 26, 2.5],
    [38, 12, 5],
    [50, 8, 3],
  ],
  pie: 35,
};

function radarPoints(values: number[]) {
  return values
    .map((v, k) => {
      const angle = ((-90 + 60 * k) * Math.PI) / 180;
      return `${(50 + 45 * v * Math.cos(angle)).toFixed(1)},${(50 + 45 * v * Math.sin(angle)).toFixed(1)}`;
    })
    .join(" ");
}

function word(text: string, size: string) {
  return function Word() {
    return <span className={`${size} font-semibold leading-none tracking-[-0.05em]`}>{text}</span>;
  };
}

type Piece = {
  depth: Depth;
  tone: number;
  opacity?: number;
  /** Posición inicial y rango (en % del panel) al que puede reaparecer. */
  x: number;
  y: number;
  xr: [number, number];
  yr: [number, number];
  render: (d: Data, accent: string, partner: string) => ReactNode;
};


const PIECES: Piece[] = [
  { depth: "far", tone: 0, x: -4, y: 2, xr: [-6, 28], yr: [0, 60], render: word("Validar", "text-[26cqw]") },
  { depth: "far", tone: 1, x: 24, y: 72, xr: [-4, 36], yr: [40, 80], render: word("Pausar", "text-[22cqw]") },
  {
    depth: "far",
    tone: 2,
    x: 6,
    y: 38,
    xr: [0, 60],
    yr: [10, 60],
    render: (d) => (
      <svg viewBox="0 0 100 100" className="size-[34cqw]" fill="none" strokeWidth="1.5" aria-hidden>
        <polygon points={radarPoints([1, 1, 1, 1, 1, 1])} stroke="currentColor" />
        <polygon points={radarPoints([0.66, 0.66, 0.66, 0.66, 0.66, 0.66])} stroke="currentColor" opacity="0.5" />
        <polygon points={radarPoints(d.radar)} fill="currentColor" fillOpacity="0.5" stroke="currentColor" />
      </svg>
    ),
  },
  { depth: "mid", tone: 0, x: 48, y: 13, xr: [0, 55], yr: [5, 75], render: word("Probar", "text-[14cqw]") },
  {
    depth: "mid",
    tone: 1,
    x: 62,
    y: 50,
    xr: [0, 70],
    yr: [10, 70],
    render: (d) => (
      <svg viewBox="0 0 100 100" className="size-[26cqw]" fill="none" strokeWidth="14" aria-hidden>
        <circle cx="50" cy="50" r="38" stroke="currentColor" opacity="0.25" />
        <circle cx="50" cy="50" r="38" stroke="currentColor" pathLength="100" strokeDasharray={`${d.donut} 100`} transform="rotate(-90 50 50)" />
      </svg>
    ),
  },
  { depth: "mid", tone: 2, opacity: 0.45, x: 54, y: 33, xr: [0, 70], yr: [5, 85], render: word("Ajustar", "text-[8cqw]") },
  {
    depth: "mid",
    tone: 0,
    x: 82,
    y: 6,
    xr: [0, 80],
    yr: [3, 80],
    render: (d) => (
      <svg viewBox="0 0 100 56" className="w-[15cqw]" fill="none" strokeWidth="12" aria-hidden>
        <path d="M6 50 A44 44 0 0 1 94 50" stroke="currentColor" opacity="0.25" />
        <path d="M6 50 A44 44 0 0 1 94 50" stroke="currentColor" pathLength="100" strokeDasharray={`${d.gauge} 100`} />
      </svg>
    ),
  },
  {
    depth: "near",
    tone: 0,
    x: 9,
    y: 21,
    xr: [2, 65],
    yr: [8, 70],
    render: (d) => (
      <div>
        <p className="text-[15cqw] font-semibold leading-none tracking-[-0.05em]">{d.pct}%</p>
        <p className="mt-1 text-[clamp(0.75rem,2.4cqw,1rem)] font-medium">{d.label}</p>
      </div>
    ),
  },
  {
    depth: "near",
    tone: 0,
    x: 52,
    y: 71,
    xr: [0, 75],
    yr: [20, 75],
    render: (d, accent, partner) => (
      <div className="flex h-[16cqw] items-end gap-[1.6cqw]">
        {d.bars.map((h, i) => (
          <span key={i} className="block w-[3.2cqw]" style={{ height: `${h}%`, backgroundColor: i % 2 === 1 ? partner : accent, opacity: soft(i % 2 === 1 ? partner : accent) }} />
        ))}
      </div>
    ),
  },
  {
    depth: "near",
    tone: 2,
    opacity: 0.75,
    x: 7,
    y: 62,
    xr: [0, 60],
    yr: [10, 80],
    render: (d, _accent, partner) => (
      <svg viewBox="0 0 120 50" className="w-[36cqw]" fill="none" strokeWidth="2" aria-hidden>
        <polyline points={d.line.map((v, i) => `${i * 24},${v.toFixed(1)}`).join(" ")} stroke="currentColor" strokeLinejoin="round" />
        <circle cx="120" cy={d.line[5].toFixed(1)} r="3.5" fill={partner} fillOpacity={soft(partner)} />
      </svg>
    ),
  },
  {
    depth: "near",
    tone: 1,
    x: 40,
    y: 5,
    xr: [0, 80],
    yr: [3, 85],
    render: (d) => (
      <svg viewBox="0 0 60 40" className="w-[13cqw]" aria-hidden>
        {d.dots.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" />
        ))}
      </svg>
    ),
  },
  {
    depth: "near",
    tone: 2,
    x: 78,
    y: 88,
    xr: [0, 90],
    yr: [5, 90],
    render: (d) => (
      <svg viewBox="0 0 100 100" className="size-[6cqw]" aria-hidden>
        <circle cx="50" cy="50" r="50" fill="currentColor" opacity="0.25" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="50" pathLength="100" strokeDasharray={`${d.pie} 100`} transform="rotate(-90 50 50)" />
      </svg>
    ),
  },
];

/** Máximo de piezas que se ven a la vez en el panel (con los fundidos puede haber una menos). Ajústalo aquí. */
const MAX_VISIBLE = 5;
/** Duración (s) del ciclo de cada pieza; todas comparten ciclo y entran repartidas en partes iguales. */
const CYCLE_S = 66;
/** Orden de entrada: se intercalan palabras, gráficos y figuras para que no salgan seguidas las parecidas. */
const ENTRY_ORDER = [3, 7, 0, 10, 5, 1, 8, 4, 11, 2, 9, 6];
/** Parte del ciclo en que una pieza está visible; con las entradas parejas eso da MAX_VISIBLE o una menos. */
const VISIBLE_FRACTION = (MAX_VISIBLE - 0.15) / PIECES.length;
const pct = (n: number) => (n * 100).toFixed(2);
const FADE = VISIBLE_FRACTION * 0.15;
/** Fundido de entrada, pausa visible y fundido de salida; el resto del ciclo la pieza descansa invisible. */
const ROAM_KEYFRAMES = `@keyframes hero-roam{0%{opacity:0}${pct(FADE)}%,${pct(VISIBLE_FRACTION - FADE)}%{opacity:var(--o)}${pct(VISIBLE_FRACTION)}%,100%{opacity:0}}`;
/**
 * Arranque de cada pieza (s). Las tres primeras en el orden de entrada ya van en curso al cargar y las demás
 * entran una cada CYCLE_S / piezas, así el panel empieza casi vacío y se llena sin pasar del tope.
 */
const STARTS = PIECES.map((_, i) => {
  const slot = ENTRY_ORDER.indexOf(i);
  const step = CYCLE_S / PIECES.length;
  return slot < 3 ? -slot * step : (slot - 2) * step;
});

/** Dos piezas coinciden en pantalla solo si sus turnos de entrada están a menos de lo que dura una pieza visible. */
function coexist(a: number, b: number) {
  const n = PIECES.length;
  const gap = Math.abs(ENTRY_ORDER.indexOf(a) - ENTRY_ORDER.indexOf(b));
  return Math.min(gap, n - gap) < VISIBLE_FRACTION * n + 1;
}

type Slot = { x: number; y: number; data: Data; tone: number };

/** Rectángulo de un elemento relativo a la raíz del panel; null si no ocupa espacio. */
function boxOf(el: Element, root: DOMRect) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { l: r.left - root.left, t: r.top - root.top, r: r.right - root.left, b: r.bottom - root.top };
}

type Box = NonNullable<ReturnType<typeof boxOf>>;

const pad = (b: Box, m: number): Box => ({ l: b.l - m, t: b.t - m, r: b.r + m, b: b.b + m });

const overlapArea = (a: Box, b: Box) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

export function HeroField() {
  const [slots, setSlots] = useState<Slot[]>(() => PIECES.map((p) => ({ x: p.x, y: p.y, data: INITIAL_DATA, tone: p.tone })));
  const [paused, setPaused] = useState(false);
  /** El servidor pinta posiciones fijas; al montar cada pieza toma posición, valores y color al azar y recién entonces se muestra. */
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);

  /**
   * Elige un punto del rango de la pieza que no pise a las que coinciden con ella en pantalla ni a la tarjeta;
   * si no hay, el que menos. `placed` trae las cajas ya decididas en esta ronda (sustituyen a las del DOM).
   */
  function pickSpot(i: number, placed?: Map<number, Box>) {
    const p = PIECES[i];
    const root = rootRef.current;
    const self = pieceRefs.current[i];
    const fallback = () => ({ x: between(p.xr[0], p.xr[1]), y: between(p.yr[0], p.yr[1]) });
    if (!root || !self) return { ...fallback(), box: null as Box | null };

    const area = root.getBoundingClientRect();
    const own = self.getBoundingClientRect();
    // Cualquier punto del panel donde la pieza quepa (las de fondo pueden sangrar un poco por la izquierda).
    const maxX = Math.max(0, (1 - own.width / area.width) * 100);
    const maxY = Math.max(0, (1 - own.height / area.height) * 100);
    const candidate = () => ({ x: between(p.depth === "far" ? -6 : 0, maxX), y: between(0, maxY) });
    const others: Box[] = [];
    pieceRefs.current.forEach((el, k) => {
      if (k === i || !el || !coexist(i, k)) return;
      const b = placed?.get(k) ?? boxOf(el, area);
      if (b) others.push(b);
    });
    root.querySelectorAll("[data-keepout]").forEach((el) => {
      const b = boxOf(el, area);
      if (b) others.push(b);
    });

    /** Cuántos puntos se prueban: más candidatos dan piezas más separadas. */
    const TRIES = 120;
    let best = candidate();
    let bestBox: Box | null = null;
    let bestScore = -Infinity;
    for (let n = 0; n < TRIES; n++) {
      const c = candidate();
      const l = (c.x / 100) * area.width;
      const t = (c.y / 100) * area.height;
      const box: Box = { l, t, r: l + own.width, b: t + own.height };
      const outside = Math.max(0, box.r - area.width) + Math.max(0, box.b - area.height);
      // Margen alrededor de cada vecina: tocarse o quedar pegadas cuenta como solapamiento.
      const overlap = others.reduce((sum, o) => sum + overlapArea(box, pad(o, area.width * 0.03)), 0);
      // Distancia (en anchos del panel) al centro de la pieza más cercana: gana el punto más despejado.
      const cx = (box.l + box.r) / 2;
      const cy = (box.t + box.b) / 2;
      const nearest = others.reduce((m, o) => Math.min(m, Math.hypot(cx - (o.l + o.r) / 2, cy - (o.t + o.b) / 2)), Infinity);
      // Aparte, la separación vertical con la pieza que quede más a su altura: evita que varias se apilen en la misma franja.
      const nearestDy = others.reduce((m, o) => Math.min(m, Math.abs(cy - (o.t + o.b) / 2)), Infinity);
      const dyScore = Number.isFinite(nearestDy) ? nearestDy / area.height : 1;
      const score = (Number.isFinite(nearest) ? nearest / area.width : 1) + dyScore * 1.5 - (overlap / (area.width * area.height)) * 2000 - outside * 0.05;
      if (score > bestScore) {
        best = c;
        bestBox = box;
        bestScore = score;
      }
    }
    return { ...best, box: bestBox };
  }

  useLayoutEffect(() => {
    queueMicrotask(() => {
      // Colocación secuencial en el orden de entrada: cada pieza ve ya fijas a las anteriores y se aleja de ellas.
      const placed = new Map<number, Box>();
      const spots = new Map<number, { x: number; y: number }>();
      for (const i of ENTRY_ORDER) {
        const { box, ...spot } = pickSpot(i, placed);
        if (box) placed.set(i, box);
        spots.set(i, spot);
      }
      setSlots(PIECES.map((_, i) => ({ ...spots.get(i)!, data: randomChartData(), tone: Math.floor(Math.random() * TONES.length) })));
      setReady(true);
    });
  }, []);

  /** Al terminar un ciclo la pieza está invisible: cambia de punto, de valores y de color sin que se note. */
  function onCycleEnd(i: number, e: AnimationEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.animationName !== "hero-roam") return;
    const { x, y } = pickSpot(i);
    const spot = { x, y };
    setSlots((prev) => prev.map((s, k) => (k === i ? { ...spot, data: randomChartData(), tone: (s.tone + 1) % TONES.length } : s)));
  }

  return (
    <div className={`pointer-events-none absolute inset-0 ${paused ? "hero-paused" : ""}`}>
      <style>{ROAM_KEYFRAMES}</style>
      <div ref={rootRef} aria-hidden className={`absolute inset-0 overflow-hidden [container-type:inline-size] ${ready ? "" : "invisible"}`}>
        {PIECES.map((p, i) => {
          const color = TONES[slots[i].tone];
          return (
            <div
              key={i}
              ref={(el) => {
                pieceRefs.current[i] = el;
              }}
              className={`hero-draw absolute ${ENTRY_ORDER.indexOf(i) >= MAX_VISIBLE ? "motion-reduce:hidden" : ""}`}
              onAnimationIteration={(e) => onCycleEnd(i, e)}
              style={
                {
                  left: `${slots[i].x}%`,
                  top: `${slots[i].y}%`,
                  color,
                  "--o": (p.opacity ?? DEPTH[p.depth].opacity) * soft(color),
                  animationDuration: `${CYCLE_S}s`,
                  animationDelay: `${STARTS[i]}s`,
                } as CSSProperties
              }
            >
              {p.render(slots[i].data, color, TONES[(slots[i].tone + 1) % TONES.length])}
            </div>
          );
        })}
        <HeroTypedAnswer paused={paused} />
      </div>
      <button
        type="button"
        onClick={() => setPaused((v) => !v)}
        aria-pressed={paused}
        aria-label={paused ? "Reanudar la animación" : "Pausar la animación"}
        className="pointer-events-auto absolute bottom-3 right-3 z-20 inline-flex size-11 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:hidden"
      >
        {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
