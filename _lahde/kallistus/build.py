"""Kallistus Oy (kuvitteellinen) – kylpyhuoneremontit pääkaupunkiseudulla. Ville Saarelan konseptityö.
python3 build.py  -> /home/user/Claude-credits/demot/kallistus/
"""
import os, shutil, glob, html, json
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.dirname(HERE)
OUT = '/home/user/Claude-credits/demot/kallistus'
V = '3'
TEL, TEL_H = '0485620821', '048 562 0821'
MAIL = 'toimisto@kallistus.example'
YT = '3184517-6'
ADDR = 'Valimonrinne 7, 00880 Helsinki'
e = lambda s: html.escape(s, quote=True)

# Pictures: name -> available widths and ratio
IMG = {}
for f in glob.glob(f'{REFS}/out-k/*.webp'):
    b = os.path.basename(f)[:-5]; name, w = b.rsplit('-', 1)
    IMG.setdefault(name, []).append(int(w))
RATIO = {}
from PIL import Image
for n, ws in IMG.items():
    ws.sort(); im = Image.open(f'{REFS}/out-k/{n}-{ws[0]}.webp'); RATIO[n] = (im.width, im.height)


def pic(R, name, alt, sizes='100vw', eager=False, cls='photo', inner=''):
    ws = IMG[name]; w0, h0 = RATIO[name]
    srcset = ', '.join(f'{R}img/{name}-{w}.webp {w}w' for w in ws)
    mid = ws[min(1, len(ws) - 1)]
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return f'<div class="{cls}"><img src="{R}img/{name}-{mid}.webp" srcset="{srcset}" sizes="{sizes}" width="{w0}" height="{h0}" alt="{e(alt)}" {load} decoding="async">{inner}</div>'


def slope(label='1:100'):
    return f'''<div class="slope" aria-hidden="true"><span class="mono">{label}</span><svg viewBox="0 0 1000 40" preserveAspectRatio="none"><line x1="0" y1="20" x2="984" y2="30"/></svg><svg viewBox="0 0 40 40" style="left:auto;right:0;width:40px"><circle class="drain" cx="24" cy="30" r="8"/><circle class="drain-dot" cx="24" cy="30" r="2.6"/></svg></div>'''


NAV = [('Hinnat', 'hinnat/'), ('Kohteet', 'kohteet/'), ('Näin teemme', 'index.html#nain'), ('Taloyhtiöille', 'index.html#taloyhtio'), ('Yhteys', 'yhteys/')]


def head(R, title, desc, path):
    return f'''<!doctype html>
<html lang="fi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.classList.add('js')</script>
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#F2F2EF">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="https://www.villesaarela.com/demot/kallistus/og.jpg">
<link rel="icon" href="{R}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{R}apple-touch-icon.png">
<link rel="preload" href="{R}fonts/host-500-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{R}style.css?v={V}">
</head>
<body>
<a class="skip" href="#main">Siirry sisältöön</a>
'''


def header(R, cur=''):
    AC = ' aria-current="page"'
    links = ''.join(f'<a href="{R}{h}"{AC if cur == t else ""}>{t}</a>' for t, h in NAV)
    mlinks = ''.join(f'<a href="{R}{h}">{t}</a>' for t, h in NAV)
    return f'''<header class="hdr">
  <div class="wrap hdr-in">
    <a class="logo" href="{R}index.html"><img src="{R}img/kallistus.svg" width="380" height="114" alt="Kallistus, etusivu"></a>
    <nav class="nav" aria-label="Päävalikko">{links}</nav>
    <div class="hdr-r">
      <a class="hdr-tel" href="tel:{TEL}">{TEL_H}</a>
      <a class="btn" href="{R}yhteys/">Pyydä mittauskäynti</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav"><span></span><b class="sr">Valikko</b></button>
    </div>
  </div>
  <nav class="wrap mnav" id="mnav" aria-label="Valikko">{mlinks}<a class="mnav-tel" href="tel:{TEL}">Soita {TEL_H}</a></nav>
</header>
'''


def footer(R):
    return f'''<footer class="ftr on-dark">
  <div class="wrap grid">
    <div class="ftr-logo"><img src="{R}img/kallistus-light.svg" width="380" height="114" alt="Kallistus"><p class="small" style="margin-top:16px;max-width:30ch">Kylpyhuone- ja saunaremontit Helsingissä, Espoossa, Kauniaisissa ja Vantaalla vuodesta 2011.</p></div>
    <div class="ftr-col"><h2>Sivut</h2><ul><li><a href="{R}hinnat/">Hinnat</a></li><li><a href="{R}kohteet/">Kohteet</a></li><li><a href="{R}index.html#nain">Näin teemme</a></li><li><a href="{R}yhteys/">Yhteys</a></li></ul></div>
    <div class="ftr-col"><h2>Yhteys</h2><ul><li><a href="tel:{TEL}">{TEL_H}</a></li><li><a href="mailto:{MAIL}">{MAIL}</a></li><li>Arkisin 7.30–16</li></ul></div>
    <div class="ftr-col"><h2>Toimisto ja varasto</h2><ul><li>{ADDR}</li><li>Y-tunnus {YT}</li></ul></div>
    <div class="ftr-col"><h2>Todistukset</h2><ul><li>Märkätilojen vedeneristäjän sertifikaatti</li><li>Luotettava Kumppani</li><li>Vastuuvakuutus 2 milj. €</li></ul></div>
    <div class="ftr-bot"><span>© 2026 Kallistus Oy</span><span class="concept">Konsepti: Kallistus on kuvitteellinen yritys, ja sivusto on Ville Saarelan portfoliotyö. Kuvat: Pexels, kuvaajat mainitaan <a href="{R}kuvat/" style="text-decoration:underline">kuvasivulla</a>.</span></div>
  </div>
</footer>
<script src="{R}script.js?v={V}" defer></script>
</body>
</html>
'''


