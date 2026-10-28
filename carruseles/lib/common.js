"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const WIDTH = 1080;
const HEIGHT = 1350;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Mark [word] spans as accent. */
function renderMarked(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(
    /\[([^\]]+)\]/g,
    '<span class="accent">$1</span>'
  );
}

/**
 * @param {{ theme?: "light" | "dark" }} [opts]
 */
function resolveLogoHtml(opts = {}) {
  const theme = opts.theme === "dark" ? "dark" : "light";
  const svgPath = path.join(ROOT, "assets", "logo.svg");
  const pngPath = path.join(ROOT, "assets", "logo.png");
  const wordmark = `<span class="logo-wordmark">decida.mx</span>`;

  if (fs.existsSync(svgPath)) {
    let svg = fs.readFileSync(svgPath, "utf8");
    if (theme === "dark") {
      // Wave was brand green — on emerald it vanishes; lift to white.
      svg = svg
        .replace(/fill="#0E482F"/gi, 'fill="#ffffff"')
        .replace(/fill="#05422c"/gi, 'fill="#ffffff"');
    }
    const mark = svg.replace(/<svg\b/, '<svg class="logo-mark" ');
    return `<div class="logo-lockup logo-lockup--${theme}" aria-label="decida.mx">${mark}${wordmark}</div>`;
  }

  if (fs.existsSync(pngPath)) {
    const data = fs.readFileSync(pngPath).toString("base64");
    return `<div class="logo-lockup logo-lockup--${theme}" aria-label="decida.mx"><img class="logo-mark" src="data:image/png;base64,${data}" alt="" />${wordmark}</div>`;
  }

  return `<div class="logo-lockup logo-lockup--text logo-lockup--${theme}" aria-label="decida.mx">${wordmark}</div>`;
}

/**
 * @param {string} iconName
 * @param {number} [size]
 * @param {{ stroke?: string }} [opts]
 */
function loadIconSvg(iconName, size = 120, opts = {}) {
  const stroke = opts.stroke || "#05422c";
  const fileName = `${iconName}.svg`;
  const candidates = [
    path.join(ROOT, "node_modules", "lucide-static", "icons", fileName),
    path.join(ROOT, "assets", "icons", fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      let svg = fs.readFileSync(candidate, "utf8");
      svg = svg
        .replace(/\swidth="[^"]*"/, ` width="${size}"`)
        .replace(/\sheight="[^"]*"/, ` height="${size}"`)
        .replace(/\sstroke="[^"]*"/g, ` stroke="${stroke}"`)
        .replace(/\sstroke-width="[^"]*"/g, ' stroke-width="2"');
      if (!/stroke=/.test(svg)) {
        svg = svg.replace("<svg", `<svg stroke="${stroke}"`);
      }
      return svg;
    }
  }

  throw new Error(
    `No se encontró el SVG del ícono "${iconName}" (buscado como ${fileName} en lucide-static/icons o assets/icons)`
  );
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

function loadCss(cssRelativePath) {
  const fontsDir = path.join(ROOT, "fonts");
  const cssRaw = fs.readFileSync(path.join(ROOT, cssRelativePath), "utf8");
  return cssRaw.replace(
    /url\("\.\.\/fonts\/([^"]+)"\)/g,
    (_, file) => `url("file://${path.join(fontsDir, file)}")`
  );
}

function clearNonPng(outDir) {
  if (!fs.existsSync(outDir)) return;
  for (const name of fs.readdirSync(outDir)) {
    if (!name.toLowerCase().endsWith(".png")) {
      fs.unlinkSync(path.join(outDir, name));
    }
  }
}

function wrapDocument(body, css, title) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
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

/**
 * @param {{
 *   id: string,
 *   cssPath: string,
 *   slideHtml: (slide: object, index: number, total: number, logoHtml: string) => string,
 *   logoTheme?: "light" | "dark",
 * }} opts
 */
async function renderCarousel(opts) {
  const { id, cssPath, slideHtml, logoTheme = "light" } = opts;

  const contentPath = path.join(ROOT, "content", `${id}.json`);
  if (!fs.existsSync(contentPath)) {
    throw new Error(`No existe content/${id}.json`);
  }

  ensureFonts();

  const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  const slides = content.slides;
  if (!Array.isArray(slides) || slides.length === 0) {
    throw new Error('El JSON debe incluir un array "slides" no vacío.');
  }

  const css = loadCss(cssPath);
  const logoHtml = resolveLogoHtml({ theme: logoTheme });
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
    const body = slideHtml(slides[i], i, slides.length, logoHtml);
    const html = wrapDocument(body, css, `Slide ${n} / ${slides.length}`);

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

  if (!ok) {
    process.exit(1);
  }

  console.log(`\nListo: ${slides.length} PNG a ${WIDTH}x${HEIGHT} en output/${id}/`);
}

module.exports = {
  ROOT,
  WIDTH,
  HEIGHT,
  escapeHtml,
  renderMarked,
  resolveLogoHtml,
  loadIconSvg,
  ensureFonts,
  loadCss,
  clearNonPng,
  wrapDocument,
  renderCarousel,
};
