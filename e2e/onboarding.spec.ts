import { test, expect, type Page } from "@playwright/test";

/**
 * E2E del onboarding de análisis de una idea de negocio (`/analizar`).
 *
 * El flujo es un wizard de 9 pasos (contacto → idea → confirmacion → pago →
 * perfil → recursos → ajuste → evaluacion → resultado) impulsado por Server
 * Actions. No hay endpoints REST que interceptar: el avance se verifica por el
 * cambio de URL y el contenido renderizado. Los pasos deben completarse en
 * orden porque un guard en el servidor redirige cualquier intento de saltar.
 *
 * No existen `data-testid`, así que los selectores usan `id`, `name`, roles y
 * texto (la UI está en español).
 *
 * El happy path corre parametrizado sobre varios GIROS DE NEGOCIO muy
 * distintos (ver `SCENARIOS`) para observar cómo se comporta la app con rubros,
 * márgenes, capital y validación de mercado diferentes.
 */

/** Valores válidos según `src/lib/onboarding/options.ts`. */
type Perfil = {
  currentSituation:
    | "empleado"
    | "independiente"
    | "estudiante"
    | "desempleado"
    | "negocio_actual";
  mainGoal:
    | "ingreso_extra"
    | "reemplazar_empleo"
    | "libertad_financiera"
    | "probar_idea"
    | "escalar_negocio";
  entrepreneurshipExperience:
    | "ninguna"
    | "algo"
    | "varios_intentos"
    | "negocio_activo";
};

type Recursos = {
  capitalAvailableRange:
    | "menos_10k"
    | "10k_50k"
    | "50k_150k"
    | "150k_500k"
    | "mas_500k";
  acceptableLossRange:
    | "menos_5k"
    | "5k_20k"
    | "20k_50k"
    | "50k_100k"
    | "mas_100k";
  hoursPerWeekRange: "menos_5" | "5_10" | "10_20" | "20_40" | "mas_40";
  availableSchedule:
    | "fines_semana"
    | "noches"
    | "mananas"
    | "flexible"
    | "tiempo_completo";
  expectedIncomeTimeframe:
    | "1_3_meses"
    | "3_6_meses"
    | "6_12_meses"
    | "mas_12_meses";
};

type Ajuste = {
  enjoyedActivities: Array<
    "vender" | "operar" | "crear" | "ensenar" | "analizar" | "liderar"
  >;
  workPreference: "fisico" | "digital" | "mixto";
  salesComfortScore: "1" | "2" | "3" | "4" | "5";
  uncertaintyComfortScore: "1" | "2" | "3" | "4" | "5";
  hiringPreference: "solo" | "algunos" | "equipo";
};

type Evaluacion = {
  initialInvestment: string;
  pricePerSale: string;
  variableCostPerSale: string;
  estimatedMonthlySales: string;
  fixedMonthlyCostsRange:
    | "menos_5k"
    | "5k_15k"
    | "15k_30k"
    | "30k_50k"
    | "mas_50k";
  hasTalkedToCustomers: "true" | "false";
  competitionLevel: "baja" | "media" | "alta";
  acquisitionChannel:
    | "redes_sociales"
    | "referidos"
    | "publicidad"
    | "presencial"
    | "otro";
  mainConcern: string;
  successCondition: string;
};

type Scenario = {
  nombre: string;
  idea: string;
  perfil: Perfil;
  recursos: Recursos;
  ajuste: Ajuste;
  evaluacion: Evaluacion;
};

/**
 * Giros de negocio deliberadamente distintos: servicio físico de alto capital,
 * SaaS B2B, servicio profesional freelance de bajo capital, e-commerce de
 * producto físico, educación digital y operación de alimentos a escala.
 */
