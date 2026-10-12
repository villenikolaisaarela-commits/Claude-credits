# python3 proc.py specfile outdir grade
# spec lines: src_id name aspect(w:h or orig) fx fy widths(comma)   -> name-<w>.webp (+ name-<w>.jpg for the largest)
import sys, os
from PIL import Image, ImageEnhance
spec, out, grade = sys.argv[1:4]
ORIG = os.path.join(os.path.dirname(__file__), 'orig')
os.makedirs(out, exist_ok=True)
def tone(im):
    if grade == 'kallistus':   # cool, quiet, a touch less colour, lifted blacks
        im = ImageEnhance.Color(im).enhance(0.86)
        im = ImageEnhance.Contrast(im).enhance(1.03)
        r, g, b = im.split()
        b = b.point(lambda v: min(255, int(v * 1.012 + 1)))
        r = r.point(lambda v: int(v * 0.992))
        im = Image.merge('RGB', (r, g, b))
        lut = [int(6 + v * (249 - 6) / 255) for v in range(256)]
    else:                       # lauha: soft winter light, gentle warmth inside
        im = ImageEnhance.Color(im).enhance(0.9)
        lut = [int(8 + v * (248 - 8) / 255) for v in range(256)]
    return im.point(lut * 3)
for line in open(spec):
    line = line.split('#')[0].strip()
    if not line: continue
    sid, name, asp, fx, fy, widths = line.split()
    im = Image.open(f'{ORIG}/{sid}.jpg').convert('RGB')
    W, H = im.size; fx, fy = float(fx), float(fy)
    if asp != 'orig':
        aw, ah = map(float, asp.split(':'))
        if W / H > aw / ah: nw, nh = int(H * aw / ah), H
        else: nw, nh = W, int(W * ah / aw)
        x = min(max(0, int(fx * W - nw / 2)), W - nw); y = min(max(0, int(fy * H - nh / 2)), H - nh)
        im = im.crop((x, y, x + nw, y + nh))
    im = tone(im)
    ws = [int(w) for w in widths.split(',')]
    for w in ws:
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if w < im.width else im
        r.save(f'{out}/{name}-{w}.webp', quality=78, method=6)
    big = max(ws)
    print(name, im.size, '->', ws)
