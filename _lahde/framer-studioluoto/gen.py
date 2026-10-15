"""Turn the built Studio Luoto pages into Framer code components, 1:1.
python3 gen.py assets PAGE...   -> prints the /assets paths the pages and the stylesheet use
python3 gen.py build PAGE...    -> writes out/LuotoBase.tsx, out/<Component>.tsx and out/manifest.json
Each section of a page becomes one component. Text in it becomes editable properties in Framer.
"""
import sys, os, re, json, html as H
from bs4 import BeautifulSoup, NavigableString, Tag

REPO = '/home/user/Claude-credits'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
CSS_FILE = REPO + '/assets/luoto/luoto.css'
JS_FILE = REPO + '/assets/luoto/luoto.js'
AMAP = os.path.join(HERE, 'assets-map.json')

URL_ATTRS = ('src', 'poster', 'href')


def page_soup(rel):
    return BeautifulSoup(open(os.path.join(REPO, rel), encoding='utf-8').read(), 'html.parser')


def css_text():
    return open(CSS_FILE, encoding='utf-8').read()


def css_urls(css):
    out = []
    for u in re.findall(r"url\('([^']+)'\)", css):
        if u.startswith('../fonts/'):
            out.append('/assets/fonts/' + u[9:])
        elif not u.startswith(('http', 'data:')):
            out.append('/assets/luoto/' + u)
    return out


def page_urls(soup):
    out = []
    for el in soup.find_all(True):
        for a in ('src', 'poster'):
            v = el.get(a)
            if v and v.startswith('/assets/'):
                out.append(v)
        if el.get('srcset'):
            out += [p.strip().split(' ')[0] for p in el['srcset'].split(',') if p.strip().startswith('/assets/')]
        if el.name == 'source' and el.get('src', '').startswith('/assets/'):
            out.append(el['src'])
    return out


# ---------- CSS: scope every rule under .luoto so nothing leaks into Framer ----------

def scope_selector(sel):
    s = sel.strip()
    if not s:
        return s
    s = s.replace('.js .', '.luoto.rv-on .') if s.startswith('.js ') else s
    if s.startswith('.luoto.rv-on'):
        return s
    if s in (':root', 'html', 'body'):
        return '.luoto'
    if s.startswith('::selection'):
        return '.luoto ::selection, .luoto' + s if False else '.luoto ' + s
    return '.luoto ' + s


def scope_css(css, amap):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)

    def fix_url(m):
        u = m.group(1)
        if u.startswith('../fonts/'):
            p = '/assets/fonts/' + u[9:]
        elif u.startswith(('http', 'data:')):
            return m.group(0)
        else:
            p = '/assets/luoto/' + u
        return "url('%s')" % amap.get(p, p)
    css = re.sub(r"url\('([^']+)'\)", fix_url, css)

    out, i, n = [], 0, len(css)

    def block(start):
        depth, j = 0, start
        while j < n:
            if css[j] == '{':
                depth += 1
            elif css[j] == '}':
                depth -= 1
                if depth == 0:
                    return j
            j += 1
        return n - 1

    def walk(text):
        res, k, L = [], 0, len(text)
        while k < L:
            o = text.find('{', k)
            if o < 0:
                break
            head = text[k:o].strip()
            depth, j = 0, o
            while j < L:
                if text[j] == '{':
                    depth += 1
                elif text[j] == '}':
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            body = text[o + 1:j]
            if head.startswith('@media') or head.startswith('@supports'):
                res.append(head + ' {' + walk(body) + '}')
            elif head.startswith('@'):
                res.append(head + ' {' + body + '}')
            else:
                sels = ', '.join(scope_selector(x) for x in head.split(','))
                res.append(sels + ' {' + body + '}')
            k = j + 1
        return '\n'.join(res)

    scoped = walk(css)
    # the root is a div, not a body: give it what body and html had
    return scoped + '\n.luoto { display: block; width: 100%; overflow-x: clip; }\n.luoto *, .luoto *::before, .luoto *::after { box-sizing: border-box; }'


# ---------- sections -> templates with text properties ----------

