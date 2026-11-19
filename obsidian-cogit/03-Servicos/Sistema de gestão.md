---
id: sistema
tipo: servico
nome: Sistema de gestão
frente: Organizar e escalar
tipo_preco: a-partir-de
preco: 2990
unidade: projeto
prazo: definido na proposta
status: ativo
ordem: 8
tags: [servico]
---
# Sistema de gestão

Software interno, usado pela equipe, que substitui planilhas e controles soltos: cadastros, pedidos, estoque, agenda, financeiro, permissões por função, aprovações e relatórios.

**Frente:** Organizar e escalar · **Prazo:** definido na proposta

## O que já está no valor base

- Login com e-mail e senha
- Perfis e permissões por função
- Painel administrativo
- Cadastros do fluxo principal
- 1 mês de suporte gratuito

## Adicionais mais pedidos

Não estão no valor base; somam ao orçamento:

- [Financeiro (contas a pagar e a receber)](../04-Catalogo/Itens/Financeiro%20%28contas%20a%20pagar%20e%20a%20receber%29.md)
- [Controle de estoque](../04-Catalogo/Itens/Controle%20de%20estoque.md)
- [Dashboard com indicadores e gráficos](../04-Catalogo/Itens/Dashboard%20com%20indicadores%20e%20gr%C3%A1ficos.md)
- [Importação de dados por planilha](../04-Catalogo/Itens/Importa%C3%A7%C3%A3o%20de%20dados%20por%20planilha.md)

## Perguntas para o briefing

- Quais planilhas ou controles o sistema vai substituir?
- Quantas pessoas usam e com quais funções?
- Quais relatórios a gestão precisa ver?
- Precisa conversar com outro sistema (ERP, nota fiscal, banco)?

## Variações e funcionalidades

> [!TIP] Tabela editável
> No Obsidian, a visão abaixo vem do [Catálogo.base](../04-Catalogo/Cat%C3%A1logo.base): mude preço ou status direto na célula. A tabela gerada logo depois é a cópia que aparece no GitHub (atualize com `python3 _sistema/catalogo.py`).

