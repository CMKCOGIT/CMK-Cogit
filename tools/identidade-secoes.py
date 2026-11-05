"""Aplica a identidade visual (2026) ao HTML sem mudar textos:
- classe tone-* em cada <section> filha direta de <main> (ritmo papel / cinza / tinta / branco / Marinho);
- <span class="t-tone"> na segunda parte de H1 e H2 (diferença de cor no título).
Idempotente: rodar de novo não duplica nada. Uso: python3 tools/identidade-secoes.py
A home (index.html) tem estrutura própria e fica de fora."""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = [p for p in list(ROOT.glob('*.html')) + list(ROOT.glob('solucoes/*.html')) if p.name != 'index.html' or p.parent.name == 'solucoes']
HERO = re.compile(r'(hero|configurator-hero|solution-hero)')  # page-help: cabeçalho escuro via CSS (.help-head)
CTA = re.compile(r'(cta-final|si-final-cta|about-cta|help-contato)')
CYCLE = ['tone-paper', 'tone-grey', 'tone-ink', 'tone-white', 'tone-grey', 'tone-ink', 'tone-paper']
CONECT = {'para', 'que', 'com', 'em', 'sem', 'de', 'do', 'da', 'no', 'na', 'ao', 'à', 'e', 'pelo', 'pela', 'nos', 'nas'}

def tone_title(inner):
    if 't-tone' in inner or re.search(r'<(?!br\b)[a-z]', inner):
        return inner
    txt = inner.strip()
    m = re.search(r'([.?!:])\s+(?=\S)', txt[:-1])
    if m:
        i = m.end()
        return txt[:i] + '<span class="t-tone">' + txt[i:] + '</span>'
    if ',' in txt[:-1]:
        i = txt.index(',') + 1
        return txt[:i] + ' <span class="t-tone">' + txt[i:].lstrip() + '</span>'
    words = txt.split(' ')
    if len(words) >= 5:
        for i in range(2, len(words) - 1):
            if words[i].lower() in CONECT:
                return ' '.join(words[:i]) + ' <span class="t-tone">' + ' '.join(words[i:]) + '</span>'
    return inner

def process(path):
    src = path.read_text(encoding='utf-8')
    m = re.search(r'(<main\b[^>]*>)(.*)(</main>)', src, re.S)
    if not m:
        return False
    body = m.group(2)
    # seções filhas diretas de <main>: profundidade de <section> = 0
    out, depth, idx, pos = [], 0, 0, 0
    sections = []
    for tag in re.finditer(r'<(/?)section\b([^>]*)>', body):
        if tag.group(1):
            depth -= 1
            continue
        if depth == 0:
            sections.append(tag)
        depth += 1
    n = len(sections)
    tones = []
    mid = 0
    for k, tag in enumerate(sections):
        cls = re.search(r'class="([^"]*)"', tag.group(2))
        cls = cls.group(1) if cls else ''
        if 'page-legal' in cls:
            tones.append('tone-paper')
        elif k == 0 and HERO.search(cls):
            tones.append('tone-ink')
        elif CTA.search(cls) and k == n - 1 or (k == n - 1 and 'cta' in cls):
            tones.append('tone-navy')
        else:
            tones.append(CYCLE[mid % len(CYCLE)]); mid += 1
    for k in range(len(tones) - 1):
        if tones[k] == 'tone-ink' and tones[k + 1] in ('tone-ink', 'tone-navy'):
            tones[k] = 'tone-grey'
        if k > 0 and tones[k] == 'tone-ink' and tones[k - 1] == 'tone-ink':
            tones[k] = 'tone-white'
    for tag, tone in zip(sections, tones):
        attrs = tag.group(2)
        if 'tone-' in attrs:
            new = tag.group(0)
        elif 'class="' in attrs:
            new = tag.group(0).replace('class="', f'class="{tone} ', 1)
        else:
            new = tag.group(0).replace('<section', f'<section class="{tone}"', 1)
        out.append(body[pos:tag.start()]); out.append(new); pos = tag.end()
    out.append(body[pos:])
    body = ''.join(out)
    legal = 'page-legal' in body
    def h(mt):
        if legal and mt.group(1) == '2':
            return mt.group(0)
        return f'<h{mt.group(1)}{mt.group(2)}>' + tone_title(mt.group(3)) + f'</h{mt.group(1)}>'
    body = re.sub(r'<h([12])(\b[^>]*)>(.*?)</h\1>', h, body, flags=re.S)
    new = src[:m.start(2)] + body + src[m.end(2):]
    if new != src:
        path.write_text(new, encoding='utf-8')
        return True
    return False

if __name__ == '__main__':
    for p in sorted(PAGES):
        if process(p):
            print('atualizado', p.relative_to(ROOT))
