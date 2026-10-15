import { test, expect, type Page } from "@playwright/test";
import { getUserSubscription, setSubscriptionPeriodEnd } from "./db-helpers";
import { onboardingGratis } from "./flow";
import { cleanupTrackedData, trackedEmail } from "./test-data";

/**
 * Recorrido freemium → suscripción simulada → cancelación (S3-08).
 *
 * Cuenta nueva → onboarding completo en plan gratuito → reporte recortado →
 * segunda evaluación bloqueada (límite freemium) → suscripción simulada →
 * desbloqueo retroactivo de la evaluación vieja → cancelación (conserva el
 * acceso hasta el fin del periodo) → vencimiento del periodo (SQL) → vuelve la
 * vista recortada.
 *
 * Una sola evaluación real (generar el reporte es lo lento); el resto son
 * navegaciones. Todo se borra en `afterAll` por correo.
 */

const SECCIONES_BLOQUEADAS = [
  "Compatibilidad personal",
  "Tiempo y operación",
  "Escalabilidad",
  "Recomendación final",
];

async function expectReporteRecortado(page: Page): Promise<void> {
  // Lo gratuito sigue visible.
  await expect(
    page.getByRole("heading", { name: "Semáforos por dimensión" })
  ).toBeVisible({ timeout: 30_000 });

  // Candados: 4 secciones bloqueadas + invitación a suscribirse.
  await expect(
    page.getByRole("link", { name: "Desbloquear con la suscripción" })
  ).toHaveCount(SECCIONES_BLOQUEADAS.length);
  for (const titulo of SECCIONES_BLOQUEADAS) {
    await expect(
      page.getByRole("heading", { name: titulo, exact: true })
    ).toBeVisible();
  }
  await expect(page.getByText("Lo que desbloquea la suscripción")).toBeVisible();
  await expect(
    page.getByText("El desglose de productos, los cálculos y el análisis financiero")
  ).toBeVisible();

  // El contenido de pago NO aparece (ni siquiera oculto en el DOM).
  await expect(
    page.getByRole("heading", { name: "Análisis de escalabilidad" })
  ).toHaveCount(0);
  await expect(page.getByText("Cómo reducirlo:", { exact: true })).toHaveCount(0);
}

async function expectReporteCompleto(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: "Semáforos por dimensión" })
  ).toBeVisible({ timeout: 30_000 });

  await expect(page.getByText("Desbloquear con la suscripción")).toHaveCount(0);
  await expect(page.getByText("Lo que desbloquea la suscripción")).toHaveCount(0);
  await expect(page.getByText("disponible con la suscripción")).toHaveCount(0);
  await expect(
    page.getByText("El desglose de productos, los cálculos y el análisis financiero")
  ).toHaveCount(0);
  // Las secciones redactadas por IA dependen de OpenAI (hay fallbacks), así
  // que no se exige su texto: basta con que ya no estén bloqueadas.
}

test.describe("Freemium → suscripción → cancelación", () => {
  test.afterAll(async () => {
    await cleanupTrackedData();
  });

  test("gate del reporte, límite de 1 evaluación, desbloqueo retroactivo y cancelación", async ({
    page,
  }) => {
    test.setTimeout(420_000);
    const email = trackedEmail("e2e.suscripcion");
    let evaluacionUrl = "";

    await test.step("Onboarding gratuito → reporte en vista recortada", async () => {
      await onboardingGratis(page, email, "Ana Suscripción");
      await expectReporteRecortado(page);
    });

    await test.step("La evaluación aparece en /cuenta y su detalle también es recortado", async () => {
      await page.goto("/cuenta");
      const lista = page.getByTestId("account-assessment-list");
      await expect(lista.locator("li")).toHaveCount(1);
      evaluacionUrl = (await lista.locator("a").first().getAttribute("href")) ?? "";
      expect(evaluacionUrl).toMatch(/^\/cuenta\/evaluaciones\/.+/);
      await page.goto(evaluacionUrl);
      await expectReporteRecortado(page);
    });

    await test.step("Segunda evaluación: límite freemium → planes con aviso", async () => {
      await page.goto("/cuenta");
      await page.getByRole("button", { name: "Analizar una idea" }).click();
      await expect(page).toHaveURL(/\/cuenta\/suscripcion\?limite=1/, {
        timeout: 30_000,
      });
      await expect(
        page.getByText("La cuenta gratuita incluye una evaluación y ya la usaste.")
      ).toBeVisible();
      // Sigue sin crearse una segunda evaluación.
      await page.goto("/cuenta");
      await expect(
        page.getByTestId("account-assessment-list").locator("li")
      ).toHaveCount(1);
      await page.getByRole("button", { name: "Analizar una idea" }).click();
      await expect(page).toHaveURL(/\/cuenta\/suscripcion\?limite=1/, {
        timeout: 30_000,
      });
    });

    await test.step("Suscripción simulada ($99 MXN/mes)", async () => {
      await expect(page.getByTestId("subscribe-submit")).toContainText("$99");
      await page.getByTestId("subscribe-submit").click();
      await expect(page.getByTestId("subscription-status")).toContainText(
        /Activa, se renueva el/,
        { timeout: 30_000 }
      );
      await expect(page).toHaveURL(/\/cuenta\/suscripcion/);

      const sub = await getUserSubscription(email);
      expect(sub.status).toBe("active");
      expect(sub.periodEnd).not.toBeNull();
      expect(sub.periodEnd!.getTime()).toBeGreaterThan(Date.now());
    });

    await test.step("Desbloqueo retroactivo: la evaluación vieja ahora sale completa", async () => {
      await page.goto(evaluacionUrl);
      await expectReporteCompleto(page);
    });

    await test.step("Suscriptor: ya puede iniciar otra evaluación (sin pantalla de límite)", async () => {
      await page.goto("/cuenta");
      await page.getByRole("button", { name: "Analizar una idea" }).click();
      await expect(page).toHaveURL(/\/analizar\/(idea|perfil|confirmacion)/, {
        timeout: 30_000,
      });
    });

    await test.step("Cancelar desde /cuenta/perfil conserva el acceso completo", async () => {
      await page.goto("/cuenta/perfil");
      await expect(page.getByText(/Activa, se renueva el/)).toBeVisible();
      await page.getByRole("button", { name: "Cancelar suscripción" }).click();
      await page
        .getByRole("button", { name: "Sí, cancelar suscripción" })
        .click();
      await expect(page.getByText(/Cancelada, acceso hasta el/)).toBeVisible({
        timeout: 15_000,
      });

      const sub = await getUserSubscription(email);
      expect(sub.status).toBe("canceled");
      expect(sub.canceledAt).not.toBeNull();
      expect(sub.periodEnd!.getTime()).toBeGreaterThan(Date.now());

      await page.goto(evaluacionUrl);
      await expectReporteCompleto(page);
    });

    await test.step("Al vencer el periodo vuelve la vista recortada", async () => {
      await setSubscriptionPeriodEnd(email, new Date(Date.now() - 24 * 3600 * 1000));

      await page.goto(evaluacionUrl);
      await expectReporteRecortado(page);

      await page.goto("/cuenta/perfil");
      await expect(page.getByText("Vencida")).toBeVisible();
      await expect(page.getByRole("link", { name: "Suscribirme" })).toBeVisible();
    });
  });
});