![[Catálogo.base#Sistema de gestão]]

<!-- catalogo:inicio -->
135 variações e funcionalidades ligadas a este serviço. "Incluso" já está no valor base; o resto soma ao orçamento.

### Domínio, hospedagem e e-mail

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Certificado de segurança (HTTPS)](../04-Catalogo/Itens/Certificado%20de%20seguran%C3%A7a%20%28HTTPS%29.md) | Incluso na base | ambos |  | a-validar |
| [Publicação no domínio do cliente (DNS)](../04-Catalogo/Itens/Publica%C3%A7%C3%A3o%20no%20dom%C3%ADnio%20do%20cliente%20%28DNS%29.md) | Incluso na base | ambos |  | a-validar |
| [Compra do domínio pela COGIT](../04-Catalogo/Itens/Compra%20do%20dom%C3%ADnio%20pela%20COGIT.md) | R$ 50 | ambos | 0.5 | a-validar |
| [Configuração de e-mail profissional](../04-Catalogo/Itens/Configura%C3%A7%C3%A3o%20de%20e-mail%20profissional.md) | R$ 150 | ambos | 1.5 | a-validar |
| [Domínio .com.br (Registro.br)](../04-Catalogo/Itens/Dom%C3%ADnio%20.com.br%20%28Registro.br%29.md) | Repasse ≈ R$ 40 / ano | ambos | 0 | a-validar |
| [Domínio internacional (.com, .net, .io)](../04-Catalogo/Itens/Dom%C3%ADnio%20internacional%20%28.com%2C%20.net%2C%20.io%29.md) | Repasse ≈ R$ 90 / ano | ambos | 0 | a-validar |
| [Licenças de e-mail profissional](../04-Catalogo/Itens/Licen%C3%A7as%20de%20e-mail%20profissional.md) | Repasse ≈ R$ 35 / usuário/mês | ambos | 0 | a-validar |
| [Servidor e banco de dados](../04-Catalogo/Itens/Servidor%20e%20banco%20de%20dados.md) | Repasse ≈ R$ 100 / mês | ambos | 0 | a-validar |
| [Subdomínio adicional](../04-Catalogo/Itens/Subdom%C3%ADnio%20adicional.md) | R$ 50 | ambos | 0.5 | a-validar |

### Métricas e rastreamento

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [API de Conversões da Meta (servidor)](../04-Catalogo/Itens/API%20de%20Convers%C3%B5es%20da%20Meta%20%28servidor%29.md) | R$ 450 | ambos | 5 | a-validar |
| [Eventos de conversão](../04-Catalogo/Itens/Eventos%20de%20convers%C3%A3o.md) | R$ 40 / evento | ambos | 0.5 | a-validar |
| [Google Analytics 4](../04-Catalogo/Itens/Google%20Analytics%204.md) | R$ 100 | ambos | 1 | a-validar |
| [Google Tag Manager](../04-Catalogo/Itens/Google%20Tag%20Manager.md) | R$ 120 | ambos | 1.5 | a-validar |
| [Mapa de calor e gravação de sessões](../04-Catalogo/Itens/Mapa%20de%20calor%20e%20grava%C3%A7%C3%A3o%20de%20sess%C3%B5es.md) | R$ 60 | ambos | 0.5 | a-validar |
| [Métricas de uso do produto](../04-Catalogo/Itens/M%C3%A9tricas%20de%20uso%20do%20produto.md) | R$ 500 | ambos | 6 | a-validar |
| [Pixel da Meta (Facebook e Instagram)](../04-Catalogo/Itens/Pixel%20da%20Meta%20%28Facebook%20e%20Instagram%29.md) | R$ 100 | ambos | 1 | a-validar |

### Privacidade e LGPD

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Aviso e preferências de cookies](../04-Catalogo/Itens/Aviso%20e%20prefer%C3%AAncias%20de%20cookies.md) | R$ 150 | ambos | 2 | a-validar |
| [Exportação e exclusão de dados do usuário](../04-Catalogo/Itens/Exporta%C3%A7%C3%A3o%20e%20exclus%C3%A3o%20de%20dados%20do%20usu%C3%A1rio.md) | R$ 500 | ambos | 6 | a-validar |
| [Política de Privacidade e Termos de Uso](../04-Catalogo/Itens/Pol%C3%ADtica%20de%20Privacidade%20e%20Termos%20de%20Uso.md) | R$ 150 | ambos | 1.5 | a-validar |

### Conteúdo e textos

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Tradução de textos](../04-Catalogo/Itens/Tradu%C3%A7%C3%A3o%20de%20textos.md) | R$ 60 / página | ambos | 0.5 | a-validar |
| [Versão em outro idioma](../04-Catalogo/Itens/Vers%C3%A3o%20em%20outro%20idioma.md) | R$ 250 / idioma | ambos | 3 | a-validar |

### Páginas e design

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Layout responsivo](../04-Catalogo/Itens/Layout%20responsivo.md) | Incluso na base | ambos |  | a-validar |
| [Modo escuro](../04-Catalogo/Itens/Modo%20escuro.md) | R$ 250 | ambos | 3 | a-validar |
| [Protótipo visual antes do desenvolvimento](../04-Catalogo/Itens/Prot%C3%B3tipo%20visual%20antes%20do%20desenvolvimento.md) | R$ 150 / tela | sob-medida | 1.5 | a-validar |
| [Revisão de acessibilidade (WCAG AA)](../04-Catalogo/Itens/Revis%C3%A3o%20de%20acessibilidade%20%28WCAG%20AA%29.md) | R$ 300 | ambos | 3.5 | a-validar |
| [Rodada extra de ajustes](../04-Catalogo/Itens/Rodada%20extra%20de%20ajustes.md) | R$ 100 / rodada | ambos | 1 | a-validar |
| [Ícones ou ilustrações personalizados](../04-Catalogo/Itens/%C3%8Dcones%20ou%20ilustra%C3%A7%C3%B5es%20personalizados.md) | R$ 250 / conjunto de até 8 | ambos | 3 | a-validar |

