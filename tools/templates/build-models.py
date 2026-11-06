"""Gera os três modelos prontos (templates/landing, portfolio e institucional).

Um modelo pronto tem ESTRUTURA FIXA: as mesmas seções, na mesma ordem, com os mesmos
componentes. Por cliente mudam só a marca (css/tokens.css), as fotos (img/) e os textos
(o dicionário de cada modelo abaixo). Assim o modelo é rápido de entregar e o cliente
sabe exatamente o que recebe.

  Landing Page Essencial ...... 1 página, 5 seções: topo, benefícios, como funciona,
                                depoimentos, contato (formulário + dúvidas)
  Portfólio Profissional ...... 1 página: topo, trabalhos (6), sobre, serviços (3),
                                depoimentos, contato
  Site Institucional Essencial  4 páginas: Início, Sobre, Serviços e Contato

Uso: python3 tools/templates/build-models.py   (depois: node tools/templates/configure.mjs)
"""
import html, os, pathlib, re, shutil
from PIL import Image

REPO = pathlib.Path(__file__).resolve().parents[2]
BASE = REPO / 'tools/templates/base'
E = html.escape

# ---------------------------------------------------------------- ícones (traço 24px)
ICONS = {
    'check': '<path d="M5 12.5l4.2 4.2L19 7"/>',
    'clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'chat': '<path d="M5 18.5l1.2-3.6A7.5 7.5 0 1 1 9 18.1z"/>',
    'shield': '<path d="M12 3.5l7 3v5.2c0 4.3-3 7.7-7 8.8-4-1.1-7-4.5-7-8.8V6.5z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    'calendar': '<rect x="4" y="5.5" width="16" height="14" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    'card': '<rect x="3.5" y="6" width="17" height="12" rx="1.5"/><path d="M3.5 10h17M7 14.5h4"/>',
    'phone': '<rect x="7" y="3.5" width="10" height="17" rx="2"/><path d="M11 17.5h2"/>',
    'users': '<circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.5a3 3 0 0 1 0 5.5M17.5 14.5a5 5 0 0 1 3 4.5"/>',
    'chart': '<path d="M4 19.5h16M7 16v-4M12 16V8M17 16v-6"/>',
    'file': '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5"/>',
    'spark': '<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.8 2.8M15.2 15.2L18 18M18 6l-2.8 2.8M8.8 15.2L6 18"/>',
    'lock': '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    'map': '<path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'pen': '<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>',
    'box': '<path d="M4 7.5L12 4l8 3.5v9L12 20l-8-3.5z"/><path d="M4 7.5L12 11l8-3.5M12 11v9"/>',
    'refresh': '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19 4.5V9h-4.5"/>',
}
def icon(name):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">{ICONS[name]}</svg>'

# ---------------------------------------------------------------- imagens
def pic(t, name, alt, sizes='(max-width: 899px) 100vw, 50vw', eager=False):
    """<picture> com AVIF/WebP em todas as larguras existentes e JPG (ou WebP) de reserva."""
    img_dir = REPO / 'templates' / t / 'img'
    if (img_dir / f'{name}.jpg').exists() and not list(img_dir.glob(name + '-*.*')):
        with Image.open(img_dir / f'{name}.jpg') as im: w, h = im.size
        load = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
        return f'<img src="img/{name}.jpg" width="{w}" height="{h}" alt="{E(alt)}" {load}>'
    files = sorted(img_dir.glob(name + '-*.*'))
    widths = sorted({int(re.search(r'-(\d+)\.', f.name).group(1)) for f in files})
    def srcset(ext):
        got = [f'img/{name}-{w}.{ext} {w}w' for w in widths if (img_dir / f'{name}-{w}.{ext}').exists()]
        return ', '.join(got)
    fallback = next((f for w in reversed(widths) for f in [img_dir / f'{name}-{w}.jpg'] if f.exists()), None) \
        or next(img_dir / f'{name}-{w}.webp' for w in reversed(widths) if (img_dir / f'{name}-{w}.webp').exists())
    with Image.open(fallback) as im: w, h = im.size
    out = ['<picture>']
    for ext, mime in (('avif', 'image/avif'), ('webp', 'image/webp')):
        s = srcset(ext)
        if s: out.append(f'<source type="{mime}" srcset="{s}" sizes="{sizes}">')
    load = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    out.append(f'<img src="img/{fallback.name}" width="{w}" height="{h}" alt="{E(alt)}" {load}>')
    out.append('</picture>')
    return ''.join(out)

def slot(t, name, alt, ratio='4x3', sizes='(max-width: 899px) 100vw, 50vw', eager=False, reveal=True):
    return f'<figure class="slot slot--{ratio}"{" data-reveal" if reveal else ""}>{pic(t, name, alt, sizes, eager)}</figure>'

# ---------------------------------------------------------------- blocos comuns
def head(m, page, title, desc, og_title=None):
    fonts = ''.join(f'\n  <link rel="preload" href="fonts/{f}" as="font" type="font/woff2" crossorigin>' for f in m['preload'])
    schema = ''
    if page == 'index.html':
        schema = '\n  <script type="application/ld+json" id="schema">\n  ' + m['schema'] + '\n  </script>'
    return f'''<!doctype html>
<html lang="pt-BR" data-mode="demo">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{E(title)}</title>
  <meta name="description" content="{E(desc)}">
  <!-- cmk:seo:start — gerado por tools/templates/configure.mjs; não edite à mão -->
  <meta name="robots" content="noindex, nofollow">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="{E(m['brand'])}">
  <meta property="og:title" content="{E(og_title or title)}">
  <meta property="og:description" content="{E(desc)}">
  <meta property="og:image" content="img/og.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{E(m['brand'])}">
  <meta name="twitter:card" content="summary_large_image">
  <!-- cmk:seo:end -->
  <meta name="theme-color" content="{m['theme']}">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="img/icon-180.png">
  <link rel="manifest" href="site.webmanifest">{fonts}
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/styles.css">
  <script>document.documentElement.classList.add('js')</script>
  <script src="js/main.js" defer></script>{schema}
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <p class="demo-bar"><strong>Modelo pronto · {E(m['model'])}</strong> — demonstração com marca fictícia. No seu site entram seu logotipo, suas cores, suas fotos e seus textos.</p>
'''

