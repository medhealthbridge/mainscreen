"""Turn the two supplied bridge renders into intro layers (no redrawing: every layer
is cut from the supplied pixels). Usage: python3 -I build_layers.py <open.png> <closed.png> <outdir>"""
import sys, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

open_p, closed_p, out = sys.argv[1:4]
A = np.asarray(Image.open(open_p).convert('RGB')).astype(np.float32)
B = np.asarray(Image.open(closed_p).convert('RGB')).astype(np.float32)
H, W, _ = A.shape

def save_rgba(rgb, alpha, name, q=82):
    ys, xs = np.where(alpha > 2)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    x0, y0 = max(0, x0 - 2), max(0, y0 - 2); x1, y1 = min(W, x1 + 2), min(H, y1 + 2)
    rgba = np.dstack([np.clip(rgb, 0, 255), np.clip(alpha, 0, 255)]).astype(np.uint8)[y0:y1, x0:x1]
    Image.fromarray(rgba, 'RGBA').save(f'{out}/{name}.webp', quality=q, alpha_quality=95, method=6)
    Image.fromarray(rgba, 'RGBA').save(f'{out}/{name}.png')
    return [int(x0), int(y0), int(x1 - x0), int(y1 - y0)]

# 1 · the floating piece in the open frame (lime body + its dark-lime underside)
yy, xx = np.mgrid[0:H, 0:W]
region = (xx >= 780) & (xx <= 1015) & (yy >= 500) & (yy <= 598)
gb = A[..., 1] - A[..., 2]
piece_core = region & ((gb > 16) | (A.mean(axis=2) > 40))
piece_core = ndi.binary_opening(piece_core, iterations=1)
lab, n = ndi.label(piece_core); sizes = ndi.sum(piece_core, lab, range(1, n + 1))
piece_core = lab == (1 + int(np.argmax(sizes)))
piece_hard = ndi.binary_fill_holes(piece_core)

# 2 · open frame with the piece removed: fill each masked row from the background beside it
remove = ndi.binary_dilation(piece_hard, iterations=4)
A2 = A.copy()
for y in np.where(remove.any(axis=1))[0]:
    xs = np.where(remove[y])[0]
    lx, rx = xs.min() - 1, xs.max() + 1
    left = np.median(A[y, max(0, lx - 12):lx], axis=0); right = np.median(A[y, rx:rx + 12], axis=0)
    t = (xs - lx) / max(1, rx - lx)
    A2[y, xs] = left[None] * (1 - t[:, None]) + right[None] * t[:, None]

# 3 · empty backdrop: a smooth surface (polynomial in x, y) fitted only to pixels well
#     clear of the bridge, so no trace of the structure is baked into it.
Lum = A2.mean(axis=2)
bridge = ndi.binary_dilation((Lum > 44) | ((A2[..., 1] - A2[..., 2]) > 30), iterations=6)
far = ~ndi.binary_dilation(bridge, iterations=26)
def basis(x, y, deg=5):
    return np.stack([(x ** i) * (y ** j) for i in range(deg + 1) for j in range(deg + 1 - i)], -1)
