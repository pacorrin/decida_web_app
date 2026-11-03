#!/usr/bin/env node
"use strict";

/**
 * Build carrusel-05 — identidad "Corte neto".
 * Fondo musgo → papel, líneas de ledger, definición con franja lateral.
 * Distinto de 01–04 (sin ghost, sin número gigante, sin puntos, sin 9 familias).
 *
 * Uso: node builds/carrusel-05.js
 */

const {
  escapeHtml,
  renderMarked,
  loadIconSvg,
  renderCarousel,
} = require("../lib/common");

const ID = "carrusel-05";
const ICON_STROKE = "#05422c";

function slideHtml(slide, index, total, logoHtml) {
  const n = String(index + 1).padStart(2, "0");

  switch (slide.type) {
    case "cover":
      return `
        <div class="slide slide--cover" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="cover-rule" aria-hidden="true"></div>
          <div class="cover-body">
            <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          </div>
          <div class="cover-foot">
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            <div class="hint">${escapeHtml(slide.hint || "Desliza →")}</div>
          </div>
        </div>`;

    case "signal": {
      const tone = slide.cardTone === "sky" ? "sky" : "moss";
      const icon = loadIconSvg(slide.icon, 64, { stroke: ICON_STROKE });
      return `
        <div class="slide slide--signal signal--${tone}" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="signal-panel">
            <div class="signal-rail" aria-hidden="true"></div>
            <div class="signal-main">
              <div class="signal-head">
                <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
                <div class="signal-icon" aria-hidden="true">${icon}</div>
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
          <div class="calc-card">
            ${filasHtml}
            <div class="calc-row calc-row--total">
              <span class="calc-label">${escapeHtml(totalRow.label || "")}</span>
              <span class="calc-valor">${escapeHtml(totalRow.valor || "")}</span>
            </div>
          </div>
          ${notaHtml}
        </div>`;
    }

    case "compare": {
      const izq = slide.izquierda || {};
      const der = slide.derecha || {};
      return `
        <div class="slide slide--compare" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
          <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          <div class="compare-stack">
            <div class="compare-card compare-card--a">
              <div class="compare-label">${escapeHtml(izq.label || "")}</div>
              <p class="compare-texto">${escapeHtml(izq.texto || "")}</p>
            </div>
            <div class="compare-card compare-card--b">
              <div class="compare-label">${escapeHtml(der.label || "")}</div>
              <p class="compare-texto">${renderMarked(der.texto || "")}</p>
            </div>
          </div>
        </div>`;
    }

    case "text":
      return `
        <div class="slide slide--text" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="text-body">
            <div class="text-rule" aria-hidden="true"></div>
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
  cssPath: "template/carrusel-05.css",
  slideHtml,
  logoTheme: "light",
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
