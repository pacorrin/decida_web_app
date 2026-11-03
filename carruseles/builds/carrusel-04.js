#!/usr/bin/env node
"use strict";

/**
 * Build carrusel-04 - identidad Taste "Marcador editorial Decida"
 * Dials: VARIANCE 8 / MOTION 1 / DENSITY 3
 * Cada slide usa una familia de layout distinta (anti-repeticion).
 * Copy: content/carrusel-04.json (sin cambios).
 *
 * Uso: node builds/carrusel-04.js
 */

const {
  escapeHtml,
  renderMarked,
  loadIconSvg,
  renderCarousel,
} = require("../lib/common");

const ID = "carrusel-04";
const STROKE_GREEN = "#05422c";
const STROKE_CORAL = "#ff7043";
const STROKE_WHITE = "#ffffff";

function metricsHtml(filas) {
  return (Array.isArray(filas) ? filas : [])
    .map(
      (fila) => `
        <div class="metric">
          <div class="metric-valor">${escapeHtml(fila.valor || "")}</div>
          <div class="metric-label">${escapeHtml(fila.label || "")}</div>
        </div>`
    )
    .join("");
}

function stackHtml(filas) {
  return (Array.isArray(filas) ? filas : [])
    .map(
      (fila) => `
        <div class="stack-row">
          <span class="stack-label">${escapeHtml(fila.label || "")}</span>
          <span class="stack-valor">${escapeHtml(fila.valor || "")}</span>
        </div>`
    )
    .join("");
}

function slideHtml(slide, index, total, logoHtml) {
  const n = String(index + 1).padStart(2, "0");

  switch (slide.type) {
    case "cover":
      // Family: editorial-type-dominant
      return `
        <div class="slide slide--cover" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
          <div class="cover-meta">
            <span class="etiqueta">${escapeHtml(slide.etiqueta)}</span>
            <span class="hint">${escapeHtml(slide.hint || "Desliza")}</span>
          </div>
        </div>`;

    case "signal": {
      // Three different families for the three pasos (indices 1, 3, 5)
      const variant =
        index === 1 ? "rail" : index === 3 ? "stack" : "bleed";

      if (variant === "rail") {
        const icon = loadIconSvg(slide.icon, 120, { stroke: STROKE_WHITE });
        return `
          <div class="slide slide--signal signal--rail" data-slide="${n}">
            <aside class="rail">
              <div class="signal-icon" aria-hidden="true">${icon}</div>
            </aside>
            <div class="rail-main">
              <div class="logo-wrap">${logoHtml}</div>
              <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
              <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
              <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            </div>
          </div>`;
      }

      if (variant === "stack") {
        const icon = loadIconSvg(slide.icon, 72, { stroke: STROKE_CORAL });
        return `
          <div class="slide slide--signal signal--stack" data-slide="${n}">
            <div class="logo-wrap">${logoHtml}</div>
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            <div class="stack-mid">
              <div class="signal-icon" aria-hidden="true">${icon}</div>
              <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            </div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          </div>`;
      }

      // bleed
      {
        const icon = loadIconSvg(slide.icon, 200, { stroke: STROKE_GREEN });
        return `
          <div class="slide slide--signal signal--bleed" data-slide="${n}">
            <div class="logo-wrap">${logoHtml}</div>
            <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <div class="bleed-icon" aria-hidden="true">${icon}</div>
            <div class="bleed-bar">
              <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            </div>
          </div>`;
      }
    }

    case "calc": {
      const totalRow = slide.total || {};
      const notaHtml = slide.nota
        ? `<p class="calc-nota">${escapeHtml(slide.nota)}</p>`
        : "";
      // Three calc families by index: 2, 4, 6
      const variant =
        index === 2 ? "tiles" : index === 4 ? "ladder" : "strip";

      if (variant === "tiles") {
        return `
          <div class="slide slide--calc calc--tiles" data-slide="${n}">
            <div class="logo-wrap">${logoHtml}</div>
            <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <div class="metrics">${metricsHtml(slide.filas)}</div>
            ${notaHtml}
            <div class="calc-total">
              <span class="calc-total-label">${escapeHtml(totalRow.label || "")}</span>
              <span class="calc-total-valor">${escapeHtml(totalRow.valor || "")}</span>
            </div>
          </div>`;
      }

      if (variant === "ladder") {
        return `
          <div class="slide slide--calc calc--ladder" data-slide="${n}">
            <div class="logo-wrap">${logoHtml}</div>
            <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <div class="ladder">${stackHtml(slide.filas)}</div>
            ${notaHtml}
            <div class="ladder-total">
              <span class="calc-total-label">${escapeHtml(totalRow.label || "")}</span>
              <span class="calc-total-valor">${escapeHtml(totalRow.valor || "")}</span>
            </div>
          </div>`;
      }

      // strip
      return `
        <div class="slide slide--calc calc--strip" data-slide="${n}">
          <div class="calc-strip-top">
            <div class="logo-wrap">${logoHtml}</div>
            <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          </div>
          <div class="strip-row">
            ${(Array.isArray(slide.filas) ? slide.filas : [])
              .map(
                (fila) => `
              <div class="strip-cell">
                <div class="metric-valor">${escapeHtml(fila.valor || "")}</div>
                <div class="metric-label">${escapeHtml(fila.label || "")}</div>
              </div>`
              )
              .join("")}
          </div>
          ${notaHtml}
          <div class="calc-total calc-total--green">
            <span class="calc-total-label">${escapeHtml(totalRow.label || "")}</span>
            <span class="calc-total-valor">${escapeHtml(totalRow.valor || "")}</span>
          </div>
        </div>`;
    }

    case "text":
      // Family: manifesto-column
      return `
        <div class="slide slide--text" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="text-stage">
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
          </div>
        </div>`;

    case "cta":
      // Family: split-action
      return `
        <div class="slide slide--cta" data-slide="${n}">
          <div class="cta-copy">
            <div class="logo-wrap">${logoHtml}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
          </div>
          <div class="cta-action">
            <div class="cta-button">${escapeHtml(slide.boton)}</div>
            <p class="lema">${escapeHtml(slide.lema)}</p>
          </div>
        </div>`;

    default:
      throw new Error(
        `Tipo de slide no soportado en ${ID}: "${slide.type}" (slide ${n})`
      );
  }
}

renderCarousel({
  id: ID,
  cssPath: "template/carrusel-04.css",
  slideHtml,
  logoTheme: "light",
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
