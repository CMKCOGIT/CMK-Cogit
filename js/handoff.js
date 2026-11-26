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
    // variante: qual modelo pronto foi escolhido quando o serviço tem níveis (ex.: landing-page-basica).
    const servicos = (cfg.servicos || []).map(s => {
      const item = { id: s.id, modelo: s.modelo || null, plano: s.plano || null, nome: s.nome || '' };
      if (s.variante && s.modelo === 'modelos-prontos') item.variante = s.variante;
      return item;
    });
    const complementos = (cfg.complementos || []).map(c => ({ id: c.id, qtd: c.qtd || 1, nome: c.nome || '' }));
    // Com site personalizado no editor, cada envio é uma solicitação nova (ref próprio).
    const assinatura = JSON.stringify([cfg.origem, servicos.map(s => s.id + ':' + s.modelo + ':' + s.plano + ':' + (s.variante || '')), complementos.map(c => c.id + ':' + c.qtd), cfg.personalizacao ? novoRef() : '']);
    return {
      v: 1,
      ...(cfg.personalizacao ? { personalizacao: true } : {}),
      ref: refPara(assinatura),
      origem: cfg.origem === 'diagnostico' ? 'diagnostico' : 'configurador',
      objetivos: (cfg.objetivos || []).slice(0, 8),
      servicos,
      complementos,
      notas: String(cfg.notas || '').slice(0, 2000),
      diagnostico: cfg.diagnostico || null,
      estimativa: cfg.estimativa || '',
      // Black da Cogit: só a marca (o servidor confere a data e calcula o preço)
      ...(cfg.promo === 'black-2026' ? { promo: 'black-2026' } : {})
    };
  }

  // ?volta= diz à plataforma para qual página do site o botão "Voltar para o site" leva
  function volta() {
    // do site em inglês (/en/), a plataforma abre em inglês
    const lang = typeof document !== 'undefined' && document.documentElement && document.documentElement.lang === 'en' ? '&lang=en' : '';
    try { return /^https?:$/.test(window.location.protocol) ? '?volta=' + encodeURIComponent(window.location.href) + lang : ''; } catch (_) { return ''; }
  }

  function link(cfg) {
    return APP_URL + '/continuar.html' + volta() + '#cfg=' + base64url(JSON.stringify(montar(cfg)));
  }

  function irParaPlataforma(cfg) {
    window.location.href = link(cfg);
  }

  // Envia a solução + o site personalizado no editor do modelo. A plataforma abre em uma aba
  // nova (esta página precisa continuar aberta para entregar os dados por postMessage).
  // aoMudar(estado, mensagem): 'enviando' | 'recebido' | 'erro'.
  function enviarComPersonalizacao(cfg, dados, aoMudar) {
    const payload = montar(Object.assign({}, cfg, { personalizacao: true }));
    const origemApp = new URL(APP_URL).origin;
    const url = APP_URL + '/continuar.html' + volta() + '#cfg=' + base64url(JSON.stringify(payload));
    const aba = window.open(url, '_blank');
    if (!aba) { aoMudar('erro', 'O navegador bloqueou a nova aba. Permita pop-ups para este site e clique de novo.'); return; }
    aoMudar('enviando', 'Abrindo a plataforma e enviando o seu site...');
    const fim = () => { clearTimeout(prazo); window.removeEventListener('message', aoReceber); };
    const prazo = setTimeout(() => { fim(); aoMudar('erro', 'Não conseguimos falar com a plataforma. Verifique se a nova aba abriu e clique de novo.'); }, 30000);
    function aoReceber(e) {
      const m = e.data;
      if (e.origin !== origemApp || e.source !== aba || !m || m.ref !== payload.ref) return;
      if (m.type === 'cmk:personalizacao:pronto') aba.postMessage({ type: 'cmk:personalizacao', ref: payload.ref, dados }, origemApp);
      else if (m.type === 'cmk:personalizacao:recebida') { fim(); aoMudar('recebido', 'Enviado! Continue na aba da plataforma: entre ou crie sua conta para concluir.'); }
      else if (m.type === 'cmk:personalizacao:erro') { fim(); aoMudar('erro', 'A plataforma não aceitou o envio. Tente de novo ou fale com a gente pelo WhatsApp.'); }
    }
    window.addEventListener('message', aoReceber);
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

  return { appUrl: APP_URL, montar, link, irParaPlataforma, enviarComPersonalizacao, salvarSessao, lerSessao, limparSessao };
})();
