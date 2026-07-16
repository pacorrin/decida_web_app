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
      "Necesitamos tus datos para enviarte tu reporte cuando esté listo.",
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
    title: "Continúa con tu diagnóstico personalizado",
    subtitle:
      "Ya entendimos tu idea. Ahora profundizamos en tu situación para darte un análisis realmente tuyo.",
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
  "Menos que un mes probando una mala idea sin validar.";

export const PAYMENT_GUARANTEE_COPY =
  "Si no se genera tu reporte, te reembolsamos.";

export const TRANSITION_AFTER_AJUSTE = {
  title: "¡Ya casi terminamos!",
  subtitle:
    "El siguiente paso es evaluar los números y el mercado de tu idea para generar tu diagnóstico completo.",
};
