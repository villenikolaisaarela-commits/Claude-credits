"""Studio Luoto: websites that bring renovation and HVAC firms more customers and leads.
Warm paper, ink, a lighthouse orange and a deep sea green; a serif that speaks and a grotesk that informs;
big rounded panels, pressable buttons, stickers, a chart of depth contours and a rocky shoreline between sections.
python3 build.py            -> /esikatselu/studioluoto/ (noindex)
LIVE=1 python3 build.py     -> the site root, for www.studioluoto.com
"""
import os, sys, json, html
from urllib.parse import quote

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from art import shore

LIVE = os.environ.get('LIVE') == '1'
P = '' if LIVE else '/esikatselu/studioluoto'
A = '/assets'
L = '/assets/luoto'
V = '3'
REPO = '/home/user/Claude-credits'
ROOT = REPO + P
SITE = 'https://www.studioluoto.com'
MAIL = 'ville@studioluoto.com'
TEL, TEL_H = '+358451035362', '045 103 5362'
YT = '3660060-6'
DEMO = '/demot/'

# Work and privacy text come from the existing generators
SCR = os.path.dirname(HERE)
g = {'__name__': 'ns'}
src = open(SCR + '/ns/ns.py').read()
exec(src.split('\ndef mark(')[0], g)
exec(src[src.index('\nPRIVACY = ['):src.index('\ndef privacy(')], g)
nw = {}
exec(open(SCR + '/ilme/newworks.py').read(), nw)
WORKS = nw['NEW_WORKS'] + g['WORKS']
ORDER = ('kallistus', 'lauha', 'keljon-puusepat', 'haljala', 'studio-kuusela', 'lindqvist-ekroos', 'kivela-rinne', 'kaulus')
WORKS = sorted(WORKS, key=lambda w: ORDER.index(w['slug']))


def esc(s):
    return html.escape(s, quote=True)


ASK = 'mailto:' + MAIL + '?subject=' + quote('Demopyyntö') + '&body=' + quote('Hei,\n\nnykyiset sivumme: \nteemme: \nalueemme: \n\n')
ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
TICK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" aria-hidden="true"><path d="M4 12.5l5 5 11-11"/></svg>'
ROCK = f'<img class="rock" src="{L}/luoto-merkki-musta.svg" width="40" height="25" alt="" aria-hidden="true">'


def btn(label='Pyydä ilmainen demo', href=None, cls=''):
    return f'<a class="btn{cls}" href="{href or ASK}"><span>{label}</span>{ARROW}</a>'


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
  <meta name="theme-color" content="#0F0F0E">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fi_FI">
  <meta property="og:site_name" content="Studio Luoto">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:url" content="{SITE}{path}">
  <meta property="og:image" content="{SITE}{L}/og.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Studio Luoto. Verkkosivut, jotka tuovat lisää tarjouspyyntöjä.">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="{L}/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="{A}/fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="{A}/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{L}/luoto.css?v={V}">{extra}
</head>
'''


NAV = [('Palvelu', '/#palvelu'), ('Näin se toimii', '/#prosessi'), ('Hinnat', '/#hinnat'), ('Työt', '/tyot/'), ('Kysymykset', '/#kysymykset')]


def header(dark=True):
    links = ''.join(f'<li><a href="{P}{h}">{t}</a></li>' for t, h in NAV)
    return f'''<body class="{'on-dark' if dark else 'on-light'}">
  <a class="skip" href="#main">Siirry sisältöön</a>
  <header class="nav" id="top">
    <div class="nav-in">
      <a class="nav-logo" href="{P}/"><img src="{L}/luoto-vaaka-musta.svg" width="968" height="145" alt="Studio Luoto, etusivu"></a>
      <nav aria-label="Päävalikko"><ul class="nav-links">{links}</ul></nav>
      <a class="nav-cta" href="{P}/#yhteys">Pyydä demo</a>
      <button class="nav-btn" type="button" aria-expanded="false" aria-controls="mvalikko"><span>Valikko</span><i aria-hidden="true"></i></button>
    </div>
    <div class="mnav" id="mvalikko"><ul>{links}<li><a href="{P}/#yhteys">Pyydä ilmainen demo</a></li></ul><p><a href="tel:{TEL}">{TEL_H}</a> · <a href="mailto:{MAIL}">{MAIL}</a></p></div>
  </header>
'''


def footer():
    return f'''
  <footer class="ftr">
    {shore(seed=11)}
    <div class="ftr-in">
      <div class="ftr-top">
        <p class="ftr-say">Autamme remontti- ja LVI-yrityksiä saamaan lisää asiakkaita ja tarjouspyyntöjä verkkosivujen avulla.</p>
        {btn(cls=' btn-or')}
      </div>
      <div class="ftr-grid">
        <div><p class="lab">Yhteys</p><ul><li><a href="mailto:{MAIL}">{MAIL}</a></li><li><a href="tel:{TEL}">{TEL_H}</a></li></ul></div>
        <div><p class="lab">Sivut</p><ul>{''.join(f'<li><a href="{P}{h}">{t}</a></li>' for t, h in NAV)}</ul></div>
        <div><p class="lab">Studio</p><ul><li>Isosaarentie 10, 00840 Helsinki</li><li><a href="{P}/tietosuoja/">Tietosuoja</a></li><li><a href="{P}/ehdot/">Sopimusehdot</a></li></ul></div>
      </div>
      <img class="ftr-word" src="{L}/luoto-vaaka-valkoinen.svg" width="968" height="145" alt="" loading="lazy" decoding="async">
      <div class="ftr-bot"><p>© 2026 Studio Luoto · Ville Saarela, Y-tunnus {YT}</p><a href="#top">Ylös ↑</a></div>
    </div>
  </footer>
  <script src="{L}/luoto.js?v={V}" defer></script>
