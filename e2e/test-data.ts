import { cleanupTestData, closeDbPool } from "./db-helpers";

/**
 * Registro de correos de prueba creados por un spec, para limpiarlos al final.
 * Todos usan el dominio `@decida.test` y nunca se envían correos reales.
 */
const created = new Set<string>();

export function trackedEmail(prefix: string): string {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  const email = `${prefix}+${stamp}@decida.test`;
  created.add(email);
  return email;
}

/** Úsalo en `test.afterAll`: borra cuentas/evaluaciones creadas y cierra el pool. */
export async function cleanupTrackedData(): Promise<void> {
  try {
    for (const email of created) {
      await cleanupTestData(email);
    }
    created.clear();
  } finally {
    await closeDbPool();
  }
}
