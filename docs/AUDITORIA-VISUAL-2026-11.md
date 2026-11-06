# Auditoria visual — novembro de 2026

Branch `feat/atualizacao-estrutura-visual`. Varredura automatizada de 21 páginas em 360, 768, 1024, 1440 e 1920 px, mais inspeção visual.

## Corrigido
| Área | Problema | Correção |
|---|---|---|
| Cards (Soluções) | "Escopo definido" branco; "Ponto de partida" e "Projeto sob medida" sem fundo, com fios superiores de 3–4 px em cores diferentes. Mesmo caso em `si-solution-card-featured`, `service-card-highlight` e `si-value-drivers`. Causa: classes com modificador (`--fixed`, `-featured`) escapavam da regra de cards e perdiam o gradiente antigo. | Superfície branca e fio de 1 px iguais; destaque único: fio superior navy de 2 px (também nos cards com fio inline em modelos, landing pages e sites). |
| Títulos | Ao carregar, o trecho em destaque aparecia azul e virava cinza; o título aparecia, sumia e subia. | Palavras divididas herdam a cor do título; o H1 espera o movimento ficar pronto (trava de 2,5 s sem JS). |
| CTAs finais navy | Decoração estática. | Campo de partículas animado (`js/cta-field.js`): rede que reage ao cursor e sinais percorrendo as ligações; pausa fora da tela, quadro estático com movimento reduzido, 60 fps. |
| Ajuda | Botão "Enviar por e-mail" grafite sobre navy (contraste 1,35). | Texto papel com contorno claro. |
| Acessibilidade | "Pular para o conteúdo" ilegível ao receber foco; números do passo a passo do Monte sua solução em 3,6:1; botões do hub de contato com 19 px. | Cores ajustadas (≥ 4,5:1) e área de toque de 40 px. |
| Home | Título em duas linhas e slogan sem travessões, maior. | — |

## Verificado sem pendências
- Nenhum erro de JavaScript, nenhum 404 local, nenhuma rolagem horizontal em qualquer largura.
- Rolagem: nenhum quadro lento (máx. 29 ms) na home e em Soluções; nenhum conteúdo preso invisível.
- `npm run check` (22) e `tools/templates/check.mjs` (44) aprovados; `templates/` intocado.

## Observações (aceitas)
- Links dentro de parágrafos e o checkbox do formulário ficam abaixo de 24 px de altura — permitido pela exceção de links em linha (WCAG 2.5.8).
- Os pontos do carrossel têm 3 px visuais, mas a área clicável é de 27 px.

## Rodada 2 — envio para a plataforma, links e celular
- **Envio para a plataforma:** testados de ponta a ponta 52 caminhos do Monte sua solução (todo link do site com `services=` e
  todo fluxo `?problem=`) e 14 caminhos do diagnóstico da home (cada solução e cada formato). Todos geram o pacote com ids do
  catálogo, formato válido e estimativa. Sessões antigas (consultoria, evolução, plano mensal) são limpas sem erro.
  Corrigidos ids inexistentes: `outras-solucoes`, `painel-cliente`, `saas`. `npm run check` agora barra link com id inválido.
- **Links e botões:** nenhum link quebrado ou âncora inexistente; "Minha dúvida é outra" (Contato) leva ao formulário da Ajuda.
- **Celular (320–1024 px):** sem rolagem lateral; textos com no mínimo 12 px; áreas de toque com 44 px (logo, Minha área,
  voltar, expandir, atalhos, links de projeto, contatos); demonstração da home cabe inteira; rodapé em duas colunas
  (cerca de 35% mais curto); rodapé do Monte sua solução não fica atrás da barra de estimativa; catálogo com preço abaixo do nome.
- **Peso:** o script do configurador (45 KB) saiu das páginas que não o usam. Home: ~247 KB comprimidos, sem imagens.

## Rodada 3 — cookies e SEO
- **Cookies:** 10 cenários testados no navegador (primeira visita, aceitar, outras páginas, preferências pelo rodapé e pelo banner,
  Esc, revogar com limpeza do `_ga`, rejeitar sem nenhuma requisição, armazenamento bloqueado). Melhoria: a escolha também fica
  num cookie próprio, para ser lembrada quando o navegador bloqueia o localStorage. O ID do Google Analytics (`siteConfig.gaId`)
  continua vazio, como no site anterior: a análise só passa a funcionar quando o ID GA4 for informado.
- **SEO:** mantidos títulos, descrições, canonical, Open Graph, Twitter, `google-site-verification`, `googlec66dd12344b2a5f0.html`,
  robots.txt e manifesto do site anterior. Adicionado por página (tools/seo.py): Organization + WebSite + WebPage + trilha
  (BreadcrumbList) + serviços com preço (Service/Offer de js/data.js) + perguntas frequentes (FAQPage). Sitemap com as 18 páginas
  indexáveis e data atual; 404, obrigado e redirecionamentos com noindex; títulos e descrições longos encurtados.
