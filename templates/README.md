# Templates comerciais da CMKCOGIT

Três sites estáticos e independentes, vendidos como **Modelos prontos**. Um modelo pronto tem **estrutura fixa**: as mesmas seções, na mesma ordem, com os mesmos componentes. Por cliente mudam só a marca (`css/tokens.css`), as fotos (`img/`) e os textos. É isso que permite entregar em poucos dias e o cliente saber exatamente o que recebe; o que fugir da estrutura é **sob medida**.

| Pasta | Modelo | Estrutura fixa | Marca de demonstração (fictícia) |
| --- | --- | --- | --- |
| `landing/` | Landing Page Essencial | 1 página, 5 seções: topo, benefícios (3), como funciona (3 passos), depoimentos (3 + números), contato (formulário + 3 dúvidas) | Alento, agenda para psicólogos |
| `portfolio/` | Portfólio Profissional | 1 página: topo, trabalhos (até 6), sobre (foto + números), serviços (até 3), depoimentos (2), contato | Lia Toledo, designer de identidade visual |
| `landing-basica/` | Landing Page Básica (nível básico) | 1 página, 7 seções: início, serviços (3 com ícone e características), sobre nós (missão, visão e valores), diferenciais (4), depoimentos (2 + nota) e portfólio (2 fotos), contato (formulário + WhatsApp, e-mail, telefone e redes) e rodapé. Tem o painel **Personalizar** (ver abaixo) | Ponto Firme Reformas |
| `landing-profissional/` | Landing Page Profissional (nível intermediário) | 1 página, 8 seções: cabeçalho, banner, sobre, serviços (3 com foto), diferenciais (4), depoimentos (3 + foto), chamada para ação e rodapé. Tem o painel **Personalizar** (ver abaixo) | Florescer Nutrição, nutricionista |
| `institucional/` | Site Institucional Essencial | 4 páginas: Início (serviços, diferenciais, casos, depoimentos, proposta), Sobre, Serviços (até 6 + dúvidas) e Contato | Arrimo Contabilidade |

Os três usam **o mesmo** `css/styles.css` e o mesmo `js/main.js` (fontes em `tools/templates/base/`). Só `css/tokens.css` muda de um modelo para outro, e de um cliente para outro.

```
<template>/
  index.html            página principal (institucional: + sobre, servicos e contato)
  privacidade.html      política de privacidade (institucional e landing)
  404.html              página de erro (caminhos absolutos: funciona na raiz do domínio)
  css/tokens.css        a marca: cores, fontes, cantos. ÚNICO arquivo de estilo por cliente
  css/styles.css        estrutura comum aos três modelos (não muda por cliente)
  js/main.js            menu, revelação ao rolar, formulário, aviso da demonstração (comum)
  fonts/                fontes WOFF2 locais + licenças OFL
  img/                  fotos AVIF/WebP/JPG, ícones e imagem de compartilhamento
  site.config.json      domínio, modo, hospedagem e endpoint do formulário
  robots.txt, site.webmanifest, favicon.svg
```

As páginas são geradas por `python3 tools/templates/build-models.py` a partir do conteúdo de cada modelo (o dicionário de cada função no arquivo). Depois de gerar, rode `node tools/templates/configure.mjs`.

## Landing pages por nível e o painel "Personalizar"

A Landing Page tem três níveis de modelo pronto: **básico** (`landing-basica/`), **intermediário** (`landing-profissional/`) e **formal** (em preparação). No site, o modal de prévia mostra esses níveis em `MODEL_TIERS`, em `js/components.js`. Abrir a prévia pelo serviço `landing-page` mostra o básico. A Landing Page Essencial (`landing/`) continua no repositório, mas não aparece no seletor.

Esses modelos não usam o `styles.css` e o `main.js` comuns. Cada um tem o próprio `css/styles.css`, que define o visual do nível. O script do site e o painel são **iguais em todos os níveis**:

