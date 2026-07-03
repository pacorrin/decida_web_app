# Markdown Rendering in AI Responses

## Overview

This document describes the markdown rendering system implemented for displaying AI-generated content throughout the Decida application, specifically in the onboarding flow.

## Problem Statement

Previously, all AI responses were displayed as plain text using `whitespace-pre-wrap`. While this preserved line breaks, it didn't allow for rich formatting like:
- Bold/italic emphasis
- Structured lists
- Tables
- Code blocks
- Blockquotes
- Links

This made longer AI responses less readable and harder to scan.

## Solution

We implemented a comprehensive markdown rendering solution using `react-markdown` that:
1. Renders all markdown syntax correctly
2. Applies consistent Tailwind CSS styling
3. Works seamlessly with both markdown and plain text
4. Is reusable across the application

## Components

### Markdown Component

**Location**: `src/components/ui/markdown.tsx`

The `Markdown` component is a wrapper around `react-markdown` with custom component overrides for styling.

#### Usage

```tsx
import { Markdown } from "@/components/ui/markdown";

function MyComponent() {
  const aiResponse = `
    # Heading
    
    This is **bold** and *italic* text.
    
    - Item 1
    - Item 2
  `;
  
  return <Markdown content={aiResponse} className="text-sm" />;
}
```

#### Supported Elements

| Element | Styling |
|---------|---------|
| Headings (h1-h6) | Hierarchical sizing with primary color |
| Paragraphs | Relaxed leading, muted foreground |
| Lists (ul/ol) | Proper spacing and indentation |
| Tables | Bordered with alternating row colors |
| Blockquotes | Left border with muted background |
| Code (inline) | Monospace with background |
| Code blocks | Block display with scrolling |
| Links | Primary color with hover effects |
| Bold/Italic | Semantic font weights and styles |
| Horizontal rules | Border separator |

### Integration Points

#### 1. Result Report (`src/components/onboarding/result-report.tsx`)

The following report sections now render markdown:

```tsx
// Executive Summary
<Markdown content={report.arep_executive_summary} className="text-base" />

// Financial Analysis
<Markdown content={report.arep_financial_analysis} className="text-sm" />

// Personal Fit Analysis
<Markdown content={report.arep_personal_fit_analysis} className="text-sm" />

// Final Recommendation
<Markdown content={report.arep_final_recommendation_text} className="text-base" />
```

#### 2. Idea Confirmation (`src/components/onboarding/idea-confirmation.tsx`)

The AI-generated idea summary now supports markdown:

```tsx
<Markdown content={summary} className="text-base" />
```

## AI Prompt Updates

To take advantage of markdown rendering, we updated the system prompts to instruct the AI when and how to use markdown.

### Report Generation (`src/lib/ai/generate-report.ts`)

```typescript
const BASE_SYSTEM = `Eres un consultor de viabilidad de negocios para Decida.
...
Puedes usar formato Markdown para mejorar la presentación:
- **Negritas** para destacar puntos clave
- *Cursivas* para énfasis
- Listas con - o números para organizar información
- Tablas cuando sea apropiado para presentar datos
- > para citas o notas importantes

Usa markdown de forma moderada y profesional.`;
```

### Idea Summary (`src/lib/ai/prompts/idea-summary.ts`)

Added instruction: "Puedes usar formato Markdown ligero en el summary si ayuda a la claridad (negritas, cursivas)"

### Idea Refinement (`src/lib/ai/prompts/idea-refinement.ts`)

Added instruction: "Puedes usar formato Markdown ligero en el summary si ayuda a la claridad (negritas, cursivas)"

## Guidelines for AI Usage

When the AI generates content for these fields, it should:

1. **Use markdown sparingly** - Not every response needs markdown
2. **Emphasize key points** - Use bold for important metrics or findings
3. **Structure when needed** - Use lists when presenting multiple items
4. **Tables for comparisons** - Use tables when comparing multiple data points
5. **Blockquotes for callouts** - Use blockquotes for important notes or warnings

