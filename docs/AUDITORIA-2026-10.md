# Auditoria da plataforma CMKCOGIT — outubro de 2026

Branch `FEAT/redesign-templates`. Escopo: todas as páginas do site, os fluxos interativos (diagnóstico da página inicial, estúdio de modelo sob medida, configurador “Monte sua solução”, demonstração dos modelos, banner de cookies, menu móvel), os valores comerciais e as regras de cálculo. Os preços e as regras **não foram alterados**; onde as páginas divergiam do catálogo, a página foi alinhada ao catálogo. O que depende de decisão comercial está na seção 3.

## 1. Telas analisadas

| Grupo | Páginas |
|---|---|
| Institucionais | `index.html`, `sobre.html`, `como-trabalhamos.html`, `contato.html`, `monte-sua-solucao.html`, `projetos/index.html` |
| Soluções | `solucoes/index.html`, `automacoes-e-integracoes`, `landing-pages`, `modelos-prontos`, `modelos-sob-medida`, `plataformas-e-outras-solucoes`, `saas-e-produtos-digitais`, `sistemas-personalizados`, `sites-e-landing-pages`, `sites-institucionais` |
| Apoio | `privacidade.html`, `termos-de-uso.html`, `obrigado.html`, `404.html` |
| Redirecionamentos (conferidos, sem layout) | `investimentos.html`, `solucoes/cogit-start.html`, `solucoes/solucoes-prontas.html` |
| Estados interativos | diagnóstico (etapas 1 a 4, modelos prontos e sob medida, resultado), estúdio sob medida (objetivo, estrutura, componentes), configurador com seleção, diálogo de demonstração com vídeo, banner e preferências de cookies, menu móvel |

Larguras: 320, 360, 375, 390, 430, 768, 1024, 1280, 1440 e 1920 px, mais telas baixas na horizontal (844×390, 1771×534) para o cabeçalho e os heros.

## 2. Problemas encontrados e correções

| # | Problema | Causa | Correção |
|---|---|---|---|
| 1 | Hero de **Monte sua solução** cortado sob o cabeçalho | O respiro do hero era um número fixo menor que o cabeçalho de 100 px; no celular, `responsive.css` redefinia a altura do cabeçalho com outros números | Altura do cabeçalho virou token (`--header-h`, `--header-h-compact`) e todos os heros somam `var(--header-h)` ao próprio respiro. Vale também para telas baixas na horizontal |
| 2 | Gráfico fixo de **Como trabalhamos** com altura errada | Usava `var(--header-height)`, variável inexistente | Token `--sticky-top` e altura limitada à tela (`min(100svh − topo, 720px)`) |
| 3 | Resumos fixos (configurador, contato, diagnóstico) a distâncias diferentes do topo | Cada folha tinha seu próprio `top` | Todos usam `--sticky-top` |
| 4 | Conteúdo invisível sem JavaScript | As animações deixavam o conteúdo com `opacity: 0` por padrão | O estado escondido só vale com `html.js` (marcado no início de cada página); sem JS tudo aparece |
| 5 | Animações só na descida | O observador parava de observar depois da primeira revelação | Revelação nos dois sentidos (`is-visible` / `is-above`) na página inicial, Sobre, Contato e Soluções |
| 6 | Trilha animada do hero ignorava `prefers-reduced-motion` | `runPathAnimation` não consultava a preferência | Com movimento reduzido a trilha fica estática |
| 7 | Títulos de tamanhos diferentes entre páginas (h1 de 38 px nas páginas de solução e 68 px nas demais; h2 de 24 a 44 px) | Tamanhos por página espalhados em `responsive.css` e `refinements.css` | Tokens `--fs-hero`, `--fs-section`, `--fs-card`, com as substituições por página removidas |
| 8 | Título da página inicial com linhas extras e subtítulo recuado | O h1 herdava 68 px enquanto os trechos usam outro tamanho; `margin: 0 auto` no subtítulo | Mesmo tamanho no h1 e nos trechos, espaçamento entre letras mantido, `margin-inline: 0` |
| 9 | Saltos de hierarquia (h2 → h4) no rodapé e nos cards | Títulos de coluna e de card em h4 | Rodapé com h2 e cards com h3, sem mudança visual |
| 10 | Contraste insuficiente: cinza terciário, rótulos em fundo escuro e etapas inativas de Como trabalhamos (3,0:1 e 3,7:1) | Cores e opacidade de destaque | `--text-tertiary` #5F6B7F (5,4:1), rótulo lilás no fundo escuro e etapas inativas a 0,82 com número em `--text-secondary` (4,7:1) |
| 11 | Alvos de toque pequenos no celular (links de rodapé, trilha de navegação, links de texto, perguntas frequentes) | Altura de linha do texto | Mínimo de 40 a 44 px no celular |
| 12 | Tabela comparativa rolável inacessível pelo teclado | Contêiner sem foco | `role="region"`, rótulo e `tabindex="0"` |
| 13 | Marcos de navegação aninhados (`aside` dentro de `main`) | Painéis laterais marcados como complementares | Viraram `section` com rótulo ou `div`, sem mudança visual |
| 14 | Imagens do logotipo sem dimensões | Faltavam `width` e `height` | Proporção declarada no HTML |
| 15 | `js/form.js` carregado em 16 páginas sem nenhum formulário correspondente, com uma tabela de preços própria duplicada | Código antigo | Arquivo removido. Os preços ficam só no catálogo (`js/data.js`) |
| 16 | CSS morto: 2.965 regras sem uso, sendo 2.032 do pacote completo de ícones e 933 do próprio site | Acúmulo de versões | `tools/purge-css.py` remove só as regras cujas classes não aparecem em nenhum HTML ou JS, preservando classes montadas no JS (`'state-' + n`). O CSS passou de 501 KB para 288 KB |
| 17 | Cerca de 3 MB por página | Fontes em TTF completas (1,9 MB), fonte de ícones com 2.000 ícones para 18 usados, símbolo PNG de 1079 px exibido a 38 px | Fontes em WOFF2 com o latim necessário (174 KB no total), ícones reduzidos aos usados (2 KB) e símbolo em 192 px (27 KB) |