</body>
</html>
'''


# ---------- Front page content ----------

TRADES = ['Kylpyhuoneremontit', 'Putki- ja linjasaneeraukset', 'LVI ja lämpöpumput', 'Sisäremontit', 'Julkisivut ja katot', 'Hirsitalojen korjaus', 'Keittiöt ja puusepät', 'Metallityö']
STICKERS = ['Ei hintaa', 'Ei kuvia kohteista', 'Tarjouspyyntö piilossa', 'Hidas puhelimella', 'Ei näy Googlessa']

DO = [
    ('Verkkosivut', 'Rakennamme sivut, jotka näyttävät yhtä laadukkailta kuin työsi. Tehdään yrityksellesi alusta asti, ei valmispohjasta.'),
    ('Viesti', 'Kirjoitamme tekstit niin, että asiakas ymmärtää heti, mitä teet, missä ja mitä se suunnilleen maksaa.'),
    ('Löydettävyys', 'Palvelut ja paikkakunnat omille sivuilleen, jotta Google ja tekoälyhaut tietävät, mitä teet ja missä.'),
    ('Tarjouspyyntö', 'Lomake, joka kysyy heti oikeat asiat. Saat pyynnön, josta voit laskea hinnan ilman takaisinsoittoa.'),
    ('Luottamus', 'Kohteet, takuu, vakuutukset ja tekijät esille, jotta asiakas valitsee sinut eikä halvinta.'),
]

FOR = [
    ('Remonttiyritykset', 'Kohteet esille ja tarjouspyynnöt oikeilta asiakkailta.', 'tile'),
    ('LVI ja talotekniikka', 'Palvelut, alueet ja päivystys selkeästi esillä.', 'pipe'),
    ('Rakentajat ja puusepät', 'Työ näyttää sivuilla yhtä hyvältä kuin paikan päällä.', 'house'),
]

STEPS = [
    ('Lähetä viesti.', 'Linkki nykyisiin sivuihisi ja pari lausetta riittää. Siihen menee kaksi minuuttia.', 'or', 'msg'),
    ('Saat luonnoksen 48 tunnissa.', 'Toimiva etusivu omassa linkissään. Avaat sen puhelimella ja näytät sen kollegoillesi. Maksuton, eikä sido mihinkään.', 'sea', 'clock'),
    ('Käydään muutokset läpi.', 'Hyväksyt suunnan ja kerrot, mitä haluat muuttaa. Muutamme kaiken, kunnes sivut ovat juuri oikein.', 'ink', 'pins'),
    ('Sivut julki, ja pidämme niistä huolen.', 'Julkaisemme sivut omaan osoitteeseesi. Sen jälkeen ylläpidämme ja päivitämme niitä, ja kaikki sisältyy kuukausihintaan.', 'sand', 'key'),
]

ASKS = [
    ('Hinta', 'Paljonko tämä suunnilleen maksaa?', 'Hinnan suunta ja kotitalousvähennys näkyvät.'),
    ('Kohteet', 'Ovatko he tehneet tällaista ennen?', 'Valmiit kohteet kuvineen ja tietoineen.'),
    ('Luottamus', 'Mitä jos jokin menee vikaan?', 'Takuu ja vakuutukset kerrotaan selvästi.'),
    ('Alue', 'Tulevatko he tänne asti?', 'Palvelualue ja paikkakunnat omilla sivuillaan.'),
    ('Aikataulu', 'Milloin he ehtisivät aloittaa?', 'Seuraava vapaa aloitus näkyy etusivulla.'),
    ('Tekijät', 'Keitä meille tulee töihin?', 'Tekijät nimillä ja kasvoilla.'),
    ('Tarjous', 'Miten tarjous pyydetään?', 'Lyhyt lomake jokaisella sivulla.'),
]

PAINS = [
    ('Sivuilta ei selviä heti, mitä teet ja missä.', 'Ensimmäinen lause kertoo palvelut ja alueen. Asiakas tietää heti, onko hän oikeassa paikassa.'),
    ('Valmiita kohteita ei näy.', 'Kohteet kuvineen ja tietoineen: mitä tehtiin, missä ja kauanko se kesti.'),
    ('Hinnasta ei kerrota mitään.', 'Hinnan suunta ja kotitalousvähennys näkyvät, joten tarjousta pyytävät ne, joille hinta sopii.'),
    ('Tarjouspyyntö on piilossa.', 'Tarjouspyyntö on yhden napautuksen päässä joka sivulta.'),
    ('Sivut ovat hitaat puhelimella.', 'Sivut aukeavat nopeasti, ja kaikki toimii peukalolla.'),
    ('Google ei ymmärrä, mitä teet.', 'Jokaisella palvelulla ja alueella on oma sivunsa, joten löydyt oikeista hauista.'),
    ('Takuu ja tekijät eivät näy.', 'Takuu, vakuutukset ja tekijät esillä. Luottamus syntyy ennen ensimmäistä puhelua.'),
    ('Kukaan ei seuraa tuloksia.', 'Search Console ja yhteydenottojen seuranta kuntoon. Näet, mistä tarjouspyynnöt tulevat.'),
]

PRICE, YEAR, BUYOUT = '199', '1\u00a0990', '990'
INCLUDED = [
    'Suunnittelu ja toteutus, enintään 8 sivua',
    'Tekstit ja kuvien käsittely',
    'Ylläpito, hosting, SSL ja varmuuskopiot',
    'Pienet muutokset kahdessa arkipäivässä',
    'Yksi isompi päivitys kuussa, esimerkiksi uusi kohde tai palvelusivu',
    'Löydettävyys: sitemap, Search Console sekä palvelu- ja paikkakuntasivut',
    'Google-yritysprofiilin optimointi',
    'Tarjouspyyntölomake ja yhteydenottojen seuranta',
    'Kuukausikatsaus: montako yhteydenottoa tuli ja mistä',
]
EXCLUDED = ['Mainonta, kuten Google Ads ja Meta', 'Logo ja ilme', 'Valokuvaus paikan päällä', 'Verkkokauppa', 'Lisäsivut yli kahdeksan sivun']
TERMS = [
    ('12 kk', 'vähimmäiskesto, sen jälkeen irtisanominen kuukauden varoitusajalla'),
    ('Domain', 'on aina sinun'),
    (f'{BUYOUT} €', 'lunastat sivut omaksesi, kun 12 kuukautta on täynnä'),
    ('24 kk', 'jälkeen sivut siirtyvät sinulle maksutta'),
]

FAQ = [
    ('Miten tämä eroaa tavallisesta mainostoimistosta?', 'Sivut ovat hienot, mutta lähtökohta on se, mitä asiakkaasi kysyvät ennen tarjouspyyntöä. Teemme sivut vastaamaan niihin ja tuomaan yhteydenottoja. Ja näet demon ennen kuin maksat mitään.'),
    ('Ehdinkö tähän kesken työmaiden?', 'Ehdit. Meille riittää linkki ja muutama lause. Demon teemme me, ja voit katsoa sen puhelimella illalla.'),
    ('Onko demo vain kuva?', 'Ei. Demo on toimiva etusivu omassa linkissään. Voit avata sen puhelimella ja tietokoneella ja näyttää sen kollegoillesi.'),
    ('Mitä demo maksaa?', 'Ei mitään. Demo on maksuton, eikä se sido mihinkään.'),
    ('Mitä sivut maksavat?', '199 € kuussa + alv, eikä aloitusmaksua ole. Voit myös maksaa vuoden kerralla, 1 990 € + alv, jolloin kaksi kuukautta on kaupan päälle. Hintaan sisältyy suunnittelu, toteutus, ylläpito ja päivitykset.'),
    ('Miksi kuukausihinta eikä kertamaksu?', 'Sivut eivät ole valmiit julkaisupäivänä. Kuukausihinnalla ne pysyvät ajan tasalla: uudet kohteet, palvelut ja korjaukset tehdään ilman erillisiä tarjouksia, eikä sinun tarvitse maksaa tuhansia euroja kerralla.'),
    ('Mitä jos haluan lopettaa?', 'Vähimmäiskesto on 12 kuukautta, ja sen jälkeen voit irtisanoa sopimuksen kuukauden varoitusajalla. Domain on aina sinun. Sivut voit lunastaa omaksesi 990 eurolla, ja 24 kuukauden jälkeen ne siirtyvät sinulle maksutta.'),
    ('Miten tarjouspyyntötakuu toimii?', 'Jos sivujen tarjouspyyntölomakkeen kautta ei tule yhtään tarjouspyyntöä kolmen ensimmäisen kuukauden aikana julkaisusta, seuraavat kolme kuukautta ovat ilmaisia. Seurannasta näet itse, mitä lomakkeen kautta tulee.'),
    ('Kauanko projekti kestää?', 'Yleensä kahdesta neljään viikkoa. Demo on valmis 48 tunnissa, ja aikataulu sovitaan ennen aloitusta.'),
    ('Meillä ei ole hyviä kuvia.', 'Puhelimella otetut kuvat kelpaavat alkuun. Käsittelemme ne niin, että työ näyttää sivuilla samalta kuin todellisuudessa.'),
    ('Mitä julkaisun jälkeen tapahtuu?', 'Pienet muutokset teemme kahdessa arkipäivässä, ja kerran kuussa teemme isomman päivityksen, kuten uuden kohteen tai palvelusivun. Saat joka kuukausi lyhyen katsauksen: montako yhteydenottoa tuli ja mistä.'),
    ('Mitä saan käteeni?', 'Valmiit sivut omassa osoitteessasi ja niiden jatkuvan ylläpidon: suunnittelun, tekstit, kuvien käsittelyn, toimivuuden puhelimella, löydettävyyden ja Google-yritysprofiilin kunnostuksen. Domain on aina sinun.'),
    ('Kenen kanssa teen töitä?', 'Ville Saarelan. Hän suunnittelee, kirjoittaa ja tekee sivut itse, ilman välikäsiä.'),
    ('Ovatko työt oikeita asiakkaita?', 'Osa töistä on konsepteja: kuvitteellisia yrityksiä, joilla näytämme, mitä alan sivut voivat tehdä. Se kerrotaan jokaisen työn sivulla.'),
]


# ---------- Line drawings: ink on white cards, inside coloured panels ----------

def ill(kind):
    S = 'fill="none" stroke="#0F0F0E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"'
    card = lambda x, y, w, h, r=14: f'<rect x="{x + 7}" y="{y + 7}" width="{w}" height="{h}" rx="{r}" fill="#0F0F0E"/><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="#FFFFFF" stroke="#0F0F0E" stroke-width="3"/>'
    if kind == 'msg':
        body = (card(150, 40, 220, 300, 26) + f'<rect x="215" y="56" width="90" height="12" rx="6" fill="#0F0F0E"/>'
                + card(60, 120, 250, 90, 18) + f'<path {S} d="M90 152h150M90 178h110"/>'
                + f'<rect x="250" y="230" width="150" height="52" rx="26" fill="#FF5B1F" stroke="#0F0F0E" stroke-width="3"/><path {S} d="M300 256h44M330 242l14 14-14 14"/>'
                + f'<path {S} d="M60 300l22-10M70 330l26-2M402 110l20-14M412 140l24 0"/>')
    elif kind == 'clock':
        body = (card(40, 40, 330, 250) + f'<path {S} d="M40 84h330"/><circle cx="66" cy="62" r="5" fill="#0F0F0E"/><circle cx="86" cy="62" r="5" fill="#0F0F0E"/>'
                + f'<rect x="70" y="110" width="130" height="16" rx="8" fill="#0F0F0E"/><rect x="70" y="138" width="100" height="16" rx="8" fill="#0F0F0E"/><path {S} d="M70 180h120M70 200h96"/><rect x="220" y="104" width="120" height="150" rx="10" fill="#E8E1D2" stroke="#0F0F0E" stroke-width="3"/>'
                + f'<circle cx="372" cy="270" r="62" fill="#FF5B1F" stroke="#0F0F0E" stroke-width="3"/><path {S} d="M372 236v34l22 14"/><text x="372" y="362" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="700" font-size="30" fill="#F4F1EA">48 h</text>')
    elif kind == 'pins':
        body = (card(40, 40, 360, 270) + f'<path {S} d="M40 84h360"/><rect x="70" y="112" width="150" height="18" rx="9" fill="#0F0F0E"/><path {S} d="M70 152h120M70 176h140"/><rect x="240" y="104" width="130" height="176" rx="10" fill="#E8E1D2" stroke="#0F0F0E" stroke-width="3"/>'
                + ''.join(f'<circle cx="{x}" cy="{y}" r="20" fill="#FF5B1F" stroke="#0F0F0E" stroke-width="3"/><path {S} d="M{x - 8} {y}l6 6 11-12"/>' for x, y in ((210, 120), (300, 200), (110, 236))))
    elif kind == 'key':
        body = (card(40, 50, 360, 70, 35) + f'<circle cx="80" cy="85" r="10" fill="#FF5B1F" stroke="#0F0F0E" stroke-width="3"/><text x="104" y="95" font-family="Archivo, sans-serif" font-weight="600" font-size="26" fill="#0F0F0E">www.yrityksesi.fi</text>'
                + card(110, 160, 220, 150, 18) + f'<circle cx="170" cy="235" r="30" {S}/><path {S} d="M200 235h90M262 235v24M282 235v18"/>'
                + f'<path {S} d="M60 190l24-6M70 230l24 4M370 190l22-10M372 240l26 2"/>')
    elif kind == 'tile':
        body = (card(70, 40, 260, 230, 16) + ''.join(f'<path {S} d="M{70 + i * 52} 40v230"/>' for i in range(1, 5)) + ''.join(f'<path {S} d="M70 {40 + j * 46}h260"/>' for j in range(1, 5))
                + f'<path {S} d="M250 80c0-20 30-20 30 0v40"/><path {S} d="M270 124l-10 22M282 124l0 24M294 124l10 22"/>')
    elif kind == 'pipe':
        body = (card(60, 60, 280, 200, 16) + f'<path stroke="#0F0F0E" stroke-width="18" stroke-linecap="round" fill="none" d="M100 220V140h120v-40h80"/><path stroke="#FF5B1F" stroke-width="10" stroke-linecap="round" fill="none" d="M100 220V140h120v-40h80"/>'
                + f'<circle cx="160" cy="200" r="28" fill="#FFFFFF" stroke="#0F0F0E" stroke-width="3"/><path {S} d="M160 184v16l10 8"/>')
    else:  # house
        body = (card(80, 110, 240, 170, 10) + f'<path fill="#FF5B1F" stroke="#0F0F0E" stroke-width="3" stroke-linejoin="round" d="M60 124L200 30l140 94z"/>'
                + f'<rect x="170" y="190" width="60" height="90" fill="#E8E1D2" stroke="#0F0F0E" stroke-width="3"/><rect x="110" y="150" width="44" height="40" fill="#E8E1D2" stroke="#0F0F0E" stroke-width="3"/><rect x="246" y="150" width="44" height="40" fill="#E8E1D2" stroke="#0F0F0E" stroke-width="3"/>')
    return f'<svg viewBox="0 0 440 380" aria-hidden="true">{body}</svg>'


def home():
    trades = ''.join(f'<li>{ROCK}<span>{t}</span></li>' for t in TRADES)
    stk = ''.join(f'<li>{s}</li>' for s in STICKERS)
    do = '\n'.join(f'        <li class="rv"><span class="lab">{i + 1:02d} / {t}</span><p>{d}</p></li>' for i, (t, d) in enumerate(DO))
    fors = '\n'.join(f'        <li class="rv"><div class="for-ill">{ill(k)}</div><p class="lab">{t}</p><h3>{d}</h3></li>' for t, d, k in FOR)
    steps = '\n'.join(f'''      <li class="step rv">
        <div class="step-t"><span class="pill">{i + 1:02d}</span><h3 class="d3">{t}</h3><p>{d}</p></div>
        <div class="panel panel-{c}">{ill(k)}</div>
      </li>''' for i, (t, d, c, k) in enumerate(STEPS))
    asks = '\n'.join(f'        <li class="rv"><span class="lab">{c}</span><q>{q}</q><span class="qa-a"><i>{TICK}</i>{a}</span></li>' for c, q, a in ASKS)
    pains = '\n'.join(f'        <li class="rv"><span class="pill pill-or">{i + 1:02d}</span><h3>{p}</h3><p>{f}</p></li>' for i, (p, f) in enumerate(PAINS))
    faq = '\n'.join(f'          <details><summary><span>{esc(q)}</span><i aria-hidden="true"></i></summary><p>{esc(a)}</p></details>' for q, a in FAQ)
    ld = {"@context": "https://schema.org", "@type": "ProfessionalService", "name": "Studio Luoto", "url": SITE + "/",
          "description": "Verkkosivut, jotka tuovat remontti- ja LVI-yrityksille lisää asiakkaita ja tarjouspyyntöjä.",
          "email": MAIL, "telephone": TEL, "makesOffer": {"@type": "Offer", "name": "Verkkosivut kuukausihinnalla", "price": PRICE, "priceCurrency": "EUR", "description": "Suunnittelu, toteutus, ylläpito ja päivitykset. 12 kuukauden vähimmäiskesto. Hinta + alv."}, "founder": {"@type": "Person", "name": "Ville Saarela"},
          "address": {"@type": "PostalAddress", "streetAddress": "Isosaarentie 10", "postalCode": "00840", "addressLocality": "Helsinki", "addressCountry": "FI"}}
    return head('/', 'Studio Luoto · Verkkosivut, jotka tuovat lisää tarjouspyyntöjä',
                'Studio Luoto tekee remontti- ja LVI-yrityksille verkkosivut, jotka tuovat lisää asiakkaita ja tarjouspyyntöjä. Ilmainen demo etusivusta 48 tunnissa.',
                f'\n  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>') + header() + f'''
  <main id="main">
    <section class="hero" aria-labelledby="h1">
      <div class="hero-in">
        <p class="hero-lab rv"><span class="dot"></span>Verkkosivut remontti- ja LVI-yrityksille</p>
        <h1 class="d1 rv" id="h1">Verkkosivut, jotka tuovat remontti&shy;yrityksellesi <em>lisää tarjous&shy;pyyntöjä.</em></h1>
        <p class="hero-p rv">Autamme yrityksiä saamaan lisää asiakkaita ja liidejä optimoitujen verkkosivujen avulla. Näet uuden etusivusi ennen kuin maksat mitään.</p>
        <div class="hero-do rv">{btn(cls=' btn-or')}<a class="link-lt" href="{P}/tyot/">Katso työt</a></div>
        <ul class="proof rv">
          <li><span class="proof-ic">48 h</span><span><b>Ilmainen demo 48 tunnissa</b><span>Toimiva etusivu, ei kuva. Ei sido mihinkään.</span></span></li>
          <li><span class="proof-ic">€</span><span><b>{PRICE} €/kk, kaikki sisältyy</b><span>Ei aloitusmaksua. Ylläpito ja päivitykset mukana.</span></span></li>
          <li><img src="{A}/img/valtteri-96.webp" width="96" height="96" alt="" loading="lazy" decoding="async"><span><b>”Sivut saavat ihmiset innostumaan jo ennen julkaisua.”</b><span>Valtteri Viitala, BuffBird Oy</span></span></li>
        </ul>
      </div>
    </section>

    <section class="trades" aria-label="Alat, joille teemme sivuja">
      <p class="lab">Teemme sivuja näille aloille</p>
      <div class="marq"><ul>{trades}</ul><ul aria-hidden="true">{trades}</ul></div>
    </section>

    <section class="wrap sec" id="ongelma" aria-labelledby="ongelma-h">
      <div class="prob">
        <p class="lab lab-lt rv">Ongelma</p>
        <h2 class="d2 rv" id="ongelma-h">Useimmat remonttisivut näyttävät siisteiltä. <em>Tarjouspyyntöjä ne eivät tuo.</em></h2>
        <p class="prob-p rv">Sivut tehtiin kerran, eikä kukaan ole sen jälkeen katsonut, tuleeko niiden kautta töitä. Asiakas vertaa illalla kolmea yritystä puhelimellaan ja pyytää tarjouksen siltä, jonka sivuilta löytyvät vastaukset.</p>
        <p class="prob-b rv">Sivusi päättävät, soittaako asiakas sinulle vai kilpailijalle.</p>
        <ul class="stk" aria-label="Tavallisimmat puutteet">{stk}</ul>
      </div>
    </section>

    <section class="dark" id="palvelu" aria-labelledby="palvelu-h">
      {shore(seed=5)}
      <div class="wrap dark-in">
        <h2 class="d2 rv" id="palvelu-h">Emme tee pelkkiä verkkosivuja. <em>Autamme sinua saamaan lisää asiakkaita.</em></h2>
        <p class="lead-lt rv">Optimoimme jokaisen sivun yhteen tehtävään: että oikea asiakas löytää sinut ja pyytää tarjouksen.</p>
        <ol class="five">
{do}
        </ol>
        <a class="link-lt rv" href="#yhteys">Katso, miten tämä toimisi sinun sivuillasi →</a>
      </div>
    </section>

    <section class="wrap sec" aria-labelledby="kenelle-h">
      <div class="sea">
        <h2 class="d2 rv" id="kenelle-h">Studio Luoto on <em>remontti- ja LVI-yrityksille.</em></h2>
        <ul class="for">
{fors}
        </ul>
      </div>
    </section>

    <section class="wrap sec" id="prosessi" aria-labelledby="prosessi-h">
      <p class="lab rv">Näin se toimii</p>
      <h2 class="d2 rv" id="prosessi-h">Viestistä valmiisiin sivuihin. <em>Neljä vaihetta.</em></h2>
      <figure class="film rv">
        <video muted loop playsinline preload="none" poster="{L}/video/prosessi.jpg" width="1920" height="1080" aria-describedby="film-txt">
          <source src="{L}/video/prosessi.webm" type="video/webm">
          <source src="{L}/video/prosessi.mp4" type="video/mp4">
        </video>
        <button class="film-t" type="button" aria-pressed="true">Toista</button>
        <figcaption class="sr" id="film-txt">Video, 40 sekuntia: Joka ilta joku etsii remonttia puhelimellaan. Jos sivusi eivät vakuuta, tarjouspyyntö menee kilpailijalle. Näin se toimii: 1. Lähetä viesti. 2. Saat luonnoksen 48 tunnissa. 3. Hyväksyt suunnan, ja muutamme kaiken, kunnes sivut ovat juuri oikein. 4. Sivut julkaistaan omaan osoitteeseesi, ja pidämme niistä huolen kuukausihinnalla. Pyydä ilmainen demo.</figcaption>
      </figure>
      <ol class="steps">
{steps}
      </ol>
      <div class="center rv">{btn()}<p class="small">Maksuton. Ei sido mihinkään.</p></div>
    </section>

