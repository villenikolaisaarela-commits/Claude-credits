import sys; sys.path.insert(0,'.')
from wordpath import wordpath
F='fonts-k/host-600-latin.woff2'
d, w, cap, xh = wordpath(F, 'kallistus', 100, -0.01)
gap = 10; r = 13
cx = w + gap + r; cy = 19
top = -cap - 8; bot = cy + r + 4
def svg(col, accent=None):
    W = cx + r + 4
    dot = accent or col
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 {top:.1f} {W:.1f} {bot-top:.1f}" role="img" aria-label="Kallistus">'
            f'<path fill="{col}" d="{d}"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r-3:.1f}" fill="none" stroke="{col}" stroke-width="5"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="4" fill="{dot}"/>'
            f'<path d="M1 12 L{cx-r+1.5:.1f} {cy:.1f}" stroke="{col}" stroke-width="3" fill="none"/></svg>')
open('logo/kallistus.svg','w').write(svg('#22272A', '#D9532A'))
open('logo/kallistus-light.svg','w').write(svg('#F2F2EF', '#F07A4A'))
open('logo/kallistus-fav.svg','w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#22272A"/><circle cx="32" cy="32" r="15" fill="none" stroke="#F2F2EF" stroke-width="5"/><circle cx="32" cy="32" r="5" fill="#E2562A"/></svg>')
print('w', round(w), 'cap', round(cap), 'viewbox h', round(bot-top))