## 3. Divergências de valores

Fonte de verdade conferida: `configuratorData` em `js/data.js` é igual à tabela `catalogo_precos` do aplicativo, e o cálculo do site (`calculateTotal`) segue a mesma regra do servidor (`calcular()`): modelo sob medida é sempre “a partir de”, serviços de presença exigem o formato (modelo pronto ou sob medida), um único plano mensal e quantidade de 1 a 99. As combinações listadas em Soluções (R$ 1.200, R$ 1.990 e R$ 4.330) somam corretamente.

### Corrigidas (a página passou a seguir o catálogo)

| Página | Antes | Depois | Regra |
|---|---|---|---|
| `solucoes/landing-pages.html`, LP Essencial | “Investimento a partir de” R$ 500 | “Investimento” R$ 500 e link já no formato modelo pronto | Modelo pronto tem preço fechado |
| `solucoes/landing-pages.html`, LP Profissional | “Investimento” R$ 700 | “Investimento a partir de” R$ 700 e link no formato sob medida | Sob medida é sempre “a partir de” |
| `solucoes/sites-institucionais.html`, Essencial / Profissional | Essencial “a partir de”; links sem formato | Essencial com preço fechado; links com o formato | Idem |
| `solucoes/sites-e-landing-pages.html`, Site Essencial | “R$ 700+” | “R$ 700” e links com o formato | Idem |
| Links “Configurar” em geral | O configurador abria sem formato e mostrava outra faixa de preço | Cada link leva o formato correspondente | — |

### Pendentes de confirmação comercial (não alteradas)

| # | Onde | O que diverge | Pergunta |
|---|---|---|---|
| A | `solucoes/automacoes-e-integracoes.html`, linhas 242 e 254 | “Automação Básica” e “Automação Intermediária” mostram o mesmo valor, R$ 990+. O catálogo tem um único item de automação (a partir de R$ 990) | A Intermediária deve ter outro piso? |
| B | `solucoes/landing-pages.html`, LP Avançada | “A partir de R$ 700” (mesmo valor da LP sob medida), mas a descrição inclui CRM e automações, que no catálogo são complementos a partir de R$ 990 cada | Foi acrescentada a nota “+ integrações e automações, complementos a partir de R$ 990 cada”. Confirmar se a LP Avançada deve ter preço próprio |
| C | Diagnóstico da página inicial, “Produto Digital” (`saas-svc`) | Usa o preço do MVP (a partir de R$ 3.990); o catálogo não tem item SaaS separado | Confirmar se SaaS por assinatura parte do mesmo valor |
| D | Prazos de landing page | “A partir de 1 semana” (`sites-e-landing-pages.html`), 5 a 8 / 7 a 10 / 10 a 15 dias úteis nos cards e “5 a 10 dias úteis” na pergunta frequente de `landing-pages.html` (que não cobre a LP Avançada) | Confirmar o texto da pergunta frequente |

## 4. Arquivos modificados

- **CSS**: `variables.css` (tokens), `reset.css`, `layout.css`, `base.css`, `components.css`, `sections.css`, `responsive.css`, `refinements.css`, `animations.css`, `about-v2.css`, `contact-page.css`, `configurator-v2.css`, `diagnostic-flow.css`, `diagnostic-experience.css`, `fonts.css` e `bootstrap-icons.css`, além da fonte de ícones em `css/fonts/`.
- **JS**:
  - `animations.js`, `about-v2.js` e `contact-page.js`: revelação nos dois sentidos;
  - `components.js`: movimento reduzido, número decorativo oculto do leitor de tela e marcos;
  - `configurator.js`: marco do resumo;
  - `main.js`: removida a chamada ao formulário inexistente;
  - `form.js`: removido.
