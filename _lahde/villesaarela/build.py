"""villesaarela.com in black and off-white: the Ville Saarela wordmark and the aa mark, words that settle into view, smooth scrolling.
The content comes from the villesaarela.com generator (ns.py).
python3 build.py            -> preview at villesaarela.com/esikatselu/uusi-ilme/ (noindex)
LIVE=1 python3 build.py     -> the site root
"""
import os, json, html
from urllib.parse import quote

LIVE = os.environ.get('LIVE') == '1'
P = '' if LIVE else '/esikatselu/uusi-ilme'
A = '/assets'                                 # shared with the live site
REPO = '/home/user/Claude-credits'
SRC = '/tmp/claude-0/-home-user-Claude-credits/48fe46c0-cdd2-5715-873f-2a0d22a820fb/scratchpad/ns/ns.py'
g = {'__name__': 'ns'}
exec(open(SRC).read().split('\ndef mark(')[0], g)      # data only
WORKS, FAQ, FIELDS = g['WORKS'], g['FAQ'], g['FIELDS']
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'newworks.py')).read())
WORKS = NEW_WORKS + WORKS
ROOT = REPO + P
V = '5'
SITE = 'https://www.villesaarela.com'
MAIL = 'info@villesaarela.com'
TEL, TEL_H = '+358451035362', '045 103 5362'
DEMO = 'https://www.villesaarela.com/demot/'


def esc(s):
    return html.escape(s, quote=True)


def head(path, title, desc, extra=''):
    robots = f'<link rel="canonical" href="{SITE}{path}">' if LIVE else '<meta name="robots" content="noindex">'
    return f'''<!doctype html>
<html lang="fi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>document.documentElement.classList.add('js')</script>
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  {robots}
  <meta name="theme-color" content="#000000">
  <meta name="color-scheme" content="dark">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fi_FI">
  <meta property="og:site_name" content="Ville Saarela">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:url" content="{SITE}{path}">
  <meta property="og:image" content="{SITE}/assets/img/og-ilme.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Ville Saarela. Verkkosivut, jotka tekevät töitä.">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="{A}/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="{A}/apple-touch-icon.png">
  <link rel="preload" href="{A}/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{A}/css/ilme.css?v={V}">{extra}
</head>
'''


def header():
    return f'''<body>
  <a class="skip" href="#main">Siirry sisältöön</a>
  <div class="menu" id="valikko">
    <nav aria-label="Päävalikko"><ul><li><a href="{P}/tyot/">Työt</a></li><li><a href="{P}/#tyotapa">Työtapa</a></li><li><a href="{P}/#kysymykset">Kysymykset</a></li><li><a href="{P}/#yhteys">Yhteys</a></li></ul></nav>
    <div class="menu-foot"><a href="mailto:{MAIL}">{MAIL}</a><a href="tel:{TEL}">{TEL_H}</a><span class="lab lab-g" style="display:inline-flex;align-items:center;min-height:44px">Helsinki <time data-clock style="margin-left:8px"></time></span></div>
  </div>
  <header class="hdr" id="top">
    <a class="brand" href="{P}/"><img src="{A}/img/logo/ville-saarela-paperi.svg" width="522" height="74" alt="Ville Saarela, etusivu"></a>
    <div class="hdr-r">
      <a class="go" href="{P}/#yhteys"><span>Ota yhteyttä</span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="valikko"><span>Valikko</span><i aria-hidden="true"></i></button>
    </div>
  </header>
'''


