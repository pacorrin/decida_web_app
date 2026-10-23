"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session-server";
import { startCreditPurchase } from "@/lib/credits/purchase";
import { getCreditPackage, type CreditPackageId } from "@/lib/credits/packages";
import { CREDITS_PACKAGES_PATH, CREDITS_PATH } from "@/lib/credits/paths";

export type BuyCreditsState = {
  success: boolean;
  message?: string;
};

export async function buyCreditPackage(
  _prev: BuyCreditsState,
  formData: FormData,
): Promise<BuyCreditsState> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      message: "Tu sesión expiró. Inicia sesión de nuevo.",
    };
  }

  const rawId = String(formData.get("packageId") ?? "");
  const pkg = getCreditPackage(rawId);
  if (!pkg) {
    return { success: false, message: "Ese paquete de créditos no existe." };
  }

  const result = await startCreditPurchase(
    user,
    pkg.id as CreditPackageId,
    CREDITS_PACKAGES_PATH,
  );

  if (result.kind === "error") {
    return { success: false, message: result.message };
  }
  if (result.kind === "redirect") redirect(result.url);

  // Sin Stripe: acreditación simulada inmediata.
  revalidatePath(CREDITS_PATH);
  revalidatePath(CREDITS_PACKAGES_PATH);
  revalidatePath("/cuenta", "layout");
  redirect(`${CREDITS_PATH}?compra=ok`);
}