def calc_block():
    return '''<form class="calc" data-calc onsubmit="return false" aria-labelledby="calc-h">
        <fieldset>
          <legend id="calc-h">Laske suunta omalle kylpyhuoneellesi</legend>
          <div class="field"><span id="t-l">Mikä tila?</span>
            <div class="seg" role="radiogroup" aria-labelledby="t-l">
              <label><input type="radio" name="tyyppi" value="kt" checked><span>Kerrostalon kylpyhuone</span></label>
              <label><input type="radio" name="tyyppi" value="ok"><span>Rivi- tai omakotitalo</span></label>
              <label><input type="radio" name="tyyppi" value="sa"><span>Kylpyhuone ja sauna</span></label>
              <label><input type="radio" name="tyyppi" value="wc"><span>Erillinen wc</span></label>
            </div></div>
          <div class="field"><label for="m2">Lattian pinta-ala</label>
            <div class="range-row"><input id="m2" type="range" name="m2" min="1.5" max="14" step="0.5" value="4"><output data-m2 for="m2">4 m²</output></div></div>
          <div class="field"><span id="o-l">Montako omistajaa asunnolla on?</span>
            <div class="seg" role="radiogroup" aria-labelledby="o-l">
              <label><input type="radio" name="omistajat" value="1"><span>Yksi</span></label>
              <label><input type="radio" name="omistajat" value="2" checked><span>Kaksi</span></label>
            </div></div>
        </fieldset>
        <div class="res" aria-live="polite">
          <span class="small">Hinta-arvio, sis. alv 25,5 %</span>
          <span class="res-big" data-range>17 800 € – 20 600 €</span>
          <div class="res-rows">
            <div><span>Työn osuus</span><b data-lab>noin 9 900 €</b></div>
            <div><span>Kotitalousvähennys yhteensä</span><b data-ded>3 200 €</b></div>
            <div><span>Sinulle jää vähennyksen jälkeen</span><b data-net>14 600 € – 17 500 €</b></div>
          </div>
          <p class="small">Arvio perustuu viime vuoden kohteisiimme. Kiinteän hinnan annamme mittauskäynnin jälkeen kolmen arkipäivän sisällä. Vähennys on laskettu vuoden 2026 säännöillä: 35 % työn osuudesta, omavastuu 150 € ja enintään 1 600 € omistajaa kohden. Eduskunta käsittelee korotusta 40 %:iin, ja päivitämme laskurin, kun laki on vahvistettu.</p>
        </div>
      </form>'''


PRICES = [
    ('Kerrostalon kylpyhuone', '1950–80-luvun talot, 3–5 m²', '16 900 €', '23 900 €', 'noin 13 900 €'),
    ('Rivi- tai omakotitalon kylpyhuone', '5–8 m², myös kaksi kaivoa', '21 500 €', '29 800 €', 'noin 18 500 €'),
    ('Kylpyhuone ja sauna', '7–12 m², lauteet ja kiuas mukana', '29 900 €', '41 500 €', 'noin 26 700 €'),
    ('Erillinen wc', '1,2–2,5 m²', '7 900 €', '9 800 €', 'noin 6 500 €'),
]


def price_table(full=False):
    rows = ''.join(f'<tr><th scope="row">{a}<small>{b}</small></th><td data-l="Alkaen">{c}</td><td data-l="Enintään yleensä">{d}</td><td class="net" data-l="Kahdelle omistajalle vähennyksen jälkeen">{x}</td></tr>' for a, b, c, d, x in PRICES)
    return f'''<table class="ptable">
          <caption class="sr">Kylpyhuoneremonttien hinnat 2026</caption>
          <thead><tr><th scope="col">Tila</th><th scope="col">Alkaen</th><th scope="col">Enintään yleensä</th><th scope="col">Alkaen, kun kaksi omistajaa käyttää vähennyksen</th></tr></thead>
          <tbody>{rows}</tbody>
        </table>
        <p class="pnote">Hinnat sisältävät alv:n 25,5 %, purun ja jätteet, asbestikartoituksen, LVI- ja sähkötyöt, vedeneristyksen, laatat hintaluokassa 40–60 €/m², kalusteet ja siivouksen. Hinnat päivitetty 1.10.2026.</p>'''


DAYS = 'k k k k w w v v k k k k k k k'.split()
PHASES = [
    ('k', 'Päivät 1–3', 'Suojaus ja purku', 'Suojaamme rappukäytävän ja oven. Purku tehdään pölynpoistolla, ja asbestikartoitus on tehty jo ennen ensimmäistä päivää.'),
    ('k', 'Päivä 4', 'Putket ja sähköt', 'Uudet vesi- ja viemäriputket, lattiakaivo ja sähköt. Samat LVI- ja sähköasentajat joka kohteessa.'),
    ('w', 'Päivät 5–6', 'Kallistusvalu kuivuu', 'Lattiaan valetaan kallistus kaivolle. Mittaamme kosteuden ennen kuin jatkamme. Kuivumista ei kiirehditä.'),
    ('v', 'Päivät 7–8', 'Vedeneristys', 'Kaksi kerrosta, kuvat jokaisesta nurkasta ja läpiviennistä. Isännöitsijän valvoja tarkastaa ennen laatoitusta.'),
    ('k', 'Päivät 9–13', 'Laatoitus ja saumaus', 'Laatat ladotaan kaivon mukaan, ei kaivoa laattojen mukaan. Lattian kallistus mitataan vielä kerran.'),
    ('k', 'Päivät 14–15', 'Kalusteet ja luovutus', 'Kalusteet, kytkennät, painekoe ja siivous. Käymme kylpyhuoneen läpi kanssasi ja annamme kuivakansion.'),
]

