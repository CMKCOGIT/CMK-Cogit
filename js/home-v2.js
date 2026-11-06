// home-v2.js — interações da página inicial (identidade 2026).
// · Diagnóstico em janela: o mesmo fluxo de js/components.js, aberto por "Monte sua solução".
// · Demonstração em movimento do diagnóstico, passando por cada solução.
// · Projetos com prévia fixa, carrossel de modelos prontos e preços vindos de js/data.js.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var brl = function (n) { return 'R$ ' + Number(n).toLocaleString('pt-BR'); };
  var svc = function (id) { return (typeof configuratorData !== 'undefined' && configuratorData.services || []).find(function (s) { return s.id === id; }) || {}; };
  var prazo = function (id) { return (typeof presenceModels !== 'undefined' && presenceModels[id] && presenceModels[id].prazo) || ''; };

  /* ── Diagnóstico em janela ── */
  var dlg = $('#dx-modal');
  function openDx() {
    if (!dlg) return;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.classList.add('no-scroll');
    if (window.heroStartDiagnosis) window.heroStartDiagnosis();
    // anima só o conteúdo: mexer no próprio <dialog> com transform o tira da camada modal
    if (window.gsap && !RM) gsap.fromTo(dlg.children, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: 'expo.out', clearProps: 'transform,opacity' });
  }
  function closeDx() { if (dlg && dlg.open) dlg.close(); }
  if (dlg) {
    dlg.addEventListener('close', function () { document.body.classList.remove('no-scroll'); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDx(); });
    $$('[data-close-diagnostico]', dlg).forEach(function (b) { b.addEventListener('click', closeDx); });
  }
  $$('[data-open-diagnostico]').forEach(function (b) { b.addEventListener('click', openDx); });
  if (/[?&]diagnostico=1/.test(location.search) || location.hash === '#diagnostico') setTimeout(openDx, 300);

  /* ── Preços dos modelos (catálogo) ── */
  $$('[data-price]').forEach(function (el) { var s = svc(el.dataset.price); if (s.price) el.textContent = brl(s.price); });
  $$('[data-custom]').forEach(function (el) { var s = svc(el.dataset.custom); if (s.customPrice) el.textContent = 'a partir de ' + brl(s.customPrice); });
  $$('[data-prazo]').forEach(function (el) { el.textContent = prazo(el.dataset.prazo); });
  var smp = $('#hsm-prices');
  if (smp) smp.innerHTML = [['landing-page', 'Landing page'], ['portfolio', 'Portfólio'], ['site-institucional', 'Site institucional']].map(function (x) {
    var s = svc(x[0]); return s.customPrice ? '<span>' + x[1] + ' <b>a partir de ' + brl(s.customPrice) + '</b></span>' : '';
  }).join('');

  /* ── Vídeo e demonstração dos modelos (janela já existente em components.js) ── */
  $$('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.dataset.video, d = (typeof MODEL_PREVIEW_DATA !== 'undefined' && MODEL_PREVIEW_DATA[id]) || {};
      if (window.openModelPreviewModal) window.openModelPreviewModal(id, d.name || '');
    });
  });

  /* ── Carrossel ── */
  var tr = $('#car-track'), dots = $('#car-dots');
  if (tr && dots) {
    var slides = $$('.car-slide', tr);
    dots.innerHTML = slides.map(function (s, i) { return '<button type="button" aria-label="Ir para o modelo ' + (i + 1) + '"></button>'; }).join('');
    var step = function () { return slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(tr).columnGap || 24); };
    var cur = function () { return Math.round(tr.scrollLeft / step()); };
    var go = function (i) { tr.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, i)) * step(), behavior: RM ? 'auto' : 'smooth' }); };
    var upd = function () {
      var i = cur();
      $$('button', dots).forEach(function (b, j) { b.setAttribute('aria-current', String(i === j)); });
      $('#car-cnt').textContent = (i + 1) + ' / ' + slides.length;
      $('#car-prev').disabled = i === 0; $('#car-next').disabled = i === slides.length - 1;
    };
    $$('button', dots).forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
    $('#car-prev').addEventListener('click', function () { go(cur() - 1); });
    $('#car-next').addEventListener('click', function () { go(cur() + 1); });
    tr.addEventListener('scroll', function () { clearTimeout(tr._t); tr._t = setTimeout(upd, 60); }, { passive: true });
    tr.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur() - 1); } });
    upd();

    /* Passagem automática: a cada 6 s, volta ao primeiro no fim. Pausa ao passar o mouse, focar ou tocar,
       fora da tela, com a aba escondida e com uma janela aberta. Com "reduzir movimento" começa desligada. */
    var autoBtn = $('#car-auto'), DUR = 6000, auto = !RM, hold = false, onScreen = false, timer = null, t0 = 0, left = DUR, raf = 0;
    function paint(p) {
      $$('button', dots).forEach(function (b) { b.style.setProperty('--p', b.getAttribute('aria-current') === 'true' ? String(p) : '0'); });
    }
    function stop() {
      clearTimeout(timer); timer = null; cancelAnimationFrame(raf);
      if (t0) { left = Math.max(0, left - (performance.now() - t0)); t0 = 0; }
    }
    function tick() { if (!t0) return; paint(Math.min(1, 1 - Math.max(0, left - (performance.now() - t0)) / DUR)); raf = requestAnimationFrame(tick); }
    function start() {
      stop();
      if (!auto || hold || !onScreen || document.hidden || document.querySelector('dialog[open]')) { paint(auto ? 1 - left / DUR : 1); return; }
      t0 = performance.now(); raf = requestAnimationFrame(tick);
      timer = setTimeout(function () { t0 = 0; left = DUR; var i = cur(); go(i >= slides.length - 1 ? 0 : i + 1); setTimeout(start, 700); }, left);
    }
    function setAuto(on) {
      auto = on; left = DUR;
      autoBtn.setAttribute('aria-pressed', String(on));
      autoBtn.setAttribute('aria-label', on ? 'Pausar passagem automática' : 'Ativar passagem automática');
      $('#car-auto-ic').innerHTML = on ? '<path d="M5 3v10M11 3v10"/>' : '<path d="M5 3l8 5-8 5z"/>';
      start();
    }
    autoBtn.addEventListener('click', function () { setAuto(!auto); });
    var car = $('#car');
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { car.addEventListener(ev, function () { hold = true; stop(); }, { passive: true }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { car.addEventListener(ev, function () { hold = false; start(); }); });
    car.addEventListener('touchend', function () { setTimeout(function () { hold = false; start(); }, 2500); }, { passive: true });
    [$('#car-prev'), $('#car-next')].concat($$('button', dots)).forEach(function (b) { b.addEventListener('click', function () { left = DUR; }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { onScreen = e.isIntersecting; if (onScreen) start(); else stop(); }); }, { threshold: 0.35 }).observe(car);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    document.addEventListener('close', function () { setTimeout(start, 50); }, true);
    setAuto(auto);
  }

  /* ── Projetos: lista com prévia fixa ── */
  var items = $$('.pj-it'), imgs = $$('#pj-frame img'), frame = $('#pj-frame');
  function act(i) {
    items.forEach(function (it, j) { it.classList.toggle('is-on', j === i); });
    imgs.forEach(function (im, j) { im.classList.toggle('is-on', j === i); });
    var cap = $('#pj-cap'); if (cap && items[i]) cap.textContent = String(i + 1).padStart(2, '0') + ' · ' + items[i].querySelector('h3').textContent;
  }
  items.forEach(function (it, i) {
    it.addEventListener('mouseenter', function () { act(i); });
    it.addEventListener('focusin', function () { act(i); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) act(i); }); }, { rootMargin: '-45% 0px -45% 0px' }).observe(it);
  });
  if (frame) {
    var fc = $('.pj-cur', frame);
    frame.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = frame.getBoundingClientRect(); fc.style.left = (e.clientX - r.left) + 'px'; fc.style.top = (e.clientY - r.top) + 'px'; frame.classList.add('is-hover'); });
    frame.addEventListener('pointerleave', function () { frame.classList.remove('is-hover'); });
  }

  /* ── Demonstração em movimento do diagnóstico ── */
  var demo = $('#demo-dx');
  if (!demo) return;
  var tags = {
    p: ['Já tenho logotipo e identidade visual', 'Preciso de ajuda com os textos', 'Tenho fotos e imagens próprias', 'Já tenho domínio', 'Tenho um prazo definido'],
    o: ['Hoje usamos planilhas', 'Preciso integrar com sistemas que já uso', 'Ainda estou validando a ideia', 'Tenho um prazo definido', 'Já tenho uma equipe técnica']
  };
  var P = function (id, name, desc) { var s = svc(id), m = (typeof presenceModels !== 'undefined' && presenceModels[id]) || {}; return { id: id, g: 'p', name: name, desc: desc, price: s.price || 0, custom: s.customPrice || 0, pronto: m.pronto || name, prazo: m.prazo || '' }; };
  var O = function (id, name, desc, price, obj) { return { id: id, g: 'o', name: name, desc: desc, price: price, obj: obj }; };
  var DM = [
    P('site-institucional', 'Site Institucional', 'Apresente sua empresa e gere confiança.'),
    P('landing-page', 'Landing Page', 'Transforme campanhas em contatos e vendas.'),
    P('portfolio', 'Portfólio', 'Mostre trabalhos, serviços e resultados.'),
    O('automacao-svc', 'Automação', 'Elimine tarefas repetitivas e conecte ferramentas.', 890, ['Automatizar processos internos', 'Reduzir tarefas manuais', 'Integrar ferramentas existentes', 'Criar fluxos inteligentes']),
    O('sistema-svc', 'Sistema Web', 'Organize sua operação em um software próprio.', 2990, ['Criar um sistema personalizado', 'Melhorar minha operação', 'Centralizar informações', 'Digitalizar processos']),
    O('saas-svc', 'Produto Digital', 'Crie um produto digital por assinatura.', 3990, ['Criar uma plataforma escalável', 'Transformar minha ideia em produto', 'Criar um sistema por assinatura', 'Validar modelo de negócio']),
    O('mvp-svc', 'MVP', 'Valide sua ideia com uma primeira versão funcional.', 3990, ['Tirar minha ideia do papel', 'Criar um MVP funcional', 'Validar meu conceito', 'Testar uma nova solução']),
    O('plataforma-svc', 'Plataforma', 'Conecte usuários, serviços e oportunidades.', 4990, ['Criar uma plataforma escalável', 'Transformar minha ideia em produto', 'Criar um sistema por assinatura', 'Validar modelo de negócio'])
  ];
  /* Expandir: a demonstração ocupa a tela; Esc ou o mesmo botão fecham */
  var expBtn = $('#dd-expand'), veil = null;
  function setExpanded(on) {
    demo.classList.toggle('is-expanded', on);
    expBtn.setAttribute('aria-pressed', String(on));
    expBtn.setAttribute('aria-label', on ? 'Fechar demonstração expandida' : 'Expandir demonstração');
    expBtn.querySelector('span').textContent = on ? 'Fechar' : 'Expandir';
    document.body.classList.toggle('no-scroll', on);
    if (on) { veil = document.createElement('div'); veil.className = 'dd-veil'; veil.addEventListener('click', function () { setExpanded(false); }); document.body.appendChild(veil); expBtn.focus(); }
    else if (veil) { veil.remove(); veil = null; }
    if (typeof play === 'function') setTimeout(play, 60);
  }
  if (expBtn) expBtn.addEventListener('click', function () { setExpanded(!demo.classList.contains('is-expanded')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && demo.classList.contains('is-expanded')) setExpanded(false); });
  var stage = $('#dd-stage'), curEl = $('#dd-cursor'), segs = $('#dd-segs');
  var idx = 0, timers = [], paused = RM, visible = true;
  segs.style.gridTemplateColumns = 'repeat(' + DM.length + ',1fr)';
  segs.innerHTML = DM.map(function () { return '<i><b></b></i>'; }).join('');
  function clear() { timers.forEach(clearTimeout); timers = []; if (window.gsap) gsap.killTweensOf($$('b', segs)); }
  function at(ms, f) { timers.push(setTimeout(f, ms)); }
  function moveTo(el, click) {
    if (!el || RM) return;
    var r = demo.getBoundingClientRect(), e = el.getBoundingClientRect();
    curEl.classList.add('is-moving');
    curEl.style.transform = 'translate(' + (e.left - r.left + e.width * 0.6) + 'px,' + (e.top - r.top + e.height * 0.55) + 'px)';
    if (click) at(720, function () { curEl.classList.remove('is-click'); void curEl.offsetWidth; curEl.classList.add('is-click'); el.classList.add('is-sel'); });
  }
  function rail(n, isP) { var sp = $$('#dd-rail span'); sp[1].textContent = isP ? 'Formato' : 'Objetivo'; sp.forEach(function (s, i) { s.className = i < n ? 'is-ok' : i === n ? 'is-on' : ''; }); }
  function show(n) { $$('.dd-st', stage).forEach(function (x) { x.classList.toggle('is-on', +x.dataset.s === n); }); }
  function scene(s) {
    var isP = s.g === 'p', grp = DM.filter(function (x) { return x.g === s.g; }).slice(0, 4), t = tags[s.g], pick = isP ? [t[0], t[3]] : [t[0], t[1]];
    var opt = function (b, sm, k) { return '<div class="dd-opt"' + (k ? ' data-k="' + k + '"' : '') + '><b>' + b + '</b>' + (sm ? '<small>' + sm + '</small>' : '') + '</div>'; };
    stage.innerHTML =
      '<div class="dd-st" data-s="0"><p class="dd-q">Etapa 1 · Qual solução você procura?</p><h4>' + (isP ? 'Presença digital' : 'Operação e produto') + '</h4><div class="dd-opts">' + grp.map(function (x) { return '<div class="dd-opt" data-id="' + x.id + '"><b>' + x.name + '</b><small>A partir de ' + brl(x.price) + '</small></div>'; }).join('') + '</div></div>' +
      '<div class="dd-st" data-s="1"><p class="dd-q">Etapa 2 · ' + (isP ? 'Como prefere começar?' : 'Qual é o objetivo principal?') + '</p><h4>' + s.name + '</h4><div class="dd-opts">' +
        (isP ? opt('Modelo pronto', brl(s.price) + ' · ' + s.prazo, 'a') + opt('Sob medida', 'A partir de ' + brl(s.custom))
             : s.obj.map(function (o, i) { return opt(o, '', i === 0 ? 'a' : ''); }).join('')) + '</div></div>' +
      '<div class="dd-st" data-s="2"><p class="dd-q">Etapa 3 · Conte um pouco do seu contexto</p><h4>Contexto</h4><div class="dd-chips">' + t.map(function (x) { return '<span class="dd-chip"' + (pick.indexOf(x) > -1 ? ' data-pick' : '') + '>' + x + '</span>'; }).join('') + '</div><div class="dd-typed" id="dd-typed"></div></div>' +
      '<div class="dd-st" data-s="3"><p class="dd-q">Etapa 4 · Sua recomendação</p><div class="dd-sum"><div class="dd-sum-nm">' + (isP ? s.pronto : s.name) + '</div><dl><div><dt>Investimento</dt><dd>' + (isP ? brl(s.price) : 'a partir de ' + brl(s.price)) + '</dd></div><div><dt>Prazo</dt><dd>' + (isP ? s.prazo : 'definido no escopo') + '</dd></div></dl><span class="dd-go">Continuar na plataforma ↗</span><p class="dd-ps">Você revisa tudo antes de qualquer pagamento.</p></div></div>';
    $('#dd-nm').innerHTML = s.name + '<small>' + (isP ? 'Presença digital' : 'Operação e produto') + '</small>';
    $('#dd-cnt').textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(DM.length).padStart(2, '0');
    $$('i', segs).forEach(function (seg, j) { seg.firstChild.style.transform = j < idx ? 'scaleX(1)' : 'scaleX(0)'; });
    return { isP: isP, txt: isP ? 'Quero apresentar meus serviços e receber pedidos pelo WhatsApp.' : 'Hoje controlamos tudo em planilhas e perdemos informação.' };
  }
  function play() {
    clear();
    var s = DM[idx], sc = scene(s);
    rail(0, sc.isP); show(0);
    if (paused || !visible) { rail(3, sc.isP); show(3); return; }
    var seg = $$('i', segs)[idx].firstChild;
    if (window.gsap) gsap.fromTo(seg, { scaleX: 0 }, { scaleX: 1, duration: 10.4, ease: 'none' });
    at(500, function () { moveTo($('.dd-st[data-s="0"] .dd-opt[data-id="' + s.id + '"]', stage), true); });
    at(2300, function () { rail(1, sc.isP); show(1); });
    at(2800, function () { moveTo($('.dd-st[data-s="1"] .dd-opt[data-k="a"]', stage), true); });
    at(4900, function () { rail(2, sc.isP); show(2); });
    at(5300, function () { var c = $$('.dd-st[data-s="2"] .dd-chip[data-pick]', stage); moveTo(c[0], true); at(800, function () { moveTo(c[1], true); }); });
    at(7000, function () { var el = $('#dd-typed'), t = sc.txt, i = 0; (function ty() { if (i <= t.length) { el.textContent = t.slice(0, i); i += 2; at(28, ty); } })(); });
    at(8200, function () { rail(3, sc.isP); show(3); moveTo($('.dd-st[data-s="3"] .dd-go', stage), false); });
    at(10500, function () { idx = (idx + 1) % DM.length; play(); });
  }
  function setPause(p) {
    paused = p;
    $('#dd-pause').setAttribute('aria-label', p ? 'Reproduzir demonstração' : 'Pausar demonstração');
    $('#dd-pause-ic').innerHTML = p ? '<path d="M5 3l8 5-8 5z"/>' : '<path d="M5 3v10M11 3v10"/>';
    play();
  }
  $('#dd-pause').addEventListener('click', function () { setPause(!paused); });
  $('#dd-next').addEventListener('click', function () { idx = (idx + 1) % DM.length; play(); });
  $('#dd-prev').addEventListener('click', function () { idx = (idx - 1 + DM.length) % DM.length; play(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.isIntersecting; if (v !== visible) { visible = v; if (v) play(); else clear(); } }); }).observe(demo);
  document.addEventListener('visibilitychange', function () { if (document.hidden) clear(); else if (visible) play(); });
  if (RM) setPause(true); else play();
})();

/* Cortina: o conteúdo da chamada final sobe um pouco enquanto o painel de dúvidas sai de cima (parallax leve, só posição) */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var faq = document.getElementById('duvidas'), cta = document.getElementById('cta-final');
  if (!faq || !cta) return;
  var inner = cta.querySelector('.cta-final-content'), ticking = false;
  function frame() {
    ticking = false;
    var r = faq.getBoundingClientRect(), vh = window.innerHeight, h = cta.offsetHeight;
    var p = Math.min(1, Math.max(0, (vh - r.bottom) / h)); // 0 = coberta, 1 = revelada
    inner.style.transform = 'translate3d(0,' + Math.round((1 - p) * 60) + 'px,0)';
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame);
  frame();
})();
