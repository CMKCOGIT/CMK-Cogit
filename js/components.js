/* ============================================
   COGIT — Dynamic Component Rendering
   Renders data-driven sections from data.js
   ============================================ */

// Caminho até a raiz do site a partir da página atual (subpastas solucoes/, projetos/ e en/)
function cogitRoot() {
  return /\/(solucoes|projetos|en)\//.test(location.pathname) ? '../' : '';
}

function getIcon(name) {
  return ICONS[name] || '';
}

// ── Mobile Modal Scroll Isolation & Touch Helpers ──
let modalScrollLockDepth = 0;
let modalScrollPrevY = 0;

function lockModalScroll() {
  if (modalScrollLockDepth === 0) {
    modalScrollPrevY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.top = `-${modalScrollPrevY}px`;
  }
  modalScrollLockDepth++;
}

function unlockModalScroll() {
  modalScrollLockDepth = Math.max(0, modalScrollLockDepth - 1);
  if (modalScrollLockDepth === 0) {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, modalScrollPrevY);
  }
}

function attachTapHandler(element, onSelect) {
  if (!element) return;
  let startX = 0;
  let startY = 0;
  let hasMoved = false;

  const onDown = (e) => {
    const pt = e.touches ? e.touches[0] : e;
    startX = pt.clientX;
    startY = pt.clientY;
    hasMoved = false;
  };

  const onMove = (e) => {
    if (!hasMoved) {
      const pt = e.touches ? e.touches[0] : e;
      const diffX = Math.abs(pt.clientX - startX);
      const diffY = Math.abs(pt.clientY - startY);
      if (diffX > 7 || diffY > 7) {
        hasMoved = true;
      }
    }
  };

  const onCancel = () => {
    hasMoved = true;
  };

  element.addEventListener('pointerdown', onDown, { passive: true });
  element.addEventListener('pointermove', onMove, { passive: true });
  element.addEventListener('pointercancel', onCancel, { passive: true });
  element.addEventListener('touchstart', onDown, { passive: true });
  element.addEventListener('touchmove', onMove, { passive: true });
  element.addEventListener('touchcancel', onCancel, { passive: true });

  element.addEventListener('click', (e) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onSelect(e);
  });
}


// ── Render Challenge Grid ──
function renderChallenge() {
  const container = document.getElementById('challenge-grid');
  if (!container || typeof challengeData === 'undefined' || !challengeData.length) return;

  container.innerHTML = challengeData.map((item, i) => `
    <a href="${item.ctaLink}" class="challenge-card reveal reveal-delay-${i + 1}" id="challenge-${item.id}">
      <div class="challenge-card-icon">${getIcon(item.icon)}</div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="challenge-card-tags">
        ${item.tags.map(t => `<span>${t}</span>`).join('')}
      </div>
      <span class="challenge-card-cta">${item.cta}</span>
    </a>
  `).join('');
}

// ── Rota da página "Monte sua solução" ──
// A página e a janela da tela inicial usam o MESMO fluxo (diagnóstico, abaixo): todos os serviços
// do catálogo têm um card na primeira etapa. Um link com vários serviços (combinações da página
// Soluções) abre com o serviço principal escolhido e os demais já marcados em "Complementos".
// O configurador antigo (configurator.js) só aparece para um serviço que o fluxo não conhece.
const DX_IDS_DO_CATALOGO = {
  'landing-page': 'landing-page', 'portfolio': 'portfolio', 'site-institucional': 'site-institucional', 'loja-virtual': 'loja-svc',
  'automacao': 'automacao-svc', 'integracao': 'integracao-svc', 'sistema': 'sistema-svc', 'mvp': 'mvp-svc', 'plataforma': 'plataforma-svc',
  'identidade-essencial': 'identidade-svc', 'manutencao': 'suporte-essencial-svc', 'suporte': 'suporte-continuo-svc', 'diagnostico': 'outro-svc'
};
// Em uma combinação, o principal é o primeiro que não é complemento típico (identidade, suporte).
const DX_COMPLEMENTOS_TIPICOS = ['identidade-essencial', 'manutencao', 'suporte', 'integracao', 'automacao'];
function rotaMonteSuaSolucao() {
  const params = new URLSearchParams(window.location.search);
  const servicos = [...new Set((params.get('services') || '').split(',').map(s => s.trim()).filter(Boolean))];
  if (params.get('problem') && !servicos.length) return { tipo: 'configurador' };
  if (servicos.some(id => !DX_IDS_DO_CATALOGO[id])) return { tipo: 'configurador' };
  const model = params.get('model');
  const principal = servicos.find(id => !DX_COMPLEMENTOS_TIPICOS.includes(id)) || servicos[0] || null;
  return {
    tipo: 'diagnostico',
    servico: principal ? DX_IDS_DO_CATALOGO[principal] : null,
    complementos: servicos.filter(id => id !== principal && id !== 'diagnostico'),
    modelo: ['modelos-prontos', 'sob-medida'].includes(model) ? model : null,
    variante: params.get('variant') || null
  };
}
window.rotaMonteSuaSolucao = rotaMonteSuaSolucao;

