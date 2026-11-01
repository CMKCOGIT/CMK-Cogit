"""favicon.ico (16/32/48) a partir de assets/brand/png/favicon-*.png. Uso: python3 tools/brand/make-ico.py"""
import os
from PIL import Image
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
imgs = [Image.open(os.path.join(root, f'assets/brand/png/favicon-{s}.png')).convert('RGBA') for s in (48, 32, 16)]
imgs[0].save(os.path.join(root, 'favicon.ico'), sizes=[(48, 48), (32, 32), (16, 16)], append_images=imgs[1:])
print('favicon.ico ok')
