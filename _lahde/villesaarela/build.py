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
V = '7'
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
    <nav aria-label="Päävalikko"><ul><li><a href="{P}/tyot/">Työt</a></li><li><a href="{P}/#nain">Näin se toimii</a></li><li><a href="{P}/#kysymykset">Kysymykset</a></li><li><a href="{P}/#yhteys">Yhteys</a></li></ul></nav>
    <div class="menu-foot"><a href="mailto:{MAIL}">{MAIL}</a><a href="tel:{TEL}">{TEL_H}</a><span class="lab lab-g" style="display:inline-flex;align-items:center;min-height:44px">Helsinki <time data-clock style="margin-left:8px"></time></span></div>
  </div>
  <header class="hdr" id="top">
    <a class="brand" href="{P}/"><img src="{A}/img/logo/ville-saarela-paperi.svg" width="522" height="74" alt="Ville Saarela, etusivu"></a>
    <div class="hdr-r">
      <a class="go" href="{P}/#yhteys"><span>Pyydä demo</span></a>
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
      <div><p class="lab">Sivut</p><ul><li><a href="{P}/tyot/">Työt</a></li><li><a href="{P}/#nain">Näin se toimii</a></li><li><a href="{P}/#kysymykset">Kysymykset</a></li><li><a href="{P}/#yhteys">Yhteys</a></li></ul></div>
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


# One market, many answers: renovation and HVAC firms. The front page explains why their sites fail and what fixes it; the work has its own page.
OFFER = 'Ilmainen demo 48 tunnissa'
NICHE = ['Kylpyhuoneremontit', 'Putki- ja linjasaneeraukset', 'LVI ja lämpöpumput', 'Sisäremontit', 'Julkisivut ja katot', 'Hirsitalojen korjaus', 'Keittiöt ja puusepät', 'Metallityö']
ORDER = ('kallistus', 'lauha', 'keljon-puusepat', 'haljala', 'studio-kuusela', 'lindqvist-ekroos', 'kivela-rinne', 'kaulus')
WORKS = sorted(WORKS, key=lambda w: ORDER.index(w['slug']))

# What a buyer sees on most renovation sites, as stickers
STICKERS = ['Ei hintaa', 'Ei kuvia kohteista', 'Tarjouspyyntö piilossa', 'Hidas puhelimella', 'Ei näy Googlessa']

# Why the current site does not bring requests, each with what the new one does instead
PAINS = [
    ('Sivuilta ei selviä heti, mitä teet ja missä.', 'Etusivun ensimmäinen lause kertoo palvelut ja alueen. Asiakas tietää kolmessa sekunnissa, onko hän oikeassa paikassa.'),
    ('Valmiita kohteita ei näy, tai kuvat ovat pieniä ja vanhoja.', 'Kohteet kuvineen ja tietoineen: mitä tehtiin, missä ja kauanko se kesti. Työ myy itse itsensä.'),
    ('Hinnasta ei kerrota mitään.', 'Hinnan suunta ja kotitalousvähennys näkyvät. Tarjousta pyytävät ne, joille hinta sopii, eikä aikasi mene turhiin käynteihin.'),
    ('Tarjouspyyntö on piilossa yhteystietosivun pohjalla.', 'Tarjouspyyntö on yhden napautuksen päässä joka sivulta, ja lomake kysyy heti sen, mitä tarvitset hinnan laskemiseen.'),
    ('Sivut ovat hitaat ja hankalat puhelimella.', 'Moni asiakas etsii remonttia puhelimella. Sivut aukeavat nopeasti, ja kaikki toimii peukalolla.'),
    ('Google ei ymmärrä, mitä teet ja missä.', 'Jokaisella palvelulla ja alueella on oma sivunsa, joten löydyt, kun joku hakee remonttia omalta paikkakunnaltaan.'),
    ('Takuu, vakuutukset ja tekijät eivät näy.', 'Takuu, vakuutukset ja tekijät nimillä ja kasvoilla. Luottamus syntyy ennen ensimmäistä puhelua.'),
    ('Kukaan ei seuraa, tuovatko sivut töitä.', 'Google Search Console ja yhteydenottojen seuranta kuntoon. Näet, mistä tarjouspyynnöt tulevat.'),
]