SHEET = [
    ('ennen-hana', 'Pv 1 · 07.40', 'Lähtötilanne kuvataan ennen kuin mitään puretaan.'),
    ('vedeneriste', 'Pv 7 · 08.05', 'Ensimmäinen vedeneristyskerros ja nurkkavahvikkeet.'),
    ('tasoite', 'Pv 8 · 13.30', 'Toinen kerros. Kalvopaksuus mitataan ja kirjataan.'),
    ('laasti', 'Pv 12 · 10.15', 'Laatoitus alkaa kaivolta.'),
    ('laatoitus', 'Pv 12 · 14.40', 'Lattialaatat tasoituskiilojen kanssa.'),
    ('kaivo', 'Pv 19 · 11.20', 'Kallistus mitataan vielä ennen luovutusta.'),
]

PROJECTS = [
    ('nuuksio-1984', 'kauniainen', 'Amme ikkunan eteen, pellon puolelle', 'Nuuksio, Espoo', 'Omakotitalo 1984', '8,4 m²', '19 työpäivää', 'Pieni ja pimeä kylpyhuone sai ison ikkunan ja yhtenäiset seinät.'),
    ('lauttasaari-1958', 'lauttasaari', 'Kerrostalon kylpyhuone ilman kynnystä', 'Lauttasaari', 'Kerrostalo 1958', '4,2 m²', '15 työpäivää', 'Ikkunallinen kylpyhuone, jossa amme haluttiin säilyttää.'),
    ('tapiola-1966', 'tapiola', 'Rivitalon pesuhuone linjakaivolla', 'Tapiola, Espoo', 'Rivitalo 1966', '5,8 m²', '16 työpäivää', 'Taloyhtiön ensimmäinen remontti uudella muutostyöohjeella.'),
    ('herttoniemi-1962', 'herttoniemi', 'Suihkuseinä ilman lasiovia', 'Herttoniemi', 'Kerrostalo 1962', '3,6 m²', '14 työpäivää', ''),
    ('munkkiniemi-1939', 'munkkiniemi', 'Pyykkikoneet kaappiin, kylpyhuone väljemmäksi', 'Munkkiniemi', 'Kerrostalo 1939', '5,2 m²', '17 työpäivää', ''),
    ('kallio-1912', 'kallio', 'Ullakkokylpyhuone vinon katon alle', 'Kallio', 'Kerrostalo 1912', '7,0 m²', '21 työpäivää', ''),
]

FAQ = [
    ('Saako kylpyhuonetta käyttää remontin aikana?', 'Ei. Kerrostalossa varaamme kanssasi suihkumahdollisuuden läheltä, esimerkiksi taloyhtiön saunalta, tai järjestämme sen kuntosalilta kolmeksi viikoksi. Wc toimii yleensä päivät 1–3 ja 14–15.'),
    ('Mitä jos purussa löytyy kosteusvaurio?', 'Kerromme siitä samana päivänä, näytämme kuvat ja mittaustulokset ja teemme kirjallisen lisätyötarjouksen. Mitään ylimääräistä ei tehdä ilman hyväksyntääsi.'),
    ('Kuka hoitaa taloyhtiön paperit?', 'Me. Kirjoitamme muutostyöilmoituksen piirustuksineen ja toimitamme sen isännöitsijälle. Taloyhtiön valvoja saa aikataulun ja tarkastuspäivän heti, kun ne on sovittu.'),
    ('Pitääkö maksaa etukäteen?', 'Ei. Laskutamme kahdessa osassa: 30 % kun vedeneristys on tarkastettu ja 70 % luovutuksen jälkeen. Laskussa työ ja tarvikkeet ovat eriteltyinä kotitalousvähennystä varten.'),
    ('Voinko valita laatat itse?', 'Voit. Hintaan sisältyy laatta 40–60 €/m², ja kalliimmasta maksat vain erotuksen. Mittauskäynnillä tuomme näytteet kolmesta mallistosta, ja voit käydä katsomassa niitä myös varastollamme Roihupellossa.'),
    ('Mikä takuu on?', 'Kahden vuoden takuu työlle ja kymmenen vuoden takuu vedeneristykselle. Kymmenen vuoden takuu perustuu kuivakansioon: jokainen kerros on kuvattu ja mitattu, joten voimme seistä sen takana.'),
]


