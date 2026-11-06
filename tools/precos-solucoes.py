"""Gera os blocos "Investimento" das páginas de solução a partir de js/data.js (configuratorData).

Cada página tem um bloco entre <!-- PRECOS:<chave>:INICIO --> e <!-- PRECOS:<chave>:FIM -->.
Assim o preço mostrado numa página é sempre o mesmo do Monte sua solução e do catálogo.
Uso: python3 tools/precos-solucoes.py   (reescreve os blocos; --check só confere)
"""
import html, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = json.loads(subprocess.check_output(['node', '-e', (
    "const vm=require('vm'),fs=require('fs');const c={};vm.createContext(c);"
    "vm.runInContext(fs.readFileSync('js/data.js','utf8')+';this.__d={s:configuratorData.services,m:presenceModels,b:serviceBundles}',c);"
    "process.stdout.write(JSON.stringify(c.__d))")], cwd=ROOT))
SVC = {s['id']: s for s in DATA['s']}
PM = DATA['m']
M = '../monte-sua-solucao.html?services='


def brl(n):
    return 'R$ ' + f'{int(n):,}'.replace(',', '.')


def e(s):
    return html.escape(s, quote=True)


def pronto(sid):
    return {'label': 'Modelo pronto', 'price': brl(SVC[sid]['price']), 'note': 'pagamento único · ' + PM[sid]['prazo'],
            'href': f'{M}{sid}&model=modelos-prontos', 'cta': 'Configurar modelo pronto'}


def medida(sid):
    return {'label': 'Sob medida', 'price': 'A partir de ' + brl(SVC[sid]['customPrice']), 'note': 'estrutura e visual feitos para você',
            'href': f'{M}{sid}&model=sob-medida', 'cta': 'Configurar sob medida'}


def single(sid, title=None, label=None, price=None, note='valor inicial; escopo confirmado na proposta', href=None):
    s = SVC[sid]
    p = price or ('A partir de ' if s['priceType'] == 'from' else '') + brl(s['price'])
    return {'label': label or title or s['name'], 'price': p, 'note': note, 'href': href or M + sid, 'cta': 'Montar minha solução'}


EXTRAS = ('Precisa de automação ou integração? Elas se somam ao projeto: automação a partir de '
          + brl(SVC['automacao']['price']) + ' e integrações a partir de ' + brl(SVC['integracao']['price']) + '.')

# título, descrição e opções de cada item; cada página lista seus itens
ITEMS = {
    'landing-page': ('Landing Page', 'Página única para campanhas, ofertas e captação de contatos.', ['Até 5 seções no modelo pronto', 'Formulário e WhatsApp', 'SEO técnico inicial'], [pronto('landing-page'), medida('landing-page')]),
    'portfolio': ('Portfólio digital', 'Para mostrar trabalhos, serviços e resultados.', ['Galeria de projetos', 'Contato direto pelo WhatsApp', 'Layout para celular e computador'], [pronto('portfolio'), medida('portfolio')]),
    'site-institucional': ('Site institucional', 'Até 4 páginas para apresentar empresa, serviços e diferenciais.', ['Início, Sobre, Serviços e Contato', 'Formulário e WhatsApp', 'SEO técnico inicial e Analytics'], [pronto('site-institucional'), medida('site-institucional')]),
    'automacao': ('Automação de processos', 'Rotinas que rodam sozinhas: atendimento, leads, vendas, notificações e tarefas internas. Não inclui site.', ['Mapeamento da rotina', 'Fluxos automáticos, alertas e relatórios'], [single('automacao', label='Investimento')]),
    'integracao': ('Integrações de sistemas e pagamentos', 'Conexão entre APIs, meios de pagamento, WhatsApp e os sistemas que você já usa.', ['APIs e webhooks', 'Pagamentos e WhatsApp', 'Documentação da integração'], [single('integracao', label='Investimento')]),
    'sistema': ('Sistema de gestão', 'Software interno, usado pela sua equipe, que substitui planilhas e controles soltos.', ['Cadastros, pedidos, estoque, agenda ou financeiro', 'Permissões por função e aprovações', 'Relatórios e indicadores'], [single('sistema', label='Investimento')]),
    'plataforma': ('Plataforma web personalizada', 'Ambiente on-line para clientes, parceiros ou membros, cada um com seu acesso.', ['Login, perfis e área restrita', 'Portais de clientes, áreas de membros e cursos', 'Painel administrativo'], [single('plataforma', label='Investimento')]),
    'mvp': ('MVP', 'Primeira versão funcional, com o fluxo principal, para testar a ideia com usuários reais antes de investir mais.', ['Fluxo principal e login', 'Painel básico de gestão', 'Métricas para validar'], [single('mvp', label='Investimento')]),
    'saas': ('Produto digital completo (SaaS)', 'Versão completa e escalável, pronta para vender por assinatura.', ['Planos de assinatura e cobrança recorrente', 'Painel de gestão e usuários', 'Arquitetura para crescer'], [single('mvp', label='Investimento', price='A partir de ' + brl(SVC['plataforma']['price']))]),
}

