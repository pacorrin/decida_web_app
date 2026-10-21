/**
 * ¿Qué tan evaluable es la idea tal como la escribió la persona?
 *
 * Se mide sobre SUS palabras, no sobre el resumen de la IA: el resumen siempre
 * sale completo (la IA rellena y hasta inventa: «práctica y deliciosa»), así
 * que no sirve para detectar una idea vaga. Es una heurística deliberadamente
 * simple y explicable, pensada como piso: marca como vagas las ideas de una
 * línea y avisa qué faltaría saber.
 */

export type IdeaClarity = {
  level: "clara" | "parcial" | "vaga";
  words: number;
  /** Lo que la descripción no dice, en lenguaje para la persona. */
  missing: string[];
};

const WHO =
  /\b(para|dirigid[oa]s? a|clientes?|personas|gente|empresas?|negocios|oficinas?|estudiantes|familias|pymes?|freelancers?|emprendedores|profesionales|ingenier[oa]s|dise[ñn]adores|madres|padres|j[oó]venes|adultos|turistas|usuarios?)\b/i;

const WHERE =
  /\b(en l[ií]nea|online|internet|digital|a domicilio|redes sociales|app|sitio web|p[aá]gina web|tienda|local|colonia|ciudad|zona|centro comercial|mercado|plaza|barrio|calle|municipio|estado|pa[ií]s|latinoam[eé]rica|m[eé]xico)\b|\b(?:en|de|por)\s+(?:la |el |los |las )?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}/;

const HOW =
  /(vend|vent[ao]s?\b|ofrec|cobr|suscripci|precio|\$|\d|renta|alquil|comisi[oó]n|membres[ií]a|por encargo|por pedido|por hora|mensual|semanal|cafeter|restaurante|tienda|curso|clases?|servicio|taller|consultor|plataforma|producto|plantillas)/i;

export function assessIdeaClarity(description: string | null | undefined): IdeaClarity {
  const text = (description ?? "").trim();
  const words = text ? text.split(/\s+/).length : 0;

  const hasWho = WHO.test(text);
  const hasWhere = WHERE.test(text);
  const hasHow = HOW.test(text);

  const missing: string[] = [];
  if (!hasWho) missing.push("a quién le venderías");
  if (!hasWhere) missing.push("dónde operarías o venderías");
  if (!hasHow) missing.push("cómo ganarías dinero");

  const signals = [hasWho, hasWhere, hasHow].filter(Boolean).length;

  let level: IdeaClarity["level"];
  if (words < 10 || signals === 0) level = "vaga";
  else if (signals < 3 || words < 20) level = "parcial";
  else level = "clara";

  return { level, words, missing };
}