def home():
    R = ''
    sheet = ''.join(f'<figure>{pic(R, n, c, "(min-width:1200px) 15vw, (min-width:760px) 30vw, 46vw")}<figcaption><span class="mono">{t}</span>{c}</figcaption></figure>' for n, t, c in SHEET)
    days = ''.join(f'<li class="{d}"><span>{i + 1}</span></li>' for i, d in enumerate(DAYS))
    phases = ''.join(f'<li class="{c}"><span class="mono">{d}</span><h3>{t}</h3><p>{p}</p></li>' for c, d, t, p in PHASES)
    proj = ''
    for k, (slug, img, title, place, house, m2, dur, _) in enumerate(PROJECTS[:4]):
        sizes = '(min-width:760px) 58vw, 100vw' if k in (0, 3) else '(min-width:760px) 40vw, 100vw'
        href = f'kohteet/{slug}/' if k == 0 else 'kohteet/'
        proj += f'<a href="{href}">{pic(R, img, f"{place}: {title.lower()}", sizes)}<h3>{title}</h3><div class="meta"><span>{place}</span><span>{house}</span><span>{m2}</span><span>{dur}</span></div></a>'
    faq = ''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in FAQ)
    return head(R, 'Kallistus – kylpyhuoneremontit Helsingissä, Espoossa ja Vantaalla', 'Kylpyhuone- ja saunaremontit pääkaupunkiseudulla kiinteällä hinnalla. Sama vedeneristäjä alusta loppuun, kuvattu vedeneristys ja 10 vuoden takuu.', '/') + header(R) + f'''
<main id="main">
  <section class="hero wrap grid" aria-labelledby="h1">
    <div class="hero-txt">
      <h1 class="h1" id="h1">Vesi menee sinne, minne pitää.</h1>
      <p class="lead">Teemme vain kylpyhuoneita ja saunoja pääkaupunkiseudun kerros-, rivi- ja omakotitaloihin. Sama vedeneristäjä on työmaalla alusta loppuun, ja jokainen kerros kuvataan.</p>
      <div class="hero-acts"><a class="btn" href="yhteys/">Pyydä mittauskäynti</a><a class="tlink" href="hinnat/">Katso hinnat</a></div>
      <dl class="facts">
        <div><dt>Hinta</dt><dd>Kiinteä, ennen aloitusta</dd></div>
        <div><dt>Työmaalla</dt><dd>Kolme viikkoa</dd></div>
        <div><dt>Vedeneristys</dt><dd>10 vuoden takuu</dd></div>
        <div><dt>Ennakkomaksu</dt><dd>Ei ole</dd></div>
      </dl>
    </div>
    <figure class="hero-fig">
      {pic(R, 'kauniainen-p', 'Valmis kylpyhuone: tammiallaskaappi, musta allas, sementtipintaiset seinät ja iso peili', '(min-width:1000px) 50vw, 100vw', eager=True)}
      <figcaption class="cap"><b>Nuuksio, omakotitalo 1984.</b> 8,4 m², valmistui marraskuussa 2025. <a href="kohteet/nuuksio-1984/">Katso kohde</a></figcaption>
    </figure>
  </section>

  <section class="band" aria-labelledby="kaivo-h">
    {pic(R, 'kaivo-w', 'Lattiakaivo valkoisten laattojen keskellä', '100vw', cls='band-img', inner='<span class="ann" style="left:51.5%;top:47%">Ø 110 · kallistus 1:80</span>')}
    <div class="wrap band-txt"><h2 class="h2" id="kaivo-h">Kaikki alkaa kaivosta.</h2><p class="lead">Kaivon paikka päätetään ensin. Lattia kallistetaan sitä kohti ja laatat ladotaan siitä alkaen. Siksi kylpyhuoneissamme ei jää vettä nurkkiin.</p></div>
  </section>

  <section class="sec on-dark" id="nain" aria-labelledby="seina-h">
    <div class="wrap grid">
      {pic(R, 'tasoite', 'Vedeneristäjä levittää vedeneristettä kylpyhuoneen seinään', '(min-width:1000px) 46vw, 100vw', cls='photo wall-img')}
      <div class="wall-txt">
        <h2 class="h2" id="seina-h">Tärkein osa jää laattojen alle.</h2>
        <p class="lead">Kylpyhuone näyttää valmiina samalta, tehtiinpä vedeneristys hyvin tai huonosti. Siksi kuvaamme sen. Saat kuivakansion, jossa on kuvat jokaisesta kerroksesta, mitatut kalvopaksuudet ja tuotteiden tiedot.</p>
        <ol class="layers">
          <li><span class="mono">1:80</span><span>Kallistus kaivolle koko suihkualueella, mitattu vatupassilla ja laserilla</span></li>
          <li><span class="mono">0,5 mm</span><span>Vedeneristeen kuivakalvo vähintään, mitattu kerroksittain</span></li>
          <li><span class="mono">24 h</span><span>Kuivumisaika kerrosten välillä, ei vähemmän</span></li>
          <li><span class="mono">10 v</span><span>Takuu vedeneristykselle, koska jokainen vaihe on dokumentoitu</span></li>
        </ol>
      </div>
      <div style="grid-column:1/-1"><div class="sheet">{sheet}</div><p class="cap" style="margin-top:16px">Otteita Nuuksion kohteen kuivakansiosta. Kansiossa on yhteensä 46 kuvaa.</p></div>
    </div>
  </section>

  <section class="sec" id="hinnat" aria-labelledby="hinnat-h">
    <div class="wrap grid">
      <div class="sec-hd"><h2 class="h2" id="hinnat-h">Hinta, ennen kuin tulemme käymään.</h2><p class="lead">Useimmat kylpyhuoneet osuvat näihin haarukoihin. Mittauskäynnin jälkeen saat kiinteän hinnan, joka ei muutu, ellei purussa löydy jotain, mitä emme voineet nähdä.</p></div>
      <div class="prices">{price_table()}<p style="margin-top:20px"><a class="tlink" href="hinnat/">Mitä hinta sisältää ja miten laskutamme</a></p></div>
      {calc_block()}
    </div>
  </section>

  <section class="sec" style="padding-top:0" aria-labelledby="viikot-h">
    <div class="wrap grid">
      <div class="sec-hd"><h2 class="h2" id="viikot-h">Kolme viikkoa työmaalla.</h2><p class="lead">Valmistelu kestää 4–8 viikkoa: mittaus, tarjous, taloyhtiön käsittely ja tilaukset. Kun aloitamme, työmaa etenee tällä rytmillä.</p></div>
      <ol class="days" aria-label="15 työpäivää">{days}</ol>
      <ol class="phases">{phases}</ol>
    </div>
  </section>

  <div class="wrap">{slope('')}</div>

  <section class="sec" style="padding-top:0" aria-labelledby="kohteet-h">
    <div class="wrap">
      <div class="grid"><div class="sec-hd"><h2 class="h2" id="kohteet-h">Viimeksi valmistuneet.</h2></div></div>
      <div class="proj">{proj}</div>
      <p style="margin-top:32px"><a class="tlink" href="kohteet/">Kaikki kohteet</a></p>
    </div>
  </section>

  <section class="sec" id="taloyhtio" style="background:var(--grout)" aria-labelledby="ty-h">
    <div class="wrap">
      <div class="grid"><div class="sec-hd"><h2 class="h2" id="ty-h">Taloyhtiön paperit kuuluvat meille.</h2></div></div>
      <div class="cols2">
        <div><h3 class="h3">Muutostyöilmoitus</h3><p class="muted">Kirjoitamme ilmoituksen piirustuksineen ja toimitamme sen isännöitsijälle. Hallitus vastaa yleensä kahdessa viikossa. Taloyhtiön valvoja saa vedeneristyksen tarkastuspäivän heti, kun se on sovittu.</p>
          <ul class="checks" style="margin-top:16px"><li>Muutostyöilmoitus ja suunnitelma</li><li>Ilmoitus naapureille kaksi viikkoa ennen purkua</li><li>Valvojan tarkastus ennen laatoitusta</li></ul></div>
        <div><h3 class="h3">Asbesti ja vanhat talot</h3><p class="muted">Ennen vuotta 1994 rakennetuissa taloissa asbestikartoitus on tehtävä ennen purkua. Tilaamme kartoituksen ulkopuoliselta kartoittajalta, ja se sisältyy hintaan. Jos asbestia löytyy, purku tehdään asbestipurkuna ja hinta kerrotaan ennen aloitusta.</p>
          <ul class="checks" style="margin-top:16px"><li>Kartoitusraportti ennen ensimmäistä työpäivää</li><li>Kosteusmittaus purun jälkeen</li><li>Jätteet lajitellaan ja viedään pois</li></ul></div>
      </div>
    </div>
  </section>

  <section class="sec" aria-labelledby="ihmiset-h">
    <div class="wrap">
      <div class="grid"><div class="sec-hd"><h2 class="h2" id="ihmiset-h">Samat ihmiset alusta loppuun.</h2><p class="lead">Emme käytä vaihtuvia aliurakoitsijoita märkätöissä. Tiedät jo tarjousvaiheessa, kuka kylpyhuoneesi tekee.</p></div></div>
      <div class="people">
        {pic(R, 'laatoitus', 'Laatoittaja asettaa lattialaattaa tasoituskiiloilla', '(min-width:900px) 46vw, 100vw')}
        <ul>
          <li><b>Joonas Vähämaa</b><p>Perustaja ja vedeneristäjä. Teki kylpyhuoneita viisi vuotta ennen kuin perusti Kallistuksen 2011. Märkätilojen vedeneristäjän sertifikaatti.</p></li>
          <li><b>Minna Hiltunen</b><p>Projektipäällikkö. Hoitaa taloyhtiöt, aikataulut ja tilaukset, ja vastaa puhelimeen.</p></li>
          <li><b>Aki Laaksonen</b><p>Laatoittaja. Ladoo laatat kaivolta alkaen ja mittaa kallistuksen ennen saumausta.</p></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="sec" style="padding-top:0" aria-labelledby="faq-h">
    <div class="wrap grid">
      <div class="faq-hd"><h2 class="h2" id="faq-h">Kysytään usein.</h2></div>
      <div class="faq">{faq}</div>
    </div>
  </section>

{request(R)}
</main>
''' + footer(R)