# What I do, five parts, the way a buyer would name them
DO = [
    ('Verkkosivut', 'Hienot sivut, jotka näyttävät yhtä laadukkailta kuin työsi. Tehty yrityksellesi alusta asti, ei valmispohjasta.'),
    ('Viesti', 'Kirjoitan tekstit niin, että asiakas ymmärtää nopeasti, mitä teet, missä ja mitä se suunnilleen maksaa.'),
    ('Löydettävyys', 'Palvelut ja paikkakunnat omille sivuilleen, jotta Google ja tekoälyhaut tietävät, mitä teet ja missä.'),
    ('Tarjouspyyntö', 'Lomake, joka kysyy heti oikeat asiat. Saat pyynnön, josta voit laskea hinnan ilman takaisinsoittoa.'),
    ('Luottamus', 'Kohteet, takuu, vakuutukset ja tekijät esille, jotta asiakas valitsee sinut eikä halvinta.'),
]

# The questions a buyer asks before asking for a quote, and where the site answers them
ASKS = [
    ('Hinta', 'Paljonko tämä suunnilleen maksaa?', 'Hinnan suunta ja kotitalousvähennys näkyvät.'),
    ('Kohteet', 'Ovatko he tehneet tällaista ennen?', 'Valmiit kohteet kuvineen ja tietoineen.'),
    ('Luottamus', 'Mitä jos jokin menee vikaan?', 'Takuu ja vakuutukset kerrotaan selvästi.'),
    ('Alue', 'Tulevatko he tänne asti?', 'Palvelualue ja paikkakunnat omilla sivuillaan.'),
    ('Aikataulu', 'Milloin he ehtisivät aloittaa?', 'Seuraava vapaa aloitus näkyy etusivulla.'),
    ('Tekijät', 'Keitä meille tulee töihin?', 'Tekijät nimillä ja kasvoilla.'),
    ('Tarjous', 'Miten tarjous pyydetään?', 'Lyhyt lomake jokaisella sivulla.'),
]

STEPS = [
    ('Lähetä linkki', 'Lähetä linkki yrityksesi nykyisiin sivuihin tai kerro muutamalla lauseella, mitä teette ja missä.'),
    ('Saat demon 48 tunnissa', 'Teen uudesta etusivustasi toimivan demon omaan linkkiinsä. Avaat sen puhelimella ja näytät sen kollegoillesi.'),
    ('Päätät vasta sitten', 'Jos pidät näkemästäsi, kerron kiinteän hinnan ja viimeistelen sivut. Jos et, et maksa mitään.'),
]

# Tools a client recognises; the ones that only say "code" are left out
TOOLS = [t for t in g['TOOLS'] if t[1] not in ('html5', 'css', 'javascript', 'github')]

FAQ_DEMO = [
    ('Miten tämä eroaa tavallisesta mainostoimistosta?', 'Sivut ovat hienot, mutta lähtökohta on se, mitä asiakkaasi kysyvät ennen tarjouspyyntöä. Sivut suunnitellaan vastaamaan niihin ja tuomaan yhteydenottoja. Ja näet demon ennen kuin maksat mitään.'),
    ('Ehdinkö tähän kesken työmaiden?', 'Ehdit. Sinulta tarvitaan linkki ja muutama lause. Demon teen minä, ja voit katsoa sen puhelimella illalla.'),
    ('Onko demo vain kuva?', 'Ei. Demo on toimiva etusivu omassa linkissään. Voit avata sen puhelimella ja tietokoneella ja näyttää sen kollegoillesi.'),
    ('Mitä demo maksaa?', 'Ei mitään. Demo on maksuton, eikä se sido mihinkään.'),
    ('Mitä sivut maksavat?', 'Kiinteä hinta, jonka kerron demon jälkeen, kun tiedän, mitä tarvitset. Se ei muutu matkalla, eikä kuukausimaksuja ole.'),
    ('Kauanko projekti kestää?', 'Yleensä kahdesta neljään viikkoa. Demo on valmis 48 tunnissa, ja aikataulu sovitaan ennen aloitusta.'),
    ('Meillä ei ole hyviä kuvia.', 'Puhelimella otetut kuvat kelpaavat alkuun. Käsittelen ne niin, että työ näyttää sivuilla samalta kuin todellisuudessa.'),
    ('Mitä julkaisun jälkeen tapahtuu?', 'Pienet muutokset teen nopeasti. Uudet kohteet ja palvelut lisätään, kun niitä tulee, ja näet Search Consolesta, miten sivut löytyvät.'),
    ('Mitä saan käteeni?', 'Valmiit sivut omassa osoitteessasi: suunnittelun, tekstit, kuvien käsittelyn, toimivuuden puhelimella ja Google-perusasiat. Sivut ja domain ovat sinun.'),
    ('Kenen kanssa teen töitä?', 'Minun. Suunnittelen, kirjoitan ja teen sivut itse, ilman välikäsiä.'),
    ('Ovatko työt oikeita asiakkaita?', 'Osa töistä on konsepteja: kuvitteellisia yrityksiä, joilla näytän, mitä alan sivut voivat tehdä. Se kerrotaan jokaisen työn sivulla.'),
]