{pricing()}

    <section class="wrap sec" id="vastaukset" aria-labelledby="vastaukset-h">
      <div class="split">
        <h2 class="d2 rv" id="vastaukset-h">Asiakkaasi kysyy. <em>Sivut vastaavat.</em></h2>
        <p class="lead rv">Nämä asiat asiakas haluaa tietää ennen kuin pyytää tarjouksen. Kun vastaukset löytyvät sivuilta, puhelin soi useammin ja oikeista asioista.</p>
      </div>
      <ul class="qa">
{asks}
      </ul>
    </section>

    <section class="wrap sec" id="miksi" aria-labelledby="miksi-h">
      <h2 class="d2 rv" id="miksi-h">Miksi nykyiset sivut eivät tuo töitä. <em>Ja mitä niille tehdään.</em></h2>
      <ul class="pains">
{pains}
      </ul>
    </section>

    <section class="wrap sec" aria-labelledby="sanoin-h">
      <figure class="quote rv">
        <h2 class="lab" id="sanoin-h">Asiakkaan sanoin</h2>
        <blockquote><p>”Ville teki sivut, jotka saavat ihmiset innostumaan BuffBirdista jo ennen julkaisua.”</p></blockquote>
        <figcaption><img src="{A}/img/valtteri-96.webp" width="96" height="96" alt="" loading="lazy" decoding="async"><span><b>Valtteri Viitala</b><span>Toimitusjohtaja, BuffBird Oy</span></span></figcaption>
      </figure>
      <div class="band rv"><h2 class="d3">Katso, miltä tämä näyttää valmiina.</h2>{btn('Viimeisimmät työt', P + '/tyot/', ' btn-ink')}</div>
    </section>

    <section class="wrap sec" id="kysymykset" aria-labelledby="kysymykset-h">
      <div class="faq-w">
        <h2 class="d2 rv" id="kysymykset-h">Usein kysyttyä</h2>
        <div class="faq rv">
{faq}
        </div>
      </div>
    </section>

    <section class="wrap sec" aria-labelledby="ville-h">
      <div class="founder rv">
        <img src="{A}/img/ville-480.webp" width="480" height="480" alt="Ville Saarela" loading="lazy" decoding="async">
        <div>
          <h2 class="d2" id="ville-h">Vielä kysyttävää? <em>Kysy suoraan Villeltä.</em></h2>
          <p>Ville Saarela, Studio Luoton perustaja. Vastaa itse jokaiseen viestiin ja puheluun.</p>
          <div class="hero-do">{btn('Soita ' + TEL_H, 'tel:' + TEL, ' btn-or')}<a class="link-lt" href="mailto:{MAIL}">{MAIL}</a></div>
        </div>
      </div>
    </section>
{contact()}
  </main>