def request(R):
    return f'''  <section class="sec on-dark" id="pyynto" aria-labelledby="pyynto-h">
    <div class="wrap req">
      <div class="req-txt">
        <h2 class="h2" id="pyynto-h">Pyydä mittauskäynti.</h2>
        <p class="lead" style="margin-top:24px">Käynti kestää noin 45 minuuttia eikä maksa mitään. Kiinteän hinnan saat kolmen arkipäivän sisällä.</p>
        <ol class="steps3">
          <li><span class="mono">1</span><span>Minna soittaa samana tai seuraavana arkipäivänä.</span></li>
          <li><span class="mono">2</span><span>Joonas mittaa kylpyhuoneen ja tuo laattanäytteet.</span></li>
          <li><span class="mono">3</span><span>Saat tarjouksen, aikataulun ja muutostyöilmoituksen luonnoksen.</span></li>
        </ol>
        <p style="margin-top:32px">Tai soita: <a class="tlink" href="tel:{TEL}" style="color:var(--on-dark)">{TEL_H}</a></p>
      </div>
      <form data-demo novalidate>
        <label class="f">Nimi<input type="text" name="nimi" autocomplete="name"></label>
        <label class="f">Puhelin<input type="tel" name="puhelin" autocomplete="tel"></label>
        <label class="f full">Osoite tai postinumero<input type="text" name="osoite" autocomplete="street-address"></label>
        <label class="f">Talotyyppi<select name="talo"><option>Kerrostalo</option><option>Rivitalo</option><option>Omakotitalo</option></select></label>
        <label class="f">Rakennusvuosi<input type="text" name="vuosi" inputmode="numeric" placeholder="esim. 1962"></label>
        <label class="f full">Mitä haluaisit muuttaa?<textarea name="viesti"></textarea></label>
        <label class="upload full"><input type="file" name="kuvat" accept="image/*" multiple><span aria-hidden="true">＋</span><span data-files>Lisää kuvia nykyisestä kylpyhuoneesta</span></label>
        <div class="full" style="display:flex;flex-wrap:wrap;align-items:center;gap:16px 24px"><button class="btn" type="submit">Lähetä pyyntö</button><span class="note">Tämä on konseptisivu: lomake ei lähetä eikä tallenna tietoja.</span></div>
        <p class="ok" tabindex="-1">Kiitos. Oikealla sivustolla Minna soittaisi sinulle seuraavana arkipäivänä. Tämä lomake ei lähettänyt mitään.</p>
      </form>
    </div>
  </section>
'''