def footer():
    return f'''
  <footer class="ftr">
    <a class="ftr-logo" href="{P}/" aria-label="Ville Saarela, etusivu"><img src="{A}/img/logo/ville-saarela-paperi.svg" width="522" height="74" alt="" loading="lazy" decoding="async"></a>
    <div class="ftr-grid">
      <div><p class="lab">Helsinki</p><p><time data-clock></time></p><p>Isosaarentie 10, 00840 Helsinki</p></div>
      <div><p class="lab">Yhteys</p><ul><li><a href="mailto:{MAIL}">{MAIL}</a></li><li><a href="tel:{TEL}">{TEL_H}</a></li></ul></div>
      <div><p class="lab">Sivut</p><ul><li><a href="{P}/tyot/">Työt</a></li><li><a href="{P}/#tyotapa">Työtapa</a></li><li><a href="{P}/#kysymykset">Kysymykset</a></li><li><a href="{P}/#yhteys">Yhteys</a></li></ul></div>
      <div><p class="lab">Muut</p><ul><li><a href="{P}/tietosuoja/">Tietosuoja</a></li></ul></div>
    </div>
    <div class="ftr-bot"><p>© 2026 Ville Saarela · Y-tunnus 3660060-6</p><a href="#top">Ylös ↑</a></div>
  </footer>
  <script src="{A}/vendor/lenis.min.js" defer></script>
  <script src="{A}/js/ilme.js?v={V}" defer></script>
</body>
</html>
'''


def tile(w, i, scope=False, eager=False):
    s = w['slug']
    b = f'{A}/img/projektit/{s}'
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    sc = f'<span class="tile-s">{w["work"]}. {w["site"]}.</span>' if scope else ''
    return f'''      <li class="tile rv">
        <a href="{P}/projektit/{s}/" data-cur="Katso">
          <span class="tile-img"><img src="{b}/cover-960.webp" srcset="{b}/cover-960.webp 960w, {b}/cover.webp 1600w" sizes="(min-width: 800px) 50vw, 100vw" width="1600" height="1000" alt="{esc(w["name"])}: sivuston etusivu" {load} decoding="async"></span>
          <span class="tile-row"><span class="tile-t"><b>{w['name']}</b> <span>{w['title']}</span></span><span class="tile-a">{w['ala']}</span></span>{sc}
        </a>
      </li>'''


# A studio, not a pitch: many kinds of clients, and the work shown in a mix of fields.
FIELDS_HOME = ['Arkkitehtitoimistot', 'Sisustusarkkitehdit', 'Muotoilustudiot', 'Puusepät ja käsityöläiset', 'Remontti- ja LVI-yritykset', 'Vaatemerkit ja verkkokaupat', 'Asiantuntijayritykset', 'Uudet tuotteet ja palvelut']
HOME_WORKS = ('haljala', 'kallistus', 'studio-kuusela', 'kaulus', 'kivela-rinne', 'lauha')
ORDER = ('haljala', 'kallistus', 'studio-kuusela', 'kivela-rinne', 'lauha', 'keljon-puusepat', 'lindqvist-ekroos', 'kaulus')
WORKS = sorted(WORKS, key=lambda w: ORDER.index(w['slug']))

STEPS = [
    ('Tutustuminen', 'Kerrot, mitä teet, kenelle ja missä. Käyn läpi nykyiset sivusi ja katson, mitä alasi parhaat tekevät.'),
    ('Ensimmäinen versio', 'Teen etusivusta toimivan version omaan linkkiinsä. Näet ratkaisun oikeana sivuna selaimessa ja puhelimella, et kuvana.'),
    ('Viimeistely', 'Kun suunta on oikea, sovimme kiinteän hinnan ja aikataulun. Viimeistelen tekstit, kuvat ja loput sivut ja julkaisen ne omaan osoitteeseesi.'),
]

STACK = [
    ('Nimi ja ilme', 'Nimi, sanamerkki, värit ja typografia. Tai olemassa olevan ilmeen huolellinen jatko.'),
    ('Verkkosivut', 'Jokainen sivusto suunnitellaan yritykselle itselleen, ei valmispohjasta. Kevyet sivut, jotka aukeavat nopeasti puhelimellakin.'),
    ('Tekstit', 'Kirjoitan sivujen tekstit lyhyesti ja selkeästi: mitä teet, kenelle ja miten sinut tavoittaa.'),
    ('Kuvat', 'Valitsen ja käsittelen kuvat niin, että työ näyttää sivuilla samalta kuin todellisuudessa.'),
    ('Nopeus ja saavutettavuus', 'Tarkistan nopeuden ja saavutettavuuden ennen julkaisua. Sivut toimivat kaikilla laitteilla ja kaikille.'),
    ('Löydettävyys', 'Hakukoneiden perusasiat ja Google Search Console kuntoon, jotta sivut löytyvät.'),
]