''' + footer()


def pricing():
    inc = ''.join(f'<li><i>{TICK}</i>{x}</li>' for x in INCLUDED)
    exc = ''.join(f'<li>{x}</li>' for x in EXCLUDED)
    terms = ''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a, b in TERMS)
    return f'''
    <section class="wrap sec" id="hinnat" aria-labelledby="hinnat-h">
      <p class="lab rv" style="text-align:center">Hinnat</p>
      <h2 class="d2 rv" id="hinnat-h" style="text-align:center;max-width:18ch;margin:14px auto 0">Yksi hinta. <em>Kaikki sisältyy.</em></h2>
      <div class="price">
        <div class="price-main rv">
          <p class="lab">Studio Luoto -verkkosivut</p>
          <p class="price-n"><b>{PRICE} €</b><span>/kk + alv</span></p>
          <p class="price-sub">0 € aloitusmaksu. Ilmainen demo ensin.</p>
          <p class="price-year"><b>tai {YEAR} € + alv vuodelta</b> · kaksi kuukautta kaupan päälle</p>
          <div class="hero-do" style="justify-content:flex-start">{btn(cls=' btn-or')}</div>
          <ul class="terms-l">{terms}</ul>
          <p class="small">Palvelu on tarkoitettu yrityksille. <a href="{P}/ehdot/">Sopimusehdot</a></p>
        </div>
        <div class="price-inc rv">
          <h3 class="lab">Hintaan sisältyy</h3>
          <ul class="inc">{inc}</ul>
          <h3 class="lab" style="margin-top:28px">Ei sisälly</h3>
          <ul class="exc">{exc}</ul>
        </div>
      </div>
      <div class="price-x">
        <div class="guar rv"><span class="pill pill-or">Takuu</span><h3 class="d3">Tarjouspyyntötakuu</h3><p>Jos sivujen kautta ei tule yhtään tarjouspyyntöä kolmen ensimmäisen kuukauden aikana, seuraavat kolme kuukautta ovat ilmaisia.</p></div>
        <div class="first rv"><span class="pill">Kolme ensimmäistä</span><h3 class="d3">Ensimmäinen kuukausi ilmaiseksi</h3><p>Kolmelle ensimmäiselle asiakkaalle ensimmäinen kuukausi on ilmainen, kun annat suosittelun ja luvan kertoa projektista sivuillamme.</p></div>
      </div>
    </section>'''


def contact():
    return f'''
    <section class="wrap sec" id="yhteys" aria-labelledby="yhteys-h">
      <div class="cta rv">
        <h2 class="d1" id="yhteys-h">Pyydä ilmainen demo.</h2>
        <p>Lähetä linkki nykyisiin sivuihisi ja kerro, mitä teette ja missä. Näet uuden etusivusi 48 tunnissa. Maksuton, eikä sido mihinkään.</p>
        <div class="hero-do">{btn('Lähetä demopyyntö', None, ' btn-ink')}<a class="link-dk" href="tel:{TEL}">tai soita {TEL_H}</a></div>
      </div>
    </section>'''


# ---------- Work ----------

def tile(w, eager=False):
    s, b = w['slug'], f'{A}/img/projektit/{w["slug"]}'
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return f'''      <li class="tile rv"><a href="{P}/projektit/{s}/">
        <span class="tile-img"><img src="{b}/cover-960.webp" srcset="{b}/cover-960.webp 960w, {b}/cover.webp 1600w" sizes="(min-width: 900px) 46vw, 100vw" width="1600" height="1000" alt="{esc(w["name"])}: sivuston etusivu" {load} decoding="async"></span>
        <span class="tile-row"><span><b>{w['name']}</b><span>{w['title']}</span></span><span class="tag">{w['ala']}</span></span>
      </a></li>'''


def works():
    tiles = '\n'.join(tile(w, i < 2) for i, w in enumerate(WORKS))
    return head('/tyot/', 'Viimeisimmät työt · Studio Luoto', 'Kahdeksan sivustoa: kylpyhuoneremonttiyritys, LVI-yritys, keittiöpuuseppä, arkkitehtitoimistoja, sisustusarkkitehti, muotoilustudio ja vaatemerkki.') + header(False) + f'''
  <main id="main">
    <section class="wrap page-top" aria-labelledby="h1">
      <p class="lab rv">Työt</p>
      <h1 class="d1 rv" id="h1">Viimeisimmät <em>työt.</em></h1>
      <p class="lead rv">Kahdeksan sivustoa: kylpyhuoneremonttiyritys, LVI-yritys, keittiöpuuseppä, kaksi arkkitehtitoimistoa, sisustusarkkitehti, muotoilustudio ja vaatemerkki. Jokaisen sivulla kerromme, mistä lähdettiin ja mitä sivusto tekee yritykselle.</p>
    </section>
    <section class="wrap sec-s" aria-label="Työt">
      <ul class="tiles">
{tiles}
      </ul>
    </section>
{contact()}
  </main>
