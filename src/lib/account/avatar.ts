/** Dirección de la foto de perfil, o null si la persona no ha subido una. */
export function avatarSrc(version: Date | null): string | null {
  return version ? `/api/cuenta/foto?v=${version.getTime()}` : null;
}

/** Iniciales para el círculo sin foto: nombre y apellido, o la primera letra del correo. */
export function initialsOf(name: string | null, email: string): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return email.slice(0, 1).toUpperCase();
}
