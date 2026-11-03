/**
 * Panel del hero: ondas concéntricas que nacen de un punto (la idea) y se expanden como un radar.
 * Seis anillos, uno por filtro, desfasados en el tiempo para que el bucle de 12 s no tenga cortes.
 * Solo transform y opacity.
 */
const RINGS = 6;
const LOOP_SECONDS = 12;

export const HERO_FILTERS = [
  "Tu tiempo disponible",
  "Tu dinero e inversión",
  "Tu perfil de trabajo",
  "Tu mercado cercano",
  "Tu nivel de riesgo",
  "Tu capacidad de escalar",
];

export function HeroField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[44%]">
        {Array.from({ length: RINGS }, (_, i) => (
          <span
            key={i}
            className="hero-ring absolute left-1/2 top-1/2 -ml-[24rem] -mt-[24rem] block size-[48rem] rounded-full border border-primary/25"
            style={{
              animationDuration: `${LOOP_SECONDS}s`,
              animationDelay: `-${((i * LOOP_SECONDS) / RINGS).toFixed(2)}s`,
            }}
          />
        ))}
        <span className="hero-core absolute left-1/2 top-1/2 -ml-2 -mt-2 block size-4 rounded-full bg-[#6baed6]" />
      </div>
    </div>
  );
}
