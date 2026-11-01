"""Gera os SVGs do logo CMKCOGIT (rebrand 2026) com o wordmark vetorizado.
Uso: python3 tools/brand/build-logos.py   (requer: pip install fonttools brotli)
Saída: assets/brand/logo/*.svg e favicon.svg
Wordmark: Anybody (OFL) em wdth 150 / wght 850, convertido em contornos.
"""
import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'brand', 'logo')
os.makedirs(OUT, exist_ok=True)

INK, PAPER, ELETRICO, COBALTO = '#0A0F1E', '#F1F4FA', '#4DA8FF', '#2D4FFF'

font = instantiateVariableFont(TTFont(os.path.join(ROOT, 'assets/fonts/anybody-var.woff2')), {'wdth': 150, 'wght': 850})
gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font['hmtx']
TRACK = -20  # unidades (upm 2000): leve aperto óptico

def word(text, x0=0):
    pen, bp, x = SVGPathPen(gs), BoundsPen(gs), x0
    for ch in text:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
        gs[g].draw(TransformPen(bp, (1, 0, 0, -1, x, 0)))
        x += hmtx[g][0] + TRACK
    return pen.getCommands(), x - TRACK, bp.bounds  # bounds em y invertido

cmk_d, cmk_w, cmk_b = word('cmk')
cog_d, cog_w, cog_b = word('cogit', cmk_w + TRACK)
total_w = cog_w
top = min(cmk_b[1], cog_b[1]); bottom = max(cmk_b[3], cog_b[3])  # ascendente do k/t, descendente do g
XH = font['OS/2'].sxHeight

# Símbolo "C-cursor" em grade 64: moldura em C (interface) + cursor (o pensamento antes do código)
C_PATH = 'M52 8H24A16 16 0 0 0 8 24V40A16 16 0 0 0 24 56H52V46H24A6 6 0 0 1 18 40V24A6 6 0 0 1 24 18H52Z'
CURSOR = (32, 23, 9, 18)

def symbol_group(c, cur, scale=1, tx=0, ty=0, cls=''):
    x, y, w, h = CURSOR
    return (f'<g transform="translate({tx:.2f} {ty:.2f}) scale({scale:.4f})">'
            f'<path d="{C_PATH}" fill="{c}"/>'
            f'<rect class="cmk-cursor{cls}" x="{x}" y="{y}" width="{w}" height="{h}" fill="{cur}"/></g>')

def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-labelledby="t">'
            f'<title id="t">{title}</title>{body}</svg>\n')

def save(name, content):
    with open(os.path.join(OUT, name), 'w') as f: f.write(content)

variants = {
    'dark':       dict(a=PAPER, b=ELETRICO,  s=PAPER, cur=ELETRICO),   # para fundos escuros (principal)
    'light':      dict(a=INK,   b=COBALTO, s=INK,   cur=COBALTO),  # para fundos claros
    'mono-white': dict(a='#FFFFFF', b='#FFFFFF', s='#FFFFFF', cur='#FFFFFF'),
    'mono-black': dict(a='#000000', b='#000000', s='#000000', cur='#000000'),
}

pad = 0
word_h = bottom - top
for key, v in variants.items():
    # wordmark
    body = (f'<g transform="translate(0 {-top:.0f})"><path d="{cmk_d}" fill="{v["a"]}"/><path d="{cog_d}" fill="{v["b"]}"/></g>')
    save(f'cmkcogit-wordmark-{key}.svg', svg(total_w, word_h, body, 'CMKCOGIT'))
    # horizontal: símbolo com a moldura (48 de 64) = altura de ascendente até a linha de base
    asc = -min(cmk_b[1], cog_b[1])
    desc = max(cmk_b[3], cog_b[3])
    frame_h = asc + desc * 0.55  # a moldura desce um pouco abaixo da linha de base (equilíbrio óptico com o g)
    sym_scale = frame_h / 48
    gap = XH * 0.40
    sx = -8 * sym_scale  # moldura começa em x=8 da grade
    sy = -asc - 8 * sym_scale
    w = 48 * sym_scale + gap + total_w
    body = (symbol_group(v['s'], v['cur'], sym_scale, sx, sy - top) +
            f'<g transform="translate({48*sym_scale+gap:.0f} {-top:.0f})"><path d="{cmk_d}" fill="{v["a"]}"/><path d="{cog_d}" fill="{v["b"]}"/></g>')
    save(f'cmkcogit-horizontal-{key}.svg', svg(w, word_h, body, 'CMKCOGIT'))
    # empilhado
    sw = total_w * 0.34
    sc = sw / 64
    body = (symbol_group(v['s'], v['cur'], sc, (total_w - sw) / 2, 0) +
            f'<g transform="translate(0 {sw + XH*0.5 - top:.0f})"><path d="{cmk_d}" fill="{v["a"]}"/><path d="{cog_d}" fill="{v["b"]}"/></g>')
    save(f'cmkcogit-stacked-{key}.svg', svg(total_w, sw + XH * 0.5 + word_h, body, 'CMKCOGIT'))
    # símbolo
    save(f'cmkcogit-symbol-{key}.svg', svg(64, 64, symbol_group(v['s'], v['cur']), 'CMKCOGIT'))

# ícones de app (quadrado arredondado)
def app(bg, c, cur):
    return svg(64, 64, f'<rect width="64" height="64" rx="15" fill="{bg}"/>' + symbol_group(c, cur, 0.72, 64*0.14+1.2, 64*0.14), 'CMKCOGIT')
save('cmkcogit-app-ink.svg', app(INK, PAPER, ELETRICO))
save('cmkcogit-app-eletrico.svg', app(ELETRICO, INK, INK))
save('cmkcogit-app-cobalto.svg', app(COBALTO, PAPER, ELETRICO))
with open(os.path.join(ROOT, 'favicon.svg'), 'w') as f: f.write(app(INK, PAPER, ELETRICO))

# wordmark animável (inline no site): caminhos separados para o brand intro
with open(os.path.join(OUT, 'paths.json'), 'w') as f:
    import json
    json.dump({'cmk': cmk_d, 'cogit': cog_d, 'width': total_w, 'top': top, 'height': word_h, 'symbol': C_PATH, 'cursor': CURSOR}, f)
print('ok', OUT, round(total_w), round(word_h))