def header(m, page):
    links = []
    for href, label in m['nav']:
        cur = ' aria-current="page"' if href == page else ''
        links.append(f'<li><a href="{href}"{cur}>{E(label)}</a></li>')
    toggle = '' if m.get('no_menu') else '\n      <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="menu" aria-label="Abrir menu"><span></span><span></span><span></span></button>'
    cta_href, cta_label = m['header_cta']
    return f'''  <header class="site-header" data-header>
    <div class="container header-inner">
      <a class="logo" href="{m['home']}" aria-label="{E(m['brand'])}, página inicial"><span class="logo-mark" aria-hidden="true">{m['mark']}</span><span>{E(m['brand'])}</span></a>
      <nav class="nav" id="menu" data-nav aria-label="Principal">
        <ul>{''.join(links)}</ul>
      </nav>
      <a class="btn btn--primary btn--sm header-cta" href="{cta_href}">{E(cta_label)}</a>{toggle}
    </div>
  </header>
'''

def footer(m):
    cols = ''.join(f'''
        <div>
          <p class="footer-title">{E(title)}</p>
          <ul class="footer-links">{''.join(f'<li><a href="{h}"{" data-contact=" + chr(34) + c + chr(34) if c else ""}>{E(l)}</a></li>' for h, l, c in items)}</ul>
        </div>''' for title, items in m['footer_cols'])
    return f'''  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="logo" href="{m['home']}" aria-label="{E(m['brand'])}, página inicial"><span class="logo-mark" aria-hidden="true">{m['mark']}</span><span>{E(m['brand'])}</span></a>
          <p class="footer-about">{E(m['footer_about'])}</p>
        </div>{cols}
      </div>
      <div class="footer-bottom">
        <p>© <span data-year>2026</span> {E(m['legal'])}</p>
        <p class="demo-note" data-demo-note>Site demonstrativo. Marca, pessoas e depoimentos são fictícios.</p>
        <p>Desenvolvido por <a href="https://www.cmkcogit.com.br/" rel="noopener">CMK Cogit</a></p>
      </div>
    </div>
  </footer>
  <div class="toast" data-toast role="status" hidden></div>
'''

def section_head(kicker, title, lead=None, hid=None, center=False):
    return (f'<div class="section-head{" section-head--center" if center else ""}" data-reveal>'
            f'<p class="kicker">{E(kicker)}</p><h2{f" id={chr(34)}{hid}{chr(34)}" if hid else ""}>{E(title)}</h2>'
            + (f'<p>{E(lead)}</p>' if lead else '') + '</div>')

def cards(items, cols=3, h='h3'):
    out = []
    for it in items:
        ic = f'<span class="card-icon">{icon(it["icon"])}</span>' if it.get('icon') else ''
        lst = ''.join(f'<li>{E(x)}</li>' for x in it.get('list', []))
        lst = f'<ul class="card-list">{lst}</ul>' if lst else ''
        meta = f'<p class="card-meta">{E(it["meta"])}</p>' if it.get('meta') else ''
        out.append(f'<article class="card" data-reveal>{ic}<{h}>{E(it["title"])}</{h}><p>{E(it["text"])}</p>{lst}{meta}</article>')
    return f'<div class="grid grid--{cols}">{"".join(out)}</div>'

def steps(items, n=None):
    li = ''.join(f'<li class="step" data-reveal><h3>{E(a)}</h3><p>{E(b)}</p></li>' for a, b in items)
    return f'<ol class="steps" style="--steps: {n or len(items)}">{li}</ol>'

def quotes(items, cols=3):
    out = ''.join(f'''<figure class="quote" data-reveal><blockquote><p>“{E(q)}”</p></blockquote><figcaption><span class="avatar" aria-hidden="true">{E("".join(w[0] for w in n.split()[:2]))}</span><span><strong>{E(n)}</strong>{E(r)}</span></figcaption></figure>''' for q, n, r in items)
    return f'<div class="grid grid--{cols}">{out}</div>'

