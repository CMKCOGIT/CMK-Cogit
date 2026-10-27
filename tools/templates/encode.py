"""Codifica uma captura PNG nas larguras e formatos pedidos por render-art.mjs."""
import json
import os
import sys

from PIL import Image

job = json.loads(sys.argv[1])
src = Image.open(job["png"]).convert("RGB")
os.makedirs(job["outDir"], exist_ok=True)
written = []


def resized(width):
    if width >= src.width:
        return src
    height = round(src.height * width / src.width)
    return src.resize((width, height), Image.LANCZOS)


for width in job["widths"]:
    img = resized(width)
    for fmt in job["formats"]:
        path = os.path.join(job["outDir"], f'{job["base"]}-{width}.{fmt}')
        if fmt == "avif":
            img.save(path, "AVIF", quality=58, speed=4)
        elif fmt == "webp":
            img.save(path, "WEBP", quality=80, method=6)
        written.append((path, os.path.getsize(path)))

if job["jpg"]:
    name = job["jpgName"] or f'{job["base"]}-{job["jpg"]}.jpg'
    path = os.path.join(job["outDir"], name)
    resized(job["jpg"]).save(path, "JPEG", quality=82, optimize=True, progressive=True)
    written.append((path, os.path.getsize(path)))

if job["icons"]:
    for size in (180, 192, 512):
        path = os.path.join(job["outDir"], f"icon-{size}.png")
        src.resize((size, size), Image.LANCZOS).save(path, "PNG", optimize=True)
        written.append((path, os.path.getsize(path)))

for path, size in written:
    print(f"{os.path.relpath(path)}  {size // 1024} KB")
