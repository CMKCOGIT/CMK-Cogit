# Atualização — diagnóstico e "Monte sua solução" levam para a plataforma

Os dois fluxos deixaram de enviar para o WhatsApp. Agora terminam em **"Continuar na plataforma"**,
que abre `https://app.cmkcogit.com.br/continuar.html#cfg=...` com a solução montada. Lá o cliente
entra ou cria a conta e paga (preço fechado) ou aguarda a validação (sob medida).

| Arquivo | Mudança |
|---|---|
| `js/handoff.js` (novo) | Monta o link para a plataforma; guarda a seleção do configurador por 7 dias neste navegador (sem textos livres) |
| `js/components.js` | Resultado do diagnóstico: botão "Continuar na plataforma" no lugar do WhatsApp; link "Detalhar escopo" leva o modelo escolhido; corrigido "Refazer diagnóstico" (chamava função inexistente) e o mapeamento de Produto Digital/Não sei ainda |
| `js/configurator.js` | Etapa final: só observação opcional + "Continuar na plataforma"; retoma a seleção ao voltar à página ("Começar do zero"); aceita `&model=` vindo do diagnóstico |
| `index.html`, `monte-sua-solucao.html` | Carregam `js/handoff.js` |
| `tools/check.mjs` | Testes novos do envio à plataforma (22 verificações) |

Testando no computador (`localhost`), o botão aponta para `http://localhost:3000` (app rodando com `npm run dev`).

Pendência: atualizar `privacidade.html` citando a plataforma (conta do cliente) e o Mercado Pago como operador de pagamento.