def faq(items):
    return '<div class="faq">' + ''.join(f'<details data-reveal><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in items) + '</div>'

def stats(items):
    return '<dl class="stats">' + ''.join(f'<div><dt>{E(b)}</dt><dd>{E(a)}</dd></div>' for a, b in items) + '</dl>'

def field(fid, label, kind='text', required=True, placeholder='', options=None, autocomplete=None, extra=''):
    req = ' required' if required else ''
    ac = f' autocomplete="{autocomplete}"' if autocomplete else ''
    ph = f' placeholder="{E(placeholder)}"' if placeholder else ''
    lab = E(label) + ('' if required else ' <span class="sr-only">(opcional)</span>')
    if options:
        opts = '<option value="">Escolha uma opção</option>' + ''.join(f'<option>{E(o)}</option>' for o in options)
        control = f'<select id="{fid}" name="{fid.split("-", 1)[1]}"{req}>{opts}</select>'
    elif kind == 'textarea':
        control = f'<textarea id="{fid}" name="{fid.split("-", 1)[1]}" rows="4"{req}{ph}{extra}></textarea>'
    else:
        control = f'<input id="{fid}" name="{fid.split("-", 1)[1]}" type="{kind}"{req}{ac}{ph}{extra}>'
    return f'<div class="field"><label for="{fid}">{lab}</label>{control}<p class="field-error" id="{fid}-erro" hidden></p></div>'

def form(m, fid):
    f = m['form']
    rows = []
    for row in f['rows']:
        inner = ''.join(field(f'{fid}-{x[0]}', *x[1:]) for x in row)
        rows.append(f'<div class="form-row">{inner}</div>' if len(row) > 1 else inner)
    privacy = f' <a href="privacidade.html">política de privacidade</a>' if m.get('privacy') else ' política de privacidade'
    return f'''<form class="form" data-form data-fallback="{f.get('fallback', 'whatsapp')}" novalidate aria-labelledby="{fid}-titulo">
            <h3 id="{fid}-titulo">{E(f['title'])}</h3>
            <p class="form-intro">{E(f['intro'])}</p>
            {''.join(rows)}
            <div class="field"><label class="check" for="{fid}-consentimento"><input id="{fid}-consentimento" name="consentimento" type="checkbox" required> <span>Autorizo o contato com os dados acima, conforme a{privacy}.</span></label><p class="field-error" id="{fid}-consentimento-erro" hidden></p></div>
            <div class="hp" aria-hidden="true"><label for="{fid}-site">Não preencha</label><input id="{fid}-site" name="site" type="text" tabindex="-1" autocomplete="off"></div>
            <button class="btn btn--primary" type="submit"><span data-submit-label>{E(f['submit'])}</span></button>
            <p class="form-status" data-form-status role="status" aria-live="polite"></p>
          </form>'''

def contact_section(m, sid, fid, kicker, title, lead, extra_html=''):
    items = ''.join(f'<li><span>{E(l)}</span><a href="{h}" data-contact="{c}">{E(v)}</a></li>' if h else f'<li><span>{E(l)}</span><p>{E(v)}</p></li>' for l, v, h, c in m['contacts'])
    return f'''    <section class="section section--alt" id="{sid}" aria-labelledby="{sid}-titulo">
      <div class="container contact">
        <div class="contact-info" data-reveal>
          <div class="section-head"><p class="kicker">{E(kicker)}</p><h2 id="{sid}-titulo">{E(title)}</h2><p>{E(lead)}</p></div>
          <ul class="contact-points">{''.join(f'<li>{icon("check")}<span>{E(p)}</span></li>' for p in m['contact_points'])}</ul>
          <ul class="contact-list">{items}</ul>
          {extra_html}
        </div>
        {form(m, fid)}
      </div>
    </section>
'''

def page(m, name, title, desc, body, og_title=None):
    out = head(m, name, title, desc, og_title) + header(m, name) + f'  <main id="conteudo">\n{body}  </main>\n' + footer(m)
    if m.get('sticky') and name == 'index.html':
        out += f'  <div class="sticky-cta" data-sticky-cta><a class="btn btn--primary" href="{m["sticky"][0]}">{E(m["sticky"][1])}</a></div>\n'
    if name != 'index.html':
        # nas outras páginas, links para seções do início apontam para ./#secao
        ids = set(re.findall(r'\sid="([^"]+)"', out))
        out = re.sub(r'href="#([^"]+)"', lambda mm: mm.group(0) if mm.group(1) in ids else f'href="./#{mm.group(1)}"', out)
    return out + '</body>\n</html>\n'

def simple_page(m, name, title, desc, inner):
    body = f'    <div class="page"><div class="container">\n{inner}\n    </div></div>\n'
    return page(m, name, title, desc, body)

# ================================================================ LANDING
def landing():
    t = 'landing'
    m = dict(
        brand='Alento', model='Landing Page Essencial', mark='a', theme='#fbfaf6', home='#topo', privacy=True,
        preload=['bricolage-grotesque-latin-opsz-normal.woff2', 'figtree-latin-wght-normal.woff2'],
        nav=[('#beneficios', 'Benefícios'), ('#como-funciona', 'Como funciona'), ('#depoimentos', 'Depoimentos')],
        header_cta=('#contato', 'Agendar demonstração'), no_menu=True, sticky=('#contato', 'Agendar demonstração gratuita'),
        footer_about='Agenda online, confirmação automática pelo WhatsApp e cobrança para psicólogos e terapeutas.',
        footer_cols=[('Página', [('#beneficios', 'Benefícios', ''), ('#como-funciona', 'Como funciona', ''), ('#contato', 'Contato', ''), ('privacidade.html', 'Privacidade', '')]),
                     ('Contato', [('https://wa.me/5500000000000', 'WhatsApp', 'whatsapp'), ('mailto:ola@alento.example', 'ola@alento.example', 'email')])],
        legal='Alento Tecnologia Ltda. · CNPJ 00.000.000/0001-00',
        contacts=[('WhatsApp', '(00) 90000-0000', 'https://wa.me/5500000000000', 'whatsapp'), ('E-mail', 'ola@alento.example', 'mailto:ola@alento.example', 'email')],
        contact_points=['Resposta em até um dia útil', 'Demonstração por vídeo, com uma pessoa da equipe', 'Sem compromisso de contratação'],
        form=dict(title='Agendar demonstração', intro='Leva menos de um minuto. Respondemos pelo WhatsApp.', submit='Quero agendar minha demonstração',
                  rows=[[('nome', 'Nome', 'text', True, 'Seu nome', None, 'name')],
                        [('email', 'E-mail', 'email', True, 'voce@email.com', None, 'email'), ('whatsapp', 'WhatsApp', 'tel', True, '(00) 90000-0000', None, 'tel', ' inputmode="tel" pattern="[0-9()\\s+-]{10,}"')],
                        [('perfil', 'Como você atende?', 'text', True, '', ['Sozinho(a), em consultório', 'Em clínica pequena', 'Só on-line'])]]),
        schema='{\n    "@context": "https://schema.org",\n    "@type": "SoftwareApplication",\n    "name": "Alento",\n    "applicationCategory": "BusinessApplication",\n    "operatingSystem": "Web",\n    "description": "Agenda online, confirmação automática pelo WhatsApp e cobrança para psicólogos e terapeutas.",\n    "inLanguage": "pt-BR"\n  }',
    )
    body = f'''    <section class="hero" id="topo" aria-labelledby="titulo">
      <div class="container hero-grid">
        <div data-reveal>
          <p class="kicker">Para psicólogos e terapeutas</p>
          <h1 id="titulo">Menos faltas. Menos mensagens. Mais tempo para os pacientes.</h1>
          <p class="lead">O Alento confirma as sessões pelo WhatsApp, oferece horários vagos para a lista de espera e organiza as cobranças. Você só abre a agenda para atender.</p>
          <div class="hero-actions"><a class="btn btn--primary" href="#contato">Agendar demonstração gratuita {icon("arrow")}</a><a class="btn btn--ghost" href="#como-funciona">Ver como funciona</a></div>
          <ul class="hero-points"><li>{icon("clock")} 20 minutos por vídeo</li><li>{icon("card")} Sem cartão de crédito</li><li>{icon("shield")} Dados protegidos</li></ul>
        </div>
        {slot(t, "hero", "Agenda semanal do Alento com as sessões confirmadas e um lembrete pelo WhatsApp", "16x10", "(max-width: 899px) 100vw, 46vw", eager=True, reveal=False)}
      </div>
    </section>

    <section class="section section--alt" id="beneficios" aria-labelledby="beneficios-titulo">
      <div class="container">
        {section_head("Benefícios", "Tudo o que acontece entre uma sessão e outra, resolvido.", "Lembretes, remarcações e cobranças saem sozinhos. Você ganha de volta as horas que passava no celular.", "beneficios-titulo")}
        {cards([dict(icon="chat", title="Confirmação pelo WhatsApp", text="Na véspera, o paciente recebe um lembrete e confirma com um toque. Quem não responde aparece destacado."),
                dict(icon="calendar", title="Lista de espera automática", text="Se alguém desmarca, o horário é oferecido para a lista de espera. O primeiro que aceitar fica com a sessão."),
                dict(icon="card", title="Cobrança sem planilha", text="Pix ou cartão enviados no dia que você escolher. O pagamento baixa sozinho e o recibo fica pronto.")])}
      </div>
    </section>

    <section class="section" id="como-funciona" aria-labelledby="como-titulo">
      <div class="container">
        {section_head("Como funciona", "Três passos até a primeira confirmação automática.", None, "como-titulo")}
        {steps([("Demonstração", "Uma conversa de 20 minutos para entender sua rotina e mostrar o Alento funcionando."),
                ("Configuração", "Horários, valores e mensagens ajustados com a equipe, junto com a importação da agenda."),
                ("Link no ar", "Você compartilha o link com os pacientes e os lembretes começam a sair no mesmo dia.")])}
      </div>
    </section>

    <section class="section section--alt" id="depoimentos" aria-labelledby="depoimentos-titulo">
      <div class="container">
        {section_head("Depoimentos", "Quem usa recomenda.", None, "depoimentos-titulo")}
        {quotes([("Parei de começar o dia respondendo mensagens. As faltas sem aviso praticamente sumiram da minha agenda.", "Luiza Mendonça", "Psicóloga clínica"),
                 ("A lista de espera preenche os horários que antes ficavam vazios. Na clínica, isso mudou o fim do mês.", "Tiago Rocha", "Sócio de clínica"),
                 ("Os pacientes acharam simples: marcam pelo link e recebem tudo no WhatsApp. Ninguém precisou instalar nada.", "Carla Nunes", "Terapeuta ocupacional")])}
        {stats([("−70%", "faltas sem aviso"), ("6 h", "economizadas por semana"), ("1 tarde", "para configurar")])}
      </div>
    </section>

''' + contact_section(m, 'contato', 'lp', 'Contato', 'Veja o Alento funcionando com a sua agenda.', 'Deixe seu contato e escolhemos juntos um horário para a demonstração.',
        '<div class="faq" aria-label="Dúvidas frequentes">' + ''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in [
            ("Meus pacientes precisam instalar algum aplicativo?", "Não. Eles marcam pelo link no navegador e recebem lembretes e cobranças pelo WhatsApp."),
            ("Consigo trazer a agenda que já uso?", "Sim. Importamos agendas do Google Agenda e planilhas, com acompanhamento da equipe."),
            ("Existe fidelidade ou multa para cancelar?", "Não. Você pode cancelar quando quiser e exportar seus dados antes de sair.")]) + '</div>')
    write(t, 'index.html', page(m, 'index.html', 'Alento — Agenda online e confirmação automática para psicólogos',
        'Agenda online, confirmação automática pelo WhatsApp, lista de espera e cobrança para psicólogos e terapeutas. Agende uma demonstração gratuita.', body,
        'Alento — Menos faltas, mais tempo para os pacientes'))
    write(t, 'privacidade.html', simple_page(m, 'privacidade.html', 'Política de privacidade — Alento',
        'Como o Alento trata os dados enviados pelo formulário de demonstração: finalidade, armazenamento, compartilhamento e direitos do titular.', privacy_inner(t)))
    write(t, '404.html', notfound(m, 'Página não encontrada — Alento', 'Este horário não existe na agenda.', 'A página que você procurou não foi encontrada. Na página inicial você vê como o Alento funciona e pode agendar uma demonstração.'))

