# Relatório: redesign dos templates comerciais

Data: 27/10/2026 · Branch: `FEAT/redesign-templates`

## Ponto de partida

Os três templates originais ficam em `D:\XAULIN\kaike_elias\sites_em_html\cmk_templantes`, no computador local, e não estão em nenhum repositório acessível (`CMK-Cogit`, `app_cmkcogit`, `WaveType`, `artenos`). Com a sua autorização, os modelos foram **recriados do zero** em `templates/`. Nada do código original foi aproveitado nem comparado. Se houver funcionalidades nos originais que precisam ser mantidas, por exemplo integrações ou textos específicos, elas precisam ser conferidas manualmente.

As únicas referências disponíveis eram as prévias antigas em `assets/previews/` (removidas: eram capturas genéricas de SaaS) e o modal do site principal.

## O que foi feito em cada template

### Portfólio: “Lia Toledo”, designer de identidade visual

- **Direção:** editorial, papel e tinta, um único acento vermelhão. Instrument Serif para títulos e Instrument Sans para texto.
- **Projetos, o principal diferencial:** quatro composições diferentes, sem cards repetidos:
  1. panorâmica de tela cheia com bloco de texto sobreposto e imagem de detalhe;
  2. par assimétrico, com retrato deslocado e paisagem;
  3. texto fixo à esquerda e pilha de imagens rolando;
  4. imagem principal com uma segunda imagem flutuando em parallax.

  Em seguida, um arquivo em lista com prévia que acompanha o cursor. Cada projeto traz contexto, processo e entrega.
- Sobre (com imagem fixa), competências em tabela tipográfica, serviços com prazo, processo em cartões fixos que se sobrepõem, depoimentos deslocados, contato com formulário e rodapé.
- **Movimento:** títulos revelados linha a linha, imagens reveladas por máscara com leve zoom, parallax no hero, cabeçalho que se esconde ao descer e volta ao subir.

### Institucional: “Arrimo Contabilidade”

- **Direção:** sóbria e próxima. Verde profundo, latão e fundo marfim, cantos retos, filetes. Newsreader e Public Sans.
- Barra utilitária, cabeçalho fixo que compacta ao rolar, hero com relatório gerencial e nota sobreposta, faixa de credenciais.
- Painel institucional que se expande ao entrar (efeito de sobreposição), serviços em **abas ARIA** (setas, Home, End; viram lista sem JavaScript), diferenciais com título fixo, **linha do tempo** que se preenche com a rolagem, casos com contexto e decisão, depoimentos em carrossel acessível (botões e gesto), dúvidas com `<details>` exclusivo, formulário de proposta com consentimento LGPD, rodapé institucional e página de privacidade.

### Landing page: “Alento”, agenda para psicólogos

- **Direção:** clara e direta. Cobalto para ação e manteiga só como destaque. Bricolage Grotesque e Figtree.
- **Narrativa:**
  1. Promessa e CTA, com a agenda simulada em HTML: a confirmação aparece e o horário pendente fica confirmado.
  2. Problema, como uma linha do tempo de um dia de trabalho.
  3. Solução em quatro cenas, com o **aparelho fixo trocando de tela conforme o texto**. No celular, cada cena mostra sua própria tela.
  4. Benefícios, segurança e sigilo, três passos para começar, depoimentos, perguntas que respondem objeções e formulário curto.
- **Conversão:** barra de progresso de leitura e CTA fixo no celular que aparece depois do hero e some perto do formulário. Sem contadores, urgência ou números inventados.

## Decisões comuns

- **Sem dependências:** cada template tem um `main.js` de 200 a 260 linhas, com um único laço de rolagem por `requestAnimationFrame` e `IntersectionObserver` para revelações, link ativo e cenas.
- **Animações nos dois sentidos:** o elemento que sai pelo topo recebe `is-above` e volta descendo; o que sai por baixo volta subindo. Só usam `transform`, `opacity` e `clip-path`.
- **Movimento reduzido:** `prefers-reduced-motion` desliga revelações, parallax e animações em loop.
- **Sem JavaScript:** todo o conteúdo fica visível; as abas viram lista e os depoimentos aparecem empilhados.
- **Modo demonstração:** links de WhatsApp, e-mail e telefone mostram um aviso em vez de contatar números fictícios. O formulário valida e informa que nada foi enviado. O rodapé avisa que marca, projetos e depoimentos são fictícios. Tudo isso desaparece em `mode: "production"`.
- **Formulários:** validação própria em português, `aria-invalid` e `aria-describedby`, foco no primeiro erro, estados de envio, sucesso e erro, armadilha anti-robô, `POST` JSON para o endpoint configurado. Sem endpoint, os formulários abrem e-mail ou WhatsApp com a mensagem pronta.
- **Personalização:** `css/tokens.css` concentra cor, fonte e ritmo. `styles.css` e `main.js` não mudam por cliente.

