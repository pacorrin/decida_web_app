import { test, expect } from "@playwright/test";
import { onboardingGratis } from "./flow";
import { cleanupTrackedData, trackedEmail } from "./test-data";

/**
 * Multi-idea e historial en el modelo freemium: la cuenta gratuita incluye UNA
 * evaluación. «Analizar otra idea» lleva a la pantalla de planes con el aviso
 * de límite, y el historial vive en `/cuenta` (la cuenta ya inició sesión al
 * crearse en el paso de contacto; `/mis-evaluaciones` redirige a `/cuenta`).
 * El recorrido de suscripción (desbloqueo retroactivo) está en
 * `subscription-flow.spec.ts`.
 */

test.describe("Multi-idea y historial", () => {
  test.afterAll(async () => {
    await cleanupTrackedData();
  });

  test("«Analizar otra idea» en cuenta gratuita redirige a planes con aviso de límite", async ({
    page,
  }) => {
    await onboardingGratis(page, trackedEmail("e2e.multi"), "Ana Multi Idea");

    await expect(page.getByTestId("analyze-another-idea")).toBeVisible();
    await page.getByTestId("analyze-another-idea").click();

    await expect(page).toHaveURL(/\/analizar\/pago\?limite=1/, {
      timeout: 30_000,
    });
    await expect(
      page.getByText("La cuenta gratuita incluye una evaluación y ya la usaste.")
    ).toBeVisible();
    await expect(page.getByTestId("payment-submit")).toBeVisible();
  });

  test("el historial en /cuenta lista la evaluación y abre su reporte recortado", async ({
    page,
  }) => {
    await onboardingGratis(page, trackedEmail("e2e.multi"), "Ana Historial");

    // Compatibilidad: la ruta vieja sigue llevando al panel de la cuenta.
    await page.goto("/mis-evaluaciones");
    await expect(page).toHaveURL(/\/cuenta$/, { timeout: 15_000 });

    const lista = page.getByTestId("account-assessment-list");
    await expect(lista).toBeVisible();
    await expect(lista.locator("li")).toHaveCount(1);

    await lista.locator("a").first().click();
    await expect(page).toHaveURL(/\/cuenta\/evaluaciones\/.+/);
    await expect(
      page.getByRole("heading", { name: "Semáforos por dimensión" })
    ).toBeVisible({ timeout: 30_000 });
    // Vista recortada (cuenta gratuita) y sin el formulario de feedback.
    await expect(page.getByText("Lo que desbloquea la suscripción")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "¿Te fue útil este diagnóstico?" })
    ).toHaveCount(0);
  });
});
