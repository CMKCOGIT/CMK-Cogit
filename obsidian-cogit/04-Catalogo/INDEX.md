---
title: Catálogo completo
tags: [indice, catalogo]
---
# Catálogo completo

Todas as variações e funcionalidades que podem entrar num orçamento, cada uma com o seu preço. Cada linha é uma nota em `Itens/`.

- [Catálogo.base](Cat%C3%A1logo.base): a mesma lista como tabela editável, com uma visão por serviço e a visão "A validar".
- [Como precificar](Como%20precificar.md): passo a passo de um orçamento.
- [Regras de preço](Regras%20de%20pre%C3%A7o.md): o que é incluso, tipos de preço, combinações, urgência e valor-hora.
- [Exemplos de orçamento](Exemplos%20de%20or%C3%A7amento.md): três orçamentos montados com o catálogo.

> [!NOTE] Valores sugeridos
> Os valores base dos serviços e das combinações são os do site (`status: ativo`). Os preços dos itens são **sugestões** iniciais (`status: a-validar`), coerentes com esses valores base. Os sócios validam item a item na visão "A validar".

Abaixo, gerado por `python3 _sistema/catalogo.py`:

<!-- catalogo:inicio -->
**228 itens** em 23 categorias · 224 ainda a validar.

## Serviços (valor base)

| Serviço | Base | Sob medida | Status |
|---|---|---|---|
| [Diagnóstico inicial](../03-Servicos/Diagn%C3%B3stico%20inicial.md) | Gratuito | — | ativo |
| [Consultoria e planejamento digital](../03-Servicos/Consultoria%20e%20planejamento%20digital.md) | R$ 350 | — | ativo |
| [Identidade visual essencial](../03-Servicos/Identidade%20visual%20essencial.md) | R$ 500 | — | ativo |
| [Landing Page](../03-Servicos/Landing%20Page.md) | R$ 600 | R$ 800 | ativo |
| [Portfólio digital](../03-Servicos/Portf%C3%B3lio%20digital.md) | R$ 500 | R$ 700 | ativo |
| [Site institucional](../03-Servicos/Site%20institucional.md) | R$ 700 | R$ 900 | ativo |
| [Loja virtual](../03-Servicos/Loja%20virtual.md) | a partir de R$ 6.000 | — | ativo |
| [Sistema de gestão](../03-Servicos/Sistema%20de%20gest%C3%A3o.md) | a partir de R$ 2.990 | — | ativo |
| [Plataforma web personalizada](../03-Servicos/Plataforma%20web%20personalizada.md) | a partir de R$ 4.990 | — | ativo |
| [MVP](../03-Servicos/MVP.md) | a partir de R$ 3.990 | — | ativo |
| [Produto digital completo (SaaS)](../03-Servicos/Produto%20digital%20completo%20%28SaaS%29.md) | a partir de R$ 4.990 | — | ativo |
| [Automação de processos](../03-Servicos/Automa%C3%A7%C3%A3o%20de%20processos.md) | a partir de R$ 890 | — | ativo |
| [Integrações de sistemas e pagamentos](../03-Servicos/Integra%C3%A7%C3%B5es%20de%20sistemas%20e%20pagamentos.md) | a partir de R$ 990 | — | ativo |
| [Suporte técnico essencial](../03-Servicos/Suporte%20t%C3%A9cnico%20essencial.md) | a partir de R$ 150 / solicitação | — | ativo |
| [Suporte técnico contínuo](../03-Servicos/Suporte%20t%C3%A9cnico%20cont%C3%ADnuo.md) | R$ 150/mês | — | ativo |

## Combinações

- [Conversão](Combos/Convers%C3%A3o.md): R$ 1.990 → R$ 1.790 (10% de desconto)
- [Operação Conectada](Combos/Opera%C3%A7%C3%A3o%20Conectada.md): R$ 3.980 → R$ 3.580 (10% de desconto)
- [Presença Essencial](Combos/Presen%C3%A7a%20Essencial.md): R$ 1.200 → R$ 1.080 (10% de desconto)

## Domínio, hospedagem e e-mail

- [Certificado de segurança (HTTPS)](Itens/Certificado%20de%20seguran%C3%A7a%20%28HTTPS%29.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Compra do domínio pela COGIT](Itens/Compra%20do%20dom%C3%ADnio%20pela%20COGIT.md): R$ 50 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Configuração de e-mail profissional](Itens/Configura%C3%A7%C3%A3o%20de%20e-mail%20profissional.md): R$ 150 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Domínio .com.br (Registro.br)](Itens/Dom%C3%ADnio%20.com.br%20%28Registro.br%29.md): Repasse ≈ R$ 40 / ano · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Domínio internacional (.com, .net, .io)](Itens/Dom%C3%ADnio%20internacional%20%28.com%2C%20.net%2C%20.io%29.md): Repasse ≈ R$ 90 / ano · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Hospedagem gerenciada pela COGIT](Itens/Hospedagem%20gerenciada%20pela%20COGIT.md): R$ 30/mês · landing-page, portfolio, site-institucional, loja-virtual
- [Licenças de e-mail profissional](Itens/Licen%C3%A7as%20de%20e-mail%20profissional.md): Repasse ≈ R$ 35 / usuário/mês · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Migração de site existente](Itens/Migra%C3%A7%C3%A3o%20de%20site%20existente.md): R$ 300 · landing-page, portfolio, site-institucional, loja-virtual
- [Publicação no domínio do cliente (DNS)](Itens/Publica%C3%A7%C3%A3o%20no%20dom%C3%ADnio%20do%20cliente%20%28DNS%29.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Redirecionamento de endereços antigos (301)](Itens/Redirecionamento%20de%20endere%C3%A7os%20antigos%20%28301%29.md): R$ 100 · landing-page, portfolio, site-institucional, loja-virtual
- [Servidor e banco de dados](Itens/Servidor%20e%20banco%20de%20dados.md): Repasse ≈ R$ 100 / mês · sistema, plataforma, mvp, saas, loja-virtual
- [Subdomínio adicional](Itens/Subdom%C3%ADnio%20adicional.md): R$ 50 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas

