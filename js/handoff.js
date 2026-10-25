/* COGIT — leva a solução montada no site para a plataforma (app.cmkcogit.com.br).
 *
 * - Nenhum dado é enviado a servidor por aqui: a seleção vai no fragmento (#cfg=...) do link,
 *   que o navegador não envia em requisições. A plataforma guarda a seleção até o cliente entrar
 *   ou criar a conta, e o servidor dela recalcula o preço pelo catálogo (o valor exibido aqui
 *   nunca é usado para cobrar).
 * - Guarda neste navegador, por 7 dias, só a seleção do configurador (objetivos, soluções,
 *   complementos e etapa). Textos livres e dados pessoais não são guardados.
 */
window.CogitHandoff = (() => {
  'use strict';

  // Testando o site no computador (localhost)? Usa o app local (npm run dev no projeto do app).
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const APP_URL = LOCAL ? 'http://localhost:3000' : 'https://app.cmkcogit.com.br';

  const KEY_SESSAO = 'cogit_cfg_sessao_v1';
  const KEY_REF = 'cogit_cfg_ref_v1';
  const TTL = 7 * 24 * 60 * 60 * 1000;

  function base64url(texto) {
    const bytes = new TextEncoder().encode(texto);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function novoRef() {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Mesma seleção => mesmo ref (clicar de novo não cria solicitação duplicada na plataforma).
  function refPara(assinatura) {
    try {
      const salvo = JSON.parse(localStorage.getItem(KEY_REF));
      if (salvo && salvo.assinatura === assinatura && typeof salvo.ref === 'string' && salvo.expira > Date.now()) return salvo.ref;
    } catch (_) { /* armazenamento indisponível */ }
    const ref = novoRef();
    try { localStorage.setItem(KEY_REF, JSON.stringify({ assinatura, ref, expira: Date.now() + TTL })); } catch (_) {}
    return ref;
  }

  // cfg: { origem, objetivos, servicos: [{id, modelo, nome}], complementos: [{id, qtd, nome}], notas, diagnostico, estimativa }
  function montar(cfg) {
    const servicos = (cfg.servicos || []).map(s => ({ id: s.id, modelo: s.modelo || null, nome: s.nome || '' }));
    const complementos = (cfg.complementos || []).map(c => ({ id: c.id, qtd: c.qtd || 1, nome: c.nome || '' }));
    const assinatura = JSON.stringify([cfg.origem, servicos.map(s => s.id + ':' + s.modelo), complementos.map(c => c.id + ':' + c.qtd)]);
    return {
      v: 1,
      ref: refPara(assinatura),
      origem: cfg.origem === 'diagnostico' ? 'diagnostico' : 'configurador',
      objetivos: (cfg.objetivos || []).slice(0, 8),
      servicos,
      complementos,
      notas: String(cfg.notas || '').slice(0, 2000),
      diagnostico: cfg.diagnostico || null,
      estimativa: cfg.estimativa || ''
    };
  }

  function link(cfg) {
    return APP_URL + '/continuar.html#cfg=' + base64url(JSON.stringify(montar(cfg)));
  }

  function irParaPlataforma(cfg) {
    window.location.href = link(cfg);
  }

  function salvarSessao(snapshot) {
    try {
      const agora = Date.now();
      localStorage.setItem(KEY_SESSAO, JSON.stringify(Object.assign({ v: 1, expira: agora + TTL }, snapshot)));
    } catch (_) { /* segue sem salvar */ }
  }

  function lerSessao() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY_SESSAO));
      if (s && s.v === 1 && s.expira > Date.now()) return s;
    } catch (_) { /* inválido */ }
    limparSessao();
    return null;
  }

  function limparSessao() {
    try { localStorage.removeItem(KEY_SESSAO); } catch (_) {}
  }

  return { appUrl: APP_URL, montar, link, irParaPlataforma, salvarSessao, lerSessao, limparSessao };
})();