### Examples

#### Good Use of Markdown

```markdown
Tu idea tiene **potencial moderado** considerando estos factores:

**Fortalezas:**
- Bajo costo de entrada ($30,000 MXN)
- Mercado validado en tu zona
- Propuesta de valor clara

**Riesgos principales:**
1. Competencia establecida con 5+ años de experiencia
2. Márgenes ajustados (45% bruto)
3. Alta dependencia de tu tiempo personal

> **Nota importante:** Recomendamos validar el pricing con 10 clientes potenciales antes de invertir más.
```

#### Excessive Markdown (Avoid)

```markdown
# TU IDEA

Tu idea es ***MUY INTERESANTE*** y tiene:

- **Fortaleza #1**: ~~No~~ *Sí* tiene potencial
- **Fortaleza #2**: Es ~~mala~~ **BUENA**
- **Fortaleza #3**: [Ver más](https://example.com)

---

## Siguiente Sección

Aquí va más contenido...
```

## Technical Details

### Dependencies

```json
{
  "react-markdown": "^9.0.4",
  "remark-gfm": "^4.0.0",
  "rehype-raw": "^7.0.0"
}
```

- **react-markdown**: Core markdown rendering engine
- **remark-gfm**: GitHub Flavored Markdown support (tables, strikethrough, etc.)
- **rehype-raw**: HTML parsing support (optional, for safety)

### Performance Considerations

- The `Markdown` component is client-side ("use client") due to react-markdown's requirements
- Content is not streamed; it's rendered once when the data is available
- For very long content, the component includes `overflow-x-auto` on code blocks and tables

### Security

- All links automatically open in new tabs with `rel="noopener noreferrer"`
- No raw HTML is allowed by default (can be enabled via rehype-raw if needed)
- User-generated content should still be sanitized before storage

## Backward Compatibility

The markdown renderer is fully backward compatible:

1. **Plain text works perfectly** - Text without markdown syntax renders normally
2. **Existing reports** - All reports in the database will render correctly
3. **No breaking changes** - The API and data structures remain unchanged

## Testing

To test markdown rendering:

1. Start the dev server: `npm run dev`
2. Create a test page with sample markdown content
3. Verify all markdown elements render correctly
4. Test with plain text to ensure compatibility

Example test page location: `/test-markdown` (create as needed for debugging)

## Future Enhancements

Potential improvements for future iterations:

1. **Syntax highlighting** for code blocks (using `react-syntax-highlighter`)
2. **Image support** in markdown content
3. **Custom components** for specific markdown patterns (e.g., metric cards)
4. **Streaming support** for real-time AI responses
5. **Dark mode adjustments** for code blocks and blockquotes

## Troubleshooting

### Markdown not rendering

1. Check that the content string contains valid markdown syntax
2. Verify the `Markdown` component is imported correctly
3. Ensure `react-markdown` and `remark-gfm` are installed

### Styling issues

1. Check that Tailwind classes are properly applied
2. Verify the `className` prop is being passed to the wrapper div
3. Ensure no conflicting CSS is affecting the markdown elements

### Performance issues

1. For very long content, consider pagination or lazy loading
2. Check that the component is not re-rendering unnecessarily
3. Consider memoization if the content doesn't change frequently

## Related Files

- `src/components/ui/markdown.tsx` - Main markdown component
- `src/components/onboarding/result-report.tsx` - Result report integration
- `src/components/onboarding/idea-confirmation.tsx` - Idea confirmation integration
- `src/lib/ai/generate-report.ts` - Report generation prompts
- `src/lib/ai/prompts/idea-summary.ts` - Idea summary prompts
- `src/lib/ai/prompts/idea-refinement.ts` - Idea refinement prompts

## References

- [react-markdown documentation](https://github.com/remarkjs/react-markdown)
- [remark-gfm documentation](https://github.com/remarkjs/remark-gfm)
- [GitHub Flavored Markdown Spec](https://github.github.com/gfm/)