## SEO

- [Acompanhamento mensal de SEO](Itens/Acompanhamento%20mensal%20de%20SEO.md): R$ 250/mês · landing-page, portfolio, site-institucional, loja-virtual
- [Artigo de blog otimizado](Itens/Artigo%20de%20blog%20otimizado.md): R$ 180 / artigo · landing-page, portfolio, site-institucional
- [Dados estruturados (schema.org)](Itens/Dados%20estruturados%20%28schema.org%29.md): R$ 150 · landing-page, portfolio, site-institucional, loja-virtual
- [Google Search Console](Itens/Google%20Search%20Console.md): R$ 80 · landing-page, portfolio, site-institucional, loja-virtual
- [Otimização de SEO por página](Itens/Otimiza%C3%A7%C3%A3o%20de%20SEO%20por%20p%C3%A1gina.md): R$ 90 / página · landing-page, portfolio, site-institucional, loja-virtual
- [Perfil da Empresa no Google (Google Meu Negócio)](Itens/Perfil%20da%20Empresa%20no%20Google%20%28Google%20Meu%20Neg%C3%B3cio%29.md): R$ 180 · landing-page, portfolio, site-institucional, loja-virtual
- [Pesquisa de palavras-chave](Itens/Pesquisa%20de%20palavras-chave.md): R$ 300 · landing-page, portfolio, site-institucional, loja-virtual
- [Página por cidade ou região (SEO local)](Itens/P%C3%A1gina%20por%20cidade%20ou%20regi%C3%A3o%20%28SEO%20local%29.md): R$ 180 / página · landing-page, portfolio, site-institucional
- [SEO técnico básico](Itens/SEO%20t%C3%A9cnico%20b%C3%A1sico.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual

## Métricas e rastreamento

- [API de Conversões da Meta (servidor)](Itens/API%20de%20Convers%C3%B5es%20da%20Meta%20%28servidor%29.md): R$ 450 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Conversões do Google Ads](Itens/Convers%C3%B5es%20do%20Google%20Ads.md): R$ 100 · landing-page, portfolio, site-institucional, loja-virtual
- [Eventos de conversão](Itens/Eventos%20de%20convers%C3%A3o.md): R$ 40 / evento · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Google Analytics 4](Itens/Google%20Analytics%204.md): R$ 100 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Google Tag Manager](Itens/Google%20Tag%20Manager.md): R$ 120 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Mapa de calor e gravação de sessões](Itens/Mapa%20de%20calor%20e%20grava%C3%A7%C3%A3o%20de%20sess%C3%B5es.md): R$ 60 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Métricas de uso do produto](Itens/M%C3%A9tricas%20de%20uso%20do%20produto.md): R$ 500 · sistema, plataforma, mvp, saas
- [Padrão de UTMs para campanhas](Itens/Padr%C3%A3o%20de%20UTMs%20para%20campanhas.md): R$ 60 · landing-page, portfolio, site-institucional, loja-virtual
- [Painel de resultados de marketing (Looker Studio)](Itens/Painel%20de%20resultados%20de%20marketing%20%28Looker%20Studio%29.md): R$ 450 · landing-page, portfolio, site-institucional, loja-virtual
- [Pixel da Meta (Facebook e Instagram)](Itens/Pixel%20da%20Meta%20%28Facebook%20e%20Instagram%29.md): R$ 100 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas

## Privacidade e LGPD

- [Autorização de contato nos formulários](Itens/Autoriza%C3%A7%C3%A3o%20de%20contato%20nos%20formul%C3%A1rios.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual
- [Aviso e preferências de cookies](Itens/Aviso%20e%20prefer%C3%AAncias%20de%20cookies.md): R$ 150 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Exportação e exclusão de dados do usuário](Itens/Exporta%C3%A7%C3%A3o%20e%20exclus%C3%A3o%20de%20dados%20do%20usu%C3%A1rio.md): R$ 500 · sistema, plataforma, mvp, saas
- [Política de Privacidade e Termos de Uso](Itens/Pol%C3%ADtica%20de%20Privacidade%20e%20Termos%20de%20Uso.md): R$ 150 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas

## Conteúdo e textos

