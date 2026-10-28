#!/usr/bin/env node
"use strict";

/**
 * Build dedicado de carrusel-03 — identidad "Cuenta clara".
 * Fondo cielo, tipografía de ledger, número de paso gigante.
 * Distinto del papel blanco (01) y de la esmeralda (02).
 *
 * Uso: node builds/carrusel-03.js
 */

const {
  escapeHtml,
  renderMarked,
  loadIconSvg,
  renderCarousel,
} = require("../lib/common");

const ID = "carrusel-03";
const ICON_STROKE = "#05422c";

function slideHtml(slide, index, total, logoHtml) {
  const n = String(index + 1).padStart(2, "0");

  switch (slide.type) {
    case "cover":
      return `
        <div class="slide slide--cover" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
          <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          <div class="cover-bottom">
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            <div class="hint">${escapeHtml(slide.hint || "Desliza →")}</div>
          </div>
        </div>`;

    case "signal": {
      const stepNum = String(index); // cover=0 → Paso 1 = index 1
      const icon = loadIconSvg(slide.icon, 56, { stroke: ICON_STROKE });
      return `
        <div class="slide slide--signal" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="signal-body">
            <div class="step-giant" aria-hidden="true">${escapeHtml(stepNum)}</div>
            <div class="signal-copy">
              <div class="etiqueta-row">
                <div class="signal-icon" aria-hidden="true">${icon}</div>
                <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
              </div>
              <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
              <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            </div>
          </div>
        </div>`;
    }

    case "calc": {
      const filas = Array.isArray(slide.filas) ? slide.filas : [];
      const totalRow = slide.total || {};
      const filasHtml = filas
        .map(
          (fila) => `
            <div class="calc-row">
              <span class="calc-label">${escapeHtml(fila.label || "")}</span>
              <span class="calc-valor">${escapeHtml(fila.valor || "")}</span>
            </div>`
        )
        .join("");
      const notaHtml = slide.nota
        ? `<p class="calc-nota">${escapeHtml(slide.nota)}</p>`
        : "";
      return `
        <div class="slide slide--calc" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
          <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          <div class="calc-block">
            <div class="calc-card">
              ${filasHtml}
              <div class="calc-row calc-row--total">
                <span class="calc-label">${escapeHtml(totalRow.label || "")}</span>
                <span class="calc-valor">${escapeHtml(totalRow.valor || "")}</span>
              </div>
            </div>
            ${notaHtml}
          </div>
        </div>`;
    }

    case "text":
      return `
        <div class="slide slide--text" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="text-body">
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
          </div>
        </div>`;

    case "cta":
      return `
        <div class="slide slide--cta" data-slide="${n}">
          <div class="cta-top">
            <div class="logo-wrap">${logoHtml}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
          </div>
          <div class="cta-bottom">
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
  cssPath: "template/carrusel-03.css",
  slideHtml,
  logoTheme: "light",
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
