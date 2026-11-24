// Gera os ícones do app (PWA) a partir do símbolo vetorial assets/images/icone-cogit.svg:
//   assets/images/icon-192.png, icon-512.png      -> "any" (fundo grafite, símbolo papel)
//   assets/images/icon-maskable-512.png           -> "maskable" (margem de segurança para o Android recortar)
//   apple-touch-icon.png (180×180)                -> fundo sólido, sem transparência (o iOS pinta de preto)
// Uso: node tools/pwa-icons.mjs   (usa o Playwright/Chromium já instalado na máquina, como tools/templates)
// Depois de gerar, rode node tools/build-pwa.mjs para atualizar a versão do cache do service worker.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const FUNDO = '#121314';   // --ink (grafite), igual aos ícones anteriores
const SIMBOLO = '#F3F3F1'; // --paper

const svg = fs.readFileSync(path.join(root, 'assets/images/icone-cogit.svg'), 'utf8');
const viewBox = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const paths = [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);

// escala: largura do símbolo em relação ao lado do ícone
const SAIDAS = [
  ['assets/images/icon-192.png', 192, 0.62],
  ['assets/images/icon-512.png', 512, 0.62],
  ['assets/images/icon-maskable-512.png', 512, 0.52], // dentro do círculo seguro (80% do lado)
  ['apple-touch-icon.png', 180, 0.62],
];

function pagina(lado, escala) {
  const [x, y, w, h] = viewBox;
  const larg = lado * escala;
  const alt = larg * (h / w);
  return `<!doctype html><html><body style="margin:0;background:${FUNDO}">
<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}" style="display:block">
<rect width="${lado}" height="${lado}" fill="${FUNDO}"/>
<svg x="${(lado - larg) / 2}" y="${(lado - alt) / 2}" width="${larg}" height="${alt}" viewBox="${x} ${y} ${w} ${h}">
<g fill="${SIMBOLO}">${paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg></svg></body></html>`;
}

const browser = await chromium.launch();
try {
  for (const [rel, lado, escala] of SAIDAS) {
    const page = await browser.newPage({ viewport: { width: lado, height: lado }, deviceScaleFactor: 1 });
    await page.setContent(pagina(lado, escala));
    // omitBackground: false -> PNG opaco (sem canal alfa transparente)
    await page.screenshot({ path: path.join(root, rel), omitBackground: false, clip: { x: 0, y: 0, width: lado, height: lado } });
    await page.close();
    console.log(rel, lado + '×' + lado);
  }
} finally {
  await browser.close();
}
