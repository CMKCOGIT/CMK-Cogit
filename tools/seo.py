"""SEO do site: dados estruturados (JSON-LD) de cada página e sitemap.xml.

- Um bloco <script type="application/ld+json" data-seo> por página, com @graph:
  Organization, WebSite, WebPage, BreadcrumbList e, quando a página tem, Service/Offer (preços de js/data.js)
  e FAQPage (perguntas visíveis na própria página).
- sitemap.xml com todas as páginas indexáveis (robots index) e data de atualização.
Uso: python3 tools/seo.py   (--check só confere se está atualizado)
"""
import datetime, html, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = 'https://www.cmkcogit.com.br'
LASTMOD = '2026-11-06'

DATA = json.loads(subprocess.check_output(['node', '-e', (
    "const vm=require('vm'),fs=require('fs');const c={};vm.createContext(c);"
    "vm.runInContext(fs.readFileSync('js/data.js','utf8')+';this.__d={s:configuratorData.services,faq:faqData,site:siteConfig}',c);"
    "process.stdout.write(JSON.stringify(c.__d))")], cwd=ROOT))
SVC = {s['id']: s for s in DATA['s']}

ORG = {
    '@type': ['Organization', 'ProfessionalService'], '@id': BASE + '/#org',
    'name': 'CMKCOGIT', 'alternateName': ['COGIT', 'CMK COGIT', 'CMK Cogit'], 'url': BASE + '/',
    'logo': {'@type': 'ImageObject', 'url': BASE + '/assets/images/icon-512.png', 'width': 512, 'height': 512},
    'image': BASE + '/assets/images/og-cmkcogit-2026.png',
    'description': 'Desenvolvimento de software e soluções digitais sob medida: sites, landing pages, sistemas de gestão, plataformas, automações, MVPs e SaaS.',
    'slogan': 'Pensamos antes de construir.',
    'email': 'contato@cmkcogit.com.br', 'telephone': '+55-17-98156-8889',
    'address': {'@type': 'PostalAddress', 'addressLocality': 'São José do Rio Preto', 'addressRegion': 'SP', 'addressCountry': 'BR'},
    'areaServed': {'@type': 'Country', 'name': 'Brasil'},
    'priceRange': 'R$ 500 - R$ 6.000+',
    'contactPoint': [{'@type': 'ContactPoint', 'contactType': 'customer service', 'telephone': '+55-17-98156-8889',
                      'email': 'contato@cmkcogit.com.br', 'availableLanguage': ['Portuguese'], 'areaServed': 'BR'}],
    'sameAs': ['https://www.instagram.com/cmkcogit', 'https://www.linkedin.com/in/cmkcogit'],
}
SITE = {'@type': 'WebSite', '@id': BASE + '/#website', 'url': BASE + '/', 'name': 'CMKCOGIT', 'alternateName': 'COGIT',
        'inLanguage': 'pt-BR', 'publisher': {'@id': BASE + '/#org'}}