ASK = 'mailto:' + MAIL + '?subject=' + quote('Demopyyntö') + '&body=' + quote('Hei Ville,\n\nnykyiset sivumme: \nteemme: \nalueemme: \n\n')


def cta(label='Pyydä ilmainen demo', cls=''):
    return f'<a class="btn{cls}" href="{ASK}"><span>{label}</span></a>'


def faq():
    return '\n'.join(f'          <details><summary><span>{esc(q)}</span><span class="pm" aria-hidden="true"></span></summary><p>{esc(a)}</p></details>' for q, a in FAQ_DEMO)


def contact(h='h2'):
    return f'''
    <section class="sec" id="yhteys" aria-labelledby="yhteys-h">
      <div class="cols"><{h} class="h2 c-wide rv-w" id="yhteys-h">Pyydä ilmainen demo. <span>Näet uuden etusivusi 48 tunnissa.</span></{h}></div>
      <div class="cols">
        <div class="c-l">
          <p class="lead g rv" style="margin-top:28px">Lähetä linkki yrityksesi nykyisiin sivuihin ja kerro, mitä teette ja missä. Saat toimivan demon uudesta etusivustasi 48 tunnissa. Se on maksuton, eikä sido mihinkään.</p>
          <p class="rv" style="margin-top:32px">{cta('Lähetä demopyyntö')}</p>
          <div class="reach rv"><a href="{ASK}">{MAIL}</a><a href="tel:{TEL}">{TEL_H}</a></div>
        </div>
      </div>
    </section>'''


