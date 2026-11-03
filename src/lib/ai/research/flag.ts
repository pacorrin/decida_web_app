/**
 * ¿Está disponible la etapa de investigación de mercado?
 *
 * Es decisión de la persona: si activa «Investigación de mercado» en su evaluación, se hace
 * (y se cobra). El servidor no la apaga por su cuenta; solo existe un apagado de emergencia:
 * `REPORT_RESEARCH_ENABLED=false` (también `off` o `0`). Con cualquier otro valor, o sin
 * definirla, queda disponible.
 */
export async function isResearchEnabled(
  _distinctId?: string | null,
  env: NodeJS.ProcessEnv = process.env,
): Promise<boolean> {
  const mode = (env.REPORT_RESEARCH_ENABLED ?? "").trim().toLowerCase();
  return !(mode === "false" || mode === "off" || mode === "0");
}