INLINE_FMT = {'em', 'br', 'i', 'strong', 'wbr'}
SKIP = {'script', 'style', 'svg', 'video', 'source', 'img', 'input', 'textarea', 'select'}


def has_letters(s):
    return bool(re.search(r'[A-Za-zÅÄÖåäö0-9€]', s))


def is_leaf(el):
    if not isinstance(el, Tag) or el.name in SKIP:
        return False
    direct = ''.join(c for c in el.children if isinstance(c, NavigableString))
    kids = [c for c in el.children if isinstance(c, Tag)]
    if any(c.name not in INLINE_FMT for c in kids):
        return False
    return has_letters(el.get_text())


def title_for(el, text):
    names = {'h1': 'Pääotsikko', 'h2': 'Otsikko', 'h3': 'Alaotsikko', 'p': 'Teksti', 'q': 'Kysymys', 'li': 'Rivi', 'b': 'Lihavoitu', 'summary': 'Kysymys', 'span': 'Teksti', 'a': 'Linkki', 'button': 'Painike', 'dt': 'Nimi', 'dd': 'Arvo', 'label': 'Kenttä', 'figcaption': 'Kuvateksti'}
    t = re.sub(r'\s+', ' ', text).strip()
    return f"{names.get(el.name, el.name)}: {t[:28]}{'…' if len(t) > 28 else ''}"


def rewrite_links(soup, amap):
    for el in soup.find_all(True):
        for a in ('src', 'poster'):
            v = el.get(a)
            if v and v.startswith('/assets/'):
                el[a] = amap.get(v, v)
        if el.get('srcset'):
            el['srcset'] = ', '.join((amap.get(p.strip().split(' ')[0], p.strip().split(' ')[0]) + (' ' + p.strip().split(' ', 1)[1] if ' ' in p.strip() else '')) for p in el['srcset'].split(','))
        h = el.get('href')
        if h and h.startswith('/') and not h.startswith('//') and not h.startswith('/assets/'):
            path, frag = (h.split('#', 1) + [''])[:2]
            if path != '/' and path.endswith('/'):
                path = path[:-1]
            el['href'] = path + ('#' + frag if frag else '')


def to_component(name, nodes):
    """nodes: list of Tags that form one section. Returns (tsx, props)."""
    wrapper = BeautifulSoup('<div></div>', 'html.parser').div
    for nd in nodes:
        wrapper.append(nd)
    props, order = {}, []

    def visit(el):
        for c in list(el.children):
            if not isinstance(c, Tag) or c.name in SKIP:
                continue
            if is_leaf(c):
                key = f'p{len(order)}'
                val = c.decode_contents().strip()
                props[key] = {'value': val, 'title': title_for(c, c.get_text()), 'long': len(c.get_text()) > 60}
                order.append(key)
                c.clear()
                c.append('{{' + key + '}}')
            else:
                visit(c)
    visit(wrapper)
    # the language switch points at this page in the other language: a property, so one header serves every page
    for a in wrapper.select('a.nav-lang'):
        key = f'p{len(order)}'
        props[key] = {'value': a['href'], 'title': 'Kieliversion osoite', 'long': False}
        order.append(key)
        a['href'] = '{{' + key + '}}'
    template = wrapper.decode_contents()
    return template, props, order


TSX = '''/** @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerDisableUnlink
 */
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { useLuoto, LuotoStyle } from "./LuotoBase.tsx"

const TEMPLATE = __TEMPLATE__
const KEYS = __KEYS__

export default function __NAME__(props) {
    const ref = React.useRef(null)
    let h = TEMPLATE
    for (const k of KEYS) h = h.split("{{" + k + "}}").join(props[k] == null ? "" : String(props[k]))
    useLuoto(ref, h)
    return <>__STYLE__<div ref={ref} className="luoto" style={{ width: "100%" }} dangerouslySetInnerHTML={{ __html: h }} /></>
}

__NAME__.defaultProps = __DEFAULTS__

addPropertyControls(__NAME__, __CONTROLS__)
'''


