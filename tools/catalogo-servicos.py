"""Gera o catálogo "Serviços e valores" de solucoes/index.html (cards por categoria).
Fonte única dos textos do catálogo; os preços precisam bater com js/data.js (configuratorData).
Uso: python3 tools/catalogo-servicos.py  (reescreve o bloco entre os marcadores CATALOGO)."""
import html, re, pathlib

M = '../monte-sua-solucao.html?services='
CATS = [
  ('diagnostico', 'Diagnóstico', 'Primeira conversa para entender o negócio e indicar o melhor caminho.', [
    (None, [('Diagnóstico inicial', 'Gratuito', 'Reunião para entender seu negócio, o problema e o objetivo. Saímos com uma recomendação clara do que construir primeiro.', ['Conversa com a equipe técnica', 'Indicação de solução e formato', 'Sem compromisso'], M + 'diagnostico')]) ]),
  ('identidade', 'Identidade (design)', 'A cara da sua marca: o que aparece no site, nas redes e no material da empresa.', [
    (None, [('Identidade visual essencial', 'R$ 500', 'Criação da identidade visual da marca, pronta para usar no digital e no impresso.', ['Logo e versões principais', 'Paleta de cores e tipografia', 'Elementos básicos de aplicação'], M + 'identidade-essencial')]) ]),
  ('sites', 'Sites e páginas', 'Presença on-line para apresentar, convencer e receber contatos. Cada tipo tem modelo pronto ou sob medida.', [
    ('Landing Page', [
      ('Modelo pronto', 'R$ 600', 'Página única com estrutura já testada. Você envia identidade visual, textos e imagens; a estrutura do modelo permanece igual.', ['Pagamento único ou plano mensal', 'Entrega em 5 a 8 dias úteis'], M + 'landing-page&model=modelos-prontos'),
      ('Sob medida', 'A partir de R$ 700', 'Estrutura, seções e experiência feitas para a sua oferta e o seu público.', ['Seções e componentes à sua escolha', 'Escopo confirmado na proposta'], M + 'landing-page&model=sob-medida')]),
    ('Portfólio digital', [
      ('Modelo pronto', 'R$ 500', 'Portfólio com estrutura fixa para mostrar trabalhos, serviços e resultados com a sua identidade.', ['Pagamento único ou plano mensal', 'Entrega em 5 a 7 dias úteis'], M + 'portfolio&model=modelos-prontos'),
      ('Sob medida', 'A partir de R$ 800', 'Galerias, apresentação e experiência personalizadas para o seu trabalho.', ['Estrutura desenhada para você', 'Escopo confirmado na proposta'], M + 'portfolio&model=sob-medida')]),
    ('Site institucional', [
      ('Modelo pronto', 'R$ 700', 'Site com estrutura predefinida de até 4 páginas para apresentar empresa, serviços e diferenciais.', ['Até 4 páginas no projeto base', 'Entrega em 7 a 12 dias úteis'], M + 'site-institucional&model=modelos-prontos'),
      ('Sob medida', 'A partir de R$ 900', 'Até 4 páginas iniciais com estrutura e design personalizados.', ['Páginas e seções sob medida', 'Escopo confirmado na proposta'], M + 'site-institucional&model=sob-medida')]) ]),
  ('loja', 'Loja virtual', 'Venda on-line com catálogo, carrinho e pagamento.', [
    (None, [('E-commerce / loja virtual', 'A partir de R$ 6.000', 'Loja completa para vender pela internet, com gestão dos pedidos.', ['Produtos, categorias e carrinho', 'Checkout e meios de pagamento', 'Gestão básica de pedidos'], M + 'loja-virtual')]) ]),
  ('sistemas', 'Sistemas e plataformas', 'Software sob medida: para organizar a operação interna ou para atender clientes e parceiros.', [
    (None, [
      ('Sistema de gestão', 'A partir de R$ 2.990', 'Software interno, usado pela sua equipe, que substitui planilhas e controles soltos.', ['Cadastros, pedidos, estoque, agenda ou financeiro', 'Permissões por função e aprovações', 'Relatórios e indicadores'], M + 'sistema'),
      ('Plataforma web personalizada', 'A partir de R$ 4.990', 'Ambiente on-line para pessoas de fora da empresa: clientes, parceiros ou membros, cada um com seu acesso.', ['Login, perfis e área restrita', 'Portais de clientes, áreas de membros e cursos', 'Painel administrativo'], M + 'plataforma')]) ]),
  ('produto', 'Produto digital', 'Para transformar uma ideia em produto: validar primeiro e crescer depois.', [
    (None, [
      ('MVP', 'A partir de R$ 3.990', 'Primeira versão funcional do produto, com o fluxo principal, para testar a ideia com usuários reais antes de investir mais.', ['Fluxo principal e login', 'Painel básico de gestão', 'Métricas para validar'], M + 'mvp'),
      ('Produto digital completo (SaaS)', 'A partir de R$ 4.990', 'Versão completa e escalável, pronta para vender por assinatura.', ['Planos e cobrança recorrente', 'Painel de gestão e usuários', 'Estrutura para crescer'], M + 'mvp')]) ]),
  ('automacoes', 'Automações e integrações', 'Menos tarefa manual e ferramentas conversando entre si.', [
    (None, [
      ('Automação de processos', 'A partir de R$ 990', 'Rotinas que rodam sozinhas: atendimento, leads, vendas, notificações e processos internos. Serviço independente, sem site.', ['Mapeamento da rotina', 'Fluxos automáticos e alertas'], M + 'automacao'),
      ('Integrações de sistemas e pagamentos', 'A partir de R$ 990', 'Conexão entre APIs, meios de pagamento, WhatsApp e os sistemas que você já usa.', ['APIs e webhooks', 'Pagamentos e WhatsApp'], M + 'integracao')]) ]),
  ('suporte', 'Suporte', 'Todo projeto inclui 1 mês de suporte gratuito. Depois, você escolhe como continuar.', [
    (None, [
      ('Suporte técnico essencial', 'A partir de R$ 150', 'Sob demanda, sem mensalidade: você chama quando precisar de uma correção ou ajuste e paga por solicitação.', ['Sem mensalidade', 'Valor por solicitação'], M + 'manutencao'),
      ('Suporte técnico contínuo', 'R$ 150/mês', 'Mensalidade fixa com acompanhamento: manutenção, correções e pequenos ajustes sempre que precisar.', ['Valor fixo mensal', 'Manutenção e correções incluídas'], M + 'suporte')]) ]),
]

