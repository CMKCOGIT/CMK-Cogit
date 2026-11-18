// Versão em inglês do site (/en/) e botão PT | EN no header.
//
// Fonte única das traduções: tools/i18n/en.json
//   pages:    páginas que já têm versão em inglês (as demais levam o botão EN para /en/)
//   texts:    texto em português -> inglês (trecho exato, sem as tags; espaços normalizados)
//   patterns: [regex, substituição] para textos montados com valores (preços, contagens)
//
// Uso: node tools/i18n/build.mjs            -> gera en/<página>, js/i18n-en.js e o botão nas páginas
//      node tools/i18n/build.mjs --check    -> falha se algo estiver desatualizado ou sem tradução
//      node tools/i18n/build.mjs --extract  -> acrescenta ao en.json os textos ainda sem tradução ("")
// O texto gerado pelo JavaScript (diagnóstico, demonstração) é traduzido no navegador por js/i18n.js
// com o mesmo dicionário. Edite sempre o português e o en.json; não edite en/ nem js/i18n-en.js.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const DICT_FILE = path.join(root, 'tools/i18n/en.json');
const BASE = 'https://www.cmkcogit.com.br';
const MODE = process.argv.includes('--check') ? 'check' : process.argv.includes('--extract') ? 'extract' : 'build';
const dict = JSON.parse(fs.readFileSync(DICT_FILE, 'utf8'));
const PAGES = dict.pages;

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ENT[e]).replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;');
const escAttr = (s) => escText(s).replace(/"/g, '&quot;');
export const norm = (s) => s.replace(/[\s ]+/g, ' ').trim();
const hasWords = (s) => /\p{L}{2,}/u.test(s);
const patterns = (dict.patterns || []).map(([re, to, deep]) => [new RegExp('^' + re + '$', 'u'), to, !!deep]);
// trecho capturado: exato, em lista ("a, b e c") ou com a inicial maiúscula (igual ao js/i18n.js)
const lower = Object.fromEntries(Object.entries(dict.texts).filter(([, v]) => v).map(([k, v]) => [k.toLowerCase(), v]));
function part(x) {
  if (Object.hasOwn(dict.texts, x) && dict.texts[x]) return dict.texts[x];
  const r = lower[x.toLowerCase()];
  if (r != null) return x.charAt(0) === x.charAt(0).toLowerCase() && !/^[A-Z]{2}/.test(r) ? r.charAt(0).toLowerCase() + r.slice(1) : r;
  if (/, | e /.test(x)) return x.split(/(, | e )/).map((y) => (y === ', ' ? ', ' : y === ' e ' ? ' and ' : part(y))).join('');
  return x;
}

const missing = new Set();
function exact(key) {
  if (Object.hasOwn(dict.texts, key) && dict.texts[key]) return dict.texts[key];
  for (const [re, to, deep] of patterns) {
    const m = key.match(re);
    if (m) return to.replace(/\$(\d)/g, (_, n) => (deep ? part(m[n] || '') : m[n] || ''));
  }
  return null;
}
// exato; senão, partes separadas por " · " traduzidas uma a uma (o mesmo que js/i18n.js faz)
function tr(raw) {
  const key = norm(raw);
  if (!hasWords(key)) return null;
  let r = exact(key);
  if (r == null && key.includes(' · ')) {
    const parts = key.split(' · ').map((p) => (hasWords(p) ? exact(p) : p));
    if (parts.every((p) => p != null)) r = parts.join(' · ');
  }
  if (r == null) missing.add(key);
  return r;
}
// mantém os espaços das pontas do trecho original
const keepEdges = (raw, out) => raw.match(/^[\s ]*/)[0] + out + raw.match(/[\s ]*$/)[0];

const TRANS_ATTR = /\s(alt|aria-label|title|placeholder|data-tip)="([^"]*)"/g;
const META_TEXT = /^(description|og:title|og:description|og:image:alt|twitter:title|twitter:description)$/;