def tsx_for(name, template, props, order):
    controls = '{\n' + ',\n'.join(
        f'    {k}: {{ type: ControlType.String, title: {json.dumps(props[k]["title"], ensure_ascii=False)}{", displayTextArea: true" if props[k]["long"] else ""} }}' for k in order) + '\n}'
    defaults = json.dumps({k: props[k]['value'] for k in order}, ensure_ascii=False, indent=4)
    return (TSX.replace('__STYLE__', '<LuotoStyle />' if name.startswith('Ylatunniste') else '').replace('__NAME__', name).replace('__TEMPLATE__', json.dumps(template, ensure_ascii=False))
            .replace('__KEYS__', json.dumps(order)).replace('__DEFAULTS__', defaults).replace('__CONTROLS__', controls))


def section_name(el, i, used):
    base = el.get('id') or ''
    if not base:
        cls = (el.get('class') or [''])
        base = cls[0] if cls and cls[0] not in ('wrap', 'sec') else (el.find(['h1', 'h2']) or {}).get('id', '') if el.find(['h1', 'h2']) else ''
        base = base.replace('-h', '') if base else f'osio{i}'
    nm = ''.join(p.capitalize() for p in re.split(r'[^a-zA-Z0-9]+', base) if p) or f'Osio{i}'
    while nm in used:
        nm += '2'
    used.add(nm)
    return nm


def split_page(soup):
    """Header, then each child of <main>, then footer + dialog."""
    body = soup.body
    parts = []
    hdr = body.find('header', class_='nav')
    parts.append(('Ylatunniste', [hdr]))
    main = body.find('main')
    used = {'Ylatunniste', 'Alatunniste'}
    for i, el in enumerate([c for c in main.children if isinstance(c, Tag)]):
        parts.append((section_name(el, i, used), [el]))
    tail = [body.find('footer'), body.find('dialog')]
    parts.append(('Alatunniste', [t for t in tail if t]))
    return parts


if __name__ == '__main__':
    mode, pages = sys.argv[1], sys.argv[2:]
    if mode == 'assets':
        urls = css_urls(css_text())
        for p in pages:
            urls += page_urls(page_soup(p))
        print('\n'.join(sorted(set(urls))))
        sys.exit()
    amap = json.load(open(AMAP))
    os.makedirs(OUT, exist_ok=True)
    css = scope_css(css_text(), amap)
    base = open(os.path.join(HERE, 'LuotoBase.tmpl.tsx'), encoding='utf-8').read().replace('__CSS__', json.dumps(css, ensure_ascii=False))
    open(os.path.join(OUT, 'LuotoBase.tsx'), 'w', encoding='utf-8').write(base)
    manifest, seen, names = {}, {}, set()

    def prefix(page):
        parts = [x for x in page.replace('index.html', '').replace('.html', '').split('/') if x]
        if parts and parts[0] == 'projektit':
            parts = parts[1:]
        if parts and parts[0] == 'en' and len(parts) > 2 and parts[1] == 'projects':
            parts = ['en'] + parts[2:]
        out = ''.join(x.replace('-', ' ').title().replace(' ', '') for x in parts)
        return 'Sivu' + out if out[:1].isdigit() else out

    for p in pages:
        soup = page_soup(p)
        rewrite_links(soup, amap)
        pre = prefix(p)
        lang_en = p.startswith('en/')
        comps = []
        for name, nodes in split_page(soup):
            template, props, order = to_component(name, nodes)
            if template in seen:
                fname = seen[template]
            else:
                if name in ('Ylatunniste', 'Alatunniste', 'Yhteys'):
                    fname = name + ('En' if lang_en else '')
                    fname = fname if fname not in names else pre + fname
                else:
                    fname = (pre + name) if (pre and pre != 'En') or name in names else ('En' + name if lang_en else name)
                while fname in names:
                    fname += 'B'
                names.add(fname)
                seen[template] = fname
                open(os.path.join(OUT, fname + '.tsx'), 'w', encoding='utf-8').write(tsx_for(fname, template, props, order))
            comps.append({'name': fname, 'controls': {k: props[k]['value'] for k in order}})
        manifest[p] = comps
    json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    print({k: [c['name'] for c in v] for k, v in manifest.items()})
