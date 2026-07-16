export const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;
export const HISTORY_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_CODES_PER_HOUR = 3;

export const HISTORY_METHOD = "email" as const;
export const HISTORY_PURPOSE = "history_access" as const;
