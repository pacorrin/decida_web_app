export type SignalLevel = "green" | "yellow" | "red";

export type RecommendationType =
  | "proceed_small_test"
  | "validate_first"
  | "adjust_idea"
  | "pause_for_now";

export const SIGNAL_LABELS: Record<SignalLevel, string> = {
  green: "Favorable",
  yellow: "Requiere validación",
  red: "Riesgo elevado",
};

export const RECOMMENDATION_LABELS: Record<RecommendationType, string> = {
  proceed_small_test: "Avanzar con prueba pequeña",
  validate_first: "Validar antes de invertir",
  adjust_idea: "Ajustar la idea",
  pause_for_now: "Pausar por ahora",
};

export const DIMENSION_WEIGHTS = [
  { key: "personalFit", label: "Compatibilidad personal", weight: 20 },
  { key: "financialViability", label: "Viabilidad financiera", weight: 25 },
  { key: "commercialViability", label: "Viabilidad comercial", weight: 25 },
  { key: "riskLevel", label: "Nivel de riesgo", weight: 15 },
  { key: "timeFit", label: "Tiempo y operación", weight: 10 },
  { key: "scalability", label: "Escalabilidad", weight: 5 },
] as const;

export const EXAMPLE_REPORT = {
  meta: {
    productName: "Business Viability Assessment",
    brandName: "Decida",
    analyzedAt: "12 de junio de 2026",
    scoringVersion: "v1.0",
    aiModel: "gpt-4o-mini",
    isSample: true,
  },
  cover: {
    businessIdea: "Servicio de detailing móvil",
    userGoal: "Generar ingreso extra",
    userSituation: "Empleado con disponibilidad en fines de semana",
    disclaimer:
      "Este reporte es una herramienta de claridad y análisis inicial. No constituye asesoría financiera, legal o fiscal.",
  },
  executiveSummary: {
    diagnosis:
      "Tu idea parece viable como actividad secundaria de bajo riesgo si la pruebas de forma controlada. La principal fortaleza es que puede iniciar con inversión moderada y operar en fines de semana. El mayor riesgo es que todavía no existe evidencia suficiente de demanda ni un canal claro de adquisición de clientes.",
    mainStrength: "Baja barrera de entrada y operación flexible sin local.",
    mainRisk: "Demanda y canal de adquisición sin validar.",
    recommendation: "validate_first" as RecommendationType,
    recommendationText:
      "La idea tiene señales positivas, pero todavía depende de supuestos no comprobados sobre demanda y adquisición de clientes. Antes de invertir más capital, valida si al menos 5 personas estarían dispuestas a pagar por el servicio en las condiciones propuestas.",
  },
  viabilitySnapshot: [
    {
      key: "personalFit",
      label: "Compatibilidad personal",
      signal: "green" as SignalLevel,
      score: 78,
      summary:
        "El negocio encaja con tu disponibilidad y preferencia por trabajo práctico.",
    },
    {
      key: "financialViability",
      label: "Viabilidad financiera",
      signal: "yellow" as SignalLevel,
      score: 62,
      summary:
        "Los números básicos muestran margen positivo, pero dependen de alcanzar ventas mensuales consistentes.",
    },
    {
      key: "commercialViability",
      label: "Viabilidad comercial",
      signal: "red" as SignalLevel,
      score: 38,
      summary:
        "No hay evidencia suficiente de demanda ni canal de adquisición definido.",
    },
    {
      key: "riskLevel",
      label: "Nivel de riesgo",
      signal: "yellow" as SignalLevel,
      score: 55,
      summary:
        "Riesgo manejable si se prueba con bajo presupuesto, pero con dependencia operativa alta.",
    },
    {
      key: "timeFit",
      label: "Tiempo y operación",
      signal: "green" as SignalLevel,
      score: 82,
      summary:
        "Puede operarse en fines de semana sin conflicto inmediato con empleo actual.",
    },
    {
      key: "scalability",
      label: "Escalabilidad",
      signal: "yellow" as SignalLevel,
      score: 48,
      summary:
        "En su forma actual se comporta como autoempleo; escalar requeriría delegar o sistematizar.",
    },
  ],
  businessUnderstanding: {
    summary:
      "Entendemos que quieres iniciar un servicio de detailing móvil para clientes residenciales que buscan limpieza profunda de autos a domicilio, operando principalmente durante fines de semana.",
    targetCustomer: "Dueños de auto en zonas residenciales de clase media",
    problemSolved:
      "Falta de tiempo para llevar el auto a un detailing tradicional y deseo de un servicio premium en casa",
    whyWouldPay:
      "Conveniencia, ahorro de tiempo y resultado visible sin desplazarse",
    assumptions: [
      "Los clientes pagarían $1,200 MXN por servicio completo",
      "Puedes atender 4 servicios por fin de semana",
      "No necesitas permisos especiales para operar en la zona",
      "El equipo inicial es suficiente para entregar calidad consistente",
    ],
  },
  financialSnapshot: {
    currency: "MXN",
    capitalAvailable: 50_000,
    acceptableLoss: 15_000,
    initialInvestment: 28_000,
    pricePerSale: 1_200,
    variableCostPerSale: 700,
    estimatedMonthlySales: 16,
    fixedMonthlyCosts: 3_200,
    metrics: {
      grossMarginPerSale: 500,
      grossMarginPercentage: 41.7,
      monthlyGrossProfit: 8_000,
      monthlyNetProfit: 4_800,
      breakEvenSales: 7,
      paybackMonths: 3.5,
    },
    interpretation:
      "Con los datos proporcionados, la idea parece tener margen positivo. Sin embargo, la recuperación depende fuertemente de alcanzar al menos 7 ventas mensuales para cubrir costos fijos, por lo que la prioridad debe ser validar demanda real antes de invertir más capital.",
    warnings: [
      "La inversión inicial está dentro del capital disponible, pero representa el 56% del capital total.",
      "El margen neto mensual asume 16 servicios; aún no hay evidencia de que ese volumen sea alcanzable.",
    ],
  },
  strengths: [
    {
      title: "Baja barrera de entrada relativa",
      whyItMatters:
        "Permite probar la idea con inversión controlada antes de comprometer capital mayor.",
    },
    {
      title: "Operación sin local físico",
      whyItMatters:
        "Reduce costos fijos y facilita iniciar como actividad secundaria.",
    },
    {
      title: "Compatibilidad con fines de semana",
      whyItMatters:
        "Encaja con tu disponibilidad actual sin requerir dejar el empleo.",
    },
    {
      title: "Margen bruto positivo en papel",
      whyItMatters:
        "Si el precio y costos se confirman, cada servicio contribuye a cubrir gastos fijos.",
    },
  ],
  risks: [
    {
      title: "Canal de adquisición poco claro",
      whyItMatters:
        "Aunque el servicio tenga margen, sin una forma consistente de conseguir clientes el negocio puede estancarse.",
      howToReduce:
        "Hablar con 10 clientes potenciales y probar 2 canales (referidos y redes locales) antes de comprar más equipo.",
    },
    {
      title: "Demanda no validada",
      whyItMatters:
        "Planeas invertir capital sin haber confirmado disposición de pago real.",
      howToReduce:
        "Conseguir 3 compromisos de pago o reservas antes de ampliar la inversión.",
    },
    {
      title: "Dependencia del tiempo personal",
      whyItMatters:
        "Cada servicio adicional requiere tus horas; el crecimiento está ligado a tu disponibilidad.",
      howToReduce:
        "Documentar procesos desde el primer piloto y medir tiempo real por servicio.",
    },
    {
      title: "Margen real aún no confirmado",
      whyItMatters:
        "Productos, desplazamiento y tiempo no facturado pueden reducir el margen estimado.",
      howToReduce:
        "Cotizar insumos reales y ejecutar 3 servicios piloto con registro de costos.",
    },
  ],
  personalFit: {
    fits: [
      "Disfrutas trabajo práctico y orientado a resultados visibles",
      "Tienes comodidad moderada con venta directa",
      "Prefieres operar de forma independiente al inicio",
    ],
    frictions: [
      "Si evitas prospección activa, necesitarás un canal que no dependa solo de venta en frío",
      "La operación física puede ser exigente en días consecutivos",
    ],
    consideration:
      "La idea parece compatible con tu perfil si diseñas un proceso de captación que no dependa únicamente de prospección manual intensiva.",
  },
  timeAndOperation: {
    hoursPerWeek: "10–20 horas",
    schedule: "Fines de semana (sábado y domingo)",
    operationalLoad: "Media — cada servicio requiere desplazamiento y 2–3 horas",
    employmentCompatibility:
      "Compatible como side hustle; no recomendable como reemplazo de ingreso principal sin validación previa",
    analysis:
      "Esta idea puede probarse como actividad secundaria, pero todavía depende directamente de tu tiempo. Para que no se convierta en autoempleo intensivo, deberás documentar procesos desde el inicio.",
  },
  scalability: {
    category: "Autoempleo con potencial de pequeño negocio",
    type: "small_business" as const,
    analysis:
      "En su forma inicial, los ingresos crecerán principalmente si trabajas más horas. Para escalar, necesitarías estandarizar el servicio, capacitar ayuda o crear paquetes replicables.",
    signals: {
      delegatePotential: "Media — posible con checklist y capacitación",
      systematizePotential: "Media — procesos documentables",
      personalTimeDependency: "Alta",
    },
  },
  redFlags: [
    "No ha hablado con clientes potenciales",
    "Canal de adquisición poco claro",
    "Inversión inicial representa más del 50% del capital disponible",
    "Margen neto depende de volumen mensual no comprobado",
  ],
  validationPlan: [
    {
      week: 1,
      title: "Validar demanda",
      tasks: [
        "Hablar con 10 clientes potenciales en tu zona",
        "Investigar 5 competidores y sus precios",
        "Confirmar disposición de pago por el precio propuesto",
      ],
    },
    {
      week: 2,
      title: "Confirmar números",
      tasks: [
        "Cotizar costos reales de insumos y equipo",
        "Realizar 1 servicio piloto gratuito o con descuento",
        "Medir tiempo real por entrega incluyendo traslado",
      ],
    },
    {
      week: 3,
      title: "Probar adquisición",
      tasks: [
        "Probar canal de referidos con 3 contactos",
        "Publicar en grupo local o red social hiperlocal",
        "Conseguir al menos 2 reservas pagadas",
      ],
    },
    {
      week: 4,
      title: "Decidir siguiente paso",
      tasks: [
        "Revisar margen real vs. estimado",
        "Evaluar si el volumen semanal es sostenible",
        "Decidir si avanzar, ajustar precio/alcance o pausar",
      ],
    },
  ],
  riskCategories: [
    { category: "Riesgo financiero", level: "yellow" as SignalLevel, note: "Inversión dentro de límites pero con poco margen de error" },
    { category: "Riesgo operativo", level: "yellow" as SignalLevel, note: "Alta dependencia de tu tiempo y logística móvil" },
    { category: "Riesgo de mercado", level: "red" as SignalLevel, note: "Demanda y canal no validados" },
    { category: "Riesgo de dependencia", level: "yellow" as SignalLevel, note: "Dependencia de insumos y tu disponibilidad" },
    { category: "Riesgo personal", level: "green" as SignalLevel, note: "Encaja con perfil y horario actual" },
  ],
} as const;