| Fonte única | Cópia em cada modelo | O que faz |
| --- | --- | --- |
| `tools/templates/base/landing-site.js` | `js/site.js` | Menu, revelação ao rolar, espaços de imagem, ano do rodapé e formulário. Com `data-endpoint`, envia por POST; sem ele, abre o WhatsApp ou o e-mail do site com a mensagem pronta. |
| `tools/templates/base/landing-editor.js` | `js/editor.js` | O painel **Personalizar**. |

Edite só a fonte e rode `node tools/templates/sync-landing.mjs`. O `npm run check` falha se alguma cópia ficar diferente. Cada modelo se identifica na tag `<script data-lp-editor data-model="..." data-model-name="...">`, e o painel monta os campos a partir dos atributos do HTML. Um modelo novo só precisa do próprio HTML e CSS.

O botão **Personalizar** abre o painel (`?personalizar` na URL abre direto no computador). Ele permite:

- **Cores:** 8 paletas ou 6 cores em HEX (principal, secundária, destaque, fundo, títulos e textos). Todo o CSS deriva dessas 6 cores, e a cor do texto sobre botões é calculada pelo contraste.
- **Textos:** todo elemento com `data-k` vira um campo. Com o painel aberto, clicar num texto da página leva ao campo dele.
- **Imagens:** os espaços `data-img` (básico: IMAGEM 1 a 4; intermediário: IMAGEM 1 a 6) e o logotipo. Cada um aceita upload, substituição, remoção, posição horizontal e vertical, zoom e texto alternativo. As fotos são reduzidas no navegador para no máximo 1800 px, em WebP.
- **Seções:** ocultar qualquer seção, exceto o início e o rodapé. Os itens do menu e do rodapé somem junto.
- **Links:** todo `data-href`. Link vazio oculta o botão ou a rede social.
- **Publicar:** exporta um `.json` com toda a configuração, para a equipe publicar, ou baixa o `index.html` final, sem o painel, sem os avisos de demonstração e com as imagens embutidas. Esse arquivo substitui o `index.html` da pasta. Depois rode `configure.mjs` normalmente.

A personalização fica salva no navegador de quem edita: textos e cores no `localStorage`, imagens no IndexedDB.

## Rodar localmente

```sh
node tools/templates/serve.mjs --all
# portfolio      http://localhost:5101/
# institucional  http://localhost:5102/
# landing        http://localhost:5103/
```

O servidor imita uma hospedagem estática: serve cada template na raiz e responde `404.html` com status 404.

## Personalizar para um cliente

1. **Identidade:** edite `css/tokens.css` (cores, famílias tipográficas, escala). Os comentários indicam quais cores são usadas como texto e precisam manter contraste mínimo de 4,5:1.
2. **Fontes:** coloque os WOFF2 em `fonts/`, ajuste os `@font-face` e os `preload` do `<head>`. Mantenha no máximo duas famílias. Para evitar deslocamento de layout, ajuste o `size-adjust` da fonte de reserva quando houver.
3. **Conteúdo:** troque os textos no conteúdo do modelo em `tools/templates/build-models.py` e gere de novo. Os limites da estrutura valem: mesmo número de seções, cartões, trabalhos e páginas. Links de contato usam `data-contact="email|whatsapp|phone|social"`.
4. **Imagens:** cada foto ocupa um quadro de proporção fixa (4:3, 4:5 ou 16:10) e é recortada para caber. Substitua os arquivos em `img/` mantendo os nomes. Exporte AVIF e WebP em duas larguras e um JPG de reserva. Fotos de clientes não passam pelo gerador de arte.
5. **Publicação:** edite `site.config.json` e rode `node tools/templates/configure.mjs <template>`.

O que **não** muda: a ordem e a composição das seções, a quantidade de itens de cada seção, o `styles.css` e o `main.js`. A barra superior "Modelo pronto" só aparece no modo demonstração.

