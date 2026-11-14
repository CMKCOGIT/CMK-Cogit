/* Modelos prontos de landing page CMKCOGIT: painel "Personalizar" (o mesmo em todos os níveis).
   Fonte única: tools/templates/base/landing-editor.js. Cada modelo recebe uma cópia idêntica em js/editor.js.
   O modelo se identifica na tag <script data-lp-editor data-model="..." data-model-name="...">.
   Cores, textos, imagens, seções e links, com prévia imediata na própria página.
   Textos, cores e links ficam no localStorage; as imagens, no IndexedDB do navegador.
   "Baixar site pronto" gera o index.html final, sem este painel, com tudo aplicado.
   "Exportar configuração" gera um .json para a equipe CMKCOGIT publicar. */
(function () {
  'use strict';
  var SCRIPT = document.querySelector('script[data-lp-editor]') || { dataset: {} };
  var MODEL = SCRIPT.dataset.model || 'landing';
  var MODEL_NAME = SCRIPT.dataset.modelName || 'Landing Page';
  var STORE = SCRIPT.dataset.store || ('cmk-' + MODEL);
  var KEY = STORE + ':v1';
  var LP = window.LP || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ── Cores ─────────────────────────────────────────────
  var COLOR_FIELDS = [
    ['primary', 'Cor principal', 'Botões, ícones e chamada para ação'],
    ['secondary', 'Cor secundária', 'Fundos suaves e seção de diferenciais'],
    ['accent', 'Cor de destaque', 'Detalhes, selos e botão da chamada final'],
    ['bg', 'Cor de fundo', 'Fundo geral da página'],
    ['heading', 'Cor dos títulos', 'Títulos e rodapé'],
    ['text', 'Cor dos textos', 'Parágrafos e descrições']
  ];
  var PALETTES = [
    { name: 'Sálvia', c: { primary: '#1f5f4a', secondary: '#e8efe9', accent: '#e0893a', bg: '#f7f5f0', heading: '#14231d', text: '#46524c' } },
    { name: 'Oceano', c: { primary: '#1d4ed8', secondary: '#e6edfb', accent: '#f59e0b', bg: '#f8fafc', heading: '#0f172a', text: '#475569' } },
    { name: 'Terracota', c: { primary: '#b4472b', secondary: '#f5e8df', accent: '#2f6f73', bg: '#fbf7f2', heading: '#2a1810', text: '#5c4a40' } },
    { name: 'Ameixa', c: { primary: '#6b2fa3', secondary: '#f0e9f8', accent: '#e8577a', bg: '#fbf9fd', heading: '#1e1230', text: '#55496a' } },
    { name: 'Grafite', c: { primary: '#18181b', secondary: '#ececee', accent: '#d4a72c', bg: '#fafafa', heading: '#09090b', text: '#52525b' } },
    { name: 'Coral', c: { primary: '#d9435e', secondary: '#fde9ec', accent: '#2b8a80', bg: '#fffafa', heading: '#2a1218', text: '#5e4a4f' } },
    { name: 'Petróleo', c: { primary: '#0f5e6b', secondary: '#e3f0f1', accent: '#f2b33d', bg: '#f6f8f8', heading: '#0b2a30', text: '#44585c' } },
    { name: 'Noite', c: { primary: '#7c9cff', secondary: '#1c2236', accent: '#ffb86b', bg: '#11151f', heading: '#f3f5fb', text: '#b3bad0' } }
  ];

  function normHex(v) {
    v = String(v || '').trim().replace(/^#?/, '#').toLowerCase();
    if (/^#[0-9a-f]{3}$/.test(v)) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    return /^#[0-9a-f]{6}$/.test(v) ? v : null;
  }
  function lum(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); })
      .reduce(function (a, c, i) { return a + c * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function onColor(hex) { return contrast(hex, '#ffffff') >= contrast(hex, '#111111') ? '#ffffff' : '#111111'; }

  // ── Estado ─────────────────────────────────────────────
  var defaults = { colors: {}, texts: {}, links: {} };
  var state = { colors: {}, texts: {}, links: {}, hidden: [], images: {} };

  // Valores iniciais lidos do próprio HTML (os textos demonstrativos).
  var themeEl = $('#lp-theme');
  var cs = getComputedStyle(document.documentElement);
  COLOR_FIELDS.forEach(function (f) { defaults.colors[f[0]] = normHex(cs.getPropertyValue('--c-' + f[0])) || '#000000'; });
  $$('[data-k]').forEach(function (el) { var k = el.dataset.k; if (!(k in defaults.texts)) defaults.texts[k] = el.textContent.trim(); });
  $$('[data-href]').forEach(function (el) { var k = el.dataset.href; if (!(k in defaults.links)) defaults.links[k] = el.getAttribute('href') || ''; });

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ colors: state.colors, texts: state.texts, links: state.links, hidden: state.hidden, images: stripSrc(state.images) })); } catch (e) { /* armazenamento indisponível */ }
  }
  function stripSrc(images) {
    var o = {};
    Object.keys(images).forEach(function (k) { var i = images[k]; if (i) o[k] = { x: i.x, y: i.y, zoom: i.zoom, alt: i.alt, has: !!i.src }; });
    return o;
  }

  // IndexedDB para as imagens (dataURL comprimido).
  var dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      try {
        var r = indexedDB.open(STORE, 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('images'); };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      } catch (e) { rej(e); }
    });
    return dbp;
  }
  function idb(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction('images', mode); var st = tx.objectStore('images'); var out = fn(st);
        tx.oncomplete = function () { res(out && out.result); }; tx.onerror = function () { rej(tx.error); };
      });
    }).catch(function () { return null; });
  }
  var putImg = function (k, v) { return idb('readwrite', function (s) { return v == null ? s.delete(k) : s.put(v, k); }); };
  var getImg = function (k) { return idb('readonly', function (s) { return s.get(k); }); };

  // ── Aplicar na página ─────────────────────────────────
  function colors() { var c = {}; COLOR_FIELDS.forEach(function (f) { c[f[0]] = state.colors[f[0]] || defaults.colors[f[0]]; }); return c; }
  function applyColors() {
    var c = colors();
    var css = ':root{' + COLOR_FIELDS.map(function (f) { return '--c-' + f[0] + ':' + c[f[0]]; }).join(';') +
      ';--c-on-primary:' + onColor(c.primary) + ';--c-on-accent:' + onColor(c.accent) + '}';
    if (themeEl) themeEl.textContent = css;
    var meta = $('meta[name="theme-color"]'); if (meta) meta.content = c.bg;
  }
  // Limite de cada texto: proporcional ao texto do modelo, para não estourar o layout.
  // Um elemento pode definir o próprio limite com data-max="120".
  var limits = {};
  function limitOf(k) {
    if (limits[k]) return limits[k];
    var node = $('[data-k="' + k + '"]');
    var fixed = node && parseInt(node.getAttribute('data-max'), 10);
    var base = (defaults.texts[k] || '').length;
    var max = fixed > 0 ? fixed : base <= 30 ? Math.max(base + 12, Math.round(base * 1.5)) : Math.round(base * 1.35) + 10;
    limits[k] = Math.min(max, 420);
    return limits[k];
  }
  // Corta no limite e permite no máximo 2 quebras de linha seguidas (e 4 no total).
  function clampText(k, v) {
    v = String(v == null ? '' : v).replace(/\n{3,}/g, '\n\n');
    var lines = v.split('\n'); if (lines.length > 5) v = lines.slice(0, 5).join('\n') + ' ' + lines.slice(5).join(' ');
    return v.slice(0, limitOf(k));
  }
  function text(k) { return k in state.texts ? clampText(k, state.texts[k]) : defaults.texts[k]; }
  function link(k) { return k in state.links ? state.links[k] : defaults.links[k]; }
  function applyTexts(onlyKey) {
    $$(onlyKey ? '[data-k="' + onlyKey + '"]' : '[data-k]').forEach(function (el) { el.textContent = text(el.dataset.k); });
    if (onlyKey === 'brand.name' || !onlyKey) { $$('[data-brand-mark]').forEach(function (m) { m.textContent = (text('brand.name') || ' ').trim().charAt(0).toUpperCase(); }); }
    if (LP.syncInitials) LP.syncInitials();
  }
  function applyLinks() {
    $$('[data-href]').forEach(function (el) {
      var v = (link(el.dataset.href) || '').trim();
      var box = el.parentElement && el.parentElement.tagName === 'LI' && el.parentElement.children.length === 1 ? el.parentElement : el;
      if (v) { el.setAttribute('href', v); box.hidden = false; el.hidden = false; box.removeAttribute('data-lpe-off'); }
      else { el.setAttribute('href', '#'); box.hidden = true; box.setAttribute('data-lpe-off', ''); }
      var external = /^https?:/i.test(v) && !/^#/.test(v);
      if (external) { el.target = '_blank'; el.rel = 'noopener'; } else { el.removeAttribute('target'); el.removeAttribute('rel'); }
    });
  }
  function applySections() {
    $$('[data-section]').forEach(function (s) {
      var off = state.hidden.indexOf(s.dataset.section) !== -1;
      if (off) s.setAttribute('data-hidden-section', ''); else s.removeAttribute('data-hidden-section');
      if (s.id) $$('.nav a[href="#' + s.id + '"], [data-nav-links] a[href="#' + s.id + '"]').forEach(function (a) {
        var box = a.parentElement && a.parentElement.tagName === 'LI' ? a.parentElement : a;
        box.hidden = off; if (off) box.setAttribute('data-lpe-off', ''); else box.removeAttribute('data-lpe-off');
      });
    });
  }
  function applyImage(n) {
    if (n === 'logo') {
      var d = state.images.logo, brand = $('.brand'), box = $('[data-logo]'), img = $('[data-logo-img]');
      if (d && d.src) { img.src = d.src; img.alt = text('brand.name') || ''; box.hidden = false; brand.classList.add('has-logo'); }
      else { img.removeAttribute('src'); box.hidden = true; brand.classList.remove('has-logo'); }
      return;
    }
    var slot = $('[data-img="' + n + '"]');
    var d2 = state.images[n];
    if (slot && LP.renderSlot) LP.renderSlot(slot, d2 && d2.src ? d2 : null);
  }
  function applyAll() {
    applyColors(); applyTexts(); applyLinks(); applySections();
    slotIds().forEach(applyImage); applyImage('logo');
  }
  function slotIds() { return $$('[data-img]').map(function (s) { return s.dataset.img; }); }

  // Redimensiona no navegador para manter o site leve (máx. 1800 px, WebP).
  function readImage(file) {
    return new Promise(function (res, rej) {
      if (!file || !/^image\//.test(file.type)) return rej(new Error('Escolha um arquivo de imagem (JPG, PNG, WebP ou SVG).'));
      var fr = new FileReader();
      fr.onerror = function () { rej(new Error('Não foi possível ler o arquivo.')); };
      fr.onload = function () {
        if (file.type === 'image/svg+xml') return res(fr.result);
        var im = new Image();
        im.onload = function () {
          var max = 1800, s = Math.min(1, max / Math.max(im.width, im.height));
          var cv = document.createElement('canvas'); cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s);
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          var out = cv.toDataURL('image/webp', 0.84);
          if (out.indexOf('data:image/webp') !== 0) out = cv.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.86);
          res(out);
        };
        im.onerror = function () { rej(new Error('Esse formato de imagem não é suportado pelo navegador.')); };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function setImage(n, file) {
    return readImage(file).then(function (src) {
      var cur = state.images[n] || {};
      state.images[n] = { src: src, x: 50, y: 50, zoom: 100, alt: cur.alt || '' };
      applyImage(n); save(); putImg(String(n), src); refreshImageCard(n);
    }).catch(function (e) { toast(e.message); });
  }
  function removeImage(n) {
    var cur = state.images[n];
    state.images[n] = cur ? { x: 50, y: 50, zoom: 100, alt: cur.alt || '' } : null;
    applyImage(n); save(); putImg(String(n), null); refreshImageCard(n);
  }

  // ── Painel (Shadow DOM: o estilo do painel não interfere no site) ──
  var host = document.createElement('div');
  host.id = 'lp-editor';
  host.setAttribute('data-lp-editor', '');
  var sh = host.attachShadow({ mode: 'open' });
  sh.innerHTML = '<style>' + PANEL_CSS() + '</style>' +
    '<button class="fab" type="button" aria-expanded="false" aria-controls="panel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg><span>Personalizar</span></button>' +
    '<aside class="panel" id="panel" role="dialog" aria-label="Personalizar a landing page" hidden>' +
      '<header class="ph"><div><strong>Personalizar</strong><small>As mudanças aparecem na hora e ficam salvas neste navegador.</small></div><button class="x" type="button" aria-label="Fechar painel">×</button></header>' +
      '<nav class="tabs" role="tablist"></nav>' +
      '<div class="body"></div>' +
    '</aside><div class="toast" role="status" aria-live="polite"></div>';
  var fab = $('.fab', sh), panel = $('.panel', sh), tabsEl = $('.tabs', sh), body = $('.body', sh), toastEl = $('.toast', sh);
  var TABS = [['cores', 'Cores'], ['textos', 'Textos'], ['imagens', 'Imagens'], ['secoes', 'Seções'], ['links', 'Links'], ['publicar', 'Enviar']];
  var panes = {};
  TABS.forEach(function (t, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = t[1]; b.dataset.tab = t[0]; b.id = 'tab-' + t[0];
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false'); b.tabIndex = i === 0 ? 0 : -1;
    tabsEl.appendChild(b);
    var p = document.createElement('section'); p.className = 'pane'; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', b.id); p.hidden = i !== 0;
    body.appendChild(p); panes[t[0]] = p;
  });
  function showTab(id, focus) {
    $$('[role="tab"]', tabsEl).forEach(function (b) { var on = b.dataset.tab === id; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); if (on) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
    Object.keys(panes).forEach(function (k) { panes[k].hidden = k !== id; });
    body.scrollTop = 0;
  }
  tabsEl.addEventListener('click', function (e) { var b = e.target.closest('[role="tab"]'); if (b) showTab(b.dataset.tab); });
  tabsEl.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var list = $$('[role="tab"]', tabsEl), i = list.indexOf(sh.activeElement);
    showTab(list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length].dataset.tab, true);
  });

  var isOpen = false;
  function setOpen(open) {
    isOpen = open; panel.hidden = !open; fab.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('lpe-open', open);
    if (open) $('.x', sh).focus(); else fab.focus();
  }
  fab.addEventListener('click', function () { setOpen(!isOpen); });
  $('.x', sh).addEventListener('click', function () { setOpen(false); });
  sh.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen && !e.target.closest('input,textarea')) setOpen(false); });

  var toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 3200); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var uid = 0; function id(p) { uid += 1; return 'f-' + p + '-' + uid; }

  // Cores
  var colorInputs = {};
  function buildColors() {
    var p = panes.cores; p.innerHTML = '';
    p.appendChild(el('h3', '', 'Paletas prontas'));
    var grid = el('div', 'palettes');
    PALETTES.forEach(function (pl) {
      var b = el('button', 'pal'); b.type = 'button'; b.setAttribute('aria-label', 'Aplicar paleta ' + pl.name);
      var sw = el('span', 'sw');
      ['primary', 'secondary', 'accent', 'bg', 'heading'].forEach(function (k) { var s = el('i'); s.style.background = pl.c[k]; sw.appendChild(s); });
      b.appendChild(sw); b.appendChild(el('span', 'pal-n', pl.name));
      b.addEventListener('click', function () { state.colors = Object.assign({}, pl.c); applyColors(); save(); syncColorInputs(); toast('Paleta ' + pl.name + ' aplicada.'); });
      grid.appendChild(b);
    });
    p.appendChild(grid);
    p.appendChild(el('h3', '', 'Cores personalizadas'));
    p.appendChild(el('p', 'hint', 'Escolha no seletor ou digite o código HEX (ex.: #1f5f4a).'));
    COLOR_FIELDS.forEach(function (f) {
      var row = el('div', 'color-row'); var fid = id('c');
      var lab = el('label', ''); lab.htmlFor = fid; lab.appendChild(el('strong', '', f[1])); lab.appendChild(el('small', '', f[2]));
      var pick = el('input', 'pick'); pick.type = 'color'; pick.setAttribute('aria-label', f[1] + ' (seletor)');
      var hex = el('input', 'hex'); hex.id = fid; hex.type = 'text'; hex.inputMode = 'text'; hex.maxLength = 7; hex.spellcheck = false; hex.autocomplete = 'off';
      pick.addEventListener('input', function () { hex.value = pick.value; setColor(f[0], pick.value); hex.removeAttribute('aria-invalid'); });
      hex.addEventListener('input', function () { var v = normHex(hex.value); if (v) { pick.value = v; setColor(f[0], v); hex.removeAttribute('aria-invalid'); } else hex.setAttribute('aria-invalid', 'true'); });
      hex.addEventListener('blur', function () { hex.value = colors()[f[0]]; hex.removeAttribute('aria-invalid'); });
      row.appendChild(lab); var w = el('div', 'color-in'); w.appendChild(pick); w.appendChild(hex); row.appendChild(w);
      p.appendChild(row); colorInputs[f[0]] = { pick: pick, hex: hex };
    });
    var warn = el('p', 'warn'); warn.id = 'contrast-warn'; warn.setAttribute('aria-live', 'polite'); p.appendChild(warn);
    var reset = el('button', 'btn-text', 'Voltar às cores originais'); reset.type = 'button';
    reset.addEventListener('click', function () { state.colors = {}; applyColors(); save(); syncColorInputs(); });
    p.appendChild(reset);
    syncColorInputs();
  }
  function setColor(k, v) { state.colors[k] = v; applyColors(); save(); checkContrast(); }
  function syncColorInputs() { var c = colors(); Object.keys(colorInputs).forEach(function (k) { colorInputs[k].pick.value = c[k]; colorInputs[k].hex.value = c[k]; }); checkContrast(); }
  function checkContrast() {
    var c = colors(), msgs = [];
    if (contrast(c.heading, c.bg) < 3) msgs.push('títulos sobre o fundo');
    if (contrast(c.text, c.bg) < 4.5) msgs.push('textos sobre o fundo');
    var w = $('#contrast-warn', sh);
    if (w) w.textContent = msgs.length ? 'Atenção: pouco contraste em ' + msgs.join(' e ') + '. A leitura pode ficar difícil.' : '';
  }

  // Textos
  var textFields = {};
  function groupOf(node) { var s = node.closest('[data-section]'); return s ? s.dataset.sectionLabel : (node.closest('header') ? 'Cabeçalho e menu' : 'Geral'); }
  function buildTexts() {
    var p = panes.textos; p.innerHTML = '';
    var sid = id('s'); var sl = el('label', 'sr-only', 'Buscar campo'); sl.htmlFor = sid;
    var search = el('input', 'search'); search.id = sid; search.type = 'search'; search.placeholder = 'Buscar campo (ex.: botão, título)';
    p.appendChild(sl); p.appendChild(search);
    p.appendChild(el('p', 'hint', 'Dica: com o painel aberto, clique em qualquer texto da página para ir direto ao campo dele.'));
    var groups = {}, order = [], seen = {};
    $$('[data-k]').forEach(function (node) {
      var k = node.dataset.k; if (seen[k]) return; seen[k] = 1;
      var g = k === 'brand.name' ? 'Cabeçalho e menu' : groupOf(node);
      if (!groups[g]) { groups[g] = []; order.push(g); }
      groups[g].push(node);
    });
    order.forEach(function (g) {
      var det = el('details', 'grp'); det.open = order.indexOf(g) < 2;
      det.appendChild(el('summary', '', g));
      groups[g].forEach(function (node) {
        var k = node.dataset.k, fid = id('t');
        var f = el('div', 'field'); f.dataset.key = k;
        var lab = el('label', '', node.dataset.label || k); lab.htmlFor = fid;
        var inp = node.hasAttribute('data-multi') ? el('textarea') : el('input');
        var max = limitOf(k);
        if (inp.tagName === 'INPUT') inp.type = 'text'; else inp.rows = Math.min(5, Math.max(2, Math.ceil(text(k).length / 42)));
        inp.id = fid; inp.maxLength = max; inp.value = text(k);
        var cnt = el('small', 'count'); cnt.id = fid + '-n'; cnt.setAttribute('aria-live', 'polite'); inp.setAttribute('aria-describedby', cnt.id);
        var syncCount = function () {
          var n = inp.value.length;
          cnt.textContent = n + '/' + max + (n >= max ? ' · limite atingido: resuma o texto para caber no layout' : '');
          cnt.classList.toggle('full', n >= max);
        };
        inp.addEventListener('input', function () {
          var v = clampText(k, inp.value);
          if (v !== inp.value) { var pos = inp.selectionStart; inp.value = v; try { inp.setSelectionRange(pos, pos); } catch (e) { /* */ } }
          state.texts[k] = v; applyTexts(k); save(); syncCount();
        });
        syncCount();
        f.appendChild(lab); f.appendChild(inp); f.appendChild(cnt);
        if (node.closest('[data-section]') && node.closest('[data-section]').dataset.section !== 'footer' && node.closest('[data-section]').dataset.section !== 'hero') f.dataset.section = node.closest('[data-section]').dataset.section;
        det.appendChild(f); textFields[k] = { input: inp, details: det, field: f };
      });
      p.appendChild(det);
    });
    var reset = el('button', 'btn-text', 'Voltar aos textos demonstrativos'); reset.type = 'button';
    reset.addEventListener('click', function () { if (!confirm('Substituir todos os textos pelos textos demonstrativos?')) return; state.texts = {}; applyTexts(); save(); buildTexts(); });
    p.appendChild(reset);
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      $$('.grp', p).forEach(function (d) {
        var any = false;
        $$('.field', d).forEach(function (f) { var show = !q || f.textContent.toLowerCase().indexOf(q) !== -1 || f.querySelector('input,textarea').value.toLowerCase().indexOf(q) !== -1; f.hidden = !show; any = any || show; });
        d.hidden = !any; if (q && any) d.open = true;
      });
    });
  }
  function focusText(k) {
    var t = textFields[k]; if (!t) return;
    showTab('textos'); t.details.hidden = false; t.details.open = true; t.field.hidden = false;
    t.field.scrollIntoView({ block: 'center' }); t.input.focus(); t.input.select();
    t.field.classList.add('flash'); setTimeout(function () { t.field.classList.remove('flash'); }, 1200);
  }

  // Imagens
  var imageCards = {};
  function buildImages() {
    var p = panes.imagens; p.innerHTML = '';
    p.appendChild(el('p', 'hint', 'Envie fotos do seu computador (JPG, PNG ou WebP). Elas são otimizadas automaticamente. Ajuste o enquadramento com os controles. Também dá para arrastar uma foto direto para o espaço na página.'));
    imageCard(p, 'logo', 'Logotipo', 'Cabeçalho (opcional). Sem logotipo, aparece a inicial da marca.');
    $$('[data-img]').forEach(function (s) { imageCard(p, s.dataset.img, 'IMAGEM ' + s.dataset.img, s.dataset.imgLabel); });
  }
  function imageCard(p, n, title, sub) {
    var card = el('div', 'img-card'); card.dataset.n = n;
    var head = el('div', 'img-head');
    var th = el('div', 'thumb' + (n === 'logo' ? ' thumb-logo' : ''));
    var meta = el('div', ''); meta.appendChild(el('strong', '', title)); meta.appendChild(el('small', '', sub));
    head.appendChild(th); head.appendChild(meta); card.appendChild(head);
    var file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.className = 'sr-only'; file.tabIndex = -1; file.setAttribute('aria-hidden', 'true');
    file.addEventListener('change', function () { if (file.files[0]) setImage(n, file.files[0]); file.value = ''; });
    var actions = el('div', 'img-actions');
    var up = el('button', 'btn-sm primary'); up.type = 'button'; up.addEventListener('click', function () { file.click(); });
    var rm = el('button', 'btn-sm'); rm.type = 'button'; rm.textContent = 'Remover'; rm.addEventListener('click', function () { removeImage(n); });
    actions.appendChild(up); actions.appendChild(rm); card.appendChild(actions); card.appendChild(file);
    var adj = el('div', 'adjust');
    if (n !== 'logo') {
      [['x', 'Posição horizontal', 0, 100, 50, '%'], ['y', 'Posição vertical', 0, 100, 50, '%'], ['zoom', 'Zoom', 100, 250, 100, '%']].forEach(function (r) {
        var fid = id('r'); var row = el('div', 'range');
        var lab = el('label', '', r[1]); lab.htmlFor = fid; var out = el('output', '');
        var inp = el('input'); inp.type = 'range'; inp.min = r[2]; inp.max = r[3]; inp.id = fid;
        inp.addEventListener('input', function () { var d = state.images[n]; if (!d) return; d[r[0]] = +inp.value; out.textContent = inp.value + r[5]; applyImage(n); save(); });
        row.appendChild(lab); row.appendChild(out); row.appendChild(inp); adj.appendChild(row); row.dataset.k = r[0]; row.dataset.def = r[4];
      });
      var aid = id('a'); var al = el('label', '', 'Descrição da imagem (acessibilidade)'); al.htmlFor = aid;
      var alt = el('input', 'alt'); alt.type = 'text'; alt.id = aid; alt.placeholder = 'Ex.: Equipe atendendo um cliente';
      alt.addEventListener('input', function () { state.images[n] = state.images[n] || { x: 50, y: 50, zoom: 100 }; state.images[n].alt = alt.value; applyImage(n); save(); });
      var center = el('button', 'btn-text', 'Centralizar enquadramento'); center.type = 'button';
      center.addEventListener('click', function () { var d = state.images[n]; if (!d) return; d.x = 50; d.y = 50; d.zoom = 100; applyImage(n); save(); refreshImageCard(n); });
      adj.appendChild(center);
      var af = el('div', 'field'); af.appendChild(al); af.appendChild(alt); card.appendChild(adj); card.appendChild(af);
    }
    p.appendChild(card); imageCards[n] = { card: card, th: th, up: up, rm: rm, adj: adj, file: file };
    refreshImageCard(n);
  }
  function refreshImageCard(n) {
    var c = imageCards[n]; if (!c) return;
    var d = state.images[n], has = !!(d && d.src);
    c.th.innerHTML = '';
    if (has) { var i = el('img'); i.src = d.src; i.alt = ''; if (n !== 'logo') { i.style.objectPosition = d.x + '% ' + d.y + '%'; } c.th.appendChild(i); }
    else c.th.appendChild(el('span', '', n === 'logo' ? 'Logo' : 'Adicionar imagem ' + n));
    c.up.textContent = has ? 'Substituir' : (n === 'logo' ? 'Enviar logotipo' : 'Adicionar imagem ' + n);
    c.rm.hidden = !has; c.adj.hidden = !has;
    $$('.range', c.adj).forEach(function (row) {
      var k = row.dataset.k, v = d && d[k] != null ? d[k] : +row.dataset.def;
      $('input', row).value = v; $('output', row).textContent = v + '%';
    });
    var alt = $('.alt', c.card); if (alt) alt.value = (d && d.alt) || '';
  }

  // Seções
  function buildSections() {
    var p = panes.secoes; p.innerHTML = '';
    p.appendChild(el('p', 'hint', 'Desmarque as seções que você não quer usar. O item correspondente some do menu também.'));
    $$('[data-section]').forEach(function (s) {
      var k = s.dataset.section; if (k === 'hero' || k === 'footer') return;
      var fid = id('sec'); var row = el('div', 'switch');
      var cb = el('input'); cb.type = 'checkbox'; cb.id = fid; cb.checked = state.hidden.indexOf(k) === -1;
      var lab = el('label', '', s.dataset.sectionLabel); lab.htmlFor = fid;
      var go = el('button', 'btn-text', 'Ver'); go.type = 'button'; go.setAttribute('aria-label', 'Ir até a seção ' + s.dataset.sectionLabel);
      go.addEventListener('click', function () { s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      cb.addEventListener('change', function () {
        state.hidden = state.hidden.filter(function (h) { return h !== k; });
        if (!cb.checked) state.hidden.push(k);
        applySections(); save(); go.hidden = !cb.checked;
      });
      go.hidden = !cb.checked;
      row.appendChild(cb); row.appendChild(lab); row.appendChild(go); p.appendChild(row);
    });
  }

  // Links e contato
  function buildLinks() {
    var p = panes.links; p.innerHTML = '';
    p.appendChild(el('p', 'hint', 'WhatsApp: https://wa.me/55 + DDD + número (só números). E-mail: mailto:voce@empresa.com. Telefone: tel:+5511900000000. Seções da página: ' + $$('[data-section][id]').map(function (s) { return '#' + s.id; }).join(', ') + '. Deixe um link vazio para ocultar o botão ou a rede social.'));
    var groups = {}, order = [], seen = {};
    $$('[data-href]').forEach(function (node) {
      var k = node.dataset.href; if (seen[k]) return; seen[k] = 1;
      var g = k.indexOf('contact.') === 0 ? 'Contato' : k.indexOf('social.') === 0 ? 'Redes sociais' : groupOf(node);
      if (!groups[g]) { groups[g] = []; order.push(g); } groups[g].push(node);
    });
    order.sort(function (a, b) { return (a === 'Contato' ? -2 : a === 'Redes sociais' ? -1 : 0) - (b === 'Contato' ? -2 : b === 'Redes sociais' ? -1 : 0); });
    order.forEach(function (g) {
      var det = el('details', 'grp'); det.open = g === 'Contato' || g === 'Redes sociais';
      det.appendChild(el('summary', '', g));
      groups[g].forEach(function (node) {
        var k = node.dataset.href, fid = id('l');
        var f = el('div', 'field'); var lab = el('label', '', node.dataset.labelHref || k); lab.htmlFor = fid;
        var inp = el('input'); inp.type = 'text'; inp.inputMode = 'url'; inp.id = fid; inp.value = link(k); inp.spellcheck = false; inp.autocomplete = 'off';
        inp.addEventListener('input', function () { state.links[k] = inp.value.trim(); applyLinks(); save(); });
        f.appendChild(lab); f.appendChild(inp); det.appendChild(f);
      });
      p.appendChild(det);
    });
    p.appendChild(el('p', 'hint', 'Os textos exibidos (número, e-mail, endereço e horário) ficam na aba Textos, em “Rodapé”.'));
  }

  // Enviar (cliente) e ferramentas da equipe (?equipe na URL)
  // O cliente NÃO baixa o site: envia a personalização para a plataforma, a equipe revisa,
  // ajusta o que for preciso e manda o orçamento; depois do pagamento, entrega o site publicado.
  var TEAM = /[?&]equipe\b/.test(location.search);
  function buildPublish() {
    var p = panes.publicar; p.innerHTML = '';
    p.appendChild(el('h3', '', 'Terminou? Envie para a CMKCOGIT'));
    p.appendChild(el('p', 'hint', 'Suas alterações ficam salvas neste navegador enquanto você edita. Quando terminar, envie o site para a nossa equipe:'));
    var steps = el('ol', 'steps');
    ['Revisamos o seu site e fazemos os ajustes necessários.', 'Enviamos o orçamento na plataforma CMKCOGIT.', 'Com o pagamento aprovado, publicamos e entregamos o site para você.']
      .forEach(function (t) { steps.appendChild(el('li', '', t)); });
    p.appendChild(steps);
    var b1 = el('button', 'btn-wide primary', 'Enviar para a CMKCOGIT'); b1.type = 'button';
    b1.addEventListener('click', function () { sendToPlatform(b1); });
    p.appendChild(b1);
    var st = el('p', 'send-status'); st.id = 'send-status'; st.setAttribute('role', 'status'); st.hidden = true; p.appendChild(st);
    p.appendChild(el('p', 'hint', 'Abre a plataforma em uma nova aba para você entrar ou criar sua conta. Use o mesmo navegador até concluir o envio.'));
    p.appendChild(el('h3', '', 'Outras opções'));
    var b4 = el('button', 'btn-wide danger', 'Restaurar o modelo original'); b4.type = 'button';
    b4.addEventListener('click', function () {
      if (!confirm('Apagar todas as personalizações (cores, textos, imagens e links) deste navegador?')) return;
      state = { colors: {}, texts: {}, links: {}, hidden: [], images: {} };
      try { localStorage.removeItem(KEY); } catch (e) { /* */ }
      ['logo'].concat(slotIds()).forEach(function (n) { putImg(String(n), null); });
      applyAll(); buildAll(); toast('Modelo original restaurado.');
    });
    p.appendChild(b4);
    if (!TEAM) return;
    // Equipe CMKCOGIT: importar o arquivo baixado na plataforma, revisar e gerar o site final.
    p.appendChild(el('h3', '', 'Equipe CMKCOGIT'));
    var file = el('input'); file.type = 'file'; file.accept = 'application/json,.json'; file.className = 'sr-only'; file.tabIndex = -1; file.setAttribute('aria-hidden', 'true');
    file.addEventListener('change', function () { if (file.files[0]) importJson(file.files[0]); file.value = ''; });
    var b3 = el('button', 'btn-wide', 'Importar configuração (.json)'); b3.type = 'button'; b3.addEventListener('click', function () { file.click(); });
    var b5 = el('button', 'btn-wide', 'Exportar configuração (.json)'); b5.type = 'button'; b5.addEventListener('click', function () { exportJson(); });
    var b2 = el('button', 'btn-wide', 'Gerar site final (.html)'); b2.type = 'button'; b2.addEventListener('click', function () { exportHtml(); });
    p.appendChild(b3); p.appendChild(file); p.appendChild(b5); p.appendChild(b2);
    p.appendChild(el('p', 'hint', 'O site final sai sem este painel e sem os avisos de demonstração. Substitua o index.html da pasta do modelo e rode o configure.mjs.'));
  }

  // ── Envio para a plataforma (app.cmkcogit.com.br) ──
  // Abre continuar.html com #cfg (modelo pronto + variante + personalizacao) e entrega os
  // dados por postMessage quando a aba da plataforma avisa que está pronta.
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var APP = SCRIPT.dataset.app || (LOCAL ? 'http://localhost:3000' : 'https://app.cmkcogit.com.br');
  var APP_ORIGIN = (function () { try { return new URL(APP).origin; } catch (e) { return ''; } })();
  function b64url(s) {
    var bytes = new TextEncoder().encode(s), bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function randomRef() { var a = new Uint8Array(18); crypto.getRandomValues(a); var s = ''; a.forEach(function (b) { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function sendStatus(msg, ok) { var s = $('#send-status', sh); if (!s) return; s.textContent = msg; s.hidden = !msg; s.classList.toggle('ok', !!ok); }
  var sending = null;
  function sendToPlatform(btn) {
    var data = buildConfigData();
    var size = JSON.stringify(data).length;
    if (size > 14 * 1024 * 1024) { sendStatus('As imagens estão grandes demais para enviar de uma vez. Remova ou troque alguma imagem e tente de novo.'); return; }
    var ref = randomRef();
    var cfg = {
      v: 1, ref: ref, origem: 'configurador', objetivos: [], complementos: [],
      servicos: [{ id: SCRIPT.dataset.service || 'landing-page', modelo: 'modelos-prontos', plano: null, nome: MODEL_NAME, variante: SCRIPT.dataset.variant || '' }],
      notas: 'Personalização enviada pelo editor do modelo ' + MODEL_NAME + ' (' + (text('brand.name') || '') + ').',
      diagnostico: null, estimativa: '', personalizacao: true
    };
    var back = location.origin + location.pathname;
    var url = APP + '/continuar.html?volta=' + encodeURIComponent(back) + '#cfg=' + b64url(JSON.stringify(cfg));
    var win = window.open(url, '_blank');
    if (!win) { sendStatus('O navegador bloqueou a nova aba. Permita pop-ups para este site e clique de novo.'); return; }
    btn.disabled = true;
    sendStatus('Abrindo a plataforma e enviando o seu site…');
    if (sending) sending.stop();
    var timer = setTimeout(function () { stop(); btn.disabled = false; sendStatus('Não conseguimos falar com a plataforma. Verifique se a nova aba abriu e clique em "Enviar" de novo.'); }, 30000);
    function onMsg(e) {
      if (e.origin !== APP_ORIGIN || e.source !== win || !e.data || e.data.ref !== ref) return;
      if (e.data.type === 'cmk:personalizacao:pronto') win.postMessage({ type: 'cmk:personalizacao', ref: ref, dados: data }, APP_ORIGIN);
      else if (e.data.type === 'cmk:personalizacao:recebida') {
        stop(); btn.disabled = false;
        sendStatus('Enviado! Continue na aba da plataforma: entre ou crie sua conta para concluir. Nossa equipe revisa e envia o orçamento por lá.', true);
        toast('Site enviado para a CMKCOGIT.');
      } else if (e.data.type === 'cmk:personalizacao:erro') {
        stop(); btn.disabled = false; sendStatus('A plataforma não aceitou o envio. Tente de novo ou fale com a gente pelo WhatsApp.');
      }
    }
    function stop() { clearTimeout(timer); window.removeEventListener('message', onMsg); sending = null; }
    window.addEventListener('message', onMsg);
    sending = { stop: stop };
  }

  function download(name, content, type) {
    var blob = new Blob([content], { type: type });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function slug() { return (text('brand.name') || 'landing-page').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'landing-page'; }
  function buildConfigData() {
    var data = { modelo: MODEL, variante: SCRIPT.dataset.variant || '', versao: 1, geradoEm: new Date().toISOString(), cores: colors(), textos: {}, links: {}, secoesOcultas: state.hidden.slice(), imagens: {} };
    Object.keys(defaults.texts).forEach(function (k) { data.textos[k] = text(k); });
    Object.keys(defaults.links).forEach(function (k) { data.links[k] = link(k); });
    Object.keys(state.images).forEach(function (k) { var d = state.images[k]; if (d && d.src) data.imagens[k] = { src: d.src, x: d.x, y: d.y, zoom: d.zoom, alt: d.alt || '' }; });
    return data;
  }
  function exportJson() {
    download(slug() + '-configuracao.json', JSON.stringify(buildConfigData(), null, 2), 'application/json');
    toast('Configuração exportada.');
  }
  function importJson(file) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var d = JSON.parse(fr.result);
        if (d.modelo !== MODEL) throw new Error('Este arquivo não é de uma ' + MODEL_NAME + '.');
        var c = {}; COLOR_FIELDS.forEach(function (f) { var v = normHex(d.cores && d.cores[f[0]]); if (v) c[f[0]] = v; });
        var t = {}; Object.keys(d.textos || {}).forEach(function (k) { if (k in defaults.texts && typeof d.textos[k] === 'string') t[k] = d.textos[k]; });
        var l = {}; Object.keys(d.links || {}).forEach(function (k) { if (k in defaults.links && typeof d.links[k] === 'string' && !/^\s*javascript:/i.test(d.links[k])) l[k] = d.links[k]; });
        var imgs = {};
        Object.keys(d.imagens || {}).forEach(function (k) {
          var i = d.imagens[k]; if (!i || typeof i.src !== 'string' || !/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/.test(i.src)) return;
          imgs[k] = { src: i.src, x: clamp(i.x, 0, 100, 50), y: clamp(i.y, 0, 100, 50), zoom: clamp(i.zoom, 100, 250, 100), alt: String(i.alt || '') };
          putImg(String(k), i.src);
        });
        state = { colors: c, texts: t, links: l, hidden: Array.isArray(d.secoesOcultas) ? d.secoesOcultas.filter(function (s) { return typeof s === 'string'; }) : [], images: imgs };
        ['logo'].concat(slotIds()).forEach(function (n) { if (!imgs[n]) putImg(String(n), null); });
        save(); applyAll(); buildAll(); toast('Configuração importada.');
      } catch (e) { toast(e.message && e.message.indexOf(MODEL_NAME) !== -1 ? e.message : 'Arquivo inválido.'); }
    };
    fr.readAsText(file);
  }
  function clamp(v, a, b, d) { v = Number(v); return isFinite(v) ? Math.min(b, Math.max(a, v)) : d; }

  function exportHtml() {
    var wasOpen = isOpen; if (isOpen) setOpen(false);
    var doc = document.documentElement.cloneNode(true);
    $$('[data-lp-editor]', doc).forEach(function (n) { n.remove(); });
    $$('.slot-ph, .demo-note', doc).forEach(function (n) { n.remove(); });
    $$('[data-lpe-off]', doc).forEach(function (n) { n.remove(); });
    $$('[data-hidden-section]', doc).forEach(function (n) { n.remove(); });
    $$('.reveal, .is-in, .is-scrolled, .is-open, .lpe-target', doc).forEach(function (n) { n.classList.remove('reveal', 'is-in', 'is-scrolled', 'is-open', 'lpe-target'); });
    $$('[class=""]', doc).forEach(function (n) { n.removeAttribute('class'); });
    $$('[data-logo][hidden]', doc).forEach(function (n) { n.remove(); });
    doc.classList.remove('js', 'lpe-open'); if (!doc.className) doc.removeAttribute('class');
    doc.setAttribute('data-mode', 'production');
    var btn = $('[data-menu-btn]', doc); if (btn) { btn.setAttribute('aria-expanded', 'false'); var s = $('.sr-only', btn); if (s) s.textContent = 'Abrir menu'; }
    var title = $('title', doc), name = text('brand.name'), sub = text('hero.title');
    if (title) title.textContent = name + ' — ' + sub;
    var desc = $('meta[name="description"]', doc); if (desc) desc.content = text('hero.subtitle');
    var r = $('meta[name="robots"]', doc); if (r) r.content = 'index, follow';
    [['og:site_name', name], ['og:title', name + ' — ' + sub], ['og:description', text('hero.subtitle')]].forEach(function (m) { var e = $('meta[property="' + m[0] + '"]', doc); if (e) e.content = m[1]; });
    download('index.html', '<!doctype html>\n' + doc.outerHTML, 'text/html');
    toast('Site pronto baixado (index.html).');
    if (wasOpen) setOpen(true);
  }

  function buildAll() { buildColors(); buildTexts(); buildImages(); buildSections(); buildLinks(); buildPublish(); }

  // ── Edição pela página: clicar em texto ou imagem leva ao campo ──
  document.addEventListener('click', function (e) {
    if (!isOpen || e.composedPath().indexOf(host) !== -1) return;
    var slot = e.target.closest('[data-img]');
    if (slot) { e.preventDefault(); var n = slot.dataset.img; showTab('imagens'); var c = imageCards[n]; if (c) { c.card.scrollIntoView({ block: 'center' }); c.card.classList.add('flash'); setTimeout(function () { c.card.classList.remove('flash'); }, 1200); if (!(state.images[n] && state.images[n].src)) c.file.click(); } return; }
    var t = e.target.closest('[data-k]');
    if (t) { e.preventDefault(); focusText(t.dataset.k); }
  }, true);
  $$('[data-img]').forEach(function (slot) {
    slot.addEventListener('dragover', function (e) { if (!isOpen) return; e.preventDefault(); slot.classList.add('lpe-drop'); });
    slot.addEventListener('dragleave', function () { slot.classList.remove('lpe-drop'); });
    slot.addEventListener('drop', function (e) { slot.classList.remove('lpe-drop'); if (!isOpen) return; e.preventDefault(); var f = e.dataTransfer.files[0]; if (f) setImage(slot.dataset.img, f); });
  });

  // Estilo da página enquanto o painel está aberto (o site publicado não leva isto).
  var pageCss = document.createElement('style');
  pageCss.setAttribute('data-lp-editor', '');
  pageCss.textContent =
    'html.lpe-open body{margin-right:var(--lpe-w,420px)}' +
    'html.lpe-open [data-k]{cursor:text}' +
    'html.lpe-open [data-k]:hover{outline:2px dashed color-mix(in srgb,var(--c-accent) 80%,transparent);outline-offset:3px}' +
    'html.lpe-open [data-img]{cursor:pointer}' +
    'html.lpe-open [data-img]:hover,[data-img].lpe-drop{outline:3px dashed var(--c-accent);outline-offset:-3px}' +
    'html.lpe-open .slot-ph{color:var(--c-heading)}' +
    '@media (max-width:900px){html.lpe-open body{margin-right:0;padding-bottom:62vh}}';
  document.head.appendChild(pageCss);

  // ── Início: carrega o que foi salvo ──
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) {
      state.colors = saved.colors || {}; state.texts = saved.texts || {}; state.links = saved.links || {};
      state.hidden = saved.hidden || []; state.images = saved.images || {};
    }
  } catch (e) { /* sem dados salvos */ }
  document.body.appendChild(host);
  applyColors(); applyTexts(); applyLinks(); applySections();
  buildAll();
  var pending = ['logo'].concat(slotIds()).filter(function (n) { return state.images[n] && state.images[n].has; });
  Promise.all(pending.map(function (n) { return getImg(String(n)).then(function (src) { if (src) state.images[n].src = src; else state.images[n] = null; }); }))
    .then(function () { ['logo'].concat(slotIds()).forEach(function (n) { applyImage(n); refreshImageCard(n); }); });
  if (/[?&]personalizar\b/.test(location.search) && window.matchMedia('(min-width: 901px)').matches) setOpen(true);

  function PANEL_CSS() {
    return ':host{all:initial;font:400 14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1b1d22;--ac:#2d5bff}' +
      '*{box-sizing:border-box}button,input,textarea{font:inherit;color:inherit}' +
      '.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
      ':focus-visible{outline:2px solid var(--ac);outline-offset:2px}' +
      '.fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:inline-flex;align-items:center;gap:8px;height:50px;padding:0 20px 0 16px;border:0;border-radius:999px;background:#14161b;color:#fff;font-weight:600;font-size:15px;cursor:pointer;box-shadow:0 10px 30px -8px rgb(0 0 0/.45)}' +
      '.fab svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.fab[aria-expanded="true"]{display:none}' +
      '.panel{position:fixed;top:0;right:0;bottom:0;z-index:2147483001;width:420px;display:flex;flex-direction:column;background:#fff;border-left:1px solid #e3e5ea;box-shadow:-12px 0 40px -20px rgb(0 0 0/.25)}' +
      '.panel[hidden]{display:none}' +
      '.ph{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px 12px}' +
      '.ph strong{display:block;font-size:17px}.ph small{color:#646a76;font-size:12.5px}' +
      '.x{width:40px;height:40px;flex:none;border:1px solid #e3e5ea;border-radius:10px;background:#fff;font-size:22px;line-height:1;cursor:pointer}' +
      '.tabs{display:flex;gap:0;padding:0 10px;border-bottom:1px solid #e3e5ea;overflow-x:auto;scrollbar-width:none}' +
      '.tabs button{flex:none;min-height:44px;padding:0 8px;font-size:13.5px;border:0;border-bottom:2px solid transparent;background:none;color:#646a76;font-weight:600;cursor:pointer;white-space:nowrap}' +
      '.tabs button[aria-selected="true"]{color:#14161b;border-bottom-color:var(--ac)}' +
      '.body{flex:1;overflow-y:auto;padding:16px 20px 40px;overscroll-behavior:contain}' +
      'h3{margin:18px 0 10px;font-size:14px}h3:first-child{margin-top:4px}' +
      '.hint{margin:0 0 14px;color:#646a76;font-size:12.5px}' +
      '.palettes{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}' +
      '.pal{display:grid;gap:6px;padding:8px;border:1px solid #e3e5ea;border-radius:12px;background:#fff;cursor:pointer;text-align:left}' +
      '.pal:hover{border-color:#14161b}.sw{display:flex;height:26px;border-radius:7px;overflow:hidden}.sw i{flex:1}.pal-n{font-weight:600;font-size:13px}' +
      '.color-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #f0f1f4}' +
      '.color-row label strong{display:block;font-size:13.5px}.color-row label small{color:#646a76;font-size:12px}' +
      '.color-in{display:flex;align-items:center;gap:6px;flex:none}' +
      '.pick{width:44px;height:44px;padding:2px;border:1px solid #d5d8de;border-radius:10px;background:#fff;cursor:pointer}' +
      '.hex{width:92px;height:44px;padding:0 10px;border:1px solid #d5d8de;border-radius:10px;font-family:ui-monospace,Menlo,monospace;text-transform:lowercase}' +
      '.hex[aria-invalid="true"]{border-color:#c62828;background:#fff5f5}' +
      '.warn{margin:12px 0 0;color:#a14b00;font-size:12.5px}.warn:empty{display:none}' +
      '.search{width:100%;height:44px;padding:0 12px;margin-bottom:10px;border:1px solid #d5d8de;border-radius:10px}' +
      '.grp{border:1px solid #e3e5ea;border-radius:12px;margin-bottom:10px;padding:0 14px}' +
      '.grp summary{min-height:46px;display:flex;align-items:center;font-weight:600;cursor:pointer}' +
      '.grp[open] summary{border-bottom:1px solid #f0f1f4;margin-bottom:10px}' +
      '.field{display:grid;gap:5px;margin-bottom:12px;border-radius:8px;transition:background-color .3s}' +
      '.field label{font-size:12.5px;font-weight:600;color:#3b404b}' +
      '.field input,.field textarea{width:100%;min-height:42px;padding:9px 11px;border:1px solid #d5d8de;border-radius:9px;background:#fff;resize:vertical}' +
      '.field input:focus,.field textarea:focus,.hex:focus,.search:focus{outline:none;border-color:var(--ac);box-shadow:0 0 0 3px rgb(45 91 255/.15)}' +
      '.steps{margin:0 0 14px;padding-left:20px;font-size:13px;color:#3b404b;display:grid;gap:4px}' +
      '.send-status{margin:4px 0 12px;padding:10px 12px;border-radius:9px;background:#fff4e5;color:#7a3e00;font-size:12.5px}.send-status.ok{background:#e8f6ee;color:#1e6b43}' +
      '.btn-wide:disabled{opacity:.6;cursor:progress}' +
      '.count{justify-self:end;color:#646a76;font-size:11.5px}.count.full{color:#a14b00;font-weight:600}' +
      '.flash{background:#fff4d6;box-shadow:0 0 0 6px #fff4d6}' +
      '.img-card{border:1px solid #e3e5ea;border-radius:12px;padding:12px;margin-bottom:12px;transition:background-color .3s}' +
      '.img-head{display:flex;gap:12px;align-items:center;margin-bottom:10px}.img-head strong{display:block}.img-head small{color:#646a76;font-size:12px}' +
      '.thumb{width:84px;height:64px;flex:none;border-radius:9px;overflow:hidden;background:repeating-linear-gradient(45deg,#f2f3f6 0 8px,#e9ebf0 8px 16px);display:grid;place-items:center;text-align:center;font-size:10.5px;font-weight:600;color:#646a76;padding:4px}' +
      '.thumb img{width:100%;height:100%;object-fit:cover}.thumb-logo img{object-fit:contain;background:#fff}' +
      '.img-actions{display:flex;gap:8px;flex-wrap:wrap}' +
      '.btn-sm{min-height:40px;padding:0 14px;border:1px solid #d5d8de;border-radius:9px;background:#fff;font-weight:600;cursor:pointer}' +
      '.btn-sm.primary,.btn-wide.primary{background:#14161b;border-color:#14161b;color:#fff}' +
      '.adjust{margin-top:12px;display:grid;gap:8px}.adjust[hidden]{display:none}' +
      '.range{display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center}.range label{font-size:12.5px;font-weight:600}.range output{font-size:12px;color:#646a76}' +
      '.range input{grid-column:1/-1;width:100%;accent-color:#14161b;height:28px}' +
      '.img-card .field{margin:10px 0 0}' +
      '.switch{display:flex;align-items:center;gap:12px;min-height:52px;padding:4px 0;border-bottom:1px solid #f0f1f4}' +
      '.switch input{width:22px;height:22px;accent-color:#14161b;flex:none}.switch label{flex:1;font-weight:600;cursor:pointer}' +
      '.btn-text{min-height:40px;padding:0 4px;border:0;background:none;color:var(--ac);font-weight:600;cursor:pointer;text-align:left}' +
      '.btn-text[hidden]{display:none}' +
      '.btn-wide{display:block;width:100%;min-height:48px;margin:0 0 8px;padding:0 16px;border:1px solid #d5d8de;border-radius:11px;background:#fff;font-weight:600;cursor:pointer}' +
      '.btn-wide.danger{color:#b42318;border-color:#f1c4c0}' +
      '.toast{position:fixed;left:50%;bottom:24px;z-index:2147483002;transform:translate(-50%,20px);opacity:0;pointer-events:none;max-width:calc(100vw - 32px);padding:12px 18px;border-radius:12px;background:#14161b;color:#fff;font-size:13.5px;transition:opacity .2s,transform .2s}' +
      '.toast.on{opacity:1;transform:translate(-50%,0)}' +
      '@media (max-width:900px){.panel{top:auto;left:0;width:auto;height:62vh;border-left:0;border-top:1px solid #e3e5ea;border-radius:18px 18px 0 0;box-shadow:0 -12px 40px -16px rgb(0 0 0/.3)}.fab{right:16px;bottom:16px}.toast{bottom:calc(62vh + 12px)}}' +
      '@media (prefers-reduced-motion:reduce){*{transition:none!important}}';
  }
})();
