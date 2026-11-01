# CMKCOGIT — Rebrand 2026

> Pensamos antes de construir.

Este documento reúne o diagnóstico, o conceito, o sistema visual e a estratégia de estrutura do site. O guia visual interativo, com logos, cores, tipografia, movimento, mockups e downloads, está em [`/marca/`](../marca/index.html).

---

## 1. Diagnóstico da marca anterior

| Ponto | Situação anterior | Problema |
|---|---|---|
| Logo | “CMK” em contorno fino + “COGIT” em sans pesada, roxo e branco | Duas linguagens que não conversam. O contorno some em tamanhos pequenos e o favicon fica ilegível. |
| Cor | Navy `#0F1B33` + roxo `#4A3DDB` + branco | O azul é a cor da marca e foi mantido, mas sem nuances nem contraste de destaque: tudo ficava no mesmo tom médio. |
| Tipografia | Inter + Manrope | Boas fontes de interface, mas neutras. Não carregam personalidade. |
| Site | Estrutura institucional clássica: hero, números, cards, CTA | Funciona e está validado, mas não demonstra o que a empresa vende: design, experiência e estratégia. |
| Posicionamento | “Tecnologia sob medida” | Toda software house diz o mesmo. O diferencial real (pensar antes, design e marketing) ficava escondido. |

A referência enviada (o “cmk” em traço contínuo) transmite fluidez e unidade, e a ideia de ser uma peça só foi mantida. A fonte da referência foi descartada, como pedido.

---

## 2. Conceito: **C-cursor**

O símbolo junta duas ideias da própria frase da marca:

- **A moldura em C**: é a inicial de CMK e COGIT e também a forma de uma tela ou janela de interface. Representa **construir**.
- **O cursor**: o bloco que pisca antes da primeira letra ser digitada. Representa **pensar**, o momento antes de construir.

> O cursor piscando dentro da moldura é a marca dizendo “Pensamos antes de construir”, sem precisar de texto.

Por que funciona:

1. **Não tem cara de IA genérica.** Não há degradê roxo-azul, orbe, estrela de quatro pontas nem neural. É geometria simples e com significado próprio.
2. **Fala de desenvolvimento sem clichê.** Não usa `</>` nem chaves. O cursor é universal para quem cria em tela.
3. **Escala.** Fica legível em 16 px (favicon) e funciona como ícone de app, avatar, adesivo e marca-d’água.
4. **Já nasce animado.** A moldura se desenha, o cursor pisca e o nome é “digitado”. O logo vira assinatura de movimento.

### Wordmark

`cmkcogit` em caixa baixa e numa só palavra, com a **Anybody** no eixo de largura máximo (wdth 150, wght 850), vetorizada. “cmk” fica em Papel e “cogit” em Elétrico; em fundo claro, “cogit” vai para Cobalto. A largura extrema dá presença de cartaz e de marca de estúdio, longe do “logo padrão”.

### Personalidade e voz

| Somos | Não somos |
|---|---|
| Estratégicos, que pensam antes | Apressados, que fazem “só o site” |
| Ousados no visual | Exagerados ou confusos |
| Claros e diretos | Técnicos demais, com jargão |
| Parceiros de longo prazo | Fornecedores de entrega única |

O tom é de frases curtas e verbos fortes, conversando com o dono do negócio, não com outro programador.

---

## 3. Sistema visual

### Cores (tons de azul)

A pedido da empresa, o azul continua sendo a cor da marca. A paleta trabalha o azul em três níveis de energia, do profundo ao elétrico, sem verde nem roxo.

| Nome | HEX | Papel | Proporção |
|---|---|---|---|
| **Tinta** | `#0A0F1E` | Fundo principal, texto sobre claro | ~60% |
| **Papel** | `#F1F4FA` | Fundo claro quente (não é branco hospitalar), texto sobre escuro | ~25% |
| **Elétrico** | `#4DA8FF` | Ação, destaque, cursor. É a cor da conversão | ~10% |
| **Cobalto** | `#2D4FFF` | O azul institucional da COGIT. Botões e destaques em fundo claro | ~5% |
| **Brasa** | `#FF5B37` | Alertas e detalhes pontuais | <1% |

Contraste (WCAG 2.1, verificado em `tools/check.mjs`):

