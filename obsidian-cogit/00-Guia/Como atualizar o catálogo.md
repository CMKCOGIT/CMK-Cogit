---
title: Como atualizar o catálogo
tags: [guia, catalogo]
---
# Como atualizar o catálogo

O catálogo tem três partes:

1. **Notas de serviço** (`03-Servicos`): o valor base de cada serviço.
2. **Notas de item** (`04-Catalogo/Itens`): cada variação ou funcionalidade, com o seu preço. Um item pode servir a vários serviços (por exemplo, *Google Analytics 4* vale para landing page, site, loja e sistemas).
3. **Combinações** (`04-Catalogo/Combos`): pacotes com desconto.

As propriedades das notas são a fonte. Tabelas, índice e exportações são gerados a partir delas.

## Mudar um preço

- **Pela tabela:** abra o [Catálogo.base](../04-Catalogo/Cat%C3%A1logo.base), escolha a visão (por exemplo *Landing Page* ou *A validar*) e edite a célula.
- **Pela nota:** abra o item e mude a propriedade `preco`.

Depois de validar com os sócios, troque `status` de `a-validar` para `ativo`.

> [!IMPORTANT] Preços que já estão no site
> Os valores base dos serviços e os combos também estão em `js/data.js` (site) e em `lib/selecao.js` (plataforma). Mudou um deles aqui? Mude lá também. O script do vault não altera o site.

## Criar um item novo

1. Na pasta `04-Catalogo/Itens`, crie uma nota com o nome do item.
2. `Ctrl/Cmd + P` → **Modelos: inserir modelo** → *Modelo - Item do catálogo*.
3. Preencha as propriedades (tabela abaixo). O `id` precisa ser único.
4. Rode o script.

## Campos de um item

| Campo | O que é | Exemplo |
|---|---|---|
| `id` | Chave única, minúsculas e hífen. Não mude depois de criada | `metricas-ga4` |
| `tipo` | Sempre `item` | `item` |
| `nome` | Nome que aparece no orçamento | `Google Analytics 4` |
| `categoria` | Grupo do catálogo | `Métricas e rastreamento` |
| `servicos` | Ids dos serviços em que o item pode ser **somado** | `[landing-page, site-institucional]` |
| `incluso_em` | Ids dos serviços em que o item **já está no valor base** | `[mvp]` |
| `formato` | `ambos`, `modelo-pronto` ou `sob-medida` (para sites) | `sob-medida` |
| `tipo_preco` | Como cobrar (lista abaixo) | `por-unidade` |
| `preco` | Número, sem `R$` e sem ponto de milhar | `1200` |
| `unidade` | Por que se cobra | `página`, `mês`, `entidade` |
| `horas` | Esforço estimado, para conferir o valor-hora | `1.5` |
| `status` | `ativo`, `a-validar` ou `pausado` | `a-validar` |
| `descricao` | Uma frase que explica o item para o cliente | |

Tipos de preço:

| `tipo_preco` | Significado | Aparece como |
|---|---|---|
| `fixo` | Valor fechado por projeto | R$ 150 |
| `a-partir-de` | Valor mínimo; o final depende do escopo | a partir de R$ 1.500 |
| `por-unidade` | Multiplica pela quantidade (`unidade`) | R$ 90 / página |
| `recorrente` | Cobrança periódica da COGIT | R$ 50/mês |
| `repasse` | Custo de terceiro pago pelo cliente (domínio, licenças, servidor) | Repasse ≈ R$ 40 / ano |
| `percentual` | Acréscimo ou desconto sobre o projeto (`preco: -10` = desconto) | +30% sobre o projeto |
| `incluso` | Já faz parte do valor base; serve para deixar claro o que não se cobra | Incluso |
| `sob-consulta` | Sem preço definido; decidir caso a caso | Sob consulta |

Os ids de serviço são: `diagnostico`, `consultoria`, `identidade-essencial`, `landing-page`, `portfolio`, `site-institucional`, `loja-virtual`, `sistema`, `plataforma`, `mvp`, `saas`, `automacao`, `integracao`, `manutencao` (suporte essencial) e `suporte` (suporte contínuo). São os mesmos do site.

## Rodar o script

Na pasta do vault, no terminal:

```sh
python3 _sistema/catalogo.py          # valida, atualiza as tabelas e exporta
python3 _sistema/catalogo.py --check  # só confere
```

Ele:

- avisa sobre id repetido, serviço que não existe, preço que não é número, tipo ou status inválido;
- atualiza as tabelas das notas de serviço, o trecho gerado de cada item e o [Catálogo completo](../04-Catalogo/INDEX.md);
- grava `_sistema/catalogo.json` (para a [Jornada MVP](../02-Fluxos/Jornada%20MVP.md) e a plataforma) e `_sistema/catalogo.csv` (para abrir no Excel ou Google Sheets).

Quem não usa terminal pode pedir ao Claude para rodar.

Related: [Regras de preço](../04-Catalogo/Regras%20de%20pre%C3%A7o.md) · [Convenções](Conven%C3%A7%C3%B5es.md)
