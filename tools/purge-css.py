"""Remove do CSS do site as regras cujos seletores não correspondem a nenhuma classe/id usada.

Uso: python3 tools/purge-css.py [--write] css/sections.css css/responsive.css ...
Sem --write, só relata. Considera classes montadas no JS por prefixo (`state-${n}`, 'is-' + x)
e alternativas dentro de :is()/:where(). Ferramenta de manutenção; não vai para a hospedagem.
"""
import glob
import re
import sys

ROOT_GLOBS = ['*.html', 'solucoes/*.html', 'projetos/*.html', 'js/*.js']
source = ''
for pattern in ROOT_GLOBS:
    for f in glob.glob(pattern):
        source += open(f, encoding='utf-8', errors='ignore').read() + '\n'
tokens = set(re.findall(r'[A-Za-z0-9_-]+', source))
# Prefixos de classes montadas dinamicamente: `pre-${x}` ou 'pre-' + x
dynamic = set(re.findall(r'([A-Za-z][A-Za-z0-9_-]*-)\$\{', source))
# o prefixo pode ser a última palavra da string: 'process-visual-graphic state-' + n
dynamic |= set(re.findall(r"([A-Za-z][A-Za-z0-9_-]*-)['\"]\s*\+", source))
dynamic |= set(re.findall(r"([A-Za-z][A-Za-z0-9_-]*-)\$\{", source))
dynamic |= set(re.findall(r'([A-Za-z][A-Za-z0-9_-]*--)\$\{', source))


def name_alive(name):
    return name in tokens or any(name.startswith(p) for p in dynamic)


def simple_alive(sel):
    """Seletor sem :is/:where: todas as classes e ids precisam existir."""
    sel = re.sub(r':not\((?:[^()]|\([^()]*\))*\)', '', sel)  # :not() não exige presença
    sel = re.sub(r'::?[a-z-]+(\([^()]*\))?', '', sel)          # pseudo-classes/elementos
    names = re.findall(r'[.#]([A-Za-z0-9_-]+)', sel)
    return all(name_alive(n) for n in names)


def part_alive(part):
    # Expande :is()/:where()/:has(): basta uma alternativa viva.
    m = re.search(r':(is|where|has)\(((?:[^()]|\([^()]*\))*)\)', part)
    if not m:
        return simple_alive(part)
    alts = [a.strip() for a in split_commas(m.group(2))]
    for alt in alts:
        if part_alive(part[:m.start()] + ' ' + alt + ' ' + part[m.end():]):
            return True
    return False


def split_commas(sel):
    out, depth, cur = [], 0, ''
    for ch in sel:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
    out.append(cur)
    return out


def match_brace(s, i):
    depth = 0
    while i < len(s):
        if s.startswith('/*', i):
            i = s.index('*/', i) + 2
            continue
        if s[i] == '{':
            depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError('chave sem par')


stats = {'removed': 0, 'trimmed': 0}


def process(s):
    out, i = [], 0
    while i < len(s):
        if s[i].isspace():
            out.append(s[i]); i += 1; continue
        if s.startswith('/*', i):
            j = s.index('*/', i) + 2
            out.append(s[i:j]); i = j; continue
        if s[i] == '}':  # resto solto
            out.append(s[i]); i += 1; continue
        if s[i] == '@':
            semi, brace = s.find(';', i), s.find('{', i)
            if semi != -1 and (brace == -1 or semi < brace):
                out.append(s[i:semi + 1]); i = semi + 1; continue
            end = match_brace(s, brace)
            prelude, inner = s[i:brace], s[brace + 1:end]
            if re.match(r'@(media|supports|container|layer)\b', prelude):
                new_inner = process(inner)
                if re.sub(r'/\*.*?\*/|\s', '', new_inner, flags=re.S):
                    out.append(prelude + '{' + new_inner + '}')
            else:
                out.append(s[i:end + 1])
            i = end + 1
            continue
        brace = s.find('{', i)
        end = match_brace(s, brace)
        selector, body = s[i:brace], s[brace:end + 1]
        parts = split_commas(selector)
        alive = [p for p in parts if part_alive(p.strip())]
        if not alive:
            stats['removed'] += 1
            # descarta também a quebra de linha seguinte
            i = end + 1
            while i < len(s) and s[i] in '\r\n' and (i + 1 >= len(s) or s[i + 1] in '\r\n'):
                i += 1
            continue
        if len(alive) < len(parts):
            stats['trimmed'] += 1
            nl = '\r\n' if '\r\n' in selector else '\n'
            lead = re.match(r'\s*', parts[0]).group(0)
            selector = lead + (',' + nl).join(p.strip() for p in alive) + ' '
        out.append(selector + body)
        i = end + 1
    return ''.join(out)


write = '--write' in sys.argv
for path in [a for a in sys.argv[1:] if not a.startswith('--')]:
    raw = open(path, encoding='utf-8', newline='').read()
    before = dict(stats)
    new = process(raw)
    new = re.sub(r'(\r?\n){3,}', lambda m: m.group(1) * 2, new)
    print(f'{path}: {stats["removed"] - before["removed"]} regras removidas, '
          f'{stats["trimmed"] - before["trimmed"]} seletores enxugados, {len(raw) // 1024} KB -> {len(new) // 1024} KB')
    if write:
        open(path, 'w', encoding='utf-8', newline='').write(new)
