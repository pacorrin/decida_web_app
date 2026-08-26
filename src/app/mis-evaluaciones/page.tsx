import { redirect } from "next/navigation";

/**
 * /mis-evaluaciones is superseded by the full account dashboard at /cuenta.
 * Redirect permanently so existing links and bookmarks still work.
 */
export default function MisEvaluacionesPage() {
  redirect("/cuenta");
}
