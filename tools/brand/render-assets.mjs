// Renderiza os PNGs da marca a partir dos SVGs (Playwright/Chromium já instalado no ambiente).
// Uso: node tools/brand/render-assets.mjs   (rode antes: python3 tools/brand/build-logos.py)
// Depois: python3 tools/brand/make-ico.py  (gera favicon.ico de 16/32/48)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(require.resolve('playwright', { paths: ['/usr/lib/node_modules', '/usr/local/lib/node_modules'] }))); }

const root = path.resolve(import.meta.dirname, '..', '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const C = 'M52 8H24A16 16 0 0 0 8 24V40A16 16 0 0 0 24 56H52V46H24A6 6 0 0 1 18 40V24A6 6 0 0 1 24 18H52Z';
const fullBleed = (bg, fg, cur, k = 0.62) => {
  const s = 64 * k, o = (64 - s) / 2 + 1.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/><g transform="translate(${o} ${(64 - s) / 2}) scale(${k})"><path d="${C}" fill="${fg}"/><rect x="32" y="23" width="9" height="18" fill="${cur}"/></g></svg>`;
};
const fontCss = `@font-face{font-family:Any;src:url(file://${root}/assets/fonts/anybody-var.woff2);font-weight:100 900;font-stretch:50% 150%}
@font-face{font-family:Geist;src:url(file://${root}/assets/fonts/geist-var.woff2);font-weight:100 900}
@font-face{font-family:GMono;src:url(file://${root}/assets/fonts/geist-mono-var.woff2);font-weight:100 900}`;
const og = () => `<!doctype html><html><head><style>${fontCss}
body{margin:0;width:1200px;height:630px;background:#0A0F1E;color:#F1F4FA;font-family:Geist;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(241, 244, 250,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(241, 244, 250,.06) 1px,transparent 1px);background-size:60px 60px}
.big{position:absolute;right:-380px;top:-45px;width:720px;height:720px}
.in{position:absolute;left:72px;top:64px;right:72px;bottom:64px;display:flex;flex-direction:column;justify-content:space-between}
img{height:64px;width:auto;align-self:flex-start}
h1{font-family:Any;font-stretch:125%;font-weight:850;font-size:84px;position:relative;line-height:.92;letter-spacing:-.03em;margin:0}
h1 em{font-style:normal;color:#4DA8FF}
.tag{font:500 20px GMono;letter-spacing:.06em;color:rgba(241, 244, 250,.75)}
</style></head><body><div class="grid"></div><svg class="big" viewBox="0 0 64 64"><path d="${C}" fill="#2D4FFF"/><rect x="32" y="23" width="9" height="18" fill="#4DA8FF"/></svg>
<div class="in"><img src="file://${root}/assets/brand/logo/cmkcogit-horizontal-dark.svg">
<h1>Pensamos antes<br>de <em>construir.</em></h1>
<div class="tag">[ SITES · SISTEMAS · AUTOMAÇÕES · PRODUTOS DIGITAIS ]</div></div></body></html>`;

const jobs = [
  ['assets/images/icon-192.png', 192, 192, fullBleed('#0A0F1E', '#F1F4FA', '#4DA8FF')],
  ['assets/images/icon-512.png', 512, 512, fullBleed('#0A0F1E', '#F1F4FA', '#4DA8FF')],
  ['apple-touch-icon.png', 180, 180, fullBleed('#0A0F1E', '#F1F4FA', '#4DA8FF', 0.66)],
  ['assets/images/cmk-symbol.png', 192, 192, read('assets/brand/logo/cmkcogit-symbol-dark.svg')],
  ['assets/images/logo-white.png', 1024, 0, read('assets/brand/logo/cmkcogit-horizontal-dark.svg')],
  ['assets/brand/png/favicon-16.png', 16, 16, read('favicon.svg')],
  ['assets/brand/png/favicon-32.png', 32, 32, read('favicon.svg')],
  ['assets/brand/png/favicon-48.png', 48, 48, read('favicon.svg')],
  ['assets/brand/png/cmkcogit-app-ink-1024.png', 1024, 1024, read('assets/brand/logo/cmkcogit-app-ink.svg')],
  ['assets/brand/png/cmkcogit-app-eletrico-1024.png', 1024, 1024, read('assets/brand/logo/cmkcogit-app-eletrico.svg')],
  ['assets/brand/png/cmkcogit-horizontal-dark-2000.png', 2000, 0, read('assets/brand/logo/cmkcogit-horizontal-dark.svg')],
  ['assets/brand/png/cmkcogit-horizontal-light-2000.png', 2000, 0, read('assets/brand/logo/cmkcogit-horizontal-light.svg')],
  ['assets/brand/png/cmkcogit-avatar-1080.png', 1080, 1080, fullBleed('#0A0F1E', '#F1F4FA', '#4DA8FF', 0.5)],
  ['assets/images/og-cmkcogit-2026.png', 1200, 630, null, og()],
];

const browser = await chromium.launch();
fs.mkdirSync(path.join(root, 'assets/brand/png'), { recursive: true });
for (const [out, w, h0, svg, html] of jobs) {
  let h = h0;
  if (!h && svg) { const [, , vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number); h = Math.round(w * vh / vw); }
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const transparent = !html && !/<rect width="64" height="64"/.test(svg);
  if (html) { const tmp = path.join(os.tmpdir(), 'cmk-render.html'); fs.writeFileSync(tmp, html); await page.goto('file://' + tmp, { waitUntil: 'load' }); }
  else await page.setContent(`<html><body style="margin:0;background:transparent"><div style="width:${w}px;height:${h}px">${svg.replace('<svg ', `<svg width="${w}" height="${h}" `)}</div></body></html>`, { waitUntil: 'load' });
  if (html) await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, out), omitBackground: transparent });
  await page.close();
  console.log(out, w + 'x' + h);
}
await browser.close();