- [Cadastro de projetos no portfólio](Itens/Cadastro%20de%20projetos%20no%20portf%C3%B3lio.md): R$ 60 / lote de 5 projetos · portfolio
- [Imagens de banco gratuito](Itens/Imagens%20de%20banco%20gratuito.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual
- [Imagens de banco pago](Itens/Imagens%20de%20banco%20pago.md): Repasse ≈ R$ 30 / imagem · landing-page, portfolio, site-institucional, loja-virtual
- [Inserção do conteúdo enviado pelo cliente](Itens/Inser%C3%A7%C3%A3o%20do%20conte%C3%BAdo%20enviado%20pelo%20cliente.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual
- [Redação de textos por página](Itens/Reda%C3%A7%C3%A3o%20de%20textos%20por%20p%C3%A1gina.md): R$ 150 / página · portfolio, site-institucional, loja-virtual
- [Redação dos textos da landing page](Itens/Reda%C3%A7%C3%A3o%20dos%20textos%20da%20landing%20page.md): R$ 350 · landing-page
- [Revisão de textos enviados](Itens/Revis%C3%A3o%20de%20textos%20enviados.md): R$ 50 / página · landing-page, portfolio, site-institucional, loja-virtual
- [Tradução de textos](Itens/Tradu%C3%A7%C3%A3o%20de%20textos.md): R$ 60 / página · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Tratamento e recorte de imagens](Itens/Tratamento%20e%20recorte%20de%20imagens.md): R$ 80 / lote de 20 imagens · landing-page, portfolio, site-institucional, loja-virtual
- [Versão em outro idioma](Itens/Vers%C3%A3o%20em%20outro%20idioma.md): R$ 250 / idioma · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas

## Páginas e design

- [Animações e efeitos de rolagem](Itens/Anima%C3%A7%C3%B5es%20e%20efeitos%20de%20rolagem.md): R$ 300 · landing-page, portfolio, site-institucional
- [Layout responsivo](Itens/Layout%20responsivo.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Modo escuro](Itens/Modo%20escuro.md): R$ 250 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Protótipo visual antes do desenvolvimento](Itens/Prot%C3%B3tipo%20visual%20antes%20do%20desenvolvimento.md): R$ 150 / tela · landing-page, portfolio, site-institucional, sistema, plataforma, mvp, saas
- [Página extra](Itens/P%C3%A1gina%20extra.md): R$ 180 / página · portfolio, site-institucional, loja-virtual
- [Página simples (obrigado, política, 404)](Itens/P%C3%A1gina%20simples%20%28obrigado%2C%20pol%C3%ADtica%2C%20404%29.md): R$ 60 / página · landing-page, portfolio, site-institucional, loja-virtual
- [Revisão de acessibilidade (WCAG AA)](Itens/Revis%C3%A3o%20de%20acessibilidade%20%28WCAG%20AA%29.md): R$ 300 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Rodada extra de ajustes](Itens/Rodada%20extra%20de%20ajustes.md): R$ 100 / rodada · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, identidade-essencial
- [Seção extra](Itens/Se%C3%A7%C3%A3o%20extra.md): R$ 100 / seção · landing-page, portfolio, site-institucional
- [Teste A/B entre duas versões](Itens/Teste%20A-B%20entre%20duas%20vers%C3%B5es.md): R$ 300 · landing-page
- [Variação da landing page](Itens/Varia%C3%A7%C3%A3o%20da%20landing%20page.md): R$ 300 · landing-page
- [Ícones ou ilustrações personalizados](Itens/%C3%8Dcones%20ou%20ilustra%C3%A7%C3%B5es%20personalizados.md): R$ 250 / conjunto de até 8 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas

## Componentes de página

- [Agendamento on-line](Itens/Agendamento%20on-line.md): R$ 100 · landing-page, portfolio, site-institucional
- [Antes e depois](Itens/Antes%20e%20depois.md): R$ 150 · landing-page, portfolio, site-institucional
- [Banner de imagem](Itens/Banner%20de%20imagem.md): R$ 40 · landing-page, portfolio, site-institucional
- [Blog simples](Itens/Blog%20simples.md): R$ 300 · portfolio, site-institucional
- [Carrossel](Itens/Carrossel.md): R$ 100 · landing-page, portfolio, site-institucional
- [Cases](Itens/Cases.md): R$ 120 · landing-page, portfolio, site-institucional
- [Clientes e parceiros](Itens/Clientes%20e%20parceiros.md): R$ 50 · landing-page, portfolio, site-institucional
- [Como funciona](Itens/Como%20funciona.md): R$ 60 · landing-page, portfolio, site-institucional
- [Depoimentos](Itens/Depoimentos.md): R$ 60 · landing-page, portfolio, site-institucional
- [Equipe](Itens/Equipe.md): R$ 80 · landing-page, portfolio, site-institucional
- [Feed do Instagram](Itens/Feed%20do%20Instagram.md): R$ 150 · landing-page, portfolio, site-institucional
- [Formulário extra](Itens/Formul%C3%A1rio%20extra.md): R$ 100 · landing-page, portfolio, site-institucional
- [Galeria de imagens](Itens/Galeria%20de%20imagens.md): R$ 120 · landing-page, portfolio, site-institucional
- [Mapa e endereço](Itens/Mapa%20e%20endere%C3%A7o.md): R$ 50 · landing-page, portfolio, site-institucional
- [Materiais para download](Itens/Materiais%20para%20download.md): R$ 60 · landing-page, portfolio, site-institucional
- [Números e resultados](Itens/N%C3%BAmeros%20e%20resultados.md): R$ 60 · landing-page, portfolio, site-institucional
- [Perguntas frequentes](Itens/Perguntas%20frequentes.md): R$ 60 · landing-page, portfolio, site-institucional
- [Tabela de preços ou planos](Itens/Tabela%20de%20pre%C3%A7os%20ou%20planos.md): R$ 100 · landing-page, portfolio, site-institucional
- [Vídeo em destaque](Itens/V%C3%ADdeo%20em%20destaque.md): R$ 50 · landing-page, portfolio, site-institucional

## Formulários e captação