def prices_page():
    R = '../'
    return head(R, 'Hinnat – Kallistus', 'Kylpyhuoneremonttien hinnat 2026, mitä hinta sisältää, kotitalousvähennys ja maksuerät.', '/hinnat/') + header(R, 'Hinnat') + f'''
<main id="main">
  <section class="ptop wrap">
    <h1 class="h1" style="max-width:12ch">Hinnat 2026.</h1>
    <p class="lead">Julkaisemme hinnat, koska kylpyhuoneremontti on useimmille vuosikymmenen suurin yksittäinen remontti. Haarukat perustuvat viime vuoden 61 kohteeseemme.</p>
  </section>
  <section class="wrap grid" style="padding-bottom:var(--s6)">
    <div class="prices">{price_table(True)}</div>
    {calc_block()}
  </section>
  <div class="wrap">{slope()}</div>
  <section class="sec wrap" style="padding-top:0">
    <div class="split">
      <h2 class="h2">Mitä hinta sisältää.</h2>
      <div>
        <ul class="checks"><li>Asbestikartoitus ennen purkua</li><li>Suojaukset, purku, jätteet ja kuljetukset</li><li>Uudet vesi- ja viemäriputket kylpyhuoneen sisällä, lattiakaivo</li><li>Sähkötyöt: valaisimet, pistorasiat ja lattialämmitys</li><li>Kallistusvalu ja kosteusmittaukset</li><li>Vedeneristys kahdessa kerroksessa ja kuivakansio</li><li>Laatat hintaluokassa 40–60 €/m², saumat ja silikonit</li><li>Allaskaappi, peilikaappi, wc-istuin, suihkusetti ja pyyhekuivain</li><li>Loppusiivous ja luovutus</li></ul>
        <h3 class="h3" style="margin:40px 0 12px">Mitä hinta ei sisällä</h3>
        <p class="muted">Taloyhtiön valvojan laskun (yleensä 150–400 €), jos se kuuluu yhtiöjärjestyksen mukaan osakkaalle. Asbestipurun, jos kartoitus löytää asbestia. Kalliimmat laatat ja kalusteet, joista maksat vain erotuksen.</p>
      </div>
    </div>
  </section>
  <section class="sec" style="background:var(--grout)">
    <div class="wrap split">
      <h2 class="h2">Kotitalous­vähennys.</h2>
      <div class="prose">
        <p>Kotitalousvähennys koskee vain työn osuutta. Kylpyhuoneremontissa se on yleensä noin puolet hinnasta. Laskussa työ ja tarvikkeet ovat eriteltyinä, ja olemme ennakkoperintärekisterissä.</p>
        <dl class="kv" style="margin-top:24px">
          <div><dt>Vähennys 2026</dt><dd>35 % työn osuudesta</dd></div>
          <div><dt>Omavastuu</dt><dd>150 € / henkilö</dd></div>
          <div><dt>Enimmäismäärä</dt><dd>1 600 € / henkilö</dd></div>
          <div><dt>Kahdella omistajalla</dt><dd>enintään 3 200 €</dd></div>
        </dl>
        <p class="small muted" style="margin-top:16px">Eduskunta käsittelee vähennyksen korottamista 40 %:iin ja 2 100 euroon vuosille 2026–2027. Päivitämme tämän sivun ja laskurin, kun muutos on vahvistettu. Tarkistettu 1.10.2026.</p>
      </div>
    </div>
  </section>
  <section class="sec wrap">
    <div class="split">
      <h2 class="h2">Laskutus kahdessa osassa.</h2>
      <div>
        <dl class="kv">
          <div><dt>Tilausvaiheessa</dt><dd>0 €</dd></div>
          <div><dt>Kun vedeneristys on tarkastettu</dt><dd>30 %</dd></div>
          <div><dt>Luovutuksen jälkeen</dt><dd>70 %</dd></div>
        </dl>
        <p class="muted" style="margin-top:20px">Maksuaika 14 päivää. Jos luovutuksessa löytyy korjattavaa, viimeinen erä laskutetaan vasta, kun asia on korjattu.</p>
      </div>
    </div>
  </section>
{request(R)}
</main>
''' + footer(R)