def e(s): return html.escape(s, quote=True)

def render():
    out = ['<div class="svc-cats" data-svc>']
    for n, (cid, name, intro, groups) in enumerate(CATS, 1):
        out.append(f'<article class="svc-cat{" svc-cat--wide" if cid == "sites" else ""}" id="servico-{cid}">')
        out.append(f'<header class="svc-cat-head"><span class="svc-cat-num">{n:02d}</span><h3>{e(name)}</h3><p>{e(intro)}</p></header>')
        out.append('<div class="svc-groups">')
        for g, items in groups:
            out.append('<div class="svc-group">' + (f'<h4>{e(g)}</h4>' if g else ''))
            for k, (title, price, desc, bullets, link) in enumerate(items):
                pid = f'svc-{cid}-{re.sub(r"[^a-z0-9]+", "-", (g or "").lower() + "-" + title.lower()).strip("-")}'
                pid = pid.encode('ascii', 'ignore').decode()
                label = f'{g} — {title}' if g else title
                out.append(f'<button type="button" class="svc-type" aria-expanded="false" aria-controls="{pid}"><span class="svc-type-name">{e(title)}</span><span class="svc-type-price">{e(price)}</span><span class="svc-type-ico" aria-hidden="true"></span></button>')
                lis = ''.join(f'<li>{e(b)}</li>' for b in bullets)
                out.append(f'<div class="svc-panel" id="{pid}" role="region" aria-label="{e(label)}"><div class="svc-panel-in"><p>{e(desc)}</p><ul>{lis}</ul>'
                           f'<div class="svc-panel-foot"><strong>{e(price)}</strong><a class="btn btn-primary btn-sm" href="{e(link)}">Montar minha solução <span aria-hidden="true">↗</span></a></div></div></div>')
            out.append('</div>')
        out.append('</div></article>')
    out.append('<aside class="svc-cat svc-cat--consult" aria-labelledby="svc-consult-title"><header class="svc-cat-head"><span class="svc-cat-num">+</span><h3 id="svc-consult-title">Consultoria e planejamento digital</h3><p>Opcional em qualquer serviço. Antes de construir, mapeamos negócio, processos e prioridades.</p></header>'
               '<div class="svc-consult-prices"><div><strong>Sem custo</strong><span>fechando o projeto com a COGIT</span></div><div><strong>R$ 350</strong><span>se você desenvolver com outra empresa</span></div></div>'
               '<a class="btn btn-sm svc-consult-btn" href="../monte-sua-solucao.html">Escolher no Monte sua solução <span aria-hidden="true">↗</span></a></aside>')
    out.append('</div>')
    return '\n'.join(out)

p = pathlib.Path(__file__).resolve().parent.parent / 'solucoes' / 'index.html'
s = p.read_text()
start, end = '<!-- CATALOGO:INICIO -->', '<!-- CATALOGO:FIM -->'
if start not in s:
    a = s.index('<div class="cmk-catalog">')
    b = s.index('<p class="si-price-note">', a)
    s = s[:a] + start + '\n' + end + s[b:]
a = s.index(start) + len(start); b = s.index(end)
s = s[:a] + '\n' + render() + '\n' + s[b:]
p.write_text(s)
print('catálogo gerado:', sum(len(i) for _, _, _, gs in CATS for _, i in gs), 'serviços')
