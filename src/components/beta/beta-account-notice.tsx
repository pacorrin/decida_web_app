import { FlaskConical } from "lucide-react";
import { SuggestionDialog } from "@/components/beta/suggestion-dialog";
import { BETA_ACCOUNT_TEXT, BETA_ACCOUNT_TITLE } from "@/lib/beta";

/** Aviso de beta al pie del sidebar de la cuenta, con la entrada al modal de sugerencias. */
export function BetaAccountNotice() {
  return (
    <aside
      data-testid="beta-account-notice"
      aria-label="Aviso de versión beta"
      className="ml-3 rounded-xl border border-secondary/40 bg-secondary/10 p-3 text-xs leading-relaxed"
    >
      <p className="flex items-center gap-1.5 font-semibold text-primary">
        <FlaskConical className="size-3.5 text-secondary" aria-hidden />
        {BETA_ACCOUNT_TITLE}
      </p>
      <p className="mt-1 text-muted-foreground">{BETA_ACCOUNT_TEXT}</p>
      <SuggestionDialog label="Cuéntanos qué función te gustaría ver" />
    </aside>
  );
}
