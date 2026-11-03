#!/usr/bin/env node
"use strict";

/**
 * Build carrusel-06 — identidad Taste "Marco"
 * Dials: VARIANCE 9 / MOTION 1 / DENSITY 3
 * Cielo full-bleed + ventana blanca inset. Numeros en disco coral.
 * Compares apilados dentro del marco (misma familia).
 * Distinto de Contrapeso (banda) y de 01–05.
 *
 * Uso: node builds/carrusel-06.js
 */

const {
  escapeHtml,
  renderMarked,
  loadIconSvg,
  renderCarousel,
} = require("../lib/common");

const ID = "carrusel-06";
const ICON_STROKE = "#05422c";
const ICON_WHITE = "#ffffff";

function wrap(n, inner, extraClass = "") {
  return `
    <div class="slide ${extraClass}" data-slide="${n}">
      <div class="marco">
        ${inner}
      </div>
    </div>`;
}

function slideHtml(slide, index, total, logoHtml) {
  const n = String(index + 1).padStart(2, "0");

  switch (slide.type) {
    case "cover":
      return wrap(
        n,
        `
          <div class="logo-wrap">${logoHtml}</div>
          <div class="cover-mid">
            <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          </div>
          <div class="cover-foot">
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            <div class="hint">${escapeHtml(slide.hint || "Desliza →")}</div>
          </div>`,
        "slide--cover"
      );

    case "text":
      return wrap(
        n,
        `
          <div class="logo-wrap">${logoHtml}</div>
          <div class="text-mid">
            <div class="coral-bar" aria-hidden="true"></div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
          </div>`,
        "slide--text"
      );

    case "signal": {
      const tone = slide.cardTone === "sky" ? "sky" : "moss";
      const num = escapeHtml(slide.numero || String(index));
      const icon = loadIconSvg(slide.icon, 48, { stroke: ICON_STROKE });
      return wrap(
        n,
        `
          <div class="logo-wrap">${logoHtml}</div>
          <div class="signal-head">
            <div class="num-disc" aria-hidden="true">${num}</div>
            <div class="signal-meta">
              <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
              <div class="signal-icon" aria-hidden="true">${icon}</div>
            </div>
          </div>
          <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          <p class="apoyo apoyo--tone-${tone}">${escapeHtml(slide.apoyo)}</p>`,
        `slide--signal signal--${tone}`
      );
    }

    case "compare": {
      const izq = slide.izquierda || {};
      const der = slide.derecha || {};
      return wrap(
        n,
        `
          <div class="logo-wrap">${logoHtml}</div>
          <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
          <h1 class="titulo titulo--sm">${renderMarked(slide.titulo)}</h1>
          <div class="compare-stack">
            <div class="compare-row compare-row--a">
              <div class="compare-label">${escapeHtml(izq.label || "")}</div>
              <p class="compare-texto">${escapeHtml(izq.texto || "")}</p>
            </div>
            <div class="compare-row compare-row--b">
              <div class="compare-label">${escapeHtml(der.label || "")}</div>
              <p class="compare-texto">${renderMarked(der.texto || "")}</p>
            </div>
          </div>`,
        "slide--compare"
      );
    }

    case "cta": {
      const icon = loadIconSvg("target", 40, { stroke: ICON_WHITE });
      return `
        <div class="slide slide--cta" data-slide="${n}">
          <div class="marco marco--cta">
            <div class="logo-wrap logo-wrap--light">${logoHtml}</div>
            <h1 class="titulo titulo--light">${renderMarked(slide.titulo)}</h1>
            <p class="apoyo apoyo--light">${escapeHtml(slide.apoyo)}</p>
            <div class="cta-foot">
              <div class="cta-button">${escapeHtml(slide.boton)}</div>
              <div class="cta-lema-row">
                <div class="cta-mini-icon" aria-hidden="true">${icon}</div>
                <p class="lema">${escapeHtml(slide.lema)}</p>
              </div>
            </div>
          </div>
        </div>`;
    }

    default:
      throw new Error(
        `Tipo de slide no soportado en ${ID}: "${slide.type}" (slide ${n})`
      );
    }
}

renderCarousel({
  id: ID,
  cssPath: "template/carrusel-06.css",
  slideHtml,
  logoTheme: "light",
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
