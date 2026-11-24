// App instalável (PWA): mantém em dia, sem número para lembrar de trocar à mão,
//   1. o <head> de todas as páginas em português: manifest, ícone do iPhone, theme-color,
//      metas do modo app (iOS/Android), viewport-fit=cover e o script js/pwa.js;
//   2. os links de CSS e JS com ?v=<hash do arquivo>: mudou o arquivo, muda a URL,
//      e nem o navegador nem o service worker entregam a versão antiga;
//   3. a versão do cache do service worker (VERSION em sw.js) = hash do conteúdo dos assets.
// As páginas em inglês (en/) recebem os mesmos links versionados pelo tools/i18n/build.mjs.
//
// Uso: node tools/build-pwa.mjs          -> grava
//      node tools/build-pwa.mjs --check  -> falha se algo estiver desatualizado (npm run check)
// Fluxo completo: npm run gerar (CSS -> head/versões -> inglês -> versão do service worker).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const CHECK = process.argv.includes('--check');
export const THEME = '#1A2C52';   // --color-brand-600 (Marinho, primária)
const SW = path.join(root, 'sw.js');
const hash = (buf, n = 10) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, n);

// ── 2. ?v=<hash> nos links locais de CSS e JS ──
// overrides: { 'js/i18n-en.js': conteúdo } para arquivos que ainda vão ser gravados
export function versionar(html, relPage, overrides = {}) {
  return html.replace(/(<(?:link|script)\b[^>]*?\s(?:href|src)=")([^"?#:]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")/g, (all, pre, ref, post) => {
    if (ref.startsWith('//')) return all;
    const alvo = ref.startsWith('/') ? ref.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(relPage), ref));
    const conteudo = Object.hasOwn(overrides, alvo) ? overrides[alvo] : (fs.existsSync(path.join(root, alvo)) ? fs.readFileSync(path.join(root, alvo)) : null);
    if (conteudo == null) return all;
    return pre + ref + '?v=' + hash(conteudo, 8) + post;
  });
}

// ── 1. <head> do modo app ──
// Versão do site escolhida no app (js/pwa.js, seletor Celular | Computador), aplicada antes de desenhar:
//   computador num celular -> viewport de 1280 px; celular num monitor -> /celular.html (coluna de celular).
// Só vale no app instalado (display-mode: standalone) e fora do quadro de /celular.html.
export const MODO_SCRIPT = '<script data-cogit-modo>(function(){try{var m=localStorage.getItem("cogit_modo"),app=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;' +
  'if(!m||!app||window.top!==window.self)return;var a=screen.width,b=screen.height,p=Math.min(a,b)<=820&&matchMedia("(pointer: coarse)").matches;' +
  'if(m==="computador"){if(p){var v=document.querySelector(\'meta[name="viewport"]\');if(v){v.setAttribute("content","width=1280, viewport-fit=cover");var d=document.documentElement;d.classList.add("modo-pc");d.style.setProperty("--pwa-k",(1280/Math.min(a,b)).toFixed(2))}}return}' +
  'if(m==="celular"&&location.pathname!=="/celular.html"&&innerWidth>=1024&&(!p||innerWidth>Math.max(a,b)+20))location.replace("/celular.html?u="+encodeURIComponent(location.pathname+location.search+location.hash))}catch(e){}})()</script>';