''' + footer()


def fig(src, alt, w, h, sizes='(min-width: 900px) 90vw, 100vw'):
    stem = src[:-5]
    if os.path.exists(REPO + stem + '-960.webp'):
        return f'<figure class="pf rv"><img src="{stem}-960.webp" srcset="{stem}-960.webp 960w, {src} 1600w" sizes="{sizes}" width="{w}" height="{h}" alt="{esc(alt)}" loading="lazy" decoding="async"></figure>'
    if os.path.exists(REPO + stem + '-300.webp'):
        return f'<figure class="pf rv"><img src="{stem}-300.webp" srcset="{stem}-300.webp 300w, {src} 600w" sizes="31vw" width="{w}" height="{h}" alt="{esc(alt)}" loading="lazy" decoding="async"></figure>'
    return f'<figure class="pf rv"><img src="{src}" width="{w}" height="{h}" alt="{esc(alt)}" loading="lazy" decoding="async"></figure>'


def project(i, w):
    s, sh, a = w['slug'], w['short'], w['alt']
    nxt = WORKS[(i + 1) % len(WORKS)]
    b = f'{A}/img/projektit/{s}'
    does = ''.join(f'<li><b>{t}</b><span>{d}</span></li>' for t, d in w['does'])
    made = ''.join(f'<li>{m}</li>' for m in w['made'])
    def sec(title, body):
        return f'''
    <section class="wrap ps"><div class="split"><h2 class="d3 rv">{title}</h2><div class="ps-b rv">{body}</div></div></section>'''
    return head(f'/projektit/{s}/', f'{w["name"]}: {w["title"]} · Konsepti · Studio Luoto', f'{w["title"]}. {w["desc"]}') + header(False) + f'''
  <main id="main">
    <article>
      <header class="wrap page-top">
        <p class="lab rv"><a href="{P}/tyot/">Työt</a> / {i + 1:02d}</p>
        <h1 class="d1 rv">{w['name']}</h1>
        <p class="d3 g rv">{w['title']}.</p>
        <dl class="facts rv">
          <div><dt class="lab">Ala</dt><dd>{w['ala']}</dd></div>
          <div><dt class="lab">Paikkakunta</dt><dd>{w['city']}</dd></div>
          <div><dt class="lab">Työ</dt><dd>{w['work']}</dd></div>
          <div><dt class="lab">Sivusto</dt><dd>{w['site']}</dd></div>
        </dl>
        <p class="concept rv"><span class="pill pill-or">Konsepti</span>{w['concept']}</p>
      </header>
      <figure class="wrap p-hero rv"><img src="{b}/cs/koti-960.webp" srcset="{b}/cs/koti-960.webp 960w, {b}/cs/koti.webp 1600w" sizes="100vw" width="1600" height="1000" alt="{esc(sh)}: etusivu" fetchpriority="high" decoding="async"></figure>
{sec('Lähtökohta', ''.join(f'<p>{p}</p>' for p in w['start']))}
      <div class="wrap pg pg-2">{fig(f'{b}/cs/lista.webp', f'{sh}: {a["lista"]}', 1600, 1000, '(min-width: 900px) 46vw, 100vw')}{fig(f'{b}/cs/kohde.webp', f'{sh}: {a["kohde"]}', 1600, 1000, '(min-width: 900px) 46vw, 100vw')}</div>
{sec('Ratkaisu', f'<p>{w["solution"]}</p>')}
      <div class="wrap pg">{fig(f'{b}/cs/kohde-2.webp', f'{sh}: {a["kohde"]}, tiedot', 1600, 1000)}</div>
{sec('Mitä sivusto tekee', f'<ol class="does">{does}</ol>')}
{sec('Toteutus', f'<ul class="made">{made}</ul><p class="g">{w["mobile"]}</p>')}
      <div class="wrap pg pg-3">{''.join(fig(f'{b}/mobile-{k}.webp', f'{sh} puhelimella, näkymä {k}', 600, 1298) for k in (1, 2, 3))}</div>
      <div class="wrap pg">{fig(f'{b}/cs/hinnat.webp', f'{sh}: {a["hinnat"]}', 1600, 1000)}</div>
      <div class="wrap p-foot"><p class="small">{w['credits']}</p>{btn('Avaa sivusto', DEMO + s + '/', ' btn-ink')}</div>
    </article>
    <a class="wrap next" href="{P}/projektit/{nxt['slug']}/"><span class="lab">Seuraava työ</span><span class="d2">{nxt['name']} →</span></a>
{contact()}
  </main>
