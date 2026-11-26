/* COGIT — Black da Cogit: fase da oferta (antes | durante | depois) a partir de black-config.js.
 * Carregado no <head>, logo depois de black-config.js: marca <html data-black="..."> antes da
 * primeira pintura (o CSS mostra/esconde botão e combos sem piscar) e reavalia a cada segundo,
 * então a troca acontece sozinha na virada, sem deploy. Só visual: o valor cobrado é da plataforma.
 */
self.CogitBlack = (() => {
  'use strict';
  const C = self.COGIT_BLACK || null;
  const t = (iso) => new Date(iso).getTime();

  function agora() {
    try {
      const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
      const q = local ? new URLSearchParams(location.search).get('black_agora') : null;
      if (q && !isNaN(t(q))) return t(q);
    } catch (_) { /* fora do navegador */ }
    if (C && C.simularAgora && !isNaN(t(C.simularAgora))) return t(C.simularAgora);
    return Date.now();
  }

  // 'antes' (botão e página no ar, sem preço da Black) | 'durante' | 'depois' (ou desligada)
  function fase(ms) {
    if (!C || !C.ligada) return 'depois';
    const n = ms == null ? agora() : ms;
    if (n < t(C.inicio)) return 'antes';
    if (n < t(C.fim)) return 'durante';
    return 'depois';
  }
  const ativa = (ms) => fase(ms) === 'durante';
  const config = () => C;
  const precoModelo = (serviceId) => (C && C.modelos[serviceId]) || null;
  const combos = () => (C ? C.combos.slice() : []);
  // alvo do contador: início (antes) ou fim (durante)
  const alvo = () => { const f = fase(); return f === 'antes' ? t(C.inicio) : f === 'durante' ? t(C.fim) : null; };

  function marcar() {
    const f = fase();
    if (document.documentElement.getAttribute('data-black') !== f) {
      document.documentElement.setAttribute('data-black', f);
      try { document.dispatchEvent(new CustomEvent('cogit:black', { detail: { fase: f } })); } catch (_) {}
    }
    return f;
  }

  function contador() {
    const fim = alvo();
    const rest = fim == null ? 0 : Math.max(0, fim - agora());
    const s = Math.floor(rest / 1000);
    return { dias: Math.floor(s / 86400), horas: Math.floor(s % 86400 / 3600), minutos: Math.floor(s % 3600 / 60), segundos: s % 60 };
  }
  const dois = (n) => String(n).padStart(2, '0');

  // <div data-black-contador> com <b data-u="dias|horas|minutos|segundos">: atualizado a cada segundo
  function pintarContadores() {
    const c = contador();
    document.querySelectorAll('[data-black-contador]').forEach((el) => {
      el.querySelectorAll('[data-u]').forEach((b) => { b.textContent = dois(c[b.getAttribute('data-u')]); });
      const sr = el.querySelector('[data-black-contador-sr]');
      if (sr) sr.textContent = c.dias + ' dias, ' + c.horas + ' horas e ' + c.minutos + ' minutos';
    });
  }

  if (typeof document !== 'undefined' && document.documentElement) {
    marcar();
    setInterval(() => { marcar(); pintarContadores(); }, 1000);
    document.addEventListener('DOMContentLoaded', pintarContadores);
  }

  const brl = (n) => 'R$ ' + Number(n).toLocaleString('pt-BR');

  // ── Conteúdo com preço (home e /blackcogit), sempre a partir de black-config.js ──
  // Preço acessível: o leitor de tela lê "de R$ 500, por R$ 400"; o visual (riscado) fica aria-hidden.
  const MONTE = 'monte-sua-solucao.html';
  const linkCombo = (c) => MONTE + '?services=' + c.servicos.join(',') + (c.modelo ? '&amp;model=' + c.modelo : '');
  const linkModelo = (id) => MONTE + '?services=' + id + '&amp;model=modelos-prontos';
  const porTxt = (c) => (c.aPartirDe ? 'a partir de ' : '') + brl(c.por);
  function dePor(de, por, aPartirDe) {
    const p = (aPartirDe ? 'a partir de ' : '') + brl(por);
    return '<span class="sr-only">de ' + brl(de) + ', por ' + p + '</span><span aria-hidden="true"><s>' + brl(de) + '</s><b>' + (aPartirDe ? '<small>a partir de</small>' : '') + brl(por) + '</b></span>';
  }
  const pagamentoTxt = (c) => c.pagamento === 'imediato'
    ? 'Pagamento até 27/11 às 23h59.'
    : 'Preço garantido no pedido até 27/11; pagamento após a validação do escopo, até 04/12.';
  const economiaTxt = (c) => c.aPartirDe ? c.percentual + '% de desconto' : 'Economia de ' + brl(c.de - c.por) + ' (' + c.percentual + '%)';

  function htmlCombosHome() {
    return combos().map((c) => '<a class="hc-item" href="' + linkCombo(c) + '"><b>' + c.nome + (c.novo ? ' · Novo' : '') + '</b><span>' + c.descricao + ' ' + economiaTxt(c) + '.</span><em class="bk-preco"><span class="sr-only">de ' + brl(c.de) + ', por ' + porTxt(c) + '</span><span aria-hidden="true"><s>' + brl(c.de) + '</s> ' + porTxt(c) + '</span></em></a>').join('');
  }

  // preços de hoje (antes da Black): catálogo e combos de 10% do js/data.js, se carregado
  function hojeModelos() {
    return Object.keys(C.modelos).map((id) => ({ id, nome: C.modelos[id].nome, preco: C.modelos[id].de }));
  }
  function hojeCombos() {
    try {
      const svc = (id) => configuratorData.services.find((s) => s.id === id);
      return serviceBundles.map((b) => {
        const itens = b.services.map(svc);
        const base = itens.reduce((t, s) => t + Number(s.price), 0);
        return { nome: b.name, descricao: b.description, de: base, por: Math.floor(base * (100 - b.discount) / 100 / 10) * 10, aPartirDe: itens.some((s) => s.priceType === 'from'), percentual: b.discount, servicos: b.services, modelo: b.model };
      });
    } catch (_) { return []; }
  }

  function cardModelo(m, f) {
    const preco = f === 'durante'
      ? '<p class="bk-preco">' + dePor(m.de, m.por) + '</p><span class="bk-economia">' + Math.round((1 - m.por / m.de) * 100) + '% de desconto</span>'
      : '<p class="bk-preco"><span class="bk-economia">Preço de hoje</span><b>' + brl(m.de) + '</b></p>';
    return '<article class="bk-item"><h3>' + m.nome + '</h3>' + preco + '<a class="btn btn-primary" href="' + linkModelo(m.id) + '">Montar ' + m.nome + '</a></article>';
  }
  function cardCombo(c, destaque) {
    const preco = '<div class="bk-preco">' + dePor(c.de, c.por, c.aPartirDe) + '</div><span class="bk-economia">' + economiaTxt(c) + '</span>';
    const nota = '<p>' + pagamentoTxt(c) + '</p>';
    if (destaque) {
      return '<article class="bk-destaque"><div>' + (c.novo ? '<span class="bk-selo">Novo</span>' : '') + '<h3>' + c.nome + '</h3><p>' + c.descricao + '</p></div>'
        + '<div class="bk-destaque-preco">' + preco + nota + '<a class="btn btn-primary btn-lg" href="' + linkCombo(c) + '">Montar ' + c.nome + '</a></div></article>';
    }
    return '<article class="bk-item"><h3>' + c.nome + '</h3><p>' + c.descricao + '</p>' + preco + nota + '<a class="btn btn-primary" href="' + linkCombo(c) + '">Montar ' + c.nome + '</a></article>';
  }
  function cardHoje(c) {
    return '<article class="bk-item"><h3>' + c.nome + '</h3><p>' + c.descricao + '</p><p class="bk-preco"><span class="bk-economia">Preço de hoje · ' + c.percentual + '% de desconto</span><b>' + (c.aPartirDe ? '<small>a partir de</small>' : '') + brl(c.por) + '</b></p><a class="btn btn-primary" href="' + linkCombo(c) + '">Montar ' + c.nome + '</a></article>';
  }

  function renderizar() {
    if (!C || typeof document === 'undefined') return;
    const f = fase();
    const home = document.querySelector('[data-black-combos-home]');
    if (home && !home.childElementCount) home.innerHTML = htmlCombosHome();

    const titulo = document.querySelector('[data-bk-titulo]');
    const txt = f === 'depois' ? 'A Black da Cogit acabou. Obrigado!' : 'Black Friday da Cogit.';
    if (titulo && titulo.textContent.replace(/\s+/g, ' ').trim() !== txt) titulo.textContent = txt;
    const mods = document.querySelector('[data-bk-modelos]');
    if (mods) mods.innerHTML = f === 'durante'
      ? Object.keys(C.modelos).map((id) => cardModelo(Object.assign({ id }, C.modelos[id]), f)).join('')
      : hojeModelos().map((m) => cardModelo({ id: m.id, nome: m.nome, de: m.preco }, f)).join('');
    const cb = document.querySelector('[data-bk-combos]');
    if (cb) {
      if (f === 'durante') {
        const lista = combos();
        const d = lista.find((c) => c.destaque) || lista[0];
        cb.innerHTML = cardCombo(d, true) + '<div class="bk-outros">' + lista.filter((c) => c !== d).map((c) => cardCombo(c, false)).join('') + '</div>';
      } else {
        cb.innerHTML = '<div class="bk-outros">' + hojeCombos().map(cardHoje).join('') + '</div>';
      }
    }
    pintarContadores();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', renderizar);
    document.addEventListener('cogit:black', () => { if (document.readyState !== 'loading') renderizar(); });
  }

  return { agora, fase, ativa, config, precoModelo, combos, alvo, contador, marcar, brl, renderizar };
})();
