# Diagnóstico COGIT e estúdio sob medida

Revisão de 27/10/2026 · Branch `FEAT/redesign-templates`

## O que mudou

### Correções
- **"Personalizar modelo" abre no objetivo.** O estúdio começa sempre em "Qual é o objetivo principal do projeto?" e o objetivo já vem marcado conforme a solução escolhida. Só reabre direto na estrutura quando o cliente clica em "Editar estrutura" no resumo, preservando o que montou.
- **Componentes por objetivo.** Na etapa de estrutura, o cliente acrescenta componentes que viram seções antes do contato e podem ser reordenados ou removidos: vídeo, banner de imagem, galeria, carrossel, depoimentos, cases, números, como funciona, planos, antes e depois, equipe, clientes e parceiros, FAQ, mapa, agendamento, blog, feed do Instagram, downloads e formulário extra. A lista muda conforme o objetivo, e o que já faz parte da estrutura base aparece como "Na base".
- **Bloco "Personalize sua estrutura com IA" removido.**
- **Preço do resumo.** O resumo mostrava "R$ 500 (modelo pronto)" mesmo quando o cliente escolhia sob medida. Agora o valor vem do catálogo (`configuratorData`): preço do modelo pronto ou "a partir de" do sob medida.
- **Estrutura chega à plataforma.** Seções, componentes e observações vão nas notas da solicitação, que a plataforma já registra.
- **Mudança de objetivo no estúdio** (por exemplo, de landing page para portfólio) atualiza a solução do diagnóstico.
- **No configurador**, o estúdio guarda a estrutura e a inclui no envio, sem descartar os outros serviços selecionados.
- **Privacidade:** o texto livre do estúdio não é mais gravado no `localStorage`.

### Experiência do fluxo
- **Etapas nomeadas** (Solução, Formato/Objetivo, Contexto, Resumo), em vez de bolinhas numeradas.
- **Seleção acessível:** rádios nativos com aparência de cartão (setas do teclado, foco visível, leitor de tela). Antes eram botões com `aria-pressed`.
- **Soluções agrupadas** em "Presença digital" e "Operação e produto". O preço aparece em todos os cartões.
- **Formato:** "Modelo pronto" e "Sob medida" lado a lado com investimento e prazo. Sai o par de botões repetidos "Adquirir modelo"; o card seleciona e o rodapé avança. Se o cliente escolhe sob medida sem montar a estrutura, o botão vira "Montar estrutura" e abre o estúdio.
- **Contexto:** opções rápidas para marcar ("Já tenho logotipo", "Preciso de ajuda com os textos"…) e contador de caracteres.
- **Sem tela "Identificando seu cenário…"**: a animação fingia um processamento que não existe.
- **Resumo:** recomendação concreta (nome do modelo ou estrutura montada), escolhas com "Alterar" que volta à etapa certa, estrutura numerada, observações, investimento, prazo, próximos passos específicos para cada formato, "Continuar na plataforma" e a garantia "Você revisa tudo antes de qualquer pagamento".
- **Desktop:** com o diagnóstico ativo, o painel ocupa a largura do hero (até 1080 px).
- **Celular:** opções em uma coluna, rodapé de ações fixo, estúdio em tela cheia com a prévia sob demanda.

## Arquivos
- `js/components.js`: etapas do diagnóstico, resumo e estúdio sob medida (dados em `CUSTOM_OBJECTIVES`, `CUSTOM_STRUCTURES`, `CUSTOM_COMPONENTS` e `CUSTOM_COMPONENTS_BY_OBJECTIVE`).
- `css/diagnostic-flow.css` (novo, importado em `css/style.css`).
- `js/configurator.js`: estrutura sob medida incluída no envio.
- `solucoes/modelos-sob-medida.html`: carrega `handoff.js`, então o estúdio aberto nessa página leva direto à plataforma.

## Preços dos componentes
Os componentes não têm preço próprio. Eles entram na validação do escopo, e o resumo avisa que o valor final é confirmado pela equipe. Para cobrar um componente, preencha `price` em `CUSTOM_COMPONENTS`: o valor aparece na estimativa do estúdio.