SOL = ('Soluções & investimentos', BASE + '/solucoes/')
# página -> (nome curto na trilha, pai na trilha, serviços com preço)
PAGES = {
    'index.html': ('Início', None, []),
    'solucoes/index.html': ('Soluções & investimentos', 'home', ['landing-page', 'portfolio', 'site-institucional', 'identidade-essencial', 'loja-virtual', 'sistema', 'plataforma', 'mvp', 'automacao', 'integracao', 'manutencao', 'suporte']),
    'solucoes/sites-e-landing-pages.html': ('Sites e landing pages', SOL, ['landing-page', 'portfolio', 'site-institucional']),
    'solucoes/landing-pages.html': ('Landing pages', SOL, ['landing-page']),
    'solucoes/sites-institucionais.html': ('Sites institucionais', SOL, ['site-institucional']),
    'solucoes/modelos-prontos.html': ('Modelos prontos', SOL, ['landing-page:pronto', 'portfolio:pronto', 'site-institucional:pronto']),
    'solucoes/modelos-sob-medida.html': ('Modelos sob medida', SOL, ['landing-page:medida', 'portfolio:medida', 'site-institucional:medida']),
    'solucoes/sistemas-personalizados.html': ('Sistemas de gestão', SOL, ['sistema', 'plataforma']),
    'solucoes/plataformas-e-outras-solucoes.html': ('Plataformas web', SOL, ['plataforma', 'sistema']),
    'solucoes/automacoes-e-integracoes.html': ('Automações e integrações', SOL, ['automacao', 'integracao']),
    'solucoes/saas-e-produtos-digitais.html': ('MVP e produto digital', SOL, ['mvp', 'saas']),
    'monte-sua-solucao.html': ('Monte sua solução', 'home', []),
    'como-trabalhamos.html': ('Como trabalhamos', 'home', []),
    'sobre.html': ('Sobre & projetos', 'home', []),
    'ajuda.html': ('Ajuda e dúvidas frequentes', 'home', []),
    'contato.html': ('Contato', 'home', []),
    'privacidade.html': ('Política de Privacidade', 'home', []),
    'termos-de-uso.html': ('Termos de Uso', 'home', []),
    'obrigado.html': ('Obrigado', 'home', []),
    '404.html': ('Página não encontrada', 'home', []),
}
SITEMAP_PRIORITY = {'index.html': '1.0', 'solucoes/index.html': '0.9', 'monte-sua-solucao.html': '0.9'}


def url_of(rel):
    if rel == 'index.html': return BASE + '/'
    if rel.endswith('/index.html'): return BASE + '/' + rel[:-len('index.html')]
    return BASE + '/' + rel


def offer(price, frm):
    o = {'@type': 'Offer', 'priceCurrency': 'BRL', 'price': price, 'availability': 'https://schema.org/InStock',
         'seller': {'@id': BASE + '/#org'}}
    if frm: o['priceSpecification'] = {'@type': 'PriceSpecification', 'minPrice': price, 'priceCurrency': 'BRL'}
    return o


def services(ids, page_url):
    out = []
    for key in ids:
        sid, _, fmt = key.partition(':')
        if sid == 'saas':
            name, desc, offers = 'Produto digital completo (SaaS)', 'Versão completa e escalável, pronta para vender por assinatura.', [offer(SVC['plataforma']['price'], True)]
        else:
            s = SVC[sid]; name, desc = s['name'], s['description']
            if s.get('isPresencaDigital'):
                offers = []
                if fmt in ('', 'pronto'): offers.append(dict(offer(s['price'], False), name='Modelo pronto'))
                if fmt in ('', 'medida'): offers.append(dict(offer(s['customPrice'], True), name='Sob medida'))
                if fmt == 'pronto': name += ' — modelo pronto'
                if fmt == 'medida': name += ' — sob medida'
            else:
                offers = [offer(s['price'], s['priceType'] == 'from')]
                if s.get('billing') == 'monthly': offers[0]['priceSpecification'] = {'@type': 'UnitPriceSpecification', 'price': s['price'], 'priceCurrency': 'BRL', 'unitText': 'mês'}
        out.append({'@type': 'Service', 'name': name, 'description': desc, 'provider': {'@id': BASE + '/#org'},
                    'areaServed': {'@type': 'Country', 'name': 'Brasil'}, 'url': page_url, 'offers': offers if len(offers) > 1 else offers[0]})
    return out


