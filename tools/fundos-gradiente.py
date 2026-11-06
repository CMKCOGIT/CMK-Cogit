"""Lista regras cujo fundo era só gradiente (background/background-image: *-gradient) sem cor sólida.
A identidade 2026 remove gradientes (css/identity.css); sem cor de apoio esses blocos ficam transparentes.
Uso: python3 tools/fundos-gradiente.py  → imprime seletor | 1ª cor | última cor | opaco?"""
import re, glob, sys
SKIP = {'css/identity.css', 'css/home-v2.css', 'css/fonts.css', 'css/tokens.css'}
COLOR = r'(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|var\(--[\w-]+\)|transparent|white|black)'
out = []
for f in sorted(glob.glob('css/*.css')):
    if f in SKIP or '.min.' in f or f.endswith('style.css'): continue
    css = re.sub(r'/\*.*?\*/', '', open(f).read(), flags=re.S)
    for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', css):
        sel, body = m.group(1).strip(), m.group(2)
        g = re.search(r'background(?:-image)?\s*:\s*([^;]*?(?:linear|radial|conic)-gradient\([^;]*)', body)
        if not g: continue
        if re.search(r'background-color\s*:', body): continue
        if re.search(r'::?(before|after)', sel) and all(re.search(r'::?(before|after)', s) for s in sel.split(',')): continue
        cols = re.findall(COLOR, g.group(1))
        cols = [c for c in cols]
        if not cols: continue
        def opaque(c): return not (c == 'transparent' or (c.startswith('rgba') and float(c.rstrip(')').split(',')[-1]) < .9) or (c.startswith('#') and len(c) in (5, 9)))
        out.append((f, ' '.join(sel.split())[:110], cols[0], cols[-1], opaque(cols[0]) and opaque(cols[-1])))
for r in out: print(' | '.join(map(str, r)))
print(len(out), 'regras', file=sys.stderr)
