/* =====================================================================
   COGIT — movimento (identidade 2026)
   Linguagem "construir": o fio desenha, o título sobe por linhas, o conteúdo chega.
   GSAP + ScrollTrigger (assets/vendor, hospedados no site). Rolagem nativa do navegador.
   Regras:
   · Sem a biblioteca, sem JavaScript ou com "reduzir movimento": tudo aparece, nada se move.
   · Elementos só ganham o estado inicial (escondido) se estiverem abaixo da tela ao carregar
     e voltam a esse estado apenas depois de sair da tela; trava de 2 s se algo não animar.
   · Rolagem nos dois sentidos: descendo, os itens sobem; subindo, descem.
   API mantida: window.COGIT_ANIMATIONS.init/refresh e window.initAnimations.
   ===================================================================== */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return RM.matches; };
  var hasG = function () { return !!(window.gsap && window.ScrollTrigger); };
  var EASE = 'expo.out';
  var triggers = [];

  var REVEAL_SEL = [
    '.reveal', '.reveal-up', '.reveal-left', '.reveal-right', '.reveal-scale', '.reveal-fade', '[data-reveal]', '[data-r]', '[data-about-reveal]',
    '.section-header', '.solution-hero .container > *', '.faq-item', '.cmk-catalog-item', '.footer-column', '.footer-brand'
  ].join(',');
  var GROUP_SEL = '[data-stagger], [class*="-grid"]:not(.hero-bg-grid):not(.brand-intro-grid), [class*="-list"]:not(.mobile-nav-list):not(.footer-links), .rows, .cmk-plan-grid';

  function below(el) { var r = el.getBoundingClientRect(); return r.top > window.innerHeight * 0.92; }
  function markVisible() {
    document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade, [data-reveal], .card-stagger-item, [class*="hero-animate-"]').forEach(function (el) {
      el.classList.add('is-visible'); el.classList.remove('is-above');
    });
  }

  /* ── Header: some ao descer, volta ao subir ── */
  function initHeader() {
    var header = document.querySelector('.header');
    if (!header) return;
    var last = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var menuOpen = document.body.classList.contains('no-scroll') || document.querySelector('.nav-dropdown.is-open, .nav-dropdown:focus-within');
      if (!reduced() && !menuOpen) header.classList.toggle('is-hidden', y > last && y > 240);
      if (y < 80) header.classList.remove('is-hidden');
      last = y;
    }, { passive: true });
  }

  /* ── Títulos por linha (palavra a palavra, dentro de máscara) ── */
  function splitTitle(el) {
    if (el.dataset.split === '1') return;
    el.dataset.split = '1';
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          if (!n.textContent.trim()) return;
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'); o.className = 't-line';
            var i = document.createElement('span'); i.textContent = p; o.appendChild(i); frag.appendChild(o);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('t-line')) {
          walk(n);
        }
      });
    })(el);
  }

  function addTrigger(t) { triggers.push(t); return t; }

  function revealTitles() {
    document.querySelectorAll('main h1, main h2, .footer-tagline').forEach(function (h) {
      if (h.closest('dialog, .hero-interactive-container, [hidden], .faq-answer, .page-legal')) return;
      splitTitle(h);
      var words = h.querySelectorAll('.t-line > span');
      if (!words.length) return;
      var isHero = !!h.closest('section[class*="hero"], .hero');
      if (isHero && !below(h)) {
        gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.035, ease: EASE, delay: 0.1 });
        return;
      }
      if (!below(h)) return;
      gsap.set(words, { yPercent: 110 });
      addTrigger(ScrollTrigger.create({
        trigger: h, start: 'top 88%', end: 'bottom 8%',
        onEnter: function () { gsap.to(words, { yPercent: 0, duration: 0.9, stagger: 0.03, ease: EASE, overwrite: true }); },
        onEnterBack: function () { gsap.fromTo(words, { yPercent: -110 }, { yPercent: 0, duration: 0.9, stagger: 0.03, ease: EASE, overwrite: true }); },
        onLeave: function () { gsap.set(words, { yPercent: -110 }); },
        onLeaveBack: function () { gsap.set(words, { yPercent: 110 }); }
      }));
    });
  }

  function bidir(targets, trigger, opts) {
    opts = opts || {};
    var d = opts.distance || (window.innerWidth < 768 ? 16 : 24);
    var st = opts.stagger || 0, dl = opts.delay || 0;
    gsap.set(targets, { autoAlpha: 0, y: d });
    addTrigger(ScrollTrigger.create({
      trigger: trigger, start: opts.start || 'top 88%', end: 'bottom 6%',
      onEnter: function () { gsap.to(targets, { autoAlpha: 1, y: 0, duration: 0.7, delay: dl, stagger: st, ease: EASE, overwrite: true }); },
      onEnterBack: function () { gsap.fromTo(targets, { autoAlpha: 0, y: -d }, { autoAlpha: 1, y: 0, duration: 0.7, delay: dl, stagger: st, ease: EASE, overwrite: true }); },
      onLeave: function () { gsap.set(targets, { autoAlpha: 0, y: -d }); },
      onLeaveBack: function () { gsap.set(targets, { autoAlpha: 0, y: d }); }
    }));
  }

  var tracked = [];
  function revealBlocks() {
    var seen = new Set(), items = [];
    var skip = function (el) { return el.closest('header, .mobile-menu, dialog, .hero-interactive-container, .demo-dx, .nav, .pj-prev, .hw-stick') || el.matches('h1, h2'); };
    document.querySelectorAll(GROUP_SEL).forEach(function (g) {
      if (skip(g) || g.children.length < 2 || g.children.length > 24) return;
      Array.prototype.forEach.call(g.children, function (k) {
        if (seen.has(k) || k.offsetParent === null || !below(k)) return;
        seen.add(k); k.querySelectorAll('*').forEach(function (x) { seen.add(x); }); items.push(k);
      });
    });
    document.querySelectorAll(REVEAL_SEL).forEach(function (el) {
      if (seen.has(el) || skip(el) || !below(el)) return;
      seen.add(el); items.push(el);
    });
    if (!items.length) return;
    var d = window.innerWidth < 768 ? 16 : 24;
    tracked = items;
    gsap.set(items, { autoAlpha: 0, y: d });
    var tw = function (b, from) { return gsap.fromTo(b, { autoAlpha: 0, y: from }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07, ease: EASE, overwrite: true }); };
    ScrollTrigger.batch(items, {
      start: 'top 92%', end: 'bottom 4%', interval: 0.08, batchMax: 6,
      onEnter: function (b) { tw(b, d); },
      onEnterBack: function (b) { tw(b, -d); },
      onLeave: function (b) { gsap.set(b, { autoAlpha: 0, y: -d, overwrite: true }); },
      onLeaveBack: function (b) { gsap.set(b, { autoAlpha: 0, y: d, overwrite: true }); }
    });
  }

  /* ── Faixas Marinho entram com corte a 45° (diagonal do K) ── */
  function wipes() {
    document.querySelectorAll('main .tone-navy, [data-wipe]').forEach(function (sec) {
      if (!below(sec) || sec.closest('.home-v2')) return;
      addTrigger(ScrollTrigger.create({
        trigger: sec, start: 'top 92%', once: true,
        onEnter: function () {
          gsap.fromTo(sec, { clipPath: 'polygon(0 100%, 0 100%, 0 100%, 0 100%)' },
            { clipPath: 'polygon(0 -60%, 160% 100%, 0 100%, 0 100%)', duration: 0.9, ease: 'power2.inOut', onComplete: function () { sec.style.clipPath = ''; } });
        }
      }));
    });
  }

  /* ── Imagens com máscara (de baixo para cima, com leve zoom) ── */
  function imageMasks() {
    document.querySelectorAll('[data-mask], .car-slide .im, .case-card img').forEach(function (el) {
      if (!below(el) || el.closest('dialog')) return;
      var img = el.tagName === 'IMG' ? el : el.querySelector('img');
      addTrigger(ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () {
          gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: EASE, onComplete: function () { el.style.clipPath = ''; } });
          if (img && window.innerWidth >= 768) gsap.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.1, ease: EASE });
        }
      }));
    });
  }

  /* ── Parallax sutil (só desktop) ── */
  function parallax() {
    ScrollTrigger.matchMedia({
      '(min-width: 900px)': function () {
        document.querySelectorAll('[data-parallax]').forEach(function (el) {
          var f = Math.min(parseFloat(el.dataset.parallax) || 0.1, 0.15);
          gsap.fromTo(el, { yPercent: -f * 40 }, { yPercent: f * 40, ease: 'none', scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }
    });
  }

  /* ── Números que contam (uma vez) ── */
  function counters() {
    var els = document.querySelectorAll('[data-counter], [data-count]');
    els.forEach(function (el) {
      var targetStr = el.dataset.counter || el.dataset.count || el.textContent.trim();
      var m = targetStr.match(/([\D]*)([\d.,]+)([\D]*)/);
      if (!m) return;
      var target = parseFloat(m[2].replace(/\./g, '').replace(',', '.'));
      if (isNaN(target)) return;
      el.setAttribute('aria-label', el.getAttribute('aria-label') || targetStr);
      var run = function () {
        var o = { n: 0 };
        gsap.to(o, { n: target, duration: 1.2, ease: EASE, onUpdate: function () { el.textContent = m[1] + Math.round(o.n).toLocaleString('pt-BR') + m[3]; }, onComplete: function () { el.textContent = targetStr; } });
      };
      if (!below(el)) { run(); return; }
      addTrigger(ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: run }));
    });
  }

  /* ── Metodologia: marca as etapas em sequência (classes usadas pelo CSS) ── */
  function methodology() {
    var sec = document.querySelector('#how-it-works, .process-section, .methodology-section');
    if (!sec) return;
    sec.querySelectorAll('.home-process-card, .process-step').forEach(function (c) { c.classList.add('is-visible', 'methodology-active'); });
  }

  /* ── Âncoras com rolagem suave (desconta o header) ── */
  function smoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      if (a.dataset.anchorBound) return;
      a.dataset.anchorBound = '1';
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id.length <= 1) return;
        var t = document.getElementById(id.slice(1));
        if (!t) return;
        e.preventDefault();
        var top = t.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: top, behavior: reduced() ? 'auto' : 'smooth' });
        if (window.CogitHeader) window.CogitHeader.close(false);
        if (!t.hasAttribute('tabindex')) t.tabIndex = -1;
        t.focus({ preventScroll: true });
      });
    });
  }

  /* Trava: ao parar de rolar, nada visível na tela continua escondido (só os itens acompanhados) */
  function sweep() {
    tracked.forEach(function (el) {
      if (el.style.visibility !== 'hidden' || gsap.isTweening(el)) return;
      var r = el.getBoundingClientRect();
      if (r.height && r.top < window.innerHeight - 20 && r.bottom > 20) gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.3, overwrite: true });
    });
    document.querySelectorAll('.t-line > span').forEach(function (w) {
      if (gsap.isTweening(w) || gsap.getProperty(w, 'yPercent') === 0) return;
      var r = w.parentNode.getBoundingClientRect();
      if (r.top < window.innerHeight - 20 && r.bottom > 20) gsap.to(w, { yPercent: 0, duration: 0.3, overwrite: true });
    });
  }
  function failsafe() {
    var t = null;
    window.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(sweep, 700); }, { passive: true });
    setTimeout(sweep, 2000);
    // fontes mudam a altura dos títulos: recalcula só se a pessoa ainda não começou a rolar
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (window.scrollY < 40) ScrollTrigger.refresh(); });
  }

  function initAnimations() {
    document.documentElement.classList.add('animations-ready');
    markVisible();
    initHeader();
    methodology();
    smoothAnchors();
    if (reduced() || !hasG()) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
    revealTitles();
    revealBlocks();
    wipes();
    imageMasks();
    parallax();
    counters();
    failsafe();
  }

  function refresh() {
    markVisible();
    smoothAnchors();
    if (reduced() || !hasG()) return;
    ScrollTrigger.refresh();
  }

  window.COGIT_ANIMATIONS = { init: initAnimations, refresh: refresh };
  window.initAnimations = initAnimations;
})();