- [Botão de WhatsApp com mensagem pronta](Itens/Bot%C3%A3o%20de%20WhatsApp%20com%20mensagem%20pronta.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual
- [Chat on-line](Itens/Chat%20on-line.md): R$ 100 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Contatos enviados para planilha](Itens/Contatos%20enviados%20para%20planilha.md): R$ 150 · landing-page, portfolio, site-institucional, loja-virtual
- [E-mail automático para quem preencheu](Itens/E-mail%20autom%C3%A1tico%20para%20quem%20preencheu.md): R$ 120 · landing-page, portfolio, site-institucional, loja-virtual
- [Formulário com envio de arquivos](Itens/Formul%C3%A1rio%20com%20envio%20de%20arquivos.md): R$ 150 · landing-page, portfolio, site-institucional, loja-virtual
- [Formulário de contato](Itens/Formul%C3%A1rio%20de%20contato.md): Incluso · landing-page, portfolio, site-institucional
- [Formulário em etapas (quiz ou qualificação)](Itens/Formul%C3%A1rio%20em%20etapas%20%28quiz%20ou%20qualifica%C3%A7%C3%A3o%29.md): R$ 300 · landing-page, portfolio, site-institucional, loja-virtual
- [Inscrição em newsletter](Itens/Inscri%C3%A7%C3%A3o%20em%20newsletter.md): R$ 150 · landing-page, portfolio, site-institucional, loja-virtual
- [Pop-up de captura](Itens/Pop-up%20de%20captura.md): R$ 120 · landing-page, portfolio, site-institucional, loja-virtual
- [Proteção contra spam](Itens/Prote%C3%A7%C3%A3o%20contra%20spam.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual

## Loja virtual

- [Avaliações de produtos](Itens/Avalia%C3%A7%C3%B5es%20de%20produtos.md): R$ 450 · loja-virtual
- [Busca de produtos](Itens/Busca%20de%20produtos.md): Incluso · loja-virtual
- [Cadastro de produtos adicionais](Itens/Cadastro%20de%20produtos%20adicionais.md): R$ 150 / lote de 50 produtos · loja-virtual
- [Controle de estoque da loja](Itens/Controle%20de%20estoque%20da%20loja.md): R$ 600 · loja-virtual
- [Cupons de desconto](Itens/Cupons%20de%20desconto.md): R$ 350 · loja-virtual
- [Cálculo de frete (Correios, Melhor Envio)](Itens/C%C3%A1lculo%20de%20frete%20%28Correios%2C%20Melhor%20Envio%29.md): R$ 600 · loja-virtual
- [Emissão de nota fiscal na loja](Itens/Emiss%C3%A3o%20de%20nota%20fiscal%20na%20loja.md): a partir de R$ 1.200 · loja-virtual
- [Filtros avançados de produtos](Itens/Filtros%20avan%C3%A7ados%20de%20produtos.md): R$ 400 · loja-virtual
- [Importação de produtos por planilha](Itens/Importa%C3%A7%C3%A3o%20de%20produtos%20por%20planilha.md): R$ 400 · loja-virtual
- [Integração com marketplaces](Itens/Integra%C3%A7%C3%A3o%20com%20marketplaces.md): a partir de R$ 1.500 · loja-virtual
- [Lista de desejos](Itens/Lista%20de%20desejos.md): R$ 300 · loja-virtual
- [Marketplace com vários vendedores](Itens/Marketplace%20com%20v%C3%A1rios%20vendedores.md): a partir de R$ 4.000 · loja-virtual, plataforma
- [Meio de pagamento adicional](Itens/Meio%20de%20pagamento%20adicional.md): R$ 500 · loja-virtual
- [Pedido pelo WhatsApp](Itens/Pedido%20pelo%20WhatsApp.md): R$ 300 · loja-virtual
- [Programa de pontos ou cashback](Itens/Programa%20de%20pontos%20ou%20cashback.md): R$ 1.500 · loja-virtual
- [Recuperação de carrinho abandonado](Itens/Recupera%C3%A7%C3%A3o%20de%20carrinho%20abandonado.md): R$ 600 · loja-virtual
- [Tabela de preços por cliente (atacado)](Itens/Tabela%20de%20pre%C3%A7os%20por%20cliente%20%28atacado%29.md): R$ 1.200 · loja-virtual
- [Variações de produto (tamanho, cor)](Itens/Varia%C3%A7%C3%B5es%20de%20produto%20%28tamanho%2C%20cor%29.md): R$ 450 · loja-virtual
- [Venda por assinatura](Itens/Venda%20por%20assinatura.md): R$ 1.500 · loja-virtual
- [Área do cliente](Itens/%C3%81rea%20do%20cliente.md): R$ 700 · loja-virtual

## Acesso e usuários

- [Cadastro aberto com aprovação](Itens/Cadastro%20aberto%20com%20aprova%C3%A7%C3%A3o.md): R$ 350 · sistema, plataforma, mvp, saas
- [Convite de usuários e gestão de equipe](Itens/Convite%20de%20usu%C3%A1rios%20e%20gest%C3%A3o%20de%20equipe.md): R$ 450 · sistema, plataforma, mvp, saas
- [Histórico de alterações (auditoria)](Itens/Hist%C3%B3rico%20de%20altera%C3%A7%C3%B5es%20%28auditoria%29.md): R$ 600 · sistema, plataforma, mvp, saas
- [Login com Google ou Apple](Itens/Login%20com%20Google%20ou%20Apple.md): R$ 450 · sistema, plataforma, mvp, saas, loja-virtual
- [Login com e-mail e senha](Itens/Login%20com%20e-mail%20e%20senha.md): Incluso · sistema, plataforma, mvp, saas
- [Login corporativo (SSO)](Itens/Login%20corporativo%20%28SSO%29.md): a partir de R$ 1.500 · sistema, plataforma, mvp, saas
- [Multiempresa (várias contas isoladas)](Itens/Multiempresa%20%28v%C3%A1rias%20contas%20isoladas%29.md): a partir de R$ 2.500 · sistema, plataforma, mvp, saas
- [Perfis e permissões por função](Itens/Perfis%20e%20permiss%C3%B5es%20por%20fun%C3%A7%C3%A3o.md): R$ 800 · mvp
- [Verificação em duas etapas](Itens/Verifica%C3%A7%C3%A3o%20em%20duas%20etapas.md): R$ 500 · sistema, plataforma, mvp, saas

## Dados e cadastros

- [Busca e filtros avançados](Itens/Busca%20e%20filtros%20avan%C3%A7ados.md): R$ 400 · sistema, plataforma, mvp, saas
- [Cadastro com regras e relacionamentos (por entidade)](Itens/Cadastro%20com%20regras%20e%20relacionamentos%20%28por%20entidade%29.md): R$ 750 / entidade · sistema, plataforma, mvp, saas
- [Cadastro simples (por entidade)](Itens/Cadastro%20simples%20%28por%20entidade%29.md): R$ 350 / entidade · sistema, plataforma, mvp, saas
- [Campos personalizáveis pelo cliente](Itens/Campos%20personaliz%C3%A1veis%20pelo%20cliente.md): R$ 900 · sistema, plataforma, mvp, saas
- [Exportação em Excel ou CSV](Itens/Exporta%C3%A7%C3%A3o%20em%20Excel%20ou%20CSV.md): R$ 300 · sistema, plataforma, mvp, saas
- [Fluxo de aprovação](Itens/Fluxo%20de%20aprova%C3%A7%C3%A3o.md): R$ 900 · sistema, plataforma, mvp, saas
- [Geração de documentos em PDF](Itens/Gera%C3%A7%C3%A3o%20de%20documentos%20em%20PDF.md): R$ 600 · sistema, plataforma, mvp, saas
- [Importação de dados por planilha](Itens/Importa%C3%A7%C3%A3o%20de%20dados%20por%20planilha.md): R$ 500 · sistema, plataforma, mvp, saas
- [Migração de dados de outro sistema](Itens/Migra%C3%A7%C3%A3o%20de%20dados%20de%20outro%20sistema.md): a partir de R$ 800 · sistema, plataforma, mvp, saas
- [Quadro kanban](Itens/Quadro%20kanban.md): R$ 700 · sistema, plataforma, mvp, saas
- [Upload e armazenamento de arquivos](Itens/Upload%20e%20armazenamento%20de%20arquivos.md): R$ 450 · sistema, plataforma, mvp, saas
- [Visualização em calendário](Itens/Visualiza%C3%A7%C3%A3o%20em%20calend%C3%A1rio.md): R$ 700 · sistema, plataforma, mvp, saas

## Painéis e relatórios

- [Dashboard com indicadores e gráficos](Itens/Dashboard%20com%20indicadores%20e%20gr%C3%A1ficos.md): R$ 900 · sistema, plataforma, mvp, saas
- [Painel administrativo](Itens/Painel%20administrativo.md): Incluso · sistema, plataforma, mvp, saas
- [Relatório automático por e-mail](Itens/Relat%C3%B3rio%20autom%C3%A1tico%20por%20e-mail.md): R$ 500 · sistema, plataforma, mvp, saas
- [Relatório personalizado](Itens/Relat%C3%B3rio%20personalizado.md): R$ 400 / relatório · sistema, plataforma, mvp, saas

## Comunicação e notificações

- [Central de chamados (tickets)](Itens/Central%20de%20chamados%20%28tickets%29.md): R$ 1.200 · sistema, plataforma, mvp, saas
- [Central de notificações no sistema](Itens/Central%20de%20notifica%C3%A7%C3%B5es%20no%20sistema.md): R$ 500 · sistema, plataforma, mvp, saas
- [Chat entre usuários (tempo real)](Itens/Chat%20entre%20usu%C3%A1rios%20%28tempo%20real%29.md): a partir de R$ 1.800 · sistema, plataforma, mvp, saas
- [Comentários e menções](Itens/Coment%C3%A1rios%20e%20men%C3%A7%C3%B5es.md): R$ 500 · sistema, plataforma, mvp, saas
- [E-mails automáticos do sistema](Itens/E-mails%20autom%C3%A1ticos%20do%20sistema.md): R$ 400 · sistema, plataforma, mvp, saas, loja-virtual
- [E-mails com o layout da marca](Itens/E-mails%20com%20o%20layout%20da%20marca.md): R$ 300 · sistema, plataforma, mvp, saas, loja-virtual
- [Notificações por SMS](Itens/Notifica%C3%A7%C3%B5es%20por%20SMS.md): R$ 600 · sistema, plataforma, mvp, saas
- [Notificações por WhatsApp](Itens/Notifica%C3%A7%C3%B5es%20por%20WhatsApp.md): a partir de R$ 900 · sistema, plataforma, mvp, saas, loja-virtual
- [Notificações push](Itens/Notifica%C3%A7%C3%B5es%20push.md): R$ 600 · sistema, plataforma, mvp, saas

## Pagamentos e cobrança

- [Assinaturas e cobrança recorrente](Itens/Assinaturas%20e%20cobran%C3%A7a%20recorrente.md): R$ 1.800 · sistema, plataforma, mvp, saas
- [Créditos ou carteira digital](Itens/Cr%C3%A9ditos%20ou%20carteira%20digital.md): R$ 1.500 · sistema, plataforma, mvp, saas
- [Cupons e período de teste](Itens/Cupons%20e%20per%C3%ADodo%20de%20teste.md): R$ 500 · sistema, plataforma, mvp, saas
- [Divisão de pagamento entre vendedores (split)](Itens/Divis%C3%A3o%20de%20pagamento%20entre%20vendedores%20%28split%29.md): a partir de R$ 2.500 · sistema, plataforma, mvp, saas
- [Emissão de cobranças para clientes](Itens/Emiss%C3%A3o%20de%20cobran%C3%A7as%20para%20clientes.md): R$ 900 · sistema, plataforma, mvp, saas
- [Emissão de nota fiscal de serviço (NFS-e)](Itens/Emiss%C3%A3o%20de%20nota%20fiscal%20de%20servi%C3%A7o%20%28NFS-e%29.md): a partir de R$ 1.200 · sistema, plataforma, mvp, saas
- [Pagamento único (Pix, cartão, boleto)](Itens/Pagamento%20%C3%BAnico%20%28Pix%2C%20cart%C3%A3o%2C%20boleto%29.md): R$ 900 · sistema, plataforma, mvp, saas
- [Planos e limites por plano](Itens/Planos%20e%20limites%20por%20plano.md): R$ 900 · sistema, plataforma, mvp, saas

## Módulos de negócio

- [Agendamento de horários](Itens/Agendamento%20de%20hor%C3%A1rios.md): R$ 1.200 · sistema, plataforma, mvp, saas
- [Avaliações entre usuários](Itens/Avalia%C3%A7%C3%B5es%20entre%20usu%C3%A1rios.md): R$ 500 · sistema, plataforma, mvp, saas
- [Conexão entre oferta e demanda](Itens/Conex%C3%A3o%20entre%20oferta%20e%20demanda.md): a partir de R$ 3.000 · sistema, plataforma, mvp, saas
- [Contratos com assinatura eletrônica](Itens/Contratos%20com%20assinatura%20eletr%C3%B4nica.md): R$ 900 · sistema, plataforma, mvp, saas
- [Controle de estoque](Itens/Controle%20de%20estoque.md): R$ 1.200 · sistema, plataforma, mvp, saas
- [Escalas e gestão de equipe](Itens/Escalas%20e%20gest%C3%A3o%20de%20equipe.md): R$ 1.500 · sistema, plataforma, mvp, saas
- [Financeiro (contas a pagar e a receber)](Itens/Financeiro%20%28contas%20a%20pagar%20e%20a%20receber%29.md): R$ 1.500 · sistema, plataforma, mvp, saas
- [Funil de vendas (CRM simples)](Itens/Funil%20de%20vendas%20%28CRM%20simples%29.md): R$ 1.200 · sistema, plataforma, mvp, saas
- [Gamificação (pontos, medalhas, ranking)](Itens/Gamifica%C3%A7%C3%A3o%20%28pontos%2C%20medalhas%2C%20ranking%29.md): R$ 1.500 · sistema, plataforma, mvp, saas
- [Mapas e geolocalização](Itens/Mapas%20e%20geolocaliza%C3%A7%C3%A3o.md): R$ 800 · sistema, plataforma, mvp, saas
- [Ordens de serviço](Itens/Ordens%20de%20servi%C3%A7o.md): R$ 1.200 · sistema, plataforma, mvp, saas
- [Orçamentos e propostas](Itens/Or%C3%A7amentos%20e%20propostas.md): R$ 900 · sistema, plataforma, mvp, saas
- [Pedidos e vendas](Itens/Pedidos%20e%20vendas.md): R$ 1.200 · sistema, plataforma, mvp, saas
- [Reservas de espaços ou recursos](Itens/Reservas%20de%20espa%C3%A7os%20ou%20recursos.md): R$ 1.200 · sistema, plataforma, mvp, saas

## Área de membros e cursos

- [Aulas em vídeo por módulos](Itens/Aulas%20em%20v%C3%ADdeo%20por%20m%C3%B3dulos.md): R$ 1.200 · sistema, plataforma, mvp, saas
- [Certificados automáticos](Itens/Certificados%20autom%C3%A1ticos.md): R$ 600 · sistema, plataforma, mvp, saas
- [Comunidade ou fórum](Itens/Comunidade%20ou%20f%C3%B3rum.md): R$ 1.500 · sistema, plataforma, mvp, saas
- [Conteúdo exclusivo por plano](Itens/Conte%C3%BAdo%20exclusivo%20por%20plano.md): R$ 500 · sistema, plataforma, mvp, saas
- [Progresso do aluno](Itens/Progresso%20do%20aluno.md): R$ 500 · sistema, plataforma, mvp, saas
- [Questionários e provas](Itens/Question%C3%A1rios%20e%20provas.md): R$ 700 · sistema, plataforma, mvp, saas
- [Turmas e professores](Itens/Turmas%20e%20professores.md): R$ 900 · sistema, plataforma, mvp, saas

## Inteligência artificial

- [Assistente com IA (chat)](Itens/Assistente%20com%20IA%20%28chat%29.md): a partir de R$ 1.500 · sistema, plataforma, mvp, saas
- [Classificação e resumo automático](Itens/Classifica%C3%A7%C3%A3o%20e%20resumo%20autom%C3%A1tico.md): R$ 900 · sistema, plataforma, mvp, saas, automacao
- [Consumo da IA](Itens/Consumo%20da%20IA.md): Repasse (conforme uso) · sistema, plataforma, mvp, saas, automacao
- [Geração de textos ou imagens](Itens/Gera%C3%A7%C3%A3o%20de%20textos%20ou%20imagens.md): R$ 900 · sistema, plataforma, mvp, saas
- [Leitura de documentos e extração de dados](Itens/Leitura%20de%20documentos%20e%20extra%C3%A7%C3%A3o%20de%20dados.md): R$ 1.200 · sistema, plataforma, mvp, saas, automacao
- [Respostas com base nos documentos da empresa](Itens/Respostas%20com%20base%20nos%20documentos%20da%20empresa.md): a partir de R$ 2.000 · sistema, plataforma, mvp, saas

## Infraestrutura e plataforma

- [API para outros sistemas](Itens/API%20para%20outros%20sistemas.md): a partir de R$ 1.500 · sistema, plataforma, mvp, saas
- [Ambiente de testes (homologação)](Itens/Ambiente%20de%20testes%20%28homologa%C3%A7%C3%A3o%29.md): R$ 400 · sistema, plataforma, mvp, saas, loja-virtual
- [Aplicativo instalável (PWA)](Itens/Aplicativo%20instal%C3%A1vel%20%28PWA%29.md): R$ 500 · sistema, plataforma, mvp, saas, loja-virtual
- [App nas lojas (Android e iOS)](Itens/App%20nas%20lojas%20%28Android%20e%20iOS%29.md): a partir de R$ 4.000 · sistema, plataforma, mvp, saas
- [Backup automático diário](Itens/Backup%20autom%C3%A1tico%20di%C3%A1rio.md): R$ 50/mês · sistema, plataforma, mvp, saas, loja-virtual, suporte
- [Monitoramento de disponibilidade e erros](Itens/Monitoramento%20de%20disponibilidade%20e%20erros.md): R$ 50/mês · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, suporte
- [Preparação para alto volume](Itens/Prepara%C3%A7%C3%A3o%20para%20alto%20volume.md): a partir de R$ 1.500 · sistema, plataforma, mvp, saas, loja-virtual
- [Revisão de segurança](Itens/Revis%C3%A3o%20de%20seguran%C3%A7a.md): R$ 900 · sistema, plataforma, mvp, saas, loja-virtual
- [Webhooks](Itens/Webhooks.md): R$ 600 · sistema, plataforma, mvp, saas

## Integrações

- [API de IA (OpenAI, Anthropic, Google)](Itens/API%20de%20IA%20%28OpenAI%2C%20Anthropic%2C%20Google%29.md): R$ 990 · sistema, plataforma, mvp, saas, automacao, integracao
- [Assinatura eletrônica (Clicksign, D4Sign)](Itens/Assinatura%20eletr%C3%B4nica%20%28Clicksign%2C%20D4Sign%29.md): R$ 990 · sistema, plataforma, mvp, saas, integracao
- [CRM (RD Station, HubSpot, Pipedrive)](Itens/CRM%20%28RD%20Station%2C%20HubSpot%2C%20Pipedrive%29.md): R$ 990 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, automacao, integracao
- [E-mail marketing (Mailchimp, Brevo)](Itens/E-mail%20marketing%20%28Mailchimp%2C%20Brevo%29.md): R$ 990 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, automacao, integracao
- [ERP ou sistema de gestão (Bling, Tiny, Omie, Conta Azul)](Itens/ERP%20ou%20sistema%20de%20gest%C3%A3o%20%28Bling%2C%20Tiny%2C%20Omie%2C%20Conta%20Azul%29.md): a partir de R$ 1.500 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, integracao
- [Emissor de nota fiscal (NFE.io, Focus NFe)](Itens/Emissor%20de%20nota%20fiscal%20%28NFE.io%2C%20Focus%20NFe%29.md): R$ 1.200 · loja-virtual, sistema, plataforma, mvp, saas, integracao
- [Frete e rastreio (Correios, Melhor Envio)](Itens/Frete%20e%20rastreio%20%28Correios%2C%20Melhor%20Envio%29.md): R$ 990 · loja-virtual, sistema, plataforma, mvp, saas, integracao
- [Google Agenda ou Outlook](Itens/Google%20Agenda%20ou%20Outlook.md): R$ 990 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, automacao, integracao
- [Google Sheets ou Excel on-line](Itens/Google%20Sheets%20ou%20Excel%20on-line.md): R$ 990 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, automacao, integracao
- [Integração padrão (API documentada, um sentido)](Itens/Integra%C3%A7%C3%A3o%20padr%C3%A3o%20%28API%20documentada%2C%20um%20sentido%29.md): R$ 990 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, automacao
- [Meio de pagamento (Mercado Pago, Stripe, Asaas)](Itens/Meio%20de%20pagamento%20%28Mercado%20Pago%2C%20Stripe%2C%20Asaas%29.md): R$ 990 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, integracao
- [Sincronização nos dois sentidos](Itens/Sincroniza%C3%A7%C3%A3o%20nos%20dois%20sentidos.md): R$ 500 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, integracao
- [Sistema sem API documentada](Itens/Sistema%20sem%20API%20documentada.md): a partir de R$ 2.990 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, integracao
- [WhatsApp API oficial](Itens/WhatsApp%20API%20oficial.md): a partir de R$ 1.200 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, automacao, integracao

## Automações

- [Atendimento com IA no WhatsApp](Itens/Atendimento%20com%20IA%20no%20WhatsApp.md): a partir de R$ 2.490 · automacao
- [Captura e distribuição de leads](Itens/Captura%20e%20distribui%C3%A7%C3%A3o%20de%20leads.md): R$ 890 · automacao, landing-page, portfolio, site-institucional, loja-virtual
- [Chatbot de WhatsApp com menu](Itens/Chatbot%20de%20WhatsApp%20com%20menu.md): R$ 1.490 · automacao
- [Ferramenta de automação (Make, Zapier, n8n)](Itens/Ferramenta%20de%20automa%C3%A7%C3%A3o%20%28Make%2C%20Zapier%2C%20n8n%29.md): Repasse (conforme uso) · automacao
- [Fluxo adicional no mesmo projeto](Itens/Fluxo%20adicional%20no%20mesmo%20projeto.md): R$ 590 · automacao, landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Fluxo com condições e várias etapas](Itens/Fluxo%20com%20condi%C3%A7%C3%B5es%20e%20v%C3%A1rias%20etapas.md): a partir de R$ 1.490 · automacao, landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Fluxo simples (1 gatilho, até 3 ações)](Itens/Fluxo%20simples%20%281%20gatilho%2C%20at%C3%A9%203%20a%C3%A7%C3%B5es%29.md): R$ 890 · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Follow-up automático](Itens/Follow-up%20autom%C3%A1tico.md): R$ 890 · automacao, landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Geração automática de documentos](Itens/Gera%C3%A7%C3%A3o%20autom%C3%A1tica%20de%20documentos.md): R$ 890 · automacao
- [Lembretes e confirmação de agendamentos](Itens/Lembretes%20e%20confirma%C3%A7%C3%A3o%20de%20agendamentos.md): R$ 890 · automacao, sistema, plataforma, mvp, saas
- [Mapeamento da rotina](Itens/Mapeamento%20da%20rotina.md): Incluso · automacao
- [Relatório automático periódico](Itens/Relat%C3%B3rio%20autom%C3%A1tico%20peri%C3%B3dico.md): R$ 890 · automacao

