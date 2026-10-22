export const NAV_LINKS = [
  { href: "/#problema", label: "El problema" },
  { href: "/#mecanismo", label: "Cómo funciona" },
  { href: "/#ejemplo", label: "Ejemplo" },
  { href: "/#para-quien", label: "¿Es para ti?" },
  { href: "/#precio", label: "Precio" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const LOGIN_LINK = { href: "/cuenta", label: "Iniciar sesión" } as const;

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

export type ReportInclude = {
  text: string;
  /** free: en el plan gratuito · partial: versión parcial gratis · paid: solo con suscripción */
  plan: "free" | "partial" | "paid";
};

export const REPORT_PLAN_LABELS: Record<ReportInclude["plan"], string> = {
  free: "Gratis",
  partial: "Parcial gratis",
  paid: "Suscripción",
};

export const REPORT_INCLUDES: readonly ReportInclude[] = [
  { text: "Resumen ejecutivo del diagnóstico", plan: "free" },
  { text: "Señales de viabilidad por dimensión", plan: "free" },
  { text: "Fortalezas y riesgos concretos", plan: "free" },
  { text: "Lectura financiera básica (márgenes y equilibrio)", plan: "partial" },
  { text: "Compatibilidad con tu forma de trabajar", plan: "paid" },
  { text: "Plan de validación de cuatro semanas", plan: "partial" },
  { text: "Recomendación final y cómo reducir cada riesgo", plan: "paid" },
];

export const PRICING_FREE_INCLUDES = [
  "Una evaluación completa de tu idea",
  "Resumen y semáforos por dimensión",
  "Tu negocio, fortalezas y riesgos principales",
  "Vista parcial de lo financiero y del plan de validación",
] as const;

export const PRICING_PAID_INCLUDES = [
  "Evaluaciones ilimitadas",
  "Compatibilidad personal, tiempo y operación, y escalabilidad",
  "Recomendación final y cómo reducir cada riesgo",
  "Alertas, desglose financiero y plan de validación completo",
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
    question: "¿Es gratis?",
    answer:
      "Tu primera evaluación es gratis y no pide tarjeta. Incluye el resumen, los semáforos por dimensión, tu negocio, fortalezas y riesgos principales. Para el reporte completo y más ideas te suscribes por $99 MXN al mes.",
  },
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
      "Físicas, digitales, servicios, producto, franquicia, negocio secundario o proyectos independientes. Cada evaluación es de una idea; el plan gratuito incluye una y la suscripción no tiene límite.",
  },
  {
    question: "¿Qué pasa si el riesgo sale alto?",
    answer:
      "También es un resultado útil: puedes ajustar la idea, validar o pausar antes de perder dinero.",
  },
  {
    question: "¿Cómo funciona la suscripción y cómo la cancelo?",
    answer:
      "Cuesta $99 MXN al mes y se paga con tarjeta a través de Stripe. Puedes cancelarla cuando quieras desde tu cuenta: conservas el acceso completo hasta el fin del periodo ya pagado. No hacemos reembolsos por el periodo pagado.",
  },
  {
    question: "¿Qué pasa con mis evaluaciones si cancelo?",
    answer:
      "Se quedan guardadas en tu cuenta. Al terminar tu periodo vuelves a ver la versión gratuita de cada reporte, y si te suscribes de nuevo se desbloquean todas.",
  },
  {
    question: "¿Mi idea es privada?",
    answer:
      "No vendemos ni compartimos tu información con terceros para marketing. Para generar el reporte, tus respuestas y el texto de tu idea los procesa por nosotros un proveedor de inteligencia artificial (OpenAI). Lo detallamos en el aviso de privacidad.",
  },
  {
    question: "¿Usan inteligencia artificial?",
    answer:
      "Sí, pero con reglas claras: los puntajes y los cálculos financieros salen de reglas fijas aplicadas a tus respuestas, y la inteligencia artificial ayuda a interpretarlos, a investigar tu mercado en fuentes públicas que se citan en el reporte y a redactarlo. No sustituye asesoría profesional.",
  },
  {
    question: "¿Qué pasa si el reporte no se genera?",
    answer:
      "Tus respuestas quedan guardadas y puedes reintentar desde la misma pantalla. Si el problema sigue, escríbenos a hello@decida.mx con el código que te mostramos y lo revisamos.",
  },
  {
    question: "¿Cuánto tarda?",
    answer: "Entre 15 y 20 minutos, del diagnóstico guiado al reporte.",
  },
] as const;

/** Static hero proof — illustrative sample judgment (not live user data) */
export const HERO_JUDGMENT = {
  ideaLabel: "Ejemplo ilustrativo",
  ideaTitle: "Servicio de detailing móvil",
  recommendation: "Validar antes de invertir más",
  constraintNote:
    "Resultado cruzado con tiempo parcial, presupuesto acotado y canal aún poco claro.",
  signals: [
    { label: "Ajuste de tiempo: favorable", tone: "ok" as const },
    { label: "Viabilidad comercial: por validar", tone: "caution" as const },
    { label: "Riesgo: moderado", tone: "watch" as const },
  ],
  nextStep:
    "Hablar con 10 clientes potenciales y cotizar costos reales antes de gastar más de $10,000 MXN.",
} as const;

