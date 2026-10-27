/* Template Institucional — comportamento. Sem dependências. */
(() => {
  'use strict';

  const root = document.documentElement;
  const isDemo = root.dataset.mode === 'demo';
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;
  motionQuery.addEventListener('change', (e) => { reduceMotion = e.matches; onScroll(); });

  /* ---------- Aviso discreto ---------- */
  const toastEl = document.querySelector('[data-toast]');
  let toastTimer;
  const toast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 5200);
  };

  /* ---------- Menu ---------- */
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById(toggle?.getAttribute('aria-controls') || '');
  const setMenu = (open) => {
    if (!toggle) return;
    if (open) root.style.setProperty('--menu-top', header.getBoundingClientRect().bottom + 'px');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('[data-menu-label]').textContent = open ? 'Fechar menu' : 'Abrir menu';
    root.classList.toggle('menu-open', open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Link ativo ---------- */
  const navLinks = [...document.querySelectorAll('.nav-list a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach((a) => { const s = document.querySelector(a.getAttribute('href')); if (s) navObserver.observe(s); });
    const top = document.getElementById('topo');
    if (top) navObserver.observe(top);
  }

  /* ---------- Revelação nos dois sentidos ---------- */
  const revealables = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting, boundingClientRect }) => {
        target.classList.toggle('is-in', isIntersecting);
        target.classList.toggle('is-above', !isIntersecting && boundingClientRect.top < 0);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Rolagem: cabeçalho, linha do tempo, painel e parallax ---------- */
  const timeline = document.querySelector('[data-timeline]');
  const steps = timeline ? [...timeline.querySelectorAll('.step')] : [];
  const panel = document.querySelector('.about-panel');
  const parallax = [...document.querySelectorAll('[data-parallax]')];
  const wide = window.matchMedia('(min-width: 960px)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function update() {
    const vh = window.innerHeight;
    header?.classList.toggle('is-scrolled', window.scrollY > 8);

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const progress = reduceMotion ? 1 : clamp((vh * 0.75 - r.top) / (r.height + vh * 0.25), 0, 1);
      timeline.style.setProperty('--progress', progress.toFixed(3));
      steps.forEach((step, i) => step.classList.toggle('is-reached', progress >= (wide.matches ? i / steps.length : i / (steps.length - 0.5)) + 0.02));
    }

    if (panel) {
      // Painel institucional "abre" ao entrar, sobrepondo-se ao hero.
      const r = panel.getBoundingClientRect();
      const t = reduceMotion ? 1 : clamp((vh - r.top) / (vh * 0.6), 0, 1);
      panel.style.setProperty('--panel-scale', (0.96 + 0.04 * t).toFixed(4));
    }

    parallax.forEach((el) => {
      if (reduceMotion || !wide.matches) { el.style.transform = ''; return; }
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px, 0)`;
    });
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  /* ---------- Abas acessíveis (setas, Home, End) ---------- */
  document.querySelectorAll('[data-tabs]').forEach((tabsEl) => {
    const tabs = [...tabsEl.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        select(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
      });
    });
  });

  /* ---------- Depoimentos ---------- */
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const slides = [...slider.querySelectorAll('.slide')];
    const current = slider.querySelector('[data-slide-current]');
    let index = 0;
    const go = (next, dir) => {
      slides[index].hidden = true;
      slides[index].classList.remove('is-active');
      index = (next + slides.length) % slides.length;
      slides[index].style.setProperty('--from', dir > 0 ? '24px' : '-24px');
      slides[index].hidden = false;
      slides[index].classList.add('is-active');
      current.textContent = String(index + 1);
    };
    slider.querySelector('[data-slide="prev"]').addEventListener('click', () => go(index - 1, -1));
    slider.querySelector('[data-slide="next"]').addEventListener('click', () => go(index + 1, 1));
    let startX = null;
    slider.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startX = e.clientX; });
    slider.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      startX = null;
    });
  });

  /* ---------- Canais de contato no modo demonstração ---------- */
  if (isDemo) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-contact]');
      if (!link) return;
      e.preventDefault();
      const label = { whatsapp: 'o WhatsApp', email: 'o e-mail', phone: 'a ligação para o telefone' }[link.dataset.contact] || 'o canal';
      toast(`Demonstração: no site publicado, este link abre ${label} da empresa.`);
    });
  }

  /* ---------- Formulário ---------- */
  const form = document.querySelector('[data-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('[type="submit"]');
    const label = form.querySelector('[data-submit-label]');
    const fields = [...form.querySelectorAll('input:not([name="site"]), select, textarea')];

    const errorFor = (el) => {
      const v = el.validity;
      if (v.valid) return '';
      if (el.type === 'checkbox') return 'É necessário autorizar o contato para enviarmos a proposta.';
      if (v.valueMissing) return 'Preencha este campo.';
      if (v.typeMismatch) return 'Informe um e-mail válido.';
      if (v.patternMismatch) return 'Informe um telefone com DDD, apenas números.';
      return 'Verifique este campo.';
    };
    const check = (el) => {
      const msg = errorFor(el);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      const box = document.getElementById(el.id + '-erro');
      if (box) {
        box.textContent = msg;
        box.hidden = !msg;
        if (msg) el.setAttribute('aria-describedby', box.id); else el.removeAttribute('aria-describedby');
      }
      return !msg;
    };
    fields.forEach((el) => {
      el.addEventListener('blur', () => { if (el.value && el.type !== 'checkbox') check(el); });
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(el); });
      el.addEventListener('change', () => { if (el.type === 'checkbox') check(el); });
    });
    const setStatus = (text, kind) => { status.textContent = text; status.className = 'form-status' + (kind ? ' is-' + kind : ''); };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const invalid = fields.filter((el) => !check(el));
      if (invalid.length) {
        invalid[0].focus();
        setStatus(invalid.length === 1 ? 'Revise o campo destacado.' : `Revise os ${invalid.length} campos destacados.`, 'error');
        return;
      }
      if (form.elements.site.value) return;
      const data = Object.fromEntries(new FormData(form));
      delete data.site;

      if (isDemo) {
        setStatus('Dados válidos. Esta é uma demonstração: nenhuma informação foi enviada.', 'success');
        form.reset();
        return;
      }
      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        const to = document.querySelector('[data-contact="email"]')?.getAttribute('href')?.replace('mailto:', '') || '';
        const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
        window.location.href = `mailto:${to}?subject=${encodeURIComponent('Solicitação de proposta — ' + data.empresa)}&body=${encodeURIComponent(body)}`;
        setStatus('Abrimos seu aplicativo de e-mail com a solicitação pronta. Envie por lá para concluir.', 'success');
        return;
      }
      submit.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      label.textContent = 'Enviando…';
      setStatus('', '');
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        setStatus('Solicitação enviada. Um contador entrará em contato em até um dia útil.', 'success');
      } catch {
        setStatus('Não foi possível enviar agora. Tente novamente ou ligue para (31) 3000-0000.', 'error');
      } finally {
        submit.removeAttribute('aria-busy');
        submit.disabled = false;
        label.textContent = 'Enviar solicitação';
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
