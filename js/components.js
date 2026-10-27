/* ============================================
   COGIT — Dynamic Component Rendering
   Renders data-driven sections from data.js
   ============================================ */

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

// ── Render Hero Interactive — COGIT Diagnostic (Configurador: Grid de Serviços + Objetivo + Contexto + Resultado) ──
function renderHeroInteractive() {
  const container = document.getElementById('hero-interactive-container');
  if (!container) return;

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
      id: 'landing-page', name: 'Landing Page', desc: 'Transforme campanhas em contatos e vendas.', priceLabel: 'A partir de R$ 500', challenge: 'presenca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 13l3 3 5-5"/></svg>'
    },
    {
      id: 'portfolio', name: 'Portfólio', desc: 'Mostre trabalhos, serviços e resultados.', priceLabel: 'A partir de R$ 600', challenge: 'presenca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 13l3 3 5-5"/></svg>'
    },
    {
      id: 'automacao-svc', name: 'Automação', desc: 'Elimine tarefas repetitivas e conecte ferramentas.', priceLabel: 'A partir de R$ 990', challenge: 'automacao',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/><path d="M7 12h3M14 12h3M12 7v3M12 14v3"/></svg>'
    },
    {
      id: 'sistema-svc', name: 'Sistema Web', desc: 'Organize sua operação em um software próprio.', priceLabel: 'A partir de R$ 2.990', challenge: 'sistema',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M10 6h4M10 17h4M6 10v4M17 10v4"/></svg>'
    },
    {
      id: 'saas-svc', name: 'Produto Digital', desc: 'Crie um produto digital por assinatura.', priceLabel: 'A partir de R$ 3.990', challenge: 'produto',
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
      id: 'outro-svc', name: 'Não sei ainda', desc: 'Receba orientação para encontrar o melhor começo.', priceLabel: 'Sob consulta', challenge: 'outro',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M14 14h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M10 7h4M10 17h4M7 10v4M17 10v4"/></svg>'
    }
  ];

  // ── Objetivos dinâmicos por serviço selecionado (Etapa 2) ──
  const OBJECTIVES_BY_SERVICE = {
    'mvp-svc': [
      { id: 'tirar-papel', label: 'Tirar minha ideia do papel' },
      { id: 'mvp-funcional', label: 'Criar um MVP funcional' },
      { id: 'validar-conceito', label: 'Validar meu conceito' },
      { id: 'testar-solucao', label: 'Testar uma nova solução' }
    ],
    'saas-svc': [
      { id: 'plataforma-escalavel', label: 'Criar uma plataforma escalável' },
      { id: 'ideia-em-produto', label: 'Transformar minha ideia em produto' },
      { id: 'sistema-assinatura', label: 'Criar um sistema por assinatura' },
      { id: 'validar-modelo', label: 'Validar modelo de negócio' }
    ],
    'plataforma-svc': [
      { id: 'plataforma-escalavel', label: 'Criar uma plataforma escalável' },
      { id: 'ideia-em-produto', label: 'Transformar minha ideia em produto' },
      { id: 'sistema-assinatura', label: 'Criar um sistema por assinatura' },
      { id: 'validar-modelo', label: 'Validar modelo de negócio' }
    ],
    'automacao-svc': [
      { id: 'automatizar-processos', label: 'Automatizar processos internos' },
      { id: 'reduzir-tarefas', label: 'Reduzir tarefas manuais' },
      { id: 'integrar-ferramentas', label: 'Integrar ferramentas existentes' },
      { id: 'fluxos-inteligentes', label: 'Criar fluxos inteligentes' }
    ],
    'sistema-svc': [
      { id: 'sistema-personalizado', label: 'Criar um sistema personalizado' },
      { id: 'melhorar-operacao', label: 'Melhorar minha operação' },
      { id: 'centralizar-informacoes', label: 'Centralizar informações' },
      { id: 'digitalizar-processos', label: 'Digitalizar processos' }
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
      { id: 'desafio-especifico', label: 'Resolver um desafio específico' },
      { id: 'explorar-tecnologia', label: 'Explorar possibilidades tecnológicas' },
      { id: 'avaliar-viabilidade', label: 'Avaliar viabilidade de um projeto' },
      { id: 'consultoria-medida', label: 'Consultoria e solução sob medida' }
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
    'saas-svc:sistema-assinatura': { solution: 'Plataforma com Gestão de Assinaturas', desc: 'Controle automatizado de planos, cobranças recorrentes e liberação de acessos.' },
    'saas-svc:validar-modelo': { solution: 'SaaS Beta / Validação Comercial', desc: 'Primeira versão do produto digital para testar monetização e métricas de retenção.' },

    // Plataforma
    'plataforma-svc:plataforma-escalavel': { solution: 'Plataforma Digital Escalável', desc: 'Infraestrutura robusta para conectar múltiplos perfis de usuários com alto desempenho.' },
    'plataforma-svc:ideia-em-produto': { solution: 'Desenvolvimento de Plataforma Digital', desc: 'Engenharia de software focada em regras de negócio complexas e experiência intuitiva.' },
    'plataforma-svc:sistema-assinatura': { solution: 'Plataforma com Módulos e Permissões', desc: 'Controle granular de acessos, relatórios e monetização por perfil.' },
    'plataforma-svc:validar-modelo': { solution: 'Plataforma Piloto', desc: 'Lançamento piloto controlado para validação técnica e comercial.' },

    // Automação
    'automacao-svc:automatizar-processos': { solution: 'Automação de Processos Internos', desc: 'Eliminar gargalos operacionais e tarefas manuais recorrentes entre ferramentas.' },
    'automacao-svc:reduzir-tarefas': { solution: 'Fluxos Automatizados de Produtividade', desc: 'Liberar tempo da equipe substituindo atividades manuais por integrações inteligentes.' },
    'automacao-svc:integrar-ferramentas': { solution: 'Integrações via API e Webhooks', desc: 'Conectar CRMs, ERPs, gateways de pagamento e canais de comunicação em um fluxo único.' },
    'automacao-svc:fluxos-inteligentes': { solution: 'Automações Inteligentes com Notificações', desc: 'Alertas automáticos, disparo de mensagens e relatórios em tempo real para sua equipe.' },

    // Sistema Web
    'sistema-svc:sistema-personalizado': { solution: 'Sistema Web Sob Medida', desc: 'Software exclusivo desenvolvido para atender exatamente às regras e fluxos do seu negócio.' },
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
    customProject: null
  };

  const heroSection = container.closest('.hero');
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateDiagnosticMode() {
    const isActive = state.step > 0;
    document.body.classList.toggle('is-hero-diagnostic-active', isActive);
    if (heroSection) heroSection.classList.toggle('is-diagnostic-active', isActive);
    container.dataset.step = String(state.step);
  }

  function focusDiagnosticViewport() {
    const header = document.querySelector('.header, header');
    const headerHeight = header ? header.offsetHeight : 0;
    const targetTop = Math.max(0, container.getBoundingClientRect().top + window.scrollY - headerHeight - 12);
    window.scrollTo({ top: targetTop, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  function revealNextAction(action) {
    if (!action || window.innerWidth > 680) return;
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

  // Nome comercial e prazo dos modelos prontos. Preços vêm do catálogo (configuratorData em data.js).
  const PRESENCE_MODELS = {
    'landing-page': { pronto: 'Landing Page Essencial', prazo: '5 a 8 dias úteis' },
    'portfolio': { pronto: 'Portfólio Profissional', prazo: '5 a 7 dias úteis' },
    'site-institucional': { pronto: 'Site Institucional Essencial', prazo: '7 a 12 dias úteis' }
  };
  const SERVICE_GROUPS = [
    { label: 'Presença digital', ids: ['site-institucional', 'landing-page', 'portfolio'] },
    { label: 'Operação e produto', ids: ['automacao-svc', 'sistema-svc', 'saas-svc', 'mvp-svc', 'plataforma-svc'] }
  ];
  const CONTEXT_TAGS = {
    presenca: ['Já tenho logotipo e identidade visual', 'Preciso de ajuda com os textos', 'Tenho fotos e imagens próprias', 'Já tenho domínio', 'Tenho um prazo definido'],
    outros: ['Hoje usamos planilhas', 'Preciso integrar com sistemas que já uso', 'Ainda estou validando a ideia', 'Tenho um prazo definido', 'Já tenho uma equipe técnica']
  };
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

  // Cabeçalho comum: etapas nomeadas (não só números), título e apoio.
  function renderDxHead(current, title, desc) {
    const isModelo = PRESENCA_DIGITAL_IDS.includes(state.selectedService);
    const labels = ['Solução', isModelo ? 'Formato' : 'Objetivo', 'Contexto', 'Resumo'];
    return `
      <header class="dx-head">
        <ol class="dx-steps" aria-label="Etapas do diagnóstico">
          ${labels.map((label, i) => {
            const n = i + 1;
            const status = n < current ? 'is-done' : n === current ? 'is-current' : '';
            return `<li class="${status}"${n === current ? ' aria-current="step"' : ''}><span class="dx-step-n" aria-hidden="true">${n < current ? DX_ICON.check : n}</span><span class="dx-step-l">${label}</span>${n < current ? '<span class="sr-only"> (concluída)</span>' : ''}</li>`;
          }).join('')}
        </ol>
        <h2 class="dx-title">${title}</h2>
        ${desc ? `<p class="dx-desc">${desc}</p>` : ''}
      </header>`;
  }

  function renderDxFooter(backLabel, nextLabel, nextDisabled) {
    return `
      <footer class="dx-foot">
        <button type="button" class="dx-btn dx-btn--ghost" data-dx="back">${DX_ICON.left}<span>${backLabel}</span></button>
        <button type="button" class="dx-btn dx-btn--primary" data-dx="next" ${nextDisabled ? 'disabled' : ''}><span data-dx-next-label>${nextLabel}</span>${DX_ICON.right}</button>
      </footer>`;
  }

  // ── ETAPA 0: Convite ──
  function renderStep0() {
    state.step = 0;
    container.innerHTML = `
      <div class="hero-step-wrapper hero-invite-view">
        <div class="hero-invite-content">
          <div class="hero-invite-text">
            <p class="hero-invite-eyebrow">COGIT DIAGNOSTIC</p>
            <h2 class="hero-invite-title">Encontre o melhor caminho digital para sua empresa.</h2>
            <p class="hero-invite-desc">Responda 3 perguntas e receba uma direção inicial para o seu momento.</p>
          </div>

          <div class="hero-invite-path" aria-hidden="true">
            <div class="hip-labels">
              <span class="hip-label" data-step="0">Pensar</span>
              <span class="hip-label" data-step="1">Estruturar</span>
              <span class="hip-label" data-step="2">Construir</span>
            </div>
            <div class="hip-track">
              <div class="hip-line"></div>
              <b class="hip-ball"></b>
              <div class="hip-burst" id="hip-burst"></div>
            </div>
          </div>

          <button type="button" class="btn-hero-montar btn-hero-start" id="hero-btn-start" aria-describedby="hero-diagnostic-meta">
            Descobrir minha solução <span><i class="bi bi-arrow-right"></i></span>
          </button>
          <p class="hero-invite-meta" id="hero-diagnostic-meta">Menos de 1 minuto <span>•</span> Sem cadastro <span>•</span> Resultado imediato</p>
        </div>
      </div>
    `;

    let stopCurrentAnimation = null;

    const startBtn = document.getElementById('hero-btn-start');
    if (startBtn) startBtn.addEventListener('click', () => {
      if (stopCurrentAnimation) stopCurrentAnimation();
      transitionTo(renderStep1, 'next');
    });

    function runPathAnimation() {
      if (stopCurrentAnimation) stopCurrentAnimation();
      // Movimento reduzido: trilha estática, sem bolinha nem partículas.
      if (prefersReducedMotion()) {
        container.querySelectorAll('.hip-label').forEach(l => l.classList.add('hip-label--active'));
        const staticBall = container.querySelector('.hip-ball');
        if (staticBall) staticBall.style.opacity = '0';
        return;
      }

      const ball   = container.querySelector('.hip-ball');
      const labels = container.querySelectorAll('.hip-label');
      const burst  = document.getElementById('hip-burst');
      const track  = container.querySelector('.hip-track');
      if (!ball || labels.length < 3 || !track) return;

      const tw = track.getBoundingClientRect().width;
      if (!tw) return;

      // Centros das 3 colunas iguais: 1/6, 3/6, 5/6
      const P = [tw / 6, tw / 2, tw * 5 / 6];
      let timeouts = [];

      function later(ms, fn) {
        const id = setTimeout(() => {
          if (state.step === 0 && ball.isConnected) {
            fn();
          }
        }, ms);
        timeouts.push(id);
        return id;
      }

      function clearAllTimeouts() {
        timeouts.forEach(clearTimeout);
        timeouts = [];
      }

      stopCurrentAnimation = () => {
        clearAllTimeouts();
        if (ball && ball.getAnimations) {
          ball.getAnimations().forEach(a => a.cancel());
        }
      };

      function setLabels(activeIdx) {
        labels.forEach((l, i) => {
          l.classList.toggle('hip-label--done',   i < activeIdx);
          l.classList.toggle('hip-label--active', i === activeIdx);
          l.classList.toggle('hip-label--idle',   i > activeIdx);
        });
      }

      function clearLabels() {
        labels.forEach(l => l.classList.remove(
          'hip-label--active', 'hip-label--done', 'hip-label--idle'
        ));
      }

      function fireBurst(xPos) {
        if (!burst) return;
        burst.innerHTML = '';

        const colors = ['#a79bff','#c4b5fd','#818cf8','#f0abfc','#ffffff','#7dd3fc','#fbbf24','#34d399'];
        const count  = 24;

        // Partículas radiantes
        for (let i = 0; i < count; i++) {
          const el    = document.createElement('span');
          const angle = (360 / count) * i + (Math.random() * 16 - 8);
          const dist  = 24 + Math.random() * 38;
          const size  = 3 + Math.random() * 4;
          const color = colors[i % colors.length];
          const tx    = (Math.cos(angle * Math.PI / 180) * dist).toFixed(1);
          const ty    = (Math.sin(angle * Math.PI / 180) * dist).toFixed(1);
          const dur   = 480 + Math.random() * 260;

          el.style.cssText = [
            'position:absolute',
            `left:${xPos}px`,
            'top:50%',
            `width:${size}px`,
            `height:${size}px`,
            'border-radius:50%',
            `background:${color}`,
            `box-shadow:0 0 ${size * 2}px ${color}`,
            'pointer-events:none'
          ].join(';');

          burst.appendChild(el);

          el.animate([
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.15)`, opacity: 0 }
          ], { duration: dur, easing: 'ease-out', delay: Math.random() * 50, fill: 'forwards' });
        }

        // 2 anéis expansivos de choque
        [0, 140].forEach(delay => {
          const ring = document.createElement('span');
          ring.style.cssText = [
            'position:absolute',
            `left:${xPos}px`,
            'top:50%',
            'width:10px',
            'height:10px',
            'border-radius:50%',
            'border:2px solid rgba(167,155,255,0.85)',
            'pointer-events:none'
          ].join(';');
          burst.appendChild(ring);
          ring.animate([
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 0.9 },
            { transform: 'translate(-50%,-50%) scale(6)',  opacity: 0 }
          ], { duration: 500, easing: 'ease-out', delay, fill: 'forwards' });
        });

        // Bolinha: pop de vitória e fade out suave (SEM fill: forwards para não travar opacidade)
        const popAnim = ball.animate([
          { transform: 'translate(-50%,-50%) scale(1)',   background: '#a79bff', opacity: 1 },
          { transform: 'translate(-50%,-50%) scale(2.6)', background: '#ffffff', opacity: 1, offset: 0.26 },
          { transform: 'translate(-50%,-50%) scale(0.2)', background: '#ffffff', opacity: 0 }
        ], { duration: 520, easing: 'ease-out' });

        popAnim.onfinish = () => {
          ball.style.opacity = '0';
          ball.style.transform = '';
          ball.style.background = '';
        };

        // Limpa partículas após animação
        setTimeout(() => { if (burst) burst.innerHTML = ''; }, 900);
      }

      function go() {
        clearAllTimeouts();
        if (state.step !== 0 || !ball.isConnected) return;

        // Cancela qualquer animação prévia para garantir que opacity: 1 funcione no novo ciclo
        if (ball.getAnimations) {
          ball.getAnimations().forEach(a => a.cancel());
        }

        clearLabels();
        ball.style.transition = 'none';
        ball.style.transform  = '';
        ball.style.background = '';
        ball.style.boxShadow  = '';
        ball.style.opacity    = '0';
        ball.style.left       = P[0] + 'px';
        void ball.offsetWidth; // Força reflow para aplicar estilos imediatamente

        if (burst) burst.innerHTML = '';

        // 1. Fade in em PENSAR
        later(350, () => {
          setLabels(0);
          ball.style.transition = 'opacity 280ms ease';
          ball.style.opacity    = '1';

          // 2. Desliza para ESTRUTURAR
          later(700, () => {
            setLabels(1);
            ball.style.transition = 'left 920ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            ball.style.left       = P[1] + 'px';

            // 3. Desliza para CONSTRUIR
            later(1380, () => {
              setLabels(2);
              ball.style.transition = 'left 920ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              ball.style.left       = P[2] + 'px';

              // 4. Explosão de vitória ao chegar
              later(940, () => {
                fireBurst(P[2]);

                // 5. Aguarda vitória e reinicia o ciclo suavemente
                later(2400, go);
              });
            });
          });
        });
      }

      go();
    }

    requestAnimationFrame(() => requestAnimationFrame(runPathAnimation));
    let _rt;
    window.addEventListener('resize', () => {
      clearTimeout(_rt);
      _rt = setTimeout(() => {
        if (state.step === 0) runPathAnimation();
      }, 200);
    }, { passive: true });
  }

  // ── ETAPA 1: solução ──
  function renderStep1() {
    state.step = 1;
    const card = (svc) => `
      <label class="dx-option dx-option--svc">
        <input type="radio" name="dx-service" value="${svc.id}" ${state.selectedService === svc.id ? 'checked' : ''}>
        <span class="dx-option-icon" aria-hidden="true">${svc.iconSvg}</span>
        <span class="dx-option-body">
          <span class="dx-option-name">${svc.name}</span>
          <span class="dx-option-desc">${svc.desc}</span>
          <span class="dx-option-meta">${svc.priceLabel}</span>
        </span>
        <span class="dx-option-mark" aria-hidden="true">${DX_ICON.check}</span>
      </label>`;
    const unknown = SERVICES_GRID.find(s => s.id === 'outro-svc');

    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead(1, 'O que você precisa construir?', 'Escolha o mais próximo. Se não souber, a última opção leva você a uma orientação.')}
        <div class="dx-body">
          ${SERVICE_GROUPS.map(group => `
            <fieldset class="dx-group">
              <legend class="dx-group-label">${group.label}</legend>
              <div class="dx-grid dx-grid--svc">${group.ids.map(id => card(SERVICES_GRID.find(s => s.id === id))).join('')}</div>
            </fieldset>`).join('')}
          <fieldset class="dx-group">
            <legend class="sr-only">Outra opção</legend>
            <div class="dx-grid dx-grid--single">${card(unknown)}</div>
          </fieldset>
        </div>
        ${renderDxFooter('Voltar', 'Continuar', !state.selectedService)}
      </div>`;

    const next = container.querySelector('[data-dx="next"]');
    container.querySelectorAll('input[name="dx-service"]').forEach(input => {
      input.addEventListener('change', () => {
        const svc = SERVICES_GRID.find(s => s.id === input.value);
        if (state.selectedService !== svc.id) { state.objective = null; state.customProject = null; }
        state.selectedService = svc.id;
        state.challenge = svc.challenge;
        next.disabled = false;
        revealNextAction(next);
        if (typeof trackEvent === 'function') trackEvent('hero_service_selected', svc.id);
      });
    });
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(renderStep0, 'back'));
    next.addEventListener('click', () => { if (state.selectedService) transitionTo(renderStep2, 'next'); });
  }

  // ── ETAPA 2: objetivo (serviços de operação e produto) ──
  function renderStep2() {
    state.step = 2;
    const selectedSvc = SERVICES_GRID.find(s => s.id === state.selectedService);
    if (PRESENCA_DIGITAL_IDS.includes(state.selectedService)) return renderStep2Modelo(selectedSvc);

    const objectives = getObjectives(state.selectedService);
    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead(2, 'Qual resultado você busca?', `Para <strong>${selectedSvc ? selectedSvc.name : 'sua solução'}</strong>. Escolha o objetivo mais próximo.`)}
        <div class="dx-body">
          <fieldset class="dx-group">
            <legend class="sr-only">Objetivo</legend>
            <div class="dx-grid dx-grid--objective">
              ${objectives.map(obj => `
                <label class="dx-option dx-option--row">
                  <input type="radio" name="dx-objective" value="${obj.id}" ${state.objective === obj.id ? 'checked' : ''}>
                  <span class="dx-option-name">${obj.label}</span>
                  <span class="dx-option-mark" aria-hidden="true">${DX_ICON.check}</span>
                </label>`).join('')}
            </div>
          </fieldset>
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
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(renderStep1, 'back'));
    next.addEventListener('click', () => { if (state.objective) transitionTo(renderStep3, 'next'); });
  }

  // ── ETAPA 2 (presença digital): modelo pronto ou sob medida ──
  function renderStep2Modelo(selectedSvc) {
    const info = PRESENCE_MODELS[state.selectedService];
    const prontoPrice = presencePrice(state.selectedService, 'modelos-prontos');
    const sobPrice = presencePrice(state.selectedService, 'sob-medida');
    const project = state.customProject;

    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead(2, `Como você quer construir ${selectedSvc && selectedSvc.id === 'landing-page' ? 'sua landing page' : selectedSvc && selectedSvc.id === 'portfolio' ? 'seu portfólio' : 'seu site'}?`, 'Dois caminhos, com prazo e investimento diferentes. Você pode ver o modelo ou montar a estrutura antes de decidir.')}
        <div class="dx-body">
          <fieldset class="dx-group">
            <legend class="sr-only">Formato</legend>
            <div class="dx-grid dx-grid--format">
              <div class="dx-format">
                <input type="radio" id="dx-format-pronto" name="dx-format" value="modelos-prontos" ${state.objective === 'modelos-prontos' ? 'checked' : ''}>
                <label for="dx-format-pronto" class="dx-format-label">
                  <span class="dx-format-top"><span class="dx-chip">Mais rápido</span><span class="dx-radio" aria-hidden="true"></span></span>
                  <span class="dx-format-name">Modelo pronto</span>
                  <span class="dx-format-desc">${info.pronto}: estrutura já testada. Aplicamos sua marca, seus textos e suas imagens.</span>
                  <span class="dx-facts">
                    <span><small>Investimento</small><strong>${brl(prontoPrice)}</strong></span>
                    <span><small>Prazo</small><strong>${info.prazo}</strong></span>
                  </span>
                </label>
                <button type="button" class="dx-link-btn" data-dx-action="preview">Ver o modelo e a demonstração ${DX_ICON.right}</button>
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
    };
    const openStudio = () => openCustomModelModal(selectedSvc, (summary) => {
      state.customProject = summary;
      state.objective = 'sob-medida';
      if (summary.serviceId && summary.serviceId !== state.selectedService) state.selectedService = summary.serviceId;
      transitionTo(renderStep3, 'next');
    }, { project: state.customProject });

    container.querySelectorAll('input[name="dx-format"]').forEach(input => {
      input.addEventListener('change', () => {
        state.objective = input.value;
        syncNext();
        revealNextAction(next);
        if (typeof trackEvent === 'function') trackEvent('hero_model_selected', input.value);
      });
    });
    syncNext();
    container.querySelector('[data-dx-action="preview"]').addEventListener('click', () => showModelPreview(selectedSvc));
    container.querySelector('[data-dx-action="customize"]').addEventListener('click', () => {
      state.objective = 'sob-medida';
      container.querySelector('#dx-format-sob').checked = true;
      syncNext();
      openStudio();
    });
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(renderStep1, 'back'));
    next.addEventListener('click', () => {
      if (!state.objective) return;
      if (state.objective === 'sob-medida' && !state.customProject) openStudio();
      else transitionTo(renderStep3, 'next');
    });
  }

  // ── ETAPA 3: contexto (opcional) ──
  function renderStep3() {
    state.step = 3;
    const tags = CONTEXT_TAGS[PRESENCA_DIGITAL_IDS.includes(state.selectedService) ? 'presenca' : 'outros'];
    container.innerHTML = `
      <div class="hero-step-wrapper dx-view">
        ${renderDxHead(3, 'Algo que devemos saber antes?', 'Opcional. Marque o que se aplica ou escreva com suas palavras.')}
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
        ${renderDxFooter('Voltar', 'Ver meu resumo', false)}
      </div>`;

    const textarea = container.querySelector('#hero-context-input');
    const count = container.querySelector('[data-dx-count]');
    textarea.addEventListener('input', () => { state.context = textarea.value; count.textContent = String(textarea.value.length); });
    container.querySelectorAll('.dx-tag input').forEach(input => {
      input.addEventListener('change', () => {
        state.contextTags = [...container.querySelectorAll('.dx-tag input:checked')].map(i => i.value);
      });
    });
    container.querySelector('[data-dx="back"]').addEventListener('click', () => transitionTo(renderStep2, 'back'));
    container.querySelector('[data-dx="next"]').addEventListener('click', () => {
      state.context = textarea.value;
      transitionTo(renderResult, 'next');
    });
  }

  // ── RESULTADO: resumo editável e próximos passos ──
  function renderResult() {
    state.step = 4;
    const selectedSvc = SERVICES_GRID.find(s => s.id === state.selectedService);
    const isPresence = PRESENCA_DIGITAL_IDS.includes(state.selectedService);
    const model = isPresence && ['modelos-prontos', 'sob-medida'].includes(state.objective) ? state.objective : '';
    const objData = getObjectives(state.selectedService).find(o => o.id === state.objective);
    const solution = getSolution(state.selectedService, state.objective);
    const project = model === 'sob-medida' ? state.customProject : null;
    const svcName = selectedSvc ? selectedSvc.name : 'Solução digital';

    // id do diagnóstico -> id do catálogo (o mesmo usado no configurador e na plataforma)
    const catalogIds = { 'automacao-svc': 'automacao', 'sistema-svc': 'sistema', 'saas-svc': 'mvp', 'mvp-svc': 'mvp', 'plataforma-svc': 'plataforma', 'outro-svc': 'diagnostico' };
    const catalogService = catalogIds[state.selectedService] || state.selectedService || 'diagnostico';
    const configuratorService = state.selectedService === 'outro-svc' ? '' : catalogService;
    const configuratorLink = configuratorService
      ? `monte-sua-solucao.html?services=${encodeURIComponent(configuratorService)}` + (model ? `&model=${model}` : '')
      : 'monte-sua-solucao.html';

    const headline = model === 'modelos-prontos' ? PRESENCE_MODELS[state.selectedService].pronto
      : project ? project.suggestion : solution.solution;
    const lede = model === 'modelos-prontos'
      ? 'Modelo pronto com a identidade da sua marca aplicada: estrutura, animações e responsividade já testadas.'
      : project ? `${project.sections.length} seções definidas por você${project.components.length ? `, com ${project.components.map(c => c.toLowerCase()).join(', ')}` : ''}.`
      : solution.desc;

    let price, priceNote, prazo;
    if (model) {
      const value = presencePrice(state.selectedService, model);
      price = model === 'sob-medida' ? `a partir de ${brl(value)}` : brl(value);
      priceNote = model === 'sob-medida' ? 'O valor final é confirmado depois da validação do escopo.' : 'Valor fixo para o modelo pronto.';
      prazo = model === 'sob-medida' ? 'Definido na validação do escopo' : PRESENCE_MODELS[state.selectedService].prazo;
    } else {
      price = selectedSvc ? selectedSvc.priceLabel : 'Sob consulta';
      priceNote = 'Estimativa inicial. A equipe confirma o valor depois de entender o escopo.';
      prazo = 'Definido na validação do escopo';
    }
    const steps = model === 'modelos-prontos'
      ? ['Entre ou crie sua conta na plataforma. O diagnóstico vai junto.', 'Pague por Pix, cartão ou boleto.', 'Envie logotipo, textos e imagens para começarmos.']
      : ['Entre ou crie sua conta na plataforma. O diagnóstico vai junto.', 'A equipe revisa o escopo e confirma valor e prazo.', 'Com tudo aprovado, o pagamento é liberado na própria plataforma.'];

    const previewData = typeof MODEL_PREVIEW_DATA !== 'undefined' ? MODEL_PREVIEW_DATA[state.selectedService] : null;
    const formatLabel = model === 'modelos-prontos' ? 'Modelo pronto' : model === 'sob-medida' ? 'Sob medida' : (objData ? objData.label : '—');
    const contextText = (state.context || '').trim();

    container.innerHTML = `
      <div class="hero-step-wrapper dx-view dx-view--result">
        ${renderDxHead(4, 'Seu ponto de partida', 'Revise o que você escolheu. Tudo pode ser ajustado aqui ou com a equipe.')}
        <div class="dx-result">
          <section class="dx-summary" aria-labelledby="dx-rec-title">
            <p class="dx-kicker">Recomendação</p>
            <h3 class="dx-rec-title" id="dx-rec-title">${esc(headline)}</h3>
            <p class="dx-rec-lede">${esc(lede)}</p>

            <dl class="dx-choices">
              <div><dt>Solução</dt><dd>${svcName}</dd><dd><button type="button" class="dx-edit" data-dx-edit="1">Alterar<span class="sr-only"> solução</span></button></dd></div>
              <div><dt>${isPresence ? 'Formato' : 'Objetivo'}</dt><dd>${formatLabel}</dd><dd><button type="button" class="dx-edit" data-dx-edit="2">Alterar<span class="sr-only"> ${isPresence ? 'formato' : 'objetivo'}</span></button></dd></div>
            </dl>

            ${project ? `
              <div class="dx-structure">
                <div class="dx-structure-head"><p class="dx-kicker">Estrutura</p><button type="button" class="dx-edit" data-dx-edit="studio">Editar estrutura</button></div>
                <ol class="dx-structure-list">${project.sections.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
              </div>` : ''}
            ${model === 'modelos-prontos' && previewData ? `
              <div class="dx-model-links">
                <a class="dx-link-btn" href="${location.pathname.includes('/solucoes/') ? '../' : ''}${previewData.liveUrl}" target="_blank" rel="noopener">Abrir a demonstração ${DX_ICON.external}<span class="sr-only"> (nova aba)</span></a>
                <button type="button" class="dx-link-btn" data-dx-action="preview">Ver o que está incluso</button>
              </div>` : ''}

            <div class="dx-notes">
              <div class="dx-structure-head"><p class="dx-kicker">Suas observações</p><button type="button" class="dx-edit" data-dx-edit="3">${contextText || state.contextTags.length ? 'Alterar' : 'Adicionar'}<span class="sr-only"> observações</span></button></div>
              ${state.contextTags.length ? `<ul class="dx-note-tags">${state.contextTags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
              ${contextText ? `<p class="dx-note-text">${esc(contextText)}</p>` : ''}
              ${!contextText && !state.contextTags.length ? '<p class="dx-note-empty">Nenhuma observação. Você pode contar mais à equipe na plataforma.</p>' : ''}
            </div>
          </section>

          <aside class="dx-aside" aria-labelledby="dx-invest-title">
            <h3 class="dx-kicker" id="dx-invest-title">Investimento</h3>
            <p class="dx-price">${price}</p>
            <p class="dx-price-note">${priceNote}</p>
            <dl class="dx-aside-facts"><div><dt>Prazo</dt><dd>${prazo}</dd></div></dl>
            <h4 class="dx-kicker">Próximos passos</h4>
            <ol class="dx-next">${steps.map(s => `<li>${s}</li>`).join('')}</ol>
            <button type="button" class="dx-btn dx-btn--primary dx-btn--block" id="hero-btn-plataforma"><span>Continuar na plataforma</span>${DX_ICON.right}</button>
            <p class="dx-reassure">Você revisa tudo antes de qualquer pagamento.</p>
            <div class="dx-aside-links">
              <a href="${configuratorLink}" id="hero-link-form">Ajustar no configurador</a>
              <button type="button" id="hero-btn-restart">${DX_ICON.restart} Recomeçar</button>
            </div>
          </aside>
        </div>
      </div>`;

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
      transitionTo({ 1: renderStep1, 2: renderStep2, 3: renderStep3 }[target], 'back');
    }));
    const previewBtn = container.querySelector('[data-dx-action="preview"]');
    if (previewBtn) previewBtn.addEventListener('click', () => showModelPreview(selectedSvc));

    const platformBtn = document.getElementById('hero-btn-plataforma');
    platformBtn.addEventListener('click', () => {
      if (typeof CogitHandoff === 'undefined') return;
      platformBtn.disabled = true;
      if (typeof trackEvent === 'function') trackEvent('hero_diagnostic_platform', { service: state.selectedService, challenge: state.challenge, objective: state.objective });
      const notes = [
        project ? `Estrutura sob medida (${project.suggestion}): ${project.sections.join(' > ')}` : '',
        project && project.components.length ? `Componentes: ${project.components.join(', ')}` : '',
        state.contextTags.length ? `Marcado no diagnóstico: ${state.contextTags.join('; ')}` : '',
        contextText
      ].filter(Boolean).join('\n');
      CogitHandoff.irParaPlataforma({
        origem: 'diagnostico',
        servicos: [{ id: catalogService, modelo: model || null, nome: svcName }],
        complementos: [],
        notas: notes,
        diagnostico: { objetivo: project ? `Sob medida · ${project.objectiveTitle}` : formatLabel, direcao: headline },
        estimativa: price
      });
    });

    document.getElementById('hero-btn-restart').addEventListener('click', () => {
      Object.assign(state, { step: 0, selectedService: null, challenge: null, objective: null, context: '', contextTags: [], customProject: null });
      transitionTo(renderStep0, 'back');
    });
  }

  // Expose global starter
  window.heroStartDiagnosis = function () {
    if (state.step === 0) {
      transitionTo(renderStep1, 'next');
    } else {
      focusDiagnosticViewport();
    }
  };

  // Initial render
  renderStep0();
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
    description: 'Para empresas que precisam transmitir solidez e explicar serviços com clareza: painel institucional, serviços em abas, método em linha do tempo, casos, dúvidas e pedido de proposta.',
    audience: ['Pequenas e médias empresas', 'Escritórios e consultorias', 'Clínicas e prestadores de serviço', 'Negócios locais'],
    features: ['Composição sóbria, sem visual genérico', 'Serviços em abas acessíveis por teclado', 'Formulário de proposta com validação e LGPD', 'SEO técnico e dados estruturados', 'Responsivo e rápido no celular', 'Cores, fontes e conteúdo trocados sem refazer o layout'],
    previewImg: 'assets/videos/templates/institucional-poster.jpg',
    video: 'assets/videos/templates/institucional.mp4',
    liveUrl: 'templates/institucional/'
  },
  'landing-page': {
    name: 'Landing Page Essencial',
    tagLabel: 'LANDING PAGE',
    category: 'Landing page',
    description: 'Uma narrativa de conversão: do problema do público à solução em cenas, provas, etapas, objeções respondidas e um formulário curto no final.',
    audience: ['Campanhas e anúncios', 'Lançamento de serviços', 'Captação de leads', 'Produtos digitais'],
    features: ['Fluxo persuasivo sem gatilhos artificiais', 'Seção de solução com tela que acompanha o texto', 'CTA fixo no celular e formulário com validação', 'SEO técnico e dados estruturados', 'Carregamento leve, sem bibliotecas', 'Cores, fontes e conteúdo trocados sem refazer o layout'],
    previewImg: 'assets/videos/templates/landing-poster.jpg',
    video: 'assets/videos/templates/landing.mp4',
    liveUrl: 'templates/landing/'
  },
  'portfolio': {
    name: 'Portfólio Profissional',
    tagLabel: 'PORTFÓLIO',
    category: 'Portfólio',
    description: 'Projetos apresentados como em uma revista: composições diferentes para cada trabalho, contexto e entrega, competências, serviços, processo e contato.',
    audience: ['Designers e fotógrafos', 'Arquitetos e engenheiros', 'Consultores e especialistas', 'Estúdios e freelancers'],
    features: ['Projetos em composição editorial', 'Imagens otimizadas em AVIF e WebP', 'Processo em cartões sobrepostos', 'SEO técnico e dados estruturados', 'Formulário de projeto com validação', 'Cores, fontes e conteúdo trocados sem refazer o layout'],
    previewImg: 'assets/videos/templates/portfolio-poster.jpg',
    video: 'assets/videos/templates/portfolio.mp4',
    liveUrl: 'templates/portfolio/'
  }
};

// ── Modal de Informações do Modelo (Premium) ──
function showModelPreview(selectedSvc) {
  const modelId = (selectedSvc && typeof selectedSvc === 'object' && selectedSvc.id) ? selectedSvc.id : (typeof selectedSvc === 'string' ? selectedSvc : 'modelo');
  const title = (selectedSvc && typeof selectedSvc === 'object' && selectedSvc.name) ? selectedSvc.name : (typeof selectedSvc === 'string' && selectedSvc !== 'modelo' ? selectedSvc : 'Landing Page');
  openModelPreviewModal(modelId, title);
}

function openModelPreviewModal(modelId, title) {
  let finalId = modelId;
  let finalTitle = title;
  if (typeof modelId === 'object' && modelId !== null) {
    finalId = modelId.id || 'modelo';
    finalTitle = modelId.name || title || 'Landing Page';
  } else if (!finalTitle) {
    finalTitle = (typeof modelId === 'string' && modelId !== 'modelo') ? modelId : 'Landing Page';
  }

  // Resolve data for the service
  const data = MODEL_PREVIEW_DATA[finalId] || MODEL_PREVIEW_DATA['landing-page'];

  const existing = document.getElementById('hero-model-preview-modal');
  if (existing) existing.remove();

  const returnFocus = document.activeElement;

  // Build audience pills
  const audiencePills = data.audience.map(a => `<li class="hero-modal-audience-pill">${a}</li>`).join('');

  // Build features list
  const checkSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const featuresList = data.features.map(f => `<li>${checkSvg} ${f}</li>`).join('');

  // Caminhos relativos à raiz do site, inclusive quando o modal abre em /solucoes/.
  const rootPrefix = location.pathname.includes('/solucoes/') ? '../' : '';
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
          <button type="button" class="hero-modal-btn-select" id="hero-modal-select">
            Escolher este modelo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
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

  selectBtn.addEventListener('click', () => {
    closeModal();
    // Simula o clique no botão adquirir para avançar
    const adquirirBtn = document.getElementById('btn-adquirir-modelo');
    if (adquirirBtn) adquirirBtn.click();
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
  { id: 'precos', label: 'Planos e preços', desc: 'Tabela comparativa de planos', kind: 'cards', price: 0, icon: '<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
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
    window.location.href = `${location.pathname.includes('/solucoes/') ? '../' : ''}contato.html?solucao=modelos-sob-medida&origem=custom-studio`;
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
      <aside class="studio-side" aria-label="Pré-visualização e estimativa">
        <button type="button" class="studio-preview-toggle" aria-expanded="false" aria-controls="custom-preview-mount">Ver prévia da página</button>
        <div class="studio-preview" id="custom-preview-mount"></div>
        <div class="studio-estimate" id="custom-estimate-summary-mount"></div>
      </aside>`;

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
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(74, 61, 219, 0.4);">
        <span class="dynamic-rec-card-tag" style="background: var(--purple); color: #fff;">RECOMENDADO</span>
        <h3>Automação de Processos</h3>
        <p>Elimine tarefas repetitivas, conecte planilhas e integre fluxos operacionais com WhatsApp e e-mails.</p>
        <div class="dynamic-rec-card-why"><strong>Por que recomendamos:</strong> Você indicou foco em produtividade e redução de trabalho manual.</div>
        <a href="solucoes/automacoes-e-integracoes.html" class="dynamic-rec-card-cta">Entender essa solução <span><i class="bi bi-arrow-right"></i></span></a>
      </div>
      <div class="dynamic-rec-card reveal reveal-delay-2">
        <span class="dynamic-rec-card-tag">CONEXÃO TÉCNICA</span>
        <h3>Integrações com APIs</h3>
        <p>Sincronização contínua de dados entre CRMs, sistemas legados, gateways e ferramentas de terceiros.</p>
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
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(74, 61, 219, 0.4);">
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
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(74, 61, 219, 0.4);">
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
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(74, 61, 219, 0.4);">
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
      <div class="dynamic-rec-card reveal reveal-delay-1" style="border-color: rgba(74, 61, 219, 0.4);">
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

  const isSubfolder = window.location.pathname.includes('/projetos') || window.location.pathname.includes('/solucoes');
  const targetUrl = isSubfolder ? '../contato.html' : 'contato.html';

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