// Traduz um HTML: trechos de texto (fora de script/style) e atributos de leitura.
function translateHtml(html) {
  const out = [];
  const re = /(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]+>)|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[2] != null) {
      const t = tr(decode(m[2]));
      out.push(t == null ? m[2] : keepEdges(m[2], escText(t)));
      continue;
    }
    let tag = m[1];
    if (/^<(script|style)\b/i.test(tag) || tag.startsWith('<!--')) { out.push(tag); continue; }
    tag = tag.replace(TRANS_ATTR, (all, a, v) => { const t = tr(decode(v)); return t == null ? all : ` ${a}="${escAttr(t)}"`; });
    if (/^<meta\b/i.test(tag)) {
      const name = (tag.match(/\s(?:name|property)="([^"]+)"/) || [])[1] || '';
      if (META_TEXT.test(name)) tag = tag.replace(/\scontent="([^"]*)"/, (all, v) => { const t = tr(decode(v)); return t == null ? all : ` content="${escAttr(t)}"`; });
    }
    out.push(tag);
  }
  return out.join('');
}

// Caminhos: a página em inglês fica em en/<rel>. Links para páginas já traduzidas continuam
// dentro de en/; o resto aponta para o site em português.
const depth = (rel) => rel.split('/').length - 1;
function relinkForEn(html, rel) {
  const fromDir = path.posix.dirname('en/' + rel);
  return html.replace(/(\s(?:href|src|srcset|poster)=")([^"]*)"/g, (all, pre, val) => {
    const fix = (u) => {
      if (!u || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(u)) return u;
      const [p0, rest = ''] = u.split(/(?=[?#])/);
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), p0));
      // en/ espelha a árvore em português: link para página traduzida fica como está
      if (PAGES.includes(target) || (p0.endsWith('/') && PAGES.includes(target + '/index.html'))) return u;
      const dest = target;
      let r = path.posix.relative(fromDir, dest) || path.posix.basename(dest);
      if (p0.endsWith('/') && !r.endsWith('/')) r += '/';
      return r + rest;
    };
    if (pre.includes('srcset')) return pre + val.split(',').map((c) => { const [u, ...d] = c.trim().split(/\s+/); return [fix(u), ...d].join(' '); }).join(', ') + '"';
    return pre + fix(val) + '"';
  });
}
const urlOf = (rel) => BASE + '/' + rel.replace(/(^|\/)index\.html$/, '$1');