# ================================================================ PORTFÓLIO
def portfolio():
    t = 'portfolio'
    m = dict(
        brand='Lia Toledo', model='Portfólio Profissional', mark='LT', theme='#f4efe6', home='#topo',
        preload=['instrument-serif-latin-400-normal.woff2', 'instrument-sans-latin-wght-normal.woff2'],
        nav=[('#trabalhos', 'Trabalhos'), ('#sobre', 'Sobre'), ('#servicos', 'Serviços'), ('#contato', 'Contato')],
        header_cta=('#contato', 'Começar um projeto'),
        footer_about='Designer de identidade visual e embalagem em Curitiba. Marcas para negócios independentes.',
        footer_cols=[('Navegação', [('#trabalhos', 'Trabalhos', ''), ('#sobre', 'Sobre', ''), ('#servicos', 'Serviços', ''), ('#contato', 'Contato', '')]),
                     ('Redes', [('https://instagram.com/', 'Instagram', 'social'), ('https://behance.net/', 'Behance', 'social'), ('https://linkedin.com/', 'LinkedIn', 'social')])],
        legal='Lia Toledo Design · Curitiba, PR',
        contacts=[('E-mail', 'ola@liatoledo.example', 'mailto:ola@liatoledo.example', 'email'), ('WhatsApp', '(41) 90000-0000', 'https://wa.me/5541900000000', 'whatsapp'), ('Instagram', '@liatoledo.design', 'https://instagram.com/', 'social')],
        contact_points=['Resposta em até dois dias úteis', 'Primeira conversa de 30 minutos, sem custo', 'Atendimento presencial em Curitiba ou remoto'],
        form=dict(title='Conte sobre o seu projeto', intro='Quanto mais contexto, melhor a primeira conversa.', submit='Enviar mensagem', fallback='email',
                  rows=[[('nome', 'Nome', 'text', True, 'Seu nome', None, 'name'), ('email', 'E-mail', 'email', True, 'voce@empresa.com.br', None, 'email')],
                        [('servico', 'O que você precisa?', 'text', True, '', ['Identidade visual completa', 'Embalagem e rótulos', 'Redesenho de marca', 'Ainda não sei'])],
                        [('mensagem', 'Sobre o negócio', 'textarea', True, 'O que vocês fazem, para quem e o que motivou a mudança.', None, None, ' minlength="20"')]]),
        schema='{\n    "@context": "https://schema.org",\n    "@type": "ProfilePage",\n    "mainEntity": {\n      "@type": "Person",\n      "name": "Lia Toledo",\n      "jobTitle": "Designer de identidade visual",\n      "address": { "@type": "PostalAddress", "addressLocality": "Curitiba", "addressRegion": "PR", "addressCountry": "BR" }\n    },\n    "inLanguage": "pt-BR"\n  }',
    )
    works = [('casa-brava-cover', 'Casa Brava', 'Embalagem · 2025', 'Sistema de rótulos para 9 origens de café especial.', 'Embalagens de café da Casa Brava'),
             ('margem-poster', 'Livraria Margem', 'Identidade · 2024', 'Marca, marcadores e cartazes para os clubes de leitura.', 'Cartaz da Livraria Margem'),
             ('mare-poster', 'Maré Cheia', 'Festival · 2023–2025', 'Sistema gráfico que muda de cor a cada edição.', 'Cartaz do festival Maré Cheia'),
             ('raiz-cards', 'Clínica Raiz', 'Identidade · 2024', 'Marca, sinalização e cartões de agendamento.', 'Cartões da Clínica Raiz'),
             ('archive-serra', 'Serra Alta', 'Rótulos · 2023', 'Linha de rótulos para uma vinícola de altitude.', 'Rótulos da Serra Alta'),
             ('archive-fermento', 'Fermento', 'Identidade · 2022', 'Marca e embalagens para uma padaria de fermentação natural.', 'Embalagens da padaria Fermento')]
    work_html = ''.join(f'<article class="work" data-reveal>{slot(t, img, alt, "4x3", "(max-width: 599px) 100vw, (max-width: 899px) 50vw, 33vw", reveal=False)}<div><p class="work-tag">{E(tag)}</p><h3>{E(name)}</h3><p>{E(desc)}</p></div></article>' for img, name, tag, desc, alt in works)
    body = f'''    <section class="hero" id="topo" aria-labelledby="titulo">
      <div class="container hero-grid">
        <div data-reveal>
          <p class="kicker">Identidade visual · Embalagem · Direção de arte</p>
          <h1 id="titulo">Marcas que sustentam a conversa com quem compra.</h1>
          <p class="lead">Sou Lia Toledo, designer em Curitiba. Há nove anos desenho identidades visuais para negócios independentes: torrefações, livrarias, clínicas e festivais.</p>
          <div class="hero-actions"><a class="btn btn--primary" href="#trabalhos">Ver trabalhos {icon("arrow")}</a><a class="btn btn--ghost" href="https://wa.me/5541900000000" data-contact="whatsapp">Falar pelo WhatsApp</a></div>
          <ul class="hero-points"><li>{icon("check")} Agenda aberta a partir de fevereiro</li><li>{icon("map")} Curitiba e remoto</li></ul>
        </div>
        {slot(t, "studio", "Lia Toledo no estúdio, com provas impressas na mesa", "4x5", "(max-width: 899px) 100vw, 44vw", eager=True, reveal=False)}
      </div>
    </section>

    <section class="section section--alt" id="trabalhos" aria-labelledby="trabalhos-titulo">
      <div class="container">
        {section_head("Trabalhos", "Projetos selecionados.", "Cada projeto começa por uma pergunta de negócio, não por uma paleta.", "trabalhos-titulo")}
        <div class="grid grid--3">{work_html}</div>
      </div>
    </section>

    <section class="section" id="sobre" aria-labelledby="sobre-titulo">
      <div class="container split">
        <div class="split-media">{slot(t, "margem-flatlay", "Mesa do estúdio com provas de cor e papéis", "4x3")}</div>
        <div class="split-text" data-reveal>
          <p class="kicker">Sobre</p>
          <h2 id="sobre-titulo">Trabalho sozinha, de propósito.</h2>
          <p>Quem contrata fala comigo do primeiro café à última prova de impressão. Isso limita o número de projetos por ano e garante a atenção que cada marca precisa.</p>
          <p>Antes do estúdio, passei cinco anos em agências de embalagem em São Paulo. Trago dali o hábito de pensar na gôndola, na vitrine e no balcão, e não só na tela.</p>
          {stats([("9 anos", "desenhando marcas"), ("40+", "projetos entregues"), ("8", "projetos por ano, no máximo")])}
        </div>
      </div>
    </section>

    <section class="section section--alt" id="servicos" aria-labelledby="servicos-titulo">
      <div class="container">
        {section_head("Serviços", "Três formas de trabalharmos juntos.", "Escopo e prazo definidos antes de começar. O orçamento sai depois de uma conversa de 30 minutos.", "servicos-titulo")}
        {cards([dict(icon="pen", title="Identidade visual completa", text="Para negócios novos ou que mudaram de fase: diagnóstico, conceito, logotipo, tipografia, cor e guia de uso.", meta="8 a 12 semanas"),
                dict(icon="box", title="Embalagem e rótulos", text="Linhas de produto com sistema de variação, arquivos finais e acompanhamento da prova na gráfica.", meta="6 a 10 semanas"),
                dict(icon="refresh", title="Redesenho de marca", text="Para marcas que funcionam, mas envelheceram. Preservamos o que é reconhecido e corrigimos o que atrapalha.", meta="5 a 8 semanas")])}
      </div>
    </section>

    <section class="section" id="depoimentos" aria-labelledby="depoimentos-titulo">
      <div class="container">
        {section_head("Depoimentos", "O que dizem os clientes.", None, "depoimentos-titulo")}
        {quotes([("A Lia passou uma manhã na torra antes de abrir o computador. A embalagem nova explica o café melhor do que eu explicava no balcão.", "Rafael Brandão", "Casa Brava"),
                 ("Recebemos um sistema, não um logotipo. Os voluntários do festival montam as peças sozinhos e tudo continua parecendo Maré Cheia.", "Joana Meireles", "Festival Maré Cheia")], cols=2)}
      </div>
    </section>

''' + contact_section(m, 'contato', 'pf', 'Contato', 'Conte o que a sua marca precisa resolver.', 'Respondo com perguntas, uma proposta de escopo ou a indicação de outro profissional, se for o caso.')
    write(t, 'index.html', page(m, 'index.html', 'Lia Toledo — Identidade visual e embalagem em Curitiba',
        'Portfólio de Lia Toledo, designer de identidade visual e embalagem em Curitiba. Projetos para torrefações, livrarias, clínicas e festivais.', body))
    write(t, '404.html', notfound(m, 'Página não encontrada — Lia Toledo', 'Esta página saiu do portfólio.', 'O endereço que você procurou não existe. Na página inicial estão os trabalhos e o contato.'))

