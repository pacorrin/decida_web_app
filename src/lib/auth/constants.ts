export const AUTH_CODE_TTL_MS = 15 * 60 * 1000;
export const AUTH_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const MAX_AUTH_CODES_PER_HOUR = 3;
/** Intentos fallidos permitidos por código antes de invalidarlo. */
export const MAX_AUTH_CODE_ATTEMPTS = 5;

export const AUTH_METHOD = "email" as const;