''' + footer()


lc = lambda x: x if x.startswith('Google') else x[0].lower() + x[1:]

TERMS_DOC = [
    ('Osapuolet', ['Palveluntarjoaja on Studio Luoto, Ville Saarela (Y-tunnus 3660060-6), Isosaarentie 10, 00840 Helsinki. Asiakas on yritys tai yhteisö, joka tilaa palvelun. Palvelu on tarkoitettu vain yrityksille, joten kuluttajansuojalaki ei sovellu.']),
    ('Palvelu', [f'Studio Luoto suunnittelee, toteuttaa, julkaisee ja ylläpitää asiakkaan verkkosivut. Hintaan sisältyy: {"; ".join(lc(x) for x in INCLUDED)}.', f'Hintaan ei sisälly: {"; ".join(lc(x) for x in EXCLUDED)}. Niistä sovitaan erikseen.']),
    ('Demo', ['Ilmainen demo on maksuton luonnos asiakkaan etusivusta. Se ei velvoita asiakasta mihinkään. Sopimus syntyy vasta, kun asiakas hyväksyy tarjouksen kirjallisesti, esimerkiksi sähköpostilla.']),
    ('Hinta ja laskutus', [f'Kuukausihinta on {PRICE} € + alv. Aloitusmaksua ei ole. Laskutus tehdään kuukausittain etukäteen, maksuaika 14 päivää. Vaihtoehtoisesti asiakas voi maksaa 12 kuukautta kerralla {YEAR} € + alv.', 'Kuukausilaskutus alkaa, kun sivut julkaistaan. Ensimmäisen kuukauden ilmaisuus kolmelle ensimmäiselle asiakkaalle edellyttää, että asiakas antaa suosittelun ja luvan kertoa projektista Studio Luoton sivuilla.']),
    ('Sopimuskausi ja irtisanominen', ['Sopimuksen vähimmäiskesto on 12 kuukautta julkaisusta. Sen jälkeen sopimus on voimassa toistaiseksi, ja kumpikin osapuoli voi irtisanoa sen kuukauden irtisanomisajalla. Irtisanominen tehdään kirjallisesti.']),
    ('Muutokset ja päivitykset', ['Pienet muutokset, kuten tekstin, kuvan tai yhteystiedon vaihto, tehdään kahden arkipäivän kuluessa pyynnöstä. Lisäksi kuukaudessa tehdään yksi isompi päivitys, esimerkiksi uusi kohde- tai palvelusivu. Käyttämättömät päivitykset eivät siirry seuraavalle kuukaudelle.']),
    ('Tarjouspyyntötakuu', ['Jos sivujen tarjouspyyntölomakkeen kautta ei tule yhtään tarjouspyyntöä kolmen ensimmäisen kuukauden aikana julkaisusta, seuraavat kolme kuukautta ovat asiakkaalle maksuttomia. Takuu edellyttää, että lomake on ollut käytössä koko ajan ja asiakas on toimittanut sivuja varten sovitut tiedot. Takuu hyvitetään laskutuksessa, ei rahana.']),
    ('Omistus ja oikeudet', [f'Verkkotunnus (domain) on aina asiakkaan. Asiakkaan toimittamat tekstit, kuvat ja logot ovat asiakkaan. Studio Luoton tekemän suunnittelun ja toteutuksen oikeudet ovat Studio Luotolla sopimuksen ajan. Kun 12 kuukautta on täynnä, asiakas voi lunastaa sivut omakseen {BUYOUT} € + alv kertamaksulla. Kun sopimus on jatkunut 24 kuukautta, sivut siirtyvät asiakkaalle maksutta.', 'Studio Luoto saa mainita asiakkaan ja näyttää sivut referenssinä, ellei toisin sovita.']),
    ('Asiakkaan vastuut', ['Asiakas vastaa toimittamiensa sisältöjen oikeellisuudesta ja siitä, että sillä on oikeus käyttää toimittamiaan kuvia ja tekstejä. Asiakas vastaa myös verkkotunnuksensa uusimisesta, ellei toisin sovita.']),
    ('Maksuviivästys', ['Jos lasku on ollut maksamatta yli 30 päivää eräpäivästä, Studio Luoto voi keskeyttää palvelun ja sivujen ylläpidon, kunnes avoimet laskut on maksettu. Viivästyneelle maksulle peritään korkolain mukainen viivästyskorko.']),
    ('Vastuunrajoitus', ['Studio Luoto vastaa palvelun huolellisesta toteutuksesta. Studio Luoto ei vastaa välillisistä vahingoista, kuten saamatta jääneestä myynnistä. Studio Luoton vastuu rajoittuu enintään kolmen kuukauden palvelumaksujen määrään.']),
    ('Henkilötiedot', ['Henkilötietoja käsitellään tietosuojaselosteen mukaisesti. Tarjouspyyntölomakkeen kautta tulevat tiedot ohjataan asiakkaalle, ja asiakas on niiden rekisterinpitäjä.']),
    ('Ehtojen muutokset ja riidat', ['Studio Luoto voi muuttaa ehtoja ilmoittamalla siitä asiakkaalle vähintään 30 päivää etukäteen. Sopimukseen sovelletaan Suomen lakia. Riidat pyritään ratkaisemaan neuvottelemalla ja muuten Helsingin käräjäoikeudessa.']),
]


def terms_page():
    body = '\n'.join(f'      <h2>{h}</h2>' + ''.join(f'<p>{x}</p>' for x in ps) for h, ps in TERMS_DOC).replace(' €', '\u00a0€')
    return head('/ehdot/', 'Sopimusehdot · Studio Luoto', 'Studio Luoto -verkkosivupalvelun sopimusehdot: hinta, sopimuskausi, muutokset, takuu ja omistus.') + header(False) + f'''
  <main id="main">
    <article class="wrap doc">
      <p class="lab">Voimassa 15.10.2026 alkaen</p>
      <h1 class="d1">Sopimusehdot</h1>
{body}
    </article>
  </main>