# Tools a client recognises; the ones that only say "code" are left out
TOOLS = [t for t in g['TOOLS'] if t[1] not in ('html5', 'css', 'javascript', 'github')]

FAQ_DEMO = [
    ('Miten aloitetaan?', 'Lähetä viesti ja kerro lyhyesti, mitä teet. Jos sinulla on jo sivut, liitä mukaan linkki.'),
    ('Mikä on ensimmäinen versio?', 'Toimiva etusivu omassa linkissään, yleensä parissa päivässä. Näet sen selaimessa ja puhelimella. Se on maksuton eikä sido mihinkään.'),
    ('Mitä sivut maksavat?', 'Kiinteä hinta, jonka kerron, kun tiedän, mitä tarvitset. Se ei muutu matkalla, eikä kuukausimaksuja ole.'),
    ('Kauanko projekti kestää?', 'Yleensä kahdesta neljään viikkoa. Jos teemme myös nimen tai ilmeen, varaa hieman enemmän aikaa. Aikataulu sovitaan ennen aloitusta.'),
    ('Mitä saan käteeni?', 'Valmiit sivut omassa osoitteessasi: suunnittelun, tekstit, kuvien käsittelyn, toimivuuden puhelimella ja Google-perusasiat. Sivut ja domain ovat sinun.'),
    ('Kenen kanssa teen töitä?', 'Minun. Suunnittelen, kirjoitan ja teen sivut itse, ilman välikäsiä.'),
    ('Meillä ei ole hyviä kuvia.', 'Puhelimella otetut kuvat riittävät alkuun. Käsittelen ne niin, että työ näyttää sivuilla samalta kuin todellisuudessa.'),
    ('Entä jos meillä on jo logo?', 'Silloin se pidetään. Sivut tehdään sen ympärille, eikä ilmettä tarvitse aloittaa alusta.'),
    ('Voinko päivittää sivuja itse?', 'Pienet muutokset teen nopeasti. Jos haluat päivittää itse, kerro siitä alussa, niin teen sivut sen mukaan.'),
    ('Ovatko kaikki työt oikeita asiakkaita?', 'Eivät. Osa töistä on konsepteja: kuvitteellisia yrityksiä, joilla näytän, mitä eri alojen sivut voivat tehdä. Se kerrotaan jokaisen työn sivulla.'),
]

ASK = 'mailto:' + MAIL + '?subject=' + quote('Yhteydenotto') + '&body=' + quote('Hei Ville,\n\n')


def cta(label='Lähetä viesti', cls=''):
    return f'<a class="btn{cls}" href="{ASK}"><span>{label}</span></a>'


def faq():
    return '\n'.join(f'          <details><summary><span>{esc(q)}</span><span class="pm" aria-hidden="true"></span></summary><p>{esc(a)}</p></details>' for q, a in FAQ_DEMO)


def contact(h='h2'):
    return f'''
    <section class="sec" id="yhteys" aria-labelledby="yhteys-h">
      <div class="cols"><{h} class="h2 c-wide rv-w" id="yhteys-h">Kerro työstäsi. <span>Katsotaan yhdessä, millaiset sivut sille sopivat.</span></{h}></div>
      <div class="cols">
        <div class="c-l">
          <p class="lead g rv" style="margin-top:28px">Kerro lyhyesti, mitä teet ja kenelle. Jos sinulla on jo sivut, liitä mukaan linkki.</p>
          <p class="rv" style="margin-top:32px">{cta()}</p>
          <div class="reach rv"><a href="{ASK}">{MAIL}</a><a href="tel:{TEL}">{TEL_H}</a></div>
        </div>
      </div>
    </section>'''