# ================================================================ INSTITUCIONAL
def institucional():
    t = 'institucional'
    m = dict(
        brand='Arrimo', model='Site Institucional Essencial', mark='A', theme='#f5f3ee', home='./', privacy=True,
        preload=['newsreader-latin-opsz-normal.woff2', 'public-sans-latin-wght-normal.woff2'],
        nav=[('./', 'Início'), ('sobre.html', 'Sobre'), ('servicos.html', 'Serviços'), ('contato.html', 'Contato')],
        header_cta=('contato.html', 'Solicitar proposta'),
        footer_about='Contabilidade consultiva para pequenas e médias empresas. Fiscal, pessoal e financeiro, perto do dono do negócio.',
        footer_cols=[('Site', [('./', 'Início', ''), ('sobre.html', 'Sobre', ''), ('servicos.html', 'Serviços', ''), ('contato.html', 'Contato', ''), ('privacidade.html', 'Privacidade', '')]),
                     ('Atendimento', [('tel:+553130000000', '(31) 3000-0000', 'phone'), ('https://wa.me/5531900000000', 'WhatsApp', 'whatsapp'), ('mailto:contato@arrimo.example', 'contato@arrimo.example', 'email')])],
        legal='Arrimo Contabilidade Ltda. · CNPJ 00.000.000/0001-00 · CRC-MG 000000/O',
        contacts=[('Telefone', '(31) 3000-0000', 'tel:+553130000000', 'phone'), ('WhatsApp', '(31) 90000-0000', 'https://wa.me/5531900000000', 'whatsapp'),
                  ('E-mail', 'contato@arrimo.example', 'mailto:contato@arrimo.example', 'email'), ('Endereço', 'Av. do Contorno, 0000 · Belo Horizonte, MG', None, None)],
        contact_points=['Um contador retorna em até um dia útil', 'Diagnóstico inicial sem custo', 'Atendimento presencial ou remoto'],
        form=dict(title='Dados para a proposta', intro='Conte um pouco sobre a empresa. Leva um minuto.', submit='Solicitar proposta',
                  rows=[[('nome', 'Nome', 'text', True, 'Seu nome', None, 'name'), ('empresa', 'Empresa', 'text', True, 'Nome da empresa', None, 'organization')],
                        [('email', 'E-mail', 'email', True, 'voce@empresa.com.br', None, 'email'), ('telefone', 'Telefone ou WhatsApp', 'tel', False, '(00) 90000-0000', None, 'tel')],
                        [('servico', 'Serviço de interesse', 'text', True, '', ['Contabilidade mensal', 'Planejamento tributário', 'Departamento pessoal', 'BPO financeiro', 'Abertura de empresa', 'Regularização'])]]),
        schema='{\n    "@context": "https://schema.org",\n    "@type": "AccountingService",\n    "name": "Arrimo Contabilidade",\n    "telephone": "+55-31-3000-0000",\n    "address": { "@type": "PostalAddress", "addressLocality": "Belo Horizonte", "addressRegion": "MG", "addressCountry": "BR" },\n    "inLanguage": "pt-BR"\n  }',
    )
    servicos_todos = [
        dict(icon="file", title="Contabilidade mensal", text="Escrituração, apuração de impostos, obrigações acessórias e um relatório gerencial todo mês.", list=["Apuração e guias de impostos", "Balancete e DRE mensais", "Reunião trimestral de resultados"]),
        dict(icon="chart", title="Planejamento tributário", text="Comparamos regimes e cenários com os números reais da empresa antes de cada virada de ano.", list=["Simulação entre regimes", "Distribuição de lucros e pró-labore", "Acompanhamento da reforma tributária"]),
        dict(icon="users", title="Departamento pessoal", text="Folha, admissões, férias e rescisões, com prazos do eSocial cumpridos e orientação antes de contratar.", list=["Folha, pró-labore e encargos", "Admissão e rescisão", "eSocial e FGTS Digital"]),
        dict(icon="card", title="BPO financeiro", text="Contas a pagar e a receber, conciliação e fluxo de caixa operados pela equipe, com acesso em tempo real.", list=["Agendamento de pagamentos", "Conciliação diária", "Fluxo de caixa projetado"]),
        dict(icon="spark", title="Abertura e alterações", text="Do contrato social ao alvará, com o enquadramento tributário certo desde o início.", list=["Contrato social e registros", "Inscrições e alvarás", "Alteração de sócios e endereço"]),
        dict(icon="shield", title="Regularização", text="Diagnóstico de pendências fiscais e trabalhistas e um plano para resolver cada uma.", list=["Levantamento de débitos", "Certidões negativas", "Parcelamentos e transações"]),
    ]
    cta = lambda: '''    <section class="section">
      <div class="container">
        <div class="cta-band" data-reveal><div><h2>Vamos conversar sobre a sua empresa?</h2><p>Um contador retorna em até um dia útil para agendar o diagnóstico, sem custo.</p></div><a class="btn btn--light" href="contato.html">Solicitar proposta</a></div>
      </div>
    </section>
'''
    casos = [('case-padaria', 'Varejo de alimentos · 3 lojas', 'Mudança de regime antes da terceira loja', 'A simulação mostrou que o Lucro Presumido reduziria a carga com o faturamento previsto.', 'Fachada de uma das lojas da rede de padarias'),
             ('case-clinica', 'Saúde · clínica odontológica', 'Equipe reorganizada sem passivo trabalhista', 'Contratos revisados, novos modelos e um calendário de férias para a equipe.', 'Recepção da clínica odontológica'),
             ('case-software', 'Tecnologia · software', 'Fluxo de caixa pronto para a rodada', 'Demonstrações organizadas e projeção de 18 meses para a conversa com investidores.', 'Equipe da empresa de software em reunião')]
    casos_html = ''.join(f'<article class="work" data-reveal>{slot(t, img, alt, "4x3", "(max-width: 599px) 100vw, (max-width: 899px) 50vw, 33vw", reveal=False)}<div><p class="work-tag">{E(tag)}</p><h3>{E(title)}</h3><p>{E(desc)}</p></div></article>' for img, tag, title, desc, alt in casos)

    index = f'''    <section class="hero" aria-labelledby="titulo">
      <div class="container hero-grid">
        <div data-reveal>
          <p class="kicker">Contabilidade para pequenas e médias empresas</p>
          <h1 id="titulo">A contabilidade que participa das decisões da sua empresa.</h1>
          <p class="lead">Cuidamos das obrigações fiscais, da folha e dos números do mês. E sentamos com você para decidir o que fazer com eles.</p>
          <div class="hero-actions"><a class="btn btn--primary" href="contato.html">Solicitar proposta {icon("arrow")}</a><a class="btn btn--ghost" href="servicos.html">Conhecer os serviços</a></div>
          <ul class="hero-points"><li>{icon("check")} Desde 2009</li><li>{icon("check")} Simples, Presumido e Real</li><li>{icon("check")} Presencial ou remoto</li></ul>
        </div>
        {slot(t, "hero-report", "Relatório gerencial mensal impresso sobre a mesa", "4x3", "(max-width: 899px) 100vw, 46vw", eager=True, reveal=False)}
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="servicos-titulo">
      <div class="container">
        {section_head("Serviços", "Tudo o que a contabilidade da sua empresa precisa.", "Do fechamento do mês ao planejamento do próximo ano, com um contador responsável pelo seu CNPJ.", "servicos-titulo")}
        {cards([{k: v for k, v in s.items() if k != 'list'} for s in servicos_todos[:3]])}
        <p class="section-more" data-reveal><a class="btn btn--ghost" href="servicos.html">Ver todos os serviços {icon("arrow")}</a></p>
      </div>
    </section>

    <section class="section" aria-labelledby="diferenciais-titulo">
      <div class="container">
        {section_head("Diferenciais", "O que muda quando a contabilidade está perto.", None, "diferenciais-titulo")}
        {cards([dict(icon="file", title="Relatório em linguagem de gestão", text="Receita, margem, impostos e caixa em quatro páginas, sem siglas."),
                dict(icon="calendar", title="Calendário fiscal compartilhado", text="Cada guia aparece com antecedência, valor e status."),
                dict(icon="clock", title="Resposta no mesmo dia útil", text="Dúvidas enviadas até as 16h são respondidas no mesmo dia."),
                dict(icon="refresh", title="Revisão anual de regime", text="Todo novembro simulamos o próximo ano e recomendamos o melhor regime.")], cols=4)}
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="casos-titulo">
      <div class="container">
        {section_head("Casos", "Decisões que tomamos junto com nossos clientes.", None, "casos-titulo")}
        <div class="grid grid--3">{casos_html}</div>
      </div>
    </section>

    <section class="section" aria-labelledby="depoimentos-titulo">
      <div class="container">
        {section_head("Depoimentos", "Quem trabalha com a gente.", None, "depoimentos-titulo")}
        {quotes([("Pela primeira vez eu sei quanto a empresa lucra antes do fim do trimestre. A reunião mensal virou a mais útil da agenda.", "Marina Coutinho", "Rede de padarias"),
                 ("A transição do escritório antigo foi feita sem eu precisar correr atrás de nada. Recebi um calendário e a lista do que faltava.", "Paulo Henrique Saraiva", "Clínica odontológica"),
                 ("Os investidores elogiaram a organização dos números. Isso economizou semanas na diligência.", "Renata Ilha", "Empresa de software")])}
      </div>
    </section>

''' + contact_section(m, 'contato', 'in', 'Contato', 'Solicite uma proposta.', 'Conte um pouco sobre a empresa. Um contador retorna em até um dia útil para agendar o diagnóstico, sem custo.')

    sobre = f'''    <section class="page-hero" aria-labelledby="titulo">
      <div class="container" data-reveal>
        <p class="kicker">Sobre a Arrimo</p>
        <h1 id="titulo">Arrimo é o que sustenta a parede enquanto a obra cresce.</h1>
        <p class="lead">Somos uma equipe de contadores, analistas fiscais e de departamento pessoal que trabalha perto do dono do negócio desde 2009.</p>
      </div>
    </section>

    <section class="section" aria-labelledby="historia-titulo">
      <div class="container split">
        <div class="split-media">{slot(t, "case-padaria", "Equipe da Arrimo em reunião com um cliente", "4x3")}</div>
        <div class="split-text" data-reveal>
          <p class="kicker">Nossa história</p>
          <h2 id="historia-titulo">Números a serviço das decisões.</h2>
          <p>Fundamos o escritório depois de ver empresas boas fechando por decisões tomadas sem números. Hoje atendemos comércio, serviços, saúde e tecnologia.</p>
          <p>Não fazemos tudo para todos: preferimos poucas empresas por contador e conversas frequentes.</p>
          {stats([("2009", "ano de fundação"), ("180+", "empresas atendidas"), ("14", "pessoas na equipe")])}
        </div>
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="valores-titulo">
      <div class="container">
        {section_head("Valores", "Como a gente trabalha.", None, "valores-titulo")}
        {cards([dict(icon="chat", title="Clareza", text="Relatórios que você entende sem tradução. Se não ficou claro, explicamos de novo."),
                dict(icon="calendar", title="Prazo", text="Calendário fiscal compartilhado: você sabe o que vence, o que foi pago e o que falta."),
                dict(icon="users", title="Responsabilidade", text="Um contador responsável pelo seu CNPJ, com nome, telefone e agenda.")])}
      </div>
    </section>

    <section class="section section--dark" aria-labelledby="metodo-titulo">
      <div class="container">
        {section_head("Como trabalhamos", "Da primeira conversa ao primeiro fechamento em até 30 dias.", "A troca de contador não interrompe nada. Fazemos a transição com o escritório anterior.", "metodo-titulo")}
        {steps([("Diagnóstico", "Entendemos a operação e revisamos os últimos 12 meses."),
                ("Proposta", "Escopo, responsável e honorários definidos por escrito."),
                ("Transição", "Recebemos documentos e acessos do escritório anterior."),
                ("Primeiro fechamento", "Relatório gerencial entregue e lido com você.")])}
      </div>
    </section>

''' + cta()

    servicos = f'''    <section class="page-hero" aria-labelledby="titulo">
      <div class="container" data-reveal>
        <p class="kicker">Serviços</p>
        <h1 id="titulo">Tudo o que a contabilidade da sua empresa precisa, em um só lugar.</h1>
        <p class="lead">Escolha um serviço ou combine vários. Cada empresa tem um contador responsável e um calendário fiscal compartilhado.</p>
      </div>
    </section>

    <section class="section" aria-label="Lista de serviços">
      <div class="container">
        {cards(servicos_todos, cols=3, h='h2')}
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="duvidas-titulo">
      <div class="container">
        {section_head("Dúvidas frequentes", "Antes de trocar de contador.", None, "duvidas-titulo")}
        {faq([("Posso trocar de contador no meio do ano?", "Sim. A transição pode acontecer em qualquer mês. Fazemos o contato com o escritório anterior."),
              ("Como os honorários são calculados?", "Pelo regime tributário, número de colaboradores, volume de notas e serviços contratados. A proposta sai por escrito."),
              ("Vocês atendem empresas fora de Belo Horizonte?", "Sim. Atendemos remotamente em todo o Brasil, com reuniões por vídeo."),
              ("Quem será o responsável pela minha empresa?", "Um contador com registro ativo no CRC, apresentado na proposta e presente nas reuniões de resultado.")])}
      </div>
    </section>

''' + cta()

    contato = f'''    <section class="page-hero" aria-labelledby="titulo">
      <div class="container" data-reveal>
        <p class="kicker">Contato</p>
        <h1 id="titulo">Fale com a Arrimo.</h1>
        <p class="lead">Atendimento de segunda a sexta, das 8h às 18h, presencial em Belo Horizonte ou por vídeo.</p>
      </div>
    </section>

''' + contact_section(m, 'proposta', 'ct', 'Proposta', 'Solicite uma proposta.', 'Conte um pouco sobre a empresa. Um contador retorna em até um dia útil para agendar o diagnóstico, sem custo.')

    write(t, 'index.html', page(m, 'index.html', 'Arrimo Contabilidade — Contabilidade consultiva em Belo Horizonte',
        'Contabilidade mensal, planejamento tributário, departamento pessoal e BPO financeiro para pequenas e médias empresas. Solicite uma proposta.', index))
    write(t, 'sobre.html', page(m, 'sobre.html', 'Sobre a Arrimo — Contabilidade consultiva desde 2009',
        'Conheça a Arrimo Contabilidade: história, valores e como fazemos a transição do seu escritório anterior em até 30 dias, sem interromper nada.', sobre))
    write(t, 'servicos.html', page(m, 'servicos.html', 'Serviços — Arrimo Contabilidade para PMEs',
        'Contabilidade mensal, planejamento tributário, departamento pessoal, BPO financeiro, abertura de empresas e regularização fiscal e trabalhista.', servicos))
    write(t, 'contato.html', page(m, 'contato.html', 'Contato — Solicite uma proposta à Arrimo Contabilidade',
        'Fale com a Arrimo Contabilidade por telefone, WhatsApp ou e-mail, ou solicite uma proposta. Um contador retorna em até um dia útil, sem custo.', contato))
    write(t, 'privacidade.html', simple_page(m, 'privacidade.html', 'Política de privacidade — Arrimo Contabilidade',
        'Como a Arrimo Contabilidade trata os dados enviados pelo formulário de proposta: finalidade, armazenamento, compartilhamento e direitos.', privacy_inner(t)))
    write(t, '404.html', notfound(m, 'Página não encontrada — Arrimo Contabilidade', 'Esta página não está nos nossos registros.', 'O endereço que você procurou não existe. Na página inicial você encontra os serviços e o contato.'))

