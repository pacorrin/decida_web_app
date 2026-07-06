import { defineConfig, devices } from "@playwright/test";

/**
 * Config de Playwright para los tests E2E del flujo de onboarding (`/analizar`).
 *
 * Requisitos para correr los tests:
 * - PostgreSQL arriba (contenedor `decida-postgres` en localhost:5432).
 * - El esquema sincronizado con `pnpm db:push` (la migración commiteada está
 *   desfasada y hace crashear el paso de contacto).
 * - `.env` presente con `DATABASE_URL`.
 *
 * El dev server se levanta automáticamente vía `webServer`. Si ya tienes uno
 * corriendo en localhost:3000, se reutiliza (salvo en CI).
 */

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  // El paso de evaluación corre de forma SÍNCRONA un modelo de razonamiento
  // (o4-mini) + 9 llamadas en paralelo a OpenAI para generar el reporte. Correr
  // varios flujos a la vez satura la API (rate-limit) y provoca timeouts, así
  // que serializamos (1 worker). Súbelo con `--workers=N` si tu cuota lo tolera.
  workers: 1,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  // La generación del reporte (scoring + IA) puede tardar bastante; damos margen.
  timeout: 240_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
