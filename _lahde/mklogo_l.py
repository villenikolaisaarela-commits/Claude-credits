import sys, math; sys.path.insert(0,'.')
from wordpath import wordpath
d, w, cap, xh = wordpath('fonts-l/familjen-600-latin.woff2', 'lauha', 100, -0.02)
asc = 76  # 'l' and 'h' ascender height in this face, near cap
# The Lauha line: weather on the left, a calm 21 °C on the right
y0 = 22; amp = 7; L = w
pts = []
for i in range(0, 61):
    x = L * 0.42 * i / 60
    a = amp * (1 - i / 60) ** 1.3
    pts.append((x, y0 + a * math.sin(i / 60 * math.pi * 3.5)))
path = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + f' L{L:.1f} {y0}'
def svg(ink, line):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 {-asc-10} {L+4:.1f} {asc+10+y0+amp+4}" role="img" aria-label="Lauha">'
            f'<path fill="{ink}" d="{d}"/><path d="{path}" fill="none" stroke="{line}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')
open('logo/lauha.svg', 'w').write(svg('#1E2A2F', '#B5652E'))
open('logo/lauha-light.svg', 'w').write(svg('#EEF2F1', '#D98A55'))
# favicon: the line alone on talviyö
fp = []
for i in range(0, 41):
    x = 9 + 26 * i / 40; a = 9 * (1 - i / 40) ** 1.2
    fp.append((x, 32 + a * math.sin(i / 40 * math.pi * 2.5)))
fpath = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in fp) + ' L55 32'
open('logo/lauha-fav.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#15262C"/><path d="{fpath}" fill="none" stroke="#D98A55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>')
print(round(L), cap)