''' + footer()


def privacy():
    body = '\n'.join(f'      <h2>{h}</h2>' + ''.join(f'<p>{p}</p>' for p in ps) for h, ps in g['PRIVACY']).replace('info@villesaarela.com', MAIL)
    return head('/tietosuoja/', 'Tietosuoja · Studio Luoto', 'Miten Studio Luoto käsittelee henkilötietoja.') + header(False) + f'''
  <main id="main">
    <article class="wrap doc">
      <p class="lab">Päivitetty 15.10.2026</p>
      <h1 class="d1">Tietosuoja</h1>
{body}
    </article>
  </main>
''' + footer()


def notfound():
    h = head('/404.html', 'Sivua ei löytynyt · Studio Luoto', 'Sivua ei löytynyt.').replace(f'<link rel="canonical" href="{SITE}/404.html">', '<meta name="robots" content="noindex">')
    return h + header(False) + f'''
  <main id="main">
    <section class="wrap page-top" aria-labelledby="h1">
      <p class="lab">404</p>
      <h1 class="d1" id="h1">Sivua ei <em>löytynyt.</em></h1>
      <p class="lead">Osoite on voinut muuttua.</p>
      <div class="hero-do" style="margin-top:32px">{btn('Etusivulle', P + '/', ' btn-ink')}<a class="link-dk" href="{P}/tyot/">Työt</a></div>
    </section>
  </main>
