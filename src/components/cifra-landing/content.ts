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

export const CIFRA_PROBLEMS = [
  {
    title: "Las fechas se te pasan",
    text: "La tarjeta corta un día, vence otro, el préstamo tiene su fecha y la renta la suya. Todo vive en tu cabeza hasta que algo se vence.",
  },
  {
    title: "No sabes cuánto te queda",
    text: "Entre saldos, deudas y gastos fijos, nadie te dice si después de pagar todo te alcanza o te falta.",
  },
  {
    title: "Anotar cada gasto da flojera",
    text: "Las hojas de cálculo y las apps de gastos se abandonan porque capturar uno por uno toma más tiempo del que dura la motivación.",
  },
] as const;

export const CIFRA_CAPTURE_MODES = [
  {
    title: "Foto del ticket",
    text: "Toma la foto con la cámara o elige hasta 3 de tu galería. Cifra lee el total, el comercio y la fecha.",
  },
  {
    title: "Nota de voz",
    text: "Toca «Grabar voz» y cuéntalo en tus palabras, hasta 60 segundos. Se pasa a texto y lo puedes corregir.",
  },
  {
    title: "Texto",
    text: "Escribe o dicta con el micrófono de tu teclado: «súper Walmart 847.50». Con una línea basta.",
  },
] as const;

export const CIFRA_CAPTURE_STEPS = [
  {
    title: "Elige cómo capturar",
    text: "Foto, voz, texto o una mezcla: una foto del ticket y una nota de voz de lo que no se ve en él.",
  },
  {
    title: "Cifra te propone el movimiento",
    text: "Tipo (ingreso o egreso), monto, categoría de tu catálogo, fecha y una nota breve, ya llenos en el formulario.",
  },
  {
    title: "Tú revisas y confirmas",
    text: "Corriges lo que haga falta. No se registra nada hasta que tú lo confirmas.",
  },
] as const;

export const CIFRA_CAPTURE_RULES = [
  { title: "Nada se guarda sin tu confirmación", text: "Lo que propone Cifra es una sugerencia. El movimiento existe cuando tú lo confirmas." },
  { title: "Tus fotos y tu voz no se guardan", text: "Se procesan para esta captura y se descartan. Solo se conserva el movimiento que confirmas." },
  { title: `${CREDIT_COST_CIFRA_CAPTURE} créditos por captura`, text: "El mismo costo con foto, voz, texto o todo junto. Si la lectura falla, se te devuelven. Registrar a mano no cuesta nada." },
] as const;

export const CIFRA_ACCOUNTS = [
  {
    title: "Saldos",
    lead: "Lo que tienes",
    items: ["Efectivo, cuenta bancaria, ahorro u otra", "El total en tus cuentas, siempre a la vista", "Una observación para recordar para qué es cada una"],
  },
  {
    title: "Deudas",
    lead: "Lo que debes",
    items: [
      "Tarjeta de crédito, préstamo, automóvil, vivienda u otra",
      "Capturas el próximo pago real: monto y fecha, no «un mensual» que cambia cada mes",
      "En tarjetas: corte, fecha límite de pago y uso de tu límite de crédito",
      "Cuántos pagos te faltan, estimado con tu vigencia o tu historial",
    ],
  },
  {
    title: "Gastos fijos",
    lead: "Lo que se repite",
    items: ["Renta, servicios, suscripciones y lo que pagas cada periodo", "Recurrentes o de una sola vez, de monto fijo o variable", "Se proyectan solos hacia adelante, sin volver a capturarlos"],
  },
] as const;

export const CIFRA_PAYMENTS_POINTS = [
  { title: "Lo vencido primero", text: "Lo que ya pasó de fecha aparece arriba, seguido de lo que viene, con cuántos días faltan." },
  { title: "Tú eliges el periodo", text: "7, 15, 30, 60 o 90 días, o un rango de fechas propio de hasta un año." },
  { title: "Cuánto sobra o cuánto falta", text: "Total por pagar contra el saldo de tus cuentas, para saber si te alcanza antes de que llegue la fecha." },
  { title: "Los montos que cambian, por confirmar", text: "Si tu tarjeta cambia cada mes, el siguiente pago queda «por confirmar» hasta que capturas el estado de cuenta." },
] as const;

export const CIFRA_SUMMARY_POINTS = [
  "Ingresos, egresos y balance del mes",
  "Lo que debes en total y lo que tienes en tus cuentas",
  "De dónde viene y a dónde se va: ingresos y egresos por categoría, con su porcentaje",
  "Próximos pagos de los siguientes 30 días",
  "Tus últimos movimientos y la lista completa por mes",
] as const;

export const CIFRA_PRIVACY_POINTS = [
  { title: "No se conecta a tu banco", text: "Nunca te pedimos claves ni accesos bancarios. Capturas tú, o con una foto, tu voz o texto." },
  { title: "Tus datos de Cifra son tuyos", text: "No se comparten con terceros ni se usan en tus análisis de ideas." },
  { title: "Los borras cuando quieras", text: "«Borrar mis datos de Cifra» está siempre disponible, incluso si cancelas tu plan." },
  { title: "La IA es opcional y con tu permiso", text: "Antes de la primera captura inteligente te pedimos autorización. Registrar a mano nunca envía nada a la IA." },
] as const;

const explora = PLANS[0];

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
    question: "¿En qué moneda funciona?",
    answer: "Hoy solo en pesos mexicanos (MXN).",
  },
  {
    question: "¿Funciona en el celular?",
    answer: "Sí. Puedes tomar la foto del ticket con la cámara de tu teléfono y grabar tu voz desde el navegador.",
  },
  {
    question: "¿Qué pasa si cancelo mi plan?",
    answer: "Tus datos de Cifra se conservan, pero para volver a usar la herramienta necesitas un plan activo. Si prefieres, puedes borrarlos cuando quieras.",
  },
] as const;
