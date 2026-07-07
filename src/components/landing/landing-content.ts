export const NAV_LINKS = [
  { href: "#problema", label: "El problema" },
  { href: "#analisis", label: "Qué analiza" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#ejemplo", label: "Ejemplo" },
  { href: "#precio", label: "Precio" },
  { href: "#faq", label: "FAQ" },
] as const;

export const LEGAL_LINKS = [
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos de servicio" },
] as const;

export const ANALYZES_ITEMS = [
  "Capital disponible",
  "Inversión inicial",
  "Margen estimado",
  "Tiempo requerido",
  "Compatibilidad contigo",
  "Riesgo operativo",
  "Forma de conseguir clientes",
  "Potencial de escalabilidad",
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Describe tu idea",
    description:
      "Cuéntanos qué negocio tienes en mente, para quién sería y qué problema resolvería.",
  },
  {
    step: 2,
    title: "Responde el diagnóstico guiado",
    description:
      "Te haremos preguntas sobre recursos, tiempo, mercado, costos, ventas y preferencias personales.",
  },
  {
    step: 3,
    title: "Recibe tu análisis",
    description:
      "Obtén semáforos por dimensión, riesgos principales, fortalezas y próximos pasos concretos.",
  },
] as const;

export const REPORT_INCLUDES = [
  "Resumen ejecutivo",
  "Semáforos de viabilidad",
  "Fortalezas de la idea",
  "Riesgos ocultos",
  "Análisis financiero básico",
  "Compatibilidad personal",
  "Próximos pasos de validación",
  "Recomendación final",
] as const;

export const PRICING_INCLUDES = [
  "Evaluación inmediata",
  "Diagnóstico personalizado",
  "Semáforos por dimensión",
  "Riesgos principales",
  "Próximos pasos",
] as const;

export const FOR_YOU_ITEMS = [
  "Tienes una idea de negocio, pero no sabes si vale la pena.",
  "Quieres generar ingreso extra sin invertir a ciegas.",
  "Tienes capital limitado y quieres reducir riesgo.",
  "Estás comparando oportunidades.",
  "Quieres saber qué validar antes de avanzar.",
] as const;

export const NOT_FOR_YOU_ITEMS = [
  "Buscas una garantía de éxito.",
  "Quieres que alguien te diga exactamente qué negocio abrir.",
  "No estás dispuesto a validar con clientes reales.",
  "Buscas asesoría legal, fiscal o financiera personalizada.",
] as const;

export const FAQ_ITEMS = [
  {
    question: "¿La herramienta me dice qué negocio abrir?",
    answer:
      "No. La herramienta evalúa la idea que tú tienes en mente. Más adelante podrá comparar ideas, pero V1 se enfoca en analizar una idea específica.",
  },
  {
    question: "¿Esto garantiza que mi negocio funcionará?",
    answer:
      "No. El objetivo es reducir incertidumbre, identificar riesgos y ayudarte a tomar mejores decisiones antes de invertir.",
  },
  {
    question: "¿Necesito saber de finanzas?",
    answer:
      "No. Solo necesitas responder estimaciones básicas. Si no sabes algún dato, el reporte también te dirá qué información necesitas investigar.",
  },
  {
    question: "¿Puedo evaluar cualquier idea?",
    answer:
      "Sí. Puede ser un negocio físico, digital, de servicios, producto, franquicia, side hustle o proyecto independiente.",
  },
  {
    question: "¿Qué pasa si mi idea sale con riesgo alto?",
    answer:
      "Eso también es útil. Significa que puedes ajustar, validar o pausar antes de perder dinero.",
  },
  {
    question: "¿Cuánto tarda?",
    answer:
      "La experiencia debe tomar aproximadamente 10 a 15 minutos.",
  },
] as const;

export const SIGNAL_DIMENSIONS = [
  { label: "Compatibilidad personal", signal: "yellow" as const },
  { label: "Viabilidad financiera", signal: "yellow" as const },
  { label: "Viabilidad comercial", signal: "red" as const },
  { label: "Nivel de riesgo", signal: "yellow" as const },
  { label: "Ajuste de tiempo", signal: "green" as const },
  { label: "Escalabilidad", signal: "yellow" as const },
] as const;
