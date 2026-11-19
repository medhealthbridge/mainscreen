import sys
sys.setrecursionlimit(20000)
"""Signature for the intro: "Databridge" set in Mrs Saint Delafield (SIL OFL), plus a long
tapered underline swash, and the pen path through it (the letters' centre line in writing
order) used to reveal the ink as if written. Usage: build_sig.py <font.ttf> <out.json>"""
import sys, json, math, subprocess
import numpy as np
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from skimage.morphology import skeletonize
from scipy import ndimage as ndi
from PIL import Image

font_p, out_p = sys.argv[1:3]
TEXT = "Databridge"
f = TTFont(font_p); cmap = f.getBestCmap(); gs = f.getGlyphSet(); hmtx = f['hmtx']
upm = f['head'].unitsPerEm
S = 0.2  # font units -> working units
pen = SVGPathPen(gs)
x = 0
kern = {}
for ch in TEXT:
    g = cmap[ord(ch)]
    gs[g].draw(TransformPen(pen, (S, 0, 0, -S, x * S, 0)))
    x += hmtx[g][0]
ink = pen.getCommands()

# --- rasterise the ink to find the centre line ------------------------------------------
from fontTools.pens.boundsPen import BoundsPen
bp = BoundsPen(gs); x = 0
for ch in TEXT:
    g = cmap[ord(ch)]; gs[g].draw(TransformPen(bp, (1, 0, 0, 1, x, 0))); x += hmtx[g][0]
xmin, ymin, xmax, ymax = [v * S for v in bp.bounds]
# working units: x right, y down (y = -font_y * S)
bx0, by0, bx1, by1 = xmin, -ymax, xmax, -ymin
R = 6  # raster px per working unit
pad = 8
Wpx, Hpx = int((bx1 - bx0 + 2 * pad) * R), int((by1 - by0 + 2 * pad) * R)
svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{Wpx}" height="{Hpx}" viewBox="{bx0-pad} {by0-pad} {bx1-bx0+2*pad} {by1-by0+2*pad}"><rect x="{bx0-pad}" y="{by0-pad}" width="100%" height="100%" fill="#000"/><path d="{ink}" fill="#fff"/></svg>'
open('ink.svg', 'w').write(svg)
subprocess.run(['node', '-e', f'''const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:{Wpx},height:{Hpx}}}}});await p.goto('file://'+process.cwd()+'/ink.svg');await p.screenshot({{path:'ink.png'}});await b.close();}})()'''], check=True)
img = np.asarray(Image.open('ink.png').convert('L')) > 127
dist = ndi.distance_transform_edt(img)
sk = skeletonize(img)

# --- skeleton graph -----------------------------------------------------------------------
ys, xs = np.nonzero(sk); pts = set(zip(ys.tolist(), xs.tolist()))
N8 = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
nb = lambda p: [(p[0]+a, p[1]+b) for a, b in N8 if (p[0]+a, p[1]+b) in pts]
deg = {p: len(nb(p)) for p in pts}
nodes = {p for p in pts if deg[p] != 2}
# chains between nodes
edges = []; seen = set()
for n in nodes:
    for q in nb(n):
        if (n, q) in seen: continue
        chain = [n, q]; prev, cur = n, q
        while cur not in nodes:
            nxt = [r for r in nb(cur) if r != prev and r not in chain[-3:]]
            if not nxt: break
            prev, cur = cur, nxt[0]; chain.append(cur)
        seen.add((n, chain[1])); seen.add((chain[-1], chain[-2]))
        edges.append(chain)
# isolated loops (cycles with no node)
covered = {p for e in edges for p in e}
rest = pts - covered
while rest:
    s = min(rest, key=lambda p: p[1]); chain = [s]; prev, cur = None, s
    while True:
        nxt = [r for r in nb(cur) if r != prev and r in rest and r not in chain]
        if not nxt: break
        prev, cur = cur, nxt[0]; chain.append(cur)
    chain.append(s); edges.append(chain); rest -= set(chain)