const SCENARIOS: Scenario[] = [
  {
    nombre: "Cafetería de especialidad (retail físico)",
    idea:
      "Quiero abrir una cafetería de especialidad en una zona universitaria, " +
      "con granos de origen, repostería y opciones veganas, enfocada en " +
      "estudiantes y trabajadores remotos que buscan un lugar para estar.",
    perfil: {
      currentSituation: "empleado",
      mainGoal: "reemplazar_empleo",
      entrepreneurshipExperience: "ninguna",
    },
    recursos: {
      capitalAvailableRange: "150k_500k",
      acceptableLossRange: "50k_100k",
      hoursPerWeekRange: "mas_40",
      availableSchedule: "tiempo_completo",
      expectedIncomeTimeframe: "6_12_meses",
    },
    ajuste: {
      enjoyedActivities: ["operar", "vender"],
      workPreference: "fisico",
      salesComfortScore: "3",
      uncertaintyComfortScore: "3",
      hiringPreference: "algunos",
    },
    evaluacion: {
      initialInvestment: "280000",
      pricePerSale: "65",
      variableCostPerSale: "24",
      estimatedMonthlySales: "1600",
      fixedMonthlyCostsRange: "30k_50k",
      hasTalkedToCustomers: "false",
      competitionLevel: "alta",
      acquisitionChannel: "presencial",
      mainConcern:
        "La renta del local es alta y hay muchas cafeterías cerca; no sé si lograré suficiente tráfico.",
      successCondition:
        "Cubrir costos fijos y sacar un sueldo de 25,000 MXN al mes antes de un año.",
    },
  },
  {
    nombre: "SaaS de agenda para clínicas dentales (software B2B)",
    idea:
      "Una plataforma SaaS de agendamiento en línea con recordatorios " +
      "automáticos por WhatsApp para clínicas dentales pequeñas, cobrada como " +
      "suscripción mensual por consultorio.",
    perfil: {
      currentSituation: "independiente",
      mainGoal: "libertad_financiera",
      entrepreneurshipExperience: "algo",
    },
    recursos: {
      capitalAvailableRange: "10k_50k",
      acceptableLossRange: "5k_20k",
      hoursPerWeekRange: "20_40",
      availableSchedule: "flexible",
      expectedIncomeTimeframe: "mas_12_meses",
    },
    ajuste: {
      enjoyedActivities: ["crear", "analizar", "liderar"],
      workPreference: "digital",
      salesComfortScore: "3",
      uncertaintyComfortScore: "4",
      hiringPreference: "equipo",
    },
    evaluacion: {
      initialInvestment: "45000",
      pricePerSale: "899",
      variableCostPerSale: "90",
      estimatedMonthlySales: "35",
      fixedMonthlyCostsRange: "5k_15k",
      hasTalkedToCustomers: "true",
      competitionLevel: "media",
      acquisitionChannel: "redes_sociales",
      mainConcern:
        "Vender software a dentistas puede ser lento y la adopción de tecnología en consultorios chicos es baja.",
      successCondition:
        "Llegar a 100 clínicas suscritas y un ingreso recurrente de 80,000 MXN mensuales.",
    },
  },
  {
    nombre: "Consultoría freelance de marketing (servicios, bajo capital)",
    idea:
      "Ofrecer consultoría de marketing digital y gestión de campañas de " +
      "publicidad para PYMEs locales que quieren vender más por redes sociales " +
      "pero no tienen equipo interno.",
    perfil: {
      currentSituation: "independiente",
      mainGoal: "ingreso_extra",
      entrepreneurshipExperience: "varios_intentos",
    },
    recursos: {
      capitalAvailableRange: "menos_10k",
      acceptableLossRange: "menos_5k",
      hoursPerWeekRange: "10_20",
      availableSchedule: "noches",
      expectedIncomeTimeframe: "1_3_meses",
    },
    ajuste: {
      enjoyedActivities: ["vender", "ensenar", "analizar"],
      workPreference: "digital",
      salesComfortScore: "5",
      uncertaintyComfortScore: "3",
      hiringPreference: "solo",
    },
    evaluacion: {
      initialInvestment: "6000",
      pricePerSale: "12000",
      variableCostPerSale: "1500",
      estimatedMonthlySales: "4",
      fixedMonthlyCostsRange: "menos_5k",
      hasTalkedToCustomers: "true",
      competitionLevel: "alta",
      acquisitionChannel: "referidos",
      mainConcern:
        "Depender de pocos clientes y competir con muchas agencias que cobran más barato.",
      successCondition:
        "Cerrar 6 clientes recurrentes y facturar 60,000 MXN al mes trabajando medio tiempo.",
    },
  },
  {
    nombre: "Ropa sustentable en línea (e-commerce de producto)",
    idea:
      "Marca de ropa casual sustentable hecha con materiales reciclados, " +
      "vendida principalmente por una tienda en línea propia con envíos a todo " +
      "el país y ediciones limitadas.",
    perfil: {
      currentSituation: "empleado",
      mainGoal: "probar_idea",
      entrepreneurshipExperience: "ninguna",
    },
    recursos: {
      capitalAvailableRange: "50k_150k",
      acceptableLossRange: "20k_50k",
      hoursPerWeekRange: "5_10",
      availableSchedule: "fines_semana",
      expectedIncomeTimeframe: "6_12_meses",
    },
    ajuste: {
      enjoyedActivities: ["crear", "vender"],
      workPreference: "mixto",
      salesComfortScore: "3",
      uncertaintyComfortScore: "3",
      hiringPreference: "algunos",
    },
    evaluacion: {
      initialInvestment: "120000",
      pricePerSale: "780",
      variableCostPerSale: "360",
      estimatedMonthlySales: "110",
      fixedMonthlyCostsRange: "15k_30k",
      hasTalkedToCustomers: "false",
      competitionLevel: "alta",
      acquisitionChannel: "publicidad",
      mainConcern:
        "El costo de adquisición por publicidad puede comerse el margen y hay mucha competencia de fast fashion.",
      successCondition:
        "Vender de forma consistente 150 prendas al mes con margen sano y clientes que recompran.",
    },
  },
  {
    nombre: "Academia online de música (educación digital)",
    idea:
      "Academia en línea de clases de guitarra y piano para adultos " +
      "principiantes, con membresía mensual, clases en vivo grupales y una " +
      "biblioteca de lecciones grabadas.",
    perfil: {
      currentSituation: "estudiante",
      mainGoal: "ingreso_extra",
      entrepreneurshipExperience: "ninguna",
    },
    recursos: {
      capitalAvailableRange: "menos_10k",
      acceptableLossRange: "menos_5k",
      hoursPerWeekRange: "5_10",
      availableSchedule: "noches",
      expectedIncomeTimeframe: "3_6_meses",
    },
    ajuste: {
      enjoyedActivities: ["ensenar", "crear"],
      workPreference: "digital",
      salesComfortScore: "2",
      uncertaintyComfortScore: "4",
      hiringPreference: "solo",
    },
    evaluacion: {
      initialInvestment: "9000",
      pricePerSale: "499",
      variableCostPerSale: "40",
      estimatedMonthlySales: "70",
      fixedMonthlyCostsRange: "menos_5k",
      hasTalkedToCustomers: "true",
      competitionLevel: "media",
      acquisitionChannel: "redes_sociales",
      mainConcern:
        "La retención mensual de las membresías suele ser baja y hay mucho contenido gratis en YouTube.",
      successCondition:
        "Mantener 150 miembros activos pagando la membresía durante al menos 6 meses.",
    },
  },
  {
    nombre: "Meal-prep saludable a domicilio (operación de alimentos)",
    idea:
      "Servicio de preparación y entrega semanal de comida saludable " +
      "(meal prep) para profesionales ocupados que quieren comer bien sin " +
      "cocinar, con planes por suscripción.",
    perfil: {
      currentSituation: "negocio_actual",
      mainGoal: "escalar_negocio",
      entrepreneurshipExperience: "negocio_activo",
    },
    recursos: {
      capitalAvailableRange: "50k_150k",
      acceptableLossRange: "20k_50k",
      hoursPerWeekRange: "mas_40",
      availableSchedule: "tiempo_completo",
      expectedIncomeTimeframe: "3_6_meses",
    },
    ajuste: {
      enjoyedActivities: ["operar", "liderar", "vender"],
      workPreference: "fisico",
      salesComfortScore: "4",
      uncertaintyComfortScore: "3",
      hiringPreference: "equipo",
    },
    evaluacion: {
      initialInvestment: "95000",
      pricePerSale: "1200",
      variableCostPerSale: "560",
      estimatedMonthlySales: "85",
      fixedMonthlyCostsRange: "30k_50k",
      hasTalkedToCustomers: "true",
      competitionLevel: "media",
      acquisitionChannel: "redes_sociales",
      mainConcern:
        "La logística de entrega y la merma de alimentos frescos pueden reducir mucho el margen al escalar.",
      successCondition:
        "Llegar a 200 suscripciones semanales manteniendo una operación rentable y estable.",
    },
  },
];

