// home.js — números e frentes da página inicial a partir do catálogo (js/data.js).
// Os preços NÃO ficam no HTML: o catálogo é a única fonte (ver docs/AUDITORIA-2026-10.md).
(function () {
  'use strict';
  if (typeof servicesData === 'undefined' || typeof solutionsGroupsData === 'undefined') return;

  const brl = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const porId = new Map(servicesData.map((s) => [s.id, s]));

  // Números: soluções e frentes do catálogo, menor investimento inicial
  const precos = servicesData.map((s) => Number(s.basePrice)).filter((v) => v > 0);
  const numeros = { solucoes: servicesData.length, frentes: solutionsGroupsData.length, minimo: Math.min(...precos) };
  document.querySelectorAll('[data-numero]').forEach((el) => {
    const v = numeros[el.dataset.numero];
    if (!Number.isFinite(v)) return;
    el.dataset.counter = String(v);
    el.textContent = el.dataset.numero === 'minimo' ? brl(v) : String(v);
  });

  // Explicação do menor investimento: diz qual serviço é e onde começam os sites
  const maisBarato = servicesData.find((s) => Number(s.basePrice) === numeros.minimo);
  const modelo = porId.get('modelos-prontos');
  const explica = document.querySelector('[data-numero-explica="minimo"]');
  if (explica && maisBarato) {
    explica.textContent = 'Valor inicial do serviço “' + maisBarato.title + '”, o ponto de partida mais acessível.' +
      (modelo && modelo.id !== maisBarato.id ? ' Sites com modelo pronto começam em R$ ' + brl(modelo.basePrice) + '.' : '');
  }

  // Balões "o que significa" dos números: abre no clique/toque, fecha com Esc ou clique fora
  const botoesInfo = [...document.querySelectorAll('.home-numero-info')];
  const fechar = (botao, devolverFoco) => {
    botao.setAttribute('aria-expanded', 'false');
    document.getElementById(botao.getAttribute('aria-controls')).hidden = true;
    if (devolverFoco) botao.focus();
  };
  botoesInfo.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      e.stopPropagation();
      const abrir = botao.getAttribute('aria-expanded') !== 'true';
      botoesInfo.forEach((b) => fechar(b, false));
      if (!abrir) return;
      botao.setAttribute('aria-expanded', 'true');
      document.getElementById(botao.getAttribute('aria-controls')).hidden = false;
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.home-numero-balao')) botoesInfo.forEach((b) => fechar(b, false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const aberto = botoesInfo.find((b) => b.getAttribute('aria-expanded') === 'true');
    if (aberto) fechar(aberto, true);
  });

  // Frentes: serviços do grupo e o "a partir de" (menor preço do grupo)
  document.querySelectorAll('[data-frente]').forEach((card) => {
    const grupo = solutionsGroupsData.find((g) => g.id === card.dataset.frente);
    if (!grupo) return;
    const servicos = grupo.services.map((id) => porId.get(id)).filter(Boolean);
    const lista = card.querySelector('[data-servicos]');
    lista.innerHTML = '';
    servicos.forEach((s) => {
      const li = document.createElement('li');
      li.textContent = s.title;
      lista.appendChild(li);
    });
    const minimo = Math.min(...servicos.map((s) => Number(s.basePrice)).filter((v) => v > 0));
    const alvo = card.querySelector('[data-a-partir]');
    if (Number.isFinite(minimo)) alvo.innerHTML = 'A partir de <strong>R$ ' + brl(minimo) + '</strong>';
  });
})();
