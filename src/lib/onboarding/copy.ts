import type { OnboardingStepSlug } from "./steps";

type StepCopy = {
  title: string;
  subtitle: string;
  reassurance?: string;
};

export const STEP_COPY: Record<OnboardingStepSlug, StepCopy> = {
  contacto: {
    title: "Empecemos con lo básico",
    subtitle:
      "Necesitamos tus datos para crear tu cuenta y mantener el historial de tus análisis.",
    reassurance: "Tus datos están seguros y no compartimos tu información.",
  },
  idea: {
    title: "Cuéntanos tu idea de negocio",
    subtitle:
      "Descríbela con tus palabras. No hay respuestas correctas ni incorrectas.",
    reassurance: "Mientras más específico seas, más personalizado será tu análisis.",
  },
  confirmacion: {
    title: "Así entendimos tu idea",
    subtitle:
      "Revisa el resumen y selecciona los puntos que quieras aclarar. Te ayudamos a pulirla antes de continuar.",
    reassurance:
      "Mientras más precisa sea tu idea, más útil será tu diagnóstico.",
  },
  pago: {
    title: "Elige tu plan",
    subtitle:
      "Ya entendimos tu idea. Sigue gratis o suscríbete para desbloquear el reporte completo.",
    reassurance: "Tu progreso está guardado.",
  },
  perfil: {
    title: "Tu situación",
    subtitle:
      "Cuéntanos sobre ti y los recursos con los que cuentas para personalizar el diagnóstico.",
    reassurance:
      "Sé honesto — esto hace el análisis más útil para tu realidad.",
  },
  ajuste: {
    title: "¿Qué tipo de trabajo encaja contigo?",
    subtitle:
      "Evaluamos si tu idea es compatible con cómo te gusta trabajar.",
    reassurance:
      "No hay respuestas correctas; evaluamos compatibilidad, no talento.",
  },
  productos: {
    title: "Tus productos y servicios",
    subtitle:
      "Lista lo que piensas vender, con su precio y costo. Con esto calculamos tus márgenes.",
    reassurance:
      "Estimaciones aproximadas — puedes agregar hasta 10 y ajustarlas después.",
  },
  evaluacion: {
    title: "Evaluemos los números y el mercado",
    subtitle:
      "Últimas preguntas clave para tu diagnóstico de viabilidad.",
    reassurance:
      "Estimaciones aproximadas — no tienen que ser perfectas.",
  },
  resultado: {
    title: "Tu diagnóstico de viabilidad",
    subtitle: "Análisis personalizado basado en tu perfil, idea y números.",
  },
};

export const IDEA_PLACEHOLDER =
  "Ejemplo: Quiero iniciar un servicio de detailing móvil los fines de semana para clientes residenciales que buscan limpieza y cuidado de autos a domicilio.";

export const PAYMENT_ANCHOR_COPY =
  "Menos que un mes probando una mala idea sin validar. Sigue con tu evaluación gratis o elige un plan con créditos mensuales para el reporte completo.";

export const PAYMENT_CANCEL_COPY =
  "Cancela cuando quieras: conservas tus créditos hasta el fin del periodo pagado.";

export const PAYMENT_FREE_FEATURES = [
  "Una evaluación completa de tu idea",
  "Resumen y semáforos por dimensión",
  "Tu negocio, fortalezas y riesgos sin mitigación",
  "Vista parcial de lo financiero y del plan de validación",
] as const;

/** Plan gratuito: qué incluye y qué queda bloqueado (coincide con la vista del reporte). */
export const FREE_PLAN_INCLUDES = [
  "Un solo análisis, en versión básica (vista previa de tu diagnóstico)",
  "Sin investigación de mercado: las cifras de mercado son tus supuestos, sin fuentes",
  "Resumen ejecutivo y semáforos por dimensión",
  "Entendimiento de tu negocio, fortalezas y riesgos principales",
  "Vista parcial de lo financiero y la primera semana del plan de validación",
] as const;

export const FREE_PLAN_LOCKED = [
  "Desglose de productos, cálculos y análisis financiero completo",
  "Cómo reducir cada riesgo y las alertas de tus números (solo ves cuántas hay)",
  "Compatibilidad personal, tiempo y operación, y escalabilidad",
  "Las semanas 2 a 4 del plan de validación",
  "Recomendación final y siguientes pasos concretos",
  "Investigación de mercado con fuentes",
] as const;

export const PAYMENT_PAID_FEATURES = [
  "Evaluaciones ilimitadas",
  "Compatibilidad personal, tiempo y operación, y escalabilidad",
  "Recomendación final y mitigaciones de cada riesgo",
  "Alertas, desglose financiero y plan de validación completo",
] as const;

export const TRANSITION_AFTER_AJUSTE = {
  title: "¡Ya casi terminamos!",
  subtitle:
    "El siguiente paso es evaluar los números y el mercado de tu idea para generar tu diagnóstico completo.",
};