## SEO técnico

| Recurso | Implementação |
| --- | --- |
| `lang`, `charset`, `viewport` | `pt-BR`, `utf-8`, zoom permitido |
| Título e descrição | Únicos por página, com tamanhos verificados |
| Indexação | Demonstração: `noindex, nofollow`. Produção: `index, follow`, gerados pelo `configure.mjs` |
| Canonical, `og:url`, `og:image` absoluto | Gerados quando `siteUrl` é definido. Nenhum domínio inventado |
| Open Graph e Twitter Card | Imagem 1200×630 própria por template |
| `robots.txt` | Libera o rastreamento nos dois modos (o `noindex` precisa ser lido). Em produção, aponta o sitemap |
| `sitemap.xml` | Só em produção, com as URLs indexáveis |
| JSON-LD | `ProfilePage` + `Person`, `AccountingService`, `SoftwareApplication`, só com dados existentes. Sem avaliações, preços ou números |
| Ícones | `favicon.svg`, `apple-touch-icon` 180 px, manifest com 192/512 px |
| 404 | Página própria. O `.htaccess` gerado para Apache define o `ErrorDocument` |
| Cabeçalhos | CSP com hash do script inline, `nosniff`, `Referrer-Policy`, `Permissions-Policy` e cache longo para fontes, para Netlify/Cloudflare (`_headers`), Vercel (`vercel.json`) ou Apache (`.htaccess`) |
| Redirecionamentos | Apache: HTTP → HTTPS e `www` → sem `www` |
| Imagens | AVIF + WebP em duas ou três larguras, JPG de reserva, `width`/`height` explícitos, `loading="lazy"` fora da primeira dobra, `fetchpriority="high"` no LCP |
| Fontes | WOFF2 local (subconjunto latino), `preload` das duas famílias, `font-display: swap` e fontes de reserva com `size-adjust` medido para eliminar CLS |

## Imagens

Não havia acesso a bancos de imagem neste ambiente, e fotos de pessoas ou lugares reais não seriam adequadas para marcas fictícias. Todas as imagens são **composições autorais**, desenhadas em HTML/CSS em `tools/templates/art/` e exportadas por `render-art.mjs`: embalagens, cartazes, ingressos, sinalização, relatórios e uma mesa de estúdio. No template de um cliente real, essas imagens são substituídas pelas fotos dele.

## Vídeos

Três vídeos foram **produzidos e gravados**: 33 s, 1920×1080, 30 fps, H.264, em `assets/videos/templates/`, cada um com pôster. Cada vídeo mostra:

1. abertura com o conceito;
2. hero carregando;
3. tour com legendas;
4. uma interação real com aproximação de câmera;
5. desktop e celular lado a lado;
6. encerramento com convite para a demonstração.

O roteiro técnico detalhado está em `tools/templates/motion/ROTEIROS.md`. A gravação é determinística, quadro a quadro, e congela as animações CSS dos templates no tempo exato de cada quadro. Não há trilha sonora; se for desejada, precisa ser licenciada e adicionada na edição.

## Site principal

- `js/components.js`: os dados dos modelos ganharam categoria, descrição revisada, vídeo, pôster e link da demonstração. O modal mostra o vídeo (sem autoplay com movimento reduzido) e “Ver demonstração completa” em nova aba, no lugar de “Prévia visual · vídeo em produção” e “Demonstração em breve”.
- `solucoes/modelos-prontos.html`: cada card do catálogo tem o vídeo (`preload="none"`) e o link da demonstração.
- `tools/check.mjs` ignora `templates/`, que tem verificação própria.
- Removidas as prévias antigas em `assets/previews/`, que deixaram de ser usadas.

## Bibliotecas adicionadas

Nenhuma no código publicado. Fontes (licença SIL OFL, licenças incluídas em cada `fonts/`): Instrument Serif, Instrument Sans, Newsreader, Public Sans, Bricolage Grotesque e Figtree, baixadas do pacote `@fontsource` e servidas localmente. As ferramentas de produção usam o Playwright e o ffmpeg já disponíveis no ambiente e o Pillow do Python.

