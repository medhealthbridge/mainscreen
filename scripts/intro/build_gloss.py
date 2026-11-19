"""Violet glow + sheen mask from the bridge's own silhouette (the layers' alpha).
Usage: python3 -I build_gloss.py <layers dir with layers.json + PNGs> <outdir>"""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, out = sys.argv[1:3]
m = json.load(open(f'{src}/layers.json')); W, H = m['size']
alpha = np.zeros((H, W), np.float32)
def add(name, box):
    a = np.asarray(Image.open(f'{src}/{name}.png'))[..., 3].astype(np.float32) / 255
    x, y, w, h = box
    alpha[y:y + h, x:x + w] = np.maximum(alpha[y:y + h, x:x + w], a)
for n, b in m['layers'].items(): add(n, b)
add('joint', m['joint'])
# soft violet glow around the structure (half resolution; it is blurred anyway)
small = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).resize((W // 2, H // 2), Image.LANCZOS)).astype(np.float32) / 255
g = ndi.gaussian_filter(small, 9) * 0.75 + ndi.gaussian_filter(small, 22) * 0.6
g = np.clip(g / g.max(), 0, 1) ** 1.1
violet = np.array([150, 104, 255], np.float32)
rgba = np.dstack([np.broadcast_to(violet, g.shape + (3,)), g * 255]).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(f'{out}/glow.webp', quality=80, alpha_quality=80, method=6)
# sheen mask: the silhouette itself (white with the bridge's alpha)
ms = np.dstack([np.full(small.shape + (3,), 255, np.uint8), (small * 255).astype(np.uint8)])
Image.fromarray(ms, 'RGBA').save(f'{out}/mask.webp', quality=85, alpha_quality=90, method=6)
print('ok', W // 2, H // 2)