def projects_page():
    R = '../'
    items = ''
    for k, (slug, img, title, place, house, m2, dur, txt) in enumerate(PROJECTS):
        href = f'{slug}/' if k == 0 else '#'
        wide = ' class="wide"' if k == 0 else ''
        sizes = '(min-width:1200px) 62vw, 100vw' if k == 0 else '(min-width:1200px) 30vw, (min-width:760px) 46vw, 100vw'
        tag = 'a' if k == 0 else 'div'
        hr = f' href="{href}"' if k == 0 else ''
        tp = f'<p class="small muted">{txt}</p>' if txt else ''
        items += f'<{tag}{hr}{wide}>{pic(R, img, f"{place}: {title.lower()}", sizes)}<h2>{title}</h2><div class="meta"><span>{place}</span><span>{house}</span><span>{m2}</span><span>{dur}</span></div>{tp}</{tag}>'
    items = items.replace('<div class="wide">', '<div class="wide" style="display:grid;gap:12px">').replace('<div>', '<div style="display:grid;gap:12px">')
    return head(R, 'Kohteet – Kallistus', 'Valmistuneita kylpyhuone- ja saunaremontteja Helsingissä, Espoossa, Kauniaisissa ja Vantaalla.', '/kohteet/') + header(R, 'Kohteet') + f'''
<main id="main">
  <section class="ptop wrap">
    <h1 class="h1" style="max-width:14ch">Kohteet.</h1>
    <p class="lead">Kuusi viimeksi valmistunutta. Jokaisesta kohteesta on kuivakansio, ja näytämme sen mielellään mittauskäynnillä.</p>
  </section>
  <section class="wrap" style="padding-bottom:var(--s7)"><div class="plist">{items}</div></section>
{request(R)}
</main>
''' + footer(R)


LOG = [
    ('Pv 1', 'Suojaus ja purku', 'Eteinen ja kulkureitti suojattiin, vanhat laatat ja kalusteet purettiin pölynpoistolla. Kartoitusraportti oli valmis viikkoa aiemmin, asbestia ei löytynyt.', 'ennen-hana'),
    ('Pv 3', 'Kosteusmittaus ja rungot', 'Vanhan lattiakaivon ympäriltä mitattiin kohonneita arvoja. Märkä kohta kuivatettiin, ja ikkunaseinä avattiin uutta, isompaa ikkunaa varten.', None),
    ('Pv 5', 'Kallistusvalu', 'Uusi kaivo siirrettiin ikkunan alle, ja koko lattia valettiin kallistuksella 1:80. Kuivumista seurattiin kaksi päivää.', None),
    ('Pv 8', 'Vedeneristys', 'Kaksi kerrosta, nurkkavahvikkeet ja läpivientikaulukset. Kalvopaksuus mitattiin 12 kohdasta. Omakotitalossa ei ole taloyhtiön valvojaa, joten kävimme kuvat läpi omistajien kanssa ennen laatoitusta.', 'tasoite'),
    ('Pv 12', 'Laatoitus', 'Lattiaan 60 × 60 cm laatta, seinille sementtipohjainen tasoitepinta. Laatoitus alkoi kaivolta.', 'laatoitus'),
    ('Pv 19', 'Luovutus', 'Amme, tammiallaskaappi ja peili paikoilleen, painekoe, siivous ja luovutus. Kuivakansiossa 46 kuvaa.', None),
]


def project_page():
    R = '../../'
    log = ''.join(f'<li><span class="mono">{d}</span><div><h3>{t}</h3><p>{p}</p></div>{pic(R, im, f"{d}: {t.lower()}", "(min-width:900px) 260px, 70vw") if im else ""}</li>' for d, t, p, im in LOG)
    return head(R, 'Amme ikkunan eteen, Nuuksio – Kallistus', 'Omakotitalo vuodelta 1984: pieni ja pimeä kylpyhuone sai ison ikkunan, ammeen ja saumattomat seinät. 8,4 m², 19 työpäivää, kuivakansiossa 46 kuvaa.', '/kohteet/nuuksio-1984/') + header(R, 'Kohteet') + f'''
<main id="main">
  <section class="ptop wrap">
    <nav class="crumb" aria-label="Murupolku"><a href="{R}kohteet/">Kohteet</a><span aria-hidden="true">/</span><span>Nuuksio</span></nav>
    <h1 class="h1" style="max-width:15ch">Amme ikkunan eteen, pellon puolelle.</h1>
    <p class="lead">Vuonna 1984 rakennetun omakotitalon kylpyhuone oli pieni ja pimeä, vaikka talon takana aukeaa pelto. Nyt amme on ison ikkunan edessä ja seinät ovat yhtä saumatonta pintaa.</p>
  </section>
  <section class="wrap">{pic(R, 'kauniainen', 'Valmis kylpyhuone: tammiallaskaappi, musta allas, sementtipintaiset seinät ja iso peili', '100vw', eager=True)}</section>
  <section class="sec wrap">
    <div class="split">
      <dl class="kv">
        <div><dt>Paikka</dt><dd>Nuuksio, Espoo</dd></div>
        <div><dt>Talo</dt><dd>Omakotitalo 1984</dd></div>
        <div><dt>Pinta-ala</dt><dd>8,4 m²</dd></div>
        <div><dt>Työmaalla</dt><dd>19 työpäivää</dd></div>
        <div><dt>Valmistui</dt><dd>Marraskuu 2025</dd></div>
        <div><dt>Hinta</dt><dd>31 900 €</dd></div>
        <div><dt>Kotitalousvähennys</dt><dd>3 200 €</dd></div>
      </dl>
      <div class="prose">
        <h2 style="margin-top:0">Lähtötilanne</h2>
        <p>Alkuperäiset laatat, pieni ikkuna korkealla ja lattiakaivo, jonka kallistus vei vettä kynnykselle päin. Omistajat halusivat ammeen ja näkymän takapihan pellolle.</p>
        <h2>Ratkaisu</h2>
        <p>Ikkuna suurennettiin lattiaan asti ja kaivo siirrettiin sen alle, jolloin koko lattia voitiin kallistaa yhteen suuntaan. Seinät saivat sementtipohjaisen tasoitepinnan, joka jatkuu ilman saumoja. Lattiaan valittiin isokokoinen laatta, jotta saumoja on vähän.</p>
        <h2>Miksi Kallistus</h2>
        <p>Omistajat vertasivat kolmea tarjousta. Kallistus ei ollut halvin, mutta ainoa, joka näytti, miten vedeneristys dokumentoidaan. Se ratkaisi.</p>
      </div>
    </div>
  </section>
  <section class="wrap" style="padding-bottom:var(--s6)">
    {pic(R, 'kauniainen-amme', 'Vapaasti seisova amme ison ikkunan edessä, ulkona syksyinen pelto', '100vw')}
  </section>
  <div class="wrap">{slope('')}</div>
  <section class="sec wrap" style="padding-top:0">
    <div class="grid"><div class="sec-hd"><h2 class="h2">Kuivakansiosta.</h2><p class="lead">Kuusi otetta 46 kuvan kansiosta. Kansio jää omistajille, ja se kulkee talon mukana, jos talo myydään.</p></div></div>
    <ol class="log">{log}</ol>
  </section>
{request(R)}
</main>
''' + footer(R)


