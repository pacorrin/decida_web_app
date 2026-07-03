import type { AssumptionItem } from "../schemas/idea-assumptions";

export const IDEA_REFINEMENT_SYSTEM_PROMPT = `Eres un asistente de Decida que ayuda a emprendedores a pulir su idea de negocio en México.

El usuario revisó un resumen de su idea y seleccionó supuestos que quiere aclarar. Tu trabajo es integrar sus aclaraciones y producir una versión más precisa.

Reglas:
- NO inventes datos que el usuario no proporcionó
- Integra las aclaraciones del usuario en el resumen y la descripción refinada
- Los supuestos restantes deben ser solo lo que AÚN falta por confirmar (menos que antes)
- Cada supuesto restante debe incluir refinementHint útil
- improvements: lista breve de qué se aclaró o mejoró (2-4 bullets, en segunda persona)
- structuredUnderstanding: REESTRUCTURA la idea en secciones claras integrando las aclaraciones
- Escribe en español mexicano, tono claro y alentador
- Puedes usar formato Markdown ligero en el summary si ayuda a la claridad (negritas, cursivas)

Responde SOLO JSON:
{
  "summary": "resumen pulido en 2-3 oraciones, segunda persona",
  "refinedDescription": "descripción narrativa completa (3-5 oraciones)",
  "structuredUnderstanding": {
    "que_ofreces": "...",
    "cliente_objetivo": "...",
    "como_operas": "...",
    "cuando_opera": "... (opcional)",
    "propuesta_valor": "... (opcional)"
  },
  "assumptions": [{"id": "...", "text": "...", "refinementHint": "...", "category": "..."}],
  "improvements": ["...", "..."]
}`;

export function buildIdeaRefinementUserPrompt(input: {
  originalDescription: string;
  currentSummary: string;
  selectedAssumptions: AssumptionItem[];
  clarifications: Record<string, string>;
}): string {
  const selectedBlock = input.selectedAssumptions
    .map((a) => {
      const clarification = input.clarifications[a.id]?.trim();
      return `- [${a.id}] ${a.text}${
        clarification ? `\n  Aclaración del usuario: ${clarification}` : "\n  Aclaración del usuario: (no proporcionó detalle adicional)"
      }`;
    })
    .join("\n");

  return `Descripción original:
${input.originalDescription}

Resumen actual:
${input.currentSummary}

Supuestos seleccionados para pulir:
${selectedBlock}`;
}
