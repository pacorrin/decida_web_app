#!/usr/bin/env node
"use strict";

/**
 * Build dedicado de carrusel-02 — identidad "Esmeralda".
 * No usa template/slide.css ni los layouts del carrusel-01.
 *
 * Uso: node builds/carrusel-02.js
 */

const {
  escapeHtml,
  renderMarked,
  loadIconSvg,
  renderCarousel,
} = require("../lib/common");

const ID = "carrusel-02";
const ICON_STROKE = "#ffffff";

function slideHtml(slide, index, total, logoHtml) {
  const n = String(index + 1).padStart(2, "0");

  switch (slide.type) {
    case "cover":
      return `
        <div class="slide slide--cover" data-slide="${n}">
          <div class="cover-top">
            <div class="logo-wrap">${logoHtml}</div>
            <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          </div>
          <section class="cover-foot">
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            <div class="hint">${escapeHtml(slide.hint || "Desliza →")}</div>
          </section>
        </div>`;

    case "signal": {
      // Slides 2–5: misma estructura (ghost — ícono marca de agua).
      const icon = loadIconSvg(slide.icon, 280, { stroke: ICON_STROKE });
      return `
        <div class="slide slide--signal signal--ghost" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
          <div class="signal-icon" aria-hidden="true">${icon}</div>
          <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
        </div>`;
    }

    case "checklist": {
      const items = Array.isArray(slide.items) ? slide.items : [];
      const steps = items
        .map(
          (item, i) => `
            <li class="step">
              <span class="step-num">${i + 1}</span>
              <span class="step-text">${escapeHtml(item)}</span>
            </li>`
        )
        .join("");
      return `
        <div class="slide slide--checklist" data-slide="${n}">
          <header class="check-head">
            <div class="logo-wrap">${logoHtml}</div>
            <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          </header>
          <ol class="steps">${steps}</ol>
        </div>`;
    }

    case "text":
      return `
        <div class="slide slide--text" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <blockquote class="quote">
            <div class="quote-mark" aria-hidden="true">“</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
          </blockquote>
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
  cssPath: "template/carrusel-02.css",
  slideHtml,
  logoTheme: "dark",
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
