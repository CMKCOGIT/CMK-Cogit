/* Template Portfólio — comportamento. Sem dependências. */
(() => {
  'use strict';

  const root = document.documentElement;
  const isDemo = root.dataset.mode === 'demo';
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;
  motionQuery.addEventListener('change', (e) => { reduceMotion = e.matches; });

  /* ---------- Aviso discreto ---------- */
  const toastEl = document.querySelector('[data-toast]');
  let toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 5200);
  }

  /* ---------- Cabeçalho: estado ao rolar ---------- */
  const header = document.querySelector('[data-header]');
  let lastY = window.scrollY;

  function updateHeader(y) {
    if (!header) return;
    header.classList.toggle('is-scrolled', y > 24);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > 480 && !root.classList.contains('menu-open')) header.classList.add('is-hidden');
    else if (goingUp || y < 480) header.classList.remove('is-hidden');
    lastY = y;
  }
  header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  /* ---------- Menu móvel ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById(toggle?.getAttribute('aria-controls') || '');
  function setMenu(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle-label').textContent = open ? 'Fechar' : 'Menu';
    root.classList.toggle('menu-open', open);
    if (open) menu?.querySelector('a')?.focus();
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Link ativo na navegação ---------- */
  const navLinks = [...document.querySelectorAll('.nav-list a[href^="#"]')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => navObserver.observe(s));
    const top = document.getElementById('topo');
    if (top) navObserver.observe(top);
  }

  /* ---------- Revelação ao rolar (nos dois sentidos) ---------- */
  const revealables = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('is-in');
          el.classList.remove('is-above');
        } else {
          el.classList.remove('is-in');
          // Saiu pelo topo: ao voltar, entra de cima para baixo.
          el.classList.toggle('is-above', entry.boundingClientRect.top < 0);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach((el) => revealObserver.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Parallax discreto ---------- */
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')].map((el) => ({ el, factor: parseFloat(el.dataset.parallax) || 0, visible: false }));
  const desktop = window.matchMedia('(min-width: 760px)');
  if ('IntersectionObserver' in window && parallaxItems.length) {
    const pObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const item = parallaxItems.find((p) => p.el === entry.target);
        if (item) item.visible = entry.isIntersecting;
      });
    }, { rootMargin: '20% 0px' });
    parallaxItems.forEach((p) => pObserver.observe(p.el));
  }
  function updateParallax() {
    const enabled = !reduceMotion && desktop.matches;
    const vh = window.innerHeight;
    parallaxItems.forEach((p) => {
      if (!enabled) { p.el.style.transform = ''; return; }
      if (!p.visible) return;
      const rect = p.el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - vh / 2) * p.factor;
      p.el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
  }

  /* ---------- Um único laço de rolagem ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeader(window.scrollY);
      updateParallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Arquivo: prévia que acompanha o cursor ---------- */
  const archive = document.querySelector('[data-archive]');
  const preview = document.querySelector('[data-archive-preview]');
  if (archive && preview && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const img = preview.querySelector('img');
    const rows = archive.querySelectorAll('[data-preview]');
    rows.forEach((row) => { const pre = new Image(); pre.src = row.dataset.preview; });
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const follow = () => {
      cx += (x - cx) * (reduceMotion ? 1 : 0.18);
      cy += (y - cy) * (reduceMotion ? 1 : 0.18);
      preview.style.left = cx + 'px';
      preview.style.top = cy + 'px';
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(follow) : 0;
    };
    archive.addEventListener('pointermove', (e) => {
      x = e.clientX + 170; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(follow);
    });
    rows.forEach((row) => row.addEventListener('pointerenter', (e) => {
      if (!preview.classList.contains('is-visible')) { cx = x = e.clientX + 170; cy = y = e.clientY; }
      img.src = row.dataset.preview;
      preview.classList.add('is-visible');
    }));
    archive.addEventListener('pointerleave', () => preview.classList.remove('is-visible'));
  }

  /* ---------- Canais de contato no modo demonstração ---------- */
  if (isDemo) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-contact]');
      if (!link) return;
      e.preventDefault();
      const kind = link.dataset.contact;
      const label = kind === 'whatsapp' ? 'o WhatsApp' : kind === 'email' ? 'o e-mail' : 'o perfil';
      toast(`Demonstração: no site publicado, este link abre ${label} do cliente.`);
    });
  }

  /* ---------- Formulário ---------- */
  const form = document.querySelector('[data-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('[type="submit"]');
    const label = form.querySelector('[data-submit-label]');
    const messages = {
      valueMissing: 'Preencha este campo.',
      typeMismatch: 'Informe um e-mail válido, como nome@empresa.com.br.',
      tooShort: (el) => `Escreva pelo menos ${el.minLength} caracteres.`,
    };

    const fieldError = (el) => {
      if (el.validity.valid) return '';
      if (el.validity.valueMissing) return el.tagName === 'SELECT' ? 'Selecione uma opção.' : messages.valueMissing;
      if (el.validity.typeMismatch) return messages.typeMismatch;
      if (el.validity.tooShort) return messages.tooShort(el);
      return 'Verifique este campo.';
    };
    const showError = (el) => {
      const box = document.getElementById(el.id + '-erro');
      const msg = fieldError(el);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (box) {
        box.textContent = msg;
        box.hidden = !msg;
        const describedBy = new Set((el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
        msg ? describedBy.add(box.id) : describedBy.delete(box.id);
        describedBy.size ? el.setAttribute('aria-describedby', [...describedBy].join(' ')) : el.removeAttribute('aria-describedby');
      }
      return !msg;
    };

    const fields = [...form.querySelectorAll('input:not([name="site"]), select, textarea')];
    fields.forEach((el) => {
      el.addEventListener('blur', () => { if (el.value) showError(el); });
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') showError(el); });
    });

    const setStatus = (text, kind) => {
      status.textContent = text;
      status.className = 'form-status' + (kind ? ' is-' + kind : '');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const invalid = fields.filter((el) => !showError(el));
      if (invalid.length) {
        invalid[0].focus();
        setStatus(`Revise ${invalid.length === 1 ? 'o campo destacado' : 'os ' + invalid.length + ' campos destacados'}.`, 'error');
        return;
      }
      if (form.elements.site.value) return; // armadilha para robôs

      const data = Object.fromEntries(new FormData(form));
      delete data.site;
      const endpoint = form.dataset.endpoint;

      if (isDemo) {
        setStatus('Tudo certo com os dados. Esta é uma demonstração: nada foi enviado.', 'success');
        form.reset();
        return;
      }

      if (!endpoint) {
        const to = form.dataset.mailto || document.querySelector('[data-contact="email"]')?.getAttribute('href')?.replace('mailto:', '') || '';
        const body = `Nome: ${data.nome}\nE-mail: ${data.email}\nProjeto: ${data.tipo}\nInício: ${data.prazo}\n\n${data.mensagem}`;
        window.location.href = `mailto:${to}?subject=${encodeURIComponent('Novo projeto — ' + data.tipo)}&body=${encodeURIComponent(body)}`;
        setStatus('Abrimos seu aplicativo de e-mail com a mensagem pronta. Envie por lá para concluir.', 'success');
        return;
      }

      submit.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      label.textContent = 'Enviando…';
      setStatus('', '');
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        setStatus('Mensagem enviada. Respondo em até dois dias úteis.', 'success');
      } catch {
        setStatus('Não foi possível enviar agora. Tente de novo ou escreva para o e-mail ao lado.', 'error');
      } finally {
        submit.removeAttribute('aria-busy');
        submit.disabled = false;
        label.textContent = 'Enviar mensagem';
      }
    });
  }

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