### Formulários e captação

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Chat on-line](../04-Catalogo/Itens/Chat%20on-line.md) | R$ 100 | ambos | 1 | a-validar |

### Acesso e usuários

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Login com e-mail e senha](../04-Catalogo/Itens/Login%20com%20e-mail%20e%20senha.md) | Incluso na base | ambos |  | a-validar |
| [Perfis e permissões por função](../04-Catalogo/Itens/Perfis%20e%20permiss%C3%B5es%20por%20fun%C3%A7%C3%A3o.md) | Incluso na base | ambos | 9 | a-validar |
| [Cadastro aberto com aprovação](../04-Catalogo/Itens/Cadastro%20aberto%20com%20aprova%C3%A7%C3%A3o.md) | R$ 350 | ambos | 4 | a-validar |
| [Convite de usuários e gestão de equipe](../04-Catalogo/Itens/Convite%20de%20usu%C3%A1rios%20e%20gest%C3%A3o%20de%20equipe.md) | R$ 450 | ambos | 5 | a-validar |
| [Histórico de alterações (auditoria)](../04-Catalogo/Itens/Hist%C3%B3rico%20de%20altera%C3%A7%C3%B5es%20%28auditoria%29.md) | R$ 600 | ambos | 7 | a-validar |
| [Login com Google ou Apple](../04-Catalogo/Itens/Login%20com%20Google%20ou%20Apple.md) | R$ 450 | ambos | 5 | a-validar |
| [Login corporativo (SSO)](../04-Catalogo/Itens/Login%20corporativo%20%28SSO%29.md) | a partir de R$ 1.500 | ambos | 16 | a-validar |
| [Multiempresa (várias contas isoladas)](../04-Catalogo/Itens/Multiempresa%20%28v%C3%A1rias%20contas%20isoladas%29.md) | a partir de R$ 2.500 | ambos | 28 | a-validar |
| [Verificação em duas etapas](../04-Catalogo/Itens/Verifica%C3%A7%C3%A3o%20em%20duas%20etapas.md) | R$ 500 | ambos | 6 | a-validar |

### Dados e cadastros

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Busca e filtros avançados](../04-Catalogo/Itens/Busca%20e%20filtros%20avan%C3%A7ados.md) | R$ 400 | ambos | 4.5 | a-validar |
| [Cadastro com regras e relacionamentos (por entidade)](../04-Catalogo/Itens/Cadastro%20com%20regras%20e%20relacionamentos%20%28por%20entidade%29.md) | R$ 750 / entidade | ambos | 8 | a-validar |
| [Cadastro simples (por entidade)](../04-Catalogo/Itens/Cadastro%20simples%20%28por%20entidade%29.md) | R$ 350 / entidade | ambos | 4 | a-validar |
| [Campos personalizáveis pelo cliente](../04-Catalogo/Itens/Campos%20personaliz%C3%A1veis%20pelo%20cliente.md) | R$ 900 | ambos | 10 | a-validar |
| [Exportação em Excel ou CSV](../04-Catalogo/Itens/Exporta%C3%A7%C3%A3o%20em%20Excel%20ou%20CSV.md) | R$ 300 | ambos | 3.5 | a-validar |
| [Fluxo de aprovação](../04-Catalogo/Itens/Fluxo%20de%20aprova%C3%A7%C3%A3o.md) | R$ 900 | ambos | 10 | a-validar |
| [Geração de documentos em PDF](../04-Catalogo/Itens/Gera%C3%A7%C3%A3o%20de%20documentos%20em%20PDF.md) | R$ 600 | ambos | 7 | a-validar |
| [Importação de dados por planilha](../04-Catalogo/Itens/Importa%C3%A7%C3%A3o%20de%20dados%20por%20planilha.md) | R$ 500 | ambos | 6 | a-validar |
| [Migração de dados de outro sistema](../04-Catalogo/Itens/Migra%C3%A7%C3%A3o%20de%20dados%20de%20outro%20sistema.md) | a partir de R$ 800 | ambos | 9 | a-validar |
| [Quadro kanban](../04-Catalogo/Itens/Quadro%20kanban.md) | R$ 700 | ambos | 8 | a-validar |
| [Upload e armazenamento de arquivos](../04-Catalogo/Itens/Upload%20e%20armazenamento%20de%20arquivos.md) | R$ 450 | ambos | 5 | a-validar |
| [Visualização em calendário](../04-Catalogo/Itens/Visualiza%C3%A7%C3%A3o%20em%20calend%C3%A1rio.md) | R$ 700 | ambos | 8 | a-validar |