- Tinta sobre Elétrico: 7,6:1
- Papel sobre Tinta: 17,3:1
- Branco sobre Cobalto: 5,7:1
- `#2442E0` sobre Papel: 6,5:1
- `#4E5A72` sobre Papel: 6,3:1

**Regra:** Elétrico nunca é usado como texto sobre Papel. Sobre Cobalto, o texto é sempre branco.

### Tipografia (todas OFL, locais em `assets/fonts`)

| Uso | Fonte | Por quê |
|---|---|---|
| Display (h1, h2, h3, logo) | **Anybody** variável, wdth 50–150 e wght 100–900 | O eixo de largura permite **tipografia cinética**: os títulos se expandem e contraem com a rolagem. É a “fonte animada” pedida, com qualidade de fonte editorial. |
| Texto e interface | **Geist** variável | Moderna, muito legível e com cara de produto digital. |
| Rótulos, dados, “código” | **Geist Mono** | Faz a ponte com o universo de desenvolvimento nos rótulos `▮ SEÇÃO` e nos números. |

### Elementos gráficos

- **Cursor ▮**: abre todo rótulo de seção e pisca.
- **Grade de 72 px**: a malha de “prancheta de projeto” nos fundos escuros, com máscara radial.
- **Faixa azul elétrico inclinada**: o marquee dos serviços, que acelera com a velocidade da rolagem.
- **Grão**: um ruído de 4,5% sobre tudo, que tira a cara de template.

### Movimento (princípios)

| Princípio | Onde | Token |
|---|---|---|
| **Desenhar**: o traço aparece | Intro, símbolo | `cubic-bezier(.7,0,.2,1)` · 900 ms |
| **Digitar**: revela em passos | Wordmark na intro | `steps(8)` · 800 ms |
| **Piscar**: o cursor vivo | Rótulos, símbolo | `steps(1)` · 1,1 s |
| **Subir por máscara**: palavra a palavra | Títulos de seção | `cubic-bezier(.22,1,.36,1)` · 900 ms + 45 ms por palavra |
| **Acender com a rolagem** | Manifesto | ligado ao scroll |
| **Expandir**: o eixo wdth | Títulos `.cmk-kinetic` | ligado ao scroll |

Todo movimento é desligado com `prefers-reduced-motion`, e o conteúdo aparece completo sem JavaScript.

---

## 4. Estratégia de estrutura do site

### O que a pesquisa diz

- **A primeira impressão se forma em cerca de 50 ms** e contamina a percepção de usabilidade e credibilidade (Lindgaard et al., 2006, *Behaviour & Information Technology*). Para uma empresa que vende design, o hero é a prova do produto.
- **Cerca de 46% das pessoas julgam a credibilidade de um site pela aparência** (Stanford Web Credibility, Fogg, 2002). Foi o fator mais citado.
- **57% do tempo de visualização fica na primeira tela e 17% na segunda** (Nielsen Norman Group, 2018). Proposta de valor, prova e ação principal precisam estar nas duas primeiras telas.
- **A probabilidade de abandono sobe 32% quando o carregamento vai de 1 s para 3 s** (Think with Google). Por isso tudo foi feito sem bibliotecas: fontes variáveis locais (3 arquivos, ~110 KB), CSS único e JS de movimento com ~6 KB.

### Ordem da home e o motivo de cada seção

| # | Seção | Objetivo | Estratégia |
|---|---|---|---|
| 0 | **Intro** (1ª visita) | Memorização da marca | O logo se desenha em ~1,5 s. Só aparece na primeira visita da sessão e pode ser pulado com um clique. |
| 1 | **Hero** | Clareza em 5 s e primeira ação | Título-cartaz com a promessa, subtítulo com o que fazemos e, ao lado, o **diagnóstico interativo**, que gera micro-compromisso: responder 3 perguntas converte mais que “fale conosco”. |
| 2 | **Faixa em movimento** | Mostrar o escopo sem texto longo | Os serviços passam em loop. Movimento chama o olho e indica que há mais conteúdo abaixo. |
| 3 | **Manifesto** | Diferenciação | “Todo mundo constrói sites. Nós pensamos antes…”. As palavras acendem com a rolagem, então o visitante lê no ritmo do próprio scroll (storytelling). |
| 4 | **Números** | Prova objetiva e redução de risco | 12 soluções, 4 frentes, 3 modelos e “a partir de R$ 350”. O preço de entrada derruba a objeção “deve ser caro”. |
| 5 | **Frentes de solução** | Autosseleção | O visitante escolhe pelo **problema** (“atrair e converter”), não pela tecnologia. O holofote no hover reforça a interatividade. |
| 6 | **Projetos** | Prova social | Cases reais logo depois da escolha, para mostrar que a empresa já fez isso. |
| 7 | **Como funciona** (cartões empilhados) | Reduzir a ansiedade do processo | Três etapas que se empilham na rolagem: 01 Papel, 02 Cobalto e 03 Tinta, como um projeto ganhando forma. |
| 8 | **CTA final** | Conversão | Título gigante com cor de destaque, CTA Elétrico e uma alternativa de menor compromisso (“Montar minha solução”). |
| 9 | **Rodapé** | Navegação e assinatura | O wordmark gigante como marca-d’água fecha a página como um pôster. |

