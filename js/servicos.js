/* Catálogo "Serviços e valores" (solucoes/index.html): cada tipo abre um painel preso ao próprio card.
   Um painel aberto por card. Sem JavaScript, todos os painéis ficam visíveis. */
(function () {
  'use strict';
  var root = document.querySelector('[data-svc]');
  if (!root) return;
  var buttons = root.querySelectorAll('.svc-type');
  function panelOf(btn) { return document.getElementById(btn.getAttribute('aria-controls')); }
  function set(btn, open) {
    var panel = panelOf(btn);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('is-open', open);
    if (!panel) return;
    panel.classList.toggle('is-open', open);
    if (open) panel.removeAttribute('inert'); else panel.setAttribute('inert', '');
  }
  Array.prototype.forEach.call(buttons, function (btn) {
    set(btn, false);
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      var card = btn.closest('.svc-cat');
      Array.prototype.forEach.call(card.querySelectorAll('.svc-type[aria-expanded="true"]'), function (other) { if (other !== btn) set(other, false); });
      set(btn, open);
      if (open && window.trackEvent) window.trackEvent('servicos_tipo', btn.getAttribute('aria-controls'));
    });
  });
  root.classList.add('is-ready');
})();