### Painéis e relatórios

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Painel administrativo](../04-Catalogo/Itens/Painel%20administrativo.md) | Incluso na base | ambos |  | a-validar |
| [Dashboard com indicadores e gráficos](../04-Catalogo/Itens/Dashboard%20com%20indicadores%20e%20gr%C3%A1ficos.md) | R$ 900 | ambos | 10 | a-validar |
| [Relatório automático por e-mail](../04-Catalogo/Itens/Relat%C3%B3rio%20autom%C3%A1tico%20por%20e-mail.md) | R$ 500 | ambos | 6 | a-validar |
| [Relatório personalizado](../04-Catalogo/Itens/Relat%C3%B3rio%20personalizado.md) | R$ 400 / relatório | ambos | 4.5 | a-validar |

### Comunicação e notificações

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Central de chamados (tickets)](../04-Catalogo/Itens/Central%20de%20chamados%20%28tickets%29.md) | R$ 1.200 | ambos | 14 | a-validar |
| [Central de notificações no sistema](../04-Catalogo/Itens/Central%20de%20notifica%C3%A7%C3%B5es%20no%20sistema.md) | R$ 500 | ambos | 6 | a-validar |
| [Chat entre usuários (tempo real)](../04-Catalogo/Itens/Chat%20entre%20usu%C3%A1rios%20%28tempo%20real%29.md) | a partir de R$ 1.800 | ambos | 20 | a-validar |
| [Comentários e menções](../04-Catalogo/Itens/Coment%C3%A1rios%20e%20men%C3%A7%C3%B5es.md) | R$ 500 | ambos | 6 | a-validar |
| [E-mails automáticos do sistema](../04-Catalogo/Itens/E-mails%20autom%C3%A1ticos%20do%20sistema.md) | R$ 400 | ambos | 4.5 | a-validar |
| [E-mails com o layout da marca](../04-Catalogo/Itens/E-mails%20com%20o%20layout%20da%20marca.md) | R$ 300 | ambos | 3.5 | a-validar |
| [Notificações por SMS](../04-Catalogo/Itens/Notifica%C3%A7%C3%B5es%20por%20SMS.md) | R$ 600 | ambos | 7 | a-validar |
| [Notificações por WhatsApp](../04-Catalogo/Itens/Notifica%C3%A7%C3%B5es%20por%20WhatsApp.md) | a partir de R$ 900 | ambos | 10 | a-validar |
| [Notificações push](../04-Catalogo/Itens/Notifica%C3%A7%C3%B5es%20push.md) | R$ 600 | ambos | 7 | a-validar |

