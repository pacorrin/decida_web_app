/**
 * Nivel de seguridad de una contraseña para mostrarlo mientras se escribe. Es solo
 * una guía: lo que se exige al crear la cuenta (mínimo 8 caracteres) sigue
 * validándose en el servidor.
 */

export type PasswordStrength = {
  /** 0 = vacía, 1 a 4 = de débil a fuerte. */
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  /** Qué mejorar; vacío cuando ya es fuerte. */
  hint: string;
};

const COMMON = [
  "password",
  "contrasena",
  "contraseña",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyui",
  "qwerty123",
  "abcd1234",
  "iloveyou",
  "admin123",
  "decida",
];

const LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Débil",
  2: "Regular",
  3: "Buena",
  4: "Fuerte",
};

function isSequential(value: string): boolean {
  if (value.length < 6) return false;
  const chars = [...value.toLowerCase()];
  return chars.every((c, i) => i === 0 || c.charCodeAt(0) - chars[i - 1].charCodeAt(0) === 1);
}

export function passwordStrength(password: string): PasswordStrength {
  if (!password) return { level: 0, label: "", hint: "" };

  if (password.length < 8) {
    return { level: 1, label: LABELS[1], hint: "Usa al menos 8 caracteres." };
  }

  const lower = password.toLowerCase();
  if (
    COMMON.some((c) => lower === c || lower.startsWith(c)) ||
    /^(.)\1+$/.test(password) ||
    isSequential(password)
  ) {
    return { level: 1, label: LABELS[1], hint: "Es una contraseña muy común. Elige una menos predecible." };
  }

  const classes =
    Number(/[a-z]/.test(password)) +
    Number(/[A-Z]/.test(password)) +
    Number(/\d/.test(password)) +
    Number(/[^A-Za-z0-9]/.test(password));
  let points = classes;
  if (password.length >= 10) points += 1;
  if (password.length >= 14) points += 1;
  if (/(.)\1{2,}/.test(password)) points -= 1;

  const level = (points <= 2 ? 1 : points === 3 ? 2 : points === 4 ? 3 : 4) as 1 | 2 | 3 | 4;

  let hint = "";
  if (level < 4) {
    const missing: string[] = [];
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) missing.push("mayúsculas y minúsculas");
    if (!/\d/.test(password)) missing.push("números");
    if (!/[^A-Za-z0-9]/.test(password)) missing.push("símbolos");
    hint =
      password.length < 12
        ? `Hazla más larga${missing.length ? ` y agrega ${missing.join(", ")}` : ""}.`
        : missing.length
          ? `Agrega ${missing.join(", ")}.`
          : "Evita repetir caracteres.";
  }
  return { level, label: LABELS[level], hint };
}