def contact_page():
    R = '../'
    return head(R, 'Yhteys – Kallistus', 'Pyydä mittauskäynti tai soita. Toimisto ja varasto Roihupellossa, Helsingissä.', '/yhteys/') + header(R, 'Yhteys') + f'''
<main id="main">
  <section class="ptop wrap">
    <h1 class="h1" style="max-width:12ch">Soita tai kirjoita.</h1>
    <p class="lead">Minna vastaa puhelimeen arkisin 7.30–16. Kirjeisiin ja lomakkeisiin vastaamme saman tai seuraavan arkipäivän aikana.</p>
  </section>
  <section class="wrap" style="padding-bottom:var(--s6)">
    <div class="split">
      <dl class="kv">
        <div><dt>Puhelin</dt><dd><a href="tel:{TEL}">{TEL_H}</a></dd></div>
        <div><dt>Sähköposti</dt><dd><a href="mailto:{MAIL}">{MAIL}</a></dd></div>
        <div><dt>Toimisto ja varasto</dt><dd>{ADDR}</dd></div>
        <div><dt>Laattanäytteet</dt><dd>Ti ja to 15–18</dd></div>
        <div><dt>Y-tunnus</dt><dd>{YT}</dd></div>
      </dl>
      <div class="prose"><p>Toimimme Helsingissä, Espoossa, Kauniaisissa ja Vantaalla. Kauempana teemme kylpyhuoneita, jos samassa taloyhtiössä on useampi remontti.</p><p>Jos sinulla on taloyhtiön muutostyöohje tai pohjapiirros, ota se mukaan mittauskäynnille. Jos ei ole, hankimme ne.</p></div>
    </div>
  </section>
{request(R)}
</main>
''' + footer(R)


CREDITS = []  # filled by credits.json


def photos_page():
    R = '../'
    cr = json.load(open(f'{HERE}/credits.json'))
    rows = ''.join(f'<tr><th scope="row">{e(c["use"])}</th><td>{e(c["who"])}</td><td><a href="{c["url"]}">Pexels</a></td></tr>' for c in cr)
    return head(R, 'Kuvat – Kallistus', 'Sivuston kuvien lähteet.', '/kuvat/') + header(R) + f'''
<main id="main">
  <section class="ptop wrap"><h1 class="h2">Kuvat ja tiedot</h1>
  <div class="prose" style="margin-top:24px"><p>Kallistus Oy on kuvitteellinen yritys, ja sivusto on Ville Saarelan konseptityö. Henkilöt, kohteet, hinnat, osoite, puhelinnumero ja Y-tunnus on keksitty. Y-tunnuksen tarkistusnumero ei voi olla oikea, ja puhelinnumero on Traficomin varatusta numeroalueesta.</p><p>Kuvat ovat Pexelsistä Pexelsin lisenssillä. Kuvissa näkyvät tilat ja ihmiset eivät liity yritykseen. Kuvat on rajattu ja sävytetty sivustoa varten.</p></div></section>
  <section class="wrap" style="padding-bottom:var(--s7)"><table class="ptable credits"><thead><tr><th>Kuva</th><th>Kuvaaja</th><th>Lähde</th></tr></thead><tbody>{rows}</tbody></table></section>
</main>
''' + footer(R)


def write(rel, s):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w').write(s)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for d in ('img', 'fonts'): os.makedirs(f'{OUT}/{d}', exist_ok=True)
    for f in glob.glob(f'{REFS}/out-k/*.webp'): shutil.copy(f, f'{OUT}/img/')
    for f in glob.glob(f'{REFS}/fonts-k/*.woff2'): shutil.copy(f, f'{OUT}/fonts/')
    shutil.copy(f'{REFS}/logo/kallistus.svg', f'{OUT}/img/'); shutil.copy(f'{REFS}/logo/kallistus-light.svg', f'{OUT}/img/')
    shutil.copy(f'{REFS}/logo/kallistus-fav.svg', f'{OUT}/favicon.svg')
    shutil.copy(f'{HERE}/style.css', OUT); shutil.copy(f'{HERE}/script.js', OUT)
    write('index.html', home())
    write('hinnat/index.html', prices_page())
    write('kohteet/index.html', projects_page())
    write('kohteet/nuuksio-1984/index.html', project_page())
    write('yhteys/index.html', contact_page())
    write('kuvat/index.html', photos_page())
    print('ok', OUT)