# prune short spurs (skeleton noise at stroke ends)
def is_spur(e): return (deg.get(e[0], 2) == 1 or deg.get(e[-1], 2) == 1) and len(e) < 2.2 * R and not (deg.get(e[0],2)==1 and deg.get(e[-1],2)==1)
edges = [e for e in edges if not is_spur(e)]

# --- writing-order traversal: left to right, continue as straight as possible ------------
adj = {}
for i, e in enumerate(edges):
    adj.setdefault(e[0], []).append((i, False)); adj.setdefault(e[-1], []).append((i, True))
used = [False] * len(edges)
def heading(chain, rev, at_end):
    c = chain[::-1] if rev else chain
    a, b = (c[-6] if len(c) > 6 else c[0], c[-1]) if at_end else (c[0], c[5] if len(c) > 5 else c[-1])
    return math.atan2(b[0] - a[0], b[1] - a[1])
strokes = []  # list of point lists (pen down), jumps between them are pen lifts
def walk(start):
    path = []; node = start; head = 0.0
    while True:
        opts = [(i, r) for i, r in adj.get(node, []) if not used[i]]
        if not opts:
            # retrace to the nearest node (by graph distance) that still has unused edges
            target = None; prevmap = {node: None}; q = [node]
            while q and target is None:
                nq = []
                for n in q:
                    for i, r in adj.get(n, []):
                        m = edges[i][0] if r else edges[i][-1]
                        if m in prevmap: continue
                        prevmap[m] = (n, i, r); nq.append(m)
                        if any(not used[j] for j, _ in adj.get(m, [])): target = m; break
                    if target is not None: break
                q = nq
            if target is None: return path
            back = []; m = target
            while prevmap[m] is not None:
                n, i, r = prevmap[m]; c = edges[i][::-1] if r else edges[i]; back.append(c); m = n
            for c in reversed(back): path.extend(c)
            node = target; continue
        best = min(opts, key=lambda o: abs((heading(edges[o[0]], o[1], False) - head + math.pi) % (2 * math.pi) - math.pi))
        i, r = best; used[i] = True; c = edges[i][::-1] if r else edges[i]
        path.extend(c); head = heading(edges[i], r, True); node = c[-1]
while not all(used):
    cands = [p for i, e in enumerate(edges) if not used[i] for p in (e[0], e[-1])]
    start = min(cands, key=lambda p: (p[1], p[0]))
    # prefer starting at a free end (degree 1) near the leftmost point
    ends = [p for p in cands if deg.get(p, 2) == 1 and p[1] < start[1] + 4 * R]
    if ends: start = min(ends, key=lambda p: p[1])
    s = walk(start)
    if s: strokes.append(s)

# --- simplify + convert to working units --------------------------------------------------
def rdp(P, eps):
    if len(P) < 3: return P
    a, b = np.array(P[0], float), np.array(P[-1], float); ab = b - a; L = np.hypot(*ab) or 1
    Q = np.array(P, float) - a; d = np.abs(ab[0] * Q[:, 1] - ab[1] * Q[:, 0]) / L
    i = int(np.argmax(d))
    return rdp(P[:i + 1], eps)[:-1] + rdp(P[i:], eps) if d[i] > eps else [P[0], P[-1]]
def to_w(p): return ((p[1] / R) + bx0 - pad, (p[0] / R) + by0 - pad)
def cr(P):
    d = 'M%.1f %.1f' % P[0]
    for i in range(len(P) - 1):
        p0 = P[i - 1] if i else P[i]; p1, p2 = P[i], P[i + 1]; p3 = P[i + 2] if i + 2 < len(P) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6); c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += 'C%.1f %.1f %.1f %.1f %.1f %.1f' % (c1 + c2 + p2)
    return d