- **HTML**:
  - as 20 páginas: marca `html.js`, títulos do rodapé, hierarquia de títulos, dimensões do logotipo e símbolo reduzido;
  - páginas de solução: rótulos de preço e links com formato.
- **Assets**: `assets/fonts/cogit-font-*.woff2` (substituem os `.ttf`) e `assets/images/cmk-symbol.png` (novo; o `cmk.png` original foi mantido).
- **Ferramentas e documentação**: `tools/purge-css.py` (novo), `tools/check.mjs` (ignora `templates/`, que têm verificação própria), `tools/templates/check.mjs` (rolagem instantânea e LCP antes da rolagem), `README.md` e este relatório.

## 5. Melhorias visuais e de sistema

- Tipografia em três tokens fluidos, sem tamanhos por página: os títulos das páginas de solução ficaram no mesmo nível das demais.
- Cabeçalho, heros e elementos fixos derivam da mesma altura, então nenhum hero fica sob o cabeçalho em nenhuma largura.
- Contraste AA em todos os textos de leitura verificados pelo axe.
- O CSS caiu de 501 para 288 KB e o peso transferido por página, de cerca de 3 MB para 0,7 a 1,2 MB.

## 6. Animações

- **Revelação nos dois sentidos**:
  - os elementos entram ao descer e saem pelo topo ao passar (`is-above`);
  - ao voltar, entram de novo;
  - cards em grade mantêm o escalonamento.
- **Como trabalhamos**:
  - o gráfico fixo acompanha a etapa ativa (seis estados);
  - a frase final aparece só na sexta etapa, por desenho.
- **Movimento reduzido**:
  - todo o conteúdo aparece sem transição;
  - a trilha do hero fica estática;
  - os vídeos não tocam sozinhos.
- **Sem JavaScript**: o conteúdo é exibido normalmente.

## 7. Testes executados (nesta versão)

| Verificação | Resultado |
|---|---|
| `node tools/check.mjs` (preços, combinações, plano mensal, envio para a plataforma, privacidade) | 22 de 22 aprovadas |
| `node tools/templates/check.mjs` (3 modelos × 5 larguras, teclado, sem JS, Web Vitals) | 44 de 44 aprovadas em 3 execuções seguidas, depois de corrigir duas condições de corrida do próprio teste: a rolagem por script era animada pelo `scroll-behavior: smooth` dos modelos, e o LCP era lido depois dela, quando o navegador já não o encerraria |
| Auditoria com Playwright: 20 páginas × 10 larguras (rolagem horizontal, texto cortado, conteúdo escondido na tela, alvos de toque, títulos) | Sem rolagem horizontal, texto cortado ou alvo pequeno. Um card a caminho da tela (opacidade 0) fica 9 px além da borda a 1024 px, sem gerar rolagem |
| axe-core 4.10 (1440 e 390 px, com movimento reduzido) | Sem violações de contraste em texto de leitura nem de marcos. Restam os numerais decorativos gigantes (`aria-hidden`, 1,38:1) em 4 páginas de solução, decoração intencional |
| Conteúdo travado (rolagem real, conferindo cada elemento na tela) | Nenhum, exceto a frase final do gráfico de Como trabalhamos, que aparece na sexta etapa por desenho |
| Sem JavaScript | Todas as páginas exibem todo o conteúdo |
| Fluxos | Diagnóstico até o envio à plataforma, modelo sob medida “a partir de R$ 800”, demonstração com vídeo tocando e configurador: sem erros |
| Comparação visual (19 páginas e 8 estados, em 390 e 1440 px, antes e depois) | Diferenças só onde houve mudança intencional (hero da página inicial, etapas de Como trabalhamos) e nos quadros de vídeo |
| Web Vitals de laboratório (390 px, rede de 1,6 Mbps com 150 ms de latência, CPU 4× mais lenta, mediana de 3 execuções) | LCP igual ao original, dentro do ruído (1,1 a 2,2 s); CLS ≤ 0,02; transferência caiu de 2,8 a 3,6 MB para 0,7 a 1,2 MB |

Durante o trabalho, a comparação visual pegou uma regressão: a primeira versão da limpeza de CSS removeu os estados do gráfico de Como trabalhamos, que são montados no JS. A ferramenta foi corrigida, as regras voltaram e a página foi conferida etapa por etapa. Essa versão não chegou a ser publicada.

## 8. Pendências

1. **Confirmar as divergências A a D** da seção 3 com a área comercial. Nenhum valor foi alterado sem essa confirmação.
2. **Numerais decorativos** de baixo contraste (`.home-process-num`). São decoração, isenta pela WCAG. Se a equipe preferir zerar o alerta do axe, dá para movê-los para `::before` com `content: attr(...)`.
3. **Lighthouse oficial** não estava disponível no ambiente. Os números acima são medições de laboratório com Playwright. Vale rodar o PageSpeed Insights depois da publicação.
4. Os arquivos originais completos (fontes TTF e pacote de ícones) estão no histórico do Git. O README explica como gerar de novo os subconjuntos.
