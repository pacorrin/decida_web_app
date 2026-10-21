import { z } from "zod";
import { generateJson, getNarrativeModel, type AiObservabilityContext } from "@/lib/ai/openai";
import { researchConfig } from "./config";
import { parseTargetMarket, type StoredTargetMarket } from "./market-format";
import type { MarketTarget } from "./schema";

export { formatTargetMarket, parseTargetMarket, parseTargetMarketText, type StoredTargetMarket } from "./market-format";

/**
 * Mercado objetivo de la idea.
 *
 * Lo define LA IDEA y la persona, no el país desde el que entra el visitante:
 * alguien que escribe desde Argentina y evalúa un negocio en Monterrey recibe
 * análisis de Monterrey. Si la idea no dice dónde, se usa el mercado por
 * defecto de la plataforma (configurable, México hoy) y se marca como supuesto,
 * editable en el paso de confirmación.
 */

const inferenceSchema = z.object({
  pais: z.string().min(2),
  ciudad: z.string().nullable(),
  criterio: z.string(),
  el_texto_lo_indica: z.boolean(),
});

const INFERENCE_SYSTEM = `Decides en qué mercado se evaluará una idea de negocio. Devuelve SOLO JSON: { "pais": string, "ciudad": string | null, "criterio": string, "el_texto_lo_indica": boolean }.
- El mercado es donde la idea VENDERÍA u OPERARÍA, según lo que la persona escribió. No es el país desde el que escribe.
- "el_texto_lo_indica": true solo si el texto menciona o permite deducir con claridad el país, ciudad o región (por ejemplo «en la Roma Norte de la Ciudad de México», «para clientes de Estados Unidos»). Si no, false y usa el mercado por defecto que se te da, con ciudad null.
- "criterio": una frase corta que explique la decisión.`;

/**
 * Infiere el mercado objetivo. Nunca lanza: ante cualquier fallo devuelve el
 * mercado por defecto como supuesto.
 */
export async function inferTargetMarket(
  description: string,
  observability?: AiObservabilityContext,
): Promise<StoredTargetMarket> {
  const cfg = researchConfig();
  const fallback: StoredTargetMarket = {
    pais: cfg.defaultCountry,
    ciudad: null,
    criterio: `La idea no indica dónde operaría; se usa el mercado por defecto (${cfg.defaultCountry}).`,
    es_supuesto: true,
    editado: false,
  };
  if (!description.trim()) return fallback;

  try {
    const raw = await generateJson<unknown>(
      INFERENCE_SYSTEM,
      `Idea: ${description}\nMercado por defecto de la plataforma: ${cfg.defaultCountry}`,
      getNarrativeModel(),
      observability,
    );
    const r = inferenceSchema.parse(raw);
    return {
      pais: r.pais.trim(),
      ciudad: r.ciudad?.trim() || null,
      criterio: r.criterio.trim(),
      es_supuesto: !r.el_texto_lo_indica,
      editado: false,
    };
  } catch {
    return fallback;
  }
}