### Pagamentos e cobrança

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Assinaturas e cobrança recorrente](../04-Catalogo/Itens/Assinaturas%20e%20cobran%C3%A7a%20recorrente.md) | R$ 1.800 | ambos | 20 | a-validar |
| [Créditos ou carteira digital](../04-Catalogo/Itens/Cr%C3%A9ditos%20ou%20carteira%20digital.md) | R$ 1.500 | ambos | 17 | a-validar |
| [Cupons e período de teste](../04-Catalogo/Itens/Cupons%20e%20per%C3%ADodo%20de%20teste.md) | R$ 500 | ambos | 6 | a-validar |
| [Divisão de pagamento entre vendedores (split)](../04-Catalogo/Itens/Divis%C3%A3o%20de%20pagamento%20entre%20vendedores%20%28split%29.md) | a partir de R$ 2.500 | ambos | 28 | a-validar |
| [Emissão de cobranças para clientes](../04-Catalogo/Itens/Emiss%C3%A3o%20de%20cobran%C3%A7as%20para%20clientes.md) | R$ 900 | ambos | 10 | a-validar |
| [Emissão de nota fiscal de serviço (NFS-e)](../04-Catalogo/Itens/Emiss%C3%A3o%20de%20nota%20fiscal%20de%20servi%C3%A7o%20%28NFS-e%29.md) | a partir de R$ 1.200 | ambos | 14 | a-validar |
| [Pagamento único (Pix, cartão, boleto)](../04-Catalogo/Itens/Pagamento%20%C3%BAnico%20%28Pix%2C%20cart%C3%A3o%2C%20boleto%29.md) | R$ 900 | ambos | 10 | a-validar |
| [Planos e limites por plano](../04-Catalogo/Itens/Planos%20e%20limites%20por%20plano.md) | R$ 900 | ambos | 10 | a-validar |

### Módulos de negócio

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Agendamento de horários](../04-Catalogo/Itens/Agendamento%20de%20hor%C3%A1rios.md) | R$ 1.200 | ambos | 14 | a-validar |
| [Avaliações entre usuários](../04-Catalogo/Itens/Avalia%C3%A7%C3%B5es%20entre%20usu%C3%A1rios.md) | R$ 500 | ambos | 6 | a-validar |
| [Conexão entre oferta e demanda](../04-Catalogo/Itens/Conex%C3%A3o%20entre%20oferta%20e%20demanda.md) | a partir de R$ 3.000 | ambos | 34 | a-validar |
| [Contratos com assinatura eletrônica](../04-Catalogo/Itens/Contratos%20com%20assinatura%20eletr%C3%B4nica.md) | R$ 900 | ambos | 10 | a-validar |
| [Controle de estoque](../04-Catalogo/Itens/Controle%20de%20estoque.md) | R$ 1.200 | ambos | 14 | a-validar |
| [Escalas e gestão de equipe](../04-Catalogo/Itens/Escalas%20e%20gest%C3%A3o%20de%20equipe.md) | R$ 1.500 | ambos | 17 | a-validar |
| [Financeiro (contas a pagar e a receber)](../04-Catalogo/Itens/Financeiro%20%28contas%20a%20pagar%20e%20a%20receber%29.md) | R$ 1.500 | ambos | 17 | a-validar |
| [Funil de vendas (CRM simples)](../04-Catalogo/Itens/Funil%20de%20vendas%20%28CRM%20simples%29.md) | R$ 1.200 | ambos | 14 | a-validar |
| [Gamificação (pontos, medalhas, ranking)](../04-Catalogo/Itens/Gamifica%C3%A7%C3%A3o%20%28pontos%2C%20medalhas%2C%20ranking%29.md) | R$ 1.500 | ambos | 17 | a-validar |
| [Mapas e geolocalização](../04-Catalogo/Itens/Mapas%20e%20geolocaliza%C3%A7%C3%A3o.md) | R$ 800 | ambos | 9 | a-validar |
| [Ordens de serviço](../04-Catalogo/Itens/Ordens%20de%20servi%C3%A7o.md) | R$ 1.200 | ambos | 14 | a-validar |
| [Orçamentos e propostas](../04-Catalogo/Itens/Or%C3%A7amentos%20e%20propostas.md) | R$ 900 | ambos | 10 | a-validar |
| [Pedidos e vendas](../04-Catalogo/Itens/Pedidos%20e%20vendas.md) | R$ 1.200 | ambos | 14 | a-validar |
| [Reservas de espaços ou recursos](../04-Catalogo/Itens/Reservas%20de%20espa%C3%A7os%20ou%20recursos.md) | R$ 1.200 | ambos | 14 | a-validar |

