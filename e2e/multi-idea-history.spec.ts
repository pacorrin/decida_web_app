import { test, expect, type Page } from "@playwright/test";
import { getLatestVerificationCode, closeDbPool } from "./db-helpers";

const SCENARIO = {
  idea:
    "Ofrecer consultoría de marketing digital para PYMEs locales que quieren vender más por redes sociales.",
};

function uniqueEmail(): string {
  return `e2e.multi+${Date.now()}@decida.test`;
}

async function selectOptionCard(
  page: Page,
  name: string,
  value: string
): Promise<void> {
  await page
    .locator(`[data-testid="option-card-${name}-${value}"]`)
    .check({ force: true });
}

async function completarOnboarding(
  page: Page,
  email: string
): Promise<void> {
  await page.goto("/analizar");
  await expect(page).toHaveURL(/\/analizar\/contacto/);

  await page.fill("#name", "Ana Multi Idea");
  await page.fill("#email", email);
  await page.fill("#phone", "5512345678");
  await page.selectOption("#country", "MX");
  await page.check("#acceptedTerms");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/analizar\/idea/, { timeout: 30_000 });

  await page.fill("#description", SCENARIO.idea);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/analizar\/confirmacion/, {
    timeout: 45_000,
  });

  await page.getByTestId("idea-confirm").click();
  await expect(page).toHaveURL(/\/analizar\/pago/, { timeout: 30_000 });
  await page.getByTestId("payment-submit").click();
  await expect(page).toHaveURL(/\/analizar\/perfil/, { timeout: 30_000 });

  await selectOptionCard(page, "currentSituation", "independiente");
  await selectOptionCard(page, "mainGoal", "ingreso_extra");
  await selectOptionCard(page, "entrepreneurshipExperience", "algo");
  await selectOptionCard(page, "hoursPerWeekRange", "10_20");
  await selectOptionCard(page, "availableSchedule", "noches");
  await selectOptionCard(page, "expectedIncomeTimeframe", "1_3_meses");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/analizar\/ajuste/, { timeout: 30_000 });

  await page.locator('input[name="enjoyedActivities"][value="vender"]').check();
  await selectOptionCard(page, "workPreference", "digital");
  await selectOptionCard(page, "salesComfortScore", "4");
  await selectOptionCard(page, "uncertaintyComfortScore", "3");
  await selectOptionCard(page, "hiringPreference", "solo");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/analizar\/evaluacion/, { timeout: 30_000 });

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
  await page.getByRole("button", { name: "Obtener mi diagnóstico" }).click();
  await expect(page).toHaveURL(/\/analizar\/resultado/, { timeout: 150_000 });

  await expect(
    page.getByRole("heading", { name: "¿Te fue útil este diagnóstico?" })
  ).toBeVisible({ timeout: 60_000 });
}

test.describe("Multi-idea y historial", () => {
  test.afterAll(async () => {
    await closeDbPool();
  });

  test("permite analizar otra idea desde el resultado", async ({ page }) => {
    const email = uniqueEmail();
    await completarOnboarding(page, email);

    await expect(page.getByTestId("analyze-another-idea")).toBeVisible();
    await page.getByTestId("analyze-another-idea").click();

    await expect(page).toHaveURL(/\/analizar\/contacto/, { timeout: 30_000 });
    await expect(page.locator("#email")).toHaveValue(email);
    await expect(page.locator("#name")).toHaveValue("Ana Multi Idea");

    await page.check("#acceptedTerms");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/idea/, { timeout: 30_000 });
  });

  test("muestra evaluaciones anteriores tras verificar correo", async ({
    page,
  }) => {
    const email = uniqueEmail();
    await completarOnboarding(page, email);

    await page.goto("/mis-evaluaciones");
    await expect(
      page.getByRole("heading", { name: "Mis evaluaciones", level: 1 })
    ).toBeVisible();

    await page.getByTestId("history-email").fill(email);
    await page.getByTestId("history-request-code").click();
    await expect(page.getByTestId("history-request-message")).toBeVisible({
      timeout: 15_000,
    });

    const code = await getLatestVerificationCode(email);
    await page.getByTestId("history-code").fill(code);
    await page.getByTestId("history-verify-code").click();

    await expect(page).toHaveURL(/\/mis-evaluaciones$/, { timeout: 15_000 });
    await expect(page.getByTestId("history-assessment-list")).toBeVisible();
    await expect(page.getByTestId("history-assessment-list").locator("li")).toHaveCount(
      1
    );

    await page.getByTestId("history-assessment-list").locator("a").first().click();
    await expect(page).toHaveURL(/\/mis-evaluaciones\/.+/);
    await expect(
      page.getByRole("heading", { name: "Semáforos por dimensión" })
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "¿Te fue útil este diagnóstico?" })
    ).toHaveCount(0);
  });
});
