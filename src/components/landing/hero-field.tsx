/**
 * Fondo del hero con aire de mercado: barras de volumen que suben y bajan en bucle y una línea de
 * tendencia con sus puntos. Todo plano, solo transform, sin degradados.
 */
const BARS = Array.from({ length: 30 }, (_, i) => {
  const trend = 22 + i * 1.9;
  const wobble = Math.sin(i * 1.7) * 9 + Math.cos(i * 0.9) * 6;
  return {
    h: Math.round(Math.min(92, Math.max(14, trend + wobble))),
    secs: 5 + (i % 7) * 0.9,
    delay: -((i * 1.3) % 9),
    guide: i === 11 || i === 19 || i === 26,
  };
});

/** Línea de tendencia en el cuadro 0-100; los puntos usan las mismas coordenadas en %. */
const LINE: [number, number][] = [
  [52, 62], [59, 54], [66, 58], [73, 42], [80, 46], [87, 30], [93, 33], [98, 18],
];

export function HeroField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 flex h-[78%] items-end gap-[0.6%] px-[0.6%]">
        {BARS.map((b, i) => (
          <span
            key={i}
            className={`hero-bar flex-1 rounded-t-sm ${b.guide ? "bg-[#6baed6]/45" : "bg-white/[0.06]"}`}
            style={{ height: `${b.h}%`, animationDuration: `${b.secs}s`, animationDelay: `${b.delay}s` }}
          />
        ))}
      </div>

      <svg className="absolute inset-0 size-full max-lg:hidden" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={LINE.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="#6baed6"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {LINE.map(([x, y], i) => (
        <span
          key={i}
          className="hero-node absolute size-3 rounded-full bg-[#6baed6] max-lg:hidden"
          style={{ left: `${x}%`, top: `${y}%`, marginLeft: "-0.375rem", marginTop: "-0.375rem", animationDelay: `${-i * 0.7}s` }}
        />
      ))}
    </div>
  );
}