def text(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def faqs(rel, src):
    if rel == 'index.html':
        return [(f['question'], f['answer']) for f in DATA['faq']]
    main = src[src.find('<main'):src.find('</main>')]
    out = []
    for m in re.finditer(r'<details[^>]*>([\s\S]*?)</details>', main):
        before = main[max(0, m.start() - 600):m.start()]
        cls = re.findall(r'class="([^"]*)"', before)
        if not any(re.search(r'faq|help-grupo', c) for c in cls[-4:]) and 'faq' not in m.group(0)[:120]: continue
        q = re.search(r'<summary[^>]*>([\s\S]*?)</summary>', m.group(1))
        if not q: continue
        a = text(m.group(1)[q.end():])
        if len(a) > 20: out.append((text(q.group(1)), a))
    return out


def graph(rel, src):
    name, parent, ids = PAGES[rel]
    u = url_of(rel)
    title = text(re.search(r'<title>([\s\S]*?)</title>', src).group(1))
    desc = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', src, re.S)
    crumbs = [{'@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': BASE + '/'}]
    if parent and parent != 'home': crumbs.append({'@type': 'ListItem', 'position': 2, 'name': parent[0], 'item': parent[1]})
    if rel != 'index.html': crumbs.append({'@type': 'ListItem', 'position': len(crumbs) + 1, 'name': name, 'item': u})
    page = {'@type': 'WebPage', '@id': u + '#webpage', 'url': u, 'name': title, 'inLanguage': 'pt-BR',
            'isPartOf': {'@id': BASE + '/#website'}, 'about': {'@id': BASE + '/#org'},
            'primaryImageOfPage': {'@type': 'ImageObject', 'url': BASE + '/assets/images/og-cmkcogit-2026.png'}}
    if desc: page['description'] = text(desc.group(1))
    if len(crumbs) > 1: page['breadcrumb'] = {'@id': u + '#breadcrumb'}
    items = [ORG, SITE, page]
    if len(crumbs) > 1: items.append({'@type': 'BreadcrumbList', '@id': u + '#breadcrumb', 'itemListElement': crumbs})
    sv = services(ids, u)
    if rel == 'solucoes/index.html':
        items.append({'@type': 'OfferCatalog', 'name': 'Serviços e valores COGIT', 'url': u,
                      'itemListElement': [{'@type': 'Offer', 'itemOffered': s, **({k: v for k, v in (s['offers'][0] if isinstance(s['offers'], list) else s['offers']).items() if k in ('price', 'priceCurrency')})} for s in sv]})
    else:
        items += sv
    fq = faqs(rel, src)
    if fq:
        items.append({'@type': 'FAQPage', '@id': u + '#faq', 'mainEntity': [
            {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in fq[:20]]})
    return {'@context': 'https://schema.org', '@graph': items}


def robots(src):
    m = re.search(r'<meta\s+name="robots"\s+content="([^"]*)"', src)
    return m.group(1) if m else 'index, follow'


check = '--check' in sys.argv
bad = []
indexable = []
for rel in PAGES:
    p = ROOT / rel; src = p.read_text()
    block = '<script type="application/ld+json" data-seo>\n' + json.dumps(graph(rel, src), ensure_ascii=False, indent=2) + '\n  </script>'
    # remove os blocos antigos e põe o gerado antes de </head>
    clean = re.sub(r'\n?\s*<!-- Schema\.org[^>]*-->', '', src)
    clean = re.sub(r'\n?\s*<script type="application/ld\+json"[^>]*>[\s\S]*?</script>', '', clean)
    new = clean.replace('</head>', '  ' + block + '\n</head>', 1)
    if new != src:
        if check: bad.append(rel)
        else: p.write_text(new)
    if 'noindex' not in robots(src): indexable.append(rel)

sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for rel in indexable:
    pr = SITEMAP_PRIORITY.get(rel, '0.8' if rel.startswith('solucoes/') else '0.6' if rel in ('privacidade.html', 'termos-de-uso.html') else '0.7')
    sm += ['  <url>', f'    <loc>{url_of(rel)}</loc>', f'    <lastmod>{LASTMOD}</lastmod>', f'    <priority>{pr}</priority>', '  </url>']
sm.append('</urlset>\n')
smp = ROOT / 'sitemap.xml'
if smp.read_text() != '\n'.join(sm):
    if check: bad.append('sitemap.xml')
    else: smp.write_text('\n'.join(sm))
print('SEO', 'conferido' if check else 'gerado', f'({len(indexable)} páginas no sitemap)', ('desatualizado: ' + ', '.join(bad)) if bad else '')
sys.exit(1 if bad else 0)