/** Correo único por corrida para no chocar con datos previos. */
function uniqueEmail(): string {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  return `e2e.onboarding+${stamp}@decida.test`;
}

async function completarContacto(page: Page): Promise<void> {
  await test.step("Paso 1 · Contacto", async () => {
    await page.goto("/analizar");
    await expect(page).toHaveURL(/\/analizar\/contacto/);
    await expect(
      page.getByRole("heading", { name: "Empecemos con lo básico" })
    ).toBeVisible();

    await page.fill("#name", "Ana Emprendedora");
    await page.fill("#email", uniqueEmail());
    await page.fill("#phone", "5512345678");
    await page.selectOption("#country", "MX");
    await page.check("#acceptedTerms");

    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/idea/, { timeout: 30_000 });
  });
}

async function completarIdea(page: Page, scenario: Scenario): Promise<void> {
  await test.step("Paso 2 · Idea", async () => {
    await expect(
      page.getByRole("heading", { name: "Cuéntanos tu idea de negocio" })
    ).toBeVisible();

    await page.fill("#description", scenario.idea);

    await page.getByRole("button", { name: "Continuar" }).click();
    // La generación del resumen (IA o fallback) ocurre antes del redirect.
    await expect(page).toHaveURL(/\/analizar\/confirmacion/, {
      timeout: 45_000,
    });
  });
}

