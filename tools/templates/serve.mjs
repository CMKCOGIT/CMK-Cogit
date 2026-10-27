// Servidor local que imita a hospedagem de um template na raiz do subdomínio.
// Uso: node tools/templates/serve.mjs portfolio --port 5101
//      node tools/templates/serve.mjs --all   (portfolio:5101, institucional:5102, landing:5103)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const repo = path.resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

export function serve(name, port) {
  const root = path.join(repo, 'templates', name);
  const server = http.createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    let file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch {
      // Mesmo comportamento das hospedagens estáticas: 404.html com status 404.
      const body = await readFile(path.join(root, '404.html')).catch(() => 'Não encontrado');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(body);
    }
  });
  return new Promise((resolve) => server.listen(port, '0.0.0.0', () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const list = args.includes('--all') ? [['portfolio', 5101], ['institucional', 5102], ['landing', 5103]] : [[args[0] || 'portfolio', Number(arg('--port') || 5101)]];
  for (const [name, port] of list) {
    await serve(name, port);
    console.log(`${name}: http://localhost:${port}/`);
  }
}
