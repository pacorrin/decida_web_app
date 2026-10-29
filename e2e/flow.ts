import { expect, type Page } from "@playwright/test";
import { E2E_PASSWORD, getLatestVerificationCode } from "./db-helpers";

/**
 * Recorrido mínimo del onboarding (consultoría de marketing) reutilizable por
 * los specs de suscripción / historial. Los specs de cobertura amplia
 * (`onboarding.spec.ts`) llevan sus propios helpers por escenario.
 */
export const IDEA =
  "Ofrecer consultoría de marketing digital para PYMEs locales que quieren vender más por redes sociales.";

export async function selectOptionCard(
  page: Page,
  name: string,
  value: string
): Promise<void> {
  const card = page.locator(`[data-testid="option-card-${name}-${value}"]`);
  // Las tarjetas son radios controlados por React: un clic antes de la
  // hidratación se pierde ("did not change its state"), así que se reintenta.
  await expect(async () => {
    await card.check({ force: true, timeout: 3_000 });
    await expect(card).toBeChecked({ timeout: 1_000 });
  }).toPass({ timeout: 20_000 });
}

/**
 * Pantalla de verificación (`/analizar/verificar`): lee el código que se guardó para
 * el correo y lo ingresa. Al confirmar queda con sesión iniciada en `/analizar/idea`.
 */
export async function confirmarCodigo(page: Page, email: string): Promise<void> {
  await expect(page).toHaveURL(/\/analizar\/verificar/, { timeout: 30_000 });
  const code = await getLatestVerificationCode(email, "signup_verification");
  await page.fill("#verify-code", code);
  await page.getByRole("button", { name: "Confirmar y continuar" }).click();
  await expect(page).toHaveURL(/\/analizar\/idea/, { timeout: 30_000 });
}

/** Crea la cuenta en el paso de contacto y confirma el código (queda con sesión iniciada). */
export async function crearCuenta(
  page: Page,
  email: string,
  nombre = "Ana Flujo"
): Promise<void> {
  await page.goto("/analizar");
  await expect(page).toHaveURL(/\/analizar\/contacto/);
  await page.fill("#name", nombre);
  await page.fill("#email", email);
  await page.fill("#phone", "5512345678");
  await page.selectOption("#country", "MX");
  await page.fill("#password", E2E_PASSWORD);
  await page.check("#acceptedTerms");
  await page.getByRole("button", { name: "Continuar" }).click();
  await confirmarCodigo(page, email);
}

/** Desde `/analizar/idea` hasta llegar a `/analizar/pago`. */
export async function escribirIdea(page: Page, idea = IDEA): Promise<void> {
  await page.fill("#description", idea);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/analizar\/confirmacion/, { timeout: 45_000 });
  await page.getByTestId("idea-confirm").click();
  await expect(page).toHaveURL(/\/analizar\/pago/, { timeout: 30_000 });
}

/** Desde `/analizar/perfil` hasta el resultado con el reporte generado. */
export async function completarHastaResultado(page: Page): Promise<void> {
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
  await expect(page).toHaveURL(/\/analizar\/productos/, { timeout: 30_000 });

  await page.fill('[data-testid="product-name-0"]', "Servicio de consultoría");
  await page.fill('[data-testid="product-price-0"]', "12000");
  await page.fill('[data-testid="product-cost-0"]', "1500");
  await page.fill('[data-testid="product-units-0"]', "4");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/analizar\/evaluacion/, { timeout: 30_000 });

  await page.fill("#initialInvestment", "6000");
  await selectOptionCard(page, "fixedMonthlyCostsRange", "menos_5k");
  await selectOptionCard(page, "customerEvidenceLevel", "4_10");
  await selectOptionCard(page, "competitionLevel", "alta");
  await selectOptionCard(page, "acquisitionChannel", "referidos");
  await page
    .locator('input[name="businessDependencies"][value="cliente_unico"]')
    .check({ force: true });
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

/** Cuenta nueva → onboarding completo en plan gratuito → reporte recortado. */
export async function onboardingGratis(
  page: Page,
  email: string,
  nombre?: string
): Promise<void> {
  await crearCuenta(page, email, nombre);
  await escribirIdea(page);
  await page.getByTestId("payment-free").click();
  await completarHastaResultado(page);
}
