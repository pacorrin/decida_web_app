import type { EvalCase } from "../lib/case-types";
import { BASELINE_CASES } from "./baseline";

/**
 * 10 casos nuevos del Paso 4 (más los 5 de referencia = 15). Cubren México y
 * otros países, producto físico y digital, servicios, negocio ya existente y
 * dos ideas con muy poca información. Son realistas pero inventados.
 */
const NEW_CASES: EvalCase[] = [
  {
    id: "06-taller-bicicletas-guadalajara",
    kind: "negocio-local-mx",
    expectedMarket: "México · Guadalajara (zona Chapalita)",
    description:
      "Quiero abrir un taller de reparación y mantenimiento de bicicletas en Guadalajara, cerca de Chapalita, con venta de refacciones básicas. Yo soy mecánico de bicicletas desde hace años y hoy trabajo en una tienda ajena.",
    profile: { situation: "empleado", goal: "reemplazar_empleo", experience: "algo", capital: "50k_150k", acceptableLoss: "20k_50k", hoursPerWeek: "mas_40", schedule: "tiempo_completo", timeframe: "3_6_meses" },
    fit: { enjoyed: ["operar", "crear"], workPreference: "fisico", sales: 3, uncertainty: 3, process: 4, hiring: "solo" },
    financial: {
      initialInvestment: 110000,
      fixedCostsRange: "5k_15k",
      products: [
        { name: "Servicio de mantenimiento de bicicleta", kind: "servicio", price: 450, variableCost: 120, monthlyUnits: 70 },
        { name: "Refacciones y accesorios", kind: "producto", price: 300, variableCost: 180, monthlyUnits: 60 },
      ],
    },
    market: { customerEvidence: "4_10", competition: "media", channel: "referidos", dependencies: ["ubicacion", "inventario"], mainConcern: "Que los clientes de mi tienda actual no me sigan.", successCondition: "Ganar lo mismo que en mi empleo actual en ocho meses." },
  },
  {
    id: "07-saas-facturas-freelancers-mx",
    kind: "producto-digital",
    expectedMarket: "México (freelancers y pequeños negocios), venta en línea",
    description:
      "Quiero crear una app web que ayude a freelancers en México a emitir facturas CFDI y recordar cobros pendientes por WhatsApp. Cobraría una mensualidad. Soy desarrollador y la construiría yo.",
    profile: { situation: "empleado", goal: "reemplazar_empleo", experience: "algo", capital: "10k_50k", acceptableLoss: "5k_20k", hoursPerWeek: "10_20", schedule: "noches", timeframe: "mas_12_meses" },
    fit: { enjoyed: ["crear", "analizar"], workPreference: "digital", sales: 2, uncertainty: 3, process: 4, hiring: "solo" },
    financial: {
      initialInvestment: 30000,
      fixedCostsRange: "5k_15k",
      products: [{ name: "Suscripción mensual de la app", kind: "servicio", price: 199, variableCost: 25, monthlyUnits: 120 }],
    },
    market: { customerEvidence: "1_3", competition: "alta", channel: "redes_sociales", dependencies: ["plataforma"], mainConcern: "Que ya existan apps de facturación gratuitas o más baratas.", successCondition: "Llegar a 300 suscriptores de pago en 18 meses." },
  },
  {
    id: "08-foodtruck-bogota",
    kind: "otro-pais",
    expectedMarket: "Colombia · Bogotá",
    description:
      "Quiero montar un food truck de arepas rellenas en Bogotá, en zonas de oficinas y eventos de fin de semana. Ya tengo la receta y un cocinero de confianza; necesito comprar el camión y el equipo.",
    profile: { situation: "independiente", goal: "ingreso_extra", experience: "ninguna", capital: "50k_150k", acceptableLoss: "20k_50k", hoursPerWeek: "20_40", schedule: "flexible", timeframe: "3_6_meses" },
    fit: { enjoyed: ["operar", "vender"], workPreference: "fisico", sales: 4, uncertainty: 3, process: 3, hiring: "algunos" },
    financial: {
      initialInvestment: 120000,
      fixedCostsRange: "5k_15k",
      products: [{ name: "Arepa rellena con bebida", kind: "producto", price: 45, variableCost: 22, monthlyUnits: 900 }],
    },
    market: { customerEvidence: "ninguno", competition: "alta", channel: "presencial", dependencies: ["permiso", "ubicacion", "inventario"], mainConcern: "Conseguir los permisos y buenos puntos de venta.", successCondition: "Recuperar la inversión en 12 meses." },
  },
  {
    id: "09-ropa-sostenible-buenos-aires",
    kind: "otro-pais",
    expectedMarket: "Argentina · venta en línea a todo el país",
    description:
      "Quiero vender ropa sostenible hecha con telas recicladas desde una tienda en línea en Argentina, con envíos a todo el país. Trabajaría con dos talleres pequeños de confección de Buenos Aires.",
    profile: { situation: "estudiante", goal: "probar_idea", experience: "ninguna", capital: "10k_50k", acceptableLoss: "5k_20k", hoursPerWeek: "10_20", schedule: "flexible", timeframe: "6_12_meses" },
    fit: { enjoyed: ["crear", "vender"], workPreference: "mixto", sales: 3, uncertainty: 2, process: 3, hiring: "solo" },
    financial: {
      initialInvestment: 40000,
      fixedCostsRange: "5k_15k",
      products: [{ name: "Prenda de ropa sostenible", kind: "producto", price: 900, variableCost: 520, monthlyUnits: 40 }],
    },
    market: { customerEvidence: "ninguno", competition: "alta", channel: "redes_sociales", dependencies: ["proveedor", "inventario"], mainConcern: "Los costos de envío y la inflación en el precio de las telas.", successCondition: "Vender 40 prendas al mes sin perder dinero." },
  },
  {
    id: "10-consultoria-pymes-chile",
    kind: "servicio-profesional",
    expectedMarket: "Chile · pequeñas y medianas empresas",
    description:
      "Quiero ofrecer consultoría de finanzas y flujo de caja a pymes en Santiago de Chile. Soy contador con diez años de experiencia en empresas medianas y buscaría clientes con recomendaciones y LinkedIn.",
    profile: { situation: "empleado", goal: "reemplazar_empleo", experience: "algo", capital: "10k_50k", acceptableLoss: "5k_20k", hoursPerWeek: "5_10", schedule: "noches", timeframe: "6_12_meses" },
    fit: { enjoyed: ["analizar", "ensenar"], workPreference: "digital", sales: 3, uncertainty: 3, process: 4, hiring: "solo" },
    financial: {
      initialInvestment: 15000,
      fixedCostsRange: "menos_5k",
      products: [{ name: "Paquete mensual de consultoría financiera", kind: "servicio", price: 9000, variableCost: 500, monthlyUnits: 5 }],
    },
    market: { customerEvidence: "4_10", competition: "media", channel: "referidos", dependencies: ["cliente_unico"], mainConcern: "Cobrar lo que valgo sin una marca propia.", successCondition: "Tener cinco clientes mensuales en un año." },
  },
  {
    id: "11-turismo-rural-cusco",
    kind: "otro-pais",
    expectedMarket: "Perú · Cusco / Valle Sagrado (turistas)",
    description:
      "Quiero ofrecer experiencias de turismo rural de un día en comunidades del Valle Sagrado, en Cusco: talleres de tejido, cocina andina y caminata. Trabajaría con familias de la comunidad donde crecí y vendería a turistas por internet y agencias.",
    profile: { situation: "independiente", goal: "libertad_financiera", experience: "varios_intentos", capital: "10k_50k", acceptableLoss: "5k_20k", hoursPerWeek: "20_40", schedule: "flexible", timeframe: "6_12_meses" },
    fit: { enjoyed: ["liderar", "ensenar", "vender"], workPreference: "mixto", sales: 4, uncertainty: 4, process: 3, hiring: "equipo" },
    financial: {
      initialInvestment: 35000,
      fixedCostsRange: "5k_15k",
      products: [{ name: "Experiencia rural de un día por persona", kind: "servicio", price: 1100, variableCost: 600, monthlyUnits: 60 }],
    },
    market: { customerEvidence: "1_3", competition: "media", channel: "publicidad", dependencies: ["plataforma", "permiso"], mainConcern: "Depender de que las agencias nos incluyan y de la temporada alta.", successCondition: "Recibir 60 turistas al mes todo el año." },
  },
  {
    id: "12-panaderia-existente-segunda-sucursal",
    kind: "negocio-existente",
    expectedMarket: "México · Puebla (segunda sucursal)",
    description:
      "Tengo una panadería en Puebla que ya vende bien y quiero abrir una segunda sucursal en otra colonia de la ciudad. Mi hermano se encargaría de la nueva y yo seguiría en la primera.",
    profile: { situation: "negocio_actual", goal: "escalar_negocio", experience: "negocio_activo", capital: "150k_500k", acceptableLoss: "50k_100k", hoursPerWeek: "mas_40", schedule: "tiempo_completo", timeframe: "3_6_meses" },
    fit: { enjoyed: ["operar", "liderar"], workPreference: "fisico", sales: 4, uncertainty: 3, process: 4, hiring: "equipo" },
    financial: {
      initialInvestment: 320000,
      fixedCostsRange: "15k_30k",
      products: [
        { name: "Pan dulce y de sal", kind: "producto", price: 18, variableCost: 7, monthlyUnits: 6000 },
        { name: "Pasteles por encargo", kind: "producto", price: 450, variableCost: 200, monthlyUnits: 60 },
      ],
    },
    market: { customerEvidence: "ya_clientes", competition: "alta", channel: "presencial", dependencies: ["ubicacion", "inventario", "permiso"], mainConcern: "Que la calidad baje cuando yo no esté en el local.", successCondition: "Que la segunda sucursal iguale el 70% de las ventas de la primera en un año." },
  },
  {
    id: "13-app-vaga",
    kind: "poca-informacion",
    expectedMarket: "No especificado (la idea no indica mercado ni cliente)",
    description: "Una app para ayudar a las personas.",
    profile: { situation: "estudiante", goal: "probar_idea", experience: "ninguna", capital: "menos_10k", acceptableLoss: "menos_5k", hoursPerWeek: "5_10", schedule: "noches", timeframe: "mas_12_meses" },
    fit: { enjoyed: ["crear"], workPreference: "digital", sales: 2, uncertainty: 3, process: 3, hiring: "solo" },
    financial: {
      initialInvestment: 3000,
      fixedCostsRange: "menos_5k",
      products: [{ name: "App", kind: "servicio", price: 50, variableCost: 10, monthlyUnits: 40 }],
    },
    market: { customerEvidence: "ninguno", competition: "media", channel: "otro", dependencies: ["plataforma"], mainConcern: "No lo he pensado.", successCondition: "Que le sirva a la gente." },
  },
  {
    id: "14-tacos-latinos-houston",
    kind: "otro-pais",
    expectedMarket: "Estados Unidos · Houston (comunidad latina)",
    description:
      "Quiero abrir una taquería de barbacoa estilo Hidalgo en Houston, Texas, pensada para la comunidad mexicana que extraña el sabor de casa. Rentaría un local pequeño con cocina y mi familia me ayudaría con la operación.",
    profile: { situation: "independiente", goal: "reemplazar_empleo", experience: "algo", capital: "mas_500k", acceptableLoss: "mas_100k", hoursPerWeek: "mas_40", schedule: "tiempo_completo", timeframe: "6_12_meses" },
    fit: { enjoyed: ["operar", "liderar"], workPreference: "fisico", sales: 4, uncertainty: 3, process: 4, hiring: "equipo" },
    financial: {
      initialInvestment: 700000,
      fixedCostsRange: "mas_50k",
      products: [{ name: "Orden de tacos de barbacoa", kind: "producto", price: 180, variableCost: 70, monthlyUnits: 2500 }],
    },
    market: { customerEvidence: "mas_10", competition: "alta", channel: "referidos", dependencies: ["ubicacion", "permiso", "inventario"], mainConcern: "Los costos de renta y los permisos sanitarios en Texas.", successCondition: "Operar sin pérdidas desde el mes ocho." },
  },
  {
    id: "15-gadget-sin-demanda",
    kind: "idea-mala",
    expectedMarket: "México (producto físico vendido en línea)",
    description:
      "Quiero fabricar y vender un paraguas que se abre con un control remoto y trae un ventilador integrado, a 3,500 pesos. Lo mandaría a hacer a China y lo vendería en Mercado Libre. No he hablado con nadie, pero creo que a todos les va a encantar.",
    profile: { situation: "empleado", goal: "libertad_financiera", experience: "ninguna", capital: "50k_150k", acceptableLoss: "5k_20k", hoursPerWeek: "5_10", schedule: "noches", timeframe: "3_6_meses" },
    fit: { enjoyed: ["crear"], workPreference: "mixto", sales: 2, uncertainty: 2, process: 2, hiring: "solo" },
    financial: {
      initialInvestment: 140000,
      fixedCostsRange: "5k_15k",
      products: [{ name: "Paraguas con control remoto y ventilador", kind: "producto", price: 3500, variableCost: 2800, monthlyUnits: 20 }],
    },
    market: { customerEvidence: "ninguno", competition: "baja", channel: "otro", dependencies: ["proveedor", "plataforma", "inventario"], mainConcern: "Que el proveedor mande algo de baja calidad.", successCondition: "Hacerme rico." },
  },
];

export const ALL_CASES: EvalCase[] = [...BASELINE_CASES, ...NEW_CASES];
