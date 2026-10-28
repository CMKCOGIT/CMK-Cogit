/* COGIT — Configurador guiado: objetivo, recomendação, formato, complementos e resumo. */
const ConfiguratorApp = (() => {
  const OBJECTIVES = [
    { id: 'atrair-vender', name: 'Atrair e vender', description: 'Gerar oportunidades e transformar visitas em contatos.', icon: 'landing', services: ['landing-page', 'site-institucional', 'automacao'] },
    { id: 'apresentar-empresa', name: 'Apresentar minha empresa', description: 'Construir presença, confiança e autoridade digital.', icon: 'websites', services: ['site-institucional', 'landing-page'] },
    { id: 'mostrar-trabalho', name: 'Mostrar meu trabalho', description: 'Organizar projetos, serviços e resultados em um portfólio.', icon: 'landing', services: ['portfolio', 'site-institucional'] },
    { id: 'automatizar-processo', name: 'Automatizar um processo', description: 'Reduzir tarefas manuais e conectar ferramentas.', icon: 'automation', services: ['automacao', 'sistema', 'integracao'] },
    { id: 'organizar-operacao', name: 'Organizar minha operação', description: 'Centralizar dados, rotinas e acompanhamento.', icon: 'systems', services: ['sistema', 'automacao', 'plataforma'] },
    { id: 'produto-digital', name: 'Criar um produto digital', description: 'Validar uma ideia e preparar o caminho para escalar.', icon: 'mvp', services: ['mvp', 'plataforma'] },
    { id: 'nao-sei', name: 'Ainda não tenho certeza', description: 'Receber orientação para encontrar o melhor ponto de partida.', icon: 'otherSolutions', services: [] }
  ];
  const PRESENCE_IDS = ['site-institucional', 'landing-page', 'portfolio'];
  const STEP_LABELS = ['Objetivo', 'Soluções', 'Formato', 'Complementos', 'Resumo'];
  const ADDON_GROUPS = [
    { name: 'Automação', description: 'Para reduzir tarefas repetitivas.', items: ['automacao-extra'] },
    
    { name: 'Integrações', description: 'Para conectar ferramentas e pagamentos.', items: ['integracao-externa'] },
    
  ];
  const state = { currentStep: 1, totalSteps: 5, selectedObjectives: [], selectedServices: [], selectedAddons: [], showAllServices: false, isComplex: false, formData: {}, restored: false };
  let containerEl = null;
  let lastRenderedStep = null;
  let transitionDirection = 1;

  function esc(value) {
    if (typeof CogitUI !== 'undefined' && CogitUI.escapeHtml) return CogitUI.escapeHtml(String(value || ''));
    return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
  }
  function money(value) {
    const number = Number(value);
    return Number.isFinite(number) ? 'R$ ' + number.toLocaleString('pt-BR') : '';
  }
  function getService(id) { return configuratorData.services.find(item => item.id === id); }
  function getAddon(id) { return configuratorData.addons.find(item => item.id === id); }
  function getObjective(id) { return OBJECTIVES.find(item => item.id === id); }
  function getEntry(id) { return state.selectedServices.find(item => item.serviceId === id); }
  function isPresence(id) { return PRESENCE_IDS.includes(id); }
  function icon(name) { return '<span class="cfg-choice-icon" aria-hidden="true">' + ((typeof ICONS !== 'undefined' && ICONS[name]) || '•') + '</span>'; }
  function track(action, label) { if (typeof window.trackEvent === 'function') window.trackEvent(action, label); }
  function minimum(service) {
    if (!service) return null;
    if (service.hasLevels) {
      const level = service.levels.find(item => item.price != null);
      return level ? level.price : null;
    }
    return service.price;
  }
  function serviceHint(service) {
    const price = minimum(service);
    return price == null ? 'Diagnóstico inicial' : price === 0 ? 'Gratuito' : (service.priceType === 'fixed' ? '' : 'A partir de ') + money(price) + (service.billing === 'monthly' ? '/mês após 3 meses grátis' : '');
  }
  function recommendedIds() {
    const ids = [];
    state.selectedObjectives.forEach(id => {
      const objective = getObjective(id);
      (objective ? objective.services : []).forEach(serviceId => { if (!ids.includes(serviceId)) ids.push(serviceId); });
    });
    return ids;
  }
  function allowedAddons() {
    const allowed = new Set();
    state.selectedServices.forEach(entry => {
      const service = getService(entry.serviceId);
      (service && service.allowedAddons || []).forEach(id => allowed.add(id));
    });
    if (state.selectedServices.some(entry => entry.serviceId === 'automacao')) allowed.delete('automacao-extra');
    return allowed;
  }
  function checkComplexity() {
    const ids = state.selectedServices.map(entry => entry.serviceId);
    const combination = (configuratorData.complexCombinations || []).some(combo => combo.every(id => ids.includes(id)));
    const customModel = false;
    const customItems = state.selectedServices.filter(entry => entry.priceType === 'analysis' || entry.priceType === 'custom').length;
    return combination || customModel || customItems >= 2;
  }
  function calculateTotal() {
    state.isComplex = checkComplexity();
    let value = 0;
    let hasFrom = false;
    let hasCustom = false;
    state.selectedServices.forEach(entry => {
      if (['analysis', 'custom'].includes(entry.priceType)) { hasCustom = true; return; }
      if (entry.billing === 'monthly') return;
      if (entry.price != null) { value += Number(entry.price); if (entry.priceType === 'from') hasFrom = true; }
    });
    state.selectedAddons.forEach(entry => {
      if (['analysis', 'custom'].includes(entry.priceType)) { hasCustom = true; return; }
      if (entry.price != null) { value += Number(entry.price) * (entry.quantity || 1); if (entry.priceType === 'from') hasFrom = true; }
    });
    if (hasCustom && value) return { type: 'partial', value, hasFrom };
    if (hasCustom) return { type: 'custom', value: null };
    if (value) return { type: hasFrom ? 'from' : 'fixed', value };
    if (state.selectedServices.some(entry => entry.serviceId === 'diagnostico')) return {type:'free',value:0};
    return { type: 'pending', value: null };
  }
  function estimate(short) {
    const total = calculateTotal();
    if (total.type === 'free') return 'Gratuito';
    if (total.type === 'custom') return short ? 'Sob análise' : 'Investimento sob análise';
    if (total.type === 'partial') return (total.hasFrom ? 'A partir de ' : '') + money(total.value) + (short ? ' +' : ' + itens sob análise');
    if (total.type === 'from') return 'A partir de ' + money(total.value);
    if (total.type === 'fixed') return money(total.value);
    return short ? 'A definir' : 'Configure para estimar';
  }
  function rememberForm() {
    if (!containerEl) return;
    containerEl.querySelectorAll('.cfg-form input:not([type="checkbox"]),.cfg-form textarea').forEach(field => { state.formData[field.id] = field.value; });
  }
  function restoreForm() {
    if (!containerEl) return;
    containerEl.querySelectorAll('.cfg-form input:not([type="checkbox"]),.cfg-form textarea').forEach(field => { field.value = state.formData[field.id] || ''; });
  }
  function render() {
    saveSession();
    if (!containerEl) return;
    rememberForm();
    const previous = lastRenderedStep;
    containerEl.innerHTML = '<div class="cfg-shell"><div class="cfg-main">' + renderProgress() + renderRestoredNote() + '<div class="cfg-stage" aria-live="polite">' + renderStep() + '</div>' + renderNavigation() + '</div>' + renderSummary() + '</div>' + renderMobileDock();
    restoreForm();
    bindEvents();
    if (previous !== null && previous !== state.currentStep) {
      animateStage();
      const heading = containerEl.querySelector('.cfg-step-title');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    }
    lastRenderedStep = state.currentStep;
  }
  function renderRestoredNote() {
    return state.restored ? '<p class="cfg-inline-note"><span aria-hidden="true"><i class="bi bi-arrow-counterclockwise"></i></span> Retomamos a solução que você começou neste navegador. <button class="cfg-text-action" type="button" id="cfg-restart">Começar do zero</button></p>' : '';
  }
  // Guarda só a seleção (sem textos livres) por 7 dias neste navegador.
  function saveSession() {
    if (typeof CogitHandoff === 'undefined') return;
    if (!state.selectedObjectives.length && !state.selectedServices.length) { CogitHandoff.limparSessao(); return; }
    CogitHandoff.salvarSessao({ step: state.currentStep, objectives: state.selectedObjectives, services: state.selectedServices, addons: state.selectedAddons });
  }
  function restoreSession() {
    if (typeof CogitHandoff === 'undefined') return false;
    const saved = CogitHandoff.lerSessao();
    if (!saved || !Array.isArray(saved.services)) return false;
    state.selectedObjectives = (saved.objectives || []).filter(id => getObjective(id));
    state.selectedServices = saved.services.filter(entry => entry && getService(entry.serviceId)).map(entry => {
      const service = getService(entry.serviceId);
      const modelId = isPresence(service.id) && ['modelos-prontos', 'sob-medida'].includes(entry.modelId) ? entry.modelId : null;
      const custom = modelId === 'sob-medida';
      return { serviceId: service.id, modelId, levelId: null, levelName: null, price: custom ? service.customPrice : service.price, priceType: custom ? 'from' : service.priceType, billing: service.billing || null };
    });
    const allowed = allowedAddons();
    state.selectedAddons = (saved.addons || []).filter(entry => entry && getAddon(entry.addonId) && allowed.has(entry.addonId)).map(entry => {
      const addon = getAddon(entry.addonId);
      return { addonId: addon.id, name: addon.name, price: addon.price, priceType: addon.priceType, quantity: addon.allowQuantity ? Math.min(99, Math.max(1, Number(entry.quantity) || 1)) : null };
    });
    if (!state.selectedObjectives.length && !state.selectedServices.length) return false;
    const target = Math.min(Math.max(Number(saved.step) || 1, 1), state.totalSteps);
    let step = 1;
    while (step < target) { state.currentStep = step; if (!canAdvance()) break; step += 1; }
    state.currentStep = step;
    state.restored = true;
    return true;
  }
  function animateStage() {
    if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const stage = containerEl.querySelector('.cfg-stage');
    if (!stage || !stage.animate) return;
    stage.animate([
      { opacity: .45, clipPath: transitionDirection > 0 ? 'inset(0 0 0 8% round 18px)' : 'inset(0 8% 0 0 round 18px)', transform: 'translateX(' + transitionDirection * 12 + 'px)' },
      { opacity: 1, clipPath: 'inset(0 0 0 0 round 18px)', transform: 'translateX(0)' }
    ], { duration: 430, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  function renderProgress() {
    const percent = (state.currentStep - 1) / (state.totalSteps - 1) * 100;
    return '<div class="cfg-progress" aria-label="Progresso do configurador"><div class="cfg-progress-copy"><span>Etapa ' + state.currentStep + ' de ' + state.totalSteps + '</span><strong>' + STEP_LABELS[state.currentStep - 1] + '</strong></div><div class="cfg-progress-track" aria-hidden="true"><span style="width:' + percent + '%"></span></div><ol class="cfg-progress-list">' + STEP_LABELS.map((label, index) => {
      const number = index + 1;
      return '<li class="' + (number === state.currentStep ? 'is-active' : number < state.currentStep ? 'is-done' : '') + '"><span>' + (number < state.currentStep ? '<i class="bi bi-check-lg" aria-hidden="true"></i>' : number) + '</span><small>' + label + '</small></li>';
    }).join('') + '</ol></div>';
  }
  function renderStep() {
    if (state.currentStep === 1) return renderObjectives();
    if (state.currentStep === 2) return renderSolutions();
    if (state.currentStep === 3) return renderFormats();
    if (state.currentStep === 4) return renderAddons();
    return renderFinal();
  }
  function heading(eyebrow, title, text) {
    return '<div class="cfg-step-heading"><span class="cfg-eyebrow">' + eyebrow + '</span><h2 class="cfg-step-title">' + title + '</h2><p>' + text + '</p></div>';
  }
  function renderObjectives() {
    return '<section class="cfg-step" data-step="1">' + heading('Comece pelo resultado', 'O que você quer alcançar?', 'Escolha uma ou mais opções. Você poderá ajustar tudo nas próximas etapas.') + '<div class="cfg-objectives-grid">' + OBJECTIVES.map(objective => {
      const selected = state.selectedObjectives.includes(objective.id);
      return '<button class="cfg-objective-card ' + (selected ? 'is-selected' : '') + '" type="button" data-objective-id="' + objective.id + '" aria-pressed="' + selected + '">' + icon(objective.icon) + '<span class="cfg-choice-copy"><strong>' + objective.name + '</strong><small>' + objective.description + '</small></span><span class="cfg-check" aria-hidden="true"><i class="bi bi-check-lg"></i></span></button>';
    }).join('') + '</div><p class="cfg-inline-note"><span aria-hidden="true"><i class="bi bi-info-circle"></i></span> Não é necessário conhecer termos técnicos. As recomendações são baseadas no objetivo selecionado.</p></section>';
  }
  function solutionDescription(id) {
    return ({
      'site-institucional': 'Presença completa para apresentar empresa, serviços e diferenciais.',
      'landing-page': 'Página direta para campanhas, ofertas e captação de contatos.',
      'automacao': 'Fluxos que conectam ferramentas e reduzem tarefas manuais.',
      'sistema': 'Software pensado para as regras e rotinas da sua operação.',
      
      'mvp': 'Primeira versão funcional para validar uma ideia com agilidade.',
      'plataforma': 'Ambiente digital que reúne usuários, recursos e processos.'
    })[id] || 'Solução definida depois de entendermos sua necessidade.';
  }
  function renderSolutions() {
    const recommended = recommendedIds();
    const unsureOnly = state.selectedObjectives.includes('nao-sei') && !recommended.length;
    let services = configuratorData.services.slice().sort((a, b) => Number(recommended.includes(b.id)) - Number(recommended.includes(a.id)));
    if (!state.showAllServices && !unsureOnly) services = services.filter(service => recommended.includes(service.id) || getEntry(service.id));
    return '<section class="cfg-step" data-step="2">' + heading('Recomendação guiada', 'Escolha o que fará parte da solução', unsureOnly ? 'Explore as possibilidades ou selecione “Outras soluções” para receber orientação.' : 'Selecionamos os caminhos mais coerentes com o que você quer alcançar.') + '<div class="cfg-services-v2-grid">' + services.map(service => {
      const selected = !!getEntry(service.id);
      return '<button class="cfg-solution-card ' + (selected ? 'is-selected' : '') + '" type="button" data-service-id="' + service.id + '" aria-pressed="' + selected + '"><span class="cfg-solution-top">' + icon(service.icon) + (recommended.includes(service.id) ? '<span class="cfg-recommended">Recomendado</span>' : '') + '</span><span class="cfg-choice-copy"><strong>' + service.name + '</strong><small>' + (service.description || solutionDescription(service.id)) + '</small></span><span class="cfg-solution-bottom"><span>' + serviceHint(service) + '</span><span class="cfg-add-label">' + (selected ? 'Adicionado <i class="bi bi-check-lg" aria-hidden="true"></i>' : 'Adicionar <i class="bi bi-plus-lg" aria-hidden="true"></i>') + '</span></span></button>';
    }).join('') + '</div>' + (!state.showAllServices && !unsureOnly ? '<button class="cfg-text-action" type="button" id="cfg-show-all">Ver todas as soluções <span aria-hidden="true"><i class="bi bi-chevron-down"></i></span></button>' : '') + '</section>';
  }
  function levelPrice(level) {
    return ['analysis', 'custom'].includes(level.priceType) || level.price == null ? 'Sob análise' : (level.priceType === 'from' ? 'A partir de ' : '') + money(level.price);
  }
  function renderModel(entry, modelId, name, description) {
    const selected = entry.modelId === modelId;
    return '<button type="button" class="cfg-model-option ' + (selected ? 'is-selected' : '') + '" data-model-service="' + entry.serviceId + '" data-model-id="' + modelId + '" aria-pressed="' + selected + '"><span class="cfg-model-radio" aria-hidden="true"></span><span><strong>' + name + '</strong><small>' + description + '</small></span></button>';
  }
  const ACTION_ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l5.5-3.5z" fill="currentColor" stroke="none"/></svg>',
    layout: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>'
  };
  // Ação de cada formato: modelo pronto abre vídeo e demonstração; sob medida abre o estúdio de estrutura.
  function renderModelAction(entry) {
    if (!entry.modelId) return '';
    const pronto = entry.modelId === 'modelos-prontos';
    const structure = !pronto && customStructures[entry.serviceId];
    const label = pronto ? 'Ver modelo e demonstração' : (structure ? 'Editar estrutura' : 'Personalizar estrutura');
    const note = pronto ? 'Vídeo e site navegável do modelo'
      : structure ? 'Estrutura montada: ' + structure.sections.length + ' seções' + (structure.components.length ? ' · ' + structure.components.length + ' componente' + (structure.components.length > 1 ? 's' : '') : '')
      : 'Escolha seções e componentes, como vídeo e galeria';
    return '<div class="cfg-model-action"><button class="cfg-model-action-btn" type="button" data-preview-service="' + entry.serviceId + '">' + ACTION_ICONS[pronto ? 'play' : 'layout'] + '<span>' + label + '</span></button><span class="cfg-model-action-note">' + esc(note) + '</span></div>';
  }
  function openModelAction(serviceId) {
    const entry = getEntry(serviceId);
    if (!entry) return;
    if (entry.modelId === 'sob-medida' && window.openCustomModelModal) {
      window.openCustomModelModal(serviceId, summary => {
        customStructures[serviceId] = summary;
        if (getEntry(serviceId)?.modelId !== 'sob-medida') selectSolutionModel('sob-medida', serviceId); else render();
      }, { project: customStructures[serviceId] || null });
    } else if (window.openModelPreviewModal) {
      window.openModelPreviewModal(serviceId, undefined, {
        // Só troca o formato se ainda não for modelo pronto: selectSolutionModel zera o escopo escolhido.
        onSelect: () => { if (getEntry(serviceId)?.modelId !== 'modelos-prontos') selectSolutionModel('modelos-prontos', serviceId); }
      });
    }
  }
  function renderConfiguration(entry, index) {
    const service = getService(entry.serviceId);
    if (!service) return '';
    let controls = '';
    if (isPresence(service.id)) {
      controls += '<div class="cfg-control-group"><span class="cfg-control-label">Modelo</span><div class="cfg-model-toggle">' + renderModel(entry, 'modelos-prontos', 'Modelo pronto', 'Você envia identidade visual, textos e imagens. A estrutura não muda.') + renderModel(entry, 'sob-medida', 'Sob medida', 'Estrutura, seções e visual personalizados para o seu negócio.') + '</div>' + renderModelAction(entry) + '</div>';
    }
    const showLevels = service.hasLevels && (!isPresence(service.id) || entry.modelId === 'modelos-prontos');
    if (showLevels) {
      controls += '<div class="cfg-control-group"><span class="cfg-control-label">' + (isPresence(service.id) ? 'Escopo inicial' : 'Nível de complexidade') + '</span><div class="cfg-levels-v2">' + service.levels.map(level => {
        const selected = entry.levelId === level.id;
        return '<button type="button" class="cfg-level-v2 ' + (selected ? 'is-selected' : '') + '" data-level-service="' + service.id + '" data-level-id="' + level.id + '" aria-pressed="' + selected + '"><span><strong>' + level.name + '</strong><small>' + level.description + '</small></span><span class="cfg-level-price">' + levelPrice(level) + '</span></button>';
      }).join('') + '</div></div>';
    } else if (!service.hasLevels && !isPresence(service.id)) {
      controls += '<div class="cfg-diagnosis-box"><span>Diagnóstico orientado</span><p>A COGIT valida regras, integrações e prioridades antes de confirmar escopo e investimento.</p></div>';
    } else if (isPresence(service.id) && entry.modelId === 'sob-medida') {
      controls += '<div class="cfg-diagnosis-box"><span>A partir de ' + money(service.customPrice) + '</span><p>Estrutura, seções e visual podem ser definidos para o negócio. O escopo final será confirmado em proposta.</p></div>';
    } else if (isPresence(service.id) && entry.modelId === 'modelos-prontos' && !service.hasLevels) {
      controls += '<div class="cfg-diagnosis-box is-ready"><span>Estrutura pronta para personalizar</span><p>Identidade visual, conteúdo e informações do seu negócio serão aplicados ao modelo.</p></div>';
    }
    return '<article class="cfg-config-block" style="--cfg-index:' + index + '"><header><span class="cfg-config-number">' + String(index + 1).padStart(2, '0') + '</span><div>' + icon(service.icon) + '<h3>' + service.name + '</h3></div><button type="button" class="cfg-remove-service" data-remove-service="' + service.id + '" aria-label="Remover ' + esc(service.name) + '">Remover</button></header>' + controls + '</article>';
  }
  function renderFormats() {
    return '<section class="cfg-step" data-step="3">' + heading('Formato e profundidade', 'Como você quer começar?', 'Cada parte da solução pode ter um formato diferente.') + '<div class="cfg-config-list">' + state.selectedServices.map(renderConfiguration).join('') + '</div></section>';
  }
  function renderAddon(addon) {
    const selected = state.selectedAddons.find(item => item.addonId === addon.id);
    const price = ['custom', 'analysis'].includes(addon.priceType) || addon.price == null ? 'Sob análise' : (addon.priceType === 'from' ? 'A partir de ' : '+ ') + money(addon.price);
    return '<div class="cfg-addon-v2 ' + (selected ? 'is-selected' : '') + '"><button type="button" class="cfg-addon-select" data-addon-id="' + addon.id + '" aria-pressed="' + !!selected + '"><span class="cfg-check" aria-hidden="true"><i class="bi bi-check-lg"></i></span><span><strong>' + addon.name + '</strong><small>' + price + '</small></span></button>' + (selected && addon.allowQuantity ? '<div class="cfg-quantity"><button type="button" data-addon-action="minus" data-addon-id="' + addon.id + '" aria-label="Diminuir quantidade"><i class="bi bi-dash" aria-hidden="true"></i></button><span aria-live="polite">' + (selected.quantity || 1) + '</span><button type="button" data-addon-action="plus" data-addon-id="' + addon.id + '" aria-label="Aumentar quantidade"><i class="bi bi-plus" aria-hidden="true"></i></button></div>' : '') + '</div>';
  }
  function renderAddons() {
    const allowed = allowedAddons();
    const groups = ADDON_GROUPS.map(group => {
      const addons = group.items.map(getAddon).filter(addon => addon && allowed.has(addon.id));
      return addons.length ? '<section class="cfg-addon-group"><header><h3>' + group.name + '</h3><p>' + group.description + '</p></header><div class="cfg-addons-v2-grid">' + addons.map(renderAddon).join('') + '</div></section>' : '';
    }).join('');
    return '<section class="cfg-step" data-step="4">' + heading('Deixe a solução mais completa', 'Quer adicionar algo?', 'Mostramos apenas complementos compatíveis. Esta etapa é opcional.') + (groups || '<div class="cfg-empty-state"><strong>Sua seleção já está completa.</strong><p>Não há complementos necessários para esta combinação.</p></div>') + '</section>';
  }
  function field(id, name, label, type, placeholder, required, autocomplete, maxlength) {
    return '<div class="form-group"><label class="form-label" for="' + id + '">' + label + (required ? ' <span class="required">*</span>' : '') + '</label><input class="form-input" type="' + type + '" id="' + id + '" name="' + name + '" autocomplete="' + autocomplete + '" maxlength="' + maxlength + '" placeholder="' + placeholder + '" ' + (required ? 'required' : '') + '></div>';
  }
  function renderFinal() {
    const needsValidation = calculateTotal().type !== 'fixed';
    const howItWorks = needsValidation
      ? 'Na plataforma você entra ou cria sua conta e a solicitação vai para a validação técnica. Quando a equipe confirmar escopo e valor, o pagamento é liberado lá mesmo.'
      : 'O preço já está fechado. Na plataforma você entra ou cria sua conta, confere o resumo e paga com Pix, cartão ou boleto pelo Mercado Pago.';
    return '<section class="cfg-step cfg-final" data-step="5">' + heading('Configuração concluída', 'Sua solução está pronta para avançar.', needsValidation ? 'A equipe valida os detalhes técnicos antes de confirmar escopo, prazo e investimento.' : 'Escopo e investimento já estão definidos para esta configuração.') + '<div class="cfg-final-estimate"><span>Investimento inicial</span><strong>' + estimate(false) + '</strong><p>Valores consideram o escopo selecionado. Todo projeto inclui 3 meses de suporte grátis; planos mensais escolhidos começam depois desse período.</p></div><div class="cfg-next-path"><span class="cfg-path-dot"></span><div><strong>Próximo passo</strong><p>' + (needsValidation ? 'Validação técnica na plataforma COGIT e liberação do pagamento.' : 'Pagamento seguro na plataforma COGIT.') + '</p></div></div><form class="cfg-form" id="cfg-contact-form" novalidate><div class="cfg-form-heading"><h3>Continuar na plataforma COGIT</h3><p>' + howItWorks + '</p></div><div class="cfg-form-grid"><div class="form-group full-width"><label class="form-label" for="cfg-notes">Algo importante sobre o projeto? (opcional)</label><textarea class="form-textarea" maxlength="2000" id="cfg-notes" name="notes" placeholder="Contexto, prazo ou necessidade específica..." rows="3"></textarea></div></div><p id="cfg-contact-status" class="form-status" role="status"></p><button class="btn btn-primary btn-lg cfg-submit-btn" type="submit" id="cfg-submit">Continuar na plataforma <span aria-hidden="true"><i class="bi bi-arrow-right"></i></span></button><p class="cfg-inline-note"><span aria-hidden="true"><i class="bi bi-shield-check"></i></span> Sua seleção vai junto e fica salva até você entrar. O valor é conferido novamente pela plataforma antes do pagamento.</p></form></section>';
  }
  function entryPrice(entry) {
    if (['custom', 'analysis'].includes(entry.priceType)) return 'Análise';
    return entry.price == null ? '—' : (entry.priceType === 'from' ? 'A partir de ' : '') + money(entry.price) + (entry.billing === 'monthly' ? '/mês após 3 meses grátis' : '');
  }
  function summaryService(entry) {
    const service = getService(entry.serviceId);
    if (!service) return '';
    const detail = [];
    if (entry.modelId) detail.push(entry.modelId === 'modelos-prontos' ? 'Modelo pronto' : 'Sob medida');
    if (entry.levelName) detail.push(entry.levelName);
    return '<div><span><strong>' + service.name + '</strong><small>' + (detail.length ? detail.join(' · ') : 'A configurar') + '</small></span><em>' + entryPrice(entry) + '</em></div>';
  }
  function summaryAddon(entry) {
    const quantity = entry.quantity && entry.quantity > 1 ? ' × ' + entry.quantity : '';
    const price = ['custom', 'analysis'].includes(entry.priceType) ? 'Análise' : '+ ' + money(Number(entry.price) * (entry.quantity || 1));
    return '<div><span><strong>' + entry.name + quantity + '</strong></span><em>' + price + '</em></div>';
  }
  function renderSummary() {
    const objectives = state.selectedObjectives.map(getObjective).filter(Boolean);
    return '<section class="cfg-summary-v2" aria-label="Resumo da solução"><div class="cfg-summary-head"><span>Resumo ao vivo</span><strong>Sua solução</strong></div>' + (objectives.length ? '<div class="cfg-summary-section"><span class="cfg-summary-label">Objetivos</span><div class="cfg-summary-tags">' + objectives.map(item => '<span>' + item.name + '</span>').join('') + '</div></div>' : '<div class="cfg-summary-empty"><span>01</span><p>Escolha um objetivo para começar.</p></div>') + (state.selectedServices.length ? '<div class="cfg-summary-section"><span class="cfg-summary-label">Soluções</span><div class="cfg-summary-lines">' + state.selectedServices.map(summaryService).join('') + '</div></div>' : '') + (state.selectedAddons.length ? '<div class="cfg-summary-section"><span class="cfg-summary-label">Complementos</span><div class="cfg-summary-lines">' + state.selectedAddons.map(summaryAddon).join('') + '</div></div>' : '') + '<div class="cfg-summary-total-v2"><span>Investimento inicial</span><strong>' + estimate(false) + '</strong><small>Todo projeto inclui 3 meses de suporte grátis. Planos mensais selecionados começam depois.</small></div><div class="cfg-summary-security"><span aria-hidden="true"><i class="bi bi-shield-check"></i></span><p>Você revisa tudo antes de compartilhar seus dados.</p></div></section>';
  }
  function configurationComplete() {
    return state.selectedServices.every(entry => {
      const service = getService(entry.serviceId);
      if (!service) return false;
      if (isPresence(service.id)) {
        if (!entry.modelId) return false;
        return !(entry.modelId === 'modelos-prontos' && service.hasLevels && !entry.levelId);
      }
      return !service.hasLevels || !!entry.levelId;
    });
  }
  function canAdvance() {
    if (state.currentStep === 1) return state.selectedObjectives.length > 0;
    if (state.currentStep === 2) return state.selectedServices.length > 0;
    if (state.currentStep === 3) return configurationComplete();
    return state.currentStep < state.totalSteps;
  }
  function nextLabel() {
    return ({ 1: 'Ver recomendações', 2: 'Configurar solução', 3: 'Escolher complementos', 4: 'Revisar solução' })[state.currentStep] || 'Continuar';
  }
  function renderNavigation() {
    const back = state.currentStep > 1;
    const next = state.currentStep < state.totalSteps;
    return '<div class="cfg-nav-v2">' + (back ? '<button class="btn cfg-back-v2" type="button" id="cfg-back"><span aria-hidden="true"><i class="bi bi-arrow-left"></i></span> Voltar</button>' : '<span></span>') + (next ? '<button class="btn btn-primary cfg-next-v2" type="button" id="cfg-next" ' + (!canAdvance() ? 'disabled' : '') + '>' + nextLabel() + ' <span aria-hidden="true"><i class="bi bi-arrow-right"></i></span></button>' : '') + '</div>';
  }
  function renderMobileDock() {
    return state.currentStep >= state.totalSteps ? '' : '<div class="cfg-mobile-dock"><span><small>Estimativa</small><strong>' + estimate(true) + '</strong></span><button type="button" data-mobile-next ' + (!canAdvance() ? 'disabled' : '') + '>' + nextLabel() + ' <span aria-hidden="true"><i class="bi bi-arrow-right"></i></span></button></div>';
  }
  function bindEvents() {
    containerEl.querySelectorAll('[data-objective-id]').forEach(button => button.addEventListener('click', () => toggleObjective(button.dataset.objectiveId)));
    containerEl.querySelectorAll('[data-service-id]').forEach(button => button.addEventListener('click', () => toggleService(button.dataset.serviceId)));
    containerEl.querySelectorAll('[data-remove-service]').forEach(button => button.addEventListener('click', () => toggleService(button.dataset.removeService)));
    containerEl.querySelectorAll('[data-model-service]').forEach(button => button.addEventListener('click', () => selectSolutionModel(button.dataset.modelId, button.dataset.modelService)));
    containerEl.querySelectorAll('[data-preview-service]').forEach(button => button.addEventListener('click', () => openModelAction(button.dataset.previewService)));
    containerEl.querySelectorAll('[data-level-service]').forEach(button => button.addEventListener('click', () => selectLevel(button.dataset.levelService, button.dataset.levelId)));
    containerEl.querySelectorAll('.cfg-addon-select').forEach(button => button.addEventListener('click', () => toggleAddon(button.dataset.addonId)));
    containerEl.querySelectorAll('[data-addon-action]').forEach(button => button.addEventListener('click', () => updateAddonQuantity(button.dataset.addonId, button.dataset.addonAction)));
    document.getElementById('cfg-show-all')?.addEventListener('click', () => { state.showAllServices = true; render(); });
    document.getElementById('cfg-back')?.addEventListener('click', goBack);
    document.getElementById('cfg-next')?.addEventListener('click', goNext);
    containerEl.querySelector('[data-mobile-next]')?.addEventListener('click', goNext);
    document.getElementById('cfg-contact-form')?.addEventListener('submit', submitConfiguration);
    document.getElementById('cfg-restart')?.addEventListener('click', () => { if (typeof CogitHandoff !== 'undefined') CogitHandoff.limparSessao(); reset(); });
  }
  function toggleObjective(id) {
    const index = state.selectedObjectives.indexOf(id);
    if (index >= 0) state.selectedObjectives.splice(index, 1); else state.selectedObjectives.push(id);
    state.showAllServices = false;
    track('configurator_objective', id);
    render();
  }
  function toggleService(id) {
    const index = state.selectedServices.findIndex(entry => entry.serviceId === id);
    if (index >= 0) {
      state.selectedServices.splice(index, 1);
      track('configurator_deselect', id);
    } else {
      const service = getService(id);
      if (!service) return;
      if (service.billing === 'monthly') state.selectedServices = state.selectedServices.filter(entry => entry.billing !== 'monthly');
      state.selectedServices.push({ serviceId: id, modelId: null, levelId: null, levelName: null, price: service.hasLevels ? null : service.price, priceType: service.hasLevels ? null : service.priceType, billing: service.billing || null });
      track('configurator_select', id);
    }
    const allowed = allowedAddons();
    state.selectedAddons = state.selectedAddons.filter(addon => allowed.has(addon.addonId));
    render();
  }
  function selectSolutionModel(modelId, serviceId) {
    const targets = serviceId ? state.selectedServices.filter(entry => entry.serviceId === serviceId) : state.selectedServices.filter(entry => isPresence(entry.serviceId));
    targets.forEach(entry => {
      const service = getService(entry.serviceId);
      entry.modelId = modelId;
      entry.levelId = null;
      entry.levelName = null;
      if (modelId === 'sob-medida') { entry.price = service.customPrice; entry.priceType = 'from'; }
      else if (!service.hasLevels) { entry.price = service.price; entry.priceType = service.priceType; entry.billing = service.billing || null; }
      else { entry.price = null; entry.priceType = null; }
    });
    track('configurator_model', (serviceId || 'presence') + ':' + modelId);
    render();
  }
  function selectLevel(serviceId, levelId) {
    const entry = getEntry(serviceId);
    const service = getService(serviceId);
    const level = service && service.levels && service.levels.find(item => item.id === levelId);
    if (!entry || !level) return;
    entry.levelId = level.id;
    entry.levelName = level.name;
    entry.price = level.price;
    entry.priceType = level.priceType;
    track('configurator_level', serviceId + ':' + levelId);
    render();
  }
  function toggleAddon(id) {
    const index = state.selectedAddons.findIndex(entry => entry.addonId === id);
    if (index >= 0) state.selectedAddons.splice(index, 1);
    else {
      const addon = getAddon(id);
      if (!addon) return;
      state.selectedAddons.push({ addonId: addon.id, name: addon.name, price: addon.price, priceType: addon.priceType, quantity: addon.allowQuantity ? 1 : null });
    }
    render();
  }
  function updateAddonQuantity(id, action) {
    const addon = state.selectedAddons.find(entry => entry.addonId === id);
    if (!addon || addon.quantity == null) return;
    if (action === 'plus') addon.quantity = Math.min(99, addon.quantity + 1);
    else if (addon.quantity > 1) addon.quantity -= 1;
    else state.selectedAddons = state.selectedAddons.filter(entry => entry.addonId !== id);
    render();
  }
  function goNext() {
    if (!canAdvance() || state.currentStep >= state.totalSteps) return;
    state.currentStep += 1;
    transitionDirection = 1;
    track('configurator_step', 'step_' + state.currentStep);
    render();
    scrollToConfigurator();
  }
  function goBack() {
    if (state.currentStep <= 1) return;
    state.currentStep -= 1;
    transitionDirection = -1;
    render();
    scrollToConfigurator();
  }
  function scrollToConfigurator() {
    const target = document.getElementById('configurator');
    if (!target) return;
    const header = document.querySelector('.header');
    const offset = header ? header.offsetHeight + 14 : 84;
    const behavior = typeof CogitUI !== 'undefined' && CogitUI.motion ? CogitUI.motion() : 'smooth';
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior });
  }
  // Estruturas montadas no estúdio sob medida, só em memória (vão nas notas do envio).
  const customStructures = {};
  function buildHandoff() {
    const notes = document.getElementById('cfg-notes');
    const structures = state.selectedServices.filter(entry => entry.modelId === 'sob-medida' && customStructures[entry.serviceId])
      .map(entry => { const c = customStructures[entry.serviceId]; return `Estrutura sob medida (${c.suggestion}): ${c.sections.join(' > ')}${c.components.length ? `\nComponentes: ${c.components.join(', ')}` : ''}`; });
    return {
      origem: 'configurador',
      objetivos: state.selectedObjectives.slice(),
      servicos: state.selectedServices.map(entry => {
        const service = getService(entry.serviceId);
        return { id: entry.serviceId, modelo: entry.modelId || null, nome: service ? service.name : entry.serviceId };
      }),
      complementos: state.selectedAddons.map(entry => ({ id: entry.addonId, qtd: entry.quantity || 1, nome: entry.name })),
      notas: structures.concat(notes ? notes.value.trim() : (state.formData['cfg-notes'] || '')).filter(Boolean).join('\n'),
      estimativa: estimate(false)
    };
  }
  function submitConfiguration(event) {
    event.preventDefault();
    const status = document.getElementById('cfg-contact-status');
    if (!state.selectedServices.length || !configurationComplete()) {
      if (status) status.textContent = 'Revise as etapas anteriores: falta escolher o formato de alguma solução.';
      return;
    }
    if (typeof CogitHandoff === 'undefined') {
      if (status) status.textContent = 'Não foi possível abrir a plataforma agora. Recarregue a página e tente novamente.';
      return;
    }
    const button = document.getElementById('cfg-submit');
    if (button) button.disabled = true;
    if (status) status.textContent = 'Abrindo a plataforma COGIT...';
    track('configurator_completed', 'services:' + state.selectedServices.length + ',addons:' + state.selectedAddons.length);
    CogitHandoff.irParaPlataforma(buildHandoff());
  }
  function reset() {
    Object.assign(state, { currentStep: 1, selectedObjectives: [], selectedServices: [], selectedAddons: [], showAllServices: false, isComplex: false, formData: {}, restored: false });
    render();
  }
  function preselectAndScroll(servicesArray) {
    if (!containerEl || !Array.isArray(servicesArray)) return;
    state.selectedServices = [];
    Array.from(new Set(servicesArray)).forEach(id => {
      const service = getService(id);
      if (service) state.selectedServices.push({ serviceId: id, modelId: null, levelId: null, levelName: null, price: service.hasLevels ? null : service.price, priceType: service.hasLevels ? null : service.priceType, billing: service.billing || null });
    });
    state.currentStep = state.selectedServices.length ? 3 : 1;
    render();
    if (state.selectedServices.length) scrollToConfigurator();
  }
  function init() {
    containerEl = document.getElementById('configurator-app');
    if (!containerEl) return;
    track('configurator_open', 'guided_v2');
    const params = new URLSearchParams(window.location.search);
    let services = params.get('services');
    const problem = params.get('problem');
    if (!services && problem && typeof problemFlowsData !== 'undefined') {
      const flow = problemFlowsData.find(item => item.id === problem);
      if (flow && flow.preselect) services = flow.preselect.join(',');
    }
    if (services) {
      preselectAndScroll(services.split(',').map(item => item.trim()).filter(Boolean));
      const model = params.get('model');
      if (['modelos-prontos', 'sob-medida'].includes(model) && state.selectedServices.some(entry => isPresence(entry.serviceId))) selectSolutionModel(model);
      return;
    }
    restoreSession();
    render();
  }
  return { init, reset, preselectAndScroll };
})();
function initConfigurator() { ConfiguratorApp.init(); }
