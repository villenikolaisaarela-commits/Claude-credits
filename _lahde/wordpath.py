# Glyph outlines of a word as one SVG path: wordpath(font, text, size, tracking_em) -> (d, width, ascent)
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
def wordpath(fontfile, text, size=100, track=0.0):
    f = TTFont(fontfile); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    s = size / upm; x = 0; pen = SVGPathPen(gs)
    asc = f['OS/2'].sCapHeight * s if hasattr(f['OS/2'], 'sCapHeight') else 0.7 * size
    xh = getattr(f['OS/2'], 'sxHeight', 0) * s
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        tp = TransformPen(pen, (s, 0, 0, -s, x, 0))
        gs[g].draw(tp)
        x += gs[g].width * s + (track * size if i < len(text) - 1 else 0)
    return pen.getCommands(), x, asc, xh