// ── Botão PT | EN (header e menu do celular) ──
const SWITCH = /\n?[ \t]*<!-- lang-switch -->[\s\S]*?<!-- \/lang-switch -->/g;
function langSwitch(rel, lang, where) {
  const up = '../'.repeat(depth(rel) + (lang === 'en' ? 1 : 0));
  const pt = up + rel;
  const en = lang === 'en' ? path.posix.basename(rel) : up + 'en/' + (PAGES.includes(rel) ? rel : 'index.html');
  const enLabel = PAGES.includes(rel) ? 'English version of this page' : 'English version (home page)';
  const item = (code, href, label, on, hl) => `<a href="${href}" class="lang-switch-link"${on ? ' aria-current="true"' : ''} hreflang="${hl}" lang="${hl}" data-lang="${code.toLowerCase()}" title="${label}">${code}</a>`;
  return `<!-- lang-switch --><div class="lang-switch lang-switch--${where}" role="group" aria-label="${lang === 'en' ? 'Language' : 'Idioma'}" translate="no">` +
    item('PT', pt, 'Versão em português', lang === 'pt', 'pt-BR') + '<span aria-hidden="true">|</span>' +
    item('EN', en, enLabel, lang === 'en', 'en') + '</div><!-- /lang-switch -->';
}
function withSwitch(html, rel, lang) {
  let s = html.replace(SWITCH, '');
  s = s.replace(/(\n[ \t]*)(<a [^>]*class="btn btn-primary btn-sm header-cta")/, (_, ws, a) => ws + langSwitch(rel, lang, 'header') + ws + a);
  s = s.replace(/(\n[ \t]*)(<div class="mobile-menu-badge">)/, (_, ws, d) => ws + langSwitch(rel, lang, 'mobile') + ws + d);
  return s;
}
// hreflang: só nas páginas com as duas versões
const ALT = /\n?[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*" data-i18n>/g;
function withAlternates(html, rel) {
  let s = html.replace(ALT, '');
  if (!PAGES.includes(rel)) return s;
  const links = [['pt-BR', urlOf(rel)], ['en', urlOf('en/' + rel)], ['x-default', urlOf(rel)]]
    .map(([h, u]) => `  <link rel="alternate" hreflang="${h}" href="${u}" data-i18n>`).join('\n');
  return s.replace(/(<link rel="canonical"[^>]*>)/, '$1\n' + links);
}

function buildEn(rel, ptHtml) {
  let s = translateHtml(ptHtml.replace(SWITCH, ''));
  s = relinkForEn(s, rel);
  s = s.replace(/<html lang="pt-BR">/, '<html lang="en">')
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${urlOf('en/' + rel)}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${urlOf('en/' + rel)}"`)
    .replace(/(<meta property="og:locale" content=")pt_BR"/, '$1en_US"')
    .replace(/\n?\s*<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/\n?\s*<meta name="google-site-verification"[^>]*>/, '');
  s = withAlternates(s, rel);
  s = withSwitch(s, rel, 'en');
  // dicionário e tradutor antes do primeiro script do corpo
  const up = '../'.repeat(depth(rel) + 1);
  s = s.replace(/(\n[ \t]*)(<script src="[^"]*js\/privacy\.js"><\/script>)/, `$1<script src="${up}js/i18n-en.js"></script>$1<script src="${up}js/i18n.js"></script>$1$2`);
  return '<!-- Gerado por tools/i18n/build.mjs a partir de ' + rel + ' e tools/i18n/en.json. Não edite. -->\n' + s;
}

function ptPages() {
  const walk = (d) => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) =>
    ['templates', 'tools', 'docs', 'assets', 'node_modules', 'en', '.git'].includes(e.name) ? []
      : e.isDirectory() ? walk(path.posix.join(d, e.name)) : e.name.endsWith('.html') && !e.name.startsWith('google') ? [path.posix.join(d, e.name)] : []);
  return walk('.').map((p) => p.replace(/^\.\//, ''));
}

const writes = [];
for (const rel of ptPages()) {
  const file = path.join(root, rel);
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes('class="header-actions"')) continue;
  const next = withAlternates(withSwitch(src, rel, 'pt'), rel);
  writes.push([file, next]);
  if (PAGES.includes(rel)) writes.push([path.join(root, 'en', rel), buildEn(rel, next)]);
}
const runtime = '/* Gerado por tools/i18n/build.mjs a partir de tools/i18n/en.json. Não edite. */\n' +
  'window.COGIT_I18N = ' + JSON.stringify({ lang: 'en', pages: PAGES, texts: Object.fromEntries(Object.entries(dict.texts).filter(([, v]) => v)), patterns: dict.patterns || [] }) + ';\n';
writes.push([path.join(root, 'js/i18n-en.js'), runtime]);

if (MODE === 'extract') {
  for (const k of [...missing].sort()) if (!Object.hasOwn(dict.texts, k)) dict.texts[k] = '';
  fs.writeFileSync(DICT_FILE, JSON.stringify(dict, null, 2) + '\n');
  console.log(missing.size + ' textos sem tradução em tools/i18n/en.json');
  process.exit(0);
}
let bad = 0;
if (missing.size) { console.error('Sem tradução (' + missing.size + '):\n  ' + [...missing].slice(0, 40).join('\n  ')); bad++; }
for (const [file, content] of writes) {
  const cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (cur === content) continue;
  if (MODE === 'check') { console.error(path.relative(root, file) + ' desatualizado: rode node tools/i18n/build.mjs'); bad++; }
  else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }
}
if (MODE === 'check' && bad) process.exit(1);
console.log('i18n: ' + PAGES.length + ' página(s) em inglês' + (missing.size ? ', ' + missing.size + ' sem tradução' : ''));
