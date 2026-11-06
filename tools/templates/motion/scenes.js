/*
  Roteiro de cada vídeo. Tempos em segundos. O palco (stage.html) interpreta este arquivo
  e o gravador (record-video.mjs) captura quadro a quadro, sem depender do tempo real.

  Estrutura comum (≈ 33 s):
    0,0–3,2   Abertura: conceito e nome do modelo sobre a cor da marca.
    3,2–6,0   Navegador entra; o hero carrega com a própria animação do template.
    6,0–19,0  Tour pelas seções (paradas com legenda).
    19,0–23,5 Detalhe de interação com aproximação de câmera.
    23,5–29,0 Desktop + celular lado a lado; o celular rola sozinho.
    29,0–33,0 Encerramento: nome do modelo e convite para a demonstração.
*/
window.MOTION = {
  portfolio: {
    path: '/templates/portfolio/',
    label: 'Modelo Portfólio',
    concept: ['Estrutura pronta', 'para quem vive do', 'próprio trabalho.'],
    palette: { bg: '#eeeae2', stage: '#e4ded3', ink: '#161513', accent: '#b23a1c' },
    font: '"Instrument Serif", serif',
    fontWeight: 400,
    fontText: '"Instrument Sans", sans-serif',
    italicLine: 2,
    tour: [
      { at: 6.0, to: '#trabalhos', offset: -40, caption: 'Grade fixa com até 6 trabalhos' },
      { at: 8.8, to: '#sobre', offset: -60, caption: 'Sobre com foto e números' },
      { at: 11.6, to: '#servicos', offset: -60, caption: 'Até 3 serviços em cartões' },
      { at: 14.4, to: '#depoimentos', offset: -60, caption: 'Depoimentos de clientes' },
      { at: 16.8, to: '#contato', offset: -60, caption: 'WhatsApp, e-mail e formulário' },
    ],
    interaction: { at: 19.0, to: '#contato', offset: -60, focus: [0.72, 0.55], zoom: 1.4, caption: 'Formulário com validação clara', action: 'form' },
    mobileTour: [{ at: 24.4, y: 0 }, { at: 25.6, to: '#trabalhos' }, { at: 27.2, to: '#servicos' }],
  },
  institucional: {
    path: '/templates/institucional/',
    label: 'Modelo Site Institucional',
    concept: ['Quatro páginas', 'prontas para a sua', 'empresa.'],
    palette: { bg: '#123f33', stage: '#ebe7de', ink: '#f5f3ee', accent: '#b88a3e' },
    font: '"Newsreader", serif',
    fontWeight: 400,
    fontText: '"Public Sans", sans-serif',
    italicLine: -1,
    tour: [
      { at: 6.0, to: '#servicos-titulo', offset: -160, caption: 'Início: serviços em destaque' },
      { at: 8.8, to: '#diferenciais-titulo', offset: -160, caption: 'Diferenciais da empresa' },
      { at: 11.6, to: '#casos-titulo', offset: -160, caption: 'Casos com foto e resultado' },
      { at: 14.4, to: '#depoimentos-titulo', offset: -160, caption: 'Depoimentos de clientes' },
      { at: 16.8, to: '#contato', offset: -60, caption: 'Pedido de proposta. Mais Sobre, Serviços e Contato' },
    ],
    interaction: { at: 19.0, to: '#contato', offset: -60, focus: [0.72, 0.55], zoom: 1.4, caption: 'Formulário com validação e LGPD', action: 'form' },
    mobileTour: [{ at: 24.4, y: 0 }, { at: 25.6, to: '#servicos-titulo' }, { at: 27.2, to: '#casos-titulo' }],
  },
  landing: {
    path: '/templates/landing/',
    label: 'Modelo Landing Page',
    concept: ['Cinco seções', 'do interesse ao contato,', 'sem atrito.'],
    palette: { bg: '#2447d6', stage: '#f1efe7', ink: '#ffffff', accent: '#f4d35e' },
    font: '"Bricolage Grotesque", sans-serif',
    fontWeight: 700,
    fontText: '"Figtree", sans-serif',
    italicLine: -1,
    tour: [
      { at: 6.0, to: '#beneficios', offset: -40, caption: '5 seções fixas, na ordem certa' },
      { at: 9.0, to: '#como-funciona', offset: -60, caption: 'Como funciona em 3 passos' },
      { at: 12.0, to: '#depoimentos', offset: -60, caption: 'Depoimentos e números' },
      { at: 15.2, to: '#contato', offset: -60, caption: 'Contato com formulário e dúvidas' },
    ],
    interaction: { at: 19.0, to: '#contato', offset: -60, focus: [0.72, 0.55], zoom: 1.4, caption: 'Validação clara, sem perder o que foi digitado', action: 'form' },
    mobileTour: [{ at: 24.4, y: 0 }, { at: 25.6, to: '#beneficios' }, { at: 27.2, to: '#como-funciona' }],
  },
};