**CTA sempre à mão:** o cabeçalho tem o CTA Elétrico, o celular tem a barra fixa inferior (zona do polegar) e a central de contato flutuante segue disponível.

### Páginas internas

Todas herdam o sistema pela camada `css/rebrand.css`:

- heróis em Tinta com a grade e um brilho Cobalto
- títulos em Anybody
- botões em pílula com preenchimento animado
- rótulos com cursor
- cores legadas convertidas

Textos, preços, fluxos e dados **não foram alterados**.

---

## 5. Implementação (arquivos)

| Arquivo | O que é |
|---|---|
| `css/rebrand.css` | Camada final: tokens, tipografia, componentes, seções da home, heróis internos e ajustes de celular |
| `js/rebrand-motion.js` | Barra de leitura, marquee reativo, manifesto, títulos por máscara, tipo cinético, holofote, botões magnéticos e pilha de etapas |
| `assets/brand/logo/*.svg` | 19 versões do logo (horizontal, empilhado, wordmark, símbolo, app; dark, light e mono) |
| `assets/brand/png/*` | PNGs em alta (logos 2000 px, ícones de app 1024 px, avatar 1080 px, favicons) |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `assets/images/icon-*.png` | Ícones do navegador e PWA |
| `assets/images/og-cmkcogit-2026.png` | Card de compartilhamento 1200×630 |
| `tools/brand/build-logos.py` | Gera os SVGs a partir da fonte (wordmark vetorizado) |
| `tools/brand/render-assets.mjs` + `make-ico.py` | Renderiza PNGs, OG e favicon.ico |
| `marca/index.html` | Brand book interativo com mockups |

Para regenerar a marca:

```sh
pip install fonttools brotli pillow
python3 tools/brand/build-logos.py
node tools/brand/render-assets.mjs
python3 tools/brand/make-ico.py
node tools/build-css.mjs
```

As fontes antigas (Inter e Manrope, `cogit-font-*.woff2`) continuam no repositório e podem ser removidas depois que a plataforma (`app.cmkcogit.com.br`) também migrar. O arquivo `css/tokens.css` é compartilhado com a plataforma: a nova paleta foi aplicada por cima, em `rebrand.css`, para não quebrar a plataforma antes da migração dela.

---

## 6. Próximos passos recomendados

1. **Plataforma**: copiar o bloco `:root` de `rebrand.css` para `public/css/tokens.css` da plataforma e trocar os logos.
2. **Redes**: usar o avatar `assets/brand/png/cmkcogit-avatar-1080.png` e os modelos de post do brand book.
3. **Medir**: comparar no GA (após consentimento) a taxa de início do diagnóstico, os cliques no CTA do cabeçalho e a rolagem até o CTA final, nos 30 dias antes e depois.
4. **Cases visuais**: a seção de projetos ganha muito com capturas reais dos sistemas (mockups de navegador já estão no brand book como modelo).

### Fontes da pesquisa

- [NN/g: Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/)
- [Think with Google: page load time statistics](https://thinkwithgoogle.com/data/page-load-time-statistics)
- [Nature (2006): web users judge sites in the blink of an eye — Lindgaard et al.](https://www.nature.com/news/2006/060109/full/news060109-13.html)
- [Stanford/Fogg (2002): For site cred, looks matter](https://internetnews.com/marketing/study-for-site-cred-looks-matter)
