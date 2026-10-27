// Aplica templates/<nome>/site.config.json às páginas: indexação, canonical, Open Graph,
// robots.txt, sitemap.xml, endpoint do formulário e arquivos da hospedagem.
// Uso: node tools/templates/configure.mjs [portfolio|institucional|landing]   (sem argumento: todos)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const repo = path.resolve(import.meta.dirname, '../..');
const names = process.argv[2] ? [process.argv[2]] : ['portfolio', 'institucional', 'landing'];

for (const name of names) {
  const dir = path.join(repo, 'templates', name);
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'site.config.json'), 'utf8'));
  const production = cfg.mode === 'production';
  const base = cfg.siteUrl ? cfg.siteUrl.replace(/\/+$/, '') : null;

  if (production && !base) throw new Error(`${name}: modo "production" exige "siteUrl".`);
  if (base && !/^https:\/\/[a-z0-9.-]+$/i.test(base)) throw new Error(`${name}: siteUrl deve ser https://dominio (sem caminho). Lembre: hífen, não sublinhado, em subdomínios.`);
  if (cfg.formEndpoint && !/^https:\/\//.test(cfg.formEndpoint)) throw new Error(`${name}: formEndpoint deve usar https.`);

  const pageUrl = (page) => base + '/' + (page === 'index.html' ? '' : page);
  const indexable = production ? cfg.indexable : [];

  for (const page of cfg.pages) {
    const file = path.join(dir, page);
    let html = fs.readFileSync(file, 'utf8');
    const block = html.match(/<!-- cmk:seo:start[^>]*-->\n([\s\S]*?)\s*<!-- cmk:seo:end -->/);
    if (!block) throw new Error(`${name}/${page}: bloco cmk:seo ausente.`);

    // Mantém título/descrição de compartilhamento e reescreve o que depende do ambiente.
    const keep = block[1].split('\n').map((l) => l.trim()).filter((l) => l && !/name="robots"|rel="canonical"|property="og:url"/.test(l));
    const lines = [`<meta name="robots" content="${indexable.includes(page) ? 'index, follow' : 'noindex, nofollow'}">`];
    if (base) lines.push(`<link rel="canonical" href="${pageUrl(page)}">`, `<meta property="og:url" content="${pageUrl(page)}">`);
    for (const l of keep) {
      lines.push(base ? l.replace(/(property="og:image" content=")(?!https?:)([^"]+)/, `$1${base}/$2`) : l.replace(/(property="og:image" content=")https?:\/\/[^/]+\//, '$1'));
    }
    html = html.replace(block[0], `<!-- cmk:seo:start — gerado por tools/templates/configure.mjs; não edite à mão -->\n  ${lines.join('\n  ')}\n  <!-- cmk:seo:end -->`);
    html = html.replace(/(<html lang="pt-BR") data-mode="[^"]*"/, `$1 data-mode="${production ? 'production' : 'demo'}"`);
    html = html.replace(/<form class="form" data-form(?: data-endpoint="[^"]*")?/, cfg.formEndpoint ? `<form class="form" data-form data-endpoint="${cfg.formEndpoint}"` : '<form class="form" data-form');
    html = html.replace(/(<script type="application\/ld\+json" id="schema">)([\s\S]*?)(<\/script>)/, (m, a, json, b) => {
      const data = JSON.parse(json);
      const target = data.mainEntity || data;
      if (base) target.url = base + '/'; else delete target.url;
      return `${a}\n  ${JSON.stringify(data, null, 2).replace(/\n/g, '\n  ')}\n  ${b}`;
    });
    fs.writeFileSync(file, html);
  }

  // O aviso de demonstração só aparece no modo demo.
  for (const page of cfg.pages) {
    const file = path.join(dir, page);
    const html = fs.readFileSync(file, 'utf8').replace(/(<p class="demo-note" data-demo-note)( hidden)?>/, `$1${production ? ' hidden' : ''}>`);
    fs.writeFileSync(file, html);
  }

  // robots.txt: rastreamento liberado nos dois modos, para que os buscadores leiam o noindex da demonstração.
  const robots = production
    ? `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`
    : `# Ambiente de demonstração: as páginas usam <meta name="robots" content="noindex">.\n# O rastreamento continua liberado para que essa diretiva seja lida.\nUser-agent: *\nAllow: /\n`;
  fs.writeFileSync(path.join(dir, 'robots.txt'), robots);

  const sitemap = path.join(dir, 'sitemap.xml');
  if (production) {
    const today = new Date().toISOString().slice(0, 10);
    const urls = indexable.map((p) => `  <url>\n    <loc>${pageUrl(p)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n');
    fs.writeFileSync(sitemap, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  } else if (fs.existsSync(sitemap)) {
    fs.rmSync(sitemap); // demonstração não tem URLs indexáveis
  }

  writeHostFiles(dir, cfg);
  console.log(`${name}: ${production ? 'produção' : 'demonstração'}${base ? ' · ' + base : ''}${cfg.host ? ' · hospedagem ' + cfg.host : ''}`);
}

function writeHostFiles(dir, cfg) {
  for (const f of ['_headers', 'vercel.json', '.htaccess']) fs.rmSync(path.join(dir, f), { force: true });
  if (!cfg.host || cfg.host === 'github-pages') return; // GitHub Pages não aceita cabeçalhos personalizados.

  const inline = "document.documentElement.classList.add('js')";
  const hash = crypto.createHash('sha256').update(inline).digest('base64');
  const connect = ["'self'", cfg.formEndpoint ? new URL(cfg.formEndpoint).origin : ''].filter(Boolean).join(' ');
  const csp = `default-src 'self'; script-src 'self' 'sha256-${hash}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src ${connect}; form-action 'self' mailto:; frame-ancestors 'self' ${cfg.allowEmbedFrom || ''}; base-uri 'self'; object-src 'none'`.replace(/\s+;/g, ';');
  const headers = {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
  const cacheAssets = 'public, max-age=31536000, immutable';

  if (cfg.host === 'netlify' || cfg.host === 'cloudflare-pages') {
    const out = ['/*', ...Object.entries(headers).map(([k, v]) => `  ${k}: ${v}`), '', '/fonts/*', `  Cache-Control: ${cacheAssets}`, '', '/img/*', '  Cache-Control: public, max-age=2592000', ''];
    fs.writeFileSync(path.join(dir, '_headers'), out.join('\n'));
  } else if (cfg.host === 'vercel') {
    const json = {
      cleanUrls: false,
      headers: [
        { source: '/(.*)', headers: Object.entries(headers).map(([key, value]) => ({ key, value })) },
        { source: '/fonts/(.*)', headers: [{ key: 'Cache-Control', value: cacheAssets }] },
        { source: '/img/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
      ],
    };
    fs.writeFileSync(path.join(dir, 'vercel.json'), JSON.stringify(json, null, 2) + '\n');
  } else if (cfg.host === 'apache') {
    const out = [
      'ErrorDocument 404 /404.html',
      'Options -Indexes',
      'AddType image/avif .avif',
      'AddType application/manifest+json .webmanifest',
      '<IfModule mod_rewrite.c>',
      '  RewriteEngine On',
      '  RewriteCond %{HTTPS} off',
      '  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
      '  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]',
      '  RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]',
      '</IfModule>',
      '<IfModule mod_headers.c>',
      ...Object.entries(headers).map(([k, v]) => `  Header always set ${k} "${v}"`),
      '  <FilesMatch "\\.(woff2)$">',
      `    Header set Cache-Control "${cacheAssets}"`,
      '  </FilesMatch>',
      '  <FilesMatch "\\.(avif|webp|jpg|png|svg)$">',
      '    Header set Cache-Control "public, max-age=2592000"',
      '  </FilesMatch>',
      '</IfModule>',
      '',
    ];
    fs.writeFileSync(path.join(dir, '.htaccess'), out.join('\n'));
  } else {
    throw new Error(`host desconhecido: ${cfg.host}`);
  }
}
