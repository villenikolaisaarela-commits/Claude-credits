"""Studio Luoto: websites as a service for renovation and HVAC firms, in Finnish (default, /) and English (/en/).
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
from en import EN_WORKS, PRIVACY_EN

LIVE = os.environ.get('LIVE') == '1'
P = '' if LIVE else '/esikatselu/studioluoto'
A = '/assets'
L = '/assets/luoto'
V = '4'
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
WORKS_FI = nw['NEW_WORKS'] + g['WORKS']
ORDER = ('kallistus', 'lauha', 'keljon-puusepat', 'haljala', 'studio-kuusela', 'lindqvist-ekroos', 'kivela-rinne', 'kaulus')
WORKS_FI = sorted(WORKS_FI, key=lambda w: ORDER.index(w['slug']))
WORKS_ALL = {'fi': WORKS_FI, 'en': [{**w, **EN_WORKS[w['slug']]} for w in WORKS_FI]}

# ---------- Language ----------

LANG = 'fi'
OTHER = {'fi': 'en', 'en': 'fi'}
ROUTES = {
    'home': {'fi': '/', 'en': '/en/'},
    'works': {'fi': '/tyot/', 'en': '/en/work/'},
    'project': {'fi': '/projektit/{}/', 'en': '/en/projects/{}/'},
    'privacy': {'fi': '/tietosuoja/', 'en': '/en/privacy/'},
    'terms': {'fi': '/ehdot/', 'en': '/en/terms/'},
    '404': {'fi': '/404.html', 'en': '/404.html'},
}


def t(fi, en):
    return fi if LANG == 'fi' else en


def path(key, slug=None, lang=None):
    return ROUTES[key][lang or LANG].format(slug)


def u(key, slug=None, frag='', lang=None):
    return P + path(key, slug, lang) + frag


def esc(s):
    return html.escape(s, quote=True)


def ask():
    if LANG == 'fi':
        return 'mailto:' + MAIL + '?subject=' + quote('Demopyyntö') + '&body=' + quote('Hei,\n\nnykyiset sivumme: \nteemme: \nalueemme: \n\n')
    return 'mailto:' + MAIL + '?subject=' + quote('Demo request') + '&body=' + quote('Hi,\n\nour current site: \nwhat we do: \nour area: \n\n')


ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
TICK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" aria-hidden="true"><path d="M4 12.5l5 5 11-11"/></svg>'
CROSS = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
ROCK = f'<img class="rock" src="{L}/luoto-merkki-musta.svg" width="40" height="25" alt="" aria-hidden="true">'


def btn(label=None, href=None, cls=''):
    return f'<a class="btn{cls}" href="{href or ask()}"><span>{label or t("Pyydä ilmainen demo", "Request a free demo")}</span>{ARROW}</a>'


# Prices in each language's own notation
PR = {'fi': dict(m='199 €', y='1 990 €', b='990 €', mo='199 €/kk'), 'en': dict(m='€199', y='€1,990', b='€990', mo='€199/month')}


def pr(k):
    return PR[LANG][k]


def head(key, slug, title, desc, extra=''):
    here = path(key, slug)
    robots = f'<link rel="canonical" href="{SITE}{here}">' if LIVE and key != '404' else '<meta name="robots" content="noindex">'
    alts = '' if key == '404' else ''.join(f'\n  <link rel="alternate" hreflang="{lg}" href="{SITE}{path(key, slug, lg)}">' for lg in ('fi', 'en')) + f'\n  <link rel="alternate" hreflang="x-default" href="{SITE}{path(key, slug, "fi")}">'
    return f'''<!doctype html>
<html lang="{LANG}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>document.documentElement.classList.add('js')</script>
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(desc)}">
  {robots}{alts}
  <meta name="theme-color" content="#0F0F0E">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="{t('fi_FI', 'en_GB')}">
  <meta property="og:locale:alternate" content="{t('en_GB', 'fi_FI')}">
  <meta property="og:site_name" content="Studio Luoto">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:url" content="{SITE}{here}">
  <meta property="og:image" content="{SITE}{L}/og.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{t('Studio Luoto. Verkkosivut, jotka tuovat lisää tarjouspyyntöjä.', 'Studio Luoto. Websites that bring more quote requests.')}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="{L}/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="{A}/fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="{A}/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{L}/luoto.css?v={V}">{extra}
</head>
'''


NAV = {
    'fi': [('Palvelu', 'home', '#palvelu'), ('Näin se toimii', 'home', '#prosessi'), ('Hinnat', 'home', '#hinnat'), ('Työt', 'works', ''), ('Kysymykset', 'home', '#kysymykset')],
    'en': [('Service', 'home', '#palvelu'), ('How it works', 'home', '#prosessi'), ('Pricing', 'home', '#hinnat'), ('Work', 'works', ''), ('Questions', 'home', '#kysymykset')],
}


def nav_links():
    return ''.join(f'<li><a href="{u(k, frag=f)}">{x}</a></li>' for x, k, f in NAV[LANG])


def header(key, slug=None, dark=True):
    o = OTHER[LANG]
    other = P + path(key, slug, o) if key != '404' else u('home', lang=o)
    switch = f'<a class="nav-lang" href="{other}" hreflang="{o}" lang="{o}" aria-label="{"In English" if o == "en" else "Suomeksi"}">{o.upper()}</a>'
    return f'''<body class="{'on-dark' if dark else 'on-light'}">
  <a class="skip" href="#main">{t('Siirry sisältöön', 'Skip to content')}</a>
  <header class="nav" id="top">
    <div class="nav-in">
      <a class="nav-logo" href="{u('home')}"><img src="{L}/luoto-vaaka-musta.svg" width="968" height="145" alt="{t('Studio Luoto, etusivu', 'Studio Luoto, home')}"></a>
      <nav aria-label="{t('Päävalikko', 'Main menu')}"><ul class="nav-links">{nav_links()}</ul></nav>
      {switch}
      <a class="nav-cta" href="{u('home', frag='#yhteys')}">{t('Pyydä demo', 'Request a demo')}</a>
      <button class="nav-btn" type="button" aria-expanded="false" aria-controls="mvalikko"><span>{t('Valikko', 'Menu')}</span><i aria-hidden="true"></i></button>
    </div>
    <div class="mnav" id="mvalikko"><ul>{nav_links()}<li><a href="{u('home', frag='#yhteys')}">{t('Pyydä ilmainen demo', 'Request a free demo')}</a></li></ul><p><a href="tel:{TEL}">{TEL_H}</a> · <a href="mailto:{MAIL}">{MAIL}</a></p></div>
  </header>
'''


def footer():
    return f'''
  <footer class="ftr">
    {shore(seed=11)}
    <div class="ftr-in">
      <div class="ftr-top">
        <p class="ftr-say">{t('Verkkosivut palveluna remontti- ja LVI-yrityksille. Me rakennamme, ylläpidämme ja kehitämme. Sinä keskityt töihin.', 'Websites as a service for renovation and HVAC firms. We build, maintain and improve. You focus on the work.')}</p>
        {btn(cls=' btn-or')}
      </div>
      <div class="ftr-grid">
        <div><p class="lab">{t('Yhteys', 'Contact')}</p><ul><li><a href="mailto:{MAIL}">{MAIL}</a></li><li><a href="tel:{TEL}">{TEL_H}</a></li></ul></div>
        <div><p class="lab">{t('Sivut', 'Pages')}</p><ul>{nav_links()}</ul></div>
        <div><p class="lab">Studio</p><ul><li>Isosaarentie 10, 00840 Helsinki</li><li><a href="{u('privacy')}">{t('Tietosuoja', 'Privacy')}</a></li><li><a href="{u('terms')}">{t('Sopimusehdot', 'Terms')}</a></li><li><a href="{u('home', lang=OTHER[LANG])}" lang="{OTHER[LANG]}" hreflang="{OTHER[LANG]}">{t('In English', 'Suomeksi')}</a></li></ul></div>
      </div>
      <img class="ftr-word" src="{L}/luoto-vaaka-valkoinen.svg" width="968" height="145" alt="" loading="lazy" decoding="async">
      <div class="ftr-bot"><p>© 2026 Studio Luoto · Ville Saarela, {t('Y-tunnus', 'Business ID')} {YT}</p><a href="#top">{t('Ylös', 'Back to top')} ↑</a></div>
    </div>
  </footer>
  <script src="{L}/luoto.js?v={V}" defer></script>
</body>
</html>
'''


# ---------- Front page content ----------

TRADES = {
    'fi': ['Kylpyhuoneremontit', 'Putki- ja linjasaneeraukset', 'LVI ja lämpöpumput', 'Sisäremontit', 'Julkisivut ja katot', 'Hirsitalojen korjaus', 'Keittiöt ja puusepät', 'Metallityö'],
    'en': ['Bathroom renovations', 'Pipe renovations', 'HVAC and heat pumps', 'Interior renovations', 'Facades and roofs', 'Log house restoration', 'Kitchens and joinery', 'Metalwork'],
}
STICKERS = {
    'fi': ['Ei hintaa', 'Ei kuvia kohteista', 'Tarjouspyyntö piilossa', 'Hidas puhelimella', 'Ei näy Googlessa'],
    'en': ['No prices', 'No project photos', 'Quote form hidden', 'Slow on a phone', 'Not on Google'],
}

DO = {
    'fi': [
        ('Verkkosivut', 'Rakennamme sivut, jotka näyttävät yhtä laadukkailta kuin työsi. Tehdään yrityksellesi alusta asti, ei valmispohjasta.'),
        ('Viesti', 'Kirjoitamme tekstit niin, että asiakas ymmärtää heti, mitä teet, missä ja mitä se suunnilleen maksaa.'),
        ('Löydettävyys', 'Palvelut ja paikkakunnat omille sivuilleen, jotta Google ja tekoälyhaut tietävät, mitä teet ja missä.'),
        ('Tarjouspyyntö', 'Lomake, joka kysyy heti oikeat asiat. Saat pyynnön, josta voit laskea hinnan ilman takaisinsoittoa.'),
        ('Luottamus', 'Kohteet, takuu, vakuutukset ja tekijät esille, jotta asiakas valitsee sinut eikä halvinta.'),
    ],
    'en': [
        ('Website', 'We build a site that looks as good as your work. Made for your company from scratch, not from a template.'),
        ('Message', 'We write the copy so that a client understands at once what you do, where, and roughly what it costs.'),
        ('Findability', 'Services and towns get their own pages, so Google and AI search know what you do and where.'),
        ('Quote request', 'A form that asks the right things up front. You get a request you can price without calling back.'),
        ('Trust', 'Projects, guarantee, insurance and your people on show, so the client picks you, not the cheapest.'),
    ],
}

FOR = {
    'fi': [
        ('Remonttiyritykset', 'Kohteet esille ja tarjouspyynnöt oikeilta asiakkailta.', 'tile'),
        ('LVI ja talotekniikka', 'Palvelut, alueet ja päivystys selkeästi esillä.', 'pipe'),
        ('Rakentajat ja puusepät', 'Työ näyttää sivuilla yhtä hyvältä kuin paikan päällä.', 'house'),
    ],
    'en': [
        ('Renovation companies', 'Your projects on show and quote requests from the right clients.', 'tile'),
        ('HVAC and building services', 'Services, areas and emergency call-outs clearly visible.', 'pipe'),
        ('Builders and joiners', 'Your work looks as good on the site as it does in person.', 'house'),
    ],
}

STEPS = {
    'fi': [
        ('Lähetä viesti.', 'Linkki nykyisiin sivuihisi ja pari lausetta riittää. Siihen menee kaksi minuuttia.', 'or', 'msg'),
        ('Saat luonnoksen 48 tunnissa.', 'Toimiva etusivu omassa linkissään. Avaat sen puhelimella ja näytät sen kollegoillesi. Maksuton, eikä sido mihinkään.', 'sea', 'clock'),
        ('Käydään muutokset läpi.', 'Hyväksyt suunnan ja kerrot, mitä haluat muuttaa. Muutamme kaiken, kunnes sivut ovat juuri oikein.', 'ink', 'pins'),
        ('Sivut julki, ja pidämme niistä huolen.', 'Julkaisemme sivut omaan osoitteeseesi. Sen jälkeen ylläpidämme, päivitämme ja kehitämme niitä, ja kaikki sisältyy kuukausihintaan.', 'sand', 'key'),
    ],
    'en': [
        ('Send a message.', 'A link to your current site and a couple of sentences is enough. It takes two minutes.', 'or', 'msg'),
        ('Get a draft in 48 hours.', 'A working front page at its own link. Open it on your phone and show it to your colleagues. Free, with no commitment.', 'sea', 'clock'),
        ('We go through the changes.', 'You approve the direction and tell us what to change. We change everything until the site is just right.', 'ink', 'pins'),
        ('The site goes live, and we look after it.', 'We publish the site at your own address. After that we maintain, update and improve it, all included in the monthly price.', 'sand', 'key'),
    ],
}

ASKS = {
    'fi': [
        ('Hinta', 'Paljonko tämä suunnilleen maksaa?', 'Hinnan suunta ja kotitalousvähennys näkyvät.'),
        ('Kohteet', 'Ovatko he tehneet tällaista ennen?', 'Valmiit kohteet kuvineen ja tietoineen.'),
        ('Luottamus', 'Mitä jos jokin menee vikaan?', 'Takuu ja vakuutukset kerrotaan selvästi.'),
        ('Alue', 'Tulevatko he tänne asti?', 'Palvelualue ja paikkakunnat omilla sivuillaan.'),
        ('Aikataulu', 'Milloin he ehtisivät aloittaa?', 'Seuraava vapaa aloitus näkyy etusivulla.'),
        ('Tekijät', 'Keitä meille tulee töihin?', 'Tekijät nimillä ja kasvoilla.'),
        ('Tarjous', 'Miten tarjous pyydetään?', 'Lyhyt lomake jokaisella sivulla.'),
    ],
    'en': [
        ('Price', 'Roughly how much will this cost?', 'A price range and the household tax credit are shown.'),
        ('Projects', 'Have they done this before?', 'Finished projects with photos and details.'),
        ('Trust', 'What if something goes wrong?', 'Guarantee and insurance stated clearly.'),
        ('Area', 'Do they come out this far?', 'Service area and towns on their own pages.'),
        ('Schedule', 'When could they start?', 'The next free start date on the front page.'),
        ('People', 'Who will be working in our home?', 'Your people with names and faces.'),
        ('Quote', 'How do I ask for a quote?', 'A short form on every page.'),
    ],
}

PAINS = {
    'fi': [
        ('Sivuilta ei selviä heti, mitä teet ja missä.', 'Ensimmäinen lause kertoo palvelut ja alueen. Asiakas tietää heti, onko hän oikeassa paikassa.'),
        ('Valmiita kohteita ei näy.', 'Kohteet kuvineen ja tietoineen: mitä tehtiin, missä ja kauanko se kesti.'),
        ('Hinnasta ei kerrota mitään.', 'Hinnan suunta ja kotitalousvähennys näkyvät, joten tarjousta pyytävät ne, joille hinta sopii.'),
        ('Tarjouspyyntö on piilossa.', 'Tarjouspyyntö on yhden napautuksen päässä joka sivulta.'),
        ('Sivut ovat hitaat puhelimella.', 'Sivut aukeavat nopeasti, ja kaikki toimii peukalolla.'),
        ('Google ei ymmärrä, mitä teet.', 'Jokaisella palvelulla ja alueella on oma sivunsa, joten löydyt oikeista hauista.'),
        ('Takuu ja tekijät eivät näy.', 'Takuu, vakuutukset ja tekijät esillä. Luottamus syntyy ennen ensimmäistä puhelua.'),
        ('Kukaan ei seuraa tuloksia.', 'Search Console ja yhteydenottojen seuranta kuntoon. Näet, mistä tarjouspyynnöt tulevat.'),
    ],
    'en': [
        ('The site does not say at once what you do and where.', 'The first sentence names your services and area. The client knows straight away they are in the right place.'),
        ('No finished projects are shown.', 'Projects with photos and details: what was done, where and how long it took.'),
        ('Nothing is said about price.', 'A price range and the household tax credit are shown, so the people who ask for a quote are the ones the price suits.'),
        ('The quote request is hidden.', 'The quote request is one tap away from every page.'),
        ('The site is slow on a phone.', 'Pages open fast, and everything works with a thumb.'),
        ('Google does not understand what you do.', 'Every service and area has its own page, so you show up in the right searches.'),
        ('Guarantee and people are not visible.', 'Guarantee, insurance and your people on show. Trust is built before the first call.'),
        ('Nobody tracks the results.', 'Search Console and enquiry tracking set up. You see where the quote requests come from.'),
    ],
}

# Website as a service: what a normal agency does, and what we do instead
VS = {
    'fi': (
        ['Iso lasku ennen kuin sivut ovat valmiit.', 'Julkaisun jälkeen hiljaista. Viesteihin vastataan, jos ehditään.', 'Jokainen muutos on uusi tarjous ja uusi lasku.', 'Sivut vanhenevat, koska kenelläkään ei ole aikaa päivittää niitä.', 'Kukaan ei kerro, tuleeko sivujen kautta töitä.'],
        ['0 € aloitusmaksu. Näet demon ennen kuin päätät mitään.', 'Vastaamme aina yhden arkipäivän sisällä.', 'Muutokset kuuluvat hintaan. Pienet ovat sivuilla kahdessa arkipäivässä.', 'Sivut paranevat joka kuukausi: uudet kohteet, palvelut ja korjaukset.', 'Kuukausikatsaus kertoo, montako yhteydenottoa tuli ja mistä.'],
    ),
    'en': (
        ['A big invoice before the site is even finished.', 'Silence after launch. Messages get answered if someone has time.', 'Every change is a new quote and a new invoice.', 'The site goes stale, because nobody has time to update it.', 'Nobody tells you whether the site brings in work.'],
        ['€0 setup. You see the demo before you decide anything.', 'We always reply within one working day.', 'Changes are included. Small ones are live within two working days.', 'The site gets better every month: new projects, services and fixes.', 'A monthly report shows how many enquiries came in and from where.'],
    ),
}

PERKS = {
    'fi': [
        ('Yksi ihminen, joka tuntee yrityksesi', 'Ville vastaa itse. Ei tikettijärjestelmää, ei välikäsiä, eikä sinun tarvitse selittää asioita joka kerta alusta.'),
        ('Ei kirjautumisia eikä opeteltavaa', 'Sinun ei tarvitse oppia julkaisujärjestelmää. Lähetät viestin tai kuvan puhelimella, ja muutos tehdään.'),
        ('Katsaus ja parannusehdotus', 'Joka kuukausi saat luvut ja yhden konkreettisen ehdotuksen siitä, mitä kannattaa tehdä seuraavaksi.'),
        ('Arvostelut kasvuun', 'Saat valmiin arvostelulinkin ja QR-kortin, jolla tyytyväinen asiakas jättää Google-arvostelun suoraan työmaalta.'),
        ('Sesonki mukaan', 'Ennen sesonkia nostamme esiin sen, mitä silloin myydään: lämpöpumput syksyllä, julkisivut ja terassit keväällä.'),
        ('Ei piilokuluja', 'Kaikki hintaan sisältyvä on listattu. Jos jokin maksaa erikseen, kerromme sen ennen kuin teemme mitään.'),
    ],
    'en': [
        ('One person who knows your business', 'Ville replies himself. No ticket system, no middlemen, and no explaining everything from scratch each time.'),
        ('No logins, nothing to learn', 'You never have to learn a content management system. Send a message or a photo from your phone, and the change gets made.'),
        ('A report and a suggestion', 'Every month you get the numbers and one concrete suggestion for what to do next.'),
        ('More reviews', 'You get a ready review link and a QR card, so a happy client can leave a Google review right there on site.'),
        ('Ready for the season', 'Before each season we bring forward what sells then: heat pumps in autumn, facades and decks in spring.'),
        ('No hidden costs', 'Everything included in the price is listed. If something costs extra, we tell you before we do anything.'),
    ],
}

# You say what you want, we take care of it
REQ = {
    'fi': [
        ('Valmistui uusi kohde, tässä kuvat.', 'Kohdesivu kuvineen ja tietoineen julki.', 'big'),
        ('Aloitamme myös saunaremontit.', 'Uusi palvelusivu, ja Google-yritysprofiili päivitetty.', 'big'),
        ('Puhelinnumero vaihtui.', 'Uusi numero kaikkialle, myös Googleen.', 'small'),
        ('Olemme kiinni heinäkuun.', 'Lomailmoitus sivuille ja poikkeusaukiolot profiiliin.', 'small'),
        ('Tarjouspyyntöjä tulee liian kaukaa.', 'Palvelualue ja paikkakuntasivut tarkennettu.', 'big'),
        ('Haluan, että lomakkeella voi lähettää kuvia.', 'Kuvien liittäminen lisätty tarjouspyyntöön.', 'small'),
    ],
    'en': [
        ('We finished a new project, here are the photos.', 'Project page with photos and details live.', 'big'),
        ('We are starting sauna renovations too.', 'New service page, and the Google Business Profile updated.', 'big'),
        ('Our phone number changed.', 'New number everywhere, Google included.', 'small'),
        ('We are closed for July.', 'Holiday notice on the site and special hours on the profile.', 'small'),
        ('Quote requests come from too far away.', 'Service area and town pages narrowed down.', 'big'),
        ('I want clients to be able to send photos.', 'Photo upload added to the quote request.', 'small'),
    ],
}
REQ_TAG = {'fi': {'small': '2 arkipäivää', 'big': 'Kuukauden päivitys'}, 'en': {'small': '2 working days', 'big': 'Monthly update'}}

YEAR1 = {
    'fi': [
        ('Kuukausi 1', 'Sivut julki.', 'Search Console, yhteydenottojen seuranta ja Google-yritysprofiili kuntoon heti alusta.'),
        ('Kuukaudet 2–3', 'Ensimmäiset luvut.', 'Katsomme, mistä yhteydenotot tulevat ja missä kävijät putoavat pois, ja korjaamme sen, mikä jarruttaa.'),
        ('Kuukaudet 4–6', 'Lisää näkyvyyttä.', 'Uusia kohteita sekä palvelu- ja paikkakuntasivuja sinne, mistä haluat lisää töitä.'),
        ('Kuukaudet 7–12', 'Hiotaan sitä, mikä toimii.', 'Sesonkisivut, lisää arvosteluja ja lomake, joka kysyy juuri oikeat asiat.'),
    ],
    'en': [
        ('Month 1', 'The site goes live.', 'Search Console, enquiry tracking and the Google Business Profile set up from day one.'),
        ('Months 2–3', 'The first numbers.', 'We look at where enquiries come from and where visitors drop off, and fix what holds them back.'),
        ('Months 4–6', 'More visibility.', 'New projects plus service and town pages where you want more work.'),
        ('Months 7–12', 'Sharpen what works.', 'Seasonal pages, more reviews and a form that asks exactly the right things.'),
    ],
}

INCLUDED = {
    'fi': [
        'Suunnittelu ja toteutus, enintään 8 sivua',
        'Tekstit ja kuvien käsittely',
        'Ylläpito, hosting, SSL ja varmuuskopiot',
        'Vastaus viesteihin yhden arkipäivän sisällä',
        'Pienet muutokset kahdessa arkipäivässä',
        'Yksi isompi päivitys kuussa, esimerkiksi uusi kohde tai palvelusivu',
        'Löydettävyys: sitemap, Search Console sekä palvelu- ja paikkakuntasivut',
        'Google-yritysprofiilin optimointi',
        'Arvostelulinkki ja QR-kortti Google-arvostelujen keräämiseen',
        'Tarjouspyyntölomake ja yhteydenottojen seuranta',
        'Kuukausikatsaus: montako yhteydenottoa tuli, mistä ja mitä seuraavaksi kannattaa tehdä',
    ],
    'en': [
        'Design and build, up to 8 pages',
        'Copywriting and photo editing',
        'Maintenance, hosting, SSL and backups',
        'Replies to your messages within one working day',
        'Small changes within two working days',
        'One bigger update a month, such as a new project or service page',
        'Findability: sitemap, Search Console, plus service and town pages',
        'Google Business Profile optimisation',
        'A review link and QR card for collecting Google reviews',
        'Quote request form and enquiry tracking',
        'A monthly report: how many enquiries came in, from where, and what to do next',
    ],
}
EXCLUDED = {
    'fi': ['Mainonta, kuten Google Ads ja Meta', 'Logo ja ilme', 'Valokuvaus paikan päällä', 'Verkkokauppa', 'Lisäsivut yli kahdeksan sivun'],
    'en': ['Advertising, such as Google Ads and Meta', 'Logo and brand identity', 'On-site photography', 'Online shop', 'Pages beyond eight'],
}


def terms_list():
    if LANG == 'fi':
        return [('12 kk', 'vähimmäiskesto, sen jälkeen irtisanominen kuukauden varoitusajalla'), ('Domain', 'on aina sinun'),
                (pr('b'), 'lunastat sivut omaksesi, kun 12 kuukautta on täynnä'), ('24 kk', 'jälkeen sivut siirtyvät sinulle maksutta')]
    return [('12 months', 'minimum term, then one month’s notice'), ('Domain', 'always belongs to you'),
            (pr('b'), 'buys the site outright once 12 months are up'), ('24 months', 'and the site is transferred to you free')]


FAQ = {
    'fi': [
        ('Miten tämä eroaa tavallisesta mainostoimistosta?', 'Tavallinen toimisto tekee sivut, laskuttaa ja siirtyy seuraavaan projektiin. Me jäämme: ylläpidämme sivuja, teemme muutokset ja kehitämme niitä joka kuukausi, jotta niiden kautta tulee töitä. Ja näet demon ennen kuin maksat mitään.'),
        ('Pitääkö minun päivittää sivuja itse?', 'Ei. Kerrot vain, mitä haluat muuttaa: viestillä, kuvalla tai puhelulla. Sinun ei tarvitse kirjautua mihinkään eikä opetella julkaisujärjestelmää.'),
        ('Kuinka nopeasti vastaatte?', 'Yhden arkipäivän sisällä, aina. Pienet muutokset ovat sivuilla kahdessa arkipäivässä, ja isommat tehdään kuukauden päivityksessä.'),
        ('Ehdinkö tähän kesken työmaiden?', 'Ehdit. Meille riittää linkki ja muutama lause. Demon teemme me, ja voit katsoa sen puhelimella illalla.'),
        ('Onko demo vain kuva?', 'Ei. Demo on toimiva etusivu omassa linkissään. Voit avata sen puhelimella ja tietokoneella ja näyttää sen kollegoillesi.'),
        ('Mitä demo maksaa?', 'Ei mitään. Demo on maksuton, eikä se sido mihinkään.'),
        ('Mitä sivut maksavat?', '199 € kuussa + alv, eikä aloitusmaksua ole. Voit myös maksaa vuoden kerralla, 1 990 € + alv, jolloin kaksi kuukautta on kaupan päälle. Hintaan sisältyy suunnittelu, toteutus, ylläpito, muutokset ja päivitykset.'),
        ('Miksi kuukausihinta eikä kertamaksu?', 'Sivut eivät ole valmiit julkaisupäivänä. Kuukausihinnalla ne pysyvät ajan tasalla ja paranevat: uudet kohteet, palvelut ja korjaukset tehdään ilman erillisiä tarjouksia, eikä sinun tarvitse maksaa tuhansia euroja kerralla.'),
        ('Mitä jos haluan lopettaa?', 'Vähimmäiskesto on 12 kuukautta, ja sen jälkeen voit irtisanoa sopimuksen kuukauden varoitusajalla. Domain on aina sinun. Sivut voit lunastaa omaksesi 990 eurolla, ja 24 kuukauden jälkeen ne siirtyvät sinulle maksutta.'),
        ('Miten tarjouspyyntötakuu toimii?', 'Jos sivujen tarjouspyyntölomakkeen kautta ei tule yhtään tarjouspyyntöä kolmen ensimmäisen kuukauden aikana julkaisusta, seuraavat kolme kuukautta ovat ilmaisia. Seurannasta näet itse, mitä lomakkeen kautta tulee.'),
        ('Kauanko projekti kestää?', 'Yleensä kahdesta neljään viikkoa. Demo on valmis 48 tunnissa, ja aikataulu sovitaan ennen aloitusta.'),
        ('Meillä ei ole hyviä kuvia.', 'Puhelimella otetut kuvat kelpaavat alkuun. Käsittelemme ne niin, että työ näyttää sivuilla samalta kuin todellisuudessa.'),
        ('Mitä julkaisun jälkeen tapahtuu?', 'Pienet muutokset teemme kahdessa arkipäivässä, ja kerran kuussa teemme isomman päivityksen, kuten uuden kohteen tai palvelusivun. Saat joka kuukausi lyhyen katsauksen: montako yhteydenottoa tuli, mistä ja mitä seuraavaksi kannattaa tehdä.'),
        ('Mitä saan käteeni?', 'Valmiit sivut omassa osoitteessasi ja niiden jatkuvan ylläpidon ja kehityksen: suunnittelun, tekstit, kuvien käsittelyn, toimivuuden puhelimella, löydettävyyden ja Google-yritysprofiilin kunnostuksen. Domain on aina sinun.'),
        ('Kenen kanssa teen töitä?', 'Ville Saarelan. Hän suunnittelee, kirjoittaa ja tekee sivut itse, ilman välikäsiä, ja vastaa itse jokaiseen viestiin.'),
        ('Ovatko työt oikeita asiakkaita?', 'Osa töistä on konsepteja: kuvitteellisia yrityksiä, joilla näytämme, mitä alan sivut voivat tehdä. Se kerrotaan jokaisen työn sivulla.'),
    ],
    'en': [
        ('How is this different from a normal agency?', 'A normal agency builds the site, sends the invoice and moves on to the next project. We stay: we maintain the site, make the changes and improve it every month so that it brings in work. And you see a demo before you pay anything.'),
        ('Do I have to update the site myself?', 'No. Just tell us what you want changed: by message, photo or phone call. You never have to log in anywhere or learn a content management system.'),
        ('How fast do you reply?', 'Within one working day, always. Small changes are live within two working days, and bigger ones go into the monthly update.'),
        ('Do I have time for this between jobs?', 'Yes. A link and a few sentences are all we need. We make the demo, and you can look at it on your phone in the evening.'),
        ('Is the demo just a picture?', 'No. The demo is a working front page at its own link. You can open it on your phone and computer and show it to your colleagues.'),
        ('What does the demo cost?', 'Nothing. The demo is free and comes with no commitment.'),
        ('What does the site cost?', '€199 a month + VAT, with no setup fee. You can also pay for a year at once, €1,990 + VAT, which gives you two months free. The price covers design, build, maintenance, changes and updates.'),
        ('Why a monthly price and not a one-off fee?', 'A site is not finished on launch day. With a monthly price it stays up to date and keeps improving: new projects, services and fixes are done without separate quotes, and you do not have to pay thousands of euros at once.'),
        ('What if I want to stop?', 'The minimum term is 12 months, and after that you can end the contract with one month’s notice. The domain is always yours. You can buy the site outright for €990, and after 24 months it is transferred to you free.'),
        ('How does the quote request guarantee work?', 'If the site’s quote request form brings in no quote requests in the first three months after launch, the next three months are free. The tracking lets you see for yourself what comes through the form.'),
        ('How long does the project take?', 'Usually two to four weeks. The demo is ready in 48 hours, and the schedule is agreed before we start.'),
        ('We do not have good photos.', 'Photos taken on a phone are fine to start with. We edit them so your work looks on the site the way it does in real life.'),
        ('What happens after launch?', 'We make small changes within two working days, and once a month we do a bigger update, such as a new project or service page. Every month you get a short report: how many enquiries came in, from where, and what to do next.'),
        ('What do I actually get?', 'A finished site at your own address with ongoing maintenance and improvement: design, copy, photo editing, a site that works on a phone, findability and a tuned-up Google Business Profile. The domain is always yours.'),
        ('Who will I be working with?', 'Ville Saarela. He designs, writes and builds the sites himself, with no middlemen, and replies to every message himself.'),
        ('Are the projects real clients?', 'Some of the work is concept work: fictional companies that show what a site in the trade can do. This is stated on every project page.'),
    ],
}


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
        body = (card(40, 50, 360, 70, 35) + f'<circle cx="80" cy="85" r="10" fill="#FF5B1F" stroke="#0F0F0E" stroke-width="3"/><text x="104" y="95" font-family="Archivo, sans-serif" font-weight="600" font-size="26" fill="#0F0F0E">{t("www.yrityksesi.fi", "www.yourcompany.fi")}</text>'
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


def partner():
    old, new = VS[LANG]
    a = ''.join(f'<li><i>{CROSS}</i>{x}</li>' for x in old)
    b = ''.join(f'<li><i>{TICK}</i>{x}</li>' for x in new)
    perks = '\n'.join(f'        <li class="rv"><span class="lab">{i + 1:02d}</span><h3>{h}</h3><p>{d}</p></li>' for i, (h, d) in enumerate(PERKS[LANG]))
    return f'''
    <section class="wrap sec" id="kumppani" aria-labelledby="kumppani-h">
      <div class="split">
        <div><p class="lab rv">{t('Verkkosivut palveluna', 'Website as a service')}</p>
        <h2 class="d2 rv" id="kumppani-h">{t('Tavallinen toimisto tekee sivut ja katoaa. <em>Me jäämme.</em>', 'A normal agency builds the site and disappears. <em>We stay.</em>')}</h2></div>
        <p class="lead rv">{t('Emme ole projektitoimisto, vaan kasvukumppani. Sivut eivät ole valmiit julkaisupäivänä, joten emme mekään lähde mihinkään.', 'We are not a project agency, we are a growth partner. A site is not finished on launch day, so we do not go anywhere either.')}</p>
      </div>
      <div class="vs">
        <div class="vs-a rv"><h3 class="lab">{t('Tavallinen toimisto', 'A normal agency')}</h3><ul>{a}</ul></div>
        <div class="vs-b rv"><h3 class="lab"><img src="{L}/luoto-merkki-valkoinen.svg" width="40" height="25" alt="">Studio Luoto</h3><ul>{b}</ul></div>
      </div>
      <h3 class="d3 rv perks-h">{t('Kasvukumppani tarkoittaa käytännössä tätä.', 'This is what a growth partner means in practice.')}</h3>
      <ul class="perks">
{perks}
      </ul>
    </section>'''


def requests():
    tag = REQ_TAG[LANG]
    rows = '\n'.join(f'''        <li class="rv"><p class="req-q"><span class="sr">{t('Sinä:', 'You:')} </span>{q}</p><span class="req-ar" aria-hidden="true">{ARROW}</span><p class="req-a"><i>{TICK}</i><span><span class="sr">{t('Me:', 'Us:')} </span>{a}</span></p><span class="tag tag-{k}">{tag[k]}</span></li>''' for q, a, k in REQ[LANG])
    return f'''
    <section class="wrap sec" id="hoidamme" aria-labelledby="hoidamme-h">
      <div class="req-w">
        <div class="split">
          <h2 class="d2 rv" id="hoidamme-h">{t('Sinä sanot, mitä haluat. <em>Me hoidamme loput.</em>', 'You say what you want. <em>We take care of the rest.</em>')}</h2>
          <p class="lead rv">{t('Lähetä viesti, kuva tai soita. Ei kirjautumisia, ei julkaisujärjestelmää, ei opeteltavaa. Muutos on sivuilla, ja kuittaamme, kun se on tehty.', 'Send a message or a photo, or call. No logins, no content management system, nothing to learn. The change goes live, and we let you know when it is done.')}</p>
        </div>
        <ul class="req">
{rows}
        </ul>
        <p class="small req-note">{t('Esimerkkejä tavallisista pyynnöistä. Pienet muutokset tehdään kahdessa arkipäivässä, isommat kuukauden päivityksessä. Kaikki sisältyy hintaan.', 'Examples of typical requests. Small changes are done within two working days, bigger ones in the monthly update. All included in the price.')}</p>
      </div>
    </section>'''


def year_one():
    items = '\n'.join(f'        <li class="rv"><span class="pill{" pill-or" if i == 0 else ""}">{m}</span><h3>{h}</h3><p>{d}</p></li>' for i, (m, h, d) in enumerate(YEAR1[LANG]))
    return f'''
    <section class="wrap sec" id="vuosi" aria-labelledby="vuosi-h">
      <p class="lab rv">{t('Julkaisun jälkeen', 'After launch')}</p>
      <h2 class="d2 rv" id="vuosi-h">{t('Julkaisu on vasta alku. <em>Näin ensimmäinen vuosi etenee.</em>', 'Launch is only the start. <em>This is how the first year goes.</em>')}</h2>
      <ol class="yr">
{items}
      </ol>
      <p class="yr-all rv"><b>{t('Joka kuukausi', 'Every month')}</b><span>{t('Katsaus luvuista, yksi parannusehdotus ja vastaus jokaiseen viestiin yhden arkipäivän sisällä.', 'A report on the numbers, one suggestion for improvement, and a reply to every message within one working day.')}</span></p>
    </section>'''


def home():
    trades = ''.join(f'<li>{ROCK}<span>{x}</span></li>' for x in TRADES[LANG])
    stk = ''.join(f'<li>{s}</li>' for s in STICKERS[LANG])
    do = '\n'.join(f'        <li class="rv"><span class="lab">{i + 1:02d} / {h}</span><p>{d}</p></li>' for i, (h, d) in enumerate(DO[LANG]))
    fors = '\n'.join(f'        <li class="rv"><div class="for-ill">{ill(k)}</div><p class="lab">{h}</p><h3>{d}</h3></li>' for h, d, k in FOR[LANG])
    steps = '\n'.join(f'''      <li class="step rv">
        <div class="step-t"><span class="pill">{i + 1:02d}</span><h3 class="d3">{h}</h3><p>{d}</p></div>
        <div class="panel panel-{c}">{ill(k)}</div>
      </li>''' for i, (h, d, c, k) in enumerate(STEPS[LANG]))
    asks = '\n'.join(f'        <li class="rv"><span class="lab">{c}</span><q>{q}</q><span class="qa-a"><i>{TICK}</i>{a}</span></li>' for c, q, a in ASKS[LANG])
    pains = '\n'.join(f'        <li class="rv"><span class="pill pill-or">{i + 1:02d}</span><h3>{p}</h3><p>{f}</p></li>' for i, (p, f) in enumerate(PAINS[LANG]))
    faq = '\n'.join(f'          <details><summary><span>{esc(q)}</span><i aria-hidden="true"></i></summary><p>{esc(a)}</p></details>' for q, a in FAQ[LANG])
    ld = {"@context": "https://schema.org", "@type": "ProfessionalService", "name": "Studio Luoto", "url": SITE + path('home'), "inLanguage": LANG,
          "description": t("Verkkosivut palveluna remontti- ja LVI-yrityksille: suunnittelu, toteutus, ylläpito ja kehitys kuukausihinnalla.", "Websites as a service for renovation and HVAC firms: design, build, maintenance and improvement for a monthly price."),
          "email": MAIL, "telephone": TEL, "makesOffer": {"@type": "Offer", "name": t("Verkkosivut palveluna", "Website as a service"), "price": "199", "priceCurrency": "EUR",
                                                          "description": t("Suunnittelu, toteutus, ylläpito, muutokset ja päivitykset. 12 kuukauden vähimmäiskesto. Hinta + alv.", "Design, build, maintenance, changes and updates. 12-month minimum term. Price + VAT.")},
          "founder": {"@type": "Person", "name": "Ville Saarela"},
          "address": {"@type": "PostalAddress", "streetAddress": "Isosaarentie 10", "postalCode": "00840", "addressLocality": "Helsinki", "addressCountry": "FI"}}
    video = t('prosessi', 'prosessi-en')
    film_txt = t('Video, 40 sekuntia: Joka ilta joku etsii remonttia puhelimellaan. Jos sivusi eivät vakuuta, tarjouspyyntö menee kilpailijalle. Näin se toimii: 1. Lähetä viesti. 2. Saat luonnoksen 48 tunnissa. 3. Hyväksyt suunnan, ja muutamme kaiken, kunnes sivut ovat juuri oikein. 4. Sivut julkaistaan omaan osoitteeseesi, ja pidämme niistä huolen kuukausihinnalla. Pyydä ilmainen demo.',
                 'Video, 40 seconds: Every evening someone looks for a renovation on their phone. If your site does not convince, the quote request goes to a competitor. How it works: 1. Send a message. 2. Get a draft in 48 hours. 3. You approve the direction, and we change everything until the site is just right. 4. The site goes live at your own address, and we look after it for a monthly price. Request a free demo.')
    return head('home', None, t('Studio Luoto · Verkkosivut palveluna remontti- ja LVI-yrityksille', 'Studio Luoto · Websites as a service for renovation and HVAC firms'),
                t('Studio Luoto rakentaa, ylläpitää ja kehittää remontti- ja LVI-yritysten verkkosivuja kuukausihinnalla, jotta ne tuovat lisää asiakkaita ja tarjouspyyntöjä. Ilmainen demo 48 tunnissa.',
                  'Studio Luoto builds, maintains and improves websites for renovation and HVAC firms for a monthly price, so they bring in more clients and quote requests. Free demo in 48 hours.'),
                f'\n  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>') + header('home') + f'''
  <main id="main">
    <section class="hero" aria-labelledby="h1">
      <div class="hero-in">
        <p class="hero-lab rv"><span class="dot"></span>{t('Verkkosivut palveluna remontti- ja LVI-yrityksille', 'Websites as a service for renovation and HVAC firms')}</p>
        <h1 class="d1 rv" id="h1">{t('Verkkosivut, jotka tuovat remontti&shy;yrityksellesi <em>lisää tarjous&shy;pyyntöjä.</em>', 'Websites that bring your renovation business <em>more quote requests.</em>')}</h1>
        <p class="hero-p rv">{t('Me rakennamme, ylläpidämme ja kehitämme sivujasi kuukausihinnalla. Sinä kerrot, mitä haluat, ja me hoidamme loput. Näet uuden etusivusi ennen kuin maksat mitään.', 'We build, maintain and improve your site for a monthly price. You tell us what you want, and we take care of the rest. You see your new front page before you pay anything.')}</p>
        <div class="hero-do rv">{btn(cls=' btn-or')}<a class="link-lt" href="{u('works')}">{t('Katso työt', 'See the work')}</a></div>
        <ul class="proof rv">
          <li><span class="proof-ic">48 h</span><span><b>{t('Ilmainen demo 48 tunnissa', 'Free demo in 48 hours')}</b><span>{t('Toimiva etusivu, ei kuva. Ei sido mihinkään.', 'A working front page, not a picture. No commitment.')}</span></span></li>
          <li><span class="proof-ic">€</span><span><b>{t('199 €/kk, kaikki hoidossa', '€199/month, all taken care of')}</b><span>{t('Ei aloitusmaksua. Muutokset ja ylläpito mukana.', 'No setup fee. Changes and maintenance included.')}</span></span></li>
          <li><img src="{A}/img/valtteri-96.webp" width="96" height="96" alt="" loading="lazy" decoding="async"><span><b>{t('”Sivut saavat ihmiset innostumaan jo ennen julkaisua.”', '“The site gets people excited even before launch.”')}</b><span>Valtteri Viitala, BuffBird Oy</span></span></li>
        </ul>
      </div>
    </section>

    <section class="trades" aria-label="{t('Alat, joille teemme sivuja', 'Trades we build sites for')}">
      <p class="lab">{t('Teemme sivuja näille aloille', 'We build sites for these trades')}</p>
      <div class="marq"><ul>{trades}</ul><ul aria-hidden="true">{trades}</ul></div>
    </section>

    <section class="wrap sec" id="ongelma" aria-labelledby="ongelma-h">
      <div class="prob">
        <p class="lab lab-lt rv">{t('Ongelma', 'The problem')}</p>
        <h2 class="d2 rv" id="ongelma-h">{t('Useimmat remonttisivut näyttävät siisteiltä. <em>Tarjouspyyntöjä ne eivät tuo.</em>', 'Most renovation sites look tidy. <em>They do not bring quote requests.</em>')}</h2>
        <p class="prob-p rv">{t('Sivut tehtiin kerran, eikä kukaan ole sen jälkeen katsonut, tuleeko niiden kautta töitä. Asiakas vertaa illalla kolmea yritystä puhelimellaan ja pyytää tarjouksen siltä, jonka sivuilta löytyvät vastaukset.', 'The site was made once, and nobody has checked since whether it brings in work. In the evening a client compares three companies on their phone and asks for a quote from the one whose site has the answers.')}</p>
        <p class="prob-b rv">{t('Sivusi päättävät, soittaako asiakas sinulle vai kilpailijalle.', 'Your site decides whether the client calls you or a competitor.')}</p>
        <ul class="stk" aria-label="{t('Tavallisimmat puutteet', 'The most common gaps')}">{stk}</ul>
      </div>
    </section>

    <section class="dark" id="palvelu" aria-labelledby="palvelu-h">
      {shore(seed=5)}
      <div class="wrap dark-in">
        <h2 class="d2 rv" id="palvelu-h">{t('Emme tee pelkkiä verkkosivuja. <em>Autamme sinua saamaan lisää asiakkaita.</em>', 'We do not just make websites. <em>We help you win more clients.</em>')}</h2>
        <p class="lead-lt rv">{t('Optimoimme jokaisen sivun yhteen tehtävään: että oikea asiakas löytää sinut ja pyytää tarjouksen.', 'We optimise every page for one job: the right client finds you and asks for a quote.')}</p>
        <ol class="five">
{do}
        </ol>
        <a class="link-lt rv" href="#yhteys">{t('Katso, miten tämä toimisi sinun sivuillasi →', 'See how this would work on your site →')}</a>
      </div>
    </section>
{partner()}

    <section class="wrap sec" aria-labelledby="kenelle-h">
      <div class="sea">
        <h2 class="d2 rv" id="kenelle-h">{t('Studio Luoto on <em>remontti- ja LVI-yrityksille.</em>', 'Studio Luoto is <em>for renovation and HVAC firms.</em>')}</h2>
        <ul class="for">
{fors}
        </ul>
      </div>
    </section>

    <section class="wrap sec" id="prosessi" aria-labelledby="prosessi-h">
      <p class="lab rv">{t('Näin se toimii', 'How it works')}</p>
      <h2 class="d2 rv" id="prosessi-h">{t('Viestistä valmiisiin sivuihin. <em>Neljä vaihetta.</em>', 'From a message to a finished site. <em>Four steps.</em>')}</h2>
      <figure class="film rv">
        <video muted loop playsinline preload="none" poster="{L}/video/{video}.jpg" width="1920" height="1080" aria-describedby="film-txt">
          <source src="{L}/video/{video}.webm" type="video/webm">
          <source src="{L}/video/{video}.mp4" type="video/mp4">
        </video>
        <button class="film-t" type="button" aria-pressed="true" data-play="{t('Toista', 'Play')}" data-pause="{t('Pysäytä', 'Pause')}">{t('Toista', 'Play')}</button>
        <figcaption class="sr" id="film-txt">{film_txt}</figcaption>
      </figure>
      <ol class="steps">
{steps}
      </ol>
      <div class="center rv">{btn()}<p class="small">{t('Maksuton. Ei sido mihinkään.', 'Free. No commitment.')}</p></div>
    </section>
{requests()}
{year_one()}
{pricing()}

    <section class="wrap sec" id="vastaukset" aria-labelledby="vastaukset-h">
      <div class="split">
        <h2 class="d2 rv" id="vastaukset-h">{t('Asiakkaasi kysyy. <em>Sivut vastaavat.</em>', 'Your client asks. <em>The site answers.</em>')}</h2>
        <p class="lead rv">{t('Nämä asiat asiakas haluaa tietää ennen kuin pyytää tarjouksen. Kun vastaukset löytyvät sivuilta, puhelin soi useammin ja oikeista asioista.', 'These are the things a client wants to know before asking for a quote. When the answers are on the site, the phone rings more often, and about the right things.')}</p>
      </div>
      <ul class="qa">
{asks}
      </ul>
    </section>

    <section class="wrap sec" id="miksi" aria-labelledby="miksi-h">
      <h2 class="d2 rv" id="miksi-h">{t('Miksi nykyiset sivut eivät tuo töitä. <em>Ja mitä niille tehdään.</em>', 'Why your current site does not bring in work. <em>And what we do about it.</em>')}</h2>
      <ul class="pains">
{pains}
      </ul>
    </section>

    <section class="wrap sec" aria-labelledby="sanoin-h">
      <figure class="quote rv">
        <h2 class="lab" id="sanoin-h">{t('Asiakkaan sanoin', 'In a client’s words')}</h2>
        <blockquote><p>{t('”Ville teki sivut, jotka saavat ihmiset innostumaan BuffBirdista jo ennen julkaisua.”', '“Ville made a site that gets people excited about BuffBird even before launch.”')}</p></blockquote>
        <figcaption><img src="{A}/img/valtteri-96.webp" width="96" height="96" alt="" loading="lazy" decoding="async"><span><b>Valtteri Viitala</b><span>{t('Toimitusjohtaja, BuffBird Oy', 'CEO, BuffBird Oy. Translated from Finnish.')}</span></span></figcaption>
      </figure>
      <div class="band rv"><h2 class="d3">{t('Katso, miltä tämä näyttää valmiina.', 'See what this looks like finished.')}</h2>{btn(t('Viimeisimmät työt', 'Latest work'), u('works'), ' btn-ink')}</div>
    </section>

    <section class="wrap sec" id="kysymykset" aria-labelledby="kysymykset-h">
      <div class="faq-w">
        <h2 class="d2 rv" id="kysymykset-h">{t('Usein kysyttyä', 'Frequently asked')}</h2>
        <div class="faq rv">
{faq}
        </div>
      </div>
    </section>

    <section class="wrap sec" aria-labelledby="ville-h">
      <div class="founder rv">
        <img src="{A}/img/ville-480.webp" width="480" height="480" alt="Ville Saarela" loading="lazy" decoding="async">
        <div>
          <h2 class="d2" id="ville-h">{t('Vielä kysyttävää? <em>Kysy suoraan Villeltä.</em>', 'Still have questions? <em>Ask Ville directly.</em>')}</h2>
          <p>{t('Ville Saarela, Studio Luoton perustaja. Vastaa itse jokaiseen viestiin ja puheluun, myös julkaisun jälkeen.', 'Ville Saarela, founder of Studio Luoto. Answers every message and call himself, after launch too.')}</p>
          <div class="hero-do">{btn(t('Soita ', 'Call ') + TEL_H, 'tel:' + TEL, ' btn-or')}<a class="link-lt" href="mailto:{MAIL}">{MAIL}</a></div>
        </div>
      </div>
    </section>
{contact()}
  </main>
''' + footer()


def pricing():
    inc = ''.join(f'<li><i>{TICK}</i>{x}</li>' for x in INCLUDED[LANG])
    exc = ''.join(f'<li>{x}</li>' for x in EXCLUDED[LANG])
    terms = ''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a, b in terms_list())
    return f'''
    <section class="wrap sec" id="hinnat" aria-labelledby="hinnat-h">
      <p class="lab rv" style="text-align:center">{t('Hinnat', 'Pricing')}</p>
      <h2 class="d2 rv" id="hinnat-h" style="text-align:center;max-width:18ch;margin:14px auto 0">{t('Yksi hinta. <em>Kaikki hoidossa.</em>', 'One price. <em>Everything taken care of.</em>')}</h2>
      <div class="price">
        <div class="price-main rv">
          <p class="lab">{t('Verkkosivut palveluna', 'Website as a service')}</p>
          <p class="price-n"><b>{pr('m')}</b><span>{t('/kk + alv', '/month + VAT')}</span></p>
          <p class="price-sub">{t('0 € aloitusmaksu. Ilmainen demo ensin.', '€0 setup fee. Free demo first.')}</p>
          <p class="price-year"><b>{t(f'tai {pr("y")} + alv vuodelta', f'or {pr("y")} + VAT a year')}</b> · {t('kaksi kuukautta kaupan päälle', 'two months free')}</p>
          <div class="hero-do" style="justify-content:flex-start">{btn(cls=' btn-or')}</div>
          <ul class="terms-l">{terms}</ul>
          <p class="small">{t('Palvelu on tarkoitettu yrityksille.', 'The service is for businesses.')} <a href="{u('terms')}">{t('Sopimusehdot', 'Terms')}</a></p>
        </div>
        <div class="price-inc rv">
          <h3 class="lab">{t('Hintaan sisältyy', 'Included')}</h3>
          <ul class="inc">{inc}</ul>
          <h3 class="lab" style="margin-top:28px">{t('Ei sisälly', 'Not included')}</h3>
          <ul class="exc">{exc}</ul>
        </div>
      </div>
      <div class="price-x">
        <div class="guar rv"><span class="pill pill-or">{t('Takuu', 'Guarantee')}</span><h3 class="d3">{t('Tarjouspyyntötakuu', 'Quote request guarantee')}</h3><p>{t('Jos sivujen kautta ei tule yhtään tarjouspyyntöä kolmen ensimmäisen kuukauden aikana, seuraavat kolme kuukautta ovat ilmaisia.', 'If the site brings in no quote requests in the first three months, the next three months are free.')}</p></div>
        <div class="first rv"><span class="pill">{t('Kolme ensimmäistä', 'The first three')}</span><h3 class="d3">{t('Ensimmäinen kuukausi ilmaiseksi', 'First month free')}</h3><p>{t('Kolmelle ensimmäiselle asiakkaalle ensimmäinen kuukausi on ilmainen, kun annat suosittelun ja luvan kertoa projektista sivuillamme.', 'For the first three clients the first month is free, in return for a testimonial and permission to tell the story of the project on our site.')}</p></div>
      </div>
    </section>'''


def contact():
    return f'''
    <section class="wrap sec" id="yhteys" aria-labelledby="yhteys-h">
      <div class="cta rv">
        <h2 class="d1" id="yhteys-h">{t('Pyydä ilmainen demo.', 'Request a free demo.')}</h2>
        <p>{t('Lähetä linkki nykyisiin sivuihisi ja kerro, mitä teette ja missä. Näet uuden etusivusi 48 tunnissa. Maksuton, eikä sido mihinkään. Jos jatketaan, hoidamme kaiken sen jälkeen.', 'Send a link to your current site and tell us what you do and where. You will see your new front page in 48 hours. Free, with no commitment. If we go ahead, we take care of everything after that.')}</p>
        <div class="hero-do">{btn(t('Lähetä demopyyntö', 'Send a demo request'), None, ' btn-ink')}<a class="link-dk" href="tel:{TEL}">{t('tai soita', 'or call')} {TEL_H}</a></div>
      </div>
    </section>'''


# ---------- Work ----------

def works_list():
    return WORKS_ALL[LANG]


def tile(w, eager=False):
    s, b = w['slug'], f'{A}/img/projektit/{w["slug"]}'
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return f'''      <li class="tile rv"><a href="{u('project', s)}">
        <span class="tile-img"><img src="{b}/cover-960.webp" srcset="{b}/cover-960.webp 960w, {b}/cover.webp 1600w" sizes="(min-width: 900px) 46vw, 100vw" width="1600" height="1000" alt="{esc(w["name"])}: {t('sivuston etusivu', 'the site’s front page')}" {load} decoding="async"></span>
        <span class="tile-row"><span><b>{w['name']}</b><span>{w['title']}</span></span><span class="tag">{w['ala']}</span></span>
      </a></li>'''


def works():
    tiles = '\n'.join(tile(w, i < 2) for i, w in enumerate(works_list()))
    lead = t('Kahdeksan sivustoa: kylpyhuoneremonttiyritys, LVI-yritys, keittiöpuuseppä, kaksi arkkitehtitoimistoa, sisustusarkkitehti, muotoilustudio ja vaatemerkki. Jokaisen sivulla kerromme, mistä lähdettiin ja mitä sivusto tekee yritykselle.',
             'Eight sites: a bathroom renovation company, an HVAC company, a kitchen joinery, two architecture firms, an interior architect, a design studio and a clothing brand. On each page we explain where we started and what the site does for the business.')
    return head('works', None, t('Viimeisimmät työt · Studio Luoto', 'Latest work · Studio Luoto'),
                t('Kahdeksan sivustoa: kylpyhuoneremonttiyritys, LVI-yritys, keittiöpuuseppä, arkkitehtitoimistoja, sisustusarkkitehti, muotoilustudio ja vaatemerkki.', 'Eight sites: a bathroom renovation company, an HVAC company, a kitchen joinery, architecture firms, an interior architect, a design studio and a clothing brand.')) + header('works', dark=False) + f'''
  <main id="main">
    <section class="wrap page-top" aria-labelledby="h1">
      <p class="lab rv">{t('Työt', 'Work')}</p>
      <h1 class="d1 rv" id="h1">{t('Viimeisimmät <em>työt.</em>', 'Latest <em>work.</em>')}</h1>
      <p class="lead rv">{lead}</p>
    </section>
    <section class="wrap sec-s" aria-label="{t('Työt', 'Work')}">
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
    ws = works_list()
    s, sh, a = w['slug'], w['short'], w['alt']
    nxt = ws[(i + 1) % len(ws)]
    b = f'{A}/img/projektit/{s}'
    does = ''.join(f'<li><b>{x}</b><span>{d}</span></li>' for x, d in w['does'])
    made = ''.join(f'<li>{m}</li>' for m in w['made'])
    def sec(title, body):
        return f'''
    <section class="wrap ps"><div class="split"><h2 class="d3 rv">{title}</h2><div class="ps-b rv">{body}</div></div></section>'''
    return head('project', s, f'{w["name"]}: {w["title"]} · {t("Konsepti", "Concept")} · Studio Luoto', f'{w["title"]}. {w["desc"]}') + header('project', s, dark=False) + f'''
  <main id="main">
    <article>
      <header class="wrap page-top">
        <p class="lab rv"><a href="{u('works')}">{t('Työt', 'Work')}</a> / {i + 1:02d}</p>
        <h1 class="d1 rv">{w['name']}</h1>
        <p class="d3 g rv">{w['title']}.</p>
        <dl class="facts rv">
          <div><dt class="lab">{t('Ala', 'Field')}</dt><dd>{w['ala']}</dd></div>
          <div><dt class="lab">{t('Paikkakunta', 'Location')}</dt><dd>{w['city']}</dd></div>
          <div><dt class="lab">{t('Työ', 'Work')}</dt><dd>{w['work']}</dd></div>
          <div><dt class="lab">{t('Sivusto', 'Site')}</dt><dd>{w['site']}</dd></div>
        </dl>
        <p class="concept rv"><span class="pill pill-or">{t('Konsepti', 'Concept')}</span>{w['concept']}</p>
      </header>
      <figure class="wrap p-hero rv"><img src="{b}/cs/koti-960.webp" srcset="{b}/cs/koti-960.webp 960w, {b}/cs/koti.webp 1600w" sizes="100vw" width="1600" height="1000" alt="{esc(sh)}: {t('etusivu', 'front page')}" fetchpriority="high" decoding="async"></figure>
{sec(t('Lähtökohta', 'Starting point'), ''.join(f'<p>{p}</p>' for p in w['start']))}
      <div class="wrap pg pg-2">{fig(f'{b}/cs/lista.webp', f'{sh}: {a["lista"]}', 1600, 1000, '(min-width: 900px) 46vw, 100vw')}{fig(f'{b}/cs/kohde.webp', f'{sh}: {a["kohde"]}', 1600, 1000, '(min-width: 900px) 46vw, 100vw')}</div>
{sec(t('Ratkaisu', 'Solution'), f'<p>{w["solution"]}</p>')}
      <div class="wrap pg">{fig(f'{b}/cs/kohde-2.webp', f'{sh}: {a["kohde"]}, {t("tiedot", "details")}', 1600, 1000)}</div>
{sec(t('Mitä sivusto tekee', 'What the site does'), f'<ol class="does">{does}</ol>')}
{sec(t('Toteutus', 'Build'), f'<ul class="made">{made}</ul><p class="g">{w["mobile"]}</p>')}
      <div class="wrap pg pg-3">{''.join(fig(f'{b}/mobile-{k}.webp', t(f'{sh} puhelimella, näkymä {k}', f'{sh} on a phone, view {k}'), 600, 1298) for k in (1, 2, 3))}</div>
      <div class="wrap pg">{fig(f'{b}/cs/hinnat.webp', f'{sh}: {a["hinnat"]}', 1600, 1000)}</div>
      <div class="wrap p-foot"><p class="small">{w['credits']}{t('', ' The site itself is in Finnish.')}</p>{btn(t('Avaa sivusto', 'Open the site'), DEMO + s + '/', ' btn-ink')}</div>
    </article>
    <a class="wrap next" href="{u('project', nxt['slug'])}"><span class="lab">{t('Seuraava työ', 'Next project')}</span><span class="d2">{nxt['name']} →</span></a>
{contact()}
  </main>
''' + footer()


lc = lambda x: x if x.startswith('Google') else x[0].lower() + x[1:]


def terms_doc():
    inc = '; '.join(lc(x) for x in INCLUDED[LANG])
    exc = '; '.join(lc(x) for x in EXCLUDED[LANG])
    if LANG == 'fi':
        return [
            ('Osapuolet', ['Palveluntarjoaja on Studio Luoto, Ville Saarela (Y-tunnus 3660060-6), Isosaarentie 10, 00840 Helsinki. Asiakas on yritys tai yhteisö, joka tilaa palvelun. Palvelu on tarkoitettu vain yrityksille, joten kuluttajansuojalaki ei sovellu.']),
            ('Palvelu', [f'Studio Luoto suunnittelee, toteuttaa, julkaisee, ylläpitää ja kehittää asiakkaan verkkosivut. Hintaan sisältyy: {inc}.', f'Hintaan ei sisälly: {exc}. Niistä sovitaan erikseen.']),
            ('Demo', ['Ilmainen demo on maksuton luonnos asiakkaan etusivusta. Se ei velvoita asiakasta mihinkään. Sopimus syntyy vasta, kun asiakas hyväksyy tarjouksen kirjallisesti, esimerkiksi sähköpostilla.']),
            ('Hinta ja laskutus', [f'Kuukausihinta on {pr("m")} + alv. Aloitusmaksua ei ole. Laskutus tehdään kuukausittain etukäteen, maksuaika 14 päivää. Vaihtoehtoisesti asiakas voi maksaa 12 kuukautta kerralla {pr("y")} + alv.', 'Kuukausilaskutus alkaa, kun sivut julkaistaan. Ensimmäisen kuukauden ilmaisuus kolmelle ensimmäiselle asiakkaalle edellyttää, että asiakas antaa suosittelun ja luvan kertoa projektista Studio Luoton sivuilla.']),
            ('Sopimuskausi ja irtisanominen', ['Sopimuksen vähimmäiskesto on 12 kuukautta julkaisusta. Sen jälkeen sopimus on voimassa toistaiseksi, ja kumpikin osapuoli voi irtisanoa sen kuukauden irtisanomisajalla. Irtisanominen tehdään kirjallisesti.']),
            ('Muutokset ja päivitykset', ['Asiakas pyytää muutoksia sähköpostilla, viestillä tai puhelimella. Studio Luoto vastaa viesteihin yhden arkipäivän kuluessa.', 'Pienet muutokset, kuten tekstin, kuvan tai yhteystiedon vaihto, tehdään kahden arkipäivän kuluessa pyynnöstä. Lisäksi kuukaudessa tehdään yksi isompi päivitys, esimerkiksi uusi kohde- tai palvelusivu. Käyttämättömät päivitykset eivät siirry seuraavalle kuukaudelle.']),
            ('Tarjouspyyntötakuu', ['Jos sivujen tarjouspyyntölomakkeen kautta ei tule yhtään tarjouspyyntöä kolmen ensimmäisen kuukauden aikana julkaisusta, seuraavat kolme kuukautta ovat asiakkaalle maksuttomia. Takuu edellyttää, että lomake on ollut käytössä koko ajan ja asiakas on toimittanut sivuja varten sovitut tiedot. Takuu hyvitetään laskutuksessa, ei rahana.']),
            ('Omistus ja oikeudet', [f'Verkkotunnus (domain) on aina asiakkaan. Asiakkaan toimittamat tekstit, kuvat ja logot ovat asiakkaan. Studio Luoton tekemän suunnittelun ja toteutuksen oikeudet ovat Studio Luotolla sopimuksen ajan. Kun 12 kuukautta on täynnä, asiakas voi lunastaa sivut omakseen {pr("b")} + alv kertamaksulla. Kun sopimus on jatkunut 24 kuukautta, sivut siirtyvät asiakkaalle maksutta.', 'Studio Luoto saa mainita asiakkaan ja näyttää sivut referenssinä, ellei toisin sovita.']),
            ('Asiakkaan vastuut', ['Asiakas vastaa toimittamiensa sisältöjen oikeellisuudesta ja siitä, että sillä on oikeus käyttää toimittamiaan kuvia ja tekstejä. Asiakas vastaa myös verkkotunnuksensa uusimisesta, ellei toisin sovita.']),
            ('Maksuviivästys', ['Jos lasku on ollut maksamatta yli 30 päivää eräpäivästä, Studio Luoto voi keskeyttää palvelun ja sivujen ylläpidon, kunnes avoimet laskut on maksettu. Viivästyneelle maksulle peritään korkolain mukainen viivästyskorko.']),
            ('Vastuunrajoitus', ['Studio Luoto vastaa palvelun huolellisesta toteutuksesta. Studio Luoto ei vastaa välillisistä vahingoista, kuten saamatta jääneestä myynnistä. Studio Luoton vastuu rajoittuu enintään kolmen kuukauden palvelumaksujen määrään.']),
            ('Henkilötiedot', ['Henkilötietoja käsitellään tietosuojaselosteen mukaisesti. Tarjouspyyntölomakkeen kautta tulevat tiedot ohjataan asiakkaalle, ja asiakas on niiden rekisterinpitäjä.']),
            ('Ehtojen muutokset ja riidat', ['Studio Luoto voi muuttaa ehtoja ilmoittamalla siitä asiakkaalle vähintään 30 päivää etukäteen. Sopimukseen sovelletaan Suomen lakia. Riidat pyritään ratkaisemaan neuvottelemalla ja muuten Helsingin käräjäoikeudessa.']),
        ]
    return [
        ('Parties', ['The service provider is Studio Luoto, Ville Saarela (Business ID 3660060-6), Isosaarentie 10, 00840 Helsinki, Finland. The client is the company or organisation that orders the service. The service is for businesses only, so consumer protection law does not apply.']),
        ('Service', [f'Studio Luoto designs, builds, publishes, maintains and improves the client’s website. The price includes: {inc}.', f'The price does not include: {exc}. These are agreed separately.']),
        ('Demo', ['The free demo is a draft of the client’s front page at no cost. It places no obligation on the client. A contract is formed only when the client accepts an offer in writing, for example by email.']),
        ('Price and billing', [f'The monthly price is {pr("m")} + VAT. There is no setup fee. Billing is monthly in advance, with 14 days to pay. Alternatively the client can pay for 12 months at once, {pr("y")} + VAT.', 'Monthly billing starts when the site is published. The free first month for the first three clients requires that the client gives a testimonial and permission to tell the story of the project on Studio Luoto’s site.']),
        ('Term and termination', ['The minimum term is 12 months from publication. After that the contract continues until further notice, and either party can end it with one month’s notice. Notice is given in writing.']),
        ('Changes and updates', ['The client asks for changes by email, message or phone. Studio Luoto replies to messages within one working day.', 'Small changes, such as replacing a text, an image or contact details, are made within two working days of the request. In addition, one bigger update is made each month, for example a new project or service page. Unused updates do not carry over to the next month.']),
        ('Quote request guarantee', ['If the site’s quote request form brings in no quote requests in the first three months after publication, the next three months are free for the client. The guarantee requires that the form has been in use the whole time and that the client has supplied the information agreed for the site. The guarantee is credited on invoices, not paid out as money.']),
        ('Ownership and rights', [f'The domain always belongs to the client. Texts, images and logos supplied by the client belong to the client. Rights to the design and build made by Studio Luoto remain with Studio Luoto for the term of the contract. Once 12 months are up, the client can buy the site outright for a one-off {pr("b")} + VAT. When the contract has run for 24 months, the site is transferred to the client free of charge.', 'Studio Luoto may name the client and show the site as a reference unless agreed otherwise.']),
        ('Client responsibilities', ['The client is responsible for the accuracy of the content it supplies and for having the right to use the images and texts it supplies. The client is also responsible for renewing its domain unless agreed otherwise.']),
        ('Late payment', ['If an invoice has been unpaid for more than 30 days after the due date, Studio Luoto may suspend the service and site maintenance until open invoices are paid. Late payment interest is charged in accordance with the Finnish Interest Act.']),
        ('Limitation of liability', ['Studio Luoto is responsible for carrying out the service with due care. Studio Luoto is not liable for indirect damage, such as lost sales. Studio Luoto’s liability is limited to at most three months of service fees.']),
        ('Personal data', ['Personal data is processed in accordance with the privacy notice. Data submitted through the quote request form is forwarded to the client, and the client is its controller.']),
        ('Changes to terms and disputes', ['Studio Luoto may change these terms by notifying the client at least 30 days in advance. The contract is governed by Finnish law. Disputes are settled by negotiation where possible, and otherwise in the Helsinki District Court.']),
        ('Language', ['These terms are a translation. If the Finnish and English versions differ, the Finnish version applies.']),
    ]


def terms_page():
    body = '\n'.join(f'      <h2>{h}</h2>' + ''.join(f'<p>{x}</p>' for x in ps) for h, ps in terms_doc()).replace(' €', ' €')
    return head('terms', None, t('Sopimusehdot · Studio Luoto', 'Terms · Studio Luoto'), t('Studio Luoto -verkkosivupalvelun sopimusehdot: hinta, sopimuskausi, muutokset, takuu ja omistus.', 'Terms of the Studio Luoto website service: price, term, changes, guarantee and ownership.')) + header('terms', dark=False) + f'''
  <main id="main">
    <article class="wrap doc">
      <p class="lab">{t('Voimassa 15.10.2026 alkaen', 'In force from 15 October 2026')}</p>
      <h1 class="d1">{t('Sopimusehdot', 'Terms')}</h1>
{body}
    </article>
  </main>
''' + footer()


def privacy():
    if LANG == 'fi':
        sections = g['PRIVACY']
    else:
        sections = [(h, [p.replace('{MAIL}', MAIL).replace('{TEL_H}', TEL_H).replace('{TEL}', TEL) for p in ps]) for h, ps in PRIVACY_EN]
    body = '\n'.join(f'      <h2>{h}</h2>' + ''.join(f'<p>{p}</p>' for p in ps) for h, ps in sections).replace('info@villesaarela.com', MAIL)
    return head('privacy', None, t('Tietosuoja · Studio Luoto', 'Privacy · Studio Luoto'), t('Miten Studio Luoto käsittelee henkilötietoja.', 'How Studio Luoto processes personal data.')) + header('privacy', dark=False) + f'''
  <main id="main">
    <article class="wrap doc">
      <p class="lab">{t('Päivitetty 15.10.2026', 'Updated 15 October 2026')}</p>
      <h1 class="d1">{t('Tietosuoja', 'Privacy')}</h1>
{body}
    </article>
  </main>
''' + footer()


def notfound():
    return head('404', None, 'Sivua ei löytynyt · Studio Luoto', 'Sivua ei löytynyt.') + header('404', dark=False) + f'''
  <main id="main">
    <section class="wrap page-top" aria-labelledby="h1">
      <p class="lab">404</p>
      <h1 class="d1" id="h1">Sivua ei <em>löytynyt.</em></h1>
      <p class="lead">Osoite on voinut muuttua. <span lang="en">Page not found. The address may have changed.</span></p>
      <div class="hero-do" style="margin-top:32px">{btn('Etusivulle', u('home'), ' btn-ink')}<a class="link-dk" href="{u('works')}">Työt</a><a class="link-dk" href="{u('home', lang='en')}" lang="en">English home page</a></div>
    </section>
  </main>
''' + footer()


def write(rel, content):
    p = os.path.join(ROOT, rel.lstrip('/'))
    if p.endswith('/'):
        p += 'index.html'
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w').write(content)


urls = []
for LANG in ('fi', 'en'):
    write(path('home'), home())
    write(path('works'), works())
    for i, w in enumerate(works_list()):
        write(path('project', w['slug']), project(i, w))
    write(path('privacy'), privacy())
    write(path('terms'), terms_page())
    urls += [path('home'), path('works')] + [path('project', w['slug']) for w in works_list()] + [path('privacy'), path('terms')]
LANG = 'fi'
write('404.html', notfound())
if LIVE:
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(f'  <url><loc>{SITE}{x}</loc><lastmod>2026-10-15</lastmod></url>' for x in urls) + '\n</urlset>\n')
    write('robots.txt', f'User-agent: *\nAllow: /\nDisallow: /esikatselu/\n\nSitemap: {SITE}/sitemap.xml\n')
    write('CNAME', 'www.studioluoto.com')
    # Pages from the old site send their visitors to the matching place here
    stale = [(f'projektit/{d}', '/tyot/') for d in sorted(os.listdir(REPO + '/projektit')) if d not in ORDER]
    for old, new in [('hinnat', '/#palvelu'), ('minusta', '/#kysymykset'), ('prosessi', '/#prosessi')] + stale:
        write(f'{old}/index.html', f'<!doctype html><html lang="fi"><head><meta charset="utf-8"><title>Studio Luoto</title><meta name="robots" content="noindex"><link rel="canonical" href="{SITE}{new}"><meta http-equiv="refresh" content="0; url={new}"></head><body><a href="{new}">Studio Luoto</a></body></html>\n')
print('ok', 'live' if LIVE else 'preview', len(urls), 'pages')