## `site.config.json`

| Campo | Uso |
| --- | --- |
| `mode` | `demo` (padrão): `noindex`, aviso de site demonstrativo e links de contato que apenas explicam o que fariam. `production`: indexável e com contatos reais. |
| `siteUrl` | Domínio final com `https://`, sem caminho. Gera canonical, `og:url`, `og:image` absoluto, `url` no JSON-LD e o sitemap. Obrigatório em produção. |
| `host` | `netlify`, `cloudflare-pages`, `vercel`, `apache` ou `github-pages`. Gera `_headers`, `vercel.json` ou `.htaccess` com CSP (com o hash do script inline), cabeçalhos de segurança, cache e, no Apache, `ErrorDocument 404` e redirecionamento para HTTPS. `null` não gera nada. |
| `formEndpoint` | URL HTTPS que recebe `POST` JSON (Formspree, Basin, função serverless etc.). Vazio: o portfólio e o institucional abrem o e-mail com a mensagem pronta e a landing abre o WhatsApp. |
| `allowEmbedFrom` | Origem que pode exibir o site em iframe (`frame-ancestors`). |
| `pages` / `indexable` | Páginas processadas e páginas que entram no sitemap em produção. |

### Por que a demonstração não tem canonical nem sitemap

Os domínios definitivos ainda não existem, e as demonstrações usam marcas fictícias. Por isso:

- todas as páginas usam `noindex, nofollow`;
- o `robots.txt` **libera** o rastreamento, porque um `Disallow` impediria o buscador de ler o `noindex`;
- não há `sitemap.xml`: não existem URLs indexáveis;
- nenhum canonical aponta para um domínio inventado.

Quando um cliente contratar o modelo, `mode: "production"` e `siteUrl` geram tudo isso de uma vez.

### Subdomínios das demonstrações

O plano original cita `template_site.cmkcogit.com.br`. **Sublinhado não é válido em nomes de host** e as autoridades certificadoras, como a Let's Encrypt, recusam emitir HTTPS para ele. Use hífen:

- `template-portfolio.cmkcogit.com.br`
- `template-site.cmkcogit.com.br` (institucional)
- `template-landing.cmkcogit.com.br`

Até os subdomínios existirem, o site principal aponta para `/templates/<nome>/` dentro do próprio `cmkcogit.com.br` (em `js/components.js`, `MODEL_PREVIEW_DATA.liveUrl`, e em `solucoes/modelos-prontos.html`).

## Ferramentas (`tools/templates/`, não vão para a hospedagem)

| Comando | O que faz |
| --- | --- |
| `node tools/templates/serve.mjs --all` | Servidor local dos três templates. |
| `node tools/templates/configure.mjs [nome]` | Aplica o `site.config.json`. |
| `node tools/templates/check.mjs [nome]` | Verificação no navegador: metadados, links, 404, robots, larguras de 320 a 1440 px, rolagem horizontal, alvos de toque, revelação descendo e subindo, sem JavaScript, movimento reduzido, teclado, hierarquia de títulos, formulário, menu e Web Vitals com rede e CPU limitadas. |
| `node tools/templates/render-art.mjs [nome] [cena]` | Renderiza as composições de `art/*.html` em AVIF, WebP e JPG. |
| `node tools/templates/record-video.mjs [nome]` | Grava os vídeos em `assets/videos/templates/`. |

Requisitos: Node 20+, Playwright com Chromium, Python 3 com Pillow (AVIF/WebP) e `ffmpeg` com `libx264`.

## Vídeos

Os vídeos são gravados a partir dos próprios templates, quadro a quadro, em `tools/templates/motion/stage.html`. O roteiro de cada um está em `tools/templates/motion/scenes.js` e a descrição técnica está em `tools/templates/motion/ROTEIROS.md`. Para revisar em tempo real: `stage.html?t=portfolio&preview=1`, servido a partir da raiz do repositório.
