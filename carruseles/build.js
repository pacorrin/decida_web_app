#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = __dirname;
const WIDTH = 1080;
const HEIGHT = 1350;

const ICON_FILES = {
  "trending-up": "trending-up.svg",
  calculator: "calculator.svg",
  "messages-square": "messages-square.svg",
  shield: "shield.svg",
  calendar: "calendar.svg",
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Mark [word] spans as coral accent. */
function renderMarked(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(
    /\[([^\]]+)\]/g,
    '<span class="accent">$1</span>'
  );
}

function resolveLogoHtml() {
  const svgPath = path.join(ROOT, "assets", "logo.svg");
  const pngPath = path.join(ROOT, "assets", "logo.png");
  const wordmark = `<span class="logo-wordmark">decida.mx</span>`;

  if (fs.existsSync(svgPath)) {
    const svg = fs.readFileSync(svgPath, "utf8");
    const mark = svg.replace(/<svg\b/, '<svg class="logo-mark" ');
    return `<div class="logo-lockup" aria-label="decida.mx">${mark}${wordmark}</div>`;
  }

  if (fs.existsSync(pngPath)) {
    const data = fs.readFileSync(pngPath).toString("base64");
    return `<div class="logo-lockup" aria-label="decida.mx"><img class="logo-mark" src="data:image/png;base64,${data}" alt="" />${wordmark}</div>`;
  }

  return `<div class="logo-lockup logo-lockup--text" aria-label="decida.mx">${wordmark}</div>`;
}

function loadIconSvg(iconName) {
  const fileName = ICON_FILES[iconName];
  if (!fileName) {
    throw new Error(`Ícono desconocido: "${iconName}". Añádelo a ICON_FILES en build.js`);
  }

  const candidates = [
    path.join(ROOT, "node_modules", "lucide-static", "icons", fileName),
    path.join(ROOT, "assets", "icons", fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      let svg = fs.readFileSync(candidate, "utf8");
      // Normalize stroke to brand green; lucide-static uses currentColor
      svg = svg
        .replace(/\swidth="[^"]*"/, ' width="120"')
        .replace(/\sheight="[^"]*"/, ' height="120"')
        .replace(/\sstroke="[^"]*"/g, ' stroke="#05422c"')
        .replace(/\sstroke-width="[^"]*"/g, ' stroke-width="2"');
      if (!/stroke=/.test(svg)) {
        svg = svg.replace("<svg", '<svg stroke="#05422c"');
      }
      return svg;
    }
  }

  throw new Error(`No se encontró el SVG del ícono "${iconName}"`);
}

function ensureFonts() {
  const fontsDir = path.join(ROOT, "fonts");
  fs.mkdirSync(fontsDir, { recursive: true });

  const needed = [
    { dest: "Geist-Regular.woff2", sources: ["Geist-Regular.woff2", "geist-sans/Geist-Regular.woff2"] },
    { dest: "Geist-SemiBold.woff2", sources: ["Geist-SemiBold.woff2", "geist-sans/Geist-SemiBold.woff2"] },
  ];

  const geistRoots = [
    path.join(ROOT, "node_modules", "geist", "dist", "fonts"),
    path.join(ROOT, "node_modules", "geist", "dist"),
  ];

  for (const { dest, sources } of needed) {
    const destPath = path.join(fontsDir, dest);
    if (fs.existsSync(destPath)) continue;

    let found = null;
    for (const root of geistRoots) {
      for (const rel of sources) {
        const candidate = path.join(root, rel);
        if (fs.existsSync(candidate)) {
          found = candidate;
          break;
        }
      }
      if (found) break;
    }

    // Broader search under geist package
    if (!found) {
      const geistPkg = path.join(ROOT, "node_modules", "geist");
      if (fs.existsSync(geistPkg)) {
        const walk = (dir) => {
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              const hit = walk(full);
              if (hit) return hit;
            } else if (
              entry.name === dest ||
              (dest.includes("Regular") && /Geist.*Regular.*\.woff2$/i.test(entry.name)) ||
              (dest.includes("SemiBold") && /Geist.*SemiBold.*\.woff2$/i.test(entry.name))
            ) {
              return full;
            }
          }
          return null;
        };
        found = walk(geistPkg);
      }
    }

    if (!found) {
      throw new Error(
        `No se encontró ${dest}. Ejecuta: npm install (paquete geist)`
      );
    }

    fs.copyFileSync(found, destPath);
  }
}

