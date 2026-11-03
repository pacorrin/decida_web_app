/** Gráfica decorativa del hero: barras que crecen y una línea que se dibuja. Sin etiquetas ni datos reales. */
const BARS = [38, 52, 44, 61, 49, 70, 58, 76, 64, 83, 72, 92];
const LINE = "M 12 118 C 52 104, 70 112, 108 92 S 168 84, 204 70 S 262 62, 300 44 S 352 30, 388 14";

export function HeroChart() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 140"
      preserveAspectRatio="none"
      className="cifra-chart h-full max-h-80 w-full"
    >
      {BARS.map((h, i) => (
        <rect
          key={i}
          className="cifra-bar"
          x={8 + i * 32}
          y={140 - h * 1.4}
          width={20}
          height={h * 1.4}
          rx={4}
          fill={i === BARS.length - 1 ? "#ff7043" : "rgba(255,255,255,0.22)"}
          style={{ "--cifra-bar-delay": `${i * 0.07}s` } as React.CSSProperties}
        />
      ))}
      <path className="cifra-chart-line" d={LINE} fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" pathLength={1} />
    </svg>
  );
}
