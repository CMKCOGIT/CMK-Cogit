/* Modelos prontos CMKCOGIT: comportamento comum aos três modelos. Sem dependências.
   Igual em landing/, portfolio/ e institucional/ (copiado por tools/templates/build-models.py). */
(() => {
  'use strict';

  const root = document.documentElement;
  const isDemo = root.dataset.mode === 'demo';
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

  /* ---------- Cabeçalho ---------- */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu no celular ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    const setOpen = (open, focusToggle) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
      if (!open && focusToggle) toggle.focus();
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true); });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Revelação nos dois sentidos ---------- */
  const revealables = document.querySelectorAll('[data-reveal]');
  if (hasIO) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => target.classList.toggle('is-in', isIntersecting));
    }, { rootMargin: '0px 0px -6% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Chamada fixa no celular: aparece depois do topo e some perto do formulário ---------- */
  const sticky = document.querySelector('[data-sticky-cta]');
  const hero = document.querySelector('.hero');
  const formSection = document.querySelector('[data-form]')?.closest('section');
  if (sticky && hero && formSection && hasIO) {
    let pastHero = false, nearForm = false;
    const link = sticky.querySelector('a');
    const sync = () => {
      const visible = pastHero && !nearForm;
      sticky.classList.toggle('is-visible', visible);
      link.tabIndex = visible ? 0 : -1;
    };
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(hero);
    new IntersectionObserver(([e]) => { nearForm = e.isIntersecting; sync(); }, { rootMargin: '0px 0px 10% 0px' }).observe(formSection);
    sync();
  }

  /* ---------- Canais de contato no modo demonstração ---------- */
  const canal = { whatsapp: 'o WhatsApp', email: 'o e-mail', phone: 'a ligação', social: 'a rede social' };
  if (isDemo) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-contact]');
      if (!link) return;
      e.preventDefault();
      toast(`Demonstração: no site publicado, este link abre ${canal[link.dataset.contact] || 'o contato'} da empresa.`);
    });
  }

  /* ---------- Formulário ---------- */
  const form = document.querySelector('[data-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('[type="submit"]');
    const label = form.querySelector('[data-submit-label]');
    const defaultLabel = label.textContent;
    const fields = [...form.querySelectorAll('input[required], select[required], textarea[required]')];

    const errorFor = (el) => {
      const v = el.validity;
      if (v.valid) return '';
      if (el.type === 'checkbox') return 'Marque esta opção para podermos responder.';
      if (v.valueMissing) return el.tagName === 'SELECT' ? 'Escolha uma opção.' : 'Preencha este campo.';
      if (v.typeMismatch) return 'Informe um e-mail válido, como nome@empresa.com.br.';
      if (v.patternMismatch) return 'Informe o WhatsApp com DDD.';
      if (v.tooShort) return `Escreva pelo menos ${el.minLength} caracteres.`;
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
      el.addEventListener('change', () => { if (el.type === 'checkbox' || el.tagName === 'SELECT') check(el); });
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
      if (form.elements.site && form.elements.site.value) return; // campo-isca para robôs
      const data = Object.fromEntries(new FormData(form));
      delete data.site;
      delete data.consentimento;

      if (isDemo) {
        setStatus('Tudo certo. Esta é uma demonstração: nenhum dado foi enviado.', 'success');
        form.reset();
        return;
      }
      const resumo = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');
      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        // Sem serviço de formulário: abre o WhatsApp (ou o e-mail) com a mensagem pronta.
        const wa = document.querySelector('[data-contact="whatsapp"]')?.getAttribute('href');
        const mail = document.querySelector('[data-contact="email"]')?.getAttribute('href');
        const texto = `Olá! Vim pelo site.\n${resumo}`;
        if (form.dataset.fallback !== 'email' && wa) window.open(`${wa}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
        else if (mail) window.location.href = `${mail}?subject=${encodeURIComponent('Contato pelo site')}&body=${encodeURIComponent(texto)}`;
        setStatus('Abrimos sua mensagem pronta. Envie por lá para concluir.', 'success');
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
        setStatus('Recebemos sua mensagem. Respondemos em até um dia útil.', 'success');
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
