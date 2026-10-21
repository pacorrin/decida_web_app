import type { EvalCase } from "../lib/case-types";

/**
 * Los 5 casos de referencia (Paso 1). Cubren: negocio local en México,
 * producto digital, audiencia internacional, poca información inicial y una
 * idea claramente mala. Son realistas pero inventados.
 */
export const BASELINE_CASES: EvalCase[] = [
  {
    id: "01-cafeteria-roma-norte",
    kind: "negocio-local-mx",
    expectedMarket: "México · Ciudad de México (Roma Norte)",
    description:
      "Quiero abrir una cafetería de especialidad con pan artesanal en la colonia Roma Norte de la Ciudad de México. Tendría un local pequeño rentado, café de productores mexicanos y pan horneado en el mismo lugar. Atendería yo con dos baristas de medio tiempo.",
    profile: {
      situation: "empleado",
      goal: "reemplazar_empleo",
      experience: "algo",
      capital: "150k_500k",
      acceptableLoss: "50k_100k",
      hoursPerWeek: "mas_40",
      schedule: "tiempo_completo",
      timeframe: "6_12_meses",
    },
    fit: {
      enjoyed: ["operar", "crear", "vender"],
      workPreference: "fisico",
      sales: 4,
      uncertainty: 3,
      process: 4,
      hiring: "algunos",
    },
    financial: {
      initialInvestment: 380000,
      fixedCostsRange: "30k_50k",
      products: [
        { name: "Café de especialidad", kind: "producto", price: 65, variableCost: 20, monthlyUnits: 1500 },
        { name: "Pan artesanal", kind: "producto", price: 55, variableCost: 24, monthlyUnits: 700 },
      ],
    },
    market: {
      customerEvidence: "4_10",
      competition: "alta",
      channel: "presencial",
      dependencies: ["ubicacion", "permiso", "inventario"],
      mainConcern: "Que la renta del local se coma el margen antes de tener clientes fijos.",
      successCondition: "Cubrir todos los costos fijos en el mes seis y poder dejar mi empleo en un año.",
    },
  },
  {
    id: "02-plantillas-notion",
    kind: "producto-digital",
    expectedMarket: "Hispanohablantes (México y Latinoamérica), venta en línea",
    description:
      "Quiero vender plantillas de Notion para diseñadores freelance (cotizaciones, seguimiento de proyectos y facturación) en Gumroad. Las haría yo en mis ratos libres y las promovería en Instagram y LinkedIn.",
    profile: {
      situation: "empleado",
      goal: "ingreso_extra",
      experience: "ninguna",
      capital: "menos_10k",
      acceptableLoss: "menos_5k",
      hoursPerWeek: "5_10",
      schedule: "noches",
      timeframe: "3_6_meses",
    },
    fit: {
      enjoyed: ["crear", "analizar"],
      workPreference: "digital",
      sales: 2,
      uncertainty: 3,
      process: 5,
      hiring: "solo",
    },
    financial: {
      initialInvestment: 2500,
      fixedCostsRange: "menos_5k",
      products: [
        { name: "Paquete de plantillas de Notion para freelancers", kind: "producto", price: 350, variableCost: 35, monthlyUnits: 30 },
      ],
    },
    market: {
      customerEvidence: "ninguno",
      competition: "alta",
      channel: "redes_sociales",
      dependencies: ["plataforma"],
      mainConcern: "Que haya demasiadas plantillas gratis y nadie pague por las mías.",
      successCondition: "Vender 30 paquetes al mes de forma constante durante seis meses.",
    },
  },
  {
    id: "03-curso-ingles-ingenieros",
    kind: "audiencia-internacional",
    expectedMarket:
      "Latinoamérica (ingenieros) orientada a empleadores de Estados Unidos; curso en español con contenido en inglés",
    description:
      "Quiero crear un curso en línea para ingenieros de software de Latinoamérica que quieren conseguir trabajo remoto con empresas de Estados Unidos: preparación de entrevistas en inglés, cómo armar el currículum y cómo negociar un salario en dólares. Lo vendería por internet con clases grabadas y una sesión en vivo al mes.",
    profile: {
      situation: "independiente",
      goal: "ingreso_extra",
      experience: "algo",
      capital: "10k_50k",
      acceptableLoss: "5k_20k",
      hoursPerWeek: "10_20",
      schedule: "flexible",
      timeframe: "6_12_meses",
    },
    fit: {
      enjoyed: ["ensenar", "crear"],
      workPreference: "digital",
      sales: 3,
      uncertainty: 4,
      process: 3,
      hiring: "algunos",
    },
    financial: {
      initialInvestment: 45000,
      fixedCostsRange: "5k_15k",
      products: [
        { name: "Curso en línea con sesión mensual en vivo", kind: "servicio", price: 4500, variableCost: 450, monthlyUnits: 15 },
      ],
    },
    market: {
      customerEvidence: "1_3",
      competition: "alta",
      channel: "redes_sociales",
      dependencies: ["plataforma"],
      mainConcern: "No sé si ingenieros de otros países confiarán en un curso de alguien sin una marca conocida.",
      successCondition: "Llegar a 15 alumnos nuevos cada mes y que al menos tres consigan una oferta de trabajo.",
    },
  },
  {
    id: "04-comida-para-llevar-vaga",
    kind: "poca-informacion",
    expectedMarket: "No especificado (la idea no indica ubicación ni cliente)",
    description: "Quiero hacer algo con comida para llevar.",
    profile: {
      situation: "desempleado",
      goal: "ingreso_extra",
      experience: "ninguna",
      capital: "menos_10k",
      acceptableLoss: "menos_5k",
      hoursPerWeek: "20_40",
      schedule: "flexible",
      timeframe: "1_3_meses",
    },
    fit: {
      enjoyed: ["operar"],
      workPreference: "fisico",
      sales: 3,
      uncertainty: 3,
      process: 3,
      hiring: "solo",
    },
    financial: {
      initialInvestment: 5000,
      fixedCostsRange: "menos_5k",
      products: [
        { name: "Comida para llevar", kind: "producto", price: 80, variableCost: 50, monthlyUnits: 100 },
      ],
    },
    market: {
      customerEvidence: "ninguno",
      competition: "media",
      channel: "otro",
      dependencies: [],
      mainConcern: "No sé.",
      successCondition: "Ganar dinero.",
    },
  },
  {
    id: "05-tienda-de-cassettes",
    kind: "idea-mala",
    expectedMarket: "México · Querétaro (centro comercial)",
    description:
      "Quiero abrir una tienda física en un centro comercial de Querétaro que venda únicamente cassettes de audio nuevos de música pop de los noventa. Rentaría un local grande de 120 metros cuadrados y los compraría a un solo distribuidor que los importa.",
    profile: {
      situation: "empleado",
      goal: "reemplazar_empleo",
      experience: "ninguna",
      capital: "menos_10k",
      acceptableLoss: "menos_5k",
      hoursPerWeek: "10_20",
      schedule: "fines_semana",
      timeframe: "1_3_meses",
    },
    fit: {
      enjoyed: ["vender"],
      workPreference: "fisico",
      sales: 2,
      uncertainty: 1,
      process: 2,
      hiring: "algunos",
    },
    financial: {
      initialInvestment: 400000,
      fixedCostsRange: "30k_50k",
      products: [
        { name: "Cassette de audio nuevo", kind: "producto", price: 120, variableCost: 150, monthlyUnits: 15 },
      ],
    },
    market: {
      customerEvidence: "ninguno",
      competition: "baja",
      channel: "presencial",
      dependencies: ["proveedor", "ubicacion", "inventario"],
      mainConcern: "Que la gente no entre a la tienda.",
      successCondition: "Que se vuelva viral y vendamos miles de cassettes.",
    },
  },
];
