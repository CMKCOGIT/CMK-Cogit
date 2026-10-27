# Templates comerciais da CMKCOGIT

Três sites estáticos e independentes, vendidos como **Modelos prontos**. A estrutura, a composição e os comportamentos são fixos. A identidade visual e o conteúdo são personalizados para cada cliente.

| Pasta | Modelo | Marca de demonstração (fictícia) |
| --- | --- | --- |
| `portfolio/` | Portfólio Profissional | Lia Toledo, designer de identidade visual |
| `institucional/` | Site Institucional Essencial | Arrimo Contabilidade |
| `landing/` | Landing Page Essencial | Alento, agenda para psicólogos |

Cada pasta é a raiz de um site. Não existe etapa de build e nenhuma biblioteca de terceiros é carregada: HTML, um CSS de tokens, um CSS de composição e um JavaScript sem dependências.

```
<template>/
  index.html            página principal
  privacidade.html      política de privacidade (institucional e landing, que coletam dados)
  404.html              página de erro (caminhos absolutos: funciona na raiz do domínio)
  css/tokens.css        cores, fontes, tamanhos e ritmo: o ponto de personalização
  css/styles.css        composição das seções (não muda por cliente)
  js/main.js            menu, revelação ao rolar, formulário, interações
  fonts/                fontes WOFF2 locais + licenças OFL
  img/                  imagens AVIF/WebP/JPG, ícones e imagem de compartilhamento
  site.config.json      domínio, modo, hospedagem e endpoint do formulário
  robots.txt, site.webmanifest, favicon.svg
```

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
3. **Conteúdo:** textos, contatos e links estão direto no `index.html`. Links de contato usam `data-contact="email|whatsapp|phone|social"`.
4. **Imagens:** substitua os arquivos em `img/` mantendo nomes e proporções, ou ajuste `srcset`, `width` e `height`. Exporte AVIF e WebP em duas larguras e um JPG de reserva. Fotos de clientes não passam pelo gerador de arte.
5. **Publicação:** edite `site.config.json` e rode `node tools/templates/configure.mjs <template>`.

O que **não** muda: a ordem e a composição das seções, as classes do `styles.css`, os comportamentos do `main.js`.

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