def home():
    tiles = '\n'.join(tile(w, i) for i, w in enumerate(next(w for w in WORKS if w['slug'] == h) for h in HOME_WORKS))
    steps = '\n'.join(f'        <li class="rv"><span class="lab">{i + 1:02d}</span><h3>{t}</h3><p>{d}</p></li>' for i, (t, d) in enumerate(STEPS))
    stack = '\n'.join(f'        <li class="rv"><h3>{t}</h3><span class="lab">{i + 1:02d}</span><p>{d}</p></li>' for i, (t, d) in enumerate(STACK))
    fields = ''.join(f'<li>{f}</li>' for f in FIELDS_HOME)
    tools = ''.join('<li>' + (f'<img src="{A}/img/tyokalut/{i}.svg" width="24" height="24" alt="">' if i else '') + f'{n}</li>' for n, i in TOOLS)
    ld = {"@context": "https://schema.org", "@type": "ProfessionalService", "name": "Ville Saarela", "url": SITE + "/", "image": SITE + "/assets/img/og-ilme.jpg",
          "logo": SITE + "/assets/img/ville-saarela.svg", "slogan": "Verkkosivut, jotka tekevät töitä.",
          "description": "Ilmeet ja verkkosivut yrityksille ja studioille. Helsinki.",
          "email": MAIL, "telephone": TEL, "taxID": "3660060-6",
          "address": {"@type": "PostalAddress", "streetAddress": "Isosaarentie 10", "postalCode": "00840", "addressLocality": "Helsinki", "addressCountry": "FI"}}
    return head('/', 'Ville Saarela · Ilme ja verkkosivut',
                'Ville Saarela suunnittelee ilmeitä ja verkkosivuja yrityksille ja studioille Helsingistä. Verkkosivut, jotka tekevät töitä.',
                f'\n  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>') + header() + f'''
  <main id="main">
    <section class="hero" aria-labelledby="h1">
      <p class="hero-meta lab lab-g">Helsinki <time data-clock></time></p>
      <h1 class="xl rv-w" id="h1">Verkkosivut, jotka tekevät töitä.</h1>
      <div class="hero-sub rv"><span class="line"></span><p class="lab">Ilme, verkkosivut ja tekstit</p><p><a class="go" href="#tyot"><span>Katso työt</span></a></p></div>
      <div class="hero-mark" aria-hidden="true"><img src="{A}/img/logo/aa-merkki-paperi.svg" width="1016" height="558" alt="" fetchpriority="high"></div>
    </section>

    <section class="sec" aria-labelledby="intro-h">
      <div class="cols">
        <h2 class="h2 c-l rv-w" id="intro-h">Suunnittelen ilmeitä ja verkkosivuja. <span>Yrityksille, joiden työ on parempaa kuin niiden sivut.</span></h2>
        <div class="c-r">
          <p class="lead rv">Olen Ville Saarela, suunnittelija Helsingistä. Teen pienille yrityksille ja studioille ilmeen, sivut ja tekstit samalta pöydältä.</p>
          <p class="g rv">Työskentelen arkkitehtien, suunnittelijoiden, käsityöläisten, rakentajien ja verkkokauppojen kanssa. Lähtökohta on aina sama: sivujen pitää näyttää työn tasoiselta ja vastata siihen, mitä asiakas haluaa tietää.</p>
          <a class="go rv" href="#tyotapa"><span>Työtapa</span></a>
        </div>
      </div>
    </section>

    <section class="sec" id="tyot" aria-labelledby="tyot-h">
      <div class="sec-top"><h2 class="h2 rv-w" id="tyot-h">Valitut työt</h2><a class="go" href="{P}/tyot/"><span>Kaikki työt</span></a></div>
      <ul class="tiles">
{tiles}
      </ul>
    </section>

    <section class="sec" id="tyotapa" aria-labelledby="tyotapa-h">
      <div class="cols sec-top"><h2 class="h2 c-wide rv-w" id="tyotapa-h">Työtapa. <span>Yksi vaihe kerrallaan, ja näet ratkaisun ennen kuin sitoudut.</span></h2></div>
      <ol class="steps">
{steps}
      </ol>
    </section>

    <section class="sec" id="palvelu" aria-labelledby="palvelu-h">
      <div class="cols sec-top"><h2 class="h2 c-wide rv-w" id="palvelu-h">Mitä teen. <span>Ilme, sivut ja tekstit samalta pöydältä.</span></h2></div>
      <ul class="svc">
{stack}
      </ul>
      <div class="marq rv" role="group" aria-labelledby="tyokalut-h">
        <h3 class="lab lab-g" id="tyokalut-h">Työkalut</h3>
        <div class="marq-track">
          <ul>{tools}</ul>
          <ul aria-hidden="true">{tools}</ul>
        </div>
      </div>
    </section>

    <section class="sec quote" aria-labelledby="sanoin-h">
      <h2 class="lab lab-g rv" id="sanoin-h" style="margin-bottom:28px">Asiakkaan sanoin</h2>
      <figure>
        <blockquote><p class="rv-w">”Ville teki sivut, jotka saavat ihmiset innostumaan BuffBirdista jo ennen julkaisua.”</p></blockquote>
        <figcaption class="rv"><img src="{A}/img/valtteri-96.webp" width="96" height="96" alt="" loading="lazy" decoding="async"><span><b>Valtteri Viitala</b><span class="g">Toimitusjohtaja, BuffBird Oy</span></span></figcaption>
      </figure>
    </section>

    <section class="sec" aria-labelledby="alat-h">
      <div class="cols"><h2 class="h2 c-wide rv-w" id="alat-h">Kenelle. <span>Yrityksille ja studioille, joille laatu on tärkeää.</span></h2></div>
      <div class="cols"><p class="lead g c-l rv" style="margin-top:28px">Alat vaihtelevat, mutta tehtävä on sama: sivujen pitää kertoa työstä yhtä hyvin kuin työ itse.</p></div>
      <ul class="fields rv" aria-label="Alat">{fields}</ul>
    </section>

    <section class="sec" id="kysymykset" aria-labelledby="kysymykset-h">
      <div class="cols">
        <h2 class="h2 c-q rv-w" id="kysymykset-h">Kysymykset</h2>
        <div class="faq c-a rv">
{faq()}
        </div>
      </div>
    </section>
{contact()}
  </main>
''' + footer()

