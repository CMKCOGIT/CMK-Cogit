---
title: Instalar e configurar o Obsidian
tags: [guia]
---
# Instalar e configurar o Obsidian

## 1. Instalar

Baixe em [obsidian.md](https://obsidian.md) (Windows, Mac, Linux, Android e iPhone). É gratuito, inclusive para uso na empresa.

## 2. Pegar a pasta do vault

O vault é a pasta `obsidian-cogit` do repositório `CMKCOGIT/CMK-Cogit`.

- **Com GitHub Desktop (recomendado):** clone o repositório e use a pasta `obsidian-cogit` de dentro dele. Assim as mudanças voltam para o GitHub.
- **Só para olhar:** baixe o ZIP do repositório no GitHub e descompacte.

## 3. Abrir como cofre

No Obsidian: **Abrir pasta como cofre** (Open folder as vault) e escolha a pasta `obsidian-cogit`. Não abra a raiz do repositório: ela tem o site inteiro, e o gráfico ficaria cheio de arquivos que não são notas.

A pasta já vem com estas configurações em `.obsidian/`:

- links em markdown com caminho relativo (funcionam no Obsidian e no GitHub);
- modelos de nota em `90-Modelos`;
- tipos das propriedades do catálogo (`preco` e `horas` como número, `servicos` como lista).

## 4. Plugins nativos para deixar ligados

Em **Configurações → Plugins principais**, confira se estão ativos:

| Plugin | Para quê |
|---|---|
| Bases | Abrir o [Catálogo.base](../04-Catalogo/Cat%C3%A1logo.base) como tabela editável |
| Modelos (Templates) | Criar notas a partir de `90-Modelos` |
| Propriedades | Editar preço, status e serviços de cada item |
| Backlinks e Gráfico | Ver o que liga em quê |
| Pesquisa | Achar qualquer coisa pelo texto |

## 5. Plugins da comunidade (opcionais)

- **Git** (Obsidian Git): salva e envia as mudanças para o GitHub sozinho, de tempos em tempos. Útil se os sócios editam pelo computador.
- **Kanban**: para acompanhar o funil comercial e os projetos em colunas.

## Sincronizar entre os sócios

Há dois caminhos:

1. **GitHub (gratuito):** cada pessoa clona o repositório; o plugin Git ou o GitHub Desktop envia e recebe as mudanças. O recomendado é mover este vault para um **repositório privado** (por exemplo `CMKCOGIT/cogit-vault`) antes de colocar informação interna, porque `CMK-Cogit` é público.
2. **Obsidian Sync (pago):** o mais simples para quem não usa Git; permite cofre compartilhado entre contas.

Related: [Convenções](Conven%C3%A7%C3%B5es.md) · [Como atualizar o catálogo](Como%20atualizar%20o%20cat%C3%A1logo.md)