# end the writing at the exit stroke of the final letter (rightmost free end), retracing
# along the ink to get there, so the swash grows out of the "e"
ends = [p for p in pts if deg[p] == 1]
E = max(ends, key=lambda p: p[1] - 0.3 * p[0])
from collections import deque
# write the stroke that reaches the final letter last (dots and short marks go before it)
def reaches(st):
    seen_ = {st[-1]}; dq_ = deque([st[-1]])
    while dq_:
        c = dq_.popleft()
        if c == E: return True
        for q in nb(c):
            if q not in seen_: seen_.add(q); dq_.append(q)
    return False
k_last = max((k for k, st in enumerate(strokes) if reaches(st)), key=lambda k: len(strokes[k]))
strokes.append(strokes.pop(k_last))
src_ = strokes[-1][-1]; prev_ = {src_: None}; dq = deque([src_])
while dq:
    c = dq.popleft()
    if c == E: break
    for q in nb(c):
        if q not in prev_: prev_[q] = c; dq.append(q)
if E in prev_:
    back = []; c = E
    while c is not None: back.append(c); c = prev_[c]
    strokes[-1] = strokes[-1] + back[::-1][1:]
for k, st in enumerate(strokes):
    print('stroke', k, 'pixels', len(st), 'start', to_w(st[0]), 'end', to_w(st[-1]), 'xrange', round(min(p[1] for p in st)/R+bx0-pad), round(max(p[1] for p in st)/R+bx0-pad))
pen_strokes = [[to_w(p) for p in rdp(s, 2.2)] for s in strokes]

# --- long tapered underline swash from the end of the final stroke -----------------------
last = pen_strokes[-1][-1]
base_y = 0.0  # baseline in working units (font y=0)
width = bx1 - bx0
sx, sy = last
pts_sw = []
for t in np.linspace(0, 1, 60):
    # dip under the baseline, then a long, almost flat run to the right
    X = sx + t * width * 0.62
    Y = sy + (base_y + 0.12 * (by1 - by0) - sy) * math.sin(min(1, t * 2.2) * math.pi / 2) - 0.03 * (by1 - by0) * t
    pts_sw.append((X, Y))
pen_strokes[-1] = pen_strokes[-1] + pts_sw[1:]
# filled, tapered shape for the swash (ink)
thick = float(np.median(dist[sk])) / R * 2.0
left, right = [], []
for i, (X, Y) in enumerate(pts_sw):
    a = pts_sw[max(0, i - 1)]; b = pts_sw[min(len(pts_sw) - 1, i + 1)]
    nx, ny = -(b[1] - a[1]), (b[0] - a[0]); L = math.hypot(nx, ny) or 1; nx, ny = nx / L, ny / L
    t = i / (len(pts_sw) - 1); w = thick * (0.9 * (1 - t) ** 1.4 + 0.08) / 2
    left.append((X + nx * w, Y + ny * w)); right.append((X - nx * w, Y - ny * w))
swash = 'M' + 'L'.join('%.1f %.1f' % p for p in left + right[::-1]) + 'Z'

maxw = float(dist.max()) / R * 2
xs_all = [p[0] for s in pen_strokes for p in s]; ys_all = [p[1] for s in pen_strokes for p in s]
vb = [min(bx0, min(xs_all)) - 4, min(by0, min(ys_all)) - 4]
vb += [max(bx1, max(xs_all)) + 4 - vb[0], max(by1, max(ys_all)) + 4 - vb[1]]
out = {'ink': ink, 'swash': swash, 'pen': ''.join(cr(s) for s in pen_strokes), 'penWidth': round(maxw * 1.25 + 1.2, 2),
       'viewBox': ' '.join('%.1f' % v for v in vb), 'strokes': len(pen_strokes), 'end': [round(pen_strokes[-1][-1][0], 1), round(pen_strokes[-1][-1][1], 1)]}
json.dump(out, open(out_p, 'w'))
print({k: (v if k in ('penWidth', 'viewBox', 'strokes') else len(v)) for k, v in out.items()})