function slideHtml(slide, index, total, css, logoHtml) {
  const n = String(index + 1).padStart(2, "0");
  let body = "";

  switch (slide.type) {
    case "cover":
      body = `
        <div class="slide slide--cover" data-slide="${n}">
          <header class="cover-header">
            <div class="logo-wrap">${logoHtml}</div>
            <div class="cover-lead">
              <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
              <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            </div>
          </header>
          <section class="cover-punch">
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            <div class="hint">${escapeHtml(slide.hint || "Desliza →")}</div>
          </section>
        </div>`;
      break;

    case "signal": {
      const tone = slide.cardTone === "sky" ? "sky" : "moss";
      const icon = loadIconSvg(slide.icon);
      body = `
        <div class="slide slide--signal" data-slide="${n}">
          <div class="top">
            <div class="logo-wrap">${logoHtml}</div>
            <div class="etiqueta">${escapeHtml(slide.etiqueta)}</div>
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
          </div>
          <div class="bottom">
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
            <div class="icon-card icon-card--${tone}">${icon}</div>
          </div>
        </div>`;
      break;
    }

    case "text":
      body = `
        <div class="slide slide--text" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="text-body">
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
          </div>
        </div>`;
      break;

    case "cta":
      body = `
        <div class="slide slide--cta" data-slide="${n}">
          <div class="logo-wrap">${logoHtml}</div>
          <div class="cta-lead">
            <h1 class="titulo">${renderMarked(slide.titulo)}</h1>
            <p class="apoyo">${escapeHtml(slide.apoyo)}</p>
          </div>
          <div class="cta-action">
            <div class="cta-button">${escapeHtml(slide.boton)}</div>
          </div>
          <div class="footer">
            <p class="lema">${escapeHtml(slide.lema)}</p>
          </div>
        </div>`;
      break;

    default:
      throw new Error(`Tipo de slide desconocido: "${slide.type}" (slide ${n})`);
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Slide ${n} / ${total}</title>
  <style>${css}</style>
  <style>
    .logo-mark, svg.logo-mark { height: 40px; width: auto; display: block; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

function clearNonPng(outDir) {
  if (!fs.existsSync(outDir)) return;
  for (const name of fs.readdirSync(outDir)) {
    if (!name.toLowerCase().endsWith(".png")) {
      fs.unlinkSync(path.join(outDir, name));
    }
  }
}

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("Uso: node build.js <id-carrusel>");
    console.error("Ejemplo: node build.js carrusel-01");
    process.exit(1);
  }

  const contentPath = path.join(ROOT, "content", `${id}.json`);
  if (!fs.existsSync(contentPath)) {
    console.error(`No existe content/${id}.json`);
    process.exit(1);
  }

  ensureFonts();

  const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  const slides = content.slides;
  if (!Array.isArray(slides) || slides.length === 0) {
    console.error("El JSON debe incluir un array \"slides\" no vacío.");
    process.exit(1);
  }

  const fontsDir = path.join(ROOT, "fonts");
  const cssRaw = fs.readFileSync(path.join(ROOT, "template", "slide.css"), "utf8");
  // HTML vive en output/<id>/; reescribir urls de fuente a file:// absolutos
  const css = cssRaw.replace(
    /url\("\.\.\/fonts\/([^"]+)"\)/g,
    (_, file) => `url("file://${path.join(fontsDir, file)}")`
  );
  const logoHtml = resolveLogoHtml();
  const outDir = path.join(ROOT, "output", id);
  fs.mkdirSync(outDir, { recursive: true });
  clearNonPng(outDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  for (let i = 0; i < slides.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    const html = slideHtml(slides[i], i, slides.length, css, logoHtml);

    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(50);

    const outPng = path.join(outDir, `slide-${n}.png`);
    await page.screenshot({
      path: outPng,
      type: "png",
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
    console.log(`✓ ${path.relative(ROOT, outPng)}`);
  }

  await browser.close();
  clearNonPng(outDir);

  // Verificar dimensiones vía cabecera IHDR del PNG
  let ok = true;
  for (let i = 0; i < slides.length; i++) {
    const n = String(i + 1).padStart(2, "0");
    const file = path.join(outDir, `slide-${n}.png`);
    if (!fs.existsSync(file)) {
      console.error(`Falta ${file}`);
      ok = false;
      continue;
    }
    const buf = fs.readFileSync(file);
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    if (w !== WIDTH || h !== HEIGHT) {
      console.error(`Dimensión incorrecta en slide-${n}.png: ${w}x${h}`);
      ok = false;
    }
  }

  if (ok) {
    console.log(`\nListo: ${slides.length} PNG a ${WIDTH}x${HEIGHT} en output/${id}/`);
  } else {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
