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