### Área de membros e cursos

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Aulas em vídeo por módulos](../04-Catalogo/Itens/Aulas%20em%20v%C3%ADdeo%20por%20m%C3%B3dulos.md) | R$ 1.200 | ambos | 14 | a-validar |
| [Certificados automáticos](../04-Catalogo/Itens/Certificados%20autom%C3%A1ticos.md) | R$ 600 | ambos | 7 | a-validar |
| [Comunidade ou fórum](../04-Catalogo/Itens/Comunidade%20ou%20f%C3%B3rum.md) | R$ 1.500 | ambos | 17 | a-validar |
| [Conteúdo exclusivo por plano](../04-Catalogo/Itens/Conte%C3%BAdo%20exclusivo%20por%20plano.md) | R$ 500 | ambos | 6 | a-validar |
| [Progresso do aluno](../04-Catalogo/Itens/Progresso%20do%20aluno.md) | R$ 500 | ambos | 6 | a-validar |
| [Questionários e provas](../04-Catalogo/Itens/Question%C3%A1rios%20e%20provas.md) | R$ 700 | ambos | 8 | a-validar |
| [Turmas e professores](../04-Catalogo/Itens/Turmas%20e%20professores.md) | R$ 900 | ambos | 10 | a-validar |

### Inteligência artificial

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Assistente com IA (chat)](../04-Catalogo/Itens/Assistente%20com%20IA%20%28chat%29.md) | a partir de R$ 1.500 | ambos | 17 | a-validar |
| [Classificação e resumo automático](../04-Catalogo/Itens/Classifica%C3%A7%C3%A3o%20e%20resumo%20autom%C3%A1tico.md) | R$ 900 | ambos | 10 | a-validar |
| [Consumo da IA](../04-Catalogo/Itens/Consumo%20da%20IA.md) | Repasse (conforme uso) | ambos | 0 | a-validar |
| [Geração de textos ou imagens](../04-Catalogo/Itens/Gera%C3%A7%C3%A3o%20de%20textos%20ou%20imagens.md) | R$ 900 | ambos | 10 | a-validar |
| [Leitura de documentos e extração de dados](../04-Catalogo/Itens/Leitura%20de%20documentos%20e%20extra%C3%A7%C3%A3o%20de%20dados.md) | R$ 1.200 | ambos | 14 | a-validar |
| [Respostas com base nos documentos da empresa](../04-Catalogo/Itens/Respostas%20com%20base%20nos%20documentos%20da%20empresa.md) | a partir de R$ 2.000 | ambos | 22 | a-validar |

