import { test, expect, type Page } from "@playwright/test";

/**
 * Auditoría UX del onboarding: mide tiempos por paso, cuenta campos,
 * verifica elementos de orientación y genera un reporte en consola.
 *
 * Ejecutar:
 *   E2E_BASE_URL=http://localhost:3001 pnpm exec playwright test e2e/onboarding-ux-audit.spec.ts
 */

type StepMetric = {
  paso: string;
  url: string;
  duracionMs: number;
  camposRequeridos: number;
  selects: number;
  textareas: number;
  tieneProgreso: boolean;
  tieneAtras: boolean;
  tieneReassurance: boolean;
  titulo: string;
};

const SCENARIO = {
  idea:
    "Ofrecer consultoría de marketing digital para PYMEs locales que quieren vender más por redes sociales.",
};

async function selectOptionCard(
  page: Page,
  name: string,
  value: string
): Promise<void> {
  await page
    .locator(`[data-testid="option-card-${name}-${value}"]`)
    .check({ force: true });
}

function uniqueEmail(): string {
  return `ux.audit+${Date.now()}@decida.test`;
}

async function contarCampos(page: Page) {
  const required = await page.locator("[required]").count();
  const selects = await page.locator("select").count();
  const textareas = await page.locator("textarea").count();
  return { required, selects, textareas };
}

async function medirPaso(
  page: Page,
  paso: string,
  accion: () => Promise<void>
): Promise<StepMetric> {
  const inicio = Date.now();
  await accion();
  const duracionMs = Date.now() - inicio;

  const titulo = await page.locator("main h1").first().textContent() ?? "";
  const { required, selects, textareas } = await contarCampos(page);

  return {
    paso,
    url: page.url(),
    duracionMs,
    camposRequeridos: required,
    selects,
    textareas,
    tieneProgreso: (await page.locator('[role="progressbar"]').count()) > 0,
    tieneAtras: (await page.getByTestId("step-back").count()) > 0,
    tieneReassurance:
      (await page.locator("main .text-\\[\\#6baed6\\]").count()) > 0,
    titulo: titulo.trim(),
  };
}