## Arquivos

- **Criados:**
  - `templates/` (3 sites + `README.md`);
  - `tools/templates/` (`serve`, `configure`, `check`, `render-art`, `encode.py`, `record-video`, `art/`, `motion/`);
  - `assets/videos/templates/` (3 MP4 + 3 pôsteres);
  - `docs/TEMPLATES-RELATORIO.md`;
  - `.gitignore` (cache de renderização).
- **Modificados:** `js/components.js`, `solucoes/modelos-prontos.html`, `css/refinements.css`, `tools/check.mjs`.
- **Removidos:** `assets/previews/preview-{landing,portfolio,site}.jpg`.

## Testes executados

`node tools/templates/check.mjs`: **44 verificações aprovadas, 0 falhas.** Cobrem os três templates e as larguras de 1440, 1024, 768, 390 e 320 px:

- **Página e SEO:** metadados, indexação, `h1` único, ids únicos, âncoras, arquivos referenciados, JSON-LD válido; `robots.txt`, ausência de sitemap na demonstração, 404 com status 404, manifest válido.
- **Layout e mídia:** sem erros de console nem requisições com falha, sem rolagem horizontal, imagens com `alt`, `width` e `height`, alvos de toque com pelo menos 40 px em 390 e 320 px.
- **Movimento e acessibilidade:** revelação ao descer, volta ao estado inicial fora da tela e nova revelação ao subir; texto visível sem JavaScript e com movimento reduzido; link de pular conteúdo e foco visível; títulos sem saltos de nível.
- **Interação:** formulário com erros, foco no erro, mensagem de e-mail inválido e envio validado; menu móvel (abrir, Escape, fechar ao navegar) e CTA fixo da landing.
- **Web Vitals de laboratório** (390 px, 4G lenta, CPU 4× mais lenta):

| Template | LCP | CLS | Carga inicial |
| --- | --- | --- | --- |
| Portfólio | ≈ 2,3 s | 0,00 | 194 KB |
| Institucional | ≈ 1,5 s | 0,00 | 238 KB |
| Landing | ≈ 1,9 s | 0,00 | 151 KB |

Também foram executados:

- **`configure.mjs` em modo produção** (domínio de teste e Apache): canonical, `og` absoluto, `index, follow`, sitemap com 2 URLs, `robots.txt` com sitemap, CSP com o hash correto, aviso de demonstração oculto. Os arquivos voltaram ao modo demonstração depois do teste.
- **`node tools/check.mjs`** (site principal): 22 verificações aprovadas.
- **Modal no navegador:** o vídeo carrega e toca, e o link aponta para `/templates/portfolio/`.
- **Revisão visual:** capturas de página inteira em desktop e celular e quadros extraídos dos MP4 finais.

Limite: os Web Vitals são medidos em laboratório, no Chromium. Os números de campo dependem da hospedagem e da CDN.

## O que depende de configuração externa

1. **DNS e hospedagem dos subdomínios**, com hífen: `template-portfolio`, `template-site` e `template-landing.cmkcogit.com.br`. Depois, trocar `liveUrl` em `js/components.js` e os links em `modelos-prontos.html`.
2. **Hospedagem:** definir `host` em cada `site.config.json` e rodar `configure.mjs` para gerar os cabeçalhos certos. No GitHub Pages não há cabeçalhos personalizados.
3. **Formulários em produção:** criar o endpoint (Formspree, Basin, função própria) e preencher `formEndpoint`.
4. **Política de privacidade:** os campos entre colchetes dependem das práticas reais de cada cliente e de revisão jurídica.
5. **Depoimentos:** em produção, use apenas relatos reais e autorizados. Os da demonstração são fictícios e sinalizados no rodapé.
6. **Áudio dos vídeos**, se desejado: trilha licenciada adicionada na edição.

## Como executar e publicar

```sh
node tools/templates/serve.mjs --all          # ver localmente (5101, 5102, 5103)
node tools/templates/check.mjs                # verificar tudo
# publicar um template para um cliente:
#   1. editar templates/<nome>/site.config.json (mode, siteUrl, host, formEndpoint)
#   2. node tools/templates/configure.mjs <nome>
#   3. enviar o conteúdo de templates/<nome>/ como raiz do domínio
```

Para gravar os vídeos de novo depois de mudar um template: `node tools/templates/record-video.mjs <nome>`.
