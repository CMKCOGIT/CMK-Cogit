/* Modelos prontos de landing page CMKCOGIT: comportamento do site publicado. Sem dependências.
   Fonte única: tools/templates/base/landing-site.js (cópia idêntica em cada modelo, em js/site.js).
   Menu do celular, cabeçalho ao rolar, revelação das seções e espaços de imagem. */
(function () {
  'use strict';
  var root = document.documentElement;

  // Espaço de imagem: sem foto, mostra "Adicionar imagem N" com a identificação do espaço.
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/></svg>';
  function renderSlot(slot, data) {
    var n = slot.getAttribute('data-img');
    var img = slot.querySelector(':scope > img');
    var ph = slot.querySelector(':scope > .slot-ph');
    if (data && data.src) {
      if (!img) { img = document.createElement('img'); img.decoding = 'async'; slot.prepend(img); }
      if (img.getAttribute('src') !== data.src) img.src = data.src;
      img.alt = data.alt || '';
      var x = data.x == null ? 50 : data.x, y = data.y == null ? 50 : data.y, z = data.zoom || 100;
      img.style.objectPosition = x + '% ' + y + '%';
      img.style.transformOrigin = x + '% ' + y + '%';
      img.style.transform = z > 100 ? 'scale(' + (z / 100) + ')' : '';
      if (ph) ph.remove();
      slot.classList.add('has-img');
    } else {
      if (img && (data === null || !img.getAttribute('src'))) img.remove();
      else if (img) return; // imagem já gravada no HTML publicado
      if (!ph) {
        ph = document.createElement('div');
        ph.className = 'slot-ph';
        ph.innerHTML = ICON + '<strong></strong><span></span>';
        ph.querySelector('strong').textContent = 'Adicionar imagem ' + n;
        ph.querySelector('span').textContent = 'IMAGEM ' + n + ' · ' + (slot.getAttribute('data-img-label') || '');
        slot.appendChild(ph);
      }
      slot.classList.remove('has-img');
    }
  }
  document.querySelectorAll('[data-img]').forEach(function (s) { renderSlot(s); });

  // Iniciais dos depoimentos acompanham o nome.
  function syncInitials() {
    document.querySelectorAll('[data-initial-of]').forEach(function (el) {
      var src = document.querySelector('[data-k="' + el.getAttribute('data-initial-of') + '"]');
      var t = src ? src.textContent.trim() : '';
      el.textContent = t ? t.charAt(0).toUpperCase() : '';
    });
  }
  syncInitials();

  // Ano atual no rodapé.
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  // Menu do celular.
  var btn = document.querySelector('[data-menu-btn]');
  var nav = document.querySelector('[data-nav]');
  if (btn && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
    };
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); } });
  }

  // Cabeçalho ganha borda ao rolar.
  var header = document.querySelector('[data-header]');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Revelação ao rolar (desligada para quem prefere menos movimento).
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.section-head, .about-copy, .slot-about, .card, .benefit, .quote, .testimonials-side, .cta-box, .work, [data-reveal]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (t) { t.classList.add('reveal'); io.observe(t); });
  }

  // Formulário de contato (quando o modelo tem um). Com data-endpoint (gravado pelo configure.mjs),
  // envia JSON por POST; sem ele, abre o WhatsApp do rodapé com a mensagem pronta ou, sem WhatsApp, o e-mail.
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var status = form.querySelector('[data-form-status]');
    var say = function (msg, ok) { if (!status) return; status.textContent = msg; status.hidden = false; status.classList.toggle('is-ok', !!ok); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        var bad = form.querySelector(':invalid'); if (bad) bad.focus();
        say('Confira os campos destacados antes de enviar.'); form.classList.add('was-validated');
        return;
      }
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
      var text = 'Olá! Sou ' + (data.nome || '') + (data.email ? ' (' + data.email + ')' : '') + '.\n\n' + (data.mensagem || '');
      var wa = document.querySelector('[data-href="contact.whatsapp"]');
      var mail = document.querySelector('[data-href="contact.email"]');
      var waHref = wa && !wa.closest('[hidden]') ? wa.getAttribute('href') : '';
      var mailHref = mail && !mail.closest('[hidden]') ? mail.getAttribute('href') : '';
      if (root.getAttribute('data-mode') === 'demo') {
        say('Demonstração: no site publicado, esta mensagem é enviada ' + (form.dataset.endpoint ? 'para o seu sistema de contatos.' : waHref ? 'pelo WhatsApp.' : 'por e-mail.'), true);
        return;
      }
      var btn = form.querySelector('[type="submit"]');
      if (form.dataset.endpoint) {
        if (btn) btn.disabled = true;
        fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(); form.reset(); say('Mensagem enviada! Responderemos em breve.', true); })
          .catch(function () { say('Não foi possível enviar agora. Tente de novo ou use o WhatsApp.'); })
          .then(function () { if (btn) btn.disabled = false; });
      } else if (/wa\.me\/\d+/.test(waHref)) {
        window.open(waHref.split('?')[0] + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        say('Abrimos o WhatsApp com a sua mensagem pronta.', true);
      } else if (/^mailto:/.test(mailHref)) {
        location.href = mailHref.split('?')[0] + '?subject=' + encodeURIComponent('Contato pelo site') + '&body=' + encodeURIComponent(text);
        say('Abrimos o seu e-mail com a mensagem pronta.', true);
      } else {
        say('Configure um WhatsApp ou e-mail de contato para receber as mensagens.');
      }
    });
  });

  window.LP = { renderSlot: renderSlot, syncInitials: syncInitials, root: root };
})();
