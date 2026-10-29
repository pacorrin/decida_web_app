import { test, expect, type Page } from "@playwright/test";
import { E2E_PASSWORD, getLatestVerificationCode } from "./db-helpers";
import { cleanupTrackedData, trackedEmail } from "./test-data";

/**
 * La cuenta solo queda activa (y con sesión) al confirmar el código del correo en
 * una pantalla aparte. Cubre el onboarding, el registro y el login de una cuenta
 * que se creó pero nunca se confirmó. Los correos `@decida.test` no se envían: el
 * código se lee de la base de datos.
 */

test.describe("Verificación de correo", () => {
  test.afterAll(async () => {
    await cleanupTrackedData();
  });

  async function enviarContacto(page: Page, email: string): Promise<void> {
    await page.goto("/analizar/contacto");
    await page.fill("#name", "Ana Verifica");
    await page.fill("#email", email);
    await page.fill("#phone", "5512345678");
    await page.selectOption("#country", "MX");
    await page.fill("#password", E2E_PASSWORD);
    await page.check("#acceptedTerms");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/verificar/, { timeout: 30_000 });
  }

  test("el contacto no avanza sin confirmar el código", async ({ page }) => {
    const email = trackedEmail("e2e.verif");
    await enviarContacto(page, email);

    // Saltarse la pantalla escribiendo la URL del siguiente paso no funciona.
    await page.goto("/analizar/idea");
    await expect(page).toHaveURL(/\/analizar\/verificar/);

    // Un código incorrecto no avanza.
    await page.fill("#verify-code", "000000");
    await page.getByRole("button", { name: "Confirmar y continuar" }).click();
    await expect(page.getByText("Código inválido o expirado")).toBeVisible();
    await expect(page).toHaveURL(/\/analizar\/verificar/);

    // El correcto sí.
    const code = await getLatestVerificationCode(email, "signup_verification");
    await page.fill("#verify-code", code);
    await page.getByRole("button", { name: "Confirmar y continuar" }).click();
    await expect(page).toHaveURL(/\/analizar\/idea/, { timeout: 30_000 });
  });

  test("el código se invalida tras 5 intentos fallidos", async ({ page }) => {
    const email = trackedEmail("e2e.verif.max");
    await enviarContacto(page, email);
    const code = await getLatestVerificationCode(email, "signup_verification");

    for (let i = 0; i < 5; i++) {
      await page.fill("#verify-code", "000000");
      await page.getByRole("button", { name: "Confirmar y continuar" }).click();
      await expect(page.getByText(/Código inválido|Demasiados intentos/)).toBeVisible();
    }

    // Ya ni el código correcto sirve: hay que pedir uno nuevo.
    await page.fill("#verify-code", code);
    await page.getByRole("button", { name: "Confirmar y continuar" }).click();
    await expect(page.getByText("Código inválido o expirado")).toBeVisible();
    await expect(page).toHaveURL(/\/analizar\/verificar/);
  });

  test("el registro pide el código en otra pantalla y entra a la cuenta", async ({
    page,
  }) => {
    const email = trackedEmail("e2e.registro");
    await page.goto("/cuenta/registro");
    await page.fill("#name", "Ana Registro");
    await page.fill("#signup-email", email);
    await page.fill("#password", E2E_PASSWORD);
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/cuenta\/registro\/verificar/, { timeout: 30_000 });

    const code = await getLatestVerificationCode(email, "signup_verification");
    await page.fill("#verify-code", code);
    await page.getByRole("button", { name: "Confirmar y continuar" }).click();
    await expect(page).toHaveURL(/\/cuenta$/, { timeout: 30_000 });
  });

  test("iniciar sesión con una cuenta sin verificar lleva a la verificación", async ({
    page,
  }) => {
    const email = trackedEmail("e2e.login.sinverificar");
    await enviarContacto(page, email);
    await page.context().clearCookies();

    await page.goto("/cuenta/iniciar-sesion");
    await page.fill("#login-email", email);
    await page.fill("#login-password", "contraseña-equivocada");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page.getByText("Correo o contraseña incorrectos.")).toBeVisible();

    await page.fill("#login-password", E2E_PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL(/\/cuenta\/registro\/verificar/, { timeout: 30_000 });

    const code = await getLatestVerificationCode(email, "signup_verification");
    await page.fill("#verify-code", code);
    await page.getByRole("button", { name: "Confirmar y continuar" }).click();
    await expect(page).toHaveURL(/\/cuenta$/, { timeout: 30_000 });
  });
});
