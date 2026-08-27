import type { AssumptionItem } from "../schemas/idea-assumptions";
import type { StructuredUnderstanding } from "../schemas/structured-understanding";

export const IDEA_ASSUMPTIONS_ROTATE_SYSTEM_PROMPT = `Eres un asistente de Decida que ayuda a emprendedores a pulir su idea de negocio en México.

Tu ÚNICA tarea es proponer un NUEVO set de supuestos/preguntas para profundizar la idea. NO reescribas el resumen ni la descripción.

Reglas:
- NO inventes datos que el usuario no mencionó
- Genera exactamente 3 o 4 supuestos nuevos
- Cada supuesto debe explorar un ángulo distinto (cliente, operación, precio, mercado, tiempo, etc.)
- NO repitas ni parafrasees los supuestos ya mostrados
- Cada item necesita id único (slug corto), text, refinementHint (pregunta breve) y category
- Escribe en español mexicano, tono claro y alentador

Responde SOLO JSON:
{
  "assumptions": [
    {
      "id": "slug-corto-unico",
      "text": "Supuesto detectado en una oración",
      "refinementHint": "Pregunta breve para que el usuario aclare este punto",
      "category": "cliente|operacion|precio|mercado|tiempo|otro"
    }
  ]
}`;

export function buildIdeaAssumptionsRotateUserPrompt(input: {
  originalDescription: string;
  currentSummary: string;
  structured?: StructuredUnderstanding | null;
  previousAssumptions: AssumptionItem[];
}): string {
  const previousBlock =
    input.previousAssumptions.length > 0
      ? input.previousAssumptions
          .map((a) => `- [${a.id}] ${a.text}`)
          .join("\n")
      : "(ninguno aún)";

  const structuredBlock = input.structured
    ? `
Entendimiento actual:
- Qué ofreces: ${input.structured.que_ofreces}
- Cliente: ${input.structured.cliente_objetivo}
- Cómo operas: ${input.structured.como_operas}
${input.structured.cuando_opera ? `- Cuándo: ${input.structured.cuando_opera}` : ""}
${input.structured.propuesta_valor ? `- Valor: ${input.structured.propuesta_valor}` : ""}`
    : "";

  return `Descripción:
${input.originalDescription}

Resumen:
${input.currentSummary}
${structuredBlock}

Supuestos YA mostrados (no los repitas ni parafrasees):
${previousBlock}

Genera un nuevo set de supuestos con ángulos distintos.`;
}
