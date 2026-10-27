/* Template Landing Page — comportamento. Sem dependências. */
(() => {
  'use strict';

  const root = document.documentElement;
  const isDemo = root.dataset.mode === 'demo';
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;
  motionQuery.addEventListener('change', (e) => { reduceMotion = e.matches; });
  const hasIO = 'IntersectionObserver' in window;

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

  /* ---------- Revelação nos dois sentidos ---------- */
  const revealables = document.querySelectorAll('[data-reveal]');
  if (hasIO) {
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

  /* ---------- Cenas da solução: o texto em foco troca a tela do aparelho ---------- */
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const screens = [...document.querySelectorAll('.device [data-screen]')];
  // No celular, cada cena mostra a própria tela (cópia decorativa, oculta de leitores de tela).
  scenes.forEach((scene) => {
    const shot = scene.querySelector('.scene-shot');
    const screen = screens[Number(scene.dataset.scene)];
    if (shot && screen) shot.append(screen.cloneNode(true));
  });
  const setScene = (index) => {
    scenes.forEach((s, i) => s.classList.toggle('is-current', i === index));
    screens.forEach((s, i) => s.classList.toggle('is-on', i === index));
  };
  setScene(0);
  if (hasIO && scenes.length) {
    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setScene(Number(entry.target.dataset.scene)); });
    }, { rootMargin: '-48% 0px -48% 0px' });
    scenes.forEach((s) => sceneObserver.observe(s));
  }

  /* ---------- CTA fixo no celular: aparece após o hero, some perto do formulário ---------- */
  const sticky = document.querySelector('[data-sticky-cta]');
  const hero = document.querySelector('.hero');
  const finalCta = document.getElementById('demonstracao');
  if (sticky && hero && finalCta && hasIO) {
    let pastHero = false, nearForm = false;
    const sync = () => sticky.classList.toggle('is-visible', pastHero && !nearForm);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(hero);
    new IntersectionObserver(([e]) => { nearForm = e.isIntersecting; sync(); }, { rootMargin: '0px 0px 10% 0px' }).observe(finalCta);
    // Elementos fora da tela não recebem foco pelo teclado.
    const link = sticky.querySelector('a');
    new MutationObserver(() => { link.tabIndex = sticky.classList.contains('is-visible') ? 0 : -1; }).observe(sticky, { attributes: true, attributeFilter: ['class'] });
    link.tabIndex = -1;
  }

  /* ---------- Rolagem: progresso, cabeçalho e parallax ---------- */
  const header = document.querySelector('[data-header]');
  const bar = document.querySelector('[data-progress]');
  const parallax = [...document.querySelectorAll('[data-parallax]')];
  const wide = window.matchMedia('(min-width: 1000px)');
  function update() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');
    header?.classList.toggle('is-scrolled', y > 8);
    const vh = window.innerHeight;
    parallax.forEach((el) => {
      if (reduceMotion || !wide.matches) { el.style.transform = ''; return; }
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px, 0)`;
    });
  }
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  /* ---------- Canais de contato no modo demonstração ---------- */
  if (isDemo) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-contact]');
      if (!link) return;
      e.preventDefault();
      toast(`Demonstração: no site publicado, este link abre ${link.dataset.contact === 'whatsapp' ? 'o WhatsApp' : 'o e-mail'} da empresa.`);
    });
  }

  /* ---------- Formulário de demonstração ---------- */
  const form = document.querySelector('[data-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('[type="submit"]');
    const label = form.querySelector('[data-submit-label]');
    const defaultLabel = label.textContent;
    const fields = [...form.querySelectorAll('input[required]')];

    const errorFor = (el) => {
      const v = el.validity;
      if (v.valid) return '';
      if (el.type === 'checkbox') return 'Marque esta opção para podermos entrar em contato.';
      if (v.valueMissing) return 'Preencha este campo.';
      if (v.typeMismatch) return 'Informe um e-mail válido, como nome@email.com.';
      if (v.patternMismatch) return 'Informe o WhatsApp com DDD, apenas números.';
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
        setStatus(invalid.length === 1 ? 'Falta só um detalhe no campo destacado.' : `Revise os ${invalid.length} campos destacados.`, 'error');
        return;
      }
      if (form.elements.site.value) return;
      const data = Object.fromEntries(new FormData(form));
      delete data.site;

      if (isDemo) {
        setStatus('Tudo certo. Esta é uma demonstração: nenhum dado foi enviado.', 'success');
        form.reset();
        return;
      }
      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        // Sem serviço de formulário configurado: abre o WhatsApp com a mensagem pronta.
        const wa = document.querySelector('[data-contact="whatsapp"]')?.getAttribute('href') || '';
        const text = `Olá! Quero agendar uma demonstração.\nNome: ${data.nome}\nE-mail: ${data.email}\nWhatsApp: ${data.whatsapp}\nAtendimento: ${data.perfil}`;
        window.open(`${wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        setStatus('Abrimos o WhatsApp com a mensagem pronta. Envie por lá para concluir.', 'success');
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
        setStatus('Recebemos seu contato. Vamos escrever no seu WhatsApp em até um dia útil.', 'success');
      } catch {
        setStatus('Não conseguimos enviar agora. Tente de novo em instantes ou fale pelo WhatsApp.', 'error');
      } finally {
        submit.removeAttribute('aria-busy');
        submit.disabled = false;
        label.textContent = defaultLabel;
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