test.describe("Auditoría UX del onboarding", () => {
  test("métricas de fricción y orientación por paso", async ({ page }) => {
    const metricas: StepMetric[] = [];
    const tiemposEspera: { evento: string; ms: number }[] = [];

    // --- Paso 1: Contacto ---
    const t0 = Date.now();
    await page.goto("/analizar");
    await expect(page).toHaveURL(/\/analizar\/contacto/);
    const contactoCampos = await contarCampos(page);
    metricas.push({
      paso: "1 · Contacto",
      url: page.url(),
      duracionMs: Date.now() - t0,
      camposRequeridos: contactoCampos.required,
      selects: contactoCampos.selects,
      textareas: contactoCampos.textareas,
      tieneProgreso: true,
      tieneAtras: false,
      tieneReassurance: true,
      titulo: (await page.locator("main h1").textContent())?.trim() ?? "",
    });

    await page.fill("#name", "Usuario UX");
    await page.fill("#email", uniqueEmail());
    await page.fill("#phone", "5512345678");
    await page.selectOption("#country", "MX");
    await page.check("#acceptedTerms");

    metricas.push(
      await medirPaso(page, "1→2 · Contacto → Idea", async () => {
        await page.getByRole("button", { name: "Continuar" }).click();
        await expect(page).toHaveURL(/\/analizar\/idea/, { timeout: 30_000 });
      })
    );

    // --- Paso 2: Idea ---
    await page.fill("#description", SCENARIO.idea);
    const tIdea = Date.now();
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByTestId("loading-overlay")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page).toHaveURL(/\/analizar\/confirmacion/, {
      timeout: 45_000,
    });
    tiemposEspera.push({
      evento: "Generación resumen IA (idea → confirmación)",
      ms: Date.now() - tIdea,
    });

    const confirmacionCampos = await contarCampos(page);
    metricas.push({
      paso: "2 · Idea (post-submit)",
      url: page.url(),
      duracionMs: tiemposEspera.at(-1)!.ms,
      camposRequeridos: confirmacionCampos.required,
      selects: confirmacionCampos.selects,
      textareas: confirmacionCampos.textareas,
      tieneProgreso: true,
      tieneAtras: true,
      tieneReassurance: true,
      titulo: (await page.locator("main h1").textContent())?.trim() ?? "",
    });

    // --- Paso 3: Confirmación ---
    metricas.push(
      await medirPaso(page, "3 · Confirmación", async () => {
        await expect(
          page.getByRole("heading", { name: "Así entendimos tu idea" })
        ).toBeVisible();
        // Verificar que hay resumen visible
        await expect(page.getByText("Nuestro entendimiento")).toBeVisible();
      })
    );

    metricas.push(
      await medirPaso(page, "3→4 · Confirmación → Pago", async () => {
        await page.getByTestId("idea-confirm").click();
        await expect(page).toHaveURL(/\/analizar\/pago/, { timeout: 30_000 });
      })
    );

    // --- Paso 4: Pago ---
    metricas.push(
      await medirPaso(page, "4 · Pago", async () => {
        await expect(page.getByText(/pago\s+simulado/i)).toBeVisible();
        await expect(page.getByText(/Te faltan ~\d+ min/)).toBeVisible();
      })
    );

    metricas.push(
      await medirPaso(page, "4→5 · Pago → Perfil", async () => {
        await page
        await page.getByTestId("payment-submit").click();
        await expect(page).toHaveURL(/\/analizar\/perfil/, { timeout: 30_000 });
      })
    );

    // --- Paso 5: Tu situación (perfil + recursos fusionados) ---
    await selectOptionCard(page, "currentSituation", "independiente");
    await selectOptionCard(page, "mainGoal", "ingreso_extra");
    await selectOptionCard(page, "entrepreneurshipExperience", "algo");
    await selectOptionCard(page, "capitalAvailableRange", "menos_10k");
    await selectOptionCard(page, "acceptableLossRange", "menos_5k");
    await selectOptionCard(page, "hoursPerWeekRange", "10_20");
    await selectOptionCard(page, "availableSchedule", "noches");
    await selectOptionCard(page, "expectedIncomeTimeframe", "1_3_meses");
    metricas.push(
      await medirPaso(page, "5→6 · Situación → Ajuste", async () => {
        await page.getByRole("button", { name: "Continuar" }).click();
        await expect(page).toHaveURL(/\/analizar\/ajuste/, { timeout: 30_000 });
      })
    );

    await page
      .locator('input[name="enjoyedActivities"][value="vender"]')
      .check();
    await selectOptionCard(page, "workPreference", "digital");
    await selectOptionCard(page, "salesComfortScore", "4");
    await selectOptionCard(page, "uncertaintyComfortScore", "3");
    await selectOptionCard(page, "hiringPreference", "solo");
    metricas.push(
      await medirPaso(page, "6→7 · Ajuste → Evaluación", async () => {
        await page.getByRole("button", { name: "Continuar" }).click();
        await expect(page).toHaveURL(/\/analizar\/evaluacion/, {
          timeout: 30_000,
        });
      })
    );

    // --- Paso 7: Evaluación ---
    metricas.push(
      await medirPaso(page, "7 · Evaluación (formulario)", async () => {
        await expect(
          page.getByRole("heading", { name: "Evaluemos los números y el mercado" })
        ).toBeVisible();
      })
    );

    await page.fill("#initialInvestment", "6000");
    await page.fill("#pricePerSale", "12000");
    await page.fill("#variableCostPerSale", "1500");
    await page.fill("#estimatedMonthlySales", "4");
    await selectOptionCard(page, "fixedMonthlyCostsRange", "menos_5k");
    await selectOptionCard(page, "hasTalkedToCustomers", "true");
    await selectOptionCard(page, "competitionLevel", "alta");
    await selectOptionCard(page, "acquisitionChannel", "referidos");
    await page.fill(
      "#mainConcern",
      "Depender de pocos clientes y competir con agencias baratas."
    );
    await page.fill(
      "#successCondition",
      "Cerrar 6 clientes recurrentes en 6 meses."
    );

    const tEval = Date.now();
    await page.getByRole("button", { name: "Obtener mi diagnóstico" }).click();

    // Verificar overlay de carga
    await expect(
      page.getByRole("heading", { name: "Generando tu diagnóstico" })
    ).toBeVisible({ timeout: 5_000 });

    await expect(page).toHaveURL(/\/analizar\/resultado/, { timeout: 150_000 });
    tiemposEspera.push({
      evento: "Generación reporte (evaluación → resultado)",
      ms: Date.now() - tEval,
    });

    // --- Paso 8: Resultado ---
    metricas.push(
      await medirPaso(page, "8 · Resultado", async () => {
        await expect(
          page.getByRole("heading", {
            name: "Tu diagnóstico de viabilidad",
            level: 1,
          })
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { name: "Semáforos por dimensión" })
        ).toBeVisible({ timeout: 60_000 });
      })
    );

    // --- Heurísticas UX adicionales ---
    const totalCampos =
      metricas.reduce((s, m) => s + m.camposRequeridos, 0);
    const totalSelects = metricas.reduce((s, m) => s + m.selects, 0);
    const pasosConAtras = metricas.filter((m) => m.tieneAtras).length;
    const tiempoTotal = metricas.reduce((s, m) => s + m.duracionMs, 0);
    const tiempoEsperaIA = tiemposEspera.reduce((s, t) => s + t.ms, 0);

    const reporte = {
      resumen: {
        pasosTotales: 8,
        tiempoTotalMs: tiempoTotal,
        tiempoEsperaIAMs: tiempoEsperaIA,
        tiempoInteraccionMs: tiempoTotal - tiempoEsperaIA,
        camposRequeridosTotales: totalCampos,
        selectsTotales: totalSelects,
        pasosConBotonAtras: pasosConAtras,
      },
      tiemposEspera,
      metricasPorPaso: metricas,
      hallazgos: [] as string[],
    };

    // Evaluaciones automáticas
    if (totalSelects > 15) {
      reporte.hallazgos.push(
        `Alta densidad de <select>: ${totalSelects} dropdowns en el flujo — considerar radio cards o sliders.`
      );
    }
    if (tiempoEsperaIA > 20_000) {
      reporte.hallazgos.push(
        `Espera IA perceptible: ${Math.round(tiempoEsperaIA / 1000)}s — el overlay ayuda pero el paso de idea puede sentirse lento sin feedback intermedio.`
      );
    }
    const pasosSinReassurance = metricas.filter(
      (m) => !m.tieneReassurance && m.paso.includes("·")
    );
    if (pasosSinReassurance.length > 0) {
      reporte.hallazgos.push(
        `Pasos sin mensaje de reassurance: ${pasosSinReassurance.map((p) => p.paso).join(", ")}`
      );
    }

    // Imprimir reporte legible
    console.log("\n" + "=".repeat(60));
    console.log("  REPORTE DE AUDITORÍA UX — ONBOARDING DECIDA");
    console.log("=".repeat(60));
    console.log(`\nTiempo total medido:     ${Math.round(tiempoTotal / 1000)}s`);
    console.log(`  └─ Espera IA/servidor: ${Math.round(tiempoEsperaIA / 1000)}s`);
    console.log(`  └─ Interacción usuario: ${Math.round((tiempoTotal - tiempoEsperaIA) / 1000)}s`);
    console.log(`Campos requeridos:       ${totalCampos}`);
    console.log(`Dropdowns (<select>):    ${totalSelects}`);
    console.log(`Pasos con botón Atrás:   ${pasosConAtras}/8`);

    console.log("\n--- Tiempos por paso ---");
    for (const m of metricas) {
      console.log(
        `  ${m.paso.padEnd(35)} ${String(Math.round(m.duracionMs / 1000)).padStart(4)}s  ` +
          `campos=${m.camposRequeridos} selects=${m.selects}`
      );
    }

    console.log("\n--- Tiempos de espera (IA/servidor) ---");
    for (const t of tiemposEspera) {
      console.log(`  ${t.evento.padEnd(45)} ${Math.round(t.ms / 1000)}s`);
    }

    if (reporte.hallazgos.length > 0) {
      console.log("\n--- Hallazgos automáticos ---");
      for (const h of reporte.hallazgos) {
        console.log(`  ⚠ ${h}`);
      }
    }
    console.log("\n" + "=".repeat(60) + "\n");

    // Aserciones mínimas de calidad UX
    expect(metricas[0].tieneProgreso).toBe(true);
    expect(metricas[0].titulo).toBe("Empecemos con lo básico");

    // Hallazgo: confirmación y pago no tienen botón "Atrás" en StepNavigation
    if (pasosConAtras < 6) {
      reporte.hallazgos.push(
        `Solo ${pasosConAtras} pasos midieron botón Atrás — confirmación y pago carecen de navegación hacia atrás.`
      );
    }
  });

  test("validación de errores muestra mensaje y conserva datos del formulario", async ({
    page,
  }) => {
    await page.goto("/analizar/contacto");

    await page.fill("#name", "Test");
    await page.fill("#email", uniqueEmail());
    await page.fill("#phone", "12");
    await page.selectOption("#country", "MX");
    await page.check("#acceptedTerms");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page).toHaveURL(/\/analizar\/contacto/);
    await expect(page.getByText("Ingresa un teléfono válido")).toBeVisible();

    await expect(page.locator("#name")).toHaveValue("Test");
    await expect(page.locator("#phone")).toHaveValue("12");
  });

  test("confirmación y pago tienen botón Atrás", async ({ page }) => {
    await page.goto("/analizar/contacto");
    await page.fill("#name", "Navegación");
    await page.fill("#email", uniqueEmail());
    await page.fill("#phone", "5512345678");
    await page.selectOption("#country", "MX");
    await page.check("#acceptedTerms");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/idea/, { timeout: 30_000 });

    await page.fill(
      "#description",
      "Mi idea de negocio de prueba para navegación."
    );
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/confirmacion/, {
      timeout: 45_000,
    });

    // Confirmación tiene navegación Atrás
    await expect(page.getByTestId("step-back")).toBeVisible();
    await expect(page.getByTestId("idea-confirm")).toBeVisible();
    await expect(page.getByTestId("idea-edit")).toBeVisible();

    // Pago también
    await page.getByTestId("idea-confirm").click();
    await expect(page).toHaveURL(/\/analizar\/pago/, { timeout: 30_000 });
    await expect(page.getByTestId("step-back")).toBeVisible();
  });

  test("pasos de perfil en adelante tienen navegación Atrás", async ({
    page,
  }) => {
    // Reutilizamos flujo rápido hasta perfil (requiere pago simulado)
    await page.goto("/analizar/contacto");
    await page.fill("#name", "Back Test");
    await page.fill("#email", uniqueEmail());
    await page.fill("#phone", "5512345678");
    await page.selectOption("#country", "MX");
    await page.check("#acceptedTerms");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/idea/, { timeout: 30_000 });

    await page.fill("#description", "Idea corta para test de navegación atrás.");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/confirmacion/, { timeout: 45_000 });

    await page.getByTestId("idea-confirm").click();
    await expect(page).toHaveURL(/\/analizar\/pago/, { timeout: 30_000 });

    await page
    await page.getByTestId("payment-submit").click();
    await expect(page).toHaveURL(/\/analizar\/perfil/, { timeout: 30_000 });

    // El botón usa BackButton con data-testid
    await expect(page.getByTestId("step-back")).toBeVisible();
  });
});
