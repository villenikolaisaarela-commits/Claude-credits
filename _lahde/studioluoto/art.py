"""Studio Luoto: generated artwork. A nautical-chart contour field for the dark opening, a rocky shoreline edge between sections."""
import math, random

def contours(w=1600, h=1000, cx=1180, cy=860, n=22, seed=7):
    rnd = random.Random(seed)
    ph = [rnd.uniform(0, 6.283) for _ in range(6)]
    paths = []
    for k in range(n):
        r0 = 40 + k * 42
        pts = []
        for i in range(181):
            a = i / 180 * 2 * math.pi
            r = r0 * (1 + 0.10 * math.sin(3 * a + ph[0] + k * 0.18) + 0.06 * math.sin(5 * a + ph[1] - k * 0.11)
                      + 0.035 * math.sin(9 * a + ph[2]) + 0.02 * math.sin(13 * a + ph[3] + k * 0.3))
            pts.append((cx + r * math.cos(a) * 1.35, cy + r * math.sin(a) * 0.82))
        d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z'
        op = 0.10 if k % 5 else 0.18
        paths.append(f'<path d="{d}" stroke-opacity="{op}"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#F4F1EA" stroke-width="1.2">{"".join(paths)}</g></svg>'

def shore(w=1600, h=70, seed=3):
    rnd = random.Random(seed)
    x, pts = 0.0, []
    y = h * 0.55
    while x < w:
        y = min(h - 6, max(6, y + rnd.uniform(-14, 14)))
        pts.append((x, y))
        x += rnd.uniform(14, 46)
    pts.append((w, h * 0.5))
    d = f'M0 {h} L' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + f' L{w} {h}Z'
    return f'<svg class="shore" viewBox="0 0 {w} {h}" preserveAspectRatio="none" aria-hidden="true"><path d="{d}" fill="currentColor"/></svg>'

if __name__ == '__main__':
    open('/home/user/Claude-credits/assets/luoto/kartta.svg', 'w').write(contours())
