"use client";

import { toast } from "sonner";

type ActionResult = { success: boolean; message?: string } | undefined | void;

/**
 * Ejecuta una server action mostrando un toast de espera y luego el de éxito o
 * error. Se usa dentro de `startTransition` (no con `useActionState`) para que
 * el toast salga aunque el componente que disparó la acción desaparezca al
 * revalidar la página (p. ej. el botón de cancelar).
 *
 * Si la acción redirige, la llamada no regresa un resultado: se deja el toast
 * de espera solo cuando `keepLoadingOnRedirect` es true (salida a Stripe).
 */
export async function runActionWithToast<T extends ActionResult>(
  action: () => Promise<T>,
  opts: {
    loading: string;
    success: string;
    error?: string;
    keepLoadingOnRedirect?: boolean;
  },
): Promise<T | undefined> {
  const id = toast.loading(opts.loading);
  try {
    const result = await action();
    if (!result) {
      if (!opts.keepLoadingOnRedirect) toast.dismiss(id);
      return undefined;
    }
    if (result.success) {
      toast.success(opts.success, { id });
    } else {
      toast.error(result.message ?? opts.error ?? "No se pudo completar la acción.", { id });
    }
    return result;
  } catch {
    toast.error(opts.error ?? "Algo salió mal. Intenta de nuevo.", { id });
    return undefined;
  }
}