def works():
    tiles = '\n'.join(tile(w, i, scope=True, eager=i < 2) for i, w in enumerate(WORKS))
    ix = '\n'.join(f'        <li><a href="{P}/projektit/{w["slug"]}/"><span class="ix-n">{i + 1:02d}</span><span>{w["name"]}</span><span class="ix-t">{w["title"]}</span><span class="ix-a">{w["ala"]}, {w["city"]}</span></a></li>' for i, w in enumerate(WORKS))
    return head('/tyot/', 'Työt · Ville Saarela', 'Kahdeksan sivustoa eri aloilta: kaksi arkkitehtitoimistoa, sisustusarkkitehti, muotoilustudio, puuseppä, vaatemerkki, kylpyhuoneremonttiyritys ja LVI-yritys. Ville Saarela, Helsinki.') + header() + f'''
  <main id="main">
    <section class="page-top" aria-labelledby="h1">
      <p class="lab lab-g rv">Työt</p>
      <h1 class="xl rv-w" id="h1" style="margin-top:20px">Valitut työt.</h1>
      <p class="lead rv">Kahdeksan sivustoa eri aloilta: kaksi arkkitehtitoimistoa, sisustusarkkitehti, muotoilustudio, puuseppä, vaatemerkki, kylpyhuoneremonttiyritys ja LVI-yritys. Jokaisen sivulla kerron, mistä lähdettiin ja mitä sivusto tekee yritykselle.</p>
    </section>
    <section class="sec" aria-label="Työt" style="padding-top:clamp(64px, 8vw, 120px)">
      <ul class="tiles">
{tiles}
      </ul>
    </section>
    <section class="sec" aria-labelledby="ix-h">
      <div class="sec-top"><h2 class="h2 rv-w" id="ix-h">Kaikki työt</h2></div>
      <ol class="ix rv">
{ix}
      </ol>
    </section>
{contact()}
  </main>
''' + footer()


