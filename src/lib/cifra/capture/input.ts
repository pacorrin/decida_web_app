export const CAPTURE_LIMITS = {
  maxImages: 3,
  /** Cada foto llega ya reducida desde el navegador; esto es solo un tope de seguridad. */
  maxImageBytes: 1_800_000,
  maxTextLength: 500,
} as const;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const CAPTURE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CaptureInput =
  | { ok: true; captureId: string; text: string; images: string[] }
  | { ok: false; message: string };

/** Valida lo que llega del formulario y convierte las fotos a data URLs (solo en memoria). */
export async function validateCaptureInput(formData: FormData): Promise<CaptureInput> {
  const captureId = String(formData.get("captureId") ?? "");
  if (!CAPTURE_ID.test(captureId)) return { ok: false, message: "No pudimos procesar la captura. Intenta de nuevo." };

  const text = String(formData.get("text") ?? "").trim();
  if (text.length > CAPTURE_LIMITS.maxTextLength) {
    return { ok: false, message: `El texto puede tener máximo ${CAPTURE_LIMITS.maxTextLength} caracteres.` };
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > CAPTURE_LIMITS.maxImages) {
    return { ok: false, message: `Puedes subir hasta ${CAPTURE_LIMITS.maxImages} fotos por captura.` };
  }
  if (files.length === 0 && text.length === 0) {
    return { ok: false, message: "Sube una foto o escribe qué pasó." };
  }

  const images: string[] = [];
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return { ok: false, message: "Solo se aceptan fotos en formato JPG, PNG o WebP." };
    }
    if (file.size > CAPTURE_LIMITS.maxImageBytes) {
      return { ok: false, message: "Una de las fotos pesa demasiado. Prueba con otra." };
    }
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    images.push(`data:${file.type};base64,${base64}`);
  }
  return { ok: true, captureId, text, images };
}
