/* COGIT — preenche os preços dos planos do modelo pronto ([data-plano-preco="mensal|anual"])
 * a partir do catálogo (js/data.js: readyModelPlans), para o valor nunca ficar desatualizado no HTML. */
(function () {
  'use strict';
  if (typeof readyModelPlans === 'undefined') return;
  const brl = (v) => 'R$ ' + Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  document.querySelectorAll('[data-plano-preco]').forEach((el) => {
    const plano = readyModelPlans.find((p) => p.id === el.dataset.planoPreco);
    if (plano && plano.price != null) el.textContent = brl(plano.price);
  });
})();