### Infraestrutura e plataforma

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [API para outros sistemas](../04-Catalogo/Itens/API%20para%20outros%20sistemas.md) | a partir de R$ 1.500 | ambos | 17 | a-validar |
| [Ambiente de testes (homologação)](../04-Catalogo/Itens/Ambiente%20de%20testes%20%28homologa%C3%A7%C3%A3o%29.md) | R$ 400 | ambos | 4.5 | a-validar |
| [Aplicativo instalável (PWA)](../04-Catalogo/Itens/Aplicativo%20instal%C3%A1vel%20%28PWA%29.md) | R$ 500 | ambos | 6 | a-validar |
| [App nas lojas (Android e iOS)](../04-Catalogo/Itens/App%20nas%20lojas%20%28Android%20e%20iOS%29.md) | a partir de R$ 4.000 | ambos | 45 | a-validar |
| [Backup automático diário](../04-Catalogo/Itens/Backup%20autom%C3%A1tico%20di%C3%A1rio.md) | R$ 50/mês | ambos | 0.5 | a-validar |
| [Monitoramento de disponibilidade e erros](../04-Catalogo/Itens/Monitoramento%20de%20disponibilidade%20e%20erros.md) | R$ 50/mês | ambos | 0.5 | a-validar |
| [Preparação para alto volume](../04-Catalogo/Itens/Prepara%C3%A7%C3%A3o%20para%20alto%20volume.md) | a partir de R$ 1.500 | ambos | 17 | a-validar |
| [Revisão de segurança](../04-Catalogo/Itens/Revis%C3%A3o%20de%20seguran%C3%A7a.md) | R$ 900 | ambos | 10 | a-validar |
| [Webhooks](../04-Catalogo/Itens/Webhooks.md) | R$ 600 | ambos | 7 | a-validar |

### Integrações

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [API de IA (OpenAI, Anthropic, Google)](../04-Catalogo/Itens/API%20de%20IA%20%28OpenAI%2C%20Anthropic%2C%20Google%29.md) | R$ 990 | ambos | 11 | a-validar |
| [Assinatura eletrônica (Clicksign, D4Sign)](../04-Catalogo/Itens/Assinatura%20eletr%C3%B4nica%20%28Clicksign%2C%20D4Sign%29.md) | R$ 990 | ambos | 11 | a-validar |
| [CRM (RD Station, HubSpot, Pipedrive)](../04-Catalogo/Itens/CRM%20%28RD%20Station%2C%20HubSpot%2C%20Pipedrive%29.md) | R$ 990 | ambos | 11 | a-validar |
| [E-mail marketing (Mailchimp, Brevo)](../04-Catalogo/Itens/E-mail%20marketing%20%28Mailchimp%2C%20Brevo%29.md) | R$ 990 | ambos | 11 | a-validar |
| [ERP ou sistema de gestão (Bling, Tiny, Omie, Conta Azul)](../04-Catalogo/Itens/ERP%20ou%20sistema%20de%20gest%C3%A3o%20%28Bling%2C%20Tiny%2C%20Omie%2C%20Conta%20Azul%29.md) | a partir de R$ 1.500 | ambos | 17 | a-validar |
| [Emissor de nota fiscal (NFE.io, Focus NFe)](../04-Catalogo/Itens/Emissor%20de%20nota%20fiscal%20%28NFE.io%2C%20Focus%20NFe%29.md) | R$ 1.200 | ambos | 14 | a-validar |
| [Frete e rastreio (Correios, Melhor Envio)](../04-Catalogo/Itens/Frete%20e%20rastreio%20%28Correios%2C%20Melhor%20Envio%29.md) | R$ 990 | ambos | 11 | a-validar |
| [Google Agenda ou Outlook](../04-Catalogo/Itens/Google%20Agenda%20ou%20Outlook.md) | R$ 990 | ambos | 11 | a-validar |
| [Google Sheets ou Excel on-line](../04-Catalogo/Itens/Google%20Sheets%20ou%20Excel%20on-line.md) | R$ 990 | ambos | 11 | a-validar |
| [Integração padrão (API documentada, um sentido)](../04-Catalogo/Itens/Integra%C3%A7%C3%A3o%20padr%C3%A3o%20%28API%20documentada%2C%20um%20sentido%29.md) | R$ 990 | ambos | 11 | ativo |
| [Meio de pagamento (Mercado Pago, Stripe, Asaas)](../04-Catalogo/Itens/Meio%20de%20pagamento%20%28Mercado%20Pago%2C%20Stripe%2C%20Asaas%29.md) | R$ 990 | ambos | 11 | a-validar |
| [Sincronização nos dois sentidos](../04-Catalogo/Itens/Sincroniza%C3%A7%C3%A3o%20nos%20dois%20sentidos.md) | R$ 500 | ambos | 6 | a-validar |
| [Sistema sem API documentada](../04-Catalogo/Itens/Sistema%20sem%20API%20documentada.md) | a partir de R$ 2.990 | ambos | 34 | a-validar |
| [WhatsApp API oficial](../04-Catalogo/Itens/WhatsApp%20API%20oficial.md) | a partir de R$ 1.200 | ambos | 14 | a-validar |

