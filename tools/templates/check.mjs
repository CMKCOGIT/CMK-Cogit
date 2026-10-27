// Verificação automatizada dos três templates no navegador.
// Uso: node tools/templates/check.mjs [portfolio|institucional|landing]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { serve } from './serve.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const repo = path.resolve(import.meta.dirname, '../..');
const names = process.argv[2] ? [process.argv[2]] : ['portfolio', 'institucional', 'landing'];
const widths = [1440, 1024, 768, 390, 320];
let failures = 0;
let passes = 0;

async function step(label, fn) {
  try { await fn(); passes++; console.log('  ok   ', label); }
  catch (e) { failures++; console.log('  FALHA', label, '\n        ', e.message.split('\n')[0], e.actual !== undefined && typeof e.actual === 'object' ? JSON.stringify(e.actual) : ''); }
}

const browser = await chromium.launch();
let port = 5201;

for (const name of names) {
  const dir = path.join(repo, 'templates', name);
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'site.config.json'), 'utf8'));
  const server = await serve(name, port);
  const base = `http://localhost:${port++}/`;
  console.log(`\n${name} (${cfg.mode})`);

  const open = async (opts = {}, url = base) => {
    const ctx = await browser.newContext({ viewport: { width: opts.width || 1440, height: opts.height || 900 }, reducedMotion: opts.reducedMotion || 'no-preference', javaScriptEnabled: opts.js !== false, hasTouch: opts.touch || false });
    const page = await ctx.newPage();
    const problems = [];
    page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(m.text()); });
    page.on('pageerror', (e) => problems.push(e.message));
    page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/nao-existe')) problems.push(`${r.status()} ${r.url()}`); });
    page.on('requestfailed', (r) => { if (!/wa\.me|mailto/.test(r.url())) problems.push('falhou ' + r.url()); });
    await page.goto(url, { waitUntil: 'networkidle' });
    return { ctx, page, problems };
  };
  const scrollThrough = (page, dir = 'down') => page.evaluate(async (dir) => {
    const h = document.documentElement.scrollHeight;
    const ys = []; for (let y = 0; y <= h; y += Math.round(innerHeight * 0.6)) ys.push(y);
    if (dir === 'up') ys.reverse();
    for (const y of ys) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  }, dir);

  for (const page of cfg.pages) {
    const html = fs.readFileSync(path.join(dir, page), 'utf8');
    await step(`${page}: estrutura, metadados e indexação`, async () => {
      assert.match(html, /<html lang="pt-BR"/);
      assert.match(html, /<meta charset="utf-8">/);
      assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
      assert.match(html, /<title>[^<]{20,70}<\/title>/, 'título entre 20 e 70 caracteres');
      const desc = html.match(/name="description" content="([^"]+)"/);
      assert.ok(desc && desc[1].length >= 70 && desc[1].length <= 165, 'descrição entre 70 e 165 caracteres');
      const robots = html.match(/name="robots" content="([^"]+)"/)[1];
      const expected = cfg.mode === 'production' && cfg.indexable.includes(page) ? 'index, follow' : 'noindex, nofollow';
      assert.equal(robots, expected);
      if (cfg.siteUrl) assert.match(html, /rel="canonical" href="https:\/\//); else assert.doesNotMatch(html, /rel="canonical"/);
      assert.equal((html.match(/<h1\b/g) || []).length, 1, 'um único h1');
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(new Set(ids).size, ids.length, 'ids únicos');
      for (const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(m[1]), `âncora #${m[1]} existe`);
      for (const m of html.matchAll(/(?:href|src|srcset)="([^"#:]+?)(?:\s\d+w)?"/g)) {
        for (const ref of m[1].split(',').map((s) => s.trim().split(' ')[0]).filter(Boolean)) {
          if (/^(https?:|mailto:|tel:|\.\/$|\/$)/.test(ref)) continue;
          const clean = ref.replace(/^\.\//, '').replace(/#.*$/, '');
          if (clean) assert.ok(fs.existsSync(path.join(dir, clean)), `arquivo existe: ${ref}`);
        }
      }
      if (/ld\+json/.test(html)) JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1]);
    });
  }

  await step('robots.txt, sitemap e 404 servidos corretamente', async () => {
    const r = await fetch(base + 'robots.txt');
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-type'), /text\/plain/);
    const s = await fetch(base + 'sitemap.xml');
    if (cfg.mode === 'production') {
      assert.equal(s.status, 200);
      const xml = await s.text();
      for (const p of cfg.indexable) assert.ok(xml.includes(cfg.siteUrl.replace(/\/$/, '') + '/' + (p === 'index.html' ? '' : p)));
    } else assert.equal(s.status, 404, 'demonstração não publica sitemap');
    const nf = await fetch(base + 'nao-existe');
    assert.equal(nf.status, 404);
    assert.match(await nf.text(), /<h1/);
    const m = await fetch(base + 'site.webmanifest');
    JSON.parse(await m.text());
  });

  for (const width of widths) {
    await step(`${width}px: sem erros, sem rolagem horizontal, imagens e toques adequados`, async () => {
      const { ctx, page, problems } = await open({ width, height: width < 800 ? 844 : 900 });
      await scrollThrough(page);
      const res = await page.evaluate((width) => {
        const out = { overflow: document.documentElement.scrollWidth - innerWidth, broken: [], noAlt: [], noSize: [], small: [] };
        document.querySelectorAll('img').forEach((img) => {
          if (!img.closest('[aria-hidden="true"]') && !img.hasAttribute('alt')) out.noAlt.push(img.src);
          if (!img.closest('[data-archive-preview]') && (!img.getAttribute('width') || !img.getAttribute('height'))) out.noSize.push(img.src);
          if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) out.broken.push(img.src);
        });
        if (width <= 400) document.querySelectorAll('a, button, input, select, summary').forEach((el) => {
          const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
          if (!r.width || cs.visibility === 'hidden' || el.closest('[aria-hidden="true"], .hp, .skip-link, .sticky-cta, p, label, li:not(.archive-row), dd, figcaption')) return;
          if (el.type === 'checkbox' || el.type === 'radio') return;
          if (r.height < 40) out.small.push(`${el.tagName} "${(el.textContent || el.name || '').trim().slice(0, 30)}" ${Math.round(r.height)}px`);
        });
        return out;
      }, width);
      assert.ok(res.overflow <= 0, `rolagem horizontal de ${res.overflow}px`);
      assert.deepEqual(res.broken, [], 'imagens quebradas');
      assert.deepEqual(res.noAlt, [], 'imagens sem alt');
      assert.deepEqual(res.noSize, [], 'imagens sem width/height');
      assert.deepEqual(res.small, [], 'alvos de toque abaixo de 40px');
      assert.deepEqual(problems, [], 'console/rede');
      await ctx.close();
    });
  }

  await step('revelação funciona descendo e subindo', async () => {
    const { ctx, page } = await open({ width: 1440 });
    await scrollThrough(page, 'down');
    await page.waitForTimeout(300);
    const down = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => { if (!el.getClientRects().length) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.85 && r.bottom > 40; }).every((el) => el.classList.contains('is-in')));
    assert.ok(down, 'elementos visíveis no fim da página revelados');
    const hidden = await page.evaluate(() => document.querySelectorAll('[data-reveal]:not(.is-in)').length);
    assert.ok(hidden > 0, 'elementos fora da tela voltam ao estado inicial');
    await scrollThrough(page, 'up');
    await page.waitForTimeout(2000);
    const top = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter((el) => el.getClientRects().length && el.getBoundingClientRect().top < innerHeight * 0.85).filter((el) => !(el.classList.contains('is-in') && getComputedStyle(el).opacity === '1')).map((el) => el.className + ' ' + el.textContent.trim().slice(0, 30)));
    assert.deepEqual(top, [], 'conteúdo do topo revelado ao voltar');
    await ctx.close();
  });

  await step('conteúdo acessível sem JavaScript e com movimento reduzido', async () => {
    for (const opts of [{ js: false }, { reducedMotion: 'reduce' }]) {
      const { ctx, page } = await open({ width: 1024, ...opts });
      const invisible = await page.evaluate(() => [...document.querySelectorAll('main h1, main h2, main h3, main p')].filter((el) => {
        if (el.closest('[hidden], .hp, [aria-hidden="true"], .scene-shot, .device-wrap')) return false;
        let n = el; while (n && n !== document.body) { if (getComputedStyle(n).opacity === '0') return true; n = n.parentElement; }
        return false;
      }).length);
      assert.equal(invisible, 0, `${opts.js === false ? 'sem JS' : 'movimento reduzido'}: ${invisible} textos invisíveis`);
      await ctx.close();
    }
  });

  await step('teclado: link de pular conteúdo e foco visível', async () => {
    const { ctx, page } = await open({ width: 1440 });
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => document.activeElement.className);
    assert.match(first, /skip-link/);
    const outline = await page.evaluate(() => { const el = document.activeElement; const s = getComputedStyle(el); return s.outlineStyle !== 'none' || s.boxShadow !== 'none' || s.transform !== 'none'; });
    assert.ok(outline);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => location.hash), '#conteudo');
    await ctx.close();
  });

  await step('heading sem saltos de nível', async () => {
    const { ctx, page } = await open({ width: 1440 });
    const levels = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]));
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] - levels[i - 1] <= 1, `salto h${levels[i - 1]} → h${levels[i]}`);
    await ctx.close();
  });

  await step('formulário: erros acessíveis e envio validado', async () => {
    const { ctx, page } = await open({ width: 1024 });
    const form = page.locator('[data-form]');
    await form.scrollIntoViewIfNeeded();
    await form.locator('[type="submit"]').click();
    const invalid = await form.locator('[aria-invalid="true"]').count();
    assert.ok(invalid >= 2, 'campos obrigatórios marcados');
    const focusedInvalid = await page.evaluate(() => document.activeElement.getAttribute('aria-invalid'));
    assert.equal(focusedInvalid, 'true', 'foco no primeiro erro');
    assert.match(await form.locator('[data-form-status]').textContent(), /Revise|Falta/);
    await form.locator('input[type="email"]').fill('inválido');
    await form.locator('input[type="email"]').blur();
    assert.match(await page.locator('#' + (await form.locator('input[type="email"]').getAttribute('id')) + '-erro').textContent(), /válido/);
    for (const input of await form.locator('input[required]').all()) {
      const type = await input.getAttribute('type');
      if (type === 'checkbox') await input.check();
      else if (type === 'email') await input.fill('maria@empresa.com.br');
      else if (type === 'tel') await input.fill('(11) 91234-5678');
      else await input.fill('Maria Souza');
    }
    for (const sel of await form.locator('select[required]').all()) await sel.selectOption({ index: 1 });
    for (const ta of await form.locator('textarea[required]').all()) await ta.fill('Somos uma empresa pequena e queremos renovar a marca neste ano.');
    await form.locator('[type="submit"]').click();
    const status = await form.locator('[data-form-status]').textContent();
    assert.match(status, cfg.mode === 'production' ? /./ : /demonstração/);
    assert.equal(await form.locator('[aria-invalid="true"]').count(), 0);
    await ctx.close();
  });

  await step('celular: menu e navegação', async () => {
    const { ctx, page } = await open({ width: 390, height: 844, touch: true });
    const toggle = page.locator('[data-menu-toggle]');
    if (await toggle.count()) {
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      const link = page.locator('nav a[href^="#"]').first();
      assert.ok(await link.isVisible(), 'links visíveis no menu aberto');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      await toggle.click();
      await link.click();
      await page.waitForTimeout(900);
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'menu fecha ao navegar');
      assert.ok(await page.evaluate(() => scrollY > 200), 'rolou até a seção');
    } else {
      // Landing: CTA principal sempre acessível; o fixo aparece após o hero.
      await page.evaluate(() => window.scrollTo(0, innerHeight * 2));
      await page.waitForTimeout(700);
      assert.ok(await page.locator('[data-sticky-cta].is-visible').count(), 'CTA fixo visível após o hero');
      await page.locator('#demonstracao').scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      assert.equal(await page.locator('[data-sticky-cta].is-visible').count(), 0, 'CTA fixo some perto do formulário');
    }
    await ctx.close();
  });

  await step('Web Vitals de laboratório (LCP < 2,5 s, CLS < 0,1) e peso inicial', async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    // Rede 4G lenta e CPU 4x mais lenta, como no Lighthouse móvel.
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    let bytes = 0;
    cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });
    await page.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const initial = bytes;
    await scrollThrough(page);
    const { lcp, cls } = await page.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls }));
    console.log(`         LCP ${Math.round(lcp)} ms · CLS ${cls.toFixed(3)} · carga inicial ${Math.round(initial / 1024)} KB · total ${Math.round(bytes / 1024)} KB`);
    assert.ok(lcp < 2500, `LCP ${Math.round(lcp)} ms`);
    assert.ok(cls < 0.1, `CLS ${cls.toFixed(3)}`);
    await ctx.close();
  });

  server.close();
}

await browser.close();
console.log(`\n${passes} verificações aprovadas, ${failures} falhas.`);
process.exitCode = failures ? 1 : 0;
