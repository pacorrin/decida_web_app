import { Pool } from "pg";
import "dotenv/config";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for e2e database helpers");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function getLatestVerificationCode(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const result = await getPool().query<{ vc_code: string }>(
    `SELECT vc_code
     FROM verification_codes
     WHERE vc_identifier = $1
       AND vc_method = 'email'
       AND vc_purpose = 'history_access'
       AND vc_used_at IS NULL
     ORDER BY vc_created_at DESC
     LIMIT 1`,
    [normalized]
  );

  const code = result.rows[0]?.vc_code;
  if (!code) {
    throw new Error(`No verification code found for ${normalized}`);
  }
  return code;
}

/** Contraseña que usan los specs al crear cuentas de prueba (mín. 8 caracteres). */
export const E2E_PASSWORD = "E2e-Password-123";

/**
 * Mueve el fin del periodo de la suscripción de la cuenta (p. ej. al pasado
 * para simular que el periodo pagado venció).
 */
export async function setSubscriptionPeriodEnd(
  email: string,
  periodEnd: Date
): Promise<void> {
  const result = await getPool().query(
    `UPDATE users SET user_subscription_period_end = $2 WHERE user_email = $1`,
    [email.trim().toLowerCase(), periodEnd]
  );
  if (result.rowCount !== 1) {
    throw new Error(`No existe la cuenta ${email}`);
  }
}

export async function getUserSubscription(email: string): Promise<{
  status: string;
  periodEnd: Date | null;
  canceledAt: Date | null;
}> {
  const result = await getPool().query<{
    user_subscription_status: string;
    user_subscription_period_end: Date | null;
    user_subscription_canceled_at: Date | null;
  }>(
    `SELECT user_subscription_status, user_subscription_period_end, user_subscription_canceled_at
     FROM users WHERE user_email = $1`,
    [email.trim().toLowerCase()]
  );
  const row = result.rows[0];
  if (!row) throw new Error(`No existe la cuenta ${email}`);
  return {
    status: row.user_subscription_status,
    periodEnd: row.user_subscription_period_end,
    canceledAt: row.user_subscription_canceled_at,
  };
}

/**
 * Borra todo lo que crea un spec para un correo: evaluaciones (y sus hijas por
 * cascada), cuenta (sesiones por cascada), códigos y sesiones de historial.
 * Es idempotente y solo toca filas de ese correo.
 */
export async function cleanupTestData(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const db = getPool();
  await db.query(`DELETE FROM assessments WHERE asmt_email = $1`, [normalized]);
  await db.query(`DELETE FROM users WHERE user_email = $1`, [normalized]);
  await db.query(`DELETE FROM verification_codes WHERE vc_identifier = $1`, [
    normalized,
  ]);
  await db.query(`DELETE FROM history_sessions WHERE hses_email = $1`, [
    normalized,
  ]);
}

export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
