import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ActionButton } from "@/components/cifra/form-kit";
import { CifraTabs } from "@/components/cifra/cifra-tabs";
import { getCifraAccess } from "@/lib/cifra/access";
import { CREDITS_PLANS_PATH } from "@/lib/credits/paths";
import { getCurrentUser } from "@/lib/auth/session-server";
import { prisma } from "@/lib/prisma";
import { deleteAllCifraData } from "./actions";

export const metadata = {
  title: "Cifra | Decida",
  description: "Tus cuentas, deudas, ingresos y gastos en un solo lugar.",
};

export default async function CifraLayout({ children }: { children: React.ReactNode }) {
  const access = await getCifraAccess();
  if (!access.ok && access.reason === "no_session") redirect("/cuenta/iniciar-sesion");

  if (!access.ok) {
    // Sin plan no se puede usar, pero los datos guardados se conservan y se pueden borrar.
    const user = await getCurrentUser();
    const hasData = user
      ? (await prisma.cifra_transactions.count({ where: { ctrx_user_id: user.user_id } })) +
          (await prisma.cifra_debts.count({ where: { cdebt_user_id: user.user_id } })) +
          (await prisma.cifra_fixed_expenses.count({ where: { cfix_user_id: user.user_id } })) +
          (await prisma.cifra_accounts.count({ where: { cacc_user_id: user.user_id } })) >
        0
      : false;

    return (
      <div className="max-w-xl space-y-6" data-testid="cifra-paywall">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Cifra</h1>
          <p className="text-sm text-muted-foreground">
            Pon en orden tus cuentas, tus deudas y tus gastos, y registra lo que entra y lo que sale.
          </p>
        </div>
        <div className="space-y-3 rounded-2xl border border-border/80 bg-accent/30 px-6 py-5">
          <p className="text-sm">
            Cifra está incluida en cualquier plan activo, desde Explora.
            {hasData && " Lo que ya guardaste se conserva mientras tanto."}
          </p>
          <Link
            href={CREDITS_PLANS_PATH}
            className={buttonVariants({
              className: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
            })}
            data-testid="cifra-plans-cta"
          >
            Ver planes
          </Link>
        </div>
        {hasData && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Si ya no quieres usar Cifra, puedes borrar todos los datos que guardaste.
            </p>
            <ActionButton
              action={deleteAllCifraData}
              label="Borrar mis datos de Cifra"
              confirmText="Se borrarán tus deudas, gastos fijos, saldos y movimientos. Esto no se puede deshacer. ¿Continuar?"
              successMessage="Tus datos de Cifra se borraron"
              variant="outline"
              size="sm"
              testId="cifra-delete-all"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Cifra</h1>
        <p className="text-sm text-muted-foreground">
          Tu punto de partida: lo que tienes, lo que debes y lo que entra y sale cada mes.
        </p>
      </div>
      <CifraTabs />
      {children}
    </div>
  );
}
