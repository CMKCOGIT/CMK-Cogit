---
title: Regras de preço
tags: [catalogo, comercial]
---
# Regras de preço

## Fonte dos valores

| O quê | Fonte | Status |
|---|---|---|
| Valor base dos serviços | Site (`configuratorData` em `js/data.js`) e plataforma (`lib/selecao.js`) | Ativo |
| Combinações com 10% de desconto | Site (`serviceBundles` em `js/data.js`) | Ativo |
| Preço de cada variação ou funcionalidade | Este catálogo | A validar |

Mudou um valor base ou combinação aqui? Mude no site e na plataforma também.

## O que todo projeto já inclui

Não se cobra à parte: layout responsivo, HTTPS, publicação no domínio do cliente, SEO técnico básico (sites e loja), botão de WhatsApp e formulário de contato (sites), login e painel administrativo (sistemas) e **1 mês de suporte gratuito**.

## Limites do valor base (a validar)

> [!QUESTION] Decidir com os sócios
> O valor base precisa de um limite claro para saber quando começa o adicional. Sugestões:
>
> - **Landing page sob medida:** até 6 seções; a partir da 7ª, [Seção extra](Itens/Se%C3%A7%C3%A3o%20extra.md).
> - **Site institucional:** até 4 páginas (já no site); a partir da 5ª, [Página extra](Itens/P%C3%A1gina%20extra.md).
> - **Portfólio:** quantos projetos entram na base? Depois, [Cadastro de projetos no portfólio](Itens/Cadastro%20de%20projetos%20no%20portf%C3%B3lio.md).
> - **Loja virtual:** até 50 produtos cadastrados e 1 meio de pagamento.
> - **Sistemas e MVP:** até 3 cadastros simples no fluxo principal; depois, por entidade.
> - **Rodadas de ajuste:** modelo pronto 1, sob medida 2.
> - **Componentes do estúdio sob medida:** os que já estão "Na base" da estrutura escolhida não se cobram; os acrescentados somam o preço do componente.

## Tipos de preço

Explicados em [Como atualizar o catálogo](../00-Guia/Como%20atualizar%20o%20cat%C3%A1logo.md): `fixo`, `a-partir-de`, `por-unidade`, `recorrente`, `repasse`, `percentual`, `incluso`, `sob-consulta`.

## Modificadores

| Modificador | Valor | Quando |
|---|---|---|
| [Urgência](Itens/Urg%C3%AAncia%20%28prazo%20reduzido%20pela%20metade%29.md) | +30% | Entrega na metade do prazo normal, se a agenda permitir |
| [Complexidade alta](Itens/Complexidade%20alta.md) | +20% | Regras difíceis, muito volume, segurança, prazos legais |
| [Desconto de combinação](Itens/Desconto%20de%20combina%C3%A7%C3%A3o.md) | −10% | Todos os serviços de uma combinação no mesmo orçamento |

Os percentuais valem sobre o projeto (base + itens), nunca sobre repasses.

## Combinações

O desconto vale quando todos os serviços da combinação estão na seleção; as de presença valem com o modelo pronto. O valor final é arredondado para baixo, de 10 em 10.

- [Presença Essencial](Combos/Presen%C3%A7a%20Essencial.md)
- [Conversão](Combos/Convers%C3%A3o.md)
- [Operação Conectada](Combos/Opera%C3%A7%C3%A3o%20Conectada.md)

## Valor-hora de referência

Os preços sugeridos dos itens ficam, em geral, entre **R$ 80 e R$ 100 por hora estimada**. A coluna "R$ por hora" do [Catálogo.base](Cat%C3%A1logo.base) mostra o valor de cada item; um item muito abaixo disso está barato para o esforço.

> [!QUESTION] Decidir
> Qual é o valor-hora mínimo da COGIT? Com ele definido, dá para revisar a coluna "R$ por hora" e ajustar os itens fora da faixa.

## Arredondamento

Preços terminam em 0 (R$ 150, R$ 890, R$ 1.490). Percentuais aplicados arredondam para baixo, de 10 em 10, como o site faz com as combinações.

Related: [Como precificar](Como%20precificar.md) · [Catálogo completo](INDEX.md)