// ── Render Hero Interactive — COGIT Diagnostic (Configurador: Grid de Serviços + Objetivo + Contexto + Resultado) ──
function renderHeroInteractive() {
  const container = document.getElementById('hero-interactive-container');
  if (!container) return;
  // Na página "Monte sua solução", o diagnóstico só aparece quando a rota é dele.
  const naPagina = container.hasAttribute('data-dx-page');
  const rota = naPagina ? rotaMonteSuaSolucao() : null;
  if (naPagina && rota.tipo !== 'diagnostico') { container.closest('[data-dx-page-wrap]')?.setAttribute('hidden', ''); return; }

  // ── Desafios de negócio ──
  const CHALLENGES = [
    {
      id: 'presenca', title: 'Presença digital', phrase: 'Fortalecer marca e gerar novas oportunidades.',
      iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="15" rx="2.5"/><line x1="2" y1="8" x2="22" y2="8"/><circle cx="5.5" cy="5.5" r="0.75" fill="currentColor"/><circle cx="8" cy="5.5" r="0.75" fill="currentColor"/><path d="M8 21h8"/><path d="M12 18v3"/></svg>'
    },
    {
      id: 'automacao', title: 'Automação', phrase: 'Eliminar tarefas manuais e melhorar processos.',
      iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><circle cx="6" cy="18" r="2"/><path d="M9 6h5a2 2 0 0 1 2 2v7"/><path d="M6 9v7"/><polyline points="13 13 16 16 13 19"/></svg>'
    },
    {
      id: 'sistema', title: 'Sistema', phrase: 'Criar uma solução para uma operação específica.',
      iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M7 11v2"/><path d="M17 11v2"/><path d="M11 7h2"/><path d="M11 17h2"/></svg>'
    },
    {
      id: 'produto', title: 'Produto digital', phrase: 'Transformar uma ideia em plataforma escalável.',
      iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></svg>'
    },
    {
      id: 'outro', title: 'Outro desafio', phrase: 'Encontrar o melhor caminho tecnológico.',
      iconSvg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>'
    }
  ];

  // ── Grid de Serviços com ícone + descrição + preço (Etapa 1) ──
  const SERVICES_GRID = [
    {
      id: 'site-institucional', name: 'Site Institucional', desc: 'Apresente sua empresa e gere confiança.', priceLabel: 'A partir de R$ 700', challenge: 'presenca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'
    },
    {
      id: 'landing-page', name: 'Landing Page', desc: 'Transforme campanhas em contatos e vendas.', priceLabel: 'A partir de R$ 600', challenge: 'presenca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 13l3 3 5-5"/></svg>'
    },
    {
      id: 'portfolio', name: 'Portfólio', desc: 'Mostre trabalhos, serviços e resultados.', priceLabel: 'A partir de R$ 500', challenge: 'presenca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 13l3 3 5-5"/></svg>'
    },
    {
      id: 'automacao-svc', name: 'Automação', desc: 'Elimine tarefas repetitivas e conecte ferramentas.', priceLabel: 'A partir de R$ 890', challenge: 'automacao',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/><path d="M7 12h3M14 12h3M12 7v3M12 14v3"/></svg>'
    },
    {
      id: 'sistema-svc', name: 'Sistema de gestão', desc: 'Organize sua operação em um software próprio.', priceLabel: 'A partir de R$ 2.990', challenge: 'sistema',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M10 6h4M10 17h4M6 10v4M17 10v4"/></svg>'
    },
    {
      id: 'saas-svc', name: 'Produto digital (SaaS)', desc: 'Crie um produto digital por assinatura.', priceLabel: 'A partir de R$ 4.990', challenge: 'produto',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
    },
    {
      id: 'mvp-svc', name: 'MVP', desc: 'Valide sua ideia com uma primeira versão funcional.', priceLabel: 'A partir de R$ 3.990', challenge: 'produto',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'
    },
    {
      id: 'plataforma-svc', name: 'Plataforma', desc: 'Conecte usuários, serviços e oportunidades.', priceLabel: 'A partir de R$ 4.990', challenge: 'produto',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>'
    },
    {
      id: 'loja-svc', name: 'Loja virtual', desc: 'Venda on-line com catálogo, carrinho e pagamentos.', priceLabel: 'A partir de R$ 6.000', challenge: 'presenca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
    },
    {
      id: 'identidade-svc', name: 'Identidade Visual Essencial', desc: 'Logo, cores e tipografia para a sua marca.', priceLabel: 'R$ 500', challenge: 'marca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.7 1.7-1.7H16c3.1 0 5.6-2.5 5.6-5.6C21.9 6.2 17.5 2 12 2z"/></svg>'
    },
    {
      id: 'consultoria-svc', name: 'Consultoria e planejamento', desc: 'Mapeamos negócio, processos e prioridades antes de construir.', priceLabel: 'Sem custo fechando com a COGIT', challenge: 'outro',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>'
    },
    {
      id: 'integracao-svc', name: 'Integrações', desc: 'Conecte pagamentos, WhatsApp e os sistemas que você já usa.', priceLabel: 'A partir de R$ 990', challenge: 'automacao',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
    },
    {
      id: 'suporte-essencial-svc', name: 'Suporte Técnico Essencial', desc: 'Correções e ajustes quando precisar, sem mensalidade.', priceLabel: 'A partir de R$ 150 por solicitação', challenge: 'suporte',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
    },
    {
      id: 'suporte-continuo-svc', name: 'Suporte Técnico Contínuo', desc: 'Manutenção, ajustes e acompanhamento todo mês.', priceLabel: 'R$ 150/mês · 1º mês grátis', challenge: 'suporte',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>'
    },
    {
      id: 'outro-svc', name: 'Não sei ainda', desc: 'Receba orientação para encontrar o melhor começo.', priceLabel: 'Diagnóstico inicial gratuito', challenge: 'outro',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M14 14h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M10 7h4M10 17h4M7 10v4M17 10v4"/></svg>'
    }
  ];

  // ── Objetivos dinâmicos por serviço selecionado (Etapa 2) ──
  const OBJECTIVES_BY_SERVICE = {
    'mvp-svc': [
      { id: 'tirar-papel', label: 'Tirar minha ideia do papel', desc: 'Primeira versão real, no menor prazo e investimento possíveis.' },
      { id: 'mvp-funcional', label: 'Criar um MVP funcional', desc: 'As funções principais prontas para usuários de verdade.' },
      { id: 'validar-conceito', label: 'Validar meu conceito', desc: 'Testar a aceitação do público antes de investir mais.' },
      { id: 'testar-solucao', label: 'Testar uma nova solução', desc: 'Medir uso, retenção e viabilidade de uma nova frente.' }
    ],
    'saas-svc': [
      { id: 'plataforma-escalavel', label: 'Criar uma plataforma escalável', desc: 'Estrutura em nuvem pronta para crescer com os clientes.' },
      { id: 'ideia-em-produto', label: 'Transformar minha ideia em produto', desc: 'Do painel de gestão à experiência de quem assina.' },
      { id: 'sistema-assinatura', label: 'Criar um sistema por assinatura', desc: 'Planos, cobrança recorrente e liberação de acesso.' },
      { id: 'validar-modelo', label: 'Validar modelo de negócio', desc: 'Uma versão beta para testar preço e retenção.' }
    ],
    'plataforma-svc': [
      { id: 'plataforma-escalavel', label: 'Criar uma plataforma escalável', desc: 'Vários perfis de usuário com bom desempenho.' },
      { id: 'ideia-em-produto', label: 'Transformar minha ideia em produto', desc: 'Regras de negócio próprias com uso simples.' },
      { id: 'sistema-assinatura', label: 'Criar um sistema por assinatura', desc: 'Módulos, permissões e cobrança por perfil.' },
      { id: 'validar-modelo', label: 'Validar modelo de negócio', desc: 'Lançamento piloto, controlado, para aprender rápido.' }
    ],
    'automacao-svc': [
      { id: 'automatizar-processos', label: 'Automatizar processos internos', desc: 'Rotinas da equipe rodando sozinhas, sem retrabalho.' },
      { id: 'reduzir-tarefas', label: 'Reduzir tarefas manuais', desc: 'Menos digitação e cópia entre planilhas e sistemas.' },
      { id: 'integrar-ferramentas', label: 'Integrar ferramentas existentes', desc: 'Fazer as ferramentas que você já usa conversarem.' },
      { id: 'fluxos-inteligentes', label: 'Criar fluxos inteligentes', desc: 'Alertas, mensagens e relatórios automáticos.' }
    ],
    'integracao-svc': [
      { id: 'integrar-pagamentos', label: 'Receber pagamentos on-line', desc: 'Pix, cartão e boleto ligados ao seu site ou sistema.' },
      { id: 'integrar-whatsapp', label: 'Conectar o WhatsApp', desc: 'Mensagens e avisos automáticos para os clientes.' },
      { id: 'integrar-sistemas', label: 'Conectar sistemas que já uso', desc: 'ERP, CRM, planilhas e APIs trocando dados.' },
      { id: 'sincronizar-dados', label: 'Acabar com dados duplicados', desc: 'Uma informação cadastrada uma vez vale para todos.' }
    ],
    'sistema-svc': [
      { id: 'sistema-personalizado', label: 'Criar um sistema personalizado', desc: 'Software feito para as regras do seu negócio.' },
      { id: 'melhorar-operacao', label: 'Melhorar minha operação', desc: 'Demandas, prazos e histórico organizados em um lugar.' },
      { id: 'centralizar-informacoes', label: 'Centralizar informações', desc: 'Painel com dados que hoje estão espalhados.' },
      { id: 'digitalizar-processos', label: 'Digitalizar processos', desc: 'Trocar planilhas e papel por uma aplicação segura.' }
    ],
    'loja-svc': [
      { id: 'comecar-vender', label: 'Começar a vender on-line', desc: 'Primeira loja com catálogo, carrinho e pagamento.' },
      { id: 'loja-fisica-digital', label: 'Levar minha loja física para a internet', desc: 'Os mesmos produtos, agora com venda 24 horas.' },
      { id: 'sair-marketplace', label: 'Ter canal próprio além do marketplace', desc: 'Menos taxa e mais relação direta com o cliente.' },
      { id: 'organizar-pedidos', label: 'Organizar pedidos e estoque', desc: 'Pedidos, estoque e entregas acompanhados em um painel.' }
    ],
    'identidade-svc': [
      { id: 'criar-marca', label: 'Criar minha primeira marca', desc: 'Logo, cores e tipografia para começar com identidade.' },
      { id: 'renovar-marca', label: 'Renovar uma marca que já existe', desc: 'Modernizar sem perder o que já é reconhecido.' },
      { id: 'padronizar-marca', label: 'Padronizar a comunicação', desc: 'Mesma aparência no site, nas redes e nos materiais.' },
      { id: 'marca-para-site', label: 'Preparar a marca para um site', desc: 'Versões e arquivos prontos para usar no digital.' }
    ],
    'consultoria-svc': [
      { id: 'planejar-projeto', label: 'Planejar um projeto digital', desc: 'Escopo, prioridades e etapas antes de construir.' },
      { id: 'escolher-tecnologia', label: 'Escolher a tecnologia certa', desc: 'Comparar caminhos com custo, prazo e risco.' },
      { id: 'mapear-processos', label: 'Mapear processos da empresa', desc: 'Entender onde a tecnologia gera mais resultado.' },
      { id: 'revisar-existente', label: 'Revisar o que já tenho', desc: 'Avaliar site, sistema ou ferramentas atuais.' }
    ],
    'suporte-essencial-svc': [
      { id: 'corrigir-problema', label: 'Corrigir um problema', desc: 'Algo parou de funcionar ou está com erro.' },
      { id: 'pequenos-ajustes', label: 'Fazer pequenos ajustes', desc: 'Trocar textos, imagens, contatos ou seções.' },
      { id: 'atualizar-tecnico', label: 'Atualizar a parte técnica', desc: 'Versões, segurança, domínio ou hospedagem.' },
      { id: 'avaliar-tecnico', label: 'Avaliar um problema técnico', desc: 'Entender a causa antes de decidir o que fazer.' }
    ],
    'suporte-continuo-svc': [
      { id: 'manutencao-mensal', label: 'Manutenção todo mês', desc: 'Correções e atualizações sem precisar abrir orçamento.' },
      { id: 'melhorias-continuas', label: 'Melhorias contínuas', desc: 'Pequenos ajustes e evoluções ao longo dos meses.' },
      { id: 'seguranca-estabilidade', label: 'Segurança e estabilidade', desc: 'Monitorar, prevenir falhas e manter tudo no ar.' },
      { id: 'apoio-equipe', label: 'Apoio para a minha equipe', desc: 'Um canal para dúvidas e pedidos do dia a dia.' }
    ],
    'landing-page': [
      { id: 'modelos-prontos', label: 'Modelos Prontos' },
      { id: 'sob-medida', label: 'Modelos Sob Medida' }
    ],
    'site-institucional': [
      { id: 'modelos-prontos', label: 'Modelos Prontos' },
      { id: 'sob-medida', label: 'Modelos Sob Medida' }
    ],
    'portfolio': [
      { id: 'modelos-prontos', label: 'Modelos Prontos' },
      { id: 'sob-medida', label: 'Modelos Sob Medida' }
    ],
    'outro-svc': [
      { id: 'desafio-especifico', label: 'Resolver um desafio específico', desc: 'Você sabe o problema, mas não qual tecnologia usar.' },
      { id: 'explorar-tecnologia', label: 'Explorar possibilidades tecnológicas', desc: 'Descobrir o que pode ser automatizado ou digitalizado.' },
      { id: 'avaliar-viabilidade', label: 'Avaliar a viabilidade de um projeto', desc: 'Escopo, prazo, riscos e investimento antes de decidir.' },
      { id: 'consultoria-medida', label: 'Receber uma solução sob medida', desc: 'Um caminho desenhado para a realidade da sua empresa.' }
    ]
  };

  function getObjectives(serviceId) {
    return OBJECTIVES_BY_SERVICE[serviceId] || OBJECTIVES_BY_SERVICE['site-institucional'];
  }

  // ── Mapeamento de resultado (Serviço + Objetivo) ──
  const SOLUTIONS_MAP = {
    // MVP
    'mvp-svc:tirar-papel': { solution: 'MVP Ágil e Funcional', desc: 'Transformar sua ideia em uma aplicação real no menor tempo e investimento viável.' },
    'mvp-svc:mvp-funcional': { solution: 'MVP Estruturado para Usuários Reais', desc: 'Versão com as principais funcionalidades para validar proposta de valor e coletar feedback.' },
    'mvp-svc:validar-conceito': { solution: 'Protótipo Funcional de Validação', desc: 'Testar a aceitação do público e principais hipóteses antes de escalar o desenvolvimento.' },
    'mvp-svc:testar-solucao': { solution: 'MVP de Teste de Mercado', desc: 'Desenvolvimento focado nas features críticas para mensurar viabilidade e retenção.' },

    // SaaS
    'saas-svc:plataforma-escalavel': { solution: 'Plataforma SaaS Escalável', desc: 'Arquitetura moderna em nuvem preparada para crescimento contínuo e alto volume de acessos.' },
    'saas-svc:ideia-em-produto': { solution: 'Produto Digital SaaS', desc: 'Estruturação completa de produto digital, do back-end robusto à experiência do usuário.' },
    'saas-svc:sistema-assinatura': { solution: 'Plataforma com Gestão de Assinaturas', desc: 'Controle automatizado de assinaturas, cobranças recorrentes e liberação de acessos.' },
    'saas-svc:validar-modelo': { solution: 'SaaS Beta / Validação Comercial', desc: 'Primeira versão do produto digital para testar monetização e métricas de retenção.' },

    // Plataforma
    'plataforma-svc:plataforma-escalavel': { solution: 'Plataforma Digital Escalável', desc: 'Infraestrutura robusta para conectar múltiplos perfis de usuários com alto desempenho.' },
    'plataforma-svc:ideia-em-produto': { solution: 'Desenvolvimento de Plataforma Digital', desc: 'Engenharia de software focada em regras de negócio complexas e experiência intuitiva.' },
    'plataforma-svc:sistema-assinatura': { solution: 'Plataforma com Módulos e Permissões', desc: 'Controle granular de acessos, relatórios e monetização por perfil.' },
    'plataforma-svc:validar-modelo': { solution: 'Plataforma Piloto', desc: 'Lançamento piloto controlado para validação técnica e comercial.' },

    // Automação
    'automacao-svc:automatizar-processos': { solution: 'Automação de Processos Internos', desc: 'Eliminar gargalos operacionais e tarefas manuais recorrentes entre ferramentas.' },
    'automacao-svc:reduzir-tarefas': { solution: 'Fluxos Automatizados de Produtividade', desc: 'Liberar tempo da equipe substituindo atividades manuais por integrações inteligentes.' },
    'automacao-svc:integrar-ferramentas': { solution: 'Integrações via API e Webhooks', desc: 'Conectar ERPs, gateways de pagamento e canais de comunicação em um fluxo único.' },
    'automacao-svc:fluxos-inteligentes': { solution: 'Automações Inteligentes com Notificações', desc: 'Alertas automáticos, disparo de mensagens e relatórios em tempo real para sua equipe.' },

    // Sistema de gestão
    'sistema-svc:sistema-personalizado': { solution: 'Sistema de gestão sob medida', desc: 'Software exclusivo desenvolvido para atender exatamente às regras e fluxos do seu negócio.' },
    'sistema-svc:melhorar-operacao': { solution: 'Plataforma de Gestão Operacional', desc: 'Organizar fluxos de trabalho, controle de demandas e histórico de atividades em um ambiente seguro.' },
    'sistema-svc:centralizar-informacoes': { solution: 'Painel Administrativo Centralizado', desc: 'Centralizar dados, dashboards e controles antes dispersos em múltiplos locais.' },
    'sistema-svc:digitalizar-processos': { solution: 'Aplicação Web de Digitalização', desc: 'Substituir planilhas e processos em papel por uma aplicação robusta com permissões e auditoria.' },

    // Landing Page
    'landing-page:captar-clientes': { solution: 'Landing Page de Alta Conversão', desc: 'Página direcionada para tráfego pago com copy persuasiva e foco em captação de leads.' },
    'landing-page:apresentar-produto': { solution: 'Landing Page de Produto', desc: 'Apresentação visual impactante destacando benefícios, demonstração e diferenciais.' },
    'landing-page:pagina-vendas': { solution: 'Página de Vendas Estratégica', desc: 'Estrutura completa com storytelling, quebra de objeções e chamada para ação direta.' },
    'landing-page:validar-oferta': { solution: 'Página de Validação de Oferta', desc: 'Estrutura ágil para mensurar interesse real do público antes de grandes investimentos.' },
    'landing-page:modelos-prontos': { solution: 'Landing Page Otimizada (Modelo)', desc: 'Estrutura base validada para agilidade e conversão.' },
    'landing-page:sob-medida': { solution: 'Landing Page Exclusiva', desc: 'Projeto 100% personalizado para seu negócio e identidade.' },

    // Site Institucional
    'site-institucional:apresentar-empresa': { solution: 'Site Institucional Estruturado', desc: 'Apresentar sua história, diferenciais e serviços com clareza e autoridade institucional.' },
    'site-institucional:fortalecer-marca': { solution: 'Site Institucional de Alto Padrão', desc: 'Posicionar sua marca como referência no setor com design moderno e identidade consistente.' },
    'site-institucional:gerar-autoridade': { solution: 'Site com Portfólio e Cases', desc: 'Demonstrar credibilidade no mercado através de depoimentos, cases e certificações.' },
    'site-institucional:atrair-clientes': { solution: 'Site Institucional com Foco Comercial', desc: 'Estruturar canais de contato, formulários e CTAs para atrair e converter novas oportunidades.' },
    'site-institucional:modelos-prontos': { solution: 'Site Institucional (Modelo)', desc: 'Estrutura base profissional para presença digital rápida.' },
    'site-institucional:sob-medida': { solution: 'Site Institucional Exclusivo', desc: 'Design exclusivo focado na autoridade da sua marca.' },

    // Portfólio
    'portfolio:modelos-prontos': { solution: 'Portfólio (Modelo)', desc: 'Modelo base focado em conversão e agilidade.' },
    'portfolio:sob-medida': { solution: 'Portfólio Exclusivo', desc: 'Design 100% personalizado e sob medida.' },

    // Integrações
    'integracao-svc:integrar-pagamentos': { solution: 'Integração de Pagamentos', desc: 'Pix, cartão e boleto conectados ao seu site ou sistema, com confirmação automática.' },
    'integracao-svc:integrar-whatsapp': { solution: 'Integração com WhatsApp', desc: 'Mensagens, confirmações e avisos automáticos para os seus clientes.' },
    'integracao-svc:integrar-sistemas': { solution: 'Integração entre Sistemas e APIs', desc: 'ERP, CRM, planilhas e ferramentas trocando dados sem digitação manual.' },
    'integracao-svc:sincronizar-dados': { solution: 'Sincronização de Dados', desc: 'Um cadastro único que atualiza todas as ferramentas da empresa.' },

    // Loja virtual
    'loja-svc:comecar-vender': { solution: 'Loja Virtual Completa', desc: 'Catálogo, carrinho, checkout e pagamentos para começar a vender on-line.' },
    'loja-svc:loja-fisica-digital': { solution: 'Loja Virtual para Negócio Físico', desc: 'Seus produtos disponíveis 24 horas, com pedidos e entregas organizados.' },
    'loja-svc:sair-marketplace': { solution: 'Loja Própria com Marca', desc: 'Canal de venda próprio, com menos taxas e relação direta com o cliente.' },
    'loja-svc:organizar-pedidos': { solution: 'Loja com Gestão de Pedidos', desc: 'Pedidos, estoque e entregas acompanhados em um painel simples.' },

    // Identidade visual
    'identidade-svc:criar-marca': { solution: 'Identidade Visual Essencial', desc: 'Logo, paleta de cores, tipografia e versões principais para começar.' },
    'identidade-svc:renovar-marca': { solution: 'Renovação de Identidade Visual', desc: 'Marca atualizada, mantendo o que o seu público já reconhece.' },
    'identidade-svc:padronizar-marca': { solution: 'Identidade Visual Padronizada', desc: 'Elementos básicos para a mesma aparência em site, redes e materiais.' },
    'identidade-svc:marca-para-site': { solution: 'Identidade Visual para o Digital', desc: 'Versões e arquivos da marca prontos para o site e as redes sociais.' },

    // Consultoria e planejamento
    'consultoria-svc:planejar-projeto': { solution: 'Planejamento de Projeto Digital', desc: 'Escopo, prioridades e etapas definidos antes de qualquer desenvolvimento.' },
    'consultoria-svc:escolher-tecnologia': { solution: 'Consultoria de Tecnologia', desc: 'Caminhos comparados por custo, prazo e risco para você decidir com segurança.' },
    'consultoria-svc:mapear-processos': { solution: 'Mapeamento de Processos', desc: 'Onde a tecnologia gera mais resultado na sua operação, em ordem de prioridade.' },
    'consultoria-svc:revisar-existente': { solution: 'Revisão do Ambiente Digital', desc: 'Avaliação do site, sistema ou ferramentas atuais, com recomendações claras.' },

    // Suporte
    'suporte-essencial-svc:corrigir-problema': { solution: 'Suporte Técnico Essencial', desc: 'Correção do problema sob demanda, sem mensalidade.' },
    'suporte-essencial-svc:pequenos-ajustes': { solution: 'Ajustes sob Demanda', desc: 'Textos, imagens, contatos e seções atualizados quando você precisar.' },
    'suporte-essencial-svc:atualizar-tecnico': { solution: 'Atualização Técnica', desc: 'Versões, segurança, domínio e hospedagem em dia.' },
    'suporte-essencial-svc:avaliar-tecnico': { solution: 'Avaliação Técnica', desc: 'Entendemos a causa do problema e explicamos o melhor caminho.' },
    'suporte-continuo-svc:manutencao-mensal': { solution: 'Suporte Técnico Contínuo', desc: 'Manutenção, correções e atualizações todo mês, com o 1º mês gratuito.' },
    'suporte-continuo-svc:melhorias-continuas': { solution: 'Acompanhamento com Melhorias', desc: 'Pequenos ajustes e evoluções mensais no seu site ou sistema.' },
    'suporte-continuo-svc:seguranca-estabilidade': { solution: 'Monitoramento e Estabilidade', desc: 'Prevenção de falhas, segurança e acompanhamento contínuo.' },
    'suporte-continuo-svc:apoio-equipe': { solution: 'Suporte para a Equipe', desc: 'Um canal fixo para dúvidas e pedidos do dia a dia.' },

    // Outra Solução
    'outro-svc:desafio-especifico': { solution: 'Consultoria e Solução Personalizada', desc: 'Análise aprofundada do seu desafio para desenhar a arquitetura técnica ideal.' },
    'outro-svc:explorar-tecnologia': { solution: 'Diagnóstico e Mapeamento Tecnológico', desc: 'Explorar tecnologias modernas e automações que podem alavancar seu negócio.' },
    'outro-svc:avaliar-viabilidade': { solution: 'Análise de Viabilidade Técnica e Estimativa', desc: 'Dimensionamento de escopo, prazos, riscos e investimentos para o projeto.' },
    'outro-svc:consultoria-medida': { solution: 'Solução Tecnológica Sob Medida', desc: 'Desenvolvimento personalizado de acordo com as necessidades exclusivas da sua empresa.' }
  };

  function getSolution(serviceId, objectiveId) {
    const key = `${serviceId}:${objectiveId}`;
    return SOLUTIONS_MAP[key] || { solution: 'Solução tecnológica sob medida', desc: 'A COGIT irá analisar seu cenário e propor o caminho mais adequado.' };
  }

  // ── State ──
  const state = {
    step: 0,
    challenge: null,
    selectedService: null,
    objective: null,
    context: '',
    contextTags: [],
    customProject: null,
    variant: null, // modelo pronto escolhido quando o serviço tem níveis (MODEL_TIERS)
    personalization: null, // { variante, dados, nome }: site personalizado no editor do modelo
    extras: [], // ids do catálogo escolhidos em "Complementos" (ou junto com o principal, na primeira etapa)
    picked: [], // ids da primeira etapa, para lembrar Produto digital (SaaS) × MVP, que têm o mesmo id no catálogo
    consultoria: false // consultoria e planejamento digital (sem custo fechando com a COGIT)
  };

  const heroSection = container.closest('.hero');
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const inDialog = container.closest('dialog');
  if (inDialog) inDialog.addEventListener('close', () => document.body.classList.remove('is-hero-diagnostic-active'));
  function updateDiagnosticMode() {
    // na janela, o modo "diagnóstico ativo" (esconde WhatsApp e barra fixa) só vale com ela aberta
    const isActive = state.step > 0 && (!inDialog || inDialog.open);
    document.body.classList.toggle('is-hero-diagnostic-active', isActive);
    if (heroSection) heroSection.classList.toggle('is-diagnostic-active', isActive);
    container.dataset.step = String(state.step);
  }

  function focusDiagnosticViewport() {
    const dialogBody = container.closest('.dx-modal-body');
    if (dialogBody) { dialogBody.scrollTop = 0; return; }
    const header = document.querySelector('.header, header');
    const headerHeight = header ? header.offsetHeight : 0;
    const targetTop = Math.max(0, container.getBoundingClientRect().top + window.scrollY - headerHeight - 12);
    window.scrollTo({ top: targetTop, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  function revealNextAction(action) {
    if (!action || window.innerWidth > 680 || container.closest('dialog')) return;
    window.requestAnimationFrame(() => {
      const rect = action.getBoundingClientRect();
      const safeBottom = window.innerHeight - 18;
      if (rect.bottom > safeBottom) {
        window.scrollBy({ top: rect.bottom - safeBottom, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    });
  }

  function transitionTo(renderFn, direction = 'next') {
    const wrapper = container.querySelector('.hero-step-wrapper');
    if (wrapper) {
      wrapper.classList.add(direction === 'next' ? 'is-fading-left' : 'is-fading-right');
      setTimeout(() => {
        renderFn();
        updateDiagnosticMode();
        CogitUI.focusHeading(container);
        const nw = container.querySelector('.hero-step-wrapper');
        if (nw) {
          nw.classList.add(direction === 'next' ? 'is-entering-right' : 'is-entering-left');
          requestAnimationFrame(() => setTimeout(() => nw.classList.remove('is-entering-right', 'is-entering-left'), 30));
        }
        requestAnimationFrame(() => requestAnimationFrame(focusDiagnosticViewport));
        if (!prefersReducedMotion()) setTimeout(focusDiagnosticViewport, 320);
      }, prefersReducedMotion() ? 0 : 180);
    } else {
      renderFn();
      updateDiagnosticMode();
      CogitUI.focusHeading(container);
      requestAnimationFrame(focusDiagnosticViewport);
    }
  }

  const PRESENCA_DIGITAL_IDS = ['site-institucional', 'landing-page', 'portfolio'];

  // Nome comercial e prazo dos modelos prontos (data.js). Preços vêm do catálogo (configuratorData).
  const PRESENCE_MODELS = presenceModels;
  // Primeira etapa: dá para combinar serviços de grupos diferentes (ex.: site + identidade visual).
  // pick 'one': alternativas entre si, só uma por grupo (site OU landing page OU portfólio OU loja).
  // pick 'any': serviços que se somam (automação + integrações). 'alone': "Não sei ainda" não combina com nada.
  const SERVICE_GROUPS = [
    { label: 'Site e vendas on-line', pick: 'one', ids: ['site-institucional', 'landing-page', 'portfolio', 'loja-svc'] },
    { label: 'Sistemas e produto digital', pick: 'one', ids: ['sistema-svc', 'saas-svc', 'mvp-svc', 'plataforma-svc'] },
    { label: 'Automação e integrações', pick: 'any', ids: ['automacao-svc', 'integracao-svc'] },
    { label: 'Marca e planejamento', pick: 'any', ids: ['identidade-svc', 'consultoria-svc'] },
    { label: 'Suporte técnico', pick: 'one', ids: ['suporte-essencial-svc', 'suporte-continuo-svc'] },
    { label: 'Ainda não sabe?', pick: 'alone', ids: ['outro-svc'] }
  ];
  const groupOf = (dxId) => SERVICE_GROUPS.find(g => g.ids.includes(dxId)) || null;
  // Quem vira o serviço principal (guia formato, modelo e resumo); os demais viram complementos.
  const PRIMARY_ORDER = ['site-institucional', 'landing-page', 'portfolio', 'loja-svc', 'sistema-svc', 'saas-svc', 'mvp-svc', 'plataforma-svc',
    'automacao-svc', 'integracao-svc', 'identidade-svc', 'consultoria-svc', 'suporte-essencial-svc', 'suporte-continuo-svc'];
  const CONTEXT_TAGS = {
    presenca: ['Já tenho logotipo e identidade visual', 'Preciso de ajuda com os textos', 'Tenho fotos e imagens próprias', 'Já tenho domínio', 'Tenho um prazo definido'],
    loja: ['Já tenho logotipo e identidade visual', 'Já vendo em marketplace ou redes sociais', 'Tenho fotos dos produtos', 'Preciso calcular frete', 'Tenho um prazo definido'],
    marca: ['Já tenho um logotipo que quero renovar', 'Tenho referências visuais', 'Vou usar a marca em site e redes sociais', 'Preciso de ajuda com o nome', 'Tenho um prazo definido'],
    suporte: ['O site ou sistema foi feito pela COGIT', 'Foi feito por outra empresa', 'Tenho acesso à hospedagem e ao domínio', 'É urgente'],
    outros: ['Hoje usamos planilhas', 'Preciso integrar com sistemas que já uso', 'Ainda estou validando a ideia', 'Tenho um prazo definido', 'Já tenho uma equipe técnica']
  };
  const TEM_MARCA = 'Já tenho logotipo e identidade visual';
  const QUER_INTEGRAR = 'Preciso integrar com sistemas que já uso';
  function contextTagsFor(serviceId) {
    if (PRESENCA_DIGITAL_IDS.includes(serviceId)) return CONTEXT_TAGS.presenca;
    if (serviceId === 'loja-svc') return CONTEXT_TAGS.loja;
    if (serviceId === 'identidade-svc') return CONTEXT_TAGS.marca;
    if (serviceId === 'suporte-essencial-svc' || serviceId === 'suporte-continuo-svc') return CONTEXT_TAGS.suporte;
    return CONTEXT_TAGS.outros;
  }

  // ── Catálogo (js/data.js): o mesmo do configurador e da plataforma ──
  const CATALOG_OF = {
    'automacao-svc': 'automacao', 'integracao-svc': 'integracao', 'sistema-svc': 'sistema', 'saas-svc': 'mvp', 'mvp-svc': 'mvp', 'plataforma-svc': 'plataforma',
    'loja-svc': 'loja-virtual', 'identidade-svc': 'identidade-essencial', 'suporte-essencial-svc': 'manutencao', 'suporte-continuo-svc': 'suporte',
    'consultoria-svc': 'diagnostico', 'outro-svc': 'diagnostico'
  };
  const catalogIdOf = (dxId) => CATALOG_OF[dxId] || dxId || 'diagnostico';
  const catalogSvc = (id) => (typeof configuratorData !== 'undefined' ? configuratorData.services : []).find(x => x.id === id) || null;
  const dxIdOfCatalog = (id) => ({ 'loja-virtual': 'loja-svc', 'identidade-essencial': 'identidade-svc', automacao: 'automacao-svc', integracao: 'integracao-svc', sistema: 'sistema-svc', mvp: 'mvp-svc', plataforma: 'plataforma-svc', manutencao: 'suporte-essencial-svc', suporte: 'suporte-continuo-svc' })[id] || id;
  const isRecurring = (svc) => svc && (svc.billing === 'monthly' || svc.billing === 'demand');
  // Valor de um complemento: presença digital entra com o modelo pronto (o mais comum em combinação).
  function extraPrice(id) {
    const svc = catalogSvc(id);
    if (!svc) return { value: null, from: false, label: 'Sob consulta' };
    const from = svc.priceType === 'from';
    const suffix = svc.billing === 'monthly' ? '/mês após o 1º mês grátis' : svc.billing === 'demand' ? ' por solicitação' : '';
    return { value: svc.price, from, label: (from ? 'a partir de ' : '') + brl(svc.price) + suffix };
  }
  const CONSULTORIA_PRECO = 350;

  // Complementos recomendados para cada serviço principal: [id do catálogo, por que combina].
  const RECOMMENDED_EXTRAS = {
    'site-institucional': [['identidade-essencial', 'Logo, cores e tipografia prontos para aplicar no site.'], ['automacao', 'Contatos do site respondidos e encaminhados automaticamente.'], ['integracao', 'WhatsApp, agenda ou pagamentos ligados ao site.'], ['suporte', 'Manutenção e pequenos ajustes todo mês depois da entrega.']],
    'landing-page': [['automacao', 'Cada contato da página vira um lead tratado na hora, sem planilha.'], ['identidade-essencial', 'Marca consistente para a campanha passar confiança.'], ['integracao', 'Pagamento, WhatsApp ou CRM conectados à página.'], ['manutencao', 'Ajustes pontuais quando a campanha mudar.']],
    'portfolio': [['identidade-essencial', 'Uma marca própria valoriza o seu trabalho.'], ['automacao', 'Pedidos de orçamento organizados automaticamente.'], ['manutencao', 'Novos projetos e fotos publicados quando você precisar.']],
    'loja-svc': [['identidade-essencial', 'Marca forte para a loja, as embalagens e as redes.'], ['integracao', 'Pagamentos, frete e nota fiscal conectados à loja.'], ['automacao', 'Avisos de pedido, carrinho abandonado e pós-venda.'], ['suporte', 'Loja sempre no ar, com ajustes todo mês.']],
    'automacao-svc': [['integracao', 'Conecta as ferramentas que a automação vai usar.'], ['sistema', 'Um painel para acompanhar o que a automação faz.'], ['suporte', 'Acompanhamento para ajustar os fluxos com o tempo.']],
    'integracao-svc': [['automacao', 'Usa os dados integrados para disparar tarefas sozinho.'], ['sistema', 'Um lugar único para ver os dados que chegam.'], ['suporte', 'Integrações monitoradas e ajustadas todo mês.']],
    'sistema-svc': [['integracao', 'O sistema conversa com pagamentos e ferramentas atuais.'], ['automacao', 'Tarefas repetitivas do sistema feitas sozinhas.'], ['suporte', 'Correções e evolução do sistema todo mês.']],
    'saas-svc': [['identidade-essencial', 'Marca do produto pronta para o lançamento.'], ['landing-page', 'Página de lançamento para captar os primeiros clientes.'], ['integracao', 'Pagamentos e assinaturas conectados ao produto.'], ['suporte', 'Produto estável e evoluindo depois do lançamento.']],
    'mvp-svc': [['identidade-essencial', 'Marca do produto pronta para os primeiros usuários.'], ['landing-page', 'Página para apresentar o MVP e captar interessados.'], ['integracao', 'Pagamentos ou ferramentas que o MVP precisa.'], ['suporte', 'Ajustes rápidos durante a validação.']],
    'plataforma-svc': [['identidade-essencial', 'Marca da plataforma para os dois públicos.'], ['landing-page', 'Página para atrair os primeiros usuários.'], ['integracao', 'Pagamentos e repasses conectados à plataforma.'], ['suporte', 'Plataforma monitorada e evoluindo todo mês.']],
    'identidade-svc': [['site-institucional', 'Aplicar a nova marca em um site completo.'], ['landing-page', 'Lançar a marca com uma página de campanha.'], ['portfolio', 'Mostrar o seu trabalho com a nova identidade.']],
    'consultoria-svc': [['identidade-essencial', 'Marca definida junto com o planejamento.'], ['site-institucional', 'Presença digital para colocar o plano em prática.'], ['automacao', 'Primeiras automações dos processos mapeados.'], ['sistema', 'Sistema para a operação que vamos planejar.']],
    'suporte-essencial-svc': [['suporte', 'Prefere previsibilidade? Acompanhamento mensal com o 1º mês grátis.'], ['automacao', 'Automatizar o que hoje dá trabalho manual.'], ['integracao', 'Conectar o site ou sistema a novas ferramentas.']],
    'suporte-continuo-svc': [['automacao', 'Automatizar o que hoje dá trabalho manual.'], ['integracao', 'Conectar o site ou sistema a novas ferramentas.'], ['identidade-essencial', 'Renovar a marca junto com a manutenção.']]
  };
  const hasComplementos = () => Boolean(state.selectedService) && state.selectedService !== 'outro-svc';
  // Consultoria opcional em qualquer solução que vamos construir (não em suporte nem na própria consultoria).
  const consultoriaElegivel = () => hasComplementos() && !['consultoria-svc', 'suporte-essencial-svc', 'suporte-continuo-svc'].includes(state.selectedService);

  // Recomendação conforme o serviço, o objetivo e o que a pessoa marcou no contexto.
  function recommendedExtras() {
    const main = catalogIdOf(state.selectedService);
    let list = (RECOMMENDED_EXTRAS[state.selectedService] || []).map(([id, why]) => ({ id, why }));
    if (state.contextTags.includes(TEM_MARCA)) list = list.filter(r => r.id !== 'identidade-essencial');
    const querIntegrar = state.contextTags.includes(QUER_INTEGRAR) || state.objective === 'integrar-ferramentas';
    if (querIntegrar) {
      const i = list.findIndex(r => r.id === 'integracao');
      const rec = i >= 0 ? list.splice(i, 1)[0] : { id: 'integracao', why: '' };
      rec.why = 'Você marcou que precisa integrar com sistemas que já usa.';
      list.unshift(rec);
    }
    return list.filter(r => r.id !== main && catalogSvc(r.id) && !rivalOfMain(r.id));
  }
  function otherExtras(recs) {
    const skip = new Set([catalogIdOf(state.selectedService), 'diagnostico', ...recs.map(r => r.id)]);
    return (typeof configuratorData !== 'undefined' ? configuratorData.services : []).filter(x => !skip.has(x.id) && !rivalOfMain(x.id));
  }
  // Mesma regra da primeira etapa: alternativas do mesmo grupo não se somam (site + landing page, suporte essencial + contínuo).
  const altGroupOfCatalog = (id) => { const g = groupOf(dxIdOfCatalog(id)); return g && g.pick === 'one' ? g : null; };
  const rivalOfMain = (id) => { const g = altGroupOfCatalog(id); return Boolean(g) && g === groupOf(state.selectedService); };
  // Combinação (js/data.js · serviceBundles) completa com o principal + complementos.
  function activeBundleFor(ids) {
    const bundles = typeof serviceBundles !== 'undefined' ? serviceBundles : [];
    const presenceModel = PRESENCA_DIGITAL_IDS.includes(state.selectedService) ? state.objective : null;
    let best = null;
    bundles.forEach(bundle => {
      if (!bundle.services.every(id => ids.includes(id))) return;
      if (bundle.model && bundle.services.includes(state.selectedService) && presenceModel !== bundle.model) return;
      const base = bundle.services.reduce((sum, id) => sum + (id === state.selectedService && presenceModel ? presencePrice(id, presenceModel) : (catalogSvc(id) || {}).price || 0), 0);
      const value = base - Math.floor(base * (100 - bundle.discount) / 100 / 10) * 10;
      if (!best || value > best.value) best = { bundle, value };
    });
    return best;
  }
  const DX_ICON = {
    check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    right: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    left: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    external: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>',
    restart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3 3 3 9 9 9"/></svg>'
  };
  const brl = (value) => 'R$ ' + Number(value).toLocaleString('pt-BR');
  const esc = (value) => CogitUI.escapeHtml(value);

  function presencePrice(serviceId, model) {
    const services = typeof configuratorData !== 'undefined' ? configuratorData.services : [];
    const svc = services.find(s => s.id === serviceId);
    if (!svc) return null;
    return model === 'sob-medida' ? (svc.customPrice || svc.price) : svc.price;
  }

  // Níveis de modelo pronto do serviço (básico, intermediário, formal), se houver.
  const tiersOf = (serviceId) => (typeof MODEL_TIERS !== 'undefined' && MODEL_TIERS[serviceId]) || null;

  // Ordem das etapas: solução → contexto → formato → modelo (só modelo pronto com níveis) → complementos → resumo.
  // Depois do formato (ou do modelo), a próxima etapa é Complementos; em "Não sei ainda", direto o resumo.
  const afterFormat = () => (hasComplementos() ? renderStepComplementos : renderResult);
  function dxPlan() {
    const isPresence = PRESENCA_DIGITAL_IDS.includes(state.selectedService);
    const plan = [['solucao', 'Solução'], ['contexto', 'Contexto'], ['formato', isPresence ? 'Formato' : 'Objetivo']];
    if (isPresence && state.objective !== 'sob-medida' && tiersOf(state.selectedService)) plan.push(['modelo', 'Modelo']);
    if (hasComplementos()) plan.push(['complementos', 'Complementos']);
    plan.push(['resumo', 'Resumo']);
    return plan;
  }

  // Cabeçalho comum: etapas nomeadas (não só números), título e apoio.
  function renderDxSteps(currentKey) {
    const plan = dxPlan();
    const current = plan.findIndex(([key]) => key === currentKey) + 1;
    return `
        <ol class="dx-steps" aria-label="Etapas do diagnóstico">
          ${plan.map(([, label], i) => {
            const n = i + 1;
            const status = n < current ? 'is-done' : n === current ? 'is-current' : '';
            return `<li class="${status}"${n === current ? ' aria-current="step"' : ''}><span class="dx-step-n" aria-hidden="true">${n < current ? DX_ICON.check : n}</span><span class="dx-step-l">${label}</span>${n < current ? '<span class="sr-only"> (concluída)</span>' : ''}</li>`;
          }).join('')}
        </ol>`;
  }

  function renderDxHead(currentKey, title, desc) {
    return `
      <header class="dx-head">
        ${renderDxSteps(currentKey)}
        <h2 class="dx-title">${title}</h2>
        ${desc ? `<p class="dx-desc">${desc}</p>` : ''}
      </header>`;
  }

  function renderDxFooter(backLabel, nextLabel, nextDisabled) {
    return `
      <footer class="dx-foot">
        ${backLabel ? `<button type="button" class="dx-btn dx-btn--ghost" data-dx="back">${DX_ICON.left}<span>${backLabel}</span></button>` : '<span aria-hidden="true"></span>'}
        ${nextLabel ? `<button type="button" class="dx-btn dx-btn--primary" data-dx="next" ${nextDisabled ? 'disabled' : ''}><span data-dx-next-label>${nextLabel}</span>${DX_ICON.right}</button>` : ''}
      </footer>`;
  }

  // ── ETAPA 0 (removida): o fluxo começa direto em "O que você precisa construir?",
  // na página e na janela. Mantida como nome porque Voltar/Recomeçar apontam para ela.
  function renderStep0() { return renderStep1(); }

  // O que aparece marcado na primeira etapa: o principal, os complementos e a consultoria.
  function pickedServices() {
    if (!state.selectedService) return [];
    if (state.selectedService === 'outro-svc') return ['outro-svc'];
    const fromExtras = state.extras.map(dxIdOfCatalog).map(id => (id === 'mvp-svc' && state.picked.includes('saas-svc') ? 'saas-svc' : id));
    const all = [state.selectedService, ...fromExtras, ...(state.consultoria ? ['consultoria-svc'] : [])];
    return [...new Set(all)].filter(id => groupOf(id));
  }

  function renderStep1() {
    state.step = 1;
    const picked = pickedServices();
    const card = (svc, group) => `
      <label class="dx-option dx-option--svc">
        <input type="checkbox" name="dx-service" value="${svc.id}" data-pick="${group.pick}" ${picked.includes(svc.id) ? 'checked' : ''}>
        <span class="dx-option-icon" aria-hidden="true">${svc.iconSvg}</span>
        <span class="dx-option-body">
          <span class="dx-option-name">${svc.name}</span>
          <span class="dx-option-desc">${svc.desc}</span>
          <span class="dx-option-meta">${svc.priceLabel}</span>
        </span>
        <span class="dx-option-mark" aria-hidden="true">${DX_ICON.check}</span>
      </label>`;
    const hint = { one: 'Escolha 1', any: 'Pode marcar os dois', alone: '' };
    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead('solucao', 'O que você precisa construir?', 'Escolha um serviço por grupo e combine o que precisar, como um site com identidade visual. Se não souber, “Não sei ainda” leva você a uma orientação.')}
        <div class="dx-body">
          <div class="dx-groups">
          ${SERVICE_GROUPS.map(group => `
            <fieldset class="dx-group" style="--span:${group.ids.length}">
              <legend class="dx-group-label">${group.label}${hint[group.pick] ? ` <span class="dx-group-hint">· ${hint[group.pick]}</span>` : ''}</legend>
              <div class="dx-grid dx-grid--svc">${group.ids.map(id => card(SERVICES_GRID.find(s => s.id === id), group)).join('')}</div>
            </fieldset>`).join('')}
          </div>
        </div>
        ${renderDxFooter(inDialog ? 'Fechar' : '', 'Continuar', !picked.length)}
      </div>`;

    const next = container.querySelector('[data-dx="next"]');
    const nextLabel = container.querySelector('[data-dx-next-label]');
    const inputs = [...container.querySelectorAll('input[name="dx-service"]')];
    const sync = () => {
      const n = inputs.filter(i => i.checked).length;
      next.disabled = !n;
      nextLabel.textContent = n > 1 ? `Continuar com ${n} serviços` : 'Continuar';
    };
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          const group = groupOf(input.value);
          inputs.forEach(other => {
            if (other === input || !other.checked) return;
            // "Não sei ainda" fica sozinho; num grupo de alternativas, só uma fica marcada
            if (group.pick === 'alone' || other.dataset.pick === 'alone' || (group.pick === 'one' && groupOf(other.value) === group)) other.checked = false;
          });
          revealNextAction(next);
          if (typeof trackEvent === 'function') trackEvent('hero_service_selected', input.value);
        }
        sync();
      });
    });
    sync();
    // primeira etapa: na janela, "Fechar" fecha a janela; na página não há para onde voltar
    container.querySelector('[data-dx="back"]')?.addEventListener('click', () => inDialog?.close());
    next.addEventListener('click', () => {
      const chosen = inputs.filter(i => i.checked).map(i => i.value);
      if (!chosen.length) return;
      const primary = chosen.includes('outro-svc') ? 'outro-svc' : PRIMARY_ORDER.find(id => chosen.includes(id));
      const svc = SERVICES_GRID.find(s => s.id === primary);
      if (state.selectedService !== primary) { state.objective = null; state.customProject = null; state.variant = null; state.personalization = null; }
      state.selectedService = primary;
      state.challenge = svc.challenge;
      state.picked = chosen;
      // os outros escolhidos entram como complementos; a consultoria vira a opção "incluir consultoria"
      state.consultoria = primary !== 'consultoria-svc' && chosen.includes('consultoria-svc');
      state.extras = primary === 'outro-svc' ? [] : chosen.filter(id => id !== primary && id !== 'consultoria-svc').map(catalogIdOf);
      transitionTo(renderStep3, 'next');
    });
  }

  // ── ETAPA 3: objetivo (serviços de operação e produto) ──
  function renderStep2() {
    state.step = 3;
    const selectedSvc = SERVICES_GRID.find(s => s.id === state.selectedService);
    if (PRESENCA_DIGITAL_IDS.includes(state.selectedService)) return renderStep2Modelo(selectedSvc);

    const objectives = getObjectives(state.selectedService);
    const isUnknown = state.selectedService === 'outro-svc';
    // "Não sei ainda": como funciona a orientação, para a etapa não ficar vazia e a pessoa saber o que vem.
    const guide = isUnknown ? `
          <section class="dx-guide" aria-labelledby="dx-guide-title">
            <div class="dx-guide-head">
              <p class="dx-kicker" id="dx-guide-title">Como funciona a orientação</p>
              <p class="dx-guide-price"><strong>Diagnóstico inicial gratuito</strong><span>sem compromisso de contratar</span></p>
            </div>
            <ol class="dx-guide-steps">
              <li><strong>Você conta o desafio</strong><span>O objetivo e o contexto que você escreveu vão junto para a equipe.</span></li>
              <li><strong>Conversamos sobre o negócio</strong><span>Uma reunião para entender o problema, as pessoas envolvidas e o momento.</span></li>
              <li><strong>Você recebe um caminho</strong><span>Solução recomendada, com escopo, prazo e investimento antes de qualquer decisão.</span></li>
            </ol>
            <div class="dx-guide-alt">
              <p>Quer dar uma olhada antes? Temos sites, landing pages, loja virtual, identidade visual, automações, integrações, sistemas, MVP, plataformas, consultoria e suporte.</p>
              <button type="button" class="dx-link-btn" data-dx-action="all-services">${DX_ICON.left} Ver todos os serviços</button>
            </div>
          </section>` : `
          <div class="dx-picked">
            <span class="dx-option-icon" aria-hidden="true">${selectedSvc ? selectedSvc.iconSvg : ''}</span>
            <span class="dx-picked-body"><small>Solução escolhida</small><strong>${selectedSvc ? selectedSvc.name : ''}</strong></span>
            <span class="dx-picked-price">${selectedSvc ? selectedSvc.priceLabel : ''}</span>
            <button type="button" class="dx-edit" data-dx-action="all-services">Trocar<span class="sr-only"> solução</span></button>
          </div>`;
    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead('formato', isUnknown ? 'O que você quer descobrir?' : 'Qual resultado você busca?', isUnknown
          ? 'Escolha o que mais se parece com o seu momento. Isso direciona a conversa com a equipe.'
          : `Para <strong>${selectedSvc ? selectedSvc.name : 'sua solução'}</strong>. Escolha o objetivo mais próximo.`)}
        <div class="dx-body">
          <fieldset class="dx-group">
            <legend class="sr-only">Objetivo</legend>
            <div class="dx-grid dx-grid--objective">
              ${objectives.map(obj => `
                <label class="dx-option dx-option--objective">
                  <input type="radio" name="dx-objective" value="${obj.id}" ${state.objective === obj.id ? 'checked' : ''}>
                  <span class="dx-option-body">
                    <span class="dx-option-name">${obj.label}</span>
                    ${obj.desc ? `<span class="dx-option-desc">${obj.desc}</span>` : ''}
                  </span>
                  <span class="dx-option-mark" aria-hidden="true">${DX_ICON.check}</span>
                </label>`).join('')}
            </div>
          </fieldset>
          ${guide}
        </div>
        ${renderDxFooter('Voltar', 'Continuar', !state.objective)}
      </div>`;

    const next = container.querySelector('[data-dx="next"]');
    container.querySelectorAll('input[name="dx-objective"]').forEach(input => {
      input.addEventListener('change', () => {
        state.objective = input.value;
        next.disabled = false;
        revealNextAction(next);
        if (typeof trackEvent === 'function') trackEvent('hero_objective_selected', input.value);
      });
    });
    container.querySelector('[data-dx-action="all-services"]')?.addEventListener('click', () => transitionTo(renderStep1, 'back'));
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(renderStep3, 'back'));
    next.addEventListener('click', () => { if (state.objective) transitionTo(afterFormat(), 'next'); });
  }

  // ── COMPLEMENTOS: serviços que combinam com o escolhido (recomendados) + consultoria opcional ──
  function renderStepComplementos() {
    state.step = 4;
    const selectedSvc = SERVICES_GRID.find(s => s.id === state.selectedService);
    const main = catalogIdOf(state.selectedService);
    const recs = recommendedExtras();
    const others = otherExtras(recs);
    state.extras = state.extras.filter(id => id !== main && catalogSvc(id) && !rivalOfMain(id));
    const icon = (id) => { const dx = SERVICES_GRID.find(x => x.id === dxIdOfCatalog(id)); return dx ? dx.iconSvg : ''; };
    const bundleHint = (id) => {
      if (state.extras.includes(id)) return '';
      const withIt = activeBundleFor([main, ...state.extras, id]);
      const without = activeBundleFor([main, ...state.extras]);
      return withIt && (!without || withIt.value > without.value) ? `<span class="dx-chip">Combinação ${esc(withIt.bundle.name)}: ${withIt.bundle.discount}% de desconto</span>` : '';
    };
    const card = (id, why) => {
      const svc = catalogSvc(id);
      return `
        <label class="dx-option dx-option--svc dx-option--extra">
          <input type="checkbox" name="dx-extra" value="${id}" ${state.extras.includes(id) ? 'checked' : ''}>
          <span class="dx-option-icon" aria-hidden="true">${icon(id)}</span>
          <span class="dx-option-body">
            <span class="dx-option-name">${esc(svc.name)}</span>
            <span class="dx-option-desc">${esc(why || svc.description)}</span>
            <span class="dx-option-meta">${extraPrice(id).label}</span>
            ${bundleHint(id)}
          </span>
          <span class="dx-option-mark" aria-hidden="true">${DX_ICON.check}</span>
        </label>`;
    };
    const svcName = selectedSvc ? selectedSvc.name : 'sua solução';
    const othersOpen = others.some(x => state.extras.includes(x.id));

    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead('complementos', 'Quer somar mais algum serviço?', `Opcional. Separamos o que costuma combinar com <strong>${esc(svcName)}</strong>. Marque o que fizer sentido ou siga para o resumo.`)}
        <div class="dx-body">
          ${consultoriaElegivel() ? `
          <div class="dx-group">
            <label class="dx-option dx-option--consult">
              <input type="checkbox" name="dx-consultoria" ${state.consultoria ? 'checked' : ''}>
              <span class="dx-option-icon" aria-hidden="true">${(SERVICES_GRID.find(x => x.id === 'consultoria-svc') || {}).iconSvg || ''}</span>
              <span class="dx-option-body">
                <span class="dx-option-name">Incluir consultoria e planejamento digital</span>
                <span class="dx-option-desc">Opcional. Mapeamos negócio, processos e prioridades antes de construir ${esc(svcName.toLowerCase())}.</span>
                <span class="dx-consult-note">Se você decidir desenvolver com outra empresa, a consultoria é cobrada à parte: ${brl(CONSULTORIA_PRECO)}.</span>
              </span>
              <span class="dx-consult-price"><b>Sem custo</b><small>fechando com a COGIT</small></span>
              <span class="dx-option-mark" aria-hidden="true">${DX_ICON.check}</span>
            </label>
          </div>` : ''}
          ${recs.length ? `
          <fieldset class="dx-group">
            <legend class="dx-group-label">Recomendados para ${esc(svcName)}</legend>
            <div class="dx-grid dx-grid--svc">${recs.map(r => card(r.id, r.why)).join('')}</div>
          </fieldset>` : ''}
          ${others.length ? `
          <details class="dx-more"${othersOpen ? ' open' : ''}>
            <summary><span>Ver todos os outros serviços</span><small>${others.length} serviços</small></summary>
            <fieldset class="dx-group">
              <legend class="sr-only">Outros serviços</legend>
              <div class="dx-grid dx-grid--svc">${others.map(x => card(x.id, '')).join('')}</div>
            </fieldset>
          </details>` : ''}
          <p class="dx-personalize-status is-ok" data-dx-extras-status role="status" hidden></p>
        </div>
        ${renderDxFooter('Voltar', 'Ver resumo', false)}
      </div>`;

    const status = container.querySelector('[data-dx-extras-status]');
    const nextLabel = container.querySelector('[data-dx-next-label]');
    const sync = () => {
      const n = state.extras.length;
      const bundle = activeBundleFor([main, ...state.extras]);
      nextLabel.textContent = n || state.consultoria ? 'Ver resumo' : 'Seguir sem complementos';
      // partes separadas por " · " (cada uma é traduzida sozinha na versão em inglês)
      const msg = [n ? `${n} serviço${n > 1 ? 's' : ''} adicionado${n > 1 ? 's' : ''}` : '', state.consultoria ? 'Consultoria incluída' : '', bundle ? `Combinação ${bundle.bundle.name} aplicada (${bundle.bundle.discount}% de desconto)` : ''].filter(Boolean).join(' · ');
      status.textContent = msg;
      status.hidden = !msg;
    };
    container.querySelectorAll('input[name="dx-extra"]').forEach(input => input.addEventListener('change', () => {
      const group = input.checked ? altGroupOfCatalog(input.value) : null;
      if (group) container.querySelectorAll('input[name="dx-extra"]:checked').forEach(other => { if (other !== input && altGroupOfCatalog(other.value) === group) other.checked = false; });
      state.extras = [...container.querySelectorAll('input[name="dx-extra"]:checked')].map(i => i.value);
      // Atualiza as dicas de combinação sem redesenhar a etapa (não perde foco nem rolagem).
      container.querySelectorAll('input[name="dx-extra"]').forEach(other => {
        const body = other.closest('label').querySelector('.dx-option-body');
        body.querySelector('.dx-chip')?.remove();
        body.insertAdjacentHTML('beforeend', bundleHint(other.value));
      });
      sync();
      if (typeof trackEvent === 'function') trackEvent('hero_extra_toggled', input.value + ':' + (input.checked ? 'on' : 'off'));
    }));
    container.querySelector('input[name="dx-consultoria"]')?.addEventListener('change', (e) => {
      state.consultoria = e.target.checked;
      sync();
      if (typeof trackEvent === 'function') trackEvent('hero_consultoria', state.consultoria ? 'on' : 'off');
    });
    const variantData = state.variant && PRESENCA_DIGITAL_IDS.includes(state.selectedService) && state.objective === 'modelos-prontos';
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(variantData ? renderStepModelo : renderStep2, 'back'));
    container.querySelector('[data-dx="next"]').addEventListener('click', () => transitionTo(renderResult, 'next'));
    sync();
  }

  // ── ETAPA 3 (presença digital): modelo pronto ou sob medida ──
  function renderStep2Modelo(selectedSvc) {
    const info = PRESENCE_MODELS[state.selectedService];
    const prontoPrice = presencePrice(state.selectedService, 'modelos-prontos');
    const sobPrice = presencePrice(state.selectedService, 'sob-medida');
    const project = state.customProject;

    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead('formato', `Como você quer construir ${selectedSvc && selectedSvc.id === 'landing-page' ? 'sua landing page' : selectedSvc && selectedSvc.id === 'portfolio' ? 'seu portfólio' : 'seu site'}?`, 'Dois caminhos, com prazo e investimento diferentes. Escolha um para continuar.')}
        <div class="dx-body">
          <fieldset class="dx-group">
            <legend class="sr-only">Formato</legend>
            <div class="dx-grid dx-grid--format">
              <div class="dx-format">
                <input type="radio" id="dx-format-pronto" name="dx-format" value="modelos-prontos" ${state.objective === 'modelos-prontos' ? 'checked' : ''}>
                <label for="dx-format-pronto" class="dx-format-label">
                  <span class="dx-format-top"><span class="dx-chip">Mais rápido</span><span class="dx-radio" aria-hidden="true"></span></span>
                  <span class="dx-format-name">Modelo pronto</span>
                  <span class="dx-format-desc">${tiersOf(state.selectedService)
                    ? `${tiersOf(state.selectedService).length} modelos (${tiersOf(state.selectedService).map(t => t.label.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' e $1')}) com estrutura já testada. Você personaliza cores, textos e imagens.`
                    : `${info.pronto}: estrutura já testada. Aplicamos sua marca, seus textos e suas imagens.`}</span>
                  <span class="dx-facts">
                    <span><small>Investimento</small><strong>${brl(prontoPrice)}</strong></span>
                    <span><small>Prazo</small><strong>${info.prazo}</strong></span>
                  </span>
                </label>
              </div>
              <div class="dx-format">
                <input type="radio" id="dx-format-sob" name="dx-format" value="sob-medida" ${state.objective === 'sob-medida' ? 'checked' : ''}>
                <label for="dx-format-sob" class="dx-format-label">
                  <span class="dx-format-top"><span class="dx-chip dx-chip--alt">Personalizado</span><span class="dx-radio" aria-hidden="true"></span></span>
                  <span class="dx-format-name">Sob medida</span>
                  <span class="dx-format-desc">Você escolhe seções e componentes, como vídeo, galeria e depoimentos. O layout é desenhado para o seu negócio.</span>
                  <span class="dx-facts">
                    <span><small>Investimento</small><strong>a partir de ${brl(sobPrice)}</strong></span>
                    <span><small>Prazo</small><strong>definido no escopo</strong></span>
                  </span>
                </label>
                ${project ? `
                  <p class="dx-format-status">${DX_ICON.check} Estrutura montada: ${project.sections.length} seções${project.components.length ? ` · ${project.components.length} componente${project.components.length > 1 ? 's' : ''}` : ''}</p>
                  <button type="button" class="dx-link-btn" data-dx-action="customize">Editar estrutura ${DX_ICON.right}</button>`
                : `<button type="button" class="dx-link-btn" data-dx-action="customize">Personalizar estrutura ${DX_ICON.right}</button>`}
              </div>
            </div>
          </fieldset>
        </div>
        ${renderDxFooter('Voltar', 'Continuar', !state.objective)}
      </div>`;

    const next = container.querySelector('[data-dx="next"]');
    const nextLabel = container.querySelector('[data-dx-next-label]');
    const syncNext = () => {
      next.disabled = !state.objective;
      nextLabel.textContent = state.objective === 'sob-medida' && !state.customProject ? 'Montar estrutura' : 'Continuar';
      // a etapa "Modelo" aparece ou some conforme o formato
      const steps = container.querySelector('.dx-steps');
      if (steps) steps.outerHTML = renderDxSteps('formato');
    };
    const openStudio = () => openCustomModelModal(selectedSvc, (summary) => {
      state.customProject = summary;
      state.objective = 'sob-medida';
      state.variant = null;
      if (summary.serviceId && summary.serviceId !== state.selectedService) state.selectedService = summary.serviceId;
      transitionTo(afterFormat(), 'next');
    }, { project: state.customProject });

    container.querySelectorAll('input[name="dx-format"]').forEach(input => {
      input.addEventListener('change', () => {
        state.objective = input.value;
        if (input.value === 'sob-medida') state.variant = null;
        syncNext();
        revealNextAction(next);
        if (typeof trackEvent === 'function') trackEvent('hero_model_selected', input.value);
      });
    });
    syncNext();
    // Os cards só marcam a escolha; quem avança é o botão "Continuar".
    container.querySelector('[data-dx-action="customize"]').addEventListener('click', () => {
      state.objective = 'sob-medida';
      state.variant = null;
      container.querySelector('#dx-format-sob').checked = true;
      syncNext();
      openStudio();
    });
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(renderStep3, 'back'));
    next.addEventListener('click', () => {
      if (!state.objective) return;
      if (state.objective === 'sob-medida' && !state.customProject) openStudio();
      else if (state.objective === 'modelos-prontos' && tiersOf(state.selectedService)) transitionTo(renderStepModelo, 'next');
      else transitionTo(afterFormat(), 'next');
    });
  }

  // ── ETAPA 4 (modelo pronto com níveis): qual modelo ──
  function renderStepModelo() {
    state.step = 4;
    const tiers = tiersOf(state.selectedService) || [];
    const prontoPrice = presencePrice(state.selectedService, 'modelos-prontos');
    const info = PRESENCE_MODELS[state.selectedService] || {};
    const card = (t) => {
      if (t.soon || !MODEL_PREVIEW_DATA[t.id]) return `
        <div class="dx-format dx-format--soon" aria-disabled="true">
          <div class="dx-format-label">
            <span class="dx-format-top"><span class="dx-chip dx-chip--alt">Em breve</span></span>
            <span class="dx-format-name">${esc(t.label)}</span>
            <span class="dx-format-desc">Novo modelo em preparação.</span>
          </div>
        </div>`;
      const d = MODEL_PREVIEW_DATA[t.id];
      return `
        <div class="dx-format">
          <input type="radio" id="dx-variant-${t.id}" name="dx-variant" value="${t.id}" ${state.variant === t.id ? 'checked' : ''}>
          <label for="dx-variant-${t.id}" class="dx-format-label">
            <span class="dx-format-top"><span class="dx-chip">${esc(t.label)}</span><span class="dx-radio" aria-hidden="true"></span></span>
            <span class="dx-format-name">${esc(d.name)}</span>
            <span class="dx-format-desc">${esc(d.description)}</span>
            <span class="dx-facts">
              <span><small>Investimento</small><strong>${brl(prontoPrice)}</strong></span>
              <span><small>Prazo</small><strong>${info.prazo || '—'}</strong></span>
            </span>
          </label>
          <div class="dx-format-actions">
            <button type="button" class="dx-link-btn" data-dx-personalize="${t.id}">Ver e personalizar ${DX_ICON.external}<span class="sr-only"> ${esc(d.name)} (nova aba)</span></button>
          </div>
        </div>`;
    };

    const done = () => state.personalization && state.personalization.variante === state.variant;
    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead('modelo', 'Qual modelo pronto combina com você?', 'Escolha o modelo. Você pode personalizar agora (cores, textos e imagens, com prévia na hora) ou continuar sem personalizar e fazer isso depois, na plataforma.')}
        <div class="dx-body">
          <fieldset class="dx-group">
            <legend class="sr-only">Modelo pronto</legend>
            <div class="dx-grid dx-grid--format dx-grid--tiers">${tiers.map(card).join('')}</div>
          </fieldset>
          <p class="dx-personalize-status" data-dx-pers-status role="status" hidden></p>
        </div>
        ${renderDxFooter('Voltar', 'Personalizar modelo', !state.variant)}
      </div>`;

    const next = container.querySelector('[data-dx="next"]');
    // Segunda saída: seguir sem personalizar (a solicitação continua normalmente).
    const skip = document.createElement('button');
    skip.type = 'button'; skip.className = 'dx-btn dx-btn--ghost dx-btn--skip'; skip.setAttribute('data-dx', 'skip');
    next.before(skip);
    const nextLabel = container.querySelector('[data-dx-next-label]');
    const status = container.querySelector('[data-dx-pers-status]');
    const say = (msg, ok) => { status.textContent = msg || ''; status.hidden = !msg; status.classList.toggle('is-ok', !!ok); };
    const sync = () => {
      next.disabled = !state.variant;
      skip.disabled = !state.variant;
      nextLabel.textContent = done() ? 'Continuar' : 'Personalizar modelo';
      skip.textContent = done() ? 'Editar personalização' : 'Continuar sem personalizar';
      if (done()) say('Personalização concluída. Você pode revisar o resumo ou trocar de modelo.', true);
      else if (!status.dataset.waiting) say('');
    };
    container.querySelectorAll('input[name="dx-variant"]').forEach(input => {
      input.addEventListener('change', () => {
        state.variant = input.value;
        delete status.dataset.waiting;
        sync();
        revealNextAction(next);
        if (typeof trackEvent === 'function') trackEvent('hero_variant_selected', input.value);
      });
    });
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(renderStep2, 'back'));
    const personalizar = () => {
      const opened = openModelEditor(state.variant, () => transitionTo(afterFormat(), 'next'));
      if (!opened) { say('O navegador bloqueou a nova aba. Permita pop-ups para este site e clique de novo.'); return; }
      status.dataset.waiting = '1';
      say('Personalize o modelo na nova aba. Quando terminar, clique em “Concluir personalização” (aba Concluir do painel) para voltar ao resumo.');
    };
    next.addEventListener('click', () => {
      if (!state.variant) return;
      if (done()) { transitionTo(afterFormat(), 'next'); return; }
      personalizar();
    });
    // "Ver e personalizar" no card: marca aquele modelo e abre o editor dele direto
    container.querySelectorAll('[data-dx-personalize]').forEach(btn => btn.addEventListener('click', () => {
      const input = container.querySelector(`input[name="dx-variant"][value="${btn.dataset.dxPersonalize}"]`);
      if (input && !input.checked) { input.checked = true; input.dispatchEvent(new Event('change')); }
      personalizar();
    }));
    skip.addEventListener('click', () => {
      if (!state.variant) return;
      if (done()) { personalizar(); return; }
      state.personalization = null; // segue sem personalização; dá para personalizar depois na plataforma
      if (typeof trackEvent === 'function') trackEvent('hero_model_skip_personalization', state.variant);
      transitionTo(afterFormat(), 'next');
    });
    sync();
  }

  // Abre o editor do modelo (mesma origem do site) e espera a personalização voltar.
  // Devolve false se o navegador bloqueou a aba.
  let editorListener = null;
  function openModelEditor(variant, onDone) {
    const d = MODEL_PREVIEW_DATA[variant];
    if (!d) return false;
    const root = cogitRoot();
    const base = (root + d.liveUrl).split('?')[0];
    const win = window.open(base + '?personalizar&origem=diagnostico', '_blank');
    if (!win) return false;
    if (editorListener) window.removeEventListener('message', editorListener);
    editorListener = (e) => {
      const m = e.data;
      if (e.origin !== location.origin || e.source !== win || !m || m.type !== 'cmk:diagnostico:personalizacao') return;
      if (m.variante !== variant || !m.dados || typeof m.dados !== 'object') return;
      state.personalization = { variante: variant, dados: m.dados, nome: String(m.nome || '').slice(0, 120) };
      state.variant = variant;
      try { win.postMessage({ type: 'cmk:diagnostico:recebida' }, location.origin); } catch (_) { /* aba fechada */ }
      window.removeEventListener('message', editorListener); editorListener = null;
      if (typeof trackEvent === 'function') trackEvent('hero_model_personalized', variant);
      try { window.focus(); } catch (_) { /* */ }
      onDone();
    };
    window.addEventListener('message', editorListener);
    return true;
  }

  // ── ETAPA 2: contexto (opcional), logo depois da solução ──
  function renderStep3() {
    state.step = 2;
    const tags = contextTagsFor(state.selectedService);
    state.contextTags = state.contextTags.filter(t => tags.includes(t));
    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead('contexto', 'Algo que devemos saber antes?', 'Opcional. Marque o que se aplica ou escreva com suas palavras.')}
        <div class="dx-body">
          <fieldset class="dx-group">
            <legend class="dx-group-label">Marque o que se aplica</legend>
            <div class="dx-tags">
              ${tags.map((tag, i) => `
                <label class="dx-tag"><input type="checkbox" value="${esc(tag)}" ${state.contextTags.includes(tag) ? 'checked' : ''}><span>${tag}</span></label>`).join('')}
            </div>
          </fieldset>
          <div class="dx-field">
            <label class="dx-group-label" for="hero-context-input">Conte com suas palavras</label>
            <textarea maxlength="2000" id="hero-context-input" class="dx-textarea" rows="4" aria-describedby="dx-context-count"
              placeholder="Ex.: Somos uma clínica com duas unidades e queremos receber agendamentos pelo site.">${esc(state.context)}</textarea>
            <p class="dx-count" id="dx-context-count"><span data-dx-count>${state.context.length}</span>/2000</p>
          </div>
        </div>
        ${renderDxFooter('Voltar', 'Continuar', false)}
      </div>`;

    const textarea = container.querySelector('#hero-context-input');
    const count = container.querySelector('[data-dx-count]');
    textarea.addEventListener('input', () => { state.context = textarea.value; count.textContent = String(textarea.value.length); });
    container.querySelectorAll('.dx-tag input').forEach(input => {
      input.addEventListener('change', () => {
        state.contextTags = [...container.querySelectorAll('.dx-tag input:checked')].map(i => i.value);
      });
    });
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(renderStep1, 'back'));
    container.querySelector('[data-dx="next"]').addEventListener('click', () => {
      state.context = textarea.value;
      transitionTo(renderStep2, 'next');
    });
  }


  // ── RESULTADO: resumo editável e próximos passos ──
  function renderResult() {
    state.step = 5;
    const selectedSvc = SERVICES_GRID.find(s => s.id === state.selectedService);
    const isPresence = PRESENCA_DIGITAL_IDS.includes(state.selectedService);
    const model = isPresence && ['modelos-prontos', 'sob-medida'].includes(state.objective) ? state.objective : '';
    const tiers = model === 'modelos-prontos' ? tiersOf(state.selectedService) : null;
    const variantTier = tiers && state.variant ? tiers.find(t => t.id === state.variant) : null;
    const variantData = variantTier && typeof MODEL_PREVIEW_DATA !== 'undefined' ? MODEL_PREVIEW_DATA[variantTier.id] : null;
    const objData = getObjectives(state.selectedService).find(o => o.id === state.objective);
    const solution = getSolution(state.selectedService, state.objective);
    const project = model === 'sob-medida' ? state.customProject : null;
    const svcName = selectedSvc ? selectedSvc.name : 'Solução digital';

    // id do diagnóstico -> id do catálogo (o mesmo usado no configurador e na plataforma)
    const catalogService = catalogIdOf(state.selectedService);
    const extras = hasComplementos() ? state.extras.filter(id => id !== catalogService && catalogSvc(id)) : [];
    const consultoria = consultoriaElegivel() && state.consultoria;

    const headline = model === 'modelos-prontos' ? (variantData ? variantData.name : PRESENCE_MODELS[state.selectedService].pronto)
      : project ? project.suggestion : solution.solution;
    const lede = model === 'modelos-prontos'
      ? 'Modelo pronto com a identidade da sua marca aplicada: estrutura, animações e responsividade já testadas.'
      : project ? `${project.sections.length} seções definidas por você${project.components.length ? `, com ${project.components.map(c => c.toLowerCase()).join(', ')}` : ''}.`
      : solution.desc;

    // Valor do serviço principal
    let mainValue = null, mainFrom = false, price, priceNote, prazo, recurring = null;
    const mainCatalog = catalogSvc(catalogService);
    if (model) {
      mainValue = presencePrice(state.selectedService, model);
      mainFrom = model === 'sob-medida';
      priceNote = model === 'sob-medida' ? 'O valor final é confirmado depois da validação do escopo.' : 'Pagamento único, com o site no seu domínio.';
      prazo = model === 'sob-medida' ? 'Definido na validação do escopo' : PRESENCE_MODELS[state.selectedService].prazo;
    } else if (state.selectedService === 'outro-svc') {
      mainValue = 0;
      priceNote = 'O diagnóstico inicial não tem custo. O investimento do projeto é definido depois da conversa.';
      prazo = 'Conversa agendada pela plataforma';
    } else if (state.selectedService === 'consultoria-svc') {
      mainValue = 0;
      priceNote = `Sem custo se o projeto for desenvolvido com a COGIT. Se você levar o planejamento para outra empresa, a consultoria custa ${brl(CONSULTORIA_PRECO)}.`;
      prazo = 'Definido na conversa inicial';
    } else if (mainCatalog && isRecurring(mainCatalog)) {
      recurring = extraPrice(catalogService).label;
      priceNote = mainCatalog.billing === 'monthly' ? 'Mensalidade fixa, com o 1º mês gratuito. Cancele quando quiser.' : 'Sem mensalidade: cada solicitação é orçada antes de começar.';
      prazo = mainCatalog.billing === 'monthly' ? 'Começa assim que aprovado' : 'Combinado em cada solicitação';
    } else {
      // SaaS e demais: o valor exibido no card (SERVICES_GRID) prevalece sobre o do catálogo
      const fromLabel = selectedSvc && /R\$ ([\d.]+)/.exec(selectedSvc.priceLabel);
      mainValue = fromLabel ? Number(fromLabel[1].replace(/\./g, '')) : (mainCatalog ? mainCatalog.price : null);
      mainFrom = !mainCatalog || mainCatalog.priceType !== 'fixed';
      priceNote = 'Estimativa inicial. A equipe confirma o valor depois de entender o escopo.';
      prazo = 'Definido na validação do escopo';
    }
    // Complementos: somam ao valor único; suporte (mensal ou por solicitação) aparece à parte
    const lines = [];
    if (mainValue != null && !recurring) lines.push({ name: svcName, label: mainValue === 0 ? 'Sem custo' : (mainFrom ? 'a partir de ' : '') + brl(mainValue) });
    let total = mainValue || 0, anyFrom = mainFrom;
    const recurringLines = recurring ? [{ name: svcName, label: recurring }] : [];
    extras.forEach(id => {
      const svc = catalogSvc(id), pr = extraPrice(id);
      if (isRecurring(svc)) { recurringLines.push({ name: svc.name, label: pr.label }); return; }
      lines.push({ name: svc.name, label: pr.label });
      total += Number(pr.value) || 0;
      if (pr.from) anyFrom = true;
    });
    const bundle = extras.length ? activeBundleFor([catalogService, ...extras]) : null;
    if (bundle) { total -= bundle.value; lines.push({ name: `Combinação ${bundle.bundle.name} (${bundle.bundle.discount}% de desconto)`, label: '− ' + brl(bundle.value), discount: true }); }
    if (consultoria) lines.push({ name: 'Consultoria e planejamento digital', label: 'Sem custo fechando com a COGIT' });
    if (recurring && !lines.length) price = recurring;
    else if (total <= 0) price = state.selectedService === 'consultoria-svc' ? 'Sem custo' : 'Gratuito';
    else price = (anyFrom ? 'a partir de ' : '') + brl(total);
    const oneOffExtras = extras.filter(id => !isRecurring(catalogSvc(id)));
    let priceLead = '';
    if (extras.length) {
      priceLead = recurring ? 'Valor único dos complementos; o suporte é cobrado à parte.' : 'Soma do serviço principal com os complementos.';
      if (anyFrom || recurring) priceNote = 'A equipe confirma os valores depois de entender o escopo.';
    }
    // O prazo do principal não cobre os complementos de projeto (automação, sistema...): eles entram no escopo.
    if (oneOffExtras.length && !recurring) prazo = `${prazo} (${svcName}); complementos definidos no escopo`;
    // Modelo com níveis: o site é personalizado no editor e a equipe revisa antes do orçamento.
    const needsPers = Boolean(variantData);
    const pers = needsPers && state.personalization && state.personalization.variante === variantTier.id ? state.personalization : null;
    if (needsPers) { priceLead = extras.length ? 'Soma do serviço principal com os complementos.' : ''; priceNote = 'Valor de referência do modelo. O orçamento final chega depois que revisarmos o seu site.'; }
    const steps = needsPers
      ? ['Envie para a CMKCOGIT e entre ou crie sua conta na plataforma.', 'Revisamos o seu site, fazemos os ajustes necessários e enviamos o orçamento.', 'Com o pagamento aprovado, publicamos e entregamos o site.']
      : model === 'modelos-prontos'
      ? ['Entre ou crie sua conta na plataforma. O diagnóstico vai junto.', 'A equipe da CMK analisa e aprova a solicitação.', 'Com a aprovação, o pagamento é liberado na plataforma e começamos o seu site.']
      : ['Entre ou crie sua conta na plataforma. O diagnóstico vai junto.', 'A equipe revisa o escopo e confirma valor e prazo.', 'Com tudo aprovado, o pagamento é liberado na própria plataforma.'];

    const previewId = variantData ? variantTier.id : state.selectedService;
    const previewData = variantData || (typeof MODEL_PREVIEW_DATA !== 'undefined' ? MODEL_PREVIEW_DATA[state.selectedService] : null);
    const formatLabel = model === 'modelos-prontos' ? 'Modelo pronto' : model === 'sob-medida' ? 'Sob medida' : (objData ? objData.label : '—');
    const contextText = (state.context || '').trim();

    container.innerHTML = `
      <div class="hero-step-wrapper dx-view dx-view--result">
        ${renderDxHead('resumo', 'Seu ponto de partida', 'Revise o que você escolheu. Tudo pode ser ajustado aqui ou com a equipe.')}
        <div class="dx-result">
          <section class="dx-summary" aria-labelledby="dx-rec-title">
            <p class="dx-kicker">Recomendação</p>
            <h3 class="dx-rec-title" id="dx-rec-title">${esc(headline)}</h3>
            <p class="dx-rec-lede">${esc(lede)}</p>

            <dl class="dx-choices">
              <div><dt>Solução</dt><dd>${svcName}</dd><dd><button type="button" class="dx-edit" data-dx-edit="1">Alterar<span class="sr-only"> solução</span></button></dd></div>
              <div><dt>${isPresence ? 'Formato' : 'Objetivo'}</dt><dd>${formatLabel}</dd><dd><button type="button" class="dx-edit" data-dx-edit="2">Alterar<span class="sr-only"> ${isPresence ? 'formato' : 'objetivo'}</span></button></dd></div>
              ${variantData ? `<div><dt>Modelo</dt><dd>${esc(variantTier.label)} · ${esc(variantData.name)}</dd><dd><button type="button" class="dx-edit" data-dx-edit="modelo">Alterar<span class="sr-only"> modelo</span></button></dd></div>
              <div><dt>Personalização</dt><dd>${pers ? 'Concluída' + (pers.nome ? ' · ' + esc(pers.nome) : '') : 'Sem personalização <small class="dx-note-inline">(você pode personalizar depois, na plataforma)</small>'}</dd><dd><button type="button" class="dx-edit" data-dx-edit="personalizar">${pers ? 'Editar' : 'Personalizar'}<span class="sr-only"> o site</span></button></dd></div>` : ''}
              ${hasComplementos() ? `<div><dt>Complementos</dt><dd>${extras.length ? extras.map(id => `<span>${esc(catalogSvc(id).name)}</span>`).join(', ') : 'Nenhum'}${consultoria ? `<br><small class="dx-note-inline">Com consultoria e planejamento digital</small>` : ''}</dd><dd><button type="button" class="dx-edit" data-dx-edit="complementos">${extras.length || consultoria ? 'Alterar' : 'Adicionar'}<span class="sr-only"> complementos</span></button></dd></div>` : ''}
            </dl>

            ${project ? `
              <div class="dx-structure">
                <div class="dx-structure-head"><p class="dx-kicker">Estrutura</p><button type="button" class="dx-edit" data-dx-edit="studio">Editar estrutura</button></div>
                <ol class="dx-structure-list">${project.sections.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
              </div>` : ''}
            ${model === 'modelos-prontos' && previewData ? `
              <div class="dx-model-links">
                <a class="dx-link-btn" href="${cogitRoot()}${previewData.liveUrl}" target="_blank" rel="noopener">Abrir a demonstração ${DX_ICON.external}<span class="sr-only"> (nova aba)</span></a>
                <button type="button" class="dx-link-btn" data-dx-action="preview">Ver o que está incluso</button>
              </div>` : ''}

            <div class="dx-notes">
              <div class="dx-structure-head"><p class="dx-kicker">Suas observações</p><button type="button" class="dx-edit" data-dx-edit="3">${contextText || state.contextTags.length ? 'Alterar' : 'Adicionar'}<span class="sr-only"> observações</span></button></div>
              ${state.contextTags.length ? `<ul class="dx-note-tags">${state.contextTags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
              ${contextText ? `<p class="dx-note-text">${esc(contextText)}</p>` : ''}
              ${!contextText && !state.contextTags.length ? '<p class="dx-note-empty">Nenhuma observação. Você pode contar mais à equipe na plataforma.</p>' : ''}
            </div>
          </section>

          <section class="dx-aside" aria-labelledby="dx-invest-title">
            <h3 class="dx-kicker" id="dx-invest-title">Investimento</h3>
            <p class="dx-price">${price}</p>
            ${lines.length > 1 || recurringLines.length && lines.length ? `<ul class="dx-breakdown">${lines.map(l => `<li${l.discount ? ' class="is-discount"' : ''}><span>${esc(l.name)}</span><b>${esc(l.label)}</b></li>`).join('')}</ul>` : ''}
            ${recurringLines.length && lines.length ? `<p class="dx-kicker dx-kicker--sub">Suporte</p><ul class="dx-breakdown">${recurringLines.map(l => `<li><span>${esc(l.name)}</span><b>${esc(l.label)}</b></li>`).join('')}</ul>` : ''}
            <p class="dx-price-note">${priceLead ? `<span>${priceLead}</span> ` : ''}<span>${priceNote}</span></p>
            <dl class="dx-aside-facts"><div><dt>Prazo</dt><dd>${prazo}</dd></div></dl>
            <h4 class="dx-kicker">Próximos passos</h4>
            <ol class="dx-next">${steps.map(s => `<li>${s}</li>`).join('')}</ol>
            <button type="button" class="dx-btn dx-btn--primary dx-btn--block" id="hero-btn-plataforma"><span>${!needsPers ? 'Continuar na plataforma' : 'Concluir e enviar para a CMKCOGIT'}</span>${DX_ICON.right}</button>
            <p class="dx-personalize-status" data-dx-send-status role="status" hidden></p>
            <p class="dx-reassure">Você revisa tudo antes de qualquer pagamento.</p>
            <div class="dx-aside-links">
              <button type="button" id="hero-btn-restart">${DX_ICON.restart} Recomeçar</button>
            </div>
          </section>
        </div>
        ${renderDxFooter('Voltar', '')}
      </div>`;

    // Voltar no resumo: Complementos; sem eles, etapa Modelo quando há modelo escolhido; senão, Formato / Objetivo
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(hasComplementos() ? renderStepComplementos : variantData ? renderStepModelo : renderStep2, 'back'));

    container.querySelectorAll('[data-dx-edit]').forEach(btn => btn.addEventListener('click', () => {
      const target = btn.dataset.dxEdit;
      if (target === 'studio') {
        openCustomModelModal(selectedSvc, (summary) => {
          state.customProject = summary;
          if (summary.serviceId) state.selectedService = summary.serviceId;
          renderResult();
          CogitUI.focusHeading(container);
        }, { project: state.customProject, startAt: 'structure' });
        return;
      }
      if (target === 'personalizar') {
        if (!openModelEditor(variantTier.id, () => { renderResult(); CogitUI.focusHeading(container); })) sendStatus('O navegador bloqueou a nova aba. Permita pop-ups para este site e clique de novo.');
        else sendStatus('Personalize na nova aba e clique em “Concluir personalização” para voltar.');
        return;
      }
      transitionTo({ 1: renderStep1, 2: renderStep2, 3: renderStep3, modelo: renderStepModelo, complementos: renderStepComplementos }[target], 'back');
    }));
    const previewBtn = container.querySelector('[data-dx-action="preview"]');
    if (previewBtn) previewBtn.addEventListener('click', () => (variantData ? openModelPreviewModal(previewId) : showModelPreview(selectedSvc)));

    const platformBtn = document.getElementById('hero-btn-plataforma');
    const sendStatusEl = container.querySelector('[data-dx-send-status]');
    function sendStatus(msg, ok) { sendStatusEl.textContent = msg || ''; sendStatusEl.hidden = !msg; sendStatusEl.classList.toggle('is-ok', !!ok); }
    platformBtn.addEventListener('click', () => {
      if (typeof CogitHandoff === 'undefined') return;
      platformBtn.disabled = true;
      if (typeof trackEvent === 'function') trackEvent('hero_diagnostic_platform', { service: state.selectedService, challenge: state.challenge, objective: state.objective });
      const notes = [
        project ? `Estrutura sob medida (${project.suggestion}): ${project.sections.join(' > ')}` : '',
        project && project.components.length ? `Componentes: ${project.components.join(', ')}` : '',
        state.contextTags.length ? `Marcado no diagnóstico: ${state.contextTags.join('; ')}` : '',
        consultoria ? `Consultoria e planejamento digital solicitada para: ${svcName}. Sem custo se o projeto for fechado com a COGIT; ${brl(CONSULTORIA_PRECO)} se for desenvolvido com outra empresa.` : '',
        state.selectedService === 'consultoria-svc' ? `Consultoria e planejamento digital (${objData ? objData.label : 'objetivo não informado'}). Sem custo se o projeto for fechado com a COGIT; ${brl(CONSULTORIA_PRECO)} se for desenvolvido com outra empresa.` : '',
        bundle ? `Combinação ${bundle.bundle.name}: ${bundle.bundle.discount}% de desconto (− ${brl(bundle.value)}).` : '',
        contextText
      ].filter(Boolean).join('\n');
      const cfg = {
        origem: 'diagnostico',
        servicos: [{ id: catalogService, modelo: model || null, plano: null, nome: svcName, variante: variantData ? variantTier.id : null },
          ...extras.map(id => ({ id, modelo: PRESENCA_DIGITAL_IDS.includes(id) ? 'modelos-prontos' : null, plano: null, nome: catalogSvc(id).name, variante: null }))],
        complementos: [],
        notas: notes,
        diagnostico: { objetivo: project ? `Sob medida · ${project.objectiveTitle}` : variantData ? `${formatLabel} · ${variantTier.label}` : formatLabel, direcao: headline },
        estimativa: price
      };
      if (!pers) { CogitHandoff.irParaPlataforma(cfg); return; }
      CogitHandoff.enviarComPersonalizacao(cfg, pers.dados, (estado, msg) => {
        sendStatus(msg, estado === 'recebido');
        if (estado !== 'enviando') platformBtn.disabled = false;
      });
    });

    document.getElementById('hero-btn-restart').addEventListener('click', () => {
      Object.assign(state, { step: 0, selectedService: null, challenge: null, objective: null, context: '', contextTags: [], customProject: null, variant: null, personalization: null, extras: [], picked: [], consultoria: false });
      transitionTo(renderStep0, 'back');
    });
  }

  // Expose global starter
  window.heroStartDiagnosis = function () {
    if (state.step === 0) renderStep1();
    updateDiagnosticMode();
    focusDiagnosticViewport();
  };

  // Initial render. Na página "Monte sua solução" o fluxo começa direto (sem o convite) e,
  // se o link trouxe um serviço (?services=...&model=...), ele já vem escolhido.
  if (naPagina) {
    const svc = rota.servico && SERVICES_GRID.find(s => s.id === rota.servico);
    if (svc) {
      state.selectedService = svc.id;
      state.challenge = svc.challenge;
      state.extras = (rota.complementos || []).filter(id => catalogSvc(id) && id !== catalogIdOf(svc.id));
      if (rota.modelo && PRESENCA_DIGITAL_IDS.includes(svc.id)) state.objective = rota.modelo;
      // ?variant=landing-page-basica (página dos 3 modelos de landing page): abre já no modelo escolhido
      const tiers = state.objective === 'modelos-prontos' ? tiersOf(svc.id) : null;
      if (tiers && rota.variante && tiers.some(t => t.id === rota.variante)) { state.variant = rota.variante; renderStepModelo(); }
      else renderStep3();
    } else {
      renderStep1();
    }
  } else {
    renderStep0();
  }
  updateDiagnosticMode();
}

// ── Dados dos Modelos Prontos por Serviço ──
// Endereços das demonstrações: enquanto os subdomínios não existem, as demos são servidas
// a partir de /templates/ deste próprio site. Para usar subdomínios, troque liveUrl por
// 'https://template-<nome>.cmkcogit.com.br/' (use hífen; sublinhado não é aceito em certificados).
const MODEL_PREVIEW_DATA = {
  'site-institucional': {
    name: 'Site Institucional Essencial',
    tagLabel: 'SITE',
    category: 'Site institucional',
    description: 'Estrutura fixa de 4 páginas: Início (serviços, diferenciais, casos e depoimentos), Sobre, Serviços e Contato com pedido de proposta.',
    audience: ['Pequenas e médias empresas', 'Escritórios e consultorias', 'Clínicas e prestadores de serviço', 'Negócios locais'],
    features: ['4 páginas: Início, Sobre, Serviços e Contato', 'Até 6 serviços em cartões e dúvidas frequentes', 'Formulário de proposta com validação e LGPD', 'SEO técnico e dados estruturados', 'Responsivo e rápido no celular', 'Seu logotipo, cores, fotos e textos na estrutura pronta'],
    previewImg: 'assets/videos/templates/institucional-poster.webp',
    video: 'assets/videos/templates/institucional.mp4',
    liveUrl: 'templates/institucional/'
  },
  'landing-page': {
    name: 'Landing Page Essencial',
    tagLabel: 'LANDING PAGE',
    category: 'Landing page',
    description: 'Página única em 5 seções fixas: chamada principal, benefícios, como funciona, depoimentos e contato com formulário e dúvidas.',
    audience: ['Campanhas e anúncios', 'Lançamento de serviços', 'Captação de leads', 'Produtos digitais'],
    features: ['5 seções na ordem certa para converter', 'Botão fixo no celular até o formulário', 'Formulário com validação e LGPD', 'SEO técnico e dados estruturados', 'Carregamento leve, sem bibliotecas', 'Seu logotipo, cores, fotos e textos na estrutura pronta'],
    previewImg: 'assets/videos/templates/landing-poster.webp',
    video: 'assets/videos/templates/landing.mp4',
    liveUrl: 'templates/landing/'
  },
  'portfolio': {
    name: 'Portfólio Profissional',
    tagLabel: 'PORTFÓLIO',
    category: 'Portfólio',
    description: 'Página única com estrutura fixa: apresentação, grade com até 6 trabalhos, sobre, até 3 serviços, depoimentos e contato.',
    audience: ['Designers e fotógrafos', 'Arquitetos e engenheiros', 'Consultores e especialistas', 'Estúdios e freelancers'],
    features: ['Grade com até 6 trabalhos: foto, categoria e resumo', 'Sobre com foto e números', 'Contato por WhatsApp, e-mail e formulário', 'SEO técnico e dados estruturados', 'Imagens otimizadas em AVIF e WebP', 'Seu logotipo, cores, fotos e textos na estrutura pronta'],
    previewImg: 'assets/videos/templates/portfolio-poster.webp',
    video: 'assets/videos/templates/portfolio.mp4',
    liveUrl: 'templates/portfolio/'
  },
  'landing-page-profissional': {
    name: 'Landing Page Profissional',
    tagLabel: 'LANDING PAGE',
    category: 'Landing page · Intermediário',
    description: 'Página única completa com cabeçalho, banner principal, sobre, 3 serviços com foto, diferenciais, depoimentos, chamada final e rodapé. Você mesmo personaliza cores, imagens e textos com prévia em tempo real.',
    audience: ['Profissionais liberais', 'Clínicas e consultórios', 'Prestadores de serviço', 'Pequenas empresas'],
    features: ['8 seções, com opção de ocultar as que não usar', '8 paletas prontas ou suas cores em HEX', '6 espaços de imagem com upload e enquadramento', 'Todos os textos, botões e links editáveis', 'Responsivo em computador, tablet e celular', 'Exporta o site pronto ou envia para publicarmos'],
    previewImg: 'assets/videos/templates/landing-profissional-poster.webp',
    liveUrl: 'templates/landing-profissional/?personalizar'
  },
  'landing-page-basica': {
    name: 'Landing Page Básica',
    tagLabel: 'LANDING PAGE',
    category: 'Landing page · Básico',
    description: 'Página única com início, serviços, sobre nós, diferenciais, depoimentos e portfólio, contato com formulário e rodapé. Você mesmo personaliza cores, imagens e textos com prévia em tempo real.',
    audience: ['Prestadores de serviço', 'Negócios locais', 'Autônomos e MEIs', 'Primeiro site da empresa'],
    features: ['7 seções, com opção de ocultar as que não usar', 'Formulário de contato com validação e LGPD', '4 espaços de imagem com upload e enquadramento', '8 paletas prontas ou suas cores em HEX', 'Todos os textos, botões e links editáveis', 'Responsivo em computador, tablet e celular'],
    previewImg: 'assets/videos/templates/landing-basica-poster.webp',
    liveUrl: 'templates/landing-basica/?personalizar'
  },
  'landing-page-formal': {
    name: 'Landing Page Corporativa',
    tagLabel: 'LANDING PAGE',
    category: 'Landing page · Formal',
    description: 'Página institucional completa, de visual sóbrio: apresentação, sobre a empresa (missão, visão e valores), serviços e soluções, diferenciais, metodologia, projetos, indicadores, depoimentos e parceiros, perguntas frequentes e contato. Você mesmo personaliza cores, imagens e textos com prévia em tempo real.',
    audience: ['Empresas de engenharia e indústria', 'Consultorias e escritórios', 'Empresas B2B', 'Prestadores de serviço técnico'],
    features: ['12 seções, com opção de ocultar as que não usar', 'Metodologia em 6 etapas e projetos com resultados', 'Indicadores, depoimentos com nota e logotipos de parceiros', '9 espaços de imagem com upload e enquadramento', 'Formulário com LGPD, política de privacidade e termos de uso', 'Responsivo em computador, tablet e celular'],
    previewImg: 'assets/videos/templates/landing-formal-poster.webp',
    liveUrl: 'templates/landing-formal/?personalizar'
  }
};

// Níveis de modelo pronto por serviço (básico, intermediário e formal), mostrados como
// seletor no topo do modal de prévia. Abrir a prévia pelo id do serviço mostra o primeiro nível.
// Serviço sem entrada aqui segue com um único modelo.
const MODEL_TIERS = {
  'landing-page': [
    { id: 'landing-page-basica', label: 'Básico' },
    { id: 'landing-page-profissional', label: 'Intermediário' },
    { id: 'landing-page-formal', label: 'Formal' }
  ]
};
function modelTiersFor(id) {
  return Object.values(MODEL_TIERS).find((list) => list.some((t) => t.id === id)) || null;
}

// ── Modal de Informações do Modelo (Premium) ──
function showModelPreview(selectedSvc, options) {
  const modelId = (selectedSvc && typeof selectedSvc === 'object' && selectedSvc.id) ? selectedSvc.id : (typeof selectedSvc === 'string' ? selectedSvc : 'modelo');
  const title = (selectedSvc && typeof selectedSvc === 'object' && selectedSvc.name) ? selectedSvc.name : (typeof selectedSvc === 'string' && selectedSvc !== 'modelo' ? selectedSvc : 'Landing Page');
  openModelPreviewModal(modelId, title, options);
}

// options.onSelect: chamado por "Escolher este modelo". Sem ele, o botão não aparece
// (a prévia é só informativa, por exemplo quando o modelo já foi escolhido).
function openModelPreviewModal(modelId, title, options = {}) {
  const onSelect = typeof options.onSelect === 'function' ? options.onSelect : null;
  let finalId = modelId;
  let finalTitle = title;
  if (typeof modelId === 'object' && modelId !== null) {
    finalId = modelId.id || 'modelo';
    finalTitle = modelId.name || title || 'Landing Page';
  } else if (!finalTitle) {
    finalTitle = (typeof modelId === 'string' && modelId !== 'modelo') ? modelId : 'Landing Page';
  }

  // Resolve data for the service
  if (!MODEL_PREVIEW_DATA[finalId]) finalId = 'landing-page';
  if (MODEL_TIERS[finalId]) finalId = MODEL_TIERS[finalId][0].id; // serviço com níveis: abre no primeiro
  const data = MODEL_PREVIEW_DATA[finalId];

  const existing = document.getElementById('hero-model-preview-modal');
  if (existing) existing.remove();

  const returnFocus = options.returnFocus || document.activeElement;

  const tiers = modelTiersFor(finalId);
  const tiersNav = tiers ? `<div class="hero-modal-tiers" role="group" aria-label="Nível do modelo">${tiers.map((t) => t.soon
    ? `<button type="button" class="hero-modal-tier" disabled>${t.label}<small>Em breve</small></button>`
    : `<button type="button" class="hero-modal-tier" data-tier="${t.id}" aria-pressed="${t.id === finalId}">${t.label}</button>`).join('')}</div>` : '';

  // Build audience pills
  const audiencePills = data.audience.map(a => `<li class="hero-modal-audience-pill">${a}</li>`).join('');

  // Build features list
  const checkSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const featuresList = data.features.map(f => `<li>${checkSvg} ${f}</li>`).join('');

  // Caminhos relativos à raiz do site, inclusive quando o modal abre em /solucoes/.
  const rootPrefix = cogitRoot();
  const asset = (p) => (p && !/^https?:/.test(p) ? rootPrefix + p : p);
  const liveHref = asset(data.liveUrl);

  // Live URL button (only if URL exists)
  const liveUrlBtn = liveHref
    ? `<a href="${liveHref}" target="_blank" rel="noopener" class="hero-modal-live-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Ver demonstração completa
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
        <span class="sr-only">(abre em nova aba)</span>
      </a>`
    : `<span class="hero-modal-live-link" style="opacity:0.5; cursor:default; pointer-events:none;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Demonstração em breve
      </span>`;

  // Vídeo de apresentação: sem som, em loop; não inicia sozinho para quem prefere menos movimento.
  const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const previewMedia = data.video
    ? `<video class="hero-modal-preview-img hero-modal-preview-video" src="${asset(data.video)}" poster="${asset(data.previewImg)}" muted loop playsinline controls preload="metadata" ${autoplay ? 'autoplay' : ''} aria-label="Vídeo de apresentação do modelo ${data.name}"></video>`
    : `<img src="${asset(data.previewImg)}" alt="Prévia do modelo ${data.name}" class="hero-modal-preview-img" loading="lazy" />`;

  const modalHTML = `
    <dialog class="hero-model-dialog" id="hero-model-preview-modal" aria-labelledby="hero-model-preview-title">
      <div class="hero-modal-content">
        <div class="hero-modal-header">
          <div class="hero-modal-header-left">
            <span class="hero-modal-tag">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              ${data.tagLabel}
            </span>
            <h3 class="hero-modal-title" id="hero-model-preview-title">${data.name}</h3>
          </div>
          <button type="button" class="hero-modal-close" id="hero-modal-close" aria-label="Fechar informações do modelo" autofocus>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        ${tiersNav}

        <div class="hero-modal-body">
          <div class="hero-modal-info">
            <p class="hero-modal-description">${data.description}</p>

            <div class="hero-modal-audience">
              <h4 class="hero-modal-audience-title">Indicado para</h4>
              <ul class="hero-modal-audience-list">${audiencePills}</ul>
            </div>

            <div class="hero-modal-features">
              <h4 class="hero-modal-features-title">O que está incluso</h4>
              <ul class="hero-modal-features-list">${featuresList}</ul>
            </div>
          </div>

          <div class="hero-modal-preview">
            <div class="hero-modal-preview-container">
              ${previewMedia}
              <span class="hero-modal-preview-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                ${data.video ? 'Vídeo de apresentação · ' + data.category : 'Prévia visual'}
              </span>
            </div>
            ${liveUrlBtn}
          </div>
        </div>

        <div class="hero-modal-footer">
          <button type="button" class="hero-modal-btn-back" id="hero-modal-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Voltar
          </button>
          ${onSelect ? `<button type="button" class="hero-modal-btn-select" id="hero-modal-select">
            Escolher este modelo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>` : ''}
        </div>
      </div>
    </dialog>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('hero-model-preview-modal');
  const closeBtn = document.getElementById('hero-modal-close');
  const selectBtn = document.getElementById('hero-modal-select');
  const backBtn = document.getElementById('hero-modal-back');

  lockModalScroll();
  modal.showModal();
  const closeModal = () => modal.close();
  modal.addEventListener('close', () => {
    unlockModalScroll();
    modal.remove();
    returnFocus?.focus({ preventScroll: true });
  });

  closeBtn.addEventListener('click', closeModal);
  if (backBtn) backBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  modal.querySelectorAll('[data-tier]').forEach((btn) => btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-pressed') === 'true') return;
    // Troca de nível sem fechar: monta o mesmo modal com o outro modelo e mantém o foco no seletor.
    const tierId = btn.dataset.tier;
    modal.addEventListener('close', () => {
      openModelPreviewModal(tierId, undefined, Object.assign({}, options, { returnFocus }));
      document.querySelector('#hero-model-preview-modal [data-tier="' + tierId + '"]')?.focus();
    }, { once: true });
    closeModal();
  }));

  if (selectBtn) selectBtn.addEventListener('click', () => {
    closeModal();
    onSelect(finalId); // id do modelo exibido (com níveis, o nível escolhido no seletor)
  });

  if (typeof trackEvent === 'function') trackEvent('model_preview_opened', finalId);
}

window.showModelPreview = showModelPreview;
window.openModelPreviewModal = openModelPreviewModal;

// ═══════════════════════════════════════════════════════════
// Modal "Modelo Sob Medida" — Diagnóstico Visual Guiado
// ═══════════════════════════════════════════════════════════
// Modal "Modelo Sob Medida" — Diagnóstico Visual & Personalização Inteligente
// Baseado fielmente no design clean e elegante da versão anterior
// ═══════════════════════════════════════════════════════════

const CUSTOM_ICONS = {
  vender: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/><path d="M2.5 3h2.7l2.6 12.6a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21.7 8H6.2"/></svg>',
  empresa: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/><path d="M9 21v-4h6v4"/></svg>',
  portfolio: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5-4 4-2-2-5 5"/></svg>',
  visual: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
  outro: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  up: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
  down: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  sparkles: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/><circle cx="12" cy="12" r="3"/></svg>'
};

// serviceId: serviço de presença digital equivalente (usado no resumo e no envio à plataforma).
const CUSTOM_OBJECTIVES = [
  { id: 'vender', title: 'Vender produtos ou serviços', desc: 'Apresentar uma oferta e transformar visitas em contatos ou vendas.', suggestion: 'Landing Page de Conversão', serviceId: 'landing-page' },
  { id: 'empresa', title: 'Apresentar minha empresa', desc: 'Mostrar marca, serviços, diferenciais e canais de contato.', suggestion: 'Site Institucional', serviceId: 'site-institucional' },
  { id: 'portfolio', title: 'Mostrar meus trabalhos', desc: 'Apresentar projetos, fotos, cases e resultados.', suggestion: 'Portfólio Profissional', serviceId: 'portfolio' },
  { id: 'visual', title: 'Trabalhar com imagens e vídeos', desc: 'Uma experiência focada em conteúdo visual e multimídia.', suggestion: 'Experiência Visual', serviceId: null },
  { id: 'outro', title: 'Outro objetivo', desc: 'Tenho uma ideia específica e quero explicar minha necessidade.', suggestion: 'Estrutura Sob Medida', serviceId: null }
];

// kind: desenho usado na pré-visualização da estrutura.
const CUSTOM_STRUCTURES = {
  vender: { name: 'Landing Page de Conversão', sections: [
    { id: 'hero', name: 'Abertura com oferta e CTA', type: 'mandatory', kind: 'hero' },
    { id: 'oferta', name: 'Apresentação da oferta', type: 'recommended', kind: 'split' },
    { id: 'beneficios', name: 'Benefícios', type: 'recommended', kind: 'cards' },
    { id: 'depoimentos', name: 'Depoimentos', type: 'recommended', kind: 'quote', component: 'depoimentos' },
    { id: 'faq', name: 'Perguntas frequentes', type: 'recommended', kind: 'list', component: 'faq' },
    { id: 'cta', name: 'Contato, WhatsApp e formulário', type: 'mandatory', kind: 'form' }
  ] },
  empresa: { name: 'Site Institucional', sections: [
    { id: 'hero', name: 'Abertura institucional', type: 'mandatory', kind: 'hero' },
    { id: 'sobre', name: 'Sobre a empresa', type: 'recommended', kind: 'split' },
    { id: 'servicos', name: 'Serviços', type: 'recommended', kind: 'cards' },
    { id: 'diferenciais', name: 'Diferenciais', type: 'recommended', kind: 'list' },
    { id: 'cta', name: 'Contato e localização', type: 'mandatory', kind: 'form' }
  ] },
  portfolio: { name: 'Portfólio Profissional', sections: [
    { id: 'hero', name: 'Apresentação pessoal', type: 'mandatory', kind: 'hero' },
    { id: 'projetos', name: 'Projetos em destaque', type: 'recommended', kind: 'grid' },
    { id: 'sobre', name: 'Sobre e competências', type: 'recommended', kind: 'split' },
    { id: 'servicos', name: 'Serviços', type: 'recommended', kind: 'cards' },
    { id: 'cta', name: 'Contato direto', type: 'mandatory', kind: 'form' }
  ] },
  visual: { name: 'Experiência Visual', sections: [
    { id: 'hero', name: 'Abertura em tela cheia', type: 'mandatory', kind: 'media' },
    { id: 'galeria', name: 'Galeria principal', type: 'recommended', kind: 'grid', component: 'galeria' },
    { id: 'sobre', name: 'Sobre o trabalho', type: 'recommended', kind: 'split' },
    { id: 'cta', name: 'Contato e redes', type: 'mandatory', kind: 'form' }
  ] },
  outro: { name: 'Estrutura Sob Medida', sections: [
    { id: 'hero', name: 'Abertura', type: 'mandatory', kind: 'hero' },
    { id: 'apresentacao', name: 'Apresentação da solução', type: 'recommended', kind: 'split' },
    { id: 'destaques', name: 'Destaques', type: 'recommended', kind: 'cards' },
    { id: 'cta', name: 'Contato', type: 'mandatory', kind: 'form' }
  ] }
};

// Componentes que o cliente pode acrescentar. Sem preço próprio: entram na validação do escopo.
// Para cobrar algum, preencha `price` (o valor aparece no card e soma na estimativa).
const CUSTOM_COMPONENTS = [
  { id: 'video', label: 'Vídeo em destaque', desc: 'Vídeo institucional ou de produto', kind: 'media', price: 0, icon: '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>' },
  { id: 'imagem', label: 'Banner de imagem', desc: 'Imagem grande entre seções', kind: 'image', price: 0, icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/>' },
  { id: 'galeria', label: 'Galeria de imagens', desc: 'Grade de fotos com ampliação', kind: 'grid', price: 0, icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
  { id: 'carrossel', label: 'Carrossel', desc: 'Projetos ou fotos em sequência', kind: 'carousel', price: 0, icon: '<rect x="6" y="5" width="12" height="14" rx="1.5"/><path d="M2 8v8M22 8v8"/>' },
  { id: 'depoimentos', label: 'Depoimentos', desc: 'Relatos de clientes', kind: 'quote', price: 0, icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
  { id: 'cases', label: 'Cases', desc: 'Projetos com contexto e resultado', kind: 'split', price: 0, icon: '<path d="M4 4h16v16H4z"/><path d="M4 10h16M10 10v10"/>' },
  { id: 'numeros', label: 'Números e resultados', desc: 'Indicadores com fonte real', kind: 'stats', price: 0, icon: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' },
  { id: 'processo', label: 'Como funciona', desc: 'Etapas do atendimento', kind: 'steps', price: 0, icon: '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h3M14 12h3"/>' },
  { id: 'precos', label: 'Preços', desc: 'Tabela comparativa de preços', kind: 'cards', price: 0, icon: '<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
  { id: 'antesdepois', label: 'Antes e depois', desc: 'Comparação com controle deslizante', kind: 'split', price: 0, icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>' },
  { id: 'equipe', label: 'Equipe', desc: 'Pessoas, cargos e fotos', kind: 'people', price: 0, icon: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 5 5"/>' },
  { id: 'parceiros', label: 'Clientes e parceiros', desc: 'Faixa de logotipos', kind: 'logos', price: 0, icon: '<rect x="2" y="9" width="5" height="6" rx="1"/><rect x="9.5" y="9" width="5" height="6" rx="1"/><rect x="17" y="9" width="5" height="6" rx="1"/>' },
  { id: 'faq', label: 'Perguntas frequentes', desc: 'Respostas que tiram dúvidas', kind: 'list', price: 0, icon: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>' },
  { id: 'mapa', label: 'Mapa e endereço', desc: 'Localização e horários', kind: 'map', price: 0, icon: '<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>' },
  { id: 'agenda', label: 'Agendamento online', desc: 'Link ou integração de agenda', kind: 'form', price: 0, icon: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>' },
  { id: 'blog', label: 'Blog ou artigos', desc: 'Lista de conteúdos recentes', kind: 'cards', price: 0, icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/>' },
  { id: 'instagram', label: 'Feed do Instagram', desc: 'Últimas publicações', kind: 'grid', price: 0, icon: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>' },
  { id: 'downloads', label: 'Materiais para download', desc: 'PDF, catálogo ou apresentação', kind: 'list', price: 0, icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' },
  { id: 'formulario', label: 'Formulário extra', desc: 'Orçamento, inscrição ou briefing', kind: 'form', price: 0, icon: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>' }
];
const CUSTOM_COMPONENTS_BY_OBJECTIVE = {
  vender: ['video', 'imagem', 'antesdepois', 'precos', 'numeros', 'processo', 'parceiros', 'galeria', 'depoimentos', 'faq', 'agenda', 'formulario'],
  empresa: ['imagem', 'video', 'equipe', 'processo', 'cases', 'numeros', 'parceiros', 'depoimentos', 'faq', 'mapa', 'blog', 'agenda'],
  portfolio: ['galeria', 'carrossel', 'video', 'cases', 'processo', 'depoimentos', 'parceiros', 'instagram', 'downloads', 'formulario'],
  visual: ['video', 'galeria', 'carrossel', 'imagem', 'instagram', 'depoimentos', 'downloads', 'formulario'],
  outro: CUSTOM_COMPONENTS.map(c => c.id)
};

// Motor de análise léxica interna (sem IA externa)
function analyzeCustomKeywords(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const clean = rawText.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const rules = [
    { id: 'vender', suggestion: 'Landing Page de Conversão', words: ['vender', 'venda', 'vendas', 'produto', 'produtos', 'cliente', 'clientes', 'compra', 'compras', 'orcamento', 'orcamentos', 'oferta', 'ofertas', 'conversao', 'conversoes', 'loja', 'lead', 'leads', 'checkout', 'preco', 'comercio', 'trafego', 'anuncio', 'campanha', 'pagamento'] },
    { id: 'empresa', suggestion: 'Site Institucional', words: ['empresa', 'empresas', 'institucional', 'marca', 'marcas', 'clinica', 'consultorio', 'escritorio', 'consultoria', 'negocio', 'corporativo', 'servico', 'servicos', 'equipe', 'instituicao', 'medica', 'odontologia', 'advocacia', 'contabilidade', 'credibilidade'] },
    { id: 'portfolio', suggestion: 'Portfólio Profissional', words: ['foto', 'fotos', 'fotografia', 'fotografo', 'fotografa', 'projeto', 'projetos', 'trabalho', 'trabalhos', 'portfolio', 'cases', 'case', 'design', 'designer', 'arquiteto', 'arquitetura', 'obras', 'artista', 'artes', 'ensaios', 'galeria pessoal', 'curriculo'] },
    { id: 'visual', suggestion: 'Experiência Visual', words: ['video', 'videos', 'imagem', 'imagens', 'galeria', 'filme', 'filmes', 'multimidia', 'visual', 'audiovisual', 'cinema', 'motion', 'animacao', 'teaser', 'conteudo visual', 'gravacoes', 'videomaker'] }
  ];

  let bestMatch = null;
  let maxScore = 0;
  rules.forEach(rule => {
    const matched = rule.words.filter(w => clean.includes(w));
    if (matched.length > maxScore) {
      maxScore = matched.length;
      bestMatch = { id: rule.id, suggestion: rule.suggestion, matched };
    }
  });

  if (maxScore > 0) return bestMatch;
  if (clean.trim().length > 6) return { id: 'outro', suggestion: 'Estrutura Sob Medida', isUnclear: true };
  return null;
}

/*
  Estúdio sob medida: 1) objetivo  2) estrutura (seções + componentes) com pré-visualização.
  openCustomModelModal(servico, aoConcluir, { project, startAt: 'structure' })
  - servico: objeto do diagnóstico, id ('portfolio') ou vazio;
  - aoConcluir(resumo): recebe { objective, objectiveTitle, suggestion, serviceId, sections[], components[] };
    sem callback, envia para a plataforma (ou para o contato, se o handoff não estiver na página).
*/
function openCustomModelModal(selectedSvc, onFinish, options = {}) {
  const existing = document.getElementById('custom-model-dialog');
  if (existing) existing.remove();

  const returnFocus = document.activeElement;
  const esc = (v) => CogitUI.escapeHtml(v);
  const arrowRight = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  const arrowLeft = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
  const compIcon = (c) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${c.icon}</svg>`;

  const svcId = selectedSvc && typeof selectedSvc === 'object' ? selectedSvc.id : (selectedSvc ? String(selectedSvc) : '');
  const objectiveFromService = { 'site-institucional': 'empresa', portfolio: 'portfolio', 'landing-page': 'vender' }[svcId] || 'vender';
  const prior = options.project || null;

  const modalState = {
    step: options.startAt === 'structure' && prior ? 2 : 1,
    objective: prior ? prior.objective : objectiveFromService,
    customText: '',
    blocks: [],
    components: new Set()
  };

  function initBlocks(objId) {
    const base = CUSTOM_STRUCTURES[objId] || CUSTOM_STRUCTURES.outro;
    modalState.blocks = base.sections.map(s => ({ ...s }));
    modalState.components = new Set(base.sections.filter(s => s.component).map(s => s.component));
  }
  // Reabre com a estrutura montada antes, se houver.
  if (prior && prior.blocks) {
    modalState.blocks = prior.blocks.map(b => ({ ...b }));
    modalState.components = new Set(prior.blocks.filter(b => b.component).map(b => b.component));
  } else {
    initBlocks(modalState.objective);
  }
  modalState.blockObjective = modalState.objective;

  const currentObjective = () => CUSTOM_OBJECTIVES.find(o => o.id === modalState.objective) || CUSTOM_OBJECTIVES[4];
  const basePrice = () => {
    const svc = currentObjective().serviceId || svcId || 'landing-page';
    const entry = typeof configuratorData !== 'undefined' ? configuratorData.services.find(s => s.id === svc) : null;
    return entry ? (entry.customPrice || entry.price) : 700;
  };
  const finishLabel = typeof onFinish === 'function' ? 'Concluir estrutura' : (typeof CogitHandoff !== 'undefined' ? 'Continuar na plataforma' : 'Enviar para a equipe');

  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="hero-model-dialog custom-model-dialog studio" id="custom-model-dialog" aria-labelledby="custom-model-title">
      <div class="studio-shell">
        <header class="studio-head">
          <div class="studio-head-text">
            <p class="studio-eyebrow">Sob medida</p>
            <h3 class="studio-title" id="custom-model-title"></h3>
          </div>
          <ol class="studio-steps" aria-label="Etapas">
            <li data-studio-step="1"><span aria-hidden="true">1</span>Objetivo</li>
            <li data-studio-step="2"><span aria-hidden="true">2</span>Estrutura</li>
          </ol>
          <button type="button" class="studio-close" id="custom-modal-close" aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>
        <div class="studio-body" id="custom-model-body"></div>
        <footer class="studio-foot" id="custom-model-footer"></footer>
      </div>
      <p class="sr-only" aria-live="polite" id="studio-live"></p>
    </dialog>`);

  const modal = document.getElementById('custom-model-dialog');
  const titleEl = document.getElementById('custom-model-title');
  const bodyEl = document.getElementById('custom-model-body');
  const footerEl = document.getElementById('custom-model-footer');
  const live = document.getElementById('studio-live');
  const announce = (text) => { live.textContent = ''; requestAnimationFrame(() => { live.textContent = text; }); };

  lockModalScroll();
  modal.showModal();
  const closeModal = () => modal.close();
  modal.addEventListener('close', () => {
    unlockModalScroll();
    modal.remove();
    returnFocus?.focus?.({ preventScroll: true });
  });
  document.getElementById('custom-modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function summary() {
    const obj = currentObjective();
    const detected = modalState.objective === 'outro' ? analyzeCustomKeywords(modalState.customText) : null;
    return {
      objective: obj.id,
      objectiveTitle: obj.title,
      suggestion: detected && !detected.isUnclear ? detected.suggestion : obj.suggestion,
      serviceId: obj.serviceId || (['site-institucional', 'landing-page', 'portfolio'].includes(svcId) ? svcId : null),
      sections: modalState.blocks.map(b => b.name),
      components: modalState.blocks.filter(b => b.type === 'component').map(b => b.name),
      blocks: modalState.blocks.map(b => ({ ...b })),
      note: modalState.objective === 'outro' ? modalState.customText.trim() : '',
      estimate: basePrice() + modalState.blocks.filter(b => b.type === 'component').reduce((t, b) => t + ((CUSTOM_COMPONENTS.find(c => c.id === b.component) || {}).price || 0), 0)
    };
  }

  function finish() {
    const result = summary();
    // Mantido apenas em memória: textos livres não são gravados no navegador.
    window.__cogitCustomProject = result;
    if (typeof trackEvent === 'function') trackEvent('custom_model_finished', result.objective);
    closeModal();
    if (typeof onFinish === 'function') { onFinish(result); return; }
    if (typeof CogitHandoff !== 'undefined') {
      CogitHandoff.irParaPlataforma({
        origem: 'diagnostico',
        servicos: [{ id: result.serviceId || 'diagnostico', modelo: result.serviceId ? 'sob-medida' : null, nome: result.suggestion }],
        complementos: [],
        notas: [`Estrutura sob medida (${result.suggestion}): ${result.sections.join(' > ')}`, result.components.length ? `Componentes: ${result.components.join(', ')}` : '', result.note].filter(Boolean).join('\n'),
        diagnostico: { objetivo: `Sob medida · ${result.objectiveTitle}`, direcao: result.suggestion },
        estimativa: `a partir de R$ ${result.estimate.toLocaleString('pt-BR')}`
      });
      return;
    }
    window.location.href = `${cogitRoot()}contato.html?solucao=modelos-sob-medida&origem=custom-studio`;
  }

  function setStepIndicator() {
    modal.querySelectorAll('[data-studio-step]').forEach(li => {
      const n = Number(li.dataset.studioStep);
      li.classList.toggle('is-current', n === modalState.step);
      li.classList.toggle('is-done', n < modalState.step);
      if (n === modalState.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }

  // ── Etapa 1: objetivo ──
  function renderObjective() {
    modalState.step = 1;
    setStepIndicator();
    titleEl.textContent = 'Qual é o objetivo principal do projeto?';
    bodyEl.className = 'studio-body studio-body--objective';
    bodyEl.innerHTML = `
      <p class="studio-lede">A resposta define a estrutura inicial. No próximo passo você acrescenta, remove e reordena seções.</p>
      <fieldset class="studio-objectives">
        <legend class="sr-only">Objetivo</legend>
        ${CUSTOM_OBJECTIVES.map(o => `
          <label class="studio-objective">
            <input type="radio" name="studio-objective" value="${o.id}" ${modalState.objective === o.id ? 'checked' : ''}>
            <span class="studio-objective-icon" aria-hidden="true">${CUSTOM_ICONS[o.id]}</span>
            <span class="studio-objective-text">
              <strong>${o.title}</strong>
              <span>${o.desc}</span>
              <small>Estrutura base: ${o.suggestion}</small>
            </span>
            <span class="studio-objective-mark" aria-hidden="true">${CUSTOM_ICONS.check}</span>
          </label>`).join('')}
      </fieldset>
      <div class="studio-context" ${modalState.objective === 'outro' ? '' : 'hidden'}>
        <label for="custom-context-input">Conte em poucas linhas o que você precisa</label>
        <textarea id="custom-context-input" rows="3" maxlength="600" placeholder="Ex.: Quero um site para minha clínica com serviços, fotos e agendamento pelo WhatsApp.">${esc(modalState.customText)}</textarea>
        <p class="studio-hint" id="custom-keyword-feedback"></p>
      </div>`;

    const contextBox = bodyEl.querySelector('.studio-context');
    const textarea = bodyEl.querySelector('#custom-context-input');
    const feedback = bodyEl.querySelector('#custom-keyword-feedback');
    const updateFeedback = () => {
      const detected = analyzeCustomKeywords(modalState.customText);
      feedback.textContent = detected && !detected.isUnclear ? `Pelo que você descreveu, a estrutura de ${detected.suggestion} é um bom ponto de partida.` : '';
    };
    bodyEl.querySelectorAll('input[name="studio-objective"]').forEach(input => input.addEventListener('change', () => {
      modalState.objective = input.value;
      contextBox.hidden = input.value !== 'outro';
      if (typeof trackEvent === 'function') trackEvent('custom_model_objective_selected', input.value);
    }));
    textarea.addEventListener('input', () => { modalState.customText = textarea.value; updateFeedback(); });
    updateFeedback();

    footerEl.innerHTML = `
      <button type="button" class="studio-btn studio-btn--ghost" data-studio="cancel">Cancelar</button>
      <button type="button" class="studio-btn studio-btn--primary" data-studio="next"><span>Montar estrutura</span>${arrowRight}</button>`;
    footerEl.querySelector('[data-studio="cancel"]').addEventListener('click', closeModal);
    footerEl.querySelector('[data-studio="next"]').addEventListener('click', () => {
      const detected = modalState.objective === 'outro' ? analyzeCustomKeywords(modalState.customText) : null;
      const structureFor = detected && !detected.isUnclear ? detected.id : modalState.objective;
      if (modalState.blockObjective !== structureFor) initBlocks(structureFor);
      modalState.blockObjective = structureFor;
      renderStructure();
    });
    bodyEl.querySelector('input[name="studio-objective"]:checked')?.focus({ preventScroll: true });
  }

  // ── Etapa 2: estrutura ──
  function renderStructure() {
    modalState.step = 2;
    setStepIndicator();
    const obj = currentObjective();
    titleEl.textContent = 'Monte a estrutura';
    bodyEl.className = 'studio-body studio-body--structure';
    const available = (CUSTOM_COMPONENTS_BY_OBJECTIVE[modalState.objective] || CUSTOM_COMPONENTS_BY_OBJECTIVE.outro).map(id => CUSTOM_COMPONENTS.find(c => c.id === id));

    bodyEl.innerHTML = `
      <div class="studio-main">
        <section class="studio-panel" aria-labelledby="studio-sections-title">
          <div class="studio-panel-head">
            <h4 id="studio-sections-title">Seções da página <span class="studio-count" data-studio-count></span></h4>
            <p>Base para <strong>${esc(obj.suggestion)}</strong>. Abertura e contato ficam fixos.</p>
          </div>
          <ol class="studio-sections" id="custom-structure-pills"></ol>
        </section>
        <section class="studio-panel" aria-labelledby="studio-components-title">
          <div class="studio-panel-head">
            <h4 id="studio-components-title">Adicionar componentes</h4>
            <p>Cada componente entra como uma seção, antes do contato. Você pode reordenar depois.</p>
          </div>
          <div class="studio-components">
            ${available.map(c => `
              <button type="button" class="studio-component" data-component="${c.id}" aria-pressed="false">
                <span class="studio-component-icon">${compIcon(c)}</span>
                <span class="studio-component-text"><strong>${c.label}</strong><span>${c.desc}</span></span>
                <span class="studio-component-state" aria-hidden="true"></span>
              </button>`).join('')}
          </div>
        </section>
      </div>
      <section class="studio-side" aria-label="Pré-visualização e estimativa">
        <button type="button" class="studio-preview-toggle" aria-expanded="false" aria-controls="custom-preview-mount">Ver prévia da página</button>
        <div class="studio-preview" id="custom-preview-mount"></div>
        <div class="studio-estimate" id="custom-estimate-summary-mount"></div>
      </section>`;

    const toggle = bodyEl.querySelector('.studio-preview-toggle');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Ocultar prévia' : 'Ver prévia da página';
      bodyEl.querySelector('.studio-side').classList.toggle('is-preview-open', open);
    });
    bodyEl.querySelectorAll('.studio-component').forEach(btn => btn.addEventListener('click', () => toggleComponent(btn.dataset.component)));
    refresh();

    footerEl.innerHTML = `
      <button type="button" class="studio-btn studio-btn--ghost" data-studio="back">${arrowLeft}<span>Objetivo</span></button>
      <div class="studio-foot-right">
        <button type="button" class="studio-btn studio-btn--text" data-studio="reset">Restaurar padrão</button>
        <button type="button" class="studio-btn studio-btn--primary" data-studio="finish" id="custom-btn-finish-studio"><span>${finishLabel}</span>${arrowRight}</button>
      </div>`;
    footerEl.querySelector('[data-studio="back"]').addEventListener('click', renderObjective);
    footerEl.querySelector('[data-studio="reset"]').addEventListener('click', () => {
      initBlocks(modalState.blockObjective || modalState.objective);
      refresh();
      announce('Estrutura restaurada para o padrão.');
    });
    footerEl.querySelector('[data-studio="finish"]').addEventListener('click', finish);
  }

  // Seções fixas no topo e no fim; as demais podem subir, descer e sair.
  function bounds() {
    const b = modalState.blocks;
    let top = 0; while (top < b.length && b[top].type === 'mandatory') top++;
    let bottom = 0; while (bottom < b.length && b[b.length - 1 - bottom].type === 'mandatory') bottom++;
    return { first: top, last: b.length - 1 - bottom };
  }

  function toggleComponent(id) {
    const comp = CUSTOM_COMPONENTS.find(c => c.id === id);
    if (modalState.components.has(id)) {
      modalState.components.delete(id);
      modalState.blocks = modalState.blocks.filter(b => b.component !== id);
      announce(`${comp.label} removido da estrutura.`);
    } else {
      modalState.components.add(id);
      const block = { id: `c-${id}`, name: comp.label, type: 'component', kind: comp.kind, component: id, isNew: true };
      const { last } = bounds();
      modalState.blocks.splice(last + 1, 0, block);
      announce(`${comp.label} adicionado antes do contato.`);
    }
    if (typeof trackEvent === 'function') trackEvent('custom_model_component_toggled', id);
    refresh();
  }

  function move(index, dir) {
    const { first, last } = bounds();
    const target = index + dir;
    if (target < first || target > last) return;
    [modalState.blocks[index], modalState.blocks[target]] = [modalState.blocks[target], modalState.blocks[index]];
    refresh();
    announce(`${modalState.blocks[target].name} movido para a posição ${target + 1}.`);
    bodyEl.querySelector(`[data-index="${target}"][data-action="${dir < 0 ? 'up' : 'down'}"]`)?.focus()
      || bodyEl.querySelector(`[data-index="${target}"][data-action]`)?.focus();
  }

  function remove(index) {
    const block = modalState.blocks[index];
    if (!block || block.type === 'mandatory') return;
    if (block.component) modalState.components.delete(block.component);
    modalState.blocks.splice(index, 1);
    refresh();
    announce(`${block.name} removido.`);
  }

  function refresh() {
    const list = document.getElementById('custom-structure-pills');
    if (!list) return;
    const { first, last } = bounds();
    list.innerHTML = modalState.blocks.map((b, i) => {
      const fixed = b.type === 'mandatory';
      return `
        <li class="studio-section${fixed ? ' is-fixed' : ''}${b.type === 'component' ? ' is-component' : ''}${b.isNew ? ' is-new' : ''}">
          <span class="studio-section-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="studio-section-name">${esc(b.name)}${b.type === 'component' ? '<span class="studio-badge">Adicionado</span>' : ''}</span>
          <span class="studio-section-actions">
            ${fixed ? `<span class="studio-fixed" title="Seção fixa">${CUSTOM_ICONS.lock}<span class="sr-only">Seção fixa</span></span>` : `
              <button type="button" class="studio-icon-btn" data-action="up" data-index="${i}" ${i <= first ? 'disabled' : ''} aria-label="Mover ${esc(b.name)} para cima">${CUSTOM_ICONS.up}</button>
              <button type="button" class="studio-icon-btn" data-action="down" data-index="${i}" ${i >= last ? 'disabled' : ''} aria-label="Mover ${esc(b.name)} para baixo">${CUSTOM_ICONS.down}</button>
              <button type="button" class="studio-icon-btn studio-icon-btn--remove" data-action="remove" data-index="${i}" aria-label="Remover ${esc(b.name)}">${CUSTOM_ICONS.trash}</button>`}
          </span>
        </li>`;
    }).join('');
    modalState.blocks.forEach(b => { delete b.isNew; });
    list.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.dataset.index);
      if (btn.dataset.action === 'up') move(i, -1);
      else if (btn.dataset.action === 'down') move(i, 1);
      else remove(i);
    }));

    bodyEl.querySelector('[data-studio-count]').textContent = `(${modalState.blocks.length})`;
    bodyEl.querySelectorAll('.studio-component').forEach(btn => {
      const inBase = modalState.blocks.some(b => b.component === btn.dataset.component && b.type !== 'component');
      const on = modalState.components.has(btn.dataset.component);
      btn.setAttribute('aria-pressed', String(on));
      btn.classList.toggle('is-on', on);
      btn.disabled = inBase;
      btn.querySelector('.studio-component-state').innerHTML = inBase ? 'Na base' : on ? CUSTOM_ICONS.check : CUSTOM_ICONS.plus;
    });

    // Pré-visualização: um desenho simples por tipo de seção.
    document.getElementById('custom-preview-mount').innerHTML = `
      <div class="studio-browser" aria-hidden="true">
        <div class="studio-browser-bar"><i></i><i></i><i></i></div>
        <div class="studio-browser-page">
          ${modalState.blocks.map(b => `<div class="wf wf--${b.kind || 'split'}${b.type === 'component' ? ' is-component' : ''}"><span class="wf-label">${esc(b.name)}</span><span class="wf-art"></span></div>`).join('')}
        </div>
      </div>`;

    const current = summary();
    const extras = current.components;
    const est = current.estimate;
    document.getElementById('custom-estimate-summary-mount').innerHTML = `
      <dl class="studio-est">
        <div><dt>Estrutura</dt><dd>${esc(current.suggestion)}</dd></div>
        <div><dt>Seções</dt><dd>${modalState.blocks.length}</dd></div>
        <div><dt>Componentes adicionados</dt><dd>${extras.length}</dd></div>
        <div class="studio-est-total"><dt>Investimento</dt><dd>a partir de R$ ${est.toLocaleString('pt-BR')}</dd></div>
      </dl>
      <p class="studio-est-note">${extras.length ? 'Os componentes adicionados entram na validação do escopo; o valor final é confirmado pela equipe antes do pagamento.' : 'Valor inicial do projeto sob medida. A equipe confirma o valor final antes do pagamento.'}</p>`;
  }

  if (modalState.step === 2) renderStructure();
  else renderObjective();
  if (typeof trackEvent === 'function') trackEvent('custom_model_modal_opened', svcId);
}
window.openCustomModelModal = openCustomModelModal;

function updateHomeDynamicRecommendations(flowId) {
  const container = document.getElementById('dynamic-rec-grid');
  const sectionTitle = document.getElementById('rec-section-title');
  const sectionDesc = document.getElementById('rec-section-desc');
  if (!container) return;

  if (sectionTitle) sectionTitle.textContent = "Para o seu desafio, começaríamos por aqui.";
  if (sectionDesc) sectionDesc.textContent = "Com base no que você selecionou, estas são as soluções com maior aderência ao seu objetivo:";

  if (flowId === 'automatizar-processo') {
    container.innerHTML = `
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(26, 44, 82, 0.4);">
        <span class="dynamic-rec-card-tag" style="background: var(--purple); color: #fff;">RECOMENDADO</span>
        <h3>Automação de Processos</h3>
        <p>Elimine tarefas repetitivas, conecte planilhas e integre fluxos operacionais com WhatsApp e e-mails.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Você indicou foco em produtividade e redução de trabalho manual.</div>
        <a href="solucoes/automacoes-e-integracoes.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-2">
        <span class="dynamic-rec-card-tag">CONEXÃO TÉCNICA</span>
        <h3>Integrações com APIs</h3>
        <p>Sincronização contínua de dados entre sistemas legados, gateways e ferramentas de terceiros.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Garante que as ferramentas que você já usa trabalhem integradas.</div>
        <a href="solucoes/automacoes-e-integracoes.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-3">
        <span class="dynamic-rec-card-tag">VISIBILIDADE</span>
        <h3>Dashboards Gerenciais</h3>
        <p>Centralize indicadores e dados gerados pelos seus processos em painéis visuais em tempo real.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Acompanhe os resultados das rotinas automatizadas com clareza.</div>
        <a href="solucoes/plataformas-e-outras-solucoes.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
    `;
  } else if (flowId === 'vender-online') {
    container.innerHTML = `
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(26, 44, 82, 0.4);">
        <span class="dynamic-rec-card-tag" style="background: var(--purple); color: #fff;">RECOMENDADO</span>
        <h3>Site Institucional</h3>
        <p>Estrutura profissional com múltiplas páginas para transmitir credibilidade e autoridade da sua marca.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Ideal para comunicar seu posicionamento e gerar confiança no mercado.</div>
        <a href="solucoes/sites-institucionais.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-2">
        <span class="dynamic-rec-card-tag">ALTA CONVERSÃO</span>
        <h3>Landing Page de Vendas</h3>
        <p>Página estratégica pensada para campanhas de tráfego e captura direta de leads qualificados.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Foco direto em conversão sem pontos de distração para o usuário.</div>
        <a href="solucoes/landing-pages.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-3">
        <span class="dynamic-rec-card-tag">AUTOMAÇÃO COMERCIAL</span>
        <h3>Integração com WhatsApp</h3>
        <p>Direcione os leads do site diretamente para o WhatsApp com mensagens pré-formatadas.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Agiliza o primeiro contato comercial e aumenta as taxas de resposta.</div>
        <a href="solucoes/automacoes-e-integracoes.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
    `;
  } else if (flowId === 'sistema-operacao') {
    container.innerHTML = `
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(26, 44, 82, 0.4);">
        <span class="dynamic-rec-card-tag" style="background: var(--purple); color: #fff;">RECOMENDADO</span>
        <h3>Sistema Personalizado</h3>
        <p>Software desenvolvido sob medida para as regras operacionais da sua empresa.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Elimina gargalos de planilhas e softwares genéricos engessados.</div>
        <a href="solucoes/sistemas-personalizados.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-2">
        <span class="dynamic-rec-card-tag">GESTÃO VISUAL</span>
        <h3>Painel Administrativo</h3>
        <p>Controle de permissões, perfis de usuários e relatórios operacionais consolidados.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Garante segurança de dados e governança interna.</div>
        <a href="solucoes/plataformas-e-outras-solucoes.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-3">
        <span class="dynamic-rec-card-tag">CONECTIVIDADE</span>
        <h3>Integrações de Banco de Dados</h3>
        <p>Conexão com sistemas financeiros, notas fiscais ou bancos legados.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Mantém a consistência das informações em toda a empresa.</div>
        <a href="solucoes/automacoes-e-integracoes.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
    `;
  } else if (flowId === 'ideia-papel') {
    container.innerHTML = `
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(26, 44, 82, 0.4);">
        <span class="dynamic-rec-card-tag" style="background: var(--purple); color: #fff;">RECOMENDADO</span>
        <h3>MVP Funcional</h3>
        <p>Primeira versão do produto digital para validação rápida de hipóteses e atração dos primeiros usuários.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Reduz o risco de investimento permitindo testar antes de construir um sistema gigante.</div>
        <a href="solucoes/saas-e-produtos-digitais.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-2">
        <span class="dynamic-rec-card-tag">ESCALABILIDADE</span>
        <h3>Produto SaaS</h3>
        <p>Arquitetura multi-inquilino, cobrança recorrente e infraestrutura em nuvem preparada para escala.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Estrutura sólida para modelos de receita recorrente.</div>
        <a href="solucoes/saas-e-produtos-digitais.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-3">
        <span class="dynamic-rec-card-tag">ECOSSISTEMA</span>
        <h3>Plataforma Digital</h3>
        <p>Ambiente que conecta múltiplos tipos de usuários com regras de negócio personalizadas.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Ideal para marketplaces e plataformas intermediárias.</div>
        <a href="solucoes/plataformas-e-outras-solucoes.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
    `;
  } else if (flowId === 'ainda-nao-sei') {
    container.innerHTML = `
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(26, 44, 82, 0.4);">
        <span class="dynamic-rec-card-tag" style="background: var(--purple); color: #fff;">DIAGNÓSTICO</span>
        <h3>Análise e Diagnóstico Técnico</h3>
        <p>Ajudamos a identificar os principais gargalos e oportunidades digitais para o momento atual da sua empresa.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Você indicou que ainda está avaliando o melhor formato técnico.</div>
        <a href="contato.html" class="dynamic-rec-card-cta">Falar com especialista <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-2">
        <span class="dynamic-rec-card-tag">AUTOMAÇÃO</span>
        <h3>Otimização de Processos</h3>
        <p>Identificação de rotinas manuais que podem ser integradas para liberar tempo da sua equipe.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Gera resultados rápidos e redução imediata de trabalho braçal.</div>
        <a href="solucoes/automacoes-e-integracoes.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-3">
        <span class="dynamic-rec-card-tag">PRESENÇA</span>
        <h3>Estruturação de Canais</h3>
        <p>Sites e canais de contato pensados para aumentar autoridade e gerar oportunidades comerciais.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Garante que seu negócio seja encontrado e compreendido com clareza.</div>
        <a href="solucoes/sites-institucionais.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
    `;
  }
}

window.continueToConfigurator = function (preselectStr) {
  const target = new URL(CogitPrivacy.siteUrl('monte-sua-solucao.html'));
  if (preselectStr) target.searchParams.set('services', preselectStr);
  window.location.href = target.href;
};

// ── Render Services Grid ──
function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container || !servicesData.length) return;

  container.innerHTML = servicesData.map((service, i) => {
    const ctaText = service.id === 'outras-solucoes' ? 'Conte o que você precisa' : 'Conheça a solução';
    const targetUrl = service.id === 'outras-solucoes' ? '#contact' : '#configurator';

    return `
      <a href="${targetUrl}" class="service-card reveal reveal-delay-${(i % 3) + 1} ${service.highlight ? 'service-card-highlight' : ''}" id="service-${service.id}" aria-label="Conheça a solução de ${service.title}">
        <div class="service-card-header">
          ${service.tag ? `<span class="service-card-tag">${service.tag}</span>` : ''}
          <div class="service-card-icon">${getIcon(service.icon)}</div>
        </div>
        <h3>${service.title}</h3>
        <p>${service.description}</p>
        <span class="service-card-arrow">
          ${ctaText} ${getIcon('arrowRight')}
        </span>
      </a>
    `;
  }).join('');
}

// ── Render Process Timeline (Interactive) ──
function renderProcess() {
  const container = document.getElementById('process-steps-container');
  if (!container || !processData.length) return;

  container.innerHTML = processData.map((step, i) => `
    <div class="process-step" data-step="${i + 1}" id="process-step-${i + 1}">
      <div class="process-step-icon-wrapper">
        <div class="process-step-icon">${getIcon(step.icon)}</div>
        ${i < processData.length - 1 ? '<div class="process-step-line"><div class="process-step-line-fill"></div></div>' : ''}
      </div>
      <div class="process-step-content">
        <span class="process-step-number" aria-hidden="true">${step.number}</span>
        <h3>${step.title}</h3>
        <p class="process-step-keywords">${step.keywords}</p>
        <p class="process-step-desc">${step.description}</p>
      </div>
    </div>
  `).join('');

  // Initialize Scroll Spy for Methodology
  initProcessScrollSpy();
}

function initProcessScrollSpy() {
  const steps = document.querySelectorAll('.process-step');
  const visualGraphic = document.getElementById('process-visual-graphic');
  if (!steps.length || !visualGraphic) return;

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stepNum = entry.target.getAttribute('data-step');

        steps.forEach(s => s.classList.remove('active'));
        entry.target.classList.add('active');

        visualGraphic.className = 'process-visual-graphic state-' + stepNum;
      }
    });
  }, observerOptions);

  steps.forEach(step => observer.observe(step));
}

// ── Render Starting Points (Pricing) ──
function renderPricing() {
  const container = document.getElementById('pricing-grid');
  if (!container || !plansData.length) return;

  container.innerHTML = plansData.map((plan, i) => {
    let priceText = 'Sob análise';
    if (plan.priceId && typeof startingOptionsData !== 'undefined' && startingOptionsData[plan.priceId]) {
      const pData = startingOptionsData[plan.priceId];
      priceText = `R$ ${pData.basePrice.toLocaleString('pt-BR')}`;
    } else if (plan.price) {
      priceText = plan.price;
    }

    const preselectAttr = plan.primaryCtaPreselect ? `data-preselect='${JSON.stringify(plan.primaryCtaPreselect)}'` : '';

    return `
      <div class="pricing-card ${plan.cardType ? `pricing-card-${plan.cardType}` : ''} ${plan.featured ? 'is-featured' : ''} reveal reveal-delay-${i + 1}" id="plan-${plan.id}">
        
        <div class="pricing-card-header">
          <div class="pricing-card-id">
            <span class="pricing-card-number">${plan.number}</span>
            <span class="pricing-card-tag">${plan.tag}</span>
          </div>
          <h3 class="pricing-card-title">${plan.title}</h3>
          <p class="pricing-card-desc">${plan.description}</p>
        </div>

        <div class="pricing-card-ideal">
          <span class="pricing-ideal-label">IDEAL PARA</span>
          <p class="pricing-ideal-text">${plan.idealFor}</p>
        </div>

        <div class="pricing-card-block">
          <h4 class="pricing-block-title">${plan.solutionsHeader || 'SOLUÇÕES POSSÍVEIS'}</h4>
          <ul class="pricing-solutions-list">
            ${plan.solutions.map(sol => `<li>${sol}</li>`).join('')}
          </ul>
        </div>

        <div class="pricing-card-footer mt-auto">
          <div class="pricing-investment">
            <span class="pricing-investment-title">INVESTIMENTO INICIAL</span>
            ${plan.priceLabel ? `<span class="price-label">${plan.priceLabel}</span>` : ''}
            <span class="price-value">${priceText}</span>
            <p class="price-subtext">${plan.priceExplanation}</p>
            ${plan.secondaryExplanation ? `<p class="price-subtext-alt">${plan.secondaryExplanation}</p>` : ''}
          </div>
          
          ${plan.advancedNote ? `
            <div class="pricing-advanced-note">
              <p>${plan.advancedNote}</p>
              <a href="${plan.advancedLinkUrl}">${plan.advancedLinkText}</a>
            </div>
          ` : ''}

          ${plan.estimatedTime ? `<p class="pricing-time">Prazo estimado<br><strong>${plan.estimatedTime}</strong></p>` : ''}
          
          <div class="pricing-ctas">
            <button type="button" class="btn btn-primary pricing-cta-primary" ${preselectAttr} onclick="if(window.ConfiguratorApp) window.ConfiguratorApp.preselectAndScroll(JSON.parse(this.getAttribute('data-preselect')))">${plan.primaryCta}</button>
            ${plan.secondaryCta ? `<a href="${plan.secondaryCtaLink}" class="btn btn-secondary pricing-cta-secondary">${plan.secondaryCta}</a>` : ''}
          </div>
        </div>
        
      </div>
    `;
  }).join('');
}

// ── Render Cases & Projects (Cards Retangulares sem imagem e sem chips de linguagem) ──
function renderCases() {
  const container = document.getElementById('cases-grid');
  if (!container) return;

  if (!casesData || !casesData.length) {
    container.innerHTML = `
      <div class="cases-empty">
        <h3>Projetos em desenvolvimento</h3>
        <p>Estamos construindo soluções para diferentes desafios. Em breve, compartilharemos aqui os resultados de projetos reais.</p>
      </div>
    `;
    return;
  }

  const targetUrl = cogitRoot() + 'contato.html';

  const isHomePage = Boolean(container.closest('#cases')) || (!document.body.classList.contains('page-about-v2') && !container.closest('#projetos'));
  const casesToRender = isHomePage ? casesData.filter(c => c.showOnHome !== false) : casesData;

  container.innerHTML = casesToRender.map((c, i) => {
    const delayClass = `reveal-delay-${(i % 3) + 1}`;
    const isExternal = Boolean(c.link && c.link.startsWith('http'));
    const ctaHref = c.link || targetUrl;
    const ctaTarget = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    const ctaText = c.ctaText || (isExternal ? 'Ver site ao vivo' : 'Ver solução');
    const ctaIcon = isExternal ? 'bi-box-arrow-up-right' : 'bi-arrow-right';

    return `
      <div class="case-card ${delayClass}" id="case-${c.id}" data-about-reveal>
        <div class="case-card-header">
          <span class="case-card-tag">
            <span class="case-status-pulse"></span>
            ${c.statusTag || 'PRODUTO EM EVOLUÇÃO'}
          </span>
          <span class="case-card-segment">${c.segment}</span>
        </div>

        <h3 class="case-card-title">${c.title}</h3>
        <p class="case-card-desc">${c.solution}</p>
        
        ${c.highlights && c.highlights.length ? `
          <div class="case-card-highlights-box">
            <ul class="case-card-highlights">
              ${c.highlights.map(h => `
                <li>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${h}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <a href="${ctaHref}" class="case-card-cta"${ctaTarget}>
          ${ctaText} <span><i class="bi ${ctaIcon}"></i></span>
        </a>
      </div>
    `;
  }).join('');
}

// ── Render Impact Grid ──
function renderImpact() {
  const container = document.getElementById('impact-grid');
  if (!container || !impactData.length) return;

  container.innerHTML = impactData.map(item => `
    <div class="impact-card">
      <div class="impact-card-icon">${getIcon(item.icon)}</div>
      <span>${item.title}</span>
    </div>
  `).join('');
}

// ── Render & Initialize FAQ ──
function renderFAQ() {
  const container = document.getElementById('faq-list');
  // Only render if container exists and is empty or specifically meant for dynamic faqData
  if (container && typeof faqData !== 'undefined' && faqData.length && container.children.length === 0) {
    container.innerHTML = faqData.map((item, i) => `
      <div class="faq-item" id="faq-${i}">
        <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-answer-${i}">
          <span>${item.question}</span>
          <span class="faq-icon faq-icon-plus">${getIcon('plus')}</span>
        </button>
        <div class="faq-answer" id="faq-answer-${i}" role="region">
          <div class="faq-answer-inner">
            ${item.answer}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Bind click handlers for all FAQ lists across the site
  initFaqAccordions();
}

function initFaqAccordions() {
  const faqLists = document.querySelectorAll('.faq-list');
  faqLists.forEach(list => {
    list.querySelectorAll('.faq-question').forEach(btn => {
      if (btn.dataset.faqBound === 'true') return;
      btn.dataset.faqBound = 'true';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const item = btn.closest('.faq-item');
        if (!item) return;

        const answer = item.querySelector('.faq-answer');
        if (!answer) return;

        const isOpen = item.classList.contains('is-open');

        // Close all other items in the same FAQ list
        list.querySelectorAll('.faq-item').forEach(fi => {
          fi.classList.remove('is-open');
          const ans = fi.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = null;
          const qBtn = fi.querySelector('.faq-question');
          if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
        });

        // Toggle current item
        if (!isOpen) {
          item.classList.add('is-open');
          answer.style.maxHeight = (answer.scrollHeight + 30) + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}

// ── Render Form Selects ──
function renderFormOptions() {
  const typeSelect = document.getElementById('project-type');
  const budgetSelect = document.getElementById('budget-range');

  if (typeSelect) {
    typeSelect.innerHTML = `<option value="" disabled selected>Selecione o tipo</option>` +
      projectTypes.map(t => `<option value="${t}">${t}</option>`).join('');
  }

  if (budgetSelect) {
    budgetSelect.innerHTML = `<option value="" disabled selected>Selecione (opcional)</option>` +
      budgetRanges.map(b => `<option value="${b}">${b}</option>`).join('');
  }

}

// ── Render Footer Social Links ──
function renderFooterSocial() {
  const container = document.getElementById('footer-social');
  if (!container) return;

  let html = '';
  if (socialLinks.instagram && socialLinks.instagram !== '#') {
    html += `<a href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${getIcon('instagram')}</a>`;
  }
  if (socialLinks.linkedin && socialLinks.linkedin !== '#') {
    html += `<a href="${socialLinks.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${getIcon('linkedin')}</a>`;
  }
  if (socialLinks.email) {
    html += `<a href="${socialLinks.email}" aria-label="E-mail">${getIcon('mail')}</a>`;
  }

  container.innerHTML = html;
}

// ── Render Testimonials ──
function renderTestimonials() {
  // Check if testimonials section placeholder exists in HTML
  // If not, we can dynamically inject it before FAQ
  if (typeof testimonialsData === 'undefined' || !testimonialsData.length) return;

  const faqSection = document.getElementById('faq');
  if (!faqSection) return;

  // Create testimonials section
  const section = document.createElement('section');
  section.className = 'section testimonials-section has-data';
  section.id = 'testimonials';
  section.setAttribute('aria-label', 'Depoimentos');
  section.innerHTML = `
    <div class="container">
      <div class="section-header center reveal">
        <span class="section-label" style="justify-content: center;">DEPOIMENTOS</span>
        <h2>Experiências de quem construiu com a gente</h2>
      </div>
      <div class="testimonials-grid">
        ${testimonialsData.map(t => {
    const initial = t.name ? t.name.charAt(0).toUpperCase() : '?';
    const avatarContent = t.photo
      ? `<img src="${t.photo}" alt="Foto de ${t.name}" loading="lazy">`
      : initial;
    const roleText = [t.role, t.company].filter(Boolean).join(' · ');
    return `
            <div class="testimonial-card reveal">
              <p class="testimonial-card-quote">${t.testimonial}</p>
              <div class="testimonial-card-author">
                <div class="testimonial-card-avatar">${avatarContent}</div>
                <div class="testimonial-card-info">
                  <h4>${t.name}</h4>
                  ${roleText ? `<p>${roleText}</p>` : ''}
                </div>
              </div>
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;

  // Insert before FAQ
  faqSection.parentNode.insertBefore(section, faqSection);
}

// ── Initialize All Components ──
function initComponents() {
  renderChallenge();
  renderHeroInteractive();
  renderServices();
  renderProcess();
  renderPricing();
  renderCases();
  renderImpact();
  renderFAQ();
  renderFormOptions();
  renderFooterSocial();
  renderTestimonials();
}
