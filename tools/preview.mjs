// Local static preview. No build, package installation or external requests.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const args = process.argv.slice(2);
const getArg = key => { const i = args.indexOf(key); return i >= 0 ? args[i + 1] : undefined; };
const port = Number(getArg('--port') || process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.webp': 'image/webp' };
let rewrites = [];
try { rewrites = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8')).rewrites || []; } catch { /* sem vercel.json */ }
http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://preview.local').pathname);
    // mesmas rotas limpas do vercel.json (ex.: /blackcogit -> /blackcogit.html)
    const rota = rewrites.find(r => r.source === pathname);
    if (rota) pathname = rota.destination;
    let file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Página não encontrada');
  }
}).listen(port, '0.0.0.0', () => console.log(`COGIT preview ready on port ${port}`));