def home():
    stk = ''.join(f'<li>{s}</li>' for s in STICKERS)
    pains = '\n'.join(f'        <li class="rv"><span class="lab">{i + 1:02d}</span><h3>{p}</h3><p>{f}</p></li>' for i, (p, f) in enumerate(PAINS))
    do = '\n'.join(f'        <li class="rv"><span class="lab">{i + 1:02d} / {t}</span><p>{d}</p></li>' for i, (t, d) in enumerate(DO))
    asks = '\n'.join(f'        <li class="rv"><span class="lab lab-g">{c}</span><q>{q}</q><span class="qa-a">{a}</span></li>' for c, q, a in ASKS)
    steps = '\n'.join(f'        <li class="rv"><span class="lab">{i + 1:02d}</span><h3>{t}</h3><p>{d}</p></li>' for i, (t, d) in enumerate(STEPS))
    fields = ''.join(f'<li>{f}</li>' for f in NICHE)
    tools = ''.join('<li>' + (f'<img src="{A}/img/tyokalut/{i}.svg" width="24" height="24" alt="">' if i else '') + f'{n}</li>' for n, i in TOOLS)
    ld = {"@context": "https://schema.org", "@type": "ProfessionalService", "name": "Ville Saarela", "url": SITE + "/", "image": SITE + "/assets/img/og-ilme.jpg",
          "logo": SITE + "/assets/img/ville-saarela.svg", "slogan": "Verkkosivut, jotka tekevät töitä.",
          "description": "Verkkosivut, jotka tuovat remonttiyrityksille lisää tarjouspyyntöjä. Ilmainen demo etusivusta 48 tunnissa.",
          "email": MAIL, "telephone": TEL, "taxID": "3660060-6",
          "address": {"@type": "PostalAddress", "streetAddress": "Isosaarentie 10", "postalCode": "00840", "addressLocality": "Helsinki", "addressCountry": "FI"}}
    return head('/', 'Ville Saarela · Verkkosivut remonttiyrityksille',
                'Verkkosivut, jotka tuovat remonttiyrityksellesi lisää tarjouspyyntöjä. Näet uuden etusivusi ennen kuin maksat: ilmainen demo 48 tunnissa.',
                f'\n  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>') + header() + f'''
  <main id="main">
    <section class="hero" aria-labelledby="h1">
      <p class="hero-meta lab lab-g">Helsinki <time data-clock></time></p>
      <h1 class="xl xl-long rv" id="h1">Verkkosivut, jotka tuovat remontti&shy;yrityksellesi lisää tarjous&shy;pyyntöjä.</h1>
      <div class="hero-sub rv"><span class="line"></span><p class="hero-p">Teen remontti- ja LVI-yrityksille hienot sivut, jotka tuovat töitä. Asiakas löytää vastaukset ja pyytää tarjouksen. Näet uuden etusivusi ennen kuin maksat.</p><p class="hero-do">{cta()}<a class="go" href="{P}/tyot/"><span>Viimeisimmät työt</span></a></p></div>
      <div class="hero-mark" aria-hidden="true"><img src="{A}/img/logo/aa-merkki-paperi.svg" width="1016" height="558" alt="" fetchpriority="high"></div>
    </section>
    <ul class="terms terms-top rv" aria-label="Ehdot"><li>{OFFER}</li><li>Kiinteä hinta</li><li>Ei kuukausimaksuja</li><li>Sivut ja domain ovat sinun</li></ul>

    <section class="sec prob" id="ongelma" aria-labelledby="ongelma-h">
      <p class="lab lab-g rv">Ongelma</p>
      <div class="cols"><h2 class="h2 h2-big c-wide rv-w" id="ongelma-h">Useimmat remonttiyritysten sivut näyttävät siisteiltä. <span>Tarjouspyyntöjä ne eivät tuo.</span></h2></div>
      <div class="cols">
        <div class="c-l">
          <p class="lead g rv">Sivut tehtiin kerran, ja sen jälkeen kukaan ei ole katsonut, tuleeko niiden kautta töitä. Asiakas vertaa illalla kolmea yritystä puhelimellaan ja pyytää tarjouksen siltä, jonka sivuilta löytyvät vastaukset.</p>
          <p class="lead rv" style="margin-top:20px"><b>Asiakas päättää sivujesi perusteella, soittaako hän sinulle vai kilpailijalle.</b></p>
        </div>
      </div>
      <ul class="stk rv" aria-label="Tavallisimmat puutteet">{stk}</ul>
    </section>

    <section class="sec" id="miksi" aria-labelledby="miksi-h">
      <div class="cols sec-top"><h2 class="h2 c-wide rv-w" id="miksi-h">Miksi nykyiset sivut eivät toimi. <span>Kahdeksan syytä ja mitä niille tehdään.</span></h2></div>
      <ul class="pains">
{pains}
      </ul>
    </section>

    <section class="sec" id="teen" aria-labelledby="teen-h">
      <div class="cols sec-top"><h2 class="h2 h2-big c-wide rv-w" id="teen-h">Hienot sivut, jotka tuovat töitä. <span>Ulkoasu on tärkeä. Tärkeintä on, että puhelin soi.</span></h2></div>
      <div class="cols"><p class="lead g c-l rv" style="margin-bottom:clamp(40px, 5vw, 72px)">Sivujen pitää näyttää yhtä laadukkailta kuin työsi. Mutta pelkkä hieno ulkoasu ei tuo tarjouspyyntöjä. Siksi jokainen sivu suunnitellaan niin, että asiakas löytää vastaukset ja ottaa yhteyttä.</p></div>
      <ol class="five">
{do}
      </ol>
      <div class="marq rv" role="group" aria-labelledby="tyokalut-h">
        <h3 class="lab lab-g" id="tyokalut-h">Työkalut</h3>
        <div class="marq-track">
          <ul>{tools}</ul>
          <ul aria-hidden="true">{tools}</ul>
        </div>
      </div>
    </section>

    <section class="sec" id="vastaukset" aria-labelledby="vastaukset-h">
      <div class="cols sec-top"><h2 class="h2 c-wide rv-w" id="vastaukset-h">Mitä asiakas kysyy ennen tarjouspyyntöä. <span>Ja mistä hän löytää vastauksen.</span></h2></div>
      <ul class="qa">
{asks}
      </ul>
    </section>

    <section class="sec" id="nain" aria-labelledby="nain-h">
      <div class="cols sec-top"><h2 class="h2 c-wide rv-w" id="nain-h">Näin se toimii. <span>Kolme vaihetta, ja ensimmäiseen menee pari minuuttia.</span></h2></div>
      <ol class="steps">
{steps}
      </ol>
      <div class="steps-cta rv">{cta()}<p class="g">Maksuton. Ei sido mihinkään.</p></div>
    </section>

    <section class="sec quote" aria-labelledby="sanoin-h">
      <h2 class="lab lab-g rv" id="sanoin-h" style="margin-bottom:28px">Asiakkaan sanoin</h2>
      <figure>
        <blockquote><p class="rv-w">”Ville teki sivut, jotka saavat ihmiset innostumaan BuffBirdista jo ennen julkaisua.”</p></blockquote>
        <figcaption class="rv"><img src="{A}/img/valtteri-96.webp" width="96" height="96" alt="" loading="lazy" decoding="async"><span><b>Valtteri Viitala</b><span class="g">Toimitusjohtaja, BuffBird Oy</span></span></figcaption>
      </figure>
    </section>

    <section class="sec" aria-labelledby="alat-h">
      <div class="cols"><h2 class="h2 c-wide rv-w" id="alat-h">Kenelle. <span>Remontti- ja LVI-yrityksille, joiden työ on parempaa kuin niiden sivut.</span></h2></div>
      <div class="cols"><p class="lead g c-l rv" style="margin-top:28px">Pienille ja keskikokoisille yrityksille, jotka tekevät työnsä hyvin ja haluavat, että se näkyy myös verkossa.</p></div>
      <ul class="fields rv" aria-label="Alat">{fields}</ul>
      <div class="band rv"><p class="h2">Katso, miltä tämä näyttää valmiina.</p><a class="go" href="{P}/tyot/"><span>Viimeisimmät työt</span></a></div>
    </section>

    <section class="sec" id="kysymykset" aria-labelledby="kysymykset-h">
      <div class="cols">
        <h2 class="h2 c-q rv-w" id="kysymykset-h">Kysymykset</h2>
        <div class="faq c-a rv">
{faq()}
        </div>
      </div>
    </section>

    <section class="sec" aria-labelledby="kysy-h">
      <div class="founder rv"><img src="{A}/img/ville-96.webp" width="96" height="96" alt="Ville Saarela" loading="lazy" decoding="async"><div><h2 class="h2" id="kysy-h">Vielä kysyttävää? <span>Kysy suoraan minulta.</span></h2><p class="g">Vastaan itse jokaiseen viestiin ja puheluun.</p></div><a class="go" href="tel:{TEL}"><span>Soita {TEL_H}</span></a></div>
    </section>
{contact()}
  </main>
''' + footer()