PAGES = {
    'solucoes/sites-e-landing-pages.html': ('presenca', 'Investimento', 'Cada tipo, em dois formatos.', 'Modelo pronto: estrutura já testada, com a sua marca. Sob medida: estrutura e visual desenhados para o seu negócio.', ['landing-page', 'portfolio', 'site-institucional'], EXTRAS),
    'solucoes/landing-pages.html': ('landing', 'Investimento', 'Landing Page em dois formatos.', 'Escolha entre a estrutura pronta e testada ou um projeto desenhado para a sua oferta.', ['landing-page'], EXTRAS),
    'solucoes/sites-institucionais.html': ('site', 'Investimento', 'Site institucional em dois formatos.', 'Escolha entre a estrutura pronta e testada ou um projeto desenhado para a sua empresa.', ['site-institucional'], EXTRAS),
    'solucoes/automacoes-e-integracoes.html': ('automacoes', 'Investimento', 'Um valor de partida para cada serviço.', 'O valor final depende de quantas rotinas e sistemas entram no projeto e é confirmado na proposta.', ['automacao', 'integracao'], None),
    'solucoes/sistemas-personalizados.html': ('sistemas', 'Investimento', 'Sistema interno ou plataforma para quem está fora.', 'Sistema de gestão é usado pela sua equipe. Plataforma web é usada por clientes, parceiros ou membros.', ['sistema', 'plataforma'], None),
    'solucoes/plataformas-e-outras-solucoes.html': ('plataformas', 'Investimento', 'Plataforma para quem está fora, sistema para a equipe.', 'Plataforma web é usada por clientes, parceiros ou membros. Sistema de gestão é usado pela sua equipe.', ['plataforma', 'sistema'], None),
    'solucoes/saas-e-produtos-digitais.html': ('produto', 'Investimento', 'Validar primeiro, crescer depois.', 'Comece pelo MVP para testar a ideia. O produto completo vem quando a ideia estiver validada.', ['mvp', 'saas'], None),
}


def render(key, label, title, lead, ids, extras):
    out = [f'<section class="tone-grey section price-section" id="investimento" aria-labelledby="precos-{key}-titulo">',
           '  <div class="container">',
           f'    <div class="section-header reveal"><span class="section-label">{e(label.upper())}</span>'
           f'<h2 id="precos-{key}-titulo">{e(title)}</h2><p class="text-body-lg">{e(lead)}</p></div>',
           f'    <div class="price-set price-set--{len(ids)}">']
    for sid in ids:
        name, desc, bullets, opts = ITEMS[sid]
        lis = ''.join(f'<li>{e(b)}</li>' for b in bullets)
        rows = ''.join(
            f'<div class="price-row"><div class="price-row-top"><span>{e(o["label"])}</span><strong>{e(o["price"])}</strong></div>'
            f'<small>{e(o["note"])}</small><a class="btn {"btn-primary" if i == len(opts) - 1 else "btn-secondary-dark"} btn-sm" href="{e(o["href"])}">{e(o["cta"])} <span aria-hidden="true">↗</span></a></div>'
            for i, o in enumerate(opts))
        out.append(f'      <article class="price-opt reveal"><h3>{e(name)}</h3><p>{e(desc)}</p><ul>{lis}</ul><div class="price-rows">{rows}</div></article>')
    out.append('    </div>')
    if extras:
        out.append(f'    <p class="price-extras">{e(extras)}</p>')
    out.append('    <p class="price-foot">Valores iniciais de referência. Escopo, prazo e investimento final são confirmados na proposta antes do desenvolvimento.</p>')
    out += ['  </div>', '</section>']
    return '\n'.join('    ' + l for l in out)


def combos():
    out = ['<div class="cmk-plan-grid combo-grid">']
    for bd in DATA['b']:
        base = 0; frm = False
        for sid in bd['services']:
            sv = SVC[sid]; base += sv['price']; frm = frm or (sv['priceType'] == 'from' and not sv.get('isPresencaDigital'))
        final = (base * (100 - bd['discount']) // 100) // 10 * 10
        pre = 'A partir de ' if frm else ''
        href = M + ','.join(bd['services']) + ('&model=' + bd['model'] if bd.get('model') else '')
        out.append(f'<article><span class="combo-tag">{bd["discount"]}% de desconto</span><h3>{e(bd["name"])}</h3><p>{e(bd["description"])}</p>'
                   f'<div class="combo-price"><s>{pre}{brl(base)}</s><strong>{pre}{brl(final)}</strong></div>'
                   f'<a class="btn btn-primary btn-sm" href="{e(href)}">Montar esta combinação</a></article>')
    out.append('</div>')
    return '\n'.join('      ' + l for l in out)


EXTRA_BLOCKS = {'solucoes/index.html': ('combos', combos)}

check = '--check' in sys.argv
bad = 0
for rel, (key, label, title, lead, ids, extras) in PAGES.items():
    p = ROOT / rel
    s = p.read_text()
    a, b = f'<!-- PRECOS:{key}:INICIO -->', f'<!-- PRECOS:{key}:FIM -->'
    if a not in s:
        print('sem marcador:', rel); bad += 1; continue
    new = s[:s.index(a) + len(a)] + '\n' + render(key, label, title, lead, ids, extras) + '\n    ' + s[s.index(b):]
    if check:
        if new != s: print('desatualizado:', rel); bad += 1
    else:
        p.write_text(new)
for rel, (key, fn) in EXTRA_BLOCKS.items():
    p = ROOT / rel; s = p.read_text()
    a, b = f'<!-- PRECOS:{key}:INICIO -->', f'<!-- PRECOS:{key}:FIM -->'
    if a not in s:
        print('sem marcador:', rel); bad += 1; continue
    new = s[:s.index(a) + len(a)] + '\n' + fn() + '\n      ' + s[s.index(b):]
    if check:
        if new != s: print('desatualizado:', rel); bad += 1
    else:
        p.write_text(new)
print('blocos de preço', 'conferidos' if check else 'gerados', '' if not bad else f'({bad} problema[s])')
sys.exit(1 if bad else 0)
