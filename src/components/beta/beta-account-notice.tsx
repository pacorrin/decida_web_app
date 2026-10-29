import { FlaskConical } from "lucide-react";
import {
  BETA_ACCOUNT_TEXT,
  BETA_ACCOUNT_TITLE,
  FEEDBACK_EMAIL,
} from "@/lib/beta";

/** Aviso de beta al pie del sidebar de la cuenta. */
export function BetaAccountNotice() {
  return (
    <aside
      data-testid="beta-account-notice"
      aria-label="Aviso de versión beta"
      className="rounded-xl border border-secondary/40 bg-secondary/10 p-3 text-xs leading-relaxed"
    >
      <p className="flex items-center gap-1.5 font-semibold text-primary">
        <FlaskConical className="size-3.5 text-secondary" aria-hidden />
        {BETA_ACCOUNT_TITLE}
      </p>
      <p className="mt-1 text-muted-foreground">{BETA_ACCOUNT_TEXT}</p>
      <a
        href={`mailto:${FEEDBACK_EMAIL}`}
        className="mt-2 inline-block font-medium text-primary underline-offset-4 hover:underline"
      >
        Cuéntanos qué función te gustaría ver
      </a>
    </aside>
  );
}
