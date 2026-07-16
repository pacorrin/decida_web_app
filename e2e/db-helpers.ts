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

export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