## Identidade visual

- [Kit para redes sociais](Itens/Kit%20para%20redes%20sociais.md): R$ 300 · identidade-essencial
- [Logo, paleta e tipografia](Itens/Logo%2C%20paleta%20e%20tipografia.md): Incluso · identidade-essencial
- [Manual de marca simplificado](Itens/Manual%20de%20marca%20simplificado.md): R$ 300 · identidade-essencial
- [Mockups de aplicação](Itens/Mockups%20de%20aplica%C3%A7%C3%A3o.md): R$ 120 · identidade-essencial
- [Modelo de apresentação (slides)](Itens/Modelo%20de%20apresenta%C3%A7%C3%A3o%20%28slides%29.md): R$ 300 · identidade-essencial
- [Papelaria digital](Itens/Papelaria%20digital.md): R$ 200 · identidade-essencial
- [Rodada extra de conceito de logo](Itens/Rodada%20extra%20de%20conceito%20de%20logo.md): R$ 150 · identidade-essencial
- [Ícone do site e do app (favicon)](Itens/%C3%8Dcone%20do%20site%20e%20do%20app%20%28favicon%29.md): Incluso · identidade-essencial, landing-page, portfolio, site-institucional, loja-virtual

## Suporte e operação

- [1 mês de suporte gratuito](Itens/1%20m%C3%AAs%20de%20suporte%20gratuito.md): Incluso · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, identidade-essencial, automacao, integracao
- [Hora técnica avulsa](Itens/Hora%20t%C3%A9cnica%20avulsa.md): R$ 120 / hora · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, automacao, integracao, manutencao
- [Manual de uso](Itens/Manual%20de%20uso.md): R$ 400 · sistema, plataforma, mvp, saas, loja-virtual
- [Treinamento da equipe](Itens/Treinamento%20da%20equipe.md): R$ 150 / sessão de 1 h · sistema, plataforma, mvp, saas, loja-virtual, automacao