''' + footer()


def write(rel, content):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w').write(content)


write('index.html', home())
write('tyot/index.html', works())
for i, w in enumerate(WORKS):
    write(f'projektit/{w["slug"]}/index.html', project(i, w))
write('tietosuoja/index.html', privacy())
write('ehdot/index.html', terms_page())
write('404.html', notfound())
if LIVE:
    urls = ['/', '/tyot/'] + [f'/projektit/{w["slug"]}/' for w in WORKS] + ['/tietosuoja/', '/ehdot/']
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(f'  <url><loc>{SITE}{u}</loc><lastmod>2026-10-15</lastmod></url>' for u in urls) + '\n</urlset>\n')
    write('robots.txt', f'User-agent: *\nAllow: /\nDisallow: /esikatselu/\n\nSitemap: {SITE}/sitemap.xml\n')
    write('CNAME', 'www.studioluoto.com')
    # Pages from the old site send their visitors to the matching place here
    stale = [(f'projektit/{d}', '/tyot/') for d in sorted(os.listdir(REPO + '/projektit')) if d not in ORDER]
    for old, new in [('hinnat', '/#palvelu'), ('minusta', '/#kysymykset'), ('prosessi', '/#prosessi')] + stale:
        write(f'{old}/index.html', f'<!doctype html><html lang="fi"><head><meta charset="utf-8"><title>Studio Luoto</title><meta name="robots" content="noindex"><link rel="canonical" href="{SITE}{new}"><meta http-equiv="refresh" content="0; url={new}"></head><body><a href="{new}">Studio Luoto</a></body></html>\n')
print('ok', 'live' if LIVE else 'preview')
