# COGIT — site revisado

Revisão de 9 de setembro de 2026 a partir do ZIP original. O site continua em HTML, CSS e JavaScript, sem dependências de produção ou etapa de build.

## O que mudou

- Cards de serviços, objetivos e modelos com superfícies grafite, textos claros e o roxo original da marca nos controles e ações.
- Seleção consistente, contraste, foco de teclado, botões e espaçamentos revisados.
- Layouts preparados para larguras a partir de 300 px; correções em grids, animações laterais, metodologia, menu, rodapé e formulários.
- Consentimento com aceitar, recusar, configurar e revogar cookies opcionais. Autorização de contato separada e desmarcada inicialmente.
- Fontes Inter e Manrope locais, sem conexão com Google Fonts durante a navegação.
- Dados de formulário sem gravação em sessionStorage ou console. Texto livre protegido contra interpretação como HTML.
- Contato pelo WhatsApp com mensagem preparada após autorização. A confirmação de recebimento que existia sem envio foi corrigida.
- Página de contato transformada em uma central de conversa, com WhatsApp, e-mail, formulário breve e dúvidas gerais, sem repetir o configurador.

## Usar os arquivos

Para hospedar, utilize o conteúdo da pasta `cmkcogit` como a raiz do site, preservando `assets`, `css`, `js`, `solucoes` e `projetos`. A pasta `docs` e os arquivos de revisão em `tools` são documentação e apoio local; não são necessários na hospedagem pública.

Para testar localmente com Node.js 20.11 ou superior:

```sh
node tools/preview.mjs --port 4173
```

Abra `http://localhost:4173/`. Não é necessário instalar pacotes. A página `http://localhost:4173/tools/review.html` permite escolher páginas e larguras para revisão visual.

Para executar as verificações repetíveis:

```sh
node tools/check.mjs
```

Os atalhos `npm run dev` e `npm run check` executam esses mesmos comandos.

## Arquivos para manutenção

- `css/refinements.css`: ajustes compartilhados e cores dos cards. A paleta principal permanece em `css/variables.css`.
- `js/privacy.js`: consentimento, preferências e autorização de contato.
- `js/analytics.js`: carregamento da análise somente após consentimento.
- `js/components.js`: diagnóstico da página inicial e diálogo de modelos.
- `js/configurator.js`: estimativa, adicionais e mensagem do configurador.
- `js/contact-page.js`: contexto de origem, contador e preparação segura da mensagem da nova página de contato.
- `js/utils.js`: escape de texto, telefone, movimento reduzido e foco.
- `docs/RELATORIO.md`: achados, alterações, testes e limites da entrega.
- `docs/AUDITORIA-2026-10.md`: auditoria de valores, visual, responsividade, acessibilidade e desempenho (outubro de 2026), com as divergências que ainda dependem de confirmação comercial.

### Tokens de layout e tipografia

Ficam em `css/variables.css` e substituem números soltos espalhados pelas folhas:

- `--header-h` / `--header-h-compact`: altura do cabeçalho (transparente sobre o hero e compacto ao rolar). Mudam sozinhas no celular e em telas baixas na horizontal. Todo hero deve somar `var(--header-h)` ao próprio respiro, nunca um valor fixo, para o título não ficar por baixo do cabeçalho.
- `--sticky-top`: distância do topo para resumos e painéis fixos (`position: sticky`).
- `--fs-hero`, `--fs-section`, `--fs-card`: tamanhos de h1, h2 de seção e título de card, já fluidos (`clamp`). Não crie tamanhos por página no `responsive.css`; ajuste o token.
- `--text-tertiary`: cinza de apoio que ainda passa no contraste AA sobre branco e `--neutral`.

### Animações de rolagem

`js/animations.js` revela os elementos `.reveal`, `.reveal-up` e `.card-stagger-item` ao entrar na tela e os esconde de novo ao sair (`is-visible` / `is-above`), nos dois sentidos. O estado escondido só vale com JavaScript ativo (`html.js`, definido no início de cada página) e é desligado com `prefers-reduced-motion`.

### CSS sem uso

`python3 tools/purge-css.py css/arquivo.css` relata as regras cujas classes e ids não aparecem em nenhum HTML ou JS (com `--write`, remove). Classes montadas no JS por prefixo (`'state-' + n`, `` `wf--${x}` ``) são preservadas. Depois de rodar, confira a página afetada no navegador: a ferramenta não enxerga classes vindas de fora do repositório.

### Fontes e ícones

- `assets/fonts/cogit-font-*.woff2` (Inter e Manrope) são subconjuntos em WOFF2 com latim básico, Latin-1 e Latin Extended-A, mais os sinais tipográficos usados nas páginas. As fontes completas estão no histórico do Git (`cogit-font-*.ttf`, até o commit `5e8f7cb`). Para incluir outro alfabeto, gere de novo a partir delas com `pyftsubset` (fonttools).
- `css/bootstrap-icons.css` e `css/fonts/bootstrap-icons.woff2/.woff` contêm só os ícones usados no site. Para usar um ícone novo, copie a regra `.bi-nome::before` da versão completa (Bootstrap Icons 1.11.3, também no histórico até `5e8f7cb`) e gere a fonte de novo com os códigos das regras presentes.
- `assets/images/cmk-symbol.png` é o símbolo em 192 px de altura usado como ícone da aba e no menu móvel. O original em alta resolução continua em `assets/images/cmk.png`.

## Configurações existentes

O identificador `siteConfig.gaId` em `js/data.js` permanece vazio, como no original. Não há coleta de Analytics enquanto ele não for configurado; mesmo configurado, o carregamento depende da autorização do visitante.

O projeto não contém um backend de formulários. O canal implementado utiliza o WhatsApp existente da COGIT. O visitante precisa revisar e enviar a mensagem no WhatsApp para a equipe recebê-la. O site não afirma que uma mensagem apenas preparada já foi recebida.

O botão “Ver modelo” abre o vídeo e a demonstração navegável dos três modelos prontos (`templates/`). Não foram inventados exemplos de projetos de clientes.

As fontes locais mantêm suas licenças SIL Open Font License em `assets/fonts`.

## Templates comerciais (Modelos prontos)

Os três modelos demonstrativos (portfólio, site institucional e landing page) ficam em `templates/`, cada um como um site independente. As instruções de personalização, publicação, SEO e gravação dos vídeos estão em `templates/README.md`, e o relatório da entrega está em `docs/TEMPLATES-RELATORIO.md`. Verificação: `node tools/templates/check.mjs`.