## Projeto e entrega

- [Complexidade alta](Itens/Complexidade%20alta.md): +20% sobre o projeto · sistema, plataforma, mvp, saas, loja-virtual, automacao, integracao
- [Desconto de combinação](Itens/Desconto%20de%20combina%C3%A7%C3%A3o.md): −10% sobre a combinação · identidade-essencial, landing-page, portfolio, site-institucional, automacao, sistema, integracao
- [Documentação técnica](Itens/Documenta%C3%A7%C3%A3o%20t%C3%A9cnica.md): R$ 400 · sistema, plataforma, mvp, saas, loja-virtual, integracao
- [Reunião extra de alinhamento](Itens/Reuni%C3%A3o%20extra%20de%20alinhamento.md): R$ 100 / reunião · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, identidade-essencial, automacao, integracao
- [Transferência do código-fonte](Itens/Transfer%C3%AAncia%20do%20c%C3%B3digo-fonte.md): Sob consulta · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas
- [Urgência (prazo reduzido pela metade)](Itens/Urg%C3%AAncia%20%28prazo%20reduzido%20pela%20metade%29.md): +30% sobre o projeto · landing-page, portfolio, site-institucional, loja-virtual, sistema, plataforma, mvp, saas, identidade-essencial, automacao, integracao
<!-- catalogo:fim -->

Related: [Serviços](../03-Servicos/INDEX.md) · [Como atualizar o catálogo](../00-Guia/Como%20atualizar%20o%20cat%C3%A1logo.md)