def fig(src, alt, w, h, sizes='(min-width: 800px) 90vw, 100vw', cap=''):
    stem = src[:-5]
    local = REPO + stem
    if os.path.exists(local + '-960.webp'):
        img = f'<img src="{stem}-960.webp" srcset="{stem}-960.webp 960w, {src} 1600w" sizes="{sizes}" width="{w}" height="{h}" alt="{esc(alt)}" loading="lazy" decoding="async">'
    elif os.path.exists(local + '-300.webp'):
        img = f'<img src="{stem}-300.webp" srcset="{stem}-300.webp 300w, {src} 600w" sizes="31vw" width="{w}" height="{h}" alt="{esc(alt)}" loading="lazy" decoding="async">'
    else:
        img = f'<img src="{src}" width="{w}" height="{h}" alt="{esc(alt)}" loading="lazy" decoding="async">'
    c = f'<figcaption>{cap}</figcaption>' if cap else ''
    return f'<figure class="pf rv">{img}{c}</figure>'


def project(i, w):
    s = w['slug']
    nxt = WORKS[(i + 1) % len(WORKS)]
    b = f'{A}/img/projektit/{s}'
    sh, a = w['short'], w['alt']
    does = ''.join(f'<li><b>{t}</b><span>{d}</span></li>' for t, d in w['does'])
    made = ''.join(f'<li>{m}</li>' for m in w['made'])
    def sec(n, title, body):
        return f'''
    <section class="ps" aria-labelledby="ps-{n}">
      <div class="cols"><h2 class="h2 c-l rv-w" id="ps-{n}">{title}</h2><div class="c-r rv">{body}</div></div>
    </section>'''
    return head(f'/projektit/{s}/', f'{w["name"]}: {w["title"]} · Konsepti · Ville Saarela', f'{w["title"]}. {w["desc"]}') + header() + f'''
  <main id="main">
    <article>
      <header class="p-top">
        <p class="lab lab-g rv"><a href="{P}/tyot/" style="color:var(--wt)">Työt</a> / {i + 1:02d}</p>
        <h1 class="xl rv-w" id="h1">{w['name']}</h1>
        <p class="h2 rv-w">{w['title']}.</p>
        <dl class="facts rv">
          <div><dt class="lab lab-g">Ala</dt><dd>{w['ala']}</dd></div>
          <div><dt class="lab lab-g">Paikkakunta</dt><dd>{w['city']}</dd></div>
          <div><dt class="lab lab-g">Työ</dt><dd>{w['work']}</dd></div>
          <div><dt class="lab lab-g">Sivusto</dt><dd>{w['site']}</dd></div>
        </dl>
        <p class="concept rv"><span class="lab">Konsepti</span>{w['concept']}</p>
      </header>
      <figure class="p-hero rv"><img src="{b}/cs/koti-960.webp" srcset="{b}/cs/koti-960.webp 960w, {b}/cs/koti.webp 1600w" sizes="100vw" width="1600" height="1000" alt="{esc(sh)}: etusivu" fetchpriority="high" decoding="async"></figure>
{sec(1, 'Lähtökohta', ''.join(f'<p>{p}</p>' for p in w['start']))}
      <div class="pg pg-2">{fig(f'{b}/cs/lista.webp', f'{sh}: {a["lista"]}', 1600, 1000, '(min-width: 800px) 48vw, 100vw')}{fig(f'{b}/cs/kohde.webp', f'{sh}: {a["kohde"]}', 1600, 1000, '(min-width: 800px) 48vw, 100vw')}</div>
{sec(2, 'Ratkaisu', f'<p>{w["solution"]}</p>')}
      <div class="pg">{fig(f'{b}/cs/kohde-2.webp', f'{sh}: {a["kohde"]}, tiedot', 1600, 1000)}</div>
{sec(3, 'Mitä sivusto tekee', f'<ol class="does">{does}</ol>')}
      <div class="pg">{fig(f'{A}/img/tyot/{s}-final.webp', f'{sh}: valmis etusivu', 1000, 625)}</div>
{sec(4, 'Toteutus', f'<ul class="made">{made}</ul><p class="g">{w["mobile"]}</p>')}
      <div class="pg pg-3">{''.join(fig(f'{b}/mobile-{k}.webp', f'{sh} puhelimella, näkymä {k}', 600, 1298) for k in (1, 2, 3))}</div>
      <div class="pg">{fig(f'{b}/cs/hinnat.webp', f'{sh}: {a["hinnat"]}', 1600, 1000)}</div>
      <div class="p-foot"><p class="credits">{w['credits']}</p><a class="go" href="{DEMO}{s}/" target="_blank" rel="noopener"><span>Avaa sivusto ↗</span></a></div>
    </article>
    <a class="next" href="{P}/projektit/{nxt['slug']}/" data-cur="Seuraava"><span class="lab lab-g">Seuraava työ</span><span class="xl" style="display:block">{nxt['name']}</span></a>
{contact()}
  </main>
''' + footer()


