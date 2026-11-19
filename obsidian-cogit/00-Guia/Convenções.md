---
title: Convenções
tags: [guia]
---
# Convenções

## Pastas

| Pasta | O que guarda |
|---|---|
| `00-Guia` | Como usar este vault |
| `01-Empresa` | Quem somos, equipe, ferramentas, marca |
| `02-Fluxos` | Como trabalhamos: comercial, entrega, suporte, Jornada MVP |
| `03-Servicos` | Uma nota por serviço vendido (valor base, incluso, briefing) |
| `04-Catalogo` | Regras de preço e o catálogo; `Itens/` tem uma nota por variação ou funcionalidade, `Combos/` as combinações com desconto |
| `05-Projetos` | Clientes e projetos (cuidado: repositório público) |
| `90-Modelos` | Modelos para criar notas novas |
| `_sistema` | Script do catálogo e as exportações `catalogo.json` e `catalogo.csv` |

## Nomes de arquivo

- Nome legível, com acento e espaço: `Landing Page.md`, `Pesquisa de palavras-chave.md`.
- Sem `/ \ : * ? " < > | # ^ [ ]` no nome.
- Nenhum nome repetido no vault inteiro, mesmo em pastas diferentes.

## Propriedades (frontmatter)

- Toda nota do catálogo tem `id` em letras minúsculas com hífen (`seo-search-console`). O `id` **não muda** depois de criado: é a chave usada pelo site, pela plataforma e pelo orçamento MVP.
- `status`: `ativo` (validado pelos sócios ou já publicado no site), `a-validar` (sugestão ainda não aprovada), `pausado` (não oferecer agora).
- Datas no formato `AAAA-MM-DD`.
- `tags` como lista: `tags: [guia, comercial]`.

Os campos de cada item estão explicados em [Como atualizar o catálogo](Como%20atualizar%20o%20cat%C3%A1logo.md).

## Links

- Use links markdown relativos (o Obsidian já cria assim neste vault): funcionam no Obsidian e no GitHub.
- Termine cada nota com uma linha `Related:` ligando as notas de que ela depende.
- Trechos entre `<!-- catalogo:inicio -->` e `<!-- catalogo:fim -->` são gerados pelo script: não edite dentro deles, a mudança é apagada na próxima execução.

## O que não entra aqui

Senhas, tokens, dados pessoais de clientes, contratos assinados e informação financeira detalhada. Senhas ficam num gerenciador de senhas; documentos de clientes, no drive da empresa.

Related: [Instalar e configurar o Obsidian](Instalar%20e%20configurar%20o%20Obsidian.md)
