/* COGIT — app instalável (PWA).
   · Registra o service worker (/sw.js).
   · Android, Chrome e desktop: guarda o evento beforeinstallprompt e mostra um aviso discreto "Instalar app".
   · iPhone e iPad: o Safari não tem esse evento; o aviso explica Compartilhar → "Adicionar à Tela de Início".
   · Não aparece com o app já instalado (display-mode: standalone) nem por 14 dias depois de dispensado.
   · Espera o aviso de cookies sair da tela para não empilhar dois cartões no rodapé.
   · No app instalado: seletor Celular | Computador. "Celular" num monitor abre /celular.html (o site numa
     coluna de celular); "Computador" num celular troca a viewport para 1280 px. A escolha fica em
     localStorage (cogit_modo) e é aplicada logo no <head> pelo trecho <script data-cogit-modo>
     (tools/build-pwa.mjs), antes de desenhar a página. */
(function () {
  'use strict';
  var script = document.currentScript;
  var root = script ? new URL('../', script.src) : new URL('/', location.href);
  var KEY = 'cogit_pwa_dispensado';
  var PAUSA = 14 * 24 * 60 * 60 * 1000;
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var T = EN ? {
    region: 'Install the app',
    title: 'Install the COGIT app',
    text: 'Full screen, straight from your home screen. No app store.',
    install: 'Install app',
    later: 'Not now',
    close: 'Close',
    iosTitle: 'Add COGIT to your home screen',
    iosText: 'Tap <b>Share</b> <svg class="pwa-install-share" viewBox="0 0 20 24" aria-hidden="true"><path d="M10 15V2M5.5 6.5 10 2l4.5 4.5M6.5 10H3v12h14V10h-3.5"/></svg> and then <b>Add to Home Screen</b>.',
    ok: 'Got it'
  } : {
    region: 'Instalar o app',
    title: 'Instale o app da COGIT',
    text: 'Tela cheia, direto da tela inicial. Sem loja de aplicativos.',
    install: 'Instalar app',
    later: 'Agora não',
    close: 'Fechar',
    iosTitle: 'Coloque a COGIT na tela inicial',
    iosText: 'Toque em <b>Compartilhar</b> <svg class="pwa-install-share" viewBox="0 0 20 24" aria-hidden="true"><path d="M10 15V2M5.5 6.5 10 2l4.5 4.5M6.5 10H3v12h14V10h-3.5"/></svg> e depois em <b>Adicionar à Tela de Início</b>.',
    ok: 'Entendi'
  };

  // ── Service worker ──
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(new URL('sw.js', root).href, { scope: root.pathname }).then(function (reg) {
        // procura versão nova sempre que a pessoa volta ao app aberto em segundo plano
        document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') reg.update().catch(function () {}); });
      }).catch(function () {});
    });
  }

  // ── Aviso de instalação ──
  function instalado() {
    return (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
  }
  function dispensadoRecente() {
    try { var t = +localStorage.getItem(KEY); return t > 0 && Date.now() - t < PAUSA; } catch (_) { return false; }
  }
  function lembrarDispensa() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (_) { /* armazenamento bloqueado: some só nesta página */ }
  }
  function track(nome) { if (typeof window.trackEvent === 'function') window.trackEvent(nome, { event_category: 'pwa' }); }

  var ua = navigator.userAgent || '';
  var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // navegadores embutidos (Instagram, Facebook, LinkedIn...) não oferecem "Adicionar à Tela de Início"
  var embutido = /FBAN|FBAV|Instagram|LinkedInApp|Line\//.test(ua);
  var pedido = null;   // evento beforeinstallprompt guardado
  var cartao = null;
  var fechado = false;

  // ── Versão do site no app: Celular | Computador ──
  var MODO = 'cogit_modo';
  var noFrame = false;
  try { noFrame = window.top !== window.self && window.top.location.pathname === '/celular.html'; } catch (_) { noFrame = false; }
  var M = EN ? { grupo: 'Site version', cel: 'Mobile', pc: 'Desktop' } : { grupo: 'Versão do site', cel: 'Celular', pc: 'Computador' };
  var ICONE_CEL = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></svg>';
  var ICONE_PC = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="2.5" y="4" width="19" height="12.5" rx="1.5"/><path d="M8.5 20.5h7M12 16.5v4"/></svg>';

  function modoApp() { return noFrame || instalado(); }
  function telaPequena(w) {
    w = w || window;
    var a = w.screen.width, b = w.screen.height;
    return Math.min(a, b) <= 820 && !!(w.matchMedia && w.matchMedia('(pointer: coarse)').matches);
  }
  function caminho() { return location.pathname + location.search + location.hash; }
  function modoAtual() { return noFrame || window.innerWidth < 1024 ? 'celular' : 'computador'; }
  function escolherModo(m) {
    var topo = window.top;
    try { topo.localStorage.setItem(MODO, m); } catch (_) { /* sem armazenamento: vale só agora */ }
    track(m === 'celular' ? 'pwa_mode_mobile' : 'pwa_mode_desktop');
    if (m === 'celular') {
      // celular de verdade: basta recarregar (o <head> volta a viewport para a largura do aparelho)
      var forcado = telaPequena(topo) && topo.innerWidth > Math.max(topo.screen.width, topo.screen.height) + 20;
      // (modo-pc: a largura de 1280 px veio do próprio modo Computador, não do navegador)
      if (telaPequena(topo) && (!forcado || topo.document.documentElement.classList.contains('modo-pc'))) { topo.location.reload(); return; }
      topo.location.replace('/celular.html?u=' + encodeURIComponent(caminho()));
    } else {
      if (noFrame) topo.location.replace(caminho()); else topo.location.reload();
    }
  }
  function seletor(extra) {
    var atual = modoAtual();
    var el = document.createElement('div');
    el.className = 'pwa-modo' + (extra ? ' ' + extra : '');
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', M.grupo);
    el.setAttribute('translate', 'no');
    el.innerHTML = [['celular', ICONE_CEL, M.cel], ['computador', ICONE_PC, M.pc]].map(function (o) {
      return '<button type="button" data-modo="' + o[0] + '" aria-pressed="' + (atual === o[0]) + '">' + o[1] + '<span>' + o[2] + '</span></button>';
    }).join('');
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-modo]');
      if (b && b.getAttribute('aria-pressed') !== 'true') escolherModo(b.getAttribute('data-modo'));
    });
    return el;
  }
  function montarSeletor() {
    if (!modoApp()) return;
    var rodape = document.querySelector('.mobile-menu-footer');
    if (rodape && !rodape.querySelector('.pwa-modo')) rodape.insertBefore(seletor('pwa-modo--menu'), rodape.firstChild);
    // telas largas (sem o botão Menu): seletor fixo no canto; dentro de /celular.html quem mostra é a barra de cima
    if (!noFrame && !document.querySelector('.pwa-modo--flutuante')) document.body.appendChild(seletor('pwa-modo--flutuante'));
  }
  if (noFrame) {
    document.documentElement.classList.add('em-celular-html');
    // links para outros sites (plataforma, WhatsApp, e-mail) saem da coluna e abrem na janela do app
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank') return;
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin) a.target = '_top';
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montarSeletor); else montarSeletor();

  if (instalado()) return;

  function esconder(lembrar) {
    if (lembrar) lembrarDispensa();
    fechado = true;
    if (!cartao) return;
    var el = cartao; cartao = null;
    el.classList.remove('is-visible');
    setTimeout(function () { el.remove(); }, 260);
  }

  function montar(modo) {
    if (cartao || fechado || instalado() || dispensadoRecente()) return;
    if (document.getElementById('cookie-banner')) return; // volta quando a escolha de cookies for feita
    var el = document.createElement('div');
    el.className = 'pwa-install pwa-install--' + modo;
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', T.region);
    el.setAttribute('translate', 'no');
    var icone = '<img class="pwa-install-icon" src="' + new URL('assets/images/icon-192.png', root).href + '" alt="" width="44" height="44">';
    var fechar = '<button type="button" class="pwa-install-close" data-pwa="fechar" aria-label="' + T.close + '"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
    if (modo === 'ios') {
      el.innerHTML = icone + '<div class="pwa-install-body"><p class="pwa-install-title">' + T.iosTitle + '</p><p class="pwa-install-text">' + T.iosText + '</p>' +
        '<div class="pwa-install-actions"><button type="button" class="btn btn-primary btn-sm" data-pwa="fechar">' + T.ok + '</button></div></div>' + fechar;
    } else {
      el.innerHTML = icone + '<div class="pwa-install-body"><p class="pwa-install-title">' + T.title + '</p><p class="pwa-install-text">' + T.text + '</p>' +
        '<div class="pwa-install-actions"><button type="button" class="btn btn-primary btn-sm" data-pwa="instalar">' + T.install + '</button>' +
        '<button type="button" class="pwa-install-later" data-pwa="fechar">' + T.later + '</button></div></div>' + fechar;
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pwa]');
      if (!b) return;
      if (b.getAttribute('data-pwa') === 'fechar') { esconder(true); return; }
      if (!pedido) { esconder(false); return; }
      var p = pedido; pedido = null;
      track('pwa_install_click');
      p.prompt();
      (p.userChoice || Promise.resolve({})).then(function (r) {
        if (r && r.outcome === 'dismissed') esconder(true); else esconder(false);
      }, function () { esconder(false); });
    });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') esconder(true); });
    document.body.appendChild(el);
    cartao = el;
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (cartao === el) el.classList.add('is-visible'); }); });
  }

  var modoPendente = null;
  function agendar(modo) {
    modoPendente = modo;
    setTimeout(function () { montar(modo); }, 2500);
  }
  window.addEventListener('cogit:consent-change', function () {
    if (modoPendente) setTimeout(function () { montar(modoPendente); }, 800);
  });

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();          // segura o aviso nativo; o nosso aparece no lugar
    pedido = e;
    if (!dispensadoRecente()) agendar('prompt');
  });
  window.addEventListener('appinstalled', function () {
    pedido = null;
    track('pwa_installed');
    esconder(false);
  });

  if (ios && !embutido && !dispensadoRecente()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { agendar('ios'); });
    else agendar('ios');
  }
})();
