export const MEXICO_PHONE_PREFIX = "+52";

export function mexicoNationalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  const includesCountryCode = raw.includes("+") || digits.length > 10;
  if (includesCountryCode && digits.startsWith("52")) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 10);
}

export function formatMexicoPhone(raw: string): string {
  const national = mexicoNationalDigits(raw);
  const groups = [
    national.slice(0, 2),
    national.slice(2, 6),
    national.slice(6, 10),
  ].filter((group) => group.length > 0);

  return groups.length > 0
    ? `${MEXICO_PHONE_PREFIX} ${groups.join(" ")}`
    : MEXICO_PHONE_PREFIX;
}

export function isCompleteMexicoPhone(raw: string): boolean {
  return mexicoNationalDigits(raw).length === 10;
}

export function mexicoPhoneCursor(formatted: string, digitsBefore: number): number {
  const minimum = MEXICO_PHONE_PREFIX.length;
  if (digitsBefore <= 0) return minimum;

  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (!/\d/.test(formatted[index] ?? "")) continue;
    seen += 1;
    if (seen === digitsBefore) return Math.max(minimum, index + 1);
  }

  return formatted.length;
}
