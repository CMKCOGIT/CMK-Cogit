// Grava os vídeos de apresentação quadro a quadro a partir de tools/templates/motion/stage.html.
// Uso: node tools/templates/record-video.mjs [portfolio|institucional|landing] [--fps 30] [--draft]
// Saída: assets/videos/templates/<nome>.mp4 (H.264) e <nome>-poster.jpg no site principal.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const repo = path.resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
const names = args.filter((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const fps = Number(args[args.indexOf('--fps') + 1]) || 30;
const draft = args.includes('--draft');
const outDir = path.join(repo, 'assets/videos/templates');
await fs.mkdir(outDir, { recursive: true });

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const server = http.createServer(async (req, res) => {
  let file = path.join(repo, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try {
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
for (const name of names.length ? names : ['portfolio', 'institucional', 'landing']) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('erro na página:', e.message));
  await page.goto(`http://localhost:${port}/tools/templates/motion/stage.html?t=${name}`);
  await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 60000 });
  const duration = await page.evaluate(() => window.MOTION_DURATION);
  const total = Math.round(duration * fps);
  const file = path.join(outDir, `${name}.mp4`);

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', draft ? 'veryfast' : 'slow', '-crf', draft ? '28' : '21', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-movflags', '+faststart', '-an', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const started = Date.now();
  for (let i = 0; i < total; i++) {
    const t = i / fps;
    await page.evaluate((t) => window.renderAt(t), t);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
    // Pôster: quadro com o hero já revelado.
    if (Math.abs(t - 5.5) < 0.5 / fps) await fs.writeFile(path.join(outDir, `${name}-poster.jpg`), jpg);
    if (i % (fps * 3) === 0) process.stdout.write(`${name}: ${t.toFixed(0)}s/${duration}s\r`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  const { size } = await fs.stat(file);
  console.log(`${name}: ${path.relative(repo, file)} · ${(size / 1024 / 1024).toFixed(1)} MB · ${Math.round((Date.now() - started) / 1000)} s de gravação`);
  await page.close();
}
await browser.close();
server.close();
