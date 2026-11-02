/**
 * Fondo del hero: ideas como discos planos que se mueven despacio en un bucle sin cortes.
 * Cuatro se quedan en azul-guía, uno por cada veredicto posible. Solo transform, sin degradados.
 */
type Disc = {
  x: number; // % desde la izquierda del centro del disco
  y: number; // % desde arriba
  size: number; // rem
  tone: "soft" | "mid" | "guide";
  dx: number; // rem de recorrido
  dy: number;
  secs: number;
  delay: number;
};

const DISCS: Disc[] = [
  { x: 82, y: 22, size: 26, tone: "soft", dx: -2.5, dy: 2, secs: 19, delay: 0 },
  { x: 94, y: 78, size: 20, tone: "mid", dx: 2, dy: -3, secs: 23, delay: -6 },
  { x: 66, y: 62, size: 14, tone: "soft", dx: 3, dy: 2.5, secs: 17, delay: -3 },
  { x: 58, y: 14, size: 9, tone: "mid", dx: -2, dy: 3, secs: 21, delay: -9 },
  { x: 40, y: 88, size: 11, tone: "soft", dx: 2.5, dy: -2, secs: 25, delay: -12 },
  { x: 10, y: 8, size: 12, tone: "mid", dx: 2, dy: 2.5, secs: 22, delay: -5 },
  { x: 74, y: 40, size: 2.2, tone: "guide", dx: -1.5, dy: 2, secs: 14, delay: -2 },
  { x: 88, y: 56, size: 1.6, tone: "guide", dx: 1.5, dy: -2, secs: 16, delay: -7 },
  { x: 62, y: 80, size: 1.9, tone: "guide", dx: 2, dy: 1.5, secs: 18, delay: -10 },
  { x: 92, y: 10, size: 1.4, tone: "guide", dx: -1.5, dy: 2, secs: 15, delay: -4 },
];

const TONES = {
  soft: "bg-white/[0.045]",
  mid: "bg-white/[0.08]",
  guide: "bg-[#6baed6] max-lg:hidden",
} as const;

export function HeroField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {DISCS.map((d, i) => (
        <span
          key={i}
          className={`hero-disc absolute rounded-full ${TONES[d.tone]}`}
          style={
            {
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.size}rem`,
              height: `${d.size}rem`,
              marginLeft: `${-d.size / 2}rem`,
              marginTop: `${-d.size / 2}rem`,
              "--dx": `${d.dx}rem`,
              "--dy": `${d.dy}rem`,
              animationDuration: `${d.secs}s`,
              animationDelay: `${d.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
