import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session-server";
import { getCreditsBalance } from "@/lib/credits/ledger";
import { formatCredits } from "@/lib/credits/costs";
import { resolveCreditCheckoutReturn } from "@/lib/credits/checkout-return";
import { CREDITS_PATH } from "@/lib/credits/paths";
import { CreditPackages } from "@/components/account/credit-packages";
import { CreditCheckoutNotice } from "@/components/account/credit-checkout-notice";

export const metadata = {
  title: "Comprar créditos | Decida",
  description: "Paquetes de créditos para análisis de Decida.",
};

export default async function CreditosPaquetesPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; session_id?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/iniciar-sesion");

  const { checkout, session_id } = await searchParams;
  const checkoutState = await resolveCreditCheckoutReturn(user.user_id, {
    checkout,
    session_id,
  });
  if (checkoutState === "credited") {
    redirect(`${CREDITS_PATH}?compra=ok`);
  }

  const balance = await getCreditsBalance(user.user_id);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          <Link
            href={CREDITS_PATH}
            className="underline-offset-4 hover:underline"
          >
            Créditos
          </Link>
          {" · "}
          Comprar
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Elige un paquete
        </h1>
        <p className="text-sm text-muted-foreground">
          Saldo actual:{" "}
          <span className="font-medium text-foreground" data-testid="packages-balance">
            {formatCredits(balance)} créditos
          </span>
          . Un análisis básico cuesta 0.5 créditos; con investigación, 1.5.
        </p>
      </div>

      <CreditCheckoutNotice state={checkoutState} />
      <CreditPackages />
    </div>
  );
}
