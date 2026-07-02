export type SelectOption = { value: string; label: string };

export const COUNTRY_OPTIONS: SelectOption[] = [
  { value: "MX", label: "México" },
  { value: "CO", label: "Colombia" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "PE", label: "Perú" },
  { value: "ES", label: "España" },
  { value: "US", label: "Estados Unidos" },
  { value: "OTHER", label: "Otro" },
];

export const CURRENT_SITUATION_OPTIONS: SelectOption[] = [
  { value: "empleado", label: "Empleado con ingresos fijos" },
  { value: "independiente", label: "Independiente / freelancer" },
  { value: "estudiante", label: "Estudiante" },
  { value: "desempleado", label: "Desempleado" },
  { value: "negocio_actual", label: "Ya tengo un negocio" },
];

export const MAIN_GOAL_OPTIONS: SelectOption[] = [
  { value: "ingreso_extra", label: "Generar ingreso extra" },
  { value: "reemplazar_empleo", label: "Reemplazar mi empleo" },
  { value: "libertad_financiera", label: "Libertad financiera" },
  { value: "probar_idea", label: "Probar si la idea funciona" },
  { value: "escalar_negocio", label: "Escalar un negocio existente" },
];

export const EXPERIENCE_OPTIONS: SelectOption[] = [
  { value: "ninguna", label: "Ninguna experiencia emprendiendo" },
  { value: "algo", label: "Algo de experiencia" },
  { value: "varios_intentos", label: "Varios intentos previos" },
  { value: "negocio_activo", label: "Tengo o tuve un negocio activo" },
];

export const CAPITAL_RANGE_OPTIONS: SelectOption[] = [
  { value: "menos_10k", label: "Menos de $10,000 MXN" },
  { value: "10k_50k", label: "$10,000 – $50,000 MXN" },
  { value: "50k_150k", label: "$50,000 – $150,000 MXN" },
  { value: "150k_500k", label: "$150,000 – $500,000 MXN" },
  { value: "mas_500k", label: "Más de $500,000 MXN" },
];

export const LOSS_RANGE_OPTIONS: SelectOption[] = [
  { value: "menos_5k", label: "Menos de $5,000 MXN" },
  { value: "5k_20k", label: "$5,000 – $20,000 MXN" },
  { value: "20k_50k", label: "$20,000 – $50,000 MXN" },
  { value: "50k_100k", label: "$50,000 – $100,000 MXN" },
  { value: "mas_100k", label: "Más de $100,000 MXN" },
];

export const HOURS_RANGE_OPTIONS: SelectOption[] = [
  { value: "menos_5", label: "Menos de 5 horas" },
  { value: "5_10", label: "5 – 10 horas" },
  { value: "10_20", label: "10 – 20 horas" },
  { value: "20_40", label: "20 – 40 horas" },
  { value: "mas_40", label: "Más de 40 horas" },
];

export const SCHEDULE_OPTIONS: SelectOption[] = [
  { value: "fines_semana", label: "Fines de semana" },
  { value: "noches", label: "Noches entre semana" },
  { value: "mananas", label: "Mañanas" },
  { value: "flexible", label: "Horario flexible" },
  { value: "tiempo_completo", label: "Tiempo completo" },
];

export const INCOME_TIMEFRAME_OPTIONS: SelectOption[] = [
  { value: "1_3_meses", label: "1 – 3 meses" },
  { value: "3_6_meses", label: "3 – 6 meses" },
  { value: "6_12_meses", label: "6 – 12 meses" },
  { value: "mas_12_meses", label: "Más de 12 meses" },
];

export const ENJOYED_ACTIVITIES_OPTIONS: SelectOption[] = [
  { value: "vender", label: "Vender" },
  { value: "operar", label: "Operar / ejecutar" },
  { value: "crear", label: "Crear productos o servicios" },
  { value: "ensenar", label: "Enseñar" },
  { value: "analizar", label: "Analizar datos" },
  { value: "liderar", label: "Liderar equipos" },
];

export const WORK_PREFERENCE_OPTIONS: SelectOption[] = [
  { value: "fisico", label: "Trabajo físico" },
  { value: "digital", label: "Trabajo digital" },
  { value: "mixto", label: "Mixto" },
];

export const HIRING_PREFERENCE_OPTIONS: SelectOption[] = [
  { value: "solo", label: "Prefiero trabajar solo" },
  { value: "algunos", label: "Contrataría 1–2 personas" },
  { value: "equipo", label: "Me gustaría armar un equipo" },
];

export const COMFORT_SCALE_OPTIONS: SelectOption[] = [
  { value: "1", label: "1 — Muy incómodo" },
  { value: "2", label: "2" },
  { value: "3", label: "3 — Neutral" },
  { value: "4", label: "4" },
  { value: "5", label: "5 — Muy cómodo" },
];

export const PAYMENT_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    currency: "MXN",
    description: "Diagnóstico inmediato y reporte básico",
    available: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 299,
    currency: "MXN",
    description: "Reporte detallado + PDF + escenarios financieros",
    available: false,
  },
  {
    id: "expert",
    name: "Expert",
    price: 799,
    currency: "MXN",
    description: "Revisión personalizada + sesión de 30 min",
    available: false,
  },
] as const;