# ---------------------------------------------------------------- páginas auxiliares
def privacy_inner(t):
    """Texto jurídico de cada modelo (tools/templates/base/privacidade-<modelo>.html)."""
    inner = (BASE / f'privacidade-{t}.html').read_text()
    return '      ' + inner.strip() + '\n      <a class="btn btn--primary" href="./">Voltar para a página inicial</a>'

def notfound(m, title, h1, text):
    # 404 com caminhos absolutos: funciona em qualquer endereço do site
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{E(title)}</title>
  <meta name="robots" content="noindex">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <main id="conteudo" class="page">
    <div class="container">
      <p class="kicker">Erro 404</p>
      <h1>{E(h1)}</h1>
      <p>{E(text)}</p>
      <a class="btn btn--primary" href="/">Voltar para a página inicial</a>
    </div>
  </main>
</body>
</html>
'''

def write(t, name, content):
    (REPO / 'templates' / t / name).write_text(content)

if __name__ == '__main__':
    for t in ('landing', 'portfolio', 'institucional'):
        shutil.copy(BASE / 'styles.css', REPO / 'templates' / t / 'css/styles.css')
        shutil.copy(BASE / 'main.js', REPO / 'templates' / t / 'js/main.js')
        shutil.copy(BASE / f'tokens-{t}.css', REPO / 'templates' / t / 'css/tokens.css')
    landing(); portfolio(); institucional()
    print('modelos gerados: landing (1 página), portfolio (1 página), institucional (4 páginas)')
