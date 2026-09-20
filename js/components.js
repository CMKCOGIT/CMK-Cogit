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
      id: 'site-institucional', name: 'Site Institucional', desc: 'Apresente sua empresa e gere confiança.', priceLabel: 'A partir de R$ 1.990', challenge: 'presenca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'
    },
    {
      id: 'landing-page', name: 'Landing Page', desc: 'Transforme campanhas em contatos e vendas.', priceLabel: 'A partir de R$ 990', challenge: 'presenca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 13l3 3 5-5"/></svg>'
    },
    {
      id: 'portfolio', name: 'Portfólio', desc: 'Mostre trabalhos, serviços e resultados.', priceLabel: 'A partir de R$ 790', challenge: 'presenca',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 13l3 3 5-5"/></svg>'
    },
    {
      id: 'automacao-svc', name: 'Automação', desc: 'Elimine tarefas repetitivas e conecte ferramentas.', priceLabel: 'A partir de R$ 990', challenge: 'automacao',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/><path d="M7 12h3M14 12h3M12 7v3M12 14v3"/></svg>'
    },
    {
      id: 'sistema-svc', name: 'Sistema Web', desc: 'Organize sua operação em um software próprio.', priceLabel: 'A partir de R$ 7.900', challenge: 'sistema',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M10 6h4M10 17h4M6 10v4M17 10v4"/></svg>'
    },
    {
      id: 'saas-svc', name: 'SaaS', desc: 'Crie um produto digital por assinatura.', priceLabel: 'A partir de R$ 14.900', challenge: 'produto',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
    },
    {
      id: 'mvp-svc', name: 'MVP', desc: 'Valide sua ideia com uma primeira versão funcional.', priceLabel: 'A partir de R$ 9.900', challenge: 'produto',
      iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'
    },
    {
      id: 'plataforma-svc', name: 'Plataforma', desc: 'Conecte usuários, serviços e oportunidades.', priceLabel: 'A partir de R$ 11.900', challenge: 'produto',
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
    context: ''
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

  function renderProgressDots(currentStep, total) {
    const isModelo = PRESENCA_DIGITAL_IDS.includes(state.selectedService);
    const labels = ['Solução', isModelo ? 'Modelo' : 'Objetivo', 'Contexto'];
    return `<div class="hero-diag-dots">
      ${labels.map((label, i) => {
      const n = i + 1;
      const isDone = currentStep > n;
      const isActive = currentStep === n;
      return `<div class="hero-diag-dot-item ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}">
          <div class="hero-diag-dot">${isDone ? '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>' : n}</div>
          <span class="hero-diag-dot-label">${label}</span>
        </div>${i < labels.length - 1 ? `<div class="hero-diag-dot-line${isDone ? ' is-done' : ''}"></div>` : ''}`;
    }).join('')}
    </div>`;
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
            <span>Pensar</span><i></i><span>Estruturar</span><i></i><span>Construir</span>
            <b class="hero-invite-path-pulse"></b>
          </div>
          <button type="button" class="btn-hero-montar btn-hero-start" id="hero-btn-start" aria-describedby="hero-diagnostic-meta">
            Descobrir minha solução <span><i class="bi bi-arrow-right"></i></span>
          </button>
          <p class="hero-invite-meta" id="hero-diagnostic-meta">Menos de 1 minuto <span>•</span> Sem cadastro <span>•</span> Resultado imediato</p>
        </div>
      </div>
    `;
    const startBtn = document.getElementById('hero-btn-start');
    if (startBtn) startBtn.addEventListener('click', () => transitionTo(renderStep1, 'next'));
  }

  // ── ETAPA 1: Grid de Serviços (seleção única → define challenge) ──
  function renderStep1() {
    state.step = 1;

    const cardsHtml = SERVICES_GRID.map(svc => `
      <button type="button"
        class="hero-svc-card ${state.selectedService === svc.id ? 'is-selected' : ''}"
        data-id="${svc.id}" data-challenge="${svc.challenge}"
        aria-pressed="${state.selectedService === svc.id}"
      >
        <div class="hero-svc-check">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="hero-svc-icon">${svc.iconSvg}</div>
        <span class="hero-svc-name">${svc.name}</span>
        <span class="hero-svc-desc">${svc.desc}</span>
      </button>
    `).join('');

    container.innerHTML = `
      <div class="hero-step-wrapper hero-step-1-view">
        <div class="hero-interactive-header">
          <div class="hero-discovery-topbar">
            <span class="hero-discovery-tag">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              COGIT DIAGNOSTIC
            </span>
            ${renderProgressDots(1, 3)}
          </div>
          <h2 class="hero-interactive-title">O que você precisa construir?</h2>
          <p class="hero-interactive-desc">Escolha uma opção. Se ainda não souber, nós orientamos você.</p>
        </div>

        <div class="hero-svc-grid" role="group" aria-label="Selecione um serviço">
          ${cardsHtml}
        </div>

        <div class="hero-discovery-footer">
          <button type="button" class="btn-hero-back hero-btn-back-invite" id="hero-btn-back-invite"><i class="bi bi-arrow-left"></i> Voltar</button>
          <button type="button" class="btn-hero-montar" id="hero-btn-continue-1" ${state.selectedService ? '' : 'disabled'}>
            Definir objetivo <span><i class="bi bi-arrow-right"></i></span>
          </button>
        </div>
      </div>
    `;

    const cards = container.querySelectorAll('.hero-svc-card');
    const continueBtn = document.getElementById('hero-btn-continue-1');
    const backBtn = document.getElementById('hero-btn-back-invite');

    cards.forEach(card => {
      attachTapHandler(card, () => {
        state.selectedService = card.dataset.id;
        state.challenge = card.dataset.challenge;
        state.objective = null;

        cards.forEach(c => { c.classList.remove('is-selected'); c.setAttribute('aria-pressed', 'false'); });
        card.classList.add('is-selected');
        card.setAttribute('aria-pressed', 'true');
        if (continueBtn) continueBtn.removeAttribute('disabled');
        revealNextAction(continueBtn);
        if (typeof trackEvent === 'function') trackEvent('hero_service_selected', card.dataset.id);
      });
    });

    if (backBtn) backBtn.addEventListener('click', () => transitionTo(renderStep0, 'back'));
    if (continueBtn) continueBtn.addEventListener('click', () => {
      if (!state.selectedService) return;
      transitionTo(renderStep2, 'next');
    });
  }

  // ── ETAPA 2: Grid de Objetivos Dinâmicos (Cards Quadrados) ──
  function renderStep2() {
    state.step = 2;
    const selectedSvc = SERVICES_GRID.find(s => s.id === state.selectedService);

    if (PRESENCA_DIGITAL_IDS.includes(state.selectedService)) {
      return renderStep2Modelo(selectedSvc);
    }

    const objectives = getObjectives(state.selectedService);

    const cardsHtml = objectives.map(obj => `
      <button type="button"
        class="hero-objective-card ${state.objective === obj.id ? 'is-selected' : ''}"
        data-id="${obj.id}"
        aria-pressed="${state.objective === obj.id}"
      >
        <div class="hero-objective-check">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <span class="hero-objective-text">${obj.label}</span>
      </button>
    `).join('');

    container.innerHTML = `
      <div class="hero-step-wrapper hero-step-2-view">
        <div class="hero-interactive-header">
          <div class="hero-discovery-topbar">
            <span class="hero-discovery-tag">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><path d="M12 17h.01"/></svg>
              OBJETIVO
            </span>
            ${renderProgressDots(2, 3)}
          </div>

          <div class="hero-challenge-context-bar">
            <span class="hero-challenge-context-icon">${selectedSvc ? selectedSvc.iconSvg : ''}</span>
            <span class="hero-challenge-context-name">${selectedSvc ? selectedSvc.name : 'Solução selecionada'}</span>
            <button type="button" class="hero-btn-edit-step" id="hero-btn-edit-challenge">Alterar</button>
          </div>

          <h2 class="hero-interactive-title" style="margin-top:10px;">Qual resultado você busca?</h2>
          <p class="hero-interactive-desc">Selecione o objetivo mais próximo da sua necessidade.</p>
        </div>

        <div class="hero-objective-grid" role="group" aria-label="Selecione o objetivo">
          ${cardsHtml}
        </div>

        <div class="hero-discovery-footer" style="margin-top: var(--space-4);">
          <button type="button" class="btn-hero-back" id="hero-btn-back-2"><i class="bi bi-arrow-left"></i> Voltar</button>
          <button type="button" class="btn-hero-montar" id="hero-btn-continue-2" ${state.objective ? '' : 'disabled'}>
            Continuar <span><i class="bi bi-arrow-right"></i></span>
          </button>
        </div>
      </div>
    `;

    const cards = container.querySelectorAll('.hero-objective-card');
    const continueBtn = document.getElementById('hero-btn-continue-2');
    const backBtn = document.getElementById('hero-btn-back-2');
    const editBtn = document.getElementById('hero-btn-edit-challenge');

    cards.forEach(card => {
      attachTapHandler(card, () => {
        state.objective = card.dataset.id;

        cards.forEach(c => {
          c.classList.remove('is-selected');
          c.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('is-selected');
        card.setAttribute('aria-pressed', 'true');
        if (continueBtn) continueBtn.removeAttribute('disabled');
        revealNextAction(continueBtn);
        if (typeof trackEvent === 'function') trackEvent('hero_objective_selected', card.dataset.id);
      });
    });

    if (backBtn) backBtn.addEventListener('click', () => transitionTo(renderStep1, 'back'));
    if (editBtn) editBtn.addEventListener('click', () => transitionTo(renderStep1, 'back'));
    if (continueBtn) continueBtn.addEventListener('click', () => {
      if (!state.objective) return;
      transitionTo(renderStep3, 'next');
    });
  }

  // ── ETAPA 2 ALTERNATIVA: Modelos ──
  function renderStep2Modelo(selectedSvc) {
    const iconZap = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
    const iconDesign = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

    const modeloProntos = state.objective === 'modelos-prontos';
    const modeloSobMedida = state.objective === 'sob-medida';

    container.innerHTML = `
      <div class="hero-step-wrapper hero-step-2-view">
        <div class="hero-interactive-header">
          <div class="hero-discovery-topbar">
            <span class="hero-discovery-tag">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="12" r="10"/><path d="M12 17h.01"/></svg>
              MODELO
            </span>
            ${renderProgressDots(2, 3)}
          </div>

          <div class="hero-challenge-context-bar">
            <span class="hero-challenge-context-icon">${selectedSvc ? selectedSvc.iconSvg : ''}</span>
            <span class="hero-challenge-context-name">${selectedSvc ? selectedSvc.name : 'Solução selecionada'}</span>
            <button type="button" class="hero-btn-edit-step" id="hero-btn-edit-challenge">Alterar</button>
          </div>

          <h2 class="hero-interactive-title" style="margin-top:10px;">Como você deseja construir sua solução?</h2>
          <p class="hero-interactive-desc">Existem diferentes formas de criar uma solução digital.</p>
        </div>

        <div class="hero-modelo-grid" role="group" aria-label="Tipo de modelo">
          <div class="hero-modelo-card ${modeloProntos ? 'is-selected' : ''}" data-id="modelos-prontos">
            <div class="hero-modelo-card-header">
              <div class="hero-modelo-card-icon">${iconZap}</div>
              <label class="hero-model-choice"><input type="radio" name="hero-solution-model" value="modelos-prontos" aria-label="Selecionar Modelos Prontos" ${modeloProntos ? 'checked' : ''}><span>${modeloProntos ? 'Selecionado' : 'Selecionar'}</span></label>
            </div>
            <h4 class="hero-modelo-card-title">Modelos Prontos</h4>
            <p class="hero-modelo-card-desc">Escolha entre estruturas otimizadas para agilidade, conversão e presença digital.</p>
            <div class="hero-modelo-card-divider"></div>
            <div class="hero-modelo-card-actions">
              <button type="button" class="btn-hero-modelo-sec" id="btn-ver-modelo">Ver modelo</button>
              <button type="button" class="btn-hero-modelo-pri" id="btn-adquirir-modelo">Adquirir modelo</button>
            </div>
          </div>

          <div class="hero-modelo-card ${modeloSobMedida ? 'is-selected' : ''}" data-id="sob-medida">
            <div class="hero-modelo-card-header">
              <div class="hero-modelo-card-icon">${iconDesign}</div>
              <label class="hero-model-choice"><input type="radio" name="hero-solution-model" value="sob-medida" aria-label="Selecionar Modelos Sob Medida" ${modeloSobMedida ? 'checked' : ''}><span>${modeloSobMedida ? 'Selecionado' : 'Selecionar'}</span></label>
            </div>
            <h4 class="hero-modelo-card-title">Modelos Sob Medida</h4>
            <p class="hero-modelo-card-desc">Projetos exclusivos focados em alto nível de personalização.</p>
            <div class="hero-modelo-card-divider"></div>
            <div class="hero-modelo-card-actions">
              <button type="button" class="btn-hero-modelo-sec" id="btn-personalizar-sob-medida">Personalizar modelo</button>
              <button type="button" class="btn-hero-modelo-pri" id="btn-adquirir-sob-medida">Adquirir modelo</button>
            </div>
          </div>
        </div>

        <div class="hero-discovery-footer" style="margin-top: var(--space-4);">
          <button type="button" class="btn-hero-back" id="hero-btn-back-2"><i class="bi bi-arrow-left"></i> Voltar</button>
          <button type="button" class="btn-hero-montar" id="hero-btn-continue-2" ${state.objective ? '' : 'disabled'}>
            Continuar <span><i class="bi bi-arrow-right"></i></span>
          </button>
        </div>
      </div>
    `;

    const cards = container.querySelectorAll('.hero-modelo-card');
    const continueBtn = document.getElementById('hero-btn-continue-2');
    const backBtn = document.getElementById('hero-btn-back-2');
    const editBtn = document.getElementById('hero-btn-edit-challenge');

    function selectModel(id) {
      state.objective = id;
      cards.forEach(card => {
        const selected = card.dataset.id === id;
        card.classList.toggle('is-selected', selected);
        card.querySelector('input').checked = selected;
        card.querySelector('.hero-model-choice span').textContent = selected ? 'Selecionado' : 'Selecionar';
      });
      continueBtn.disabled = false;
      revealNextAction(continueBtn);
      if (typeof trackEvent === 'function') trackEvent('hero_model_selected', id);
    }
    cards.forEach(card => {
      attachTapHandler(card, (e) => {
        if (e.target && e.target.closest('button')) return;
        selectModel(card.dataset.id);
      });
    });

    container.querySelectorAll('[name="hero-solution-model"]').forEach(input => {
      input.addEventListener('change', () => selectModel(input.value));
    });
    const verModeloBtn = document.getElementById('btn-ver-modelo');
    if (verModeloBtn) {
      verModeloBtn.addEventListener('click', () => showModelPreview(selectedSvc));
    }
    [['btn-adquirir-modelo', 'modelos-prontos'], ['btn-adquirir-sob-medida', 'sob-medida']].forEach(([id, model]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          selectModel(model);
          transitionTo(renderStep3, 'next');
        });
      }
    });

    const personalizarBtn = document.getElementById('btn-personalizar-sob-medida');
    if (personalizarBtn) {
      personalizarBtn.addEventListener('click', () => {
        openCustomModelModal(selectedSvc, () => {
          selectModel('sob-medida');
          transitionTo(renderStep3, 'next');
        });
      });
    }

    if (backBtn) backBtn.addEventListener('click', () => transitionTo(renderStep1, 'back'));
    if (editBtn) editBtn.addEventListener('click', () => transitionTo(renderStep1, 'back'));
    if (continueBtn) continueBtn.addEventListener('click', () => {
      if (!state.objective) return;
      transitionTo(renderStep3, 'next');
    });
  }

  // ── ETAPA 3: Contexto ──
  function renderStep3() {
    state.step = 3;

    container.innerHTML = `
      <div class="hero-step-wrapper hero-step-3-view">
        <div class="hero-interactive-header">
          <div class="hero-discovery-topbar">
            <span class="hero-discovery-tag">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              CONTEXTO
            </span>
            ${renderProgressDots(3, 3)}
          </div>
          <h2 class="hero-interactive-title">Existe algo específico que devemos entender?</h2>
          <p class="hero-interactive-desc">Campo opcional — nos ajuda a direcionar melhor sua orientação.</p>
        </div>

        <div class="hero-context-field">
          <label class="sr-only" for="hero-context-input">Contexto do seu projeto (opcional)</label>
          <textarea maxlength="2000" id="hero-context-input" class="hero-textarea hero-textarea-lg" rows="4"
            placeholder="Ex: Hoje controlamos tudo por planilhas e queremos organizar nosso processo de vendas...">${CogitUI.escapeHtml(state.context)}</textarea>
        </div>

        <div class="hero-discovery-footer" style="margin-top: var(--space-4);">
          <button type="button" class="btn-hero-back" id="hero-btn-back-3"><i class="bi bi-arrow-left"></i> Voltar</button>
          <button type="button" class="btn-hero-montar" id="hero-btn-finalize">
            Gerar diagnóstico <span><i class="bi bi-arrow-right"></i></span>
          </button>
        </div>
      </div>
    `;

    const textarea = document.getElementById('hero-context-input');
    const backBtn = document.getElementById('hero-btn-back-3');
    const finalBtn = document.getElementById('hero-btn-finalize');

    if (textarea) textarea.addEventListener('input', e => { state.context = e.target.value; });
    if (backBtn) backBtn.addEventListener('click', () => transitionTo(renderStep2, 'back'));
    if (finalBtn) finalBtn.addEventListener('click', () => {
      if (textarea) state.context = textarea.value;

      transitionTo(renderAnalyzing, 'next');
    });
  }

  // ── TELA INTERMEDIÁRIA: Analisando ──
  function renderAnalyzing() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { renderResult(); return; }
    container.innerHTML = `
      <div class="hero-step-wrapper hero-analyzing-view">
        <div class="hero-analyzing-content">
          <div class="hero-analyzing-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p class="hero-analyzing-label">Identificando seu cenário...</p>
          <div class="hero-analyzing-checks">
            <div class="hero-analyzing-check" id="acheck-1">
              <div class="hero-analyzing-check-dot"></div>
              <span>Solução identificada</span>
            </div>
            <div class="hero-analyzing-check" id="acheck-2">
              <div class="hero-analyzing-check-dot"></div>
              <span>Objetivo mapeado</span>
            </div>
            <div class="hero-analyzing-check" id="acheck-3">
              <div class="hero-analyzing-check-dot"></div>
              <span>Direcionamento estratégico definido</span>
            </div>
          </div>
        </div>
      </div>
    `;

    ['acheck-1', 'acheck-2', 'acheck-3'].forEach((id, i) => {
      setTimeout(() => { const el = document.getElementById(id); if (el) el.classList.add('is-done'); }, 450 + i * 430);
    });
    setTimeout(() => transitionTo(renderResult, 'next'), 450 + 3 * 430 + 650);
  }

  // ── RESULTADO: Diagnóstico Consultivo ──
  function renderResult() {
    state.step = 4;
    const selectedSvc = SERVICES_GRID.find(s => s.id === state.selectedService);
    const objectives = getObjectives(state.selectedService);
    const objData = objectives.find(o => o.id === state.objective);
    const solution = getSolution(state.selectedService, state.objective);

    const phone = '5517981568889';
    const svcName = selectedSvc ? selectedSvc.name : 'Solução Digital';
    let waMsg = `Olá! Fiz um diagnóstico no site da COGIT:\n\n*Solução de interesse:* ${svcName}\n*Objetivo:* ${objData ? objData.label : (state.objective || 'Definir objetivo')}\n*Direcionamento:* ${solution.solution}`;
    if (state.context && state.context.trim()) waMsg += `\n*Contexto:* ${state.context.trim()}`;
    waMsg += `\n\nGostaria de receber uma orientação técnica da equipe COGIT!`;
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(waMsg)}`;
    const configuratorIds = {
      'automacao-svc': 'automacao',
      'sistema-svc': 'sistema',
      'saas-svc': 'saas',
      'mvp-svc': 'mvp',
      'plataforma-svc': 'plataforma',
      'outro-svc': 'outras-solucoes'
    };
    const configuratorService = configuratorIds[state.selectedService] || state.selectedService || '';
    const configuratorLink = `monte-sua-solucao.html?services=${encodeURIComponent(configuratorService)}`;

    container.innerHTML = `
      <div class="hero-step-wrapper hero-result-view">
        <div class="hero-interactive-header">
          <div class="hero-discovery-topbar">
            <span class="hero-discovery-tag hero-discovery-tag--success">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              DIAGNÓSTICO CONCLUÍDO
            </span>
          </div>
          <h2 class="hero-interactive-title">Entendemos seu cenário.</h2>
          <p class="hero-interactive-desc">Esta é uma direção inicial para o seu momento.</p>
        </div>

        <div class="hero-result-card">
          <div class="hero-result-row">
            <span class="hero-result-label">Solução selecionada</span>
            <span class="hero-result-value">
              <span class="hero-result-icon-inline">${selectedSvc ? selectedSvc.iconSvg : ''}</span>
              ${svcName}
            </span>
          </div>
          <div class="hero-result-divider"></div>
          <div class="hero-result-row">
            <span class="hero-result-label">Investimento inicial</span>
            <span class="hero-result-value hero-result-value--accent">${selectedSvc ? selectedSvc.priceLabel : 'Sob consulta'}</span>
          </div>
          <div class="hero-result-divider"></div>
          <div class="hero-result-row">
            <span class="hero-result-label">Objetivo</span>
            <span class="hero-result-value">${objData ? objData.label : (state.objective || '—')}</span>
          </div>
          <div class="hero-result-divider"></div>
          <div class="hero-result-row hero-result-row--desc">
            <span class="hero-result-label">Direção recomendada</span>
            <span class="hero-result-value hero-result-value--accent">${solution.solution}</span>
          </div>
          <div class="hero-result-divider"></div>
          <div class="hero-result-row hero-result-row--desc">
            <span class="hero-result-label">Como ajuda</span>
            <span class="hero-result-desc">${solution.desc}</span>
          </div>
          ${state.context && state.context.trim() ? `
          <div class="hero-result-context">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>"${CogitUI.escapeHtml(state.context.trim())}"</span>
          </div>` : ''}
        </div>

        ${CogitPrivacy.formMarkup('hero-contact-consent', true)}
        <p class="hero-interactive-desc">O diagnóstico fica neste navegador. Ao continuar, revise e envie a mensagem no WhatsApp para falar com a equipe.</p>
        <div class="hero-summary-actions">
          <a href="https://wa.me/5517981568889" target="_blank" rel="noopener noreferrer" class="btn-hero-montar btn-hero-whatsapp" id="hero-btn-whatsapp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Conversar com especialista
          </a>
          <div class="hero-summary-sub-actions">
            <a href="${configuratorLink}" class="hero-sub-link" id="hero-link-form">Detalhar escopo e estimativa <i class="bi bi-arrow-right"></i></a>
            <button type="button" class="hero-btn-restart-flow" id="hero-btn-restart"><i class="bi bi-arrow-counterclockwise"></i> Refazer diagnóstico</button>
          </div>
        </div>
      </div>
    `;

    const waBtn = document.getElementById('hero-btn-whatsapp');
    const restartBtn = document.getElementById('hero-btn-restart');

    if (waBtn) waBtn.addEventListener('click', (event) => {
      if (!CogitPrivacy.authorize(container)) { event.preventDefault(); return; }
      trackEvent('hero_diagnostic_whatsapp', { service: state.selectedService, challenge: state.challenge, objective: state.objective });
    });

    if (restartBtn) restartBtn.addEventListener('click', () => {
      state.step = 0;
      state.selectedService = null;
      state.challenge = null;
      state.objective = null;
      state.context = '';
      transitionTo(renderInvite, 'prev');
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
const MODEL_PREVIEW_DATA = {
  'site-institucional': {
    name: 'Site Institucional Essencial',
    tagLabel: 'SITE',
    description: 'Uma estrutura profissional para apresentar sua empresa, serviços e gerar credibilidade no mercado digital.',
    audience: ['Pequenas e médias empresas', 'Prestadores de serviço', 'Consultorias e escritórios', 'Negócios locais'],
    features: ['Design estratégico e profissional', 'Estrutura 100% responsiva', 'Otimização de carregamento', 'SEO técnico inicial', 'CTA para contato e WhatsApp', 'Personalização da identidade visual'],
    previewImg: 'assets/previews/preview-site.jpg',
    liveUrl: null
  },
  'landing-page': {
    name: 'Landing Page Essencial',
    tagLabel: 'LANDING PAGE',
    description: 'Uma estrutura criada para apresentar serviços, fortalecer sua presença digital e gerar mais conversões.',
    audience: ['Pequenas empresas', 'Profissionais liberais', 'Prestadores de serviço', 'Negócios digitais'],
    features: ['Design focado em conversão', 'Estrutura 100% responsiva', 'Otimização de carregamento', 'SEO básico aplicado', 'CTA para contato e WhatsApp', 'Personalização da identidade visual'],
    previewImg: 'assets/previews/preview-landing.jpg',
    liveUrl: null
  },
  'portfolio': {
    name: 'Portfólio Profissional',
    tagLabel: 'PORTFÓLIO',
    description: 'Mostre seus melhores trabalhos e projetos com uma apresentação visual que transmite profissionalismo.',
    audience: ['Fotógrafos e designers', 'Arquitetos e engenheiros', 'Freelancers criativos', 'Agências e estúdios'],
    features: ['Galeria de projetos otimizada', 'Design visual premium', 'Estrutura 100% responsiva', 'SEO técnico inicial', 'CTA para contato e WhatsApp', 'Layout personalizável'],
    previewImg: 'assets/previews/preview-portfolio.jpg',
    liveUrl: null
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

  // Live URL button (only if URL exists)
  const liveUrlBtn = data.liveUrl
    ? `<a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="hero-modal-live-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Ver modelo ao vivo
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
      </a>`
    : `<span class="hero-modal-live-link" style="opacity:0.5; cursor:default; pointer-events:none;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Demonstração em breve
      </span>`;

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
              <img src="${data.previewImg}" alt="Preview do modelo ${data.name}" class="hero-modal-preview-img" loading="lazy" />
              <div class="hero-modal-preview-overlay">
                <div class="hero-modal-play-btn">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
              <span class="hero-modal-preview-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                Desktop + Mobile
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
  up: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
  down: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  trash: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  sparkles: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/><circle cx="12" cy="12" r="3"/></svg>'
};

const CUSTOM_ADDON_ICONS = {
  texto: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>',
  galeria: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5-4 4-2-2-5 5"/></svg>',
  video: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
  depoimentos: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  formulario: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z"/><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 12h6M9 16h6"/></svg>',
  whatsapp: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.36 7.56L3 20l1.06-5.4A8.5 8.5 0 1 1 21 11.5z"/><path d="M9 10.5s.5 2 1.5 3 2 1.5 3 1.5"/></svg>',
  blog: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  clientes: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  faq: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  integracoes: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v4H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4h4"/><path d="M14 4l6 6"/><path d="M14 10V4h6"/></svg>'
};

const CUSTOM_OBJECTIVES = [
  {
    id: 'vender',
    title: 'Vender produtos ou serviços',
    desc: 'Quero uma solução focada em apresentar uma oferta e gerar conversões.',
    suggestion: 'Landing Page de Conversão',
    basePrice: 1950,
    baseMaxSections: 6
  },
  {
    id: 'empresa',
    title: 'Apresentar minha empresa',
    desc: 'Quero uma presença digital profissional para apresentar minha marca, serviços e informações.',
    suggestion: 'Site Institucional',
    basePrice: 2850,
    baseMaxSections: 6
  },
  {
    id: 'portfolio',
    title: 'Mostrar meus trabalhos',
    desc: 'Quero apresentar projetos, fotos, cases e resultados.',
    suggestion: 'Portfólio Profissional',
    basePrice: 2200,
    baseMaxSections: 6
  },
  {
    id: 'visual',
    title: 'Trabalhar com imagens e vídeos',
    desc: 'Quero uma experiência visual focada em conteúdo multimídia.',
    suggestion: 'Experiência Visual',
    basePrice: 2600,
    baseMaxSections: 5
  },
  {
    id: 'outro',
    title: 'Outro objetivo',
    desc: 'Tenho uma ideia específica e quero explicar minha necessidade.',
    suggestion: 'Estrutura Sob Medida',
    basePrice: 2400,
    baseMaxSections: 5
  }
];

const CUSTOM_STRUCTURES = {
  vender: {
    name: 'Landing Page de Conversão',
    sections: [
      { id: 'blk-hero-vender', name: 'Hero principal', type: 'mandatory' },
      { id: 'blk-oferta', name: 'Apresentação da oferta', type: 'recommended' },
      { id: 'blk-beneficios', name: 'Benefícios', type: 'recommended' },
      { id: 'blk-depoimentos-base', name: 'Prova social / depoimentos', type: 'recommended' },
      { id: 'blk-faq-base', name: 'Perguntas frequentes', type: 'recommended' },
      { id: 'blk-cta-vender', name: 'CTA / WhatsApp / formulário', type: 'mandatory' }
    ]
  },
  empresa: {
    name: 'Site Institucional',
    sections: [
      { id: 'blk-header-empresa', name: 'Header & Navegação', type: 'mandatory' },
      { id: 'blk-hero-empresa', name: 'Hero institucional', type: 'mandatory' },
      { id: 'blk-sobre', name: 'Sobre a empresa', type: 'recommended' },
      { id: 'blk-servicos', name: 'Catálogo de serviços', type: 'recommended' },
      { id: 'blk-diferenciais', name: 'Diferenciais de mercado', type: 'recommended' },
      { id: 'blk-contato-empresa', name: 'Contato e localização', type: 'mandatory' }
    ]
  },
  portfolio: {
    name: 'Portfólio Profissional',
    sections: [
      { id: 'blk-hero-port', name: 'Hero de apresentação', type: 'mandatory' },
      { id: 'blk-sobre-port', name: 'Sobre o profissional', type: 'recommended' },
      { id: 'blk-projetos', name: 'Galeria de projetos e cases', type: 'recommended' },
      { id: 'blk-metricas', name: 'Resultados e métricas', type: 'recommended' },
      { id: 'blk-depoimentos-port', name: 'Depoimentos de clientes', type: 'recommended' },
      { id: 'blk-cta-port', name: 'Contato direto / contratação', type: 'mandatory' }
    ]
  },
  visual: {
    name: 'Experiência Visual',
    sections: [
      { id: 'blk-hero-visual', name: 'Hero cinematográfico', type: 'mandatory' },
      { id: 'blk-galeria-visual', name: 'Galeria multimídia', type: 'recommended' },
      { id: 'blk-video-visual', name: 'Destaque em vídeo', type: 'recommended' },
      { id: 'blk-cases-visual', name: 'Mostruário imersivo', type: 'recommended' },
      { id: 'blk-cta-visual', name: 'Contato e redes', type: 'mandatory' }
    ]
  },
  outro: {
    name: 'Estrutura Sob Medida',
    sections: [
      { id: 'blk-hero-custom', name: 'Hero principal', type: 'mandatory' },
      { id: 'blk-apresentacao-custom', name: 'Apresentação da solução', type: 'recommended' },
      { id: 'blk-destaques-custom', name: 'Destaques e recursos', type: 'recommended' },
      { id: 'blk-cta-custom', name: 'Contato e conversão', type: 'mandatory' }
    ]
  }
};

const CUSTOM_ADDONS = [
  { id: 'texto', label: 'Texto adicional', price: 150, blockTitle: 'Texto adicional' },
  { id: 'galeria', label: 'Imagem / galeria', price: 200, blockTitle: 'Imagem / galeria' },
  { id: 'video', label: 'Vídeo', price: 250, blockTitle: 'Vídeo' },
  { id: 'depoimentos', label: 'Depoimentos', price: 150, blockTitle: 'Depoimentos' },
  { id: 'formulario', label: 'Formulário', price: 180, blockTitle: 'Formulário' },
  { id: 'whatsapp', label: 'Botão WhatsApp', price: 120, blockTitle: 'Botão WhatsApp' },
  { id: 'blog', label: 'Blog / conteúdo', price: 450, blockTitle: 'Blog / conteúdo' },
  { id: 'clientes', label: 'Área de clientes', price: 850, blockTitle: 'Área de clientes' },
  { id: 'faq', label: 'FAQ', price: 160, blockTitle: 'FAQ' },
  { id: 'integracoes', label: 'Integrações', price: 380, blockTitle: 'Integrações' }
];

// Motor de análise léxica interna (sem IA externa)
function analyzeCustomKeywords(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const clean = rawText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const rules = [
    {
      id: 'vender',
      suggestion: 'Landing Page de Conversão',
      words: ['vender', 'venda', 'vendas', 'produto', 'produtos', 'cliente', 'clientes', 'compra', 'compras', 'orcamento', 'orcamentos', 'oferta', 'ofertas', 'conversao', 'conversoes', 'loja', 'lead', 'leads', 'checkout', 'preco', 'comercio', 'trafego', 'anuncio', 'campanha', 'pagamento']
    },
    {
      id: 'empresa',
      suggestion: 'Site Institucional',
      words: ['empresa', 'empresas', 'institucional', 'marca', 'marcas', 'clinica', 'consultorio', 'escritorio', 'consultoria', 'negocio', 'corporativo', 'servico', 'servicos', 'equipe', 'instituicao', 'medica', 'odontologia', 'advocacia', 'contabilidade', 'credibilidade']
    },
    {
      id: 'portfolio',
      suggestion: 'Portfólio Profissional',
      words: ['foto', 'fotos', 'fotografia', 'fotografo', 'fotografa', 'projeto', 'projetos', 'trabalho', 'trabalhos', 'portfolio', 'cases', 'case', 'design', 'designer', 'arquiteto', 'arquitetura', 'obras', 'artista', 'artes', 'ensaios', 'galeria pessoal', 'curriculo']
    },
    {
      id: 'visual',
      suggestion: 'Experiência Visual',
      words: ['video', 'videos', 'imagem', 'imagens', 'galeria', 'filme', 'filmes', 'multimidia', 'visual', 'audiovisual', 'cinema', 'motion', 'animacao', 'teaser', 'conteudo visual', 'gravações', 'videomaker']
    }
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
  if (clean.trim().length > 6) {
    return {
      id: 'outro',
      suggestion: 'Estrutura Sob Medida',
      isUnclear: true,
      message: 'Vamos analisar sua necessidade — Com base na sua descrição, nossa equipe poderá validar a melhor estrutura para o seu projeto.'
    };
  }
  return null;
}

function openCustomModelModal(selectedSvc, onFinish) {
  const existing = document.getElementById('custom-model-dialog');
  if (existing) existing.remove();

  const returnFocus = document.activeElement;
  const checkSvg = CUSTOM_ICONS.check;
  const arrowRightSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  const arrowLeftSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';

  // Mapeia objetivo inicial
  let initialObjective = 'vender';
  if (selectedSvc) {
    const svcId = (typeof selectedSvc === 'object') ? selectedSvc.id : String(selectedSvc);
    if (svcId === 'site-institucional') initialObjective = 'empresa';
    else if (svcId === 'portfolio') initialObjective = 'portfolio';
    else if (svcId === 'landing-page') initialObjective = 'vender';
  }

  const modalState = {
    step: 2, // Inicia diretamente no Estúdio Visual Unificado (conforme solicitado e visto no screenshot)
    objective: initialObjective,
    customText: '',
    detectedMatch: null,
    blocks: [],
    addons: new Set()
  };

  // Inicializa lista de blocos da estrutura recomendada
  function initBlocksForObjective(objId) {
    const base = CUSTOM_STRUCTURES[objId] || CUSTOM_STRUCTURES.outro;
    modalState.blocks = base.sections.map(s => ({ ...s }));
    modalState.addons.clear();
  }
  initBlocksForObjective(modalState.objective);

  const modalHTML = `
    <dialog class="hero-model-dialog custom-model-dialog" id="custom-model-dialog" aria-labelledby="custom-model-title">
      <div class="hero-modal-content custom-model-content">
        <div class="hero-modal-header custom-model-header">
          <div class="hero-modal-header-left">
            <span class="custom-header-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              SOB MEDIDA
            </span>
            <h3 class="custom-header-title" id="custom-model-title">Estrutura recomendada para seu projeto</h3>
          </div>
          <button type="button" class="hero-modal-close" id="custom-modal-close" aria-label="Fechar modal" autofocus>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="custom-model-body" id="custom-model-body"></div>
        <div class="hero-modal-footer custom-model-footer" id="custom-model-footer"></div>
      </div>
    </dialog>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('custom-model-dialog');
  const closeBtn = document.getElementById('custom-modal-close');
  const titleEl = document.getElementById('custom-model-title');
  const bodyEl = document.getElementById('custom-model-body');
  const footerEl = document.getElementById('custom-model-footer');

  lockModalScroll();
  modal.showModal();
  const closeModal = () => modal.close();
  modal.addEventListener('close', () => {
    unlockModalScroll();
    modal.remove();
    returnFocus?.focus?.({ preventScroll: true });
  });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // ── Cálculo de Estimativa em Tempo Real ──
  function calculateEstimate() {
    const currentObj = CUSTOM_OBJECTIVES.find(o => o.id === modalState.objective) || CUSTOM_OBJECTIVES[4];
    let basePrice = currentObj.basePrice;
    let addonsTotal = 0;

    CUSTOM_ADDONS.forEach(addon => {
      if (modalState.addons.has(addon.id)) {
        addonsTotal += addon.price;
      }
    });

    const totalSections = modalState.blocks.length;
    const extraSectionsCount = Math.max(0, totalSections - currentObj.baseMaxSections);
    const extraSectionsCost = extraSectionsCount * 120;

    const totalEstimate = basePrice + addonsTotal + extraSectionsCost;
    const installmentVal = Math.round((totalEstimate * 1.12) / 12);

    const objName = modalState.detectedMatch && !modalState.detectedMatch.isUnclear
      ? modalState.detectedMatch.suggestion
      : currentObj.suggestion;

    return {
      basePrice,
      addonsTotal,
      extraSectionsCount,
      total: totalEstimate,
      installmentVal,
      totalSections,
      addedCount: modalState.addons.size,
      objName
    };
  }

  // ── Finalização / Passagem de dados ──
  function finalizeProject() {
    const estimate = calculateEstimate();
    const projectSummary = {
      objective: modalState.objective,
      suggestion: estimate.objName,
      customText: modalState.customText,
      blocks: modalState.blocks.map((b, idx) => ({ order: idx + 1, name: b.name, type: b.type })),
      addons: Array.from(modalState.addons),
      totalEstimate: estimate.total,
      installments: estimate.installmentVal,
      sectionsCount: estimate.totalSections,
      savedAt: new Date().toISOString()
    };

    try {
      window.__cogitCustomProject = projectSummary;
      localStorage.setItem('cogit_custom_project', JSON.stringify(projectSummary));
    } catch (err) {
      /* ignore storage errors */
    }

    closeModal();
    if (typeof trackEvent === 'function') trackEvent('custom_model_finished', modalState.objective);

    if (typeof onFinish === 'function') {
      onFinish(projectSummary);
    } else {
      const targetUrl = `contato.html?solucao=modelos-sob-medida&origem=custom-studio`;
      window.location.href = targetUrl;
    }
  }

  // ── Wireframe Mockup Renderer (Fiel ao screenshot: blocos escuros limpos com texto centralizado) ──
  function renderWireframePreviewHtml() {
    const blocks = modalState.blocks;
    const blocksHtml = blocks.map(b => `
      <div class="custom-wf-block" data-block-id="${b.id}">
        <span>${b.name}</span>
      </div>
    `).join('');

    return `
      <div class="custom-preview-mockup">
        <div class="custom-browser-bar">
          <div class="custom-browser-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="custom-preview-wireframe-scroll" id="custom-wf-scroll">
          ${blocksHtml}
        </div>
      </div>
    `;
  }

  function updateDynamicPreview() {
    const previewContainer = document.getElementById('custom-preview-mount');
    if (previewContainer) {
      previewContainer.innerHTML = renderWireframePreviewHtml();
    }
    updateEstimateDisplay();
  }

  // ── Painel de Estimativa Compacto e Elegante ──
  function updateEstimateDisplay() {
    const estimateEl = document.getElementById('custom-estimate-summary-mount');
    if (!estimateEl) return;
    const est = calculateEstimate();

    estimateEl.innerHTML = `
      <div class="custom-est-card">
        <div class="custom-est-row">
          <span class="custom-est-key">Estrutura base:</span>
          <strong class="custom-est-val">${est.objName}</strong>
        </div>
        <div class="custom-est-row">
          <span class="custom-est-key">Seções ativas:</span>
          <strong class="custom-est-val">${est.totalSections}</strong>
        </div>
        <div class="custom-est-row">
          <span class="custom-est-key">Adicionais selecionados:</span>
          <strong class="custom-est-val">${est.addedCount}</strong>
        </div>
        <div class="custom-est-divider"></div>
        <div class="custom-est-row custom-est-row--total">
          <span class="custom-est-key">Investimento estimado:</span>
          <div class="custom-est-price-wrap">
            <span class="custom-est-price-number">R$ ${est.total.toLocaleString('pt-BR')}</span>
            <small class="custom-est-price-sub">ou 12x de R$ ${est.installmentVal.toLocaleString('pt-BR')}</small>
          </div>
        </div>
        <p class="custom-est-disclaimer">*Estimativa preliminar sujeita à validação de arquitetura no discovery.</p>
      </div>
    `;
  }

  // ── Regras de Bloqueio de Movimento (Header/Hero no topo, CTA/Footer no final) ──
  function getMovementBounds() {
    const blocks = modalState.blocks;
    let topLocked = 0;
    while (topLocked < blocks.length && blocks[topLocked].type === 'mandatory') {
      topLocked++;
    }
    let bottomLocked = 0;
    while (bottomLocked < blocks.length && blocks[blocks.length - 1 - bottomLocked].type === 'mandatory') {
      bottomLocked++;
    }
    return { topLocked, bottomLocked };
  }

  function moveBlock(index, direction) {
    const target = index + direction;
    const { topLocked, bottomLocked } = getMovementBounds();
    const lastAllowed = modalState.blocks.length - 1 - bottomLocked;

    if (target < topLocked || target > lastAllowed) return;

    const temp = modalState.blocks[index];
    modalState.blocks[index] = modalState.blocks[target];
    modalState.blocks[target] = temp;
    renderStructurePillsList();
    updateDynamicPreview();
  }

  function removeBlock(index) {
    const block = modalState.blocks[index];
    if (!block || block.type === 'mandatory') return;

    if (block.addonId) {
      modalState.addons.delete(block.addonId);
      updateAddonCardsState();
    }
    modalState.blocks.splice(index, 1);
    renderStructurePillsList();
    updateDynamicPreview();
    if (typeof trackEvent === 'function') trackEvent('custom_model_block_removed', block.id);
  }

  function updateAddonCardsState() {
    const cards = bodyEl.querySelectorAll('.custom-addon-card');
    cards.forEach(card => {
      const id = card.dataset.id;
      const isAdded = modalState.addons.has(id);
      card.classList.toggle('is-added', isAdded);
      const actionEl = card.querySelector('.custom-addon-btn');
      if (actionEl) {
        actionEl.innerHTML = isAdded ? `${checkSvg} Adicionado` : '+ Adicionar';
      }
    });
  }

  function toggleAddon(addonId) {
    const addon = CUSTOM_ADDONS.find(a => a.id === addonId);
    if (!addon) return;

    if (modalState.addons.has(addonId)) {
      modalState.addons.delete(addonId);
      modalState.blocks = modalState.blocks.filter(b => b.addonId !== addonId);
    } else {
      modalState.addons.add(addonId);
      const newBlock = {
        id: `addon-${addon.id}-${Date.now()}`,
        name: addon.blockTitle,
        type: 'addon',
        addonId: addon.id
      };
      // Insere imediatamente antes das seções obrigatórias finais (ex: CTA final)
      const lastMandatoryIndex = modalState.blocks.length - 1;
      if (lastMandatoryIndex > 0 && modalState.blocks[lastMandatoryIndex].type === 'mandatory') {
        modalState.blocks.splice(lastMandatoryIndex, 0, newBlock);
      } else {
        modalState.blocks.push(newBlock);
      }
    }
    updateAddonCardsState();
    renderStructurePillsList();
    updateDynamicPreview();
    if (typeof trackEvent === 'function') trackEvent('custom_model_addon_toggled', addonId);
  }

  // ── Renderização da Lista de Seções em Pills de 2 Colunas (Idêntico ao Screenshot) ──
  function renderStructurePillsList() {
    const listEl = document.getElementById('custom-structure-pills');
    if (!listEl) return;

    const { topLocked, bottomLocked } = getMovementBounds();
    const lastAllowed = modalState.blocks.length - 1 - bottomLocked;

    listEl.innerHTML = modalState.blocks.map((b, idx) => {
      const isMandatory = b.type === 'mandatory';
      const canUp = !isMandatory && idx > topLocked;
      const canDown = !isMandatory && idx < lastAllowed;

      return `
        <div class="custom-structure-pill ${isMandatory ? 'is-mandatory' : ''}" data-index="${idx}">
          <div class="custom-pill-left">
            <span class="custom-pill-check">${checkSvg}</span>
            <span class="custom-pill-title">${b.name}</span>
          </div>
          <div class="custom-pill-controls">
            ${canUp ? `
              <button type="button" class="custom-pill-btn" data-action="up" data-index="${idx}" title="Mover para cima" aria-label="Mover para cima">
                ${CUSTOM_ICONS.up}
              </button>
            ` : ''}
            ${canDown ? `
              <button type="button" class="custom-pill-btn" data-action="down" data-index="${idx}" title="Mover para baixo" aria-label="Mover para baixo">
                ${CUSTOM_ICONS.down}
              </button>
            ` : ''}
            ${!isMandatory ? `
              <button type="button" class="custom-pill-btn custom-pill-btn--trash" data-action="remove" data-index="${idx}" title="Remover seção" aria-label="Remover seção">
                ${CUSTOM_ICONS.trash}
              </button>
            ` : `
              <span class="custom-pill-lock-hint" title="Item obrigatório">${CUSTOM_ICONS.lock}</span>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Eventos de botões up/down/remove
    listEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index, 10);
        if (action === 'up') moveBlock(index, -1);
        else if (action === 'down') moveBlock(index, 1);
        else if (action === 'remove') removeBlock(index);
      });
    });
  }

  // ── Renderização da ETAPA 1: Seleção de Objetivo (Acessível via "Voltar ao objetivo") ──
  function renderStep1View() {
    titleEl.textContent = 'Qual o objetivo principal do seu projeto?';
    bodyEl.className = 'hero-modal-body custom-model-body custom-model-body--step1';

    const cardsHTML = CUSTOM_OBJECTIVES.map(o => `
      <button type="button" class="custom-objective-card ${modalState.objective === o.id ? 'is-selected' : ''}" data-id="${o.id}">
        <div class="custom-objective-top">
          <span class="custom-objective-icon">${CUSTOM_ICONS[o.id]}</span>
          <span class="custom-objective-tag">${o.suggestion}</span>
        </div>
        <strong class="custom-objective-title">${o.title}</strong>
        <p class="custom-objective-desc">${o.desc}</p>
        <span class="custom-objective-action-hint">${modalState.objective === o.id ? checkSvg + ' Selecionado' : 'Selecionar'}</span>
      </button>
    `).join('');

    bodyEl.innerHTML = `
      <div class="custom-step1-container">
        <p class="custom-model-subtitle">Selecione o objetivo da sua solução para adaptarmos a estrutura ideal para você.</p>
        <div class="custom-objective-grid">${cardsHTML}</div>
        
        ${modalState.objective === 'outro' ? `
          <div class="custom-context-field">
            <label class="custom-context-label" for="custom-context-input">
              <span>Conte sua ideia ou necessidade</span>
              <small class="custom-context-hint">Identificaremos o direcionamento ideal para sua solução.</small>
            </label>
            <textarea id="custom-context-input" rows="3" placeholder="Exemplo: Quero um site para minha clínica mostrando serviços, fotos e contato pelo WhatsApp.">${CogitUI.escapeHtml(modalState.customText)}</textarea>
            <div class="custom-keyword-feedback" id="custom-keyword-feedback"></div>
          </div>
        ` : ''}
      </div>
    `;

    bodyEl.querySelectorAll('.custom-objective-card').forEach(card => {
      attachTapHandler(card, () => {
        const prevObj = modalState.objective;
        const newObj = card.dataset.id;
        if (prevObj === newObj) return;

        modalState.objective = newObj;
        initBlocksForObjective(modalState.objective);

        if (prevObj === 'outro' || newObj === 'outro') {
          const scrollPos = bodyEl.scrollTop;
          renderStep1View();
          renderFooter();
          requestAnimationFrame(() => { bodyEl.scrollTop = scrollPos; });
          if (newObj === 'outro') {
            const ta = document.getElementById('custom-context-input');
            if (ta) ta.focus();
          }
        } else {
          bodyEl.querySelectorAll('.custom-objective-card').forEach(c => {
            const isSel = c.dataset.id === newObj;
            c.classList.toggle('is-selected', isSel);
            const hint = c.querySelector('.custom-objective-action-hint');
            if (hint) hint.innerHTML = isSel ? checkSvg + ' Selecionado' : 'Selecionar';
          });
          renderFooter();
        }
        if (typeof trackEvent === 'function') trackEvent('custom_model_objective_selected', modalState.objective);
      });
    });

    const textarea = document.getElementById('custom-context-input');
    const feedbackEl = document.getElementById('custom-keyword-feedback');

    function updateKeywordFeedback() {
      if (!feedbackEl) return;
      const detected = analyzeCustomKeywords(modalState.customText);
      modalState.detectedMatch = detected;

      if (detected) {
        if (!detected.isUnclear) {
          feedbackEl.innerHTML = `
            <div class="custom-keyword-pill">
              ${CUSTOM_ICONS.sparkles}
              <span>Direcionamento sugerido: <strong>${detected.suggestion}</strong></span>
            </div>
          `;
          // Sincroniza blocos sugeridos caso usuário opte pela estrutura detectada
          const matchingObj = CUSTOM_STRUCTURES[detected.id];
          if (matchingObj) {
            modalState.blocks = matchingObj.sections.map(s => ({ ...s }));
          }
        } else {
          feedbackEl.innerHTML = `
            <div class="custom-keyword-pill custom-keyword-pill--neutral">
              <span><strong>Vamos analisar sua necessidade</strong> — Com base na sua descrição, nossa equipe poderá validar a melhor estrutura para o seu projeto.</span>
            </div>
          `;
        }
      } else {
        feedbackEl.innerHTML = '';
      }
    }

    if (textarea) {
      textarea.addEventListener('input', e => {
        modalState.customText = e.target.value;
        updateKeywordFeedback();
      });
      updateKeywordFeedback();
    }

    renderFooter();
  }

  // ── Renderização da ETAPA 2 (Estúdio Visual Unificado — Base Visual Idêntica ao Screenshot) ──
  function renderStep2DesktopStudio() {
    titleEl.textContent = 'Estrutura recomendada para seu projeto';
    bodyEl.className = 'hero-modal-body custom-model-body custom-model-body--studio';

    const currentObj = CUSTOM_OBJECTIVES.find(o => o.id === modalState.objective) || CUSTOM_OBJECTIVES[4];
    const structureName = modalState.detectedMatch && !modalState.detectedMatch.isUnclear
      ? modalState.detectedMatch.suggestion
      : currentObj.suggestion;

    bodyEl.innerHTML = `
      <!-- Coluna Esquerda: Decisão e Personalização -->
      <div class="custom-studio-left">
        
        <!-- 1. Título e Seções Recomendadas -->
        <div class="custom-structure-intro">
          <span class="custom-eyebrow">ESTRUTURA RECOMENDADA</span>
          <h4 class="custom-structure-title">${structureName}</h4>
          <p class="custom-structure-desc">Com base no objetivo escolhido, montamos uma estrutura inicial para sua solução.</p>
        </div>

        <div class="custom-pills-grid" id="custom-structure-pills"></div>

        <!-- 2. Personalização com Adicionais (Cards compactos de 2 colunas, sem textos longos) -->
        <div class="custom-addons-block">
          <h4 class="custom-addons-title">Personalize sua estrutura</h4>
          <p class="custom-addons-desc">Adicione elementos extras para deixar seu projeto ainda mais alinhado com a sua necessidade.</p>
          
          <div class="custom-addon-grid">
            ${CUSTOM_ADDONS.map(a => `
              <button type="button" class="custom-addon-card ${modalState.addons.has(a.id) ? 'is-added' : ''}" data-id="${a.id}">
                <span class="custom-addon-icon">${CUSTOM_ADDON_ICONS[a.id]}</span>
                <div class="custom-addon-info">
                  <strong class="custom-addon-name">${a.label}</strong>
                  <span class="custom-addon-price">+R$ ${a.price}</span>
                </div>
                <span class="custom-addon-btn">${modalState.addons.has(a.id) ? checkSvg + ' Adicionado' : '+ Adicionar'}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 3. IA Secundária e Discreta (conforme diretriz) -->
        <div class="custom-ia-card">
          <div class="custom-ia-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/><circle cx="12" cy="12" r="3.2"/></svg>
          </div>
          <div class="custom-ia-text">
            <h5>Personalize sua estrutura com IA <span class="custom-ia-info" tabindex="0" data-tooltip="Os recursos de IA ficam disponíveis dentro da plataforma Cogit para acompanhamento e personalizações futuras.">i</span></h5>
            <p>Nossa IA poderá ajudar na criação de sugestões visuais, estruturas e personalizações dentro da plataforma.</p>
          </div>
          <button type="button" class="custom-ia-btn" id="custom-ia-access">Acessar pela plataforma</button>
        </div>

      </div>

      <!-- Coluna Direita: Mockup Minimalista + Estimativa Compacta -->
      <div class="custom-studio-right">
        <div class="custom-preview-sticky-wrap">
          <div class="custom-preview-header">
            <span class="custom-preview-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              PRÉ-VISUALIZAÇÃO DA ESTRUTURA
            </span>
          </div>

          <div class="custom-preview-mount" id="custom-preview-mount">
            ${renderWireframePreviewHtml()}
          </div>

          <div class="custom-estimate-summary-mount" id="custom-estimate-summary-mount"></div>
        </div>
      </div>
    `;

    renderStructurePillsList();
    updateEstimateDisplay();

    // Eventos dos cards de adicionais
    bodyEl.querySelectorAll('.custom-addon-card').forEach(card => {
      attachTapHandler(card, () => {
        toggleAddon(card.dataset.id);
      });
    });

    const iaBtn = document.getElementById('custom-ia-access');
    if (iaBtn) {
      iaBtn.addEventListener('click', finalizeProject);
    }

    renderFooter();
  }

  // ── Renderização do Rodapé ──
  function renderFooter() {
    if (modalState.step === 1) {
      footerEl.innerHTML = `
        <button type="button" class="hero-modal-btn-back" id="custom-btn-back-to-studio">${arrowLeftSvg} Voltar à estrutura</button>
        <button type="button" class="hero-modal-btn-select" id="custom-btn-confirm-objective">Continuar com esta estrutura ${arrowRightSvg}</button>
      `;
      document.getElementById('custom-btn-back-to-studio').addEventListener('click', () => {
        modalState.step = 2;
        renderStep2DesktopStudio();
      });
      document.getElementById('custom-btn-confirm-objective').addEventListener('click', () => {
        initBlocksForObjective(modalState.objective);
        modalState.step = 2;
        renderStep2DesktopStudio();
      });
    } else {
      footerEl.innerHTML = `
        <button type="button" class="hero-modal-btn-back" id="custom-btn-change-objective">${arrowLeftSvg} Voltar ao objetivo</button>
        <div class="custom-footer-actions-right">
          <button type="button" class="custom-btn-secondary-link" id="custom-btn-reset-blocks">Restaurar padrão</button>
          <button type="button" class="hero-modal-btn-select" id="custom-btn-finish-studio">Finalizar personalização ${checkSvg}</button>
        </div>
      `;
      document.getElementById('custom-btn-change-objective').addEventListener('click', () => {
        modalState.step = 1;
        renderStep1View();
      });
      document.getElementById('custom-btn-reset-blocks').addEventListener('click', () => {
        initBlocksForObjective(modalState.objective);
        renderStructurePillsList();
        updateAddonCardsState();
        updateDynamicPreview();
      });
      document.getElementById('custom-btn-finish-studio').addEventListener('click', finalizeProject);
    }
  }

  function renderModalView() {
    if (modalState.step === 1) {
      renderStep1View();
    } else {
      renderStep2DesktopStudio();
    }
    bodyEl.classList.add('is-step-entering');
    requestAnimationFrame(() => requestAnimationFrame(() => bodyEl.classList.remove('is-step-entering')));
  }

  renderModalView();
  if (typeof trackEvent === 'function') trackEvent('custom_model_modal_opened', selectedSvc && selectedSvc.id);
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
        <span class="process-step-number">${step.number}</span>
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
