import { CREDIT_COST_CIFRA_CAPTURE } from "@/lib/credits/costs";
import { PLANS } from "@/lib/credits/plans";

/** Texto de la página pública de Cifra. Todo lo que se promete aquí existe en la herramienta. */

export const CIFRA_SIGNUP = { href: "/cuenta/registro", label: "Empezar con Cifra" } as const;

export const CIFRA_NAV_LINKS = [
  { href: "/cifra#problema", label: "El problema" },
  { href: "/cifra#captura", label: "Captura inteligente" },
  { href: "/cifra#cuentas", label: "Mis cuentas" },
  { href: "/cifra#pagos", label: "Pagos" },
  { href: "/cifra#resumen", label: "Resumen" },
  { href: "/cifra#precio", label: "Precio" },
  { href: "/cifra#faq", label: "FAQ" },
] as const;

export const CIFRA_CAPTURE_RULES = [
  { title: "Nada se guarda sin tu confirmación", text: "Lo que propone Cifra es una sugerencia. El movimiento existe cuando tú lo confirmas." },
  { title: "Tus fotos y tu voz no se guardan", text: "Se procesan para esta captura y se descartan. Solo se conserva el movimiento que confirmas." },
  { title: `${CREDIT_COST_CIFRA_CAPTURE} créditos por captura`, text: "El mismo costo con foto, voz, texto o todo junto. Si la lectura falla, se te devuelven. Registrar a mano no cuesta nada." },
] as const;

export const CIFRA_ACCOUNTS = [
  { title: "Saldos", text: "Efectivo, banco y ahorro, con el total siempre a la vista." },
  { title: "Deudas", text: "Tarjetas, préstamos, auto y vivienda, con su corte, fecha límite y pagos que faltan." },
  { title: "Gastos fijos", text: "Renta, servicios y suscripciones que se proyectan solos hacia adelante." },
] as const;

export const CIFRA_SUMMARY_POINTS = [
  "Ingresos, egresos y balance del mes",
  "Cada categoría con su color y su porcentaje",
  "Tus movimientos por mes, siempre a la mano",
] as const;

export const CIFRA_PRIVACY_POINTS = [
  { title: "Sin conexión a tu banco", text: "Nunca te pedimos claves ni accesos bancarios." },
  { title: "Tus datos son tuyos", text: "No se comparten ni se usan en tus análisis de ideas." },
  { title: "Los borras cuando quieras", text: "Incluso si cancelas tu plan." },
  { title: "La IA es opcional", text: "Te pedimos permiso antes de la primera captura inteligente." },
] as const;

const explora = PLANS[0];

/** Lo que cada plan permite hacer con Cifra, para el selector de precios. */
export const CIFRA_PLAN_ROWS = PLANS.map((plan) => ({
  id: plan.id,
  name: plan.name,
  priceMxn: plan.priceMxn,
  credits: plan.credits,
  captures: Math.floor(plan.credits / CREDIT_COST_CIFRA_CAPTURE),
  highlighted: plan.highlighted,
}));

export const CIFRA_PRICING = {
  plan: explora,
  captures: Math.floor(explora.credits / CREDIT_COST_CIFRA_CAPTURE),
} as const;

export const CIFRA_FAQ = [
  {
    question: "¿Cifra es gratis?",
    answer: `Cifra se usa con un plan de Decida, desde $${explora.priceMxn} MXN al mes. Registrar a mano es ilimitado y no gasta créditos; solo la captura inteligente usa ${CREDIT_COST_CIFRA_CAPTURE} créditos por captura.`,
  },
  {
    question: "¿Se conecta con mi banco o mis tarjetas?",
    answer: "No. Cifra nunca te pide claves ni accesos bancarios. Tú capturas tus saldos, deudas y movimientos, a mano o con una foto, tu voz o texto.",
  },
  {
    question: "¿Qué pasa con las fotos de mis tickets y mi voz?",
    answer: "Se envían a nuestros proveedores de herramientas de IA solo para leer esa captura y no se guardan en Decida. Un ticket puede traer datos personales, como tu nombre o los últimos dígitos de tu tarjeta: puedes taparlos antes de subirlo.",
  },
  {
    question: "¿Y si la IA se equivoca?",
    answer: "Por eso siempre revisas. Cifra te muestra el movimiento propuesto en un formulario y puedes cambiar tipo, monto, categoría, fecha o nota antes de guardar. Si no se pudo leer el total, te lo pide.",
  },
  {
    question: "¿Puedo usar Cifra sin inteligencia artificial?",
    answer: "Sí. Todo se puede registrar a mano: saldos, deudas, gastos fijos, ingresos y egresos. La captura inteligente es un atajo opcional.",
  },
  {
    question: "¿Qué pasa si cancelo mi plan?",
    answer: "Tus datos de Cifra se conservan, pero para volver a usar la herramienta necesitas un plan activo. Si prefieres, puedes borrarlos cuando quieras.",
  },
] as const;
