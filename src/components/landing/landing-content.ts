export const NAV_LINKS = [
  { href: "#problema", label: "El problema" },
  { href: "#mecanismo", label: "Cómo decide" },
  { href: "#ejemplo", label: "Ejemplo" },
  { href: "#para-quien", label: "¿Es para ti?" },
  { href: "#precio", label: "Precio" },
  { href: "#faq", label: "FAQ" },
  { href: "/cuenta", label: "Mi cuenta" },
] as const;

export const LEGAL_LINKS = [
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos de servicio" },
] as const;

/** Dimensions the diagnostic weighs against the user's constraints */
export const CONSTRAINT_LENSES = [
  { label: "Tu tiempo disponible", detail: "Horas y horario reales" },
  { label: "Tu dinero e inversión", detail: "Costos, margen y recuperación" },
  { label: "Tu perfil de trabajo", detail: "Si el negocio encaja contigo" },
  { label: "Tu mercado cercano", detail: "Clientes, competencia y canal" },
  { label: "Tu nivel de riesgo", detail: "Qué podrías perder al avanzar" },
  { label: "Tu capacidad de escalar", detail: "Si crece sin romperte" },
] as const;

export const MECHANISM_STEPS = [
  {
    step: 1,
    title: "Describes tu idea",
    description:
      "En tus palabras: qué ofrecerías, a quién y por qué pagarían.",
  },
  {
    step: 2,
    title: "Cruzamos idea y restricciones",
    description:
      "Preguntas concretas sobre tu situación, tiempo, números y mercado.",
  },
  {
    step: 3,
    title: "Recibes un resultado accionable",
    description:
      "Señales por dimensión, riesgos, fortalezas y qué validar antes de invertir más.",
  },
] as const;

export const REPORT_INCLUDES = [
  "Resumen ejecutivo del diagnóstico",
  "Señales de viabilidad por dimensión",
  "Fortalezas y riesgos concretos",
  "Lectura financiera básica (márgenes y equilibrio)",
  "Compatibilidad con tu forma de trabajar",
  "Plan de validación de dos semanas",
  "Recomendación: avanzar, ajustar o pausar",
] as const;

export const PRICING_INCLUDES = [
  "Diagnóstico de una idea",
  "Reporte con señales por dimensión",
  "Riesgos y próximos pasos de validación",
  "Recomendación final accionable",
] as const;

export const FOR_YOU_ITEMS = [
  "Tienes una idea concreta y quieres saber si vale arriesgar tiempo y dinero bajo tus condiciones actuales.",
  "Quieres un ingreso extra o reemplazar empleo sin invertir a ciegas.",
  "Prefieres ajustar o pausar a tiempo antes de rentar, comprar equipo o gastar en publicidad.",
  "Estás dispuesto a hablar con clientes reales si el diagnóstico lo pide.",
] as const;

export const NOT_FOR_YOU_ITEMS = [
  "Buscas una garantía de éxito o que te inventen el negocio.",
  "Quieres que alguien elija por ti qué abrir.",
  "No vas a validar con clientes reales, pase lo que pase.",
  "Necesitas asesoría legal, fiscal o financiera personalizada.",
] as const;

export const FAQ_ITEMS = [
  {
    question: "¿Decida me dice qué negocio abrir?",
    answer:
      "No. Evalúa la idea que tú ya tienes. No inventa oportunidades ni elige por ti.",
  },
  {
    question: "¿Esto garantiza que mi negocio funcionará?",
    answer:
      "No. Reduce incertidumbre: muestra riesgos, fortalezas y qué validar antes de invertir más.",
  },
  {
    question: "¿Necesito saber de finanzas?",
    answer:
      "No. Usas estimaciones. Si falta un dato, el reporte indica qué investigar.",
  },
  {
    question: "¿Qué tipo de ideas puedo evaluar?",
    answer:
      "Físicas, digitales, servicios, producto, franquicia, side hustle o proyectos independientes — una idea por evaluación.",
  },
  {
    question: "¿Qué pasa si el riesgo sale alto?",
    answer:
      "También es un resultado útil: puedes ajustar la idea, validar o pausar antes de perder dinero.",
  },
  {
    question: "¿Cuánto tarda?",
    answer: "Unos 10 a 15 minutos del diagnóstico guiado al reporte.",
  },
] as const;

/** Static hero proof — illustrative sample judgment (not live user data) */
export const HERO_JUDGMENT = {
  ideaLabel: "Ejemplo ilustrativo",
  ideaTitle: "Detailing móvil de autos",
  recommendation: "Validar antes de invertir más",
  constraintNote:
    "Resultado cruzado con tiempo parcial, presupuesto acotado y canal aún poco claro.",
  signals: [
    { label: "Ajuste de tiempo", tone: "ok" as const },
    { label: "Viabilidad comercial", tone: "caution" as const },
    { label: "Riesgo", tone: "watch" as const },
  ],
  nextStep:
    "Hablar con 10 clientes potenciales y cotizar costos reales antes de gastar más de $10,000 MXN.",
} as const;

