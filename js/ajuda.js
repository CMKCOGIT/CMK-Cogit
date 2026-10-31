/* COGIT — Ajuda: busca nas dúvidas frequentes e mensagem para o suporte.
 * Nada é enviado a servidor: o texto abre pronto no WhatsApp ou no app de e-mail. */
(function () {
  'use strict';

  const WHATSAPP = '5517981568889';
  const EMAIL = 'contato@cmkcogit.com.br';

  // Busca: mostra só as dúvidas que têm o termo (sem acento, sem maiúscula)
  const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const busca = document.getElementById('ajuda-busca');
  const vazio = document.getElementById('ajuda-vazio');
  const itens = [...document.querySelectorAll('#ajuda-lista details')];
  const grupos = [...document.querySelectorAll('#ajuda-lista .help-grupo')];
  busca?.addEventListener('input', () => {
    const termo = normalizar(busca.value.trim());
    let achou = 0;
    itens.forEach((d) => {
      const ok = !termo || normalizar(d.textContent).includes(termo);
      d.hidden = !ok;
      if (termo && ok) d.open = true;
      if (!termo) d.open = false;
      if (ok) achou += 1;
    });
    grupos.forEach((g) => { g.hidden = !g.querySelector('details:not([hidden])'); });
    vazio.hidden = achou > 0;
  });

  // Mensagem para o suporte
  const form = document.getElementById('ajuda-form');
  if (!form) return;
  const nome = document.getElementById('ajuda-nome');
  const assunto = document.getElementById('ajuda-assunto');
  const mensagem = document.getElementById('ajuda-mensagem');
  const contador = document.getElementById('ajuda-contador');
  const erro = document.getElementById('ajuda-erro');
  mensagem.addEventListener('input', () => { contador.textContent = String(mensagem.value.length); });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const canal = event.submitter && event.submitter.dataset.canal === 'email' ? 'email' : 'whatsapp';
    erro.textContent = '';
    if (nome.value.trim().length < 2) { erro.textContent = 'Informe seu nome.'; nome.focus(); return; }
    if (mensagem.value.trim().length < 5) { erro.textContent = 'Escreva sua dúvida.'; mensagem.focus(); return; }
    const texto = 'Olá! Sou ' + nome.value.trim() + '.\nAssunto: ' + assunto.value + '\n\n' + mensagem.value.trim();
    if (typeof trackEvent === 'function') trackEvent('ajuda_contato', { canal });
    if (canal === 'email') {
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Suporte: ' + assunto.value) + '&body=' + encodeURIComponent(texto);
    } else {
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    }
  });
})();