function garantirHead(html, rel) {
  const up = '../'.repeat(rel.split('/').length - 1);
  const ind = (html.match(/\n([ \t]*)<meta charset/i) || [, '  '])[1];
  let s = html;
  const antesDoFim = (linha) => { s = s.replace(/\n?([ \t]*)<\/head>/i, (m, ws) => `\n${ind}${linha}\n${ws}</head>`); };

  // viewport com viewport-fit=cover (tela cheia respeitando notch via env(safe-area-inset-*))
  if (/<meta name="viewport"/.test(s)) {
    s = s.replace(/<meta name="viewport" content="([^"]*)"/, (m, c) => /viewport-fit=/.test(c) ? m : `<meta name="viewport" content="${c}, viewport-fit=cover"`);
  } else {
    s = s.replace(/(<meta charset="[^"]*">)/i, `$1\n${ind}<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`);
  }
  // trecho do seletor Celular | Computador logo depois da viewport (sempre a versão atual)
  s = s.replace(/\n?[ \t]*<script data-cogit-modo>[\s\S]*?<\/script>/, '');
  s = s.replace(/(\n([ \t]*)<meta name="viewport"[^>]*>)/, (m, all, ws) => `${all}\n${ws}${MODO_SCRIPT}`);
  if (!/rel="apple-touch-icon"/.test(s)) antesDoFim(`<link rel="apple-touch-icon" href="${up}apple-touch-icon.png">`);
  if (!/rel="manifest"/.test(s)) antesDoFim(`<link rel="manifest" href="${up}site.webmanifest">`);
  if (/<meta name="theme-color"/.test(s)) s = s.replace(/<meta name="theme-color" content="[^"]*">/, `<meta name="theme-color" content="${THEME}">`);
  else antesDoFim(`<meta name="theme-color" content="${THEME}">`);
  if (!/name="apple-mobile-web-app-capable"/.test(s)) {
    const bloco = [
      '<meta name="mobile-web-app-capable" content="yes">',
      '<meta name="apple-mobile-web-app-capable" content="yes">',
      '<meta name="apple-mobile-web-app-title" content="COGIT">',
      '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
    ].map((l) => ind + l).join('\n');
    s = s.replace(/([ \t]*<meta name="theme-color"[^>]*>)/, `$1\n${bloco}`);
  }
  // js/pwa.js logo depois de js/privacy.js (páginas de conteúdo)
  if (!/js\/pwa\.js/.test(s)) s = s.replace(/(\n([ \t]*)<script src="([^"]*)js\/privacy\.js[^"]*"><\/script>)/, (m, all, ws, pre) => `${all}\n${ws}<script src="${pre}js/pwa.js"></script>`);
  return s;
}

// ── 3. versão do cache do service worker ──
const ASSET_DIRS = ['css', 'js', 'assets/fonts', 'assets/images', 'assets/icons', 'assets/vendor'];
const ASSET_FILES = ['offline.html', 'site.webmanifest', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png'];
function walk(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.posix.join(dir, e.name)) : [path.posix.join(dir, e.name)]);
}
export function versaoSw(overrides = {}) {
  const arquivos = [...ASSET_DIRS.flatMap(walk), ...ASSET_FILES].sort();
  const h = crypto.createHash('sha256');
  for (const f of arquivos) h.update(f + '\0').update(Object.hasOwn(overrides, f) ? overrides[f] : fs.readFileSync(path.join(root, f))).update('\0');
  // o próprio sw.js (sem a versão) também entra: mudou a estratégia, muda o cache
  h.update(fs.readFileSync(SW, 'utf8').replace(/const VERSION = '[^']*';/, "const VERSION = '';"));
  return h.digest('hex').slice(0, 12);
}

// Páginas do site (mesmos critérios do tools/check.mjs); a verificação do Google fica de fora
export function paginas() {
  const ign = ['templates', 'tools', 'docs', 'node_modules', '.git', 'assets'];
  const w = (d) => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) =>
    ign.includes(e.name) ? [] : e.isDirectory() ? w(path.posix.join(d, e.name)) : e.name.endsWith('.html') && !e.name.startsWith('google') ? [path.posix.join(d, e.name)] : []);
  return w('.').map((p) => p.replace(/^\.\//, ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  let pendentes = 0;
  const gravar = (rel, atual, novo) => {
    if (atual === novo) return;
    if (CHECK) { console.error(rel + ' desatualizado: rode npm run gerar'); pendentes++; }
    else { fs.writeFileSync(path.join(root, rel), novo); console.log(rel + ' atualizado'); }
  };
  const lista = paginas();
  for (const rel of lista) {
    const atual = fs.readFileSync(path.join(root, rel), 'utf8');
    // en/ é gerado pelo tools/i18n/build.mjs (que já aplica versionar); aqui só se confere
    const novo = rel.startsWith('en/') ? versionar(atual, rel) : versionar(garantirHead(atual, rel), rel);
    gravar(rel, atual, novo);
  }
  const sw = fs.readFileSync(SW, 'utf8');
  gravar('sw.js', sw, sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${versaoSw()}';`));
  if (pendentes) process.exit(1);
  console.log(`PWA: ${lista.length} páginas em dia, service worker ${versaoSw()}`);
}