async function completarConfirmacion(page: Page): Promise<void> {
  await test.step("Paso 3 · Confirmación de la idea", async () => {
    await expect(
      page.getByRole("heading", { name: "Así entendimos tu idea" })
    ).toBeVisible();
    // El texto del botón varía ("Confirmar y continuar" / "Confirmar — es correcto").
    await page.getByRole("button", { name: /Confirmar/ }).click();
    await expect(page).toHaveURL(/\/analizar\/pago/, { timeout: 30_000 });
  });
}

async function completarPago(page: Page): Promise<void> {
  await test.step("Paso 4 · Pago simulado (beta)", async () => {
    await expect(page.getByText(/pago\s+simulado/i)).toBeVisible();
    await page
      .getByRole("button", { name: /Continuar y obtener mi análisis/ })
      .click();
    await expect(page).toHaveURL(/\/analizar\/perfil/, { timeout: 30_000 });
  });
}

async function completarPerfil(page: Page, scenario: Scenario): Promise<void> {
  await test.step("Paso 5 · Perfil", async () => {
    await page.selectOption("#currentSituation", scenario.perfil.currentSituation);
    await page.selectOption("#mainGoal", scenario.perfil.mainGoal);
    await page.selectOption(
      "#entrepreneurshipExperience",
      scenario.perfil.entrepreneurshipExperience
    );

    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/recursos/, { timeout: 30_000 });
  });
}

async function completarRecursos(page: Page, scenario: Scenario): Promise<void> {
  await test.step("Paso 6 · Recursos", async () => {
    const r = scenario.recursos;
    await page.selectOption("#capitalAvailableRange", r.capitalAvailableRange);
    await page.selectOption("#acceptableLossRange", r.acceptableLossRange);
    await page.selectOption("#hoursPerWeekRange", r.hoursPerWeekRange);
    await page.selectOption("#availableSchedule", r.availableSchedule);
    await page.selectOption("#expectedIncomeTimeframe", r.expectedIncomeTimeframe);

    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/ajuste/, { timeout: 30_000 });
  });
}

async function completarAjuste(page: Page, scenario: Scenario): Promise<void> {
  await test.step("Paso 7 · Ajuste personal", async () => {
    const a = scenario.ajuste;
    // Al menos una actividad es obligatoria.
    for (const actividad of a.enjoyedActivities) {
      await page
        .locator(`input[name="enjoyedActivities"][value="${actividad}"]`)
        .check();
    }

    await page.selectOption("#workPreference", a.workPreference);
    await page.selectOption("#salesComfortScore", a.salesComfortScore);
    await page.selectOption("#uncertaintyComfortScore", a.uncertaintyComfortScore);
    await page.selectOption("#hiringPreference", a.hiringPreference);
    // processComfortScore ya viene con "3" por defecto.

    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/evaluacion/, { timeout: 30_000 });
  });
}

