/**
 * Fondo del hero: una idea (un disco blanco) cruza seis filtros (líneas verticales). Cada línea se
 * ilumina en azul-guía el instante en que el disco la cruza. Bucle de 16 s sin cortes: el disco entra
 * y sale fuera de pantalla. Solo transform y opacity.
 */
const LOOP_SECONDS = 16;
const FLASH_PEAK_SECONDS = 0.02 * LOOP_SECONDS; // el pico de «hero-line-flash» está en el 2% del ciclo
/** El disco recorre de -8% a 108% del ancho (116% de recorrido). */
const TRAVEL_START = -8;
const TRAVEL = 116;

const FILTERS = [
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
      {FILTERS.map((label, i) => {
        const x = ((i + 1) / (FILTERS.length + 1)) * 100;
        const crossesAt = ((x - TRAVEL_START) / TRAVEL) * LOOP_SECONDS;
        return (
          <div
            key={label}
            // En móvil quedan tres (1.ª, 3.ª y 5.ª), que siguen equidistantes.
            className={`absolute inset-y-0 w-px bg-white/12 ${i % 2 === 1 ? "max-sm:hidden" : ""}`}
            style={{ left: `${x}%` }}
          >
            <span
              className="hero-line-flash absolute inset-y-0 -left-px w-0.5 bg-[#6baed6]"
              style={{ animationDuration: `${LOOP_SECONDS}s`, animationDelay: `${(crossesAt - FLASH_PEAK_SECONDS).toFixed(2)}s` }}
            />
            <span className="absolute bottom-6 left-0 w-24 -translate-x-1/2 text-center text-xs uppercase leading-snug tracking-[0.18em] text-white/55 sm:w-36">
              {label}
            </span>
          </div>
        );
      })}

      <div
        className="hero-idea-travel absolute top-12 h-0 lg:top-16"
        style={{ left: `${TRAVEL_START}%`, width: `${TRAVEL}%`, animationDuration: `${LOOP_SECONDS}s` }}
      >
        <div className="hero-idea-bob">
          <span className="-ml-7 -mt-7 block size-14 rounded-full bg-white sm:-ml-9 sm:-mt-9 sm:size-[4.5rem]" />
        </div>
      </div>
    </div>
  );
}