def privacy():
    items = g['PRIVACY']
    body = '\n'.join(f'      <h2>{h}</h2>' + ''.join(f'<p>{p}</p>' for p in ps) for h, ps in items)
    return head('/tietosuoja/', 'Tietosuoja · Ville Saarela', 'Miten Ville Saarela käsittelee henkilötietoja.') + header() + f'''
  <main id="main">
    <article class="doc">
      <p class="lab lab-g">Päivitetty 12.10.2026</p>
      <h1 class="xl" id="h1">Tietosuoja</h1>
{body}
    </article>
  </main>
''' + footer()


def notfound():
    h = head('/404.html', 'Sivua ei löytynyt · Ville Saarela', 'Sivua ei löytynyt.').replace(f'<link rel="canonical" href="{SITE}/404.html">', '<meta name="robots" content="noindex">')
    return h + header() + f'''
  <main id="main">
    <section class="hero" aria-labelledby="h1">
      <h1 class="xl rv-w" id="h1">Sivua ei löytynyt.</h1>
      <div class="hero-sub rv"><span class="line"></span><p class="lab">Osoite on voinut muuttua</p><p><a class="go" href="{P}/"><span>Etusivulle</span></a> &nbsp; <a class="go" href="{P}/tyot/"><span>Työt</span></a></p></div>
      <div class="hero-mark" aria-hidden="true"><img src="{A}/img/logo/aa-merkki-paperi.svg" width="1016" height="558" alt=""></div>
    </section>
  </main>
''' + footer()


def write(rel, content):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w').write(content)


# The privacy text lives further down in ns.py than the data cut above; take it from there
src = open(SRC).read()
start = src.index('\nPRIVACY = [')
end = src.index('\ndef privacy(')
exec(src[start:end], g)

write('index.html', home())
write('tyot/index.html', works())
for i, w in enumerate(WORKS):
    write(f'projektit/{w["slug"]}/index.html', project(i, w))
write('tietosuoja/index.html', privacy())
write('404.html', notfound())
if LIVE:
    urls = ['/', '/tyot/'] + [f'/projektit/{w["slug"]}/' for w in WORKS] + ['/tietosuoja/']
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(f'  <url><loc>{SITE}{u}</loc><lastmod>2026-10-12</lastmod></url>' for u in urls) + '\n</urlset>\n')
    write('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: https://www.villesaarela.com/sitemap.xml\n')
print('ok', 'live' if LIVE else 'preview')