async function completarEvaluacion(page: Page, scenario: Scenario): Promise<void> {
  await test.step("Paso 8 · Evaluación (números y mercado)", async () => {
    const e = scenario.evaluacion;
    await page.fill("#initialInvestment", e.initialInvestment);
    await page.fill("#pricePerSale", e.pricePerSale);
    await page.fill("#variableCostPerSale", e.variableCostPerSale);
    await page.fill("#estimatedMonthlySales", e.estimatedMonthlySales);
    await page.selectOption("#fixedMonthlyCostsRange", e.fixedMonthlyCostsRange);

    await page.selectOption("#hasTalkedToCustomers", e.hasTalkedToCustomers);
    await page.selectOption("#competitionLevel", e.competitionLevel);
    await page.selectOption("#acquisitionChannel", e.acquisitionChannel);

    await page.fill("#mainConcern", e.mainConcern);
    await page.fill("#successCondition", e.successCondition);

    await page.getByRole("button", { name: "Obtener mi diagnóstico" }).click();

    // El scoring (modelo de razonamiento) + generación del reporte (9 llamadas
    // a OpenAI) corre de forma síncrona antes del redirect, así que puede
    // tardar bastante cuando hay OPENAI_API_KEY.
    await expect(page).toHaveURL(/\/analizar\/resultado/, { timeout: 150_000 });
  });
}

async function verificarResultado(page: Page): Promise<void> {
  await test.step("Paso 9 · Resultado / diagnóstico", async () => {
    await expect(
      page.getByRole("heading", {
        name: "Tu diagnóstico de viabilidad",
        level: 1,
      })
    ).toBeVisible();

    // Cuando el reporte está listo aparece la sección de feedback (solo se
    // renderiza si existe el reporte). La página puede auto-refrescarse.
    await expect(
      page.getByRole("heading", { name: "¿Te fue útil este diagnóstico?" })
    ).toBeVisible({ timeout: 60_000 });

    // Y al menos una de las secciones del reporte.
    await expect(
      page.getByRole("heading", { name: "Semáforos por dimensión" })
    ).toBeVisible();

    // No debe caer en el estado de error de generación.
    await expect(
      page.getByRole("heading", { name: "Error al generar tu reporte" })
    ).toHaveCount(0);
  });
}

async function enviarFeedback(page: Page): Promise<void> {
  await test.step("Feedback del diagnóstico", async () => {
    // Los radios son sr-only; se marcan con force.
    await page
      .getByRole("radio", { name: "5 — Muy útil" })
      .check({ force: true });
    await page.fill(
      "#feedback-comment",
      "Muy claro y accionable, me ayudó a entender los números."
    );
    await page
      .getByRole("radio", { name: "Sí, la recomendaría" })
      .check({ force: true });

    await page.getByRole("button", { name: "Enviar feedback" }).click();

    await expect(page.getByText("¡Gracias por tu opinión!")).toBeVisible({
      timeout: 15_000,
    });
  });
}

test.describe("Onboarding de análisis de idea — múltiples giros", () => {
  for (const scenario of SCENARIOS) {
    test(`genera diagnóstico para: ${scenario.nombre}`, async ({ page }) => {
      await completarContacto(page);
      await completarIdea(page, scenario);
      await completarConfirmacion(page);
      await completarPago(page);
      await completarPerfil(page, scenario);
      await completarRecursos(page, scenario);
      await completarAjuste(page, scenario);
      await completarEvaluacion(page, scenario);
      await verificarResultado(page);
      await enviarFeedback(page);
    });
  }

  test("el paso de contacto valida los datos requeridos", async ({ page }) => {
    await page.goto("/analizar/contacto");
    await expect(page).toHaveURL(/\/analizar\/contacto/);

    // Email válido (para pasar la validación nativa del navegador) pero
    // teléfono demasiado corto: el server action debe rechazar el envío.
    await page.fill("#name", "Ana");
    await page.fill("#email", uniqueEmail());
    await page.fill("#phone", "123"); // < 8 caracteres
    await page.selectOption("#country", "MX");
    await page.check("#acceptedTerms");

    await page.getByRole("button", { name: "Continuar" }).click();

    // Sigue en contacto y muestra el error de validación del servidor.
    await expect(page).toHaveURL(/\/analizar\/contacto/);
    await expect(page.getByText("Ingresa un teléfono válido")).toBeVisible();
  });
});
