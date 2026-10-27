// Renderiza as composições de tools/templates/art/*.html em imagens otimizadas dos templates.
// Uso: node tools/templates/render-art.mjs [portfolio|institucional|landing] [cena]
// Requer Playwright (Chromium) e Python 3 com Pillow (AVIF/WebP). Ferramenta de produção, não vai para a hospedagem.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

// Playwright vem pré-instalado no ambiente (require global) ou via `npm i -D playwright`.
const { chromium } = createRequire(import.meta.url)('playwright');

const repo = path.resolve(import.meta.dirname, '../..');
const tmp = path.join(repo, 'tools/templates/.cache');

// w × h: tamanho de captura. widths: larguras exportadas. jpg: largura do fallback <img src>.
const plan = {
  portfolio: [
    { scene: 'casa-brava-cover', w: 1100, h: 1375, widths: [640, 1100], jpg: 1100 },
    { scene: 'casa-brava-wide', w: 1600, h: 900, scale: 1.5, widths: [800, 1600, 2400], jpg: 1600 },
    { scene: 'casa-brava-label', w: 1100, h: 1375, widths: [640, 1100], jpg: 1100 },
    { scene: 'margem-poster', w: 1100, h: 1375, widths: [640, 1100], jpg: 1100 },
    { scene: 'margem-flatlay', w: 1400, h: 933, widths: [800, 1400], jpg: 1400 },
    { scene: 'mare-poster', w: 1100, h: 1467, out: 'mare-poster', widths: [640, 1100], jpg: 1100 },
    { scene: 'mare-tickets', w: 1100, h: 1100, widths: [640, 1100], jpg: 1100 },
    { scene: 'mare-grid', w: 1100, h: 1375, widths: [640, 1100], jpg: 1100 },
    { scene: 'raiz-signage', w: 1400, h: 933, widths: [800, 1400], jpg: 1400 },
    { scene: 'raiz-cards', w: 900, h: 1125, widths: [640, 900], jpg: 900 },
    { scene: 'studio', w: 1100, h: 1375, widths: [640, 1100], jpg: 1100 },
    { scene: 'archive-no', w: 640, h: 480, widths: [640], formats: ['webp'] },
    { scene: 'archive-serra', w: 640, h: 480, widths: [640], formats: ['webp'] },
    { scene: 'archive-fermento', w: 640, h: 480, widths: [640], formats: ['webp'] },
    { scene: 'archive-quadra', w: 640, h: 480, widths: [640], formats: ['webp'] },
    { scene: 'og', w: 1200, h: 630, widths: [], jpg: 1200, jpgName: 'og.jpg' },
    { scene: 'icon', w: 512, h: 512, icons: true },
  ],
  institucional: [
    { scene: 'hero-report', w: 1200, h: 1300, widths: [700, 1200], jpg: 1200 },
    { scene: 'case-padaria', w: 1200, h: 800, widths: [700, 1200], jpg: 1200 },
    { scene: 'case-clinica', w: 700, h: 467, scale: 1.5, widths: [700], jpg: 700 },
    { scene: 'case-software', w: 700, h: 467, scale: 1.5, widths: [700], jpg: 700 },
    { scene: 'og', w: 1200, h: 630, widths: [], jpg: 1200, jpgName: 'og.jpg' },
    { scene: 'icon', w: 512, h: 512, icons: true },
  ],
  landing: [
    { scene: 'og', w: 1200, h: 630, widths: [], jpg: 1200, jpgName: 'og.jpg' },
    { scene: 'icon', w: 512, h: 512, icons: true },
  ],
};

const selected = process.argv[2] ? [process.argv[2]] : Object.keys(plan);
const only = process.argv[3];

const server = http.createServer(async (req, res) => {
  try {
    const file = path.join(repo, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(repo)) throw new Error('fora');
    const ext = path.extname(file);
    const type = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type }).end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
}).listen(0);
const port = server.address().port;

await fs.mkdir(tmp, { recursive: true });
const browser = await chromium.launch();

for (const name of selected) {
  for (const item of plan[name]) {
    if (only && item.scene !== only) continue;
    const scale = item.scale || 1;
    const page = await browser.newPage({ viewport: { width: item.w, height: item.h }, deviceScaleFactor: scale });
    await page.goto(`http://localhost:${port}/tools/templates/art/${item.art || name}.html?scene=${item.scene}`);
    await page.waitForFunction(() => document.body.dataset.ready === '1');
    await page.waitForTimeout(item.wait || 150);
    const png = path.join(tmp, `${name}-${item.scene}.png`);
    await page.screenshot({ path: png });
    await page.close();

    const outDir = path.join(repo, 'templates', name, 'img');
    const job = { png, outDir, base: item.out || item.scene, widths: item.widths || [], formats: item.formats || ['avif', 'webp'], jpg: item.jpg || null, jpgName: item.jpgName || null, icons: !!item.icons };
    const py = spawnSync('python3', ['-I', path.join(import.meta.dirname, 'encode.py'), JSON.stringify(job)], { encoding: 'utf8' });
    if (py.status !== 0) { console.error(py.stderr); process.exitCode = 1; }
    else process.stdout.write(py.stdout);
  }
}
await browser.close();
server.close();