def works():
    tiles = '\n'.join(tile(w, i, scope=True, eager=i < 2) for i, w in enumerate(WORKS))
    ix = '\n'.join(f'        <li><a href="{P}/projektit/{w["slug"]}/"><span class="ix-n">{i + 1:02d}</span><span>{w["name"]}</span><span class="ix-t">{w["title"]}</span><span class="ix-a">{w["ala"]}, {w["city"]}</span></a></li>' for i, w in enumerate(WORKS))
    return head('/tyot/', 'Viimeisimmät työt · Ville Saarela', 'Kahdeksan sivustoa: kylpyhuoneremonttiyritys, LVI-yritys, keittiöpuuseppä, kaksi arkkitehtitoimistoa, sisustusarkkitehti, muotoilustudio ja vaatemerkki. Ville Saarela, Helsinki.') + header() + f'''
  <main id="main">
    <section class="page-top" aria-labelledby="h1">
      <p class="lab lab-g rv">Työt</p>
      <h1 class="xl rv-w" id="h1" style="margin-top:20px">Viimeisimmät työt.</h1>
      <p class="lead rv">Kahdeksan sivustoa: kylpyhuoneremonttiyritys, LVI-yritys, keittiöpuuseppä, kaksi arkkitehtitoimistoa, sisustusarkkitehti, muotoilustudio ja vaatemerkki. Jokaisen sivulla kerron, mistä lähdettiin ja mitä sivusto tekee yritykselle.</p>
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
