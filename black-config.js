/* COGIT — Black da Cogit 2026: o ÚNICO lugar com datas e preços da Black no site.
 *
 * Horários de Brasília (UTC-03:00). Datas em ISO com o fuso escrito, para não depender do relógio
 * do visitante. No site a checagem é só visual: quem decide o valor cobrado é a plataforma
 * (app_cmkcogit, lib/black-config.js — mantenha os dois arquivos com os mesmos valores).
 *
 * Desligar a Black na hora (site): ligada: false. O botão some, a página mostra que acabou,
 * a home e o simulador voltam aos preços normais. Faça o mesmo na plataforma.
 *
 * Testar datas: ponha um horário em simularAgora (ex.: '2026-11-26T10:00:00-03:00') e recarregue.
 * NUNCA publique com simularAgora preenchido (o npm run check falha se estiver).
 * No computador (localhost) também dá para testar com ?black_agora=2026-11-26T10:00:00-03:00 na URL.
 */
self.COGIT_BLACK = {
  id: 'black-2026',
  ligada: true,
  simularAgora: null,

  inicio: '2026-11-26T00:00:00-03:00',      // preços da Black passam a valer
  fim: '2026-11-28T00:00:00-03:00',         // primeiro instante DEPOIS de 27/11 às 23h59: tudo volta ao normal
  pagamentoValidacaoAte: '2026-12-04T23:59:59-03:00', // Conversão e Operação Conectada, após a validação do escopo

  // Modelos prontos: preço de antes (publicado até 25/11) e preço da Black.
  modelos: {
    'portfolio': { nome: 'Portfólio', de: 500, por: 400 },
    'landing-page': { nome: 'Landing Page', de: 600, por: 480 },
    'site-institucional': { nome: 'Site Institucional', de: 700, por: 560 }
  },

  // Combos: substituem os de 10% durante a Black (os 10% não somam com a Black).
  // pagamento 'imediato' = paga até o fim da Black; 'validacao' = preço garantido, paga após validar o escopo.
  combos: [
    { id: 'autonomo-pronto', nome: 'Autônomo Pronto', novo: true, destaque: true, servicos: ['identidade-essencial', 'portfolio'], modelo: 'modelos-prontos',
      descricao: 'Identidade visual essencial + Portfólio.', de: 1000, por: 750, aPartirDe: false, percentual: 25, pagamento: 'imediato' },
    { id: 'presenca-essencial', nome: 'Presença Essencial', servicos: ['identidade-essencial', 'site-institucional'], modelo: 'modelos-prontos',
      descricao: 'Identidade visual essencial + Site Institucional.', de: 1200, por: 900, aPartirDe: false, percentual: 25, pagamento: 'imediato' },
    { id: 'conversao', nome: 'Conversão', servicos: ['identidade-essencial', 'landing-page', 'automacao'], modelo: 'modelos-prontos',
      descricao: 'Identidade visual essencial + Landing Page + automação de contatos.', de: 1990, por: 1490, aPartirDe: true, percentual: 25, pagamento: 'validacao' },
    { id: 'operacao-conectada', nome: 'Operação Conectada', servicos: ['sistema', 'integracao'],
      descricao: 'Sistema de gestão + integrações de sistemas e pagamentos.', de: 3980, por: 3180, aPartirDe: true, percentual: 20, pagamento: 'validacao' }
  ]
};
