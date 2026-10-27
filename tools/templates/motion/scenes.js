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
    concept: ['Composição editorial', 'para quem vive do', 'próprio trabalho.'],
    palette: { bg: '#eeeae2', stage: '#e4ded3', ink: '#161513', accent: '#b23a1c' },
    font: '"Instrument Serif", serif',
    fontWeight: 400,
    fontText: '"Instrument Sans", sans-serif',
    italicLine: 2,
    tour: [
      { at: 6.0, to: '#trabalhos', offset: -40, caption: 'Projetos com composição editorial' },
      { at: 8.6, to: '#casa-brava .case-body', offset: -260, caption: 'Contexto, processo e entrega' },
      { at: 11.2, to: '#margem', offset: -60, caption: 'Imagens em proporções diferentes' },
      { at: 13.6, to: '#mare-cheia', offset: -100, caption: 'Texto fixo, imagens em sequência' },
      { at: 16.4, to: '#processo', offset: 120, caption: 'Processo em cartões sobrepostos' },
    ],
    interaction: { at: 19.0, to: '.archive', offset: -160, focus: [0.5, 0.42], zoom: 1.45, caption: 'Prévia que acompanha o cursor', action: 'archive' },
    mobileTour: [{ at: 24.4, y: 0 }, { at: 25.6, to: '#trabalhos' }, { at: 27.2, to: '#margem' }],
  },
  institucional: {
    path: '/templates/institucional/',
    label: 'Modelo Site Institucional',
    concept: ['Credibilidade', 'de empresa consolidada,', 'sem perder a proximidade.'],
    palette: { bg: '#123f33', stage: '#ebe7de', ink: '#f5f3ee', accent: '#b88a3e' },
    font: '"Newsreader", serif',
    fontWeight: 400,
    fontText: '"Public Sans", sans-serif',
    italicLine: -1,
    tour: [
      { at: 6.0, to: '#empresa', offset: -60, caption: 'Painel institucional em sobreposição' },
      { at: 8.8, to: '#servicos', offset: -100, caption: 'Serviços organizados em abas' },
      { at: 11.4, to: '#metodo', offset: -80, caption: 'Linha do tempo que acompanha a rolagem' },
      { at: 14.0, to: '#casos', offset: -100, caption: 'Casos com contexto e decisão' },
      { at: 16.6, to: '#duvidas', offset: -80, caption: 'Dúvidas frequentes acessíveis' },
    ],
    interaction: { at: 19.0, to: '#servicos', offset: -100, focus: [0.62, 0.62], zoom: 1.4, caption: 'Abas com teclado e transição suave', action: 'tabs' },
    mobileTour: [{ at: 24.4, y: 0 }, { at: 25.6, to: '#empresa' }, { at: 27.2, to: '#servicos' }],
  },
  landing: {
    path: '/templates/landing/',
    label: 'Modelo Landing Page',
    concept: ['Uma narrativa', 'do problema à ação,', 'sem atrito.'],
    palette: { bg: '#2447d6', stage: '#f1efe7', ink: '#ffffff', accent: '#f4d35e' },
    font: '"Bricolage Grotesque", sans-serif',
    fontWeight: 700,
    fontText: '"Figtree", sans-serif',
    italicLine: -1,
    tour: [
      { at: 6.0, to: '.problem', offset: -40, caption: 'O problema, na rotina do público' },
      { at: 8.6, to: '[data-scene="0"]', offset: -260, caption: 'Solução contada em cenas' },
      { at: 10.4, to: '[data-scene="1"]', offset: -260, caption: 'A tela acompanha o texto' },
      { at: 12.2, to: '[data-scene="2"]', offset: -260, caption: '' },
      { at: 14.4, to: '.benefits', offset: -80, caption: 'Benefícios com hierarquia clara' },
      { at: 16.8, to: '#duvidas', offset: -60, caption: 'Objeções respondidas antes do formulário' },
    ],
    interaction: { at: 19.0, to: '#demonstracao', offset: -60, focus: [0.72, 0.55], zoom: 1.4, caption: 'Validação clara, sem perder o que foi digitado', action: 'form' },
    mobileTour: [{ at: 24.4, y: 0 }, { at: 25.6, to: '.problem' }, { at: 27.2, to: '[data-scene="1"]' }],
  },
};