### Automações

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Fluxo adicional no mesmo projeto](../04-Catalogo/Itens/Fluxo%20adicional%20no%20mesmo%20projeto.md) | R$ 590 | ambos | 7 | a-validar |
| [Fluxo com condições e várias etapas](../04-Catalogo/Itens/Fluxo%20com%20condi%C3%A7%C3%B5es%20e%20v%C3%A1rias%20etapas.md) | a partir de R$ 1.490 | ambos | 17 | a-validar |
| [Fluxo simples (1 gatilho, até 3 ações)](../04-Catalogo/Itens/Fluxo%20simples%20%281%20gatilho%2C%20at%C3%A9%203%20a%C3%A7%C3%B5es%29.md) | R$ 890 | ambos | 10 | ativo |
| [Follow-up automático](../04-Catalogo/Itens/Follow-up%20autom%C3%A1tico.md) | R$ 890 | ambos | 10 | a-validar |
| [Lembretes e confirmação de agendamentos](../04-Catalogo/Itens/Lembretes%20e%20confirma%C3%A7%C3%A3o%20de%20agendamentos.md) | R$ 890 | ambos | 10 | a-validar |

### Suporte e operação

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [1 mês de suporte gratuito](../04-Catalogo/Itens/1%20m%C3%AAs%20de%20suporte%20gratuito.md) | Incluso na base | ambos |  | ativo |
| [Hora técnica avulsa](../04-Catalogo/Itens/Hora%20t%C3%A9cnica%20avulsa.md) | R$ 120 / hora | ambos | 1 | a-validar |
| [Manual de uso](../04-Catalogo/Itens/Manual%20de%20uso.md) | R$ 400 | ambos | 4.5 | a-validar |
| [Treinamento da equipe](../04-Catalogo/Itens/Treinamento%20da%20equipe.md) | R$ 150 / sessão de 1 h | ambos | 1.5 | a-validar |

### Projeto e entrega

| Item | Preço | Formato | Horas | Status |
|---|---|---|---|---|
| [Complexidade alta](../04-Catalogo/Itens/Complexidade%20alta.md) | +20% sobre o projeto | ambos |  | a-validar |
| [Desconto de combinação](../04-Catalogo/Itens/Desconto%20de%20combina%C3%A7%C3%A3o.md) | −10% sobre a combinação | ambos |  | ativo |
| [Documentação técnica](../04-Catalogo/Itens/Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md) | R$ 400 | ambos | 4.5 | a-validar |
| [Reunião extra de alinhamento](../04-Catalogo/Itens/Reuni%C3%A3o%20extra%20de%20alinhamento.md) | R$ 100 / reunião | ambos | 1 | a-validar |
| [Transferência do código-fonte](../04-Catalogo/Itens/Transfer%C3%AAncia%20do%20c%C3%B3digo-fonte.md) | Sob consulta | ambos |  | a-validar |
| [Urgência (prazo reduzido pela metade)](../04-Catalogo/Itens/Urg%C3%AAncia%20%28prazo%20reduzido%20pela%20metade%29.md) | +30% sobre o projeto | ambos |  | a-validar |
<!-- catalogo:fim -->

Related: [Como precificar](../04-Catalogo/Como%20precificar.md) · [Regras de preço](../04-Catalogo/Regras%20de%20pre%C3%A7o.md) · [Fluxo comercial](../02-Fluxos/Fluxo%20comercial.md)
