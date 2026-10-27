# Roteiros técnicos dos vídeos

Formato: 1920×1080, 30 fps, 33 s, H.264 (perfil High, `yuv420p`, `faststart`), sem áudio. Pôster: quadro de 5,5 s, com o hero revelado.

Os vídeos são **gravados**, não apenas roteirizados: `record-video.mjs` avança o tempo em passos de 1/30 s, posiciona câmera e rolagem e congela todas as animações CSS dos templates no tempo exato do quadro. O resultado é determinístico, sem quadros perdidos, e reflete o comportamento real do site.

## Linguagem comum

- **Câmera:** sem rotações nem trepidação. Só aproximação (1,4×–1,45×) com curva cúbica e um deslocamento lateral na troca para o celular.
- **Transições:** cortina vertical entre abertura, conteúdo e encerramento (0,7–0,9 s, `easeInOutCubic`). Textos entram por máscara de baixo para cima (`easeOutQuart`, 1 s, defasagem de 160 ms entre linhas).
- **Legendas:** cápsula branca no canto inferior esquerdo com número da cena e uma frase que descreve **o recurso**, não um adjetivo. Entram 0,3 s após o início da cena e saem 0,1 s antes da próxima.
- **Ritmo:** cada parada da rolagem dura 1,35 s de movimento e ao menos 1,2 s parada, tempo para as animações de revelação do template terminarem.
- **Tipografia e cor:** as do próprio template. A CMKCOGIT só aparece no encerramento.

## Estrutura (todas as versões)

| Tempo | Cena | Enquadramento | O que precisa aparecer |
| --- | --- | --- | --- |
| 0,0–3,2 | Abertura | Tela cheia na cor da marca | Rótulo do modelo; conceito em três linhas, com a linha de destaque em itálico ou cor |
| 3,2–6,0 | Hero | Navegador centralizado, 84% do tamanho real, sobe 80 px enquanto aparece | O hero carregando com a animação do próprio template |
| 6,0–19,0 | Tour | Navegador fixo; rolagem interna com paradas | 5 ou 6 seções, uma legenda por parada |
| 19,0–23,5 | Interação | Aproximação de 1,4× no ponto da interação | Uma microinteração real disparada no template |
| 23,5–29,0 | Responsivo | Navegador reduz para 78% e vai à esquerda; celular entra pela direita | Página em 390 px rolando sozinha |
| 29,0–33,0 | Encerramento | Cortina com a cor da marca | Nome do modelo, botão “Veja a demonstração completa” e `cmkcogit.com.br` |

## Portfólio (`portfolio.mp4`)

Conceito: *Composição editorial para quem vive do próprio trabalho.* Cores papel `#eeeae2`, tinta `#161513`, vermelhão `#b23a1c`. Tipografia Instrument Serif e Instrument Sans.

| Início | Parada | Legenda |
| --- | --- | --- |
| 6,0 | Abertura de “Trabalhos selecionados” | Projetos com composição editorial |
| 8,6 | Bloco sobreposto à panorâmica da Casa Brava | Contexto, processo e entrega |
| 11,2 | Livraria Margem (retrato + paisagem) | Imagens em proporções diferentes |
| 13,6 | Maré Cheia (texto fixo, pilha de imagens) | Texto fixo, imagens em sequência |
| 16,4 | Processo (cartões sobrepostos) | Processo em cartões sobrepostos |
| 19,0 | Arquivo: prévias que seguem o cursor por três linhas | Prévia que acompanha o cursor |

## Site institucional (`institucional.mp4`)

Conceito: *Credibilidade de empresa consolidada, sem perder a proximidade.* Verde `#123f33`, latão `#b88a3e`, fundo `#f5f3ee`. Tipografia Newsreader e Public Sans.

| Início | Parada | Legenda |
| --- | --- | --- |
| 6,0 | Painel “A empresa” entrando sobre o hero | Painel institucional em sobreposição |
| 8,8 | Serviços | Serviços organizados em abas |
| 11,4 | Linha do tempo do método preenchendo | Linha do tempo que acompanha a rolagem |
| 14,0 | Casos | Casos com contexto e decisão |
| 16,6 | Dúvidas frequentes | Dúvidas frequentes acessíveis |
| 19,0 | Troca de três abas de serviço | Abas com teclado e transição suave |

## Landing page (`landing.mp4`)

Conceito: *Uma narrativa do problema à ação, sem atrito.* Cobalto `#2447d6`, manteiga `#f4d35e`, fundo `#fbfaf6`. Tipografia Bricolage Grotesque e Figtree.

| Início | Parada | Legenda |
| --- | --- | --- |
| 6,0 | “Uma terça-feira comum” | O problema, na rotina do público |
| 8,6 / 10,4 / 12,2 | Cenas 1 a 3 da solução, com a tela do celular trocando | Solução contada em cenas · A tela acompanha o texto |
| 14,4 | Benefícios | Benefícios com hierarquia clara |
| 16,8 | Perguntas frequentes | Objeções respondidas antes do formulário |
| 19,0 | Formulário: envio vazio mostra os erros; os campos são preenchidos; envio confirmado | Validação clara, sem perder o que foi digitado |

## Como alterar

- Tempos, alvos e legendas: `scenes.js`.
- Composição, câmera e transições: `stage.html` (`renderAt(t)` é uma função pura do tempo).
- Prévia em tempo real: `/tools/templates/motion/stage.html?t=landing&preview=1`.
- Gravação: `node tools/templates/record-video.mjs landing` (`--draft` para uma versão rápida).

Para a versão personalizada de um cliente, o mesmo roteiro serve: troque `path`, `label`, `concept` e `palette`, e grave de novo.