step = 3
ys_, xs_ = np.where(far[::step, ::step]); ys_ *= step; xs_ *= step
Xn, Yn = xs_ / W - .5, ys_ / H - .5
M = basis(Xn, Yn)
gx, gy = np.meshgrid(np.arange(W) / W - .5, np.arange(H) / H - .5)
G = basis(gx.ravel(), gy.ravel())
plate = np.stack([(G @ np.linalg.lstsq(M, A2[ys_, xs_, c], rcond=None)[0]).reshape(H, W) for c in range(3)], -1)
plate = np.clip(plate, 0, 255)
Image.fromarray(np.clip(plate, 0, 255).astype(np.uint8)).resize((W // 2, H // 2), Image.LANCZOS).save(f'{out}/plate.webp', quality=70)
Image.fromarray(np.clip(plate, 0, 255).astype(np.uint8)).save(f'{out}/plate.png')

# 4 · bridge alpha against the backdrop, colours un-mixed so layers composite back exactly
diff = np.abs(A2 - plate).max(axis=2)
alpha = np.clip((diff - 5.0) / 18.0, 0, 1)
near = ndi.gaussian_filter(ndi.binary_dilation(bridge, iterations=12).astype(np.float32), 5)
alpha = alpha * near
alpha = np.where(alpha < 0.04, 0, alpha)
a3 = np.maximum(alpha, 1e-3)[..., None]
colour = (A2 - (1 - alpha[..., None]) * plate) / a3

# 5 · partition: pylons vs their cable fans + deck halves (split at the joint)
def poly_mask(pts):
    im = Image.new('L', (W, H), 0); ImageDraw.Draw(im).polygon(pts, fill=255); return np.asarray(im) > 0
left_pylon = poly_mask([(0, 0), (384, 0), (346, 170), (340, 240), (333, 312), (322, 382), (310, 458), (298, 540), (288, 600), (270, 626), (262, 700), (248, H), (0, H)])
right_pylon = poly_mask([(W, 0), (1372, 0), (1390, 236), (1398, 440), (1428, 579), (1424, 640), (1392, 700), (1372, H), (W, H)])
split = 900
fan_left = (~left_pylon) & (xx < split)
fan_right = (~right_pylon) & (xx >= split) & (~left_pylon)
meta = {'size': [W, H], 'layers': {}}
for name, m in (('pylon-left', left_pylon), ('fan-left', fan_left), ('pylon-right', right_pylon), ('fan-right', fan_right)):
    meta['layers'][name] = save_rgba(colour, alpha * m * 255, name)

# 6 · the piece sprite (soft matte from the supplied pixels)
pm = ndi.gaussian_filter(piece_hard.astype(np.float32), 0.8)
pd = np.abs(A - plate).max(axis=2)
p_alpha = np.clip(pm * np.clip((pd - 2) / 14, 0, 1) * 1.25, 0, 1) * (ndi.binary_dilation(piece_hard, iterations=2))
pa3 = np.maximum(p_alpha, 1e-3)[..., None]
p_col = (A - (1 - p_alpha[..., None]) * plate) / pa3
meta['piece'] = save_rgba(p_col, p_alpha * 255, 'piece', q=88)

# 7 · the seated joint from the closed frame only (aligned, feathered), so nothing else moves
best = None
ring = ndi.binary_dilation((B[..., 1] - B[..., 2] > 45) & (yy > 595), iterations=18) & ~ndi.binary_dilation((B[..., 1] - B[..., 2] > 45) & (yy > 595), iterations=6) & ~remove
for dy in range(-3, 4):
    for dx in range(-3, 4):
        Bs = np.roll(np.roll(B, dy, 0), dx, 1)
        e = np.abs(Bs[ring] - A2[ring]).mean()
        if best is None or e < best[0]: best = (e, dx, dy)
_, sdx, sdy = best
Bs = np.roll(np.roll(B, sdy, 0), sdx, 1)
seated = (Bs[..., 1] - Bs[..., 2] > 40) & (yy > 590) & (yy < 700) & (xx > 790) & (xx < 1020)
seated = ndi.binary_fill_holes(ndi.binary_closing(seated, iterations=2))
notch = (xx >= 840) & (xx <= 960) & (yy >= 598) & (yy <= 690) & (np.abs(A2 - Bs).max(axis=2) > 18)
patch = ndi.binary_dilation(seated | (notch & ndi.binary_dilation(seated, iterations=10)), iterations=4)
patch_a = ndi.gaussian_filter(patch.astype(np.float32), 2.2)
meta['joint'] = save_rgba(Bs, patch_a * 255, 'joint', q=90)
meta['jointShift'] = [int(sdx), int(sdy)]

# deck top edge (for the highlight) and the seated piece's stepped edge
meta['deckLine'] = [[265, 631], [845, 604], [955, 602], [1440, 580]]
ys, xs = np.where(seated); meta['seatedBox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
ys, xs = np.where(piece_hard); meta['pieceBox'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]

# check: layers over the backdrop rebuild the open frame (minus the piece)
recon = plate * (1 - alpha[..., None]) + colour * alpha[..., None]
meta['reconError'] = float(np.abs(recon - A2).mean())
json.dump(meta, open(f'{out}/layers.json', 'w'), indent=1)
print(json.dumps(meta))
