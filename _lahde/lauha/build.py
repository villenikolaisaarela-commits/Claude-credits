"""Lauha Talotekniikka Oy (kuvitteellinen) – lämpöpumput ja putkiremontit Pirkanmaalla. Ville Saarelan konseptityö.
python3 build.py  -> /home/user/Claude-credits/demot/lauha/
"""
import os, shutil, glob, html, json
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
REFS = os.path.dirname(HERE)
OUT = '/home/user/Claude-credits/demot/lauha'
V = '1'
TEL, TEL_H = '0485712290', '048 571 2290'
MAIL = 'asiakaspalvelu@lauha.example'
YT = '3302958-4'
ADDR = 'Lämpöpolku 3, 33560 Tampere'
e = lambda s: html.escape(s, quote=True)

IMG = {}
for f in glob.glob(f'{REFS}/out-l/*.webp'):
    b = os.path.basename(f)[:-5]; name, w = b.rsplit('-', 1); IMG.setdefault(name, []).append(int(w))
RATIO = {}
for n, ws in IMG.items():
    ws.sort(); im = Image.open(f'{REFS}/out-l/{n}-{ws[0]}.webp'); RATIO[n] = (im.width, im.height)


def img(R, name, alt, sizes='100vw', eager=False, extra=''):
    ws = IMG[name]; w0, h0 = RATIO[name]
    srcset = ', '.join(f'{R}img/{name}-{w}.webp {w}w' for w in ws)
    mid = ws[min(1, len(ws) - 1)]
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return f'<img src="{R}img/{name}-{mid}.webp" srcset="{srcset}" sizes="{sizes}" width="{w0}" height="{h0}" alt="{e(alt)}" {load} decoding="async"{extra}>'


NAV = [('Lämpöpumput', 'lampopumput/'), ('Putkiremontit', 'putkiremontit/'), ('Kohteet', 'kohteet/'), ('Meistä', 'index.html#me'), ('Yhteys', 'yhteys/')]


def head(R, title, desc, page=True):
    return f'''<!doctype html>
<html lang="fi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.classList.add('js')</script>
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#15262C">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="https://www.villesaarela.com/demot/lauha/og.jpg">
<link rel="icon" href="{R}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{R}apple-touch-icon.png">
<link rel="preload" href="{R}fonts/familjen-600-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{R}style.css?v={V}">
</head>
<body{' class="page"' if page else ''}>
<a class="skip" href="#main">Siirry sisältöön</a>
'''


def header(R, cur=''):
    AC = ' aria-current="page"'
    links = ''.join(f'<a href="{R}{h}"{AC if cur == t else ""}>{t}</a>' for t, h in NAV)
    mlinks = ''.join(f'<a href="{R}{h}">{t}</a>' for t, h in NAV)
    return f'''<header class="hdr">
  <div class="wrap hdr-in">
    <a class="logo" href="{R}index.html"><img class="l-light" src="{R}img/lauha-light.svg" width="247" height="114" alt="Lauha, etusivu"><img class="l-dark" src="{R}img/lauha.svg" width="247" height="114" alt="Lauha, etusivu"></a>
    <nav class="nav" aria-label="Päävalikko">{links}</nav>
    <div class="hdr-r">
      <a class="hdr-tel" href="tel:{TEL}">{TEL_H}</a>
      <a class="btn" href="{R}yhteys/">Pyydä arviokäynti</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav"><span></span><b class="sr">Valikko</b></button>
    </div>
  </div>
  <nav class="mnav" id="mnav" aria-label="Valikko">{mlinks}<a href="tel:{TEL}">Soita {TEL_H}</a></nav>
</header>
'''



# Tampere, typical monthly mean temperatures (rounded)
MONTHS = ['Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu']
TEMPS = [-6, -7, -3, 3, 10, 14, 17, 15, 10, 4, -1, -4]



def chart():
    import math
    out = ''
    for cls, W, H, fs, step in (('chart-d', 1200, 380, 14, 1), ('chart-m', 640, 460, 22, 2)):
        top, lo, hi, left = 24, -30, 26, (40 if W > 700 else 64)
        y = lambda t: top + (hi - t) / (hi - lo) * (H - top - 48)
        xs = [left + i * (W - left - 20) / 11 for i in range(12)]
        pts = list(zip(xs, [y(t) for t in TEMPS]))
        full = []
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]
            for k in range(12):
                t = k / 12; xx = x0 + (x1 - x0) * t; yy = y0 + (y1 - y0) * (3 * t * t - 2 * t * t * t)
                wig = (6 if i < 2 or i > 9 else 3) * math.sin((i * 12 + k) * 1.7)
                if i == 0 and 7 <= k <= 10: wig += (y(-24) - yy) * [0.45, 1, 0.6, 0.2][k - 7]
                full.append((xx, yy + wig))
        full.append(pts[-1])
        d = 'M' + ' L'.join(f'{a:.1f} {b:.1f}' for a, b in full)
        grid = ''.join(f'<line x1="{left}" x2="{W - 20}" y1="{y(t):.0f}" y2="{y(t):.0f}"/><text x="0" y="{y(t) + fs * .35:.0f}" style="font-size:{fs}px">{t:+d}°</text>' for t in (-20, 20))
        months = ''.join(f'<text x="{x:.0f}" y="{H - 8}" text-anchor="middle" style="font-size:{fs}px">{m if step == 1 else m[:3]}</text>' for k, (x, m) in enumerate(zip(xs, MONTHS)) if k % step == 0)
        jan = full[8]
        lab_x = left + 6
        out += f'''<svg class="{cls}" viewBox="0 0 {W} {H}" aria-hidden="true">
        <g class="grid">{grid}<line class="zero" x1="{left}" x2="{W - 20}" y1="{y(0):.0f}" y2="{y(0):.0f}"/><text x="0" y="{y(0) + fs * .35:.0f}" style="font-size:{fs}px">0°</text></g>
        <path class="out" d="{d}"/>
        <line class="in" x1="{left}" x2="{W - 20}" y1="{y(21):.0f}" y2="{y(21):.0f}"/>
        <text class="lbl-in" x="{lab_x}" y="{y(21) - fs * .8:.0f}" style="font-size:{fs + 2}px">Sisällä 21 °C koko vuoden</text>
        <text class="lbl-out" x="{jan[0] + fs:.0f}" y="{jan[1] + fs * .4:.0f}" style="font-size:{fs + 2}px">Pakkasjakso −24 °C</text>
        {months}
      </svg>'''
    return f'''<div class="chart" role="img" aria-label="Kaavio: ulkolämpötila vaihtelee Tampereella tammikuun noin −24 asteen pakkasesta heinäkuun 17 lämpöasteeseen. Sisälämpötila pysyy koko vuoden 21 asteessa.">
      {out}
      <p class="chart-note">Ulkolämpötila: Tampereen tyypillinen vuosi, kuukausien keskilämpötilat pyöristettyinä ja tammikuun pakkasjakso. Sisälämpötila: mitoituksemme tavoite.</p>
    </div>'''


SYSTEMS = [
    ('ulkoyksikko', 'Ilma-vesilämpöpumppu', '12 900–16 900 €', 'öljyn ja sähkön tilalle', '2–3 päivää', 'noin 30 %', 'Yleisin valinta pirkanmaalaiseen öljytaloon. Nykyiset patterit tai lattialämmitys jäävät.'),
    ('jakotukki', 'Maalämpö', '19 800–27 500 €', 'isot talot, pitkä aikajänne', '3–5 päivää', 'noin 45 %', 'Kallein hankkia, edullisin käyttää. Porakaivo vaatii toimenpideluvan, ja haemme sen puolestasi.'),
    ('sisayksikko', 'Ilmalämpöpumppu', '2 300–3 400 €', 'suorasähkötalon lisälämmöksi', '1 päivä', 'noin 40 %', 'Nopein tapa pienentää sähkölaskua ja saada kesäksi viileämpää.'),
]


def systems(R):
    figs = ''.join(f'<figure>{img(R, im, name, "(min-width:900px) 30vw, 100vw")}<figcaption>{name}</figcaption></figure>' for im, name, *_ in SYSTEMS)
    rows = ''.join(f'<tr><th scope="row">{n}<small>{t}</small></th><td data-l="Asennettuna"><b>{p}</b></td><td data-l="Sopii">{f}</td><td data-l="Asennus">{a}</td><td data-l="Työn osuus">{w}</td></tr>' for _, n, p, f, a, w, t in SYSTEMS)
    return f'''<div class="sysfigs">{figs}</div>
      <table class="methods systable"><caption class="sr">Lämpöpumppujen hinnat asennettuna</caption>
        <thead><tr><th scope="col">Järjestelmä</th><th scope="col">Asennettuna</th><th scope="col">Sopii</th><th scope="col">Asennus</th><th scope="col">Työn osuus</th></tr></thead>
        <tbody>{rows}</tbody></table>
      <p class="pnote">Hinnat sisältävät alv:n 25,5 %, laitteen, asennuksen, sähkö- ja putkityöt, käyttöönoton ja öljysäiliön tyhjennyksen ja poiston, kun pumppu tulee öljyn tilalle. Hinnat päivitetty 1.10.2026. Kiinteän hinnan saat arviokäynnin jälkeen.</p>'''


def guarantee():
    return '''<div class="guar"><p class="guar-big">21 °C myös −29 asteen pakkasella.</p><p>Tämä on lämpötakuumme. Mitoitamme pumpun Tampereen mitoituslämpötilaan −29 °C. Jos talo ei pysy lämpimänä ensimmäisenä talvena, korjaamme mitoituksen omalla kustannuksellamme. Asennukselle on viiden vuoden takuu ja laitteelle valmistajan takuu.</p></div>'''


def footer(R):
    return f'''<footer class="ftr">
  <div class="wrap">
    <a class="ftr-tel" href="tel:{TEL}">{TEL_H}</a>
    <p class="ftr-sub">Arkisin 7–16. Taloyhtiökohteissa päivystys työmaan ajan.</p>
    <div class="ftr-g">
      <div><img src="{R}img/lauha.svg" width="247" height="114" alt="Lauha"></div>
      <div><h2>Palvelut</h2><ul><li><a href="{R}lampopumput/">Lämpöpumput</a></li><li><a href="{R}putkiremontit/">Putkiremontit</a></li><li><a href="{R}kohteet/">Kohteet</a></li><li><a href="{R}yhteys/">Yhteys</a></li></ul></div>
      <div><h2>Lauha Talotekniikka Oy</h2><ul><li>{ADDR}</li><li>Y-tunnus {YT}</li><li><a href="mailto:{MAIL}">{MAIL}</a></li></ul></div>
      <div><h2>Toimialue</h2><p>Tampere, Pirkkala, Nokia, Ylöjärvi, Kangasala ja Lempäälä. Taloyhtiöurakat koko Pirkanmaalla.</p></div>
    </div>
    <div class="ftr-bot"><span>© 2026 Lauha Talotekniikka Oy, perustettu 2008</span><span>Konsepti: Lauha on kuvitteellinen yritys, ja sivusto on Ville Saarelan portfoliotyö. <a href="{R}kuvat/">Kuvat ja lähteet</a></span></div>
  </div>
</footer>
<script src="{R}script.js?v={V}" defer></script>
</body>
</html>
'''


def contact(R):
    return f'''  <section class="sec contact" id="yhteys" aria-labelledby="yh-h">
    <div class="wrap contact-in">
      <div>
        <h2 class="h2" id="yh-h">Arviokäynti on maksuton.</h2>
        <p class="lead">Omakotitalossa katsomme lämmitysjärjestelmän, mittaamme ja laskemme pumpun koon. Taloyhtiössä aloitamme kuntotutkimuksesta ja hankesuunnittelusta.</p>
        <div class="direct"><a href="tel:{TEL}">{TEL_H}</a><span>Arkisin 7–16, vastaa Jari tai Sanna</span></div>
      </div>
      <form data-demo novalidate>
        <fieldset class="full who"><legend>Kenen puolesta kysyt?</legend>
          <label><input type="radio" name="kuka" value="okt" checked><span>Omakotitalo</span></label>
          <label><input type="radio" name="kuka" value="ty"><span>Taloyhtiö</span></label>
          <label><input type="radio" name="kuka" value="as"><span>Asukas remonttikohteessa</span></label></fieldset>
        <label class="f">Nimi<input type="text" name="nimi" autocomplete="name"></label>
        <label class="f">Puhelin<input type="tel" name="puhelin" autocomplete="tel"></label>
        <label class="f">Postinumero<input type="text" name="posti" inputmode="numeric" autocomplete="postal-code"></label>
        <label class="f">Nykyinen lämmitys<select name="lammitys"><option>Öljy</option><option>Suora sähkö</option><option>Vesikiertoinen sähkö</option><option>Kaukolämpö</option><option>En tiedä</option></select></label>
        <label class="f full">Mitä haluaisit tietää?<textarea name="viesti"></textarea></label>
        <div class="full" style="display:flex;flex-wrap:wrap;gap:14px 22px;align-items:center"><button class="btn" type="submit">Lähetä</button><span class="note">Konseptisivu: lomake ei lähetä eikä tallenna tietoja.</span></div>
        <p class="ok full" tabindex="-1">Kiitos. Oikealla sivustolla soittaisimme seuraavana arkipäivänä. Tämä lomake ei lähettänyt mitään.</p>
      </form>
    </div>
  </section>
'''


def home():
    R = ''
    creds = ''.join(f'<div><dt>{a}</dt><dd>{b}</dd></div>' for a, b in CREDS)
    faq = ''.join(f'<div><dt>{q}</dt><dd>{a}</dd></div>' for q, a in FAQ)
    crew = [('sanna', 'Sanna Lehtimäki', 'Vastaava työnjohtaja taloyhtiöissä. Tekee rappukortit.'), ('mikko', 'Mikko Kärkkäinen', 'Kylmäasentaja. F-kaasupätevyys, Tukesin rekisterin vastuuhenkilö.'), ('eetu', 'Eetu Salonen', 'Putkiasentaja. Painekokeet ja käyttöönotot.')]
    crew_h = ''.join(f'<li><img src="{R}img/{i}-320.webp" width="320" height="400" alt="{n}" loading="lazy"><div><b>{n}</b><span>{t}</span></div></li>' for i, n, t in crew)
    return head(R, 'Lauha – lämpöpumput ja putkiremontit Tampereella', 'Ilma-vesi- ja maalämpöpumput öljyn ja sähkön tilalle sekä putkiremontit taloyhtiöille Pirkanmaalla. Hinnat, säästölaskuri ja rappukortti.', page=False) + header(R) + f'''
<main id="main">
  <section class="hero" aria-labelledby="h1">
    <div class="hero-bg">{img(R, 'talo-ilta', 'Puutalo rannalla talviyönä, ikkunoissa valoa ja lunta kallioilla', '100vw', eager=True)}</div>
    <div class="wrap hero-in">
      <h1 class="h1" id="h1">Tasainen lämpö. Siisti remontti.</h1>
      <p class="readout">Tammikuun aamu Kangasalla: <strong>ulkona −24 °C</strong><i aria-hidden="true"></i><strong>sisällä 21 °C</strong></p>
    </div>
  </section>
  <nav class="doors" aria-label="Valitse">
    <div class="wrap doors-in">
      <a class="door" href="#omakotitalo"><b>Omakotitaloon <span aria-hidden="true">→</span></b><span>Lämpöpumppu öljyn tai sähkön tilalle. Öljyn vaihdossa kotitalousvähennys on nyt 60 %.</span></a>
      <a class="door" href="#taloyhtio"><b>Taloyhtiölle <span aria-hidden="true">→</span></b><span>Putkiremontit hankesuunnittelusta luovutukseen. Asukkaat tietävät joka päivä, missä mennään.</span></a>
    </div>
  </nav>

  <section class="lline" aria-labelledby="ll-h">
    <div class="wrap">
      <div class="lline-hd"><h2 class="h2" id="ll-h">Ulkona vaihtelee. Sisällä ei.</h2><p class="lead">Mitoitamme jokaisen lämpöpumpun Pirkanmaan pakkasille. Tavoite on yksi viiva: 21 astetta tammikuusta joulukuuhun.</p></div>
      {chart()}
      {guarantee()}
    </div>
  </section>

  <section class="sec" aria-labelledby="ko-h">
    <div class="wrap">
      <div class="sec-hd"><h2 class="h2" id="ko-h">Kohteet luvuin.</h2><p class="lead">Paikkakunta, vuosi ja luvut. Lämmityskulut ennen ovat omistajien laskuista, nykyiset arvioita ensimmäisen talven kulutuksesta.</p></div>
      {cases(R, 3)}
      <p style="margin-top:28px"><a class="tlink" href="kohteet/">Kaikki kohteet</a></p>
    </div>
  </section>

  <section class="sec okt" id="omakotitalo" aria-labelledby="okt-h">
    <div class="wrap">
      <div class="sec-hd"><h2 class="h2" id="okt-h">Lämpöpumput omakotitaloon.</h2><p class="lead">Kolme järjestelmää, hinnat asennettuna. Kerromme arviokäynnillä suoraan, mikä sinun taloosi kannattaa, myös jos vastaus on ”ei mikään vielä”.</p></div>
      {systems(R)}
      {save_calc()}
    </div>
  </section>

  <section class="sec" id="taloyhtio" aria-labelledby="ty-h">
    <div class="wrap">
      <div class="sec-hd"><h2 class="h2" id="ty-h">Putkiremontit taloyhtiöille.</h2><p class="lead">Hallitus päättää, mutta asukkaat elävät remontin keskellä. Siksi jokainen rappu saa rappukortin, jossa näkyy jokainen vesikatko ja jokainen päivä ilman omaa kylpyhuonetta.</p></div>
      {methods()}
      <div class="rk" id="rappukortti">
        <div><h3 class="h3">Rappukortti</h3><p class="muted" style="margin-top:12px">Rappukortti on rapun ilmoitustaululla ja asukkaiden puhelimessa. Päivitämme sen joka maanantai. Jos aikataulu muuttuu, asukkaat kuulevat sen ensin meiltä, eivät naapurilta.</p>
          <ul class="checks" style="margin-top:20px"><li>Vesikatkot tiedossa viikkoja etukäteen</li><li>Väliaikaissuihku rapussa koko remontin ajan</li><li>Lisätöiden hinnasto jokaiselle asunnolle</li><li>Nimetty työnjohtaja, joka vastaa puhelimeen</li></ul></div>
        {rappukortti(R)}
      </div>
    </div>
  </section>

  <section class="sec me" id="me" aria-labelledby="me-h">
    <div class="wrap team">
      <div class="ph">{img(R, 'jari', 'Jari Ojanperä työvaatteissa', '(min-width:980px) 40vw, 100vw')}</div>
      <div>
        <h2 class="h2" id="me-h">Meitä on 14.</h2>
        <blockquote>”Perustin Lauhan vuonna 2008, koska halusin tehdä lämmityksiä, joihin voin itse luvata jotain. Lupaus on edelleen sama: tasainen lämpö ja siisti työmaa.”</blockquote>
        <cite>Jari Ojanperä, toimitusjohtaja ja lämpöpumppuasentaja</cite>
        <ul class="crew">{crew_h}</ul>
      </div>
    </div>
  </section>

  <section class="sec" style="padding-top:0" aria-labelledby="cr-h">
    <div class="wrap two">
      <h2 class="h2" id="cr-h">Pätevyydet ja mitä ne tarkoittavat.</h2>
      <dl class="qa">{creds}</dl>
    </div>
  </section>

  <section class="sec faqs" aria-labelledby="faq-h">
    <div class="wrap">
      <h2 class="h2" id="faq-h">Kysytään usein.</h2>
      <dl class="qa qa-2">{faq}</dl>
    </div>
  </section>
{contact(R)}
</main>
''' + footer(R)


def save_calc():
    return '''<form class="calc" data-save onsubmit="return false" aria-labelledby="save-h">
        <fieldset>
          <h2 id="save-h" class="calc-t">Paljonko säästäisit?</h2>
          <div><span class="lbl" id="n-l">Millä lämmität nyt?</span><div class="pills" role="radiogroup" aria-labelledby="n-l">
            <label><input type="radio" name="nyt" value="oil" checked><span>Öljyllä</span></label>
            <label><input type="radio" name="nyt" value="el"><span>Sähköllä</span></label></div></div>
          <div><label class="lbl" for="kulutus">Kulutus vuodessa</label><div class="slider"><input id="kulutus" type="range" name="kulutus" min="800" max="4500" step="100" value="2600"><output data-amt for="kulutus">2 600 l / v</output></div></div>
          <div><span class="lbl" id="j-l">Mikä tilalle?</span><div class="pills" role="radiogroup" aria-labelledby="j-l">
            <label><input type="radio" name="jarjestelma" value="iv" checked><span>Ilma-vesi</span></label>
            <label><input type="radio" name="jarjestelma" value="ml"><span>Maalämpö</span></label></div></div>
          <div><span class="lbl" id="o-l">Omistajia talossa</span><div class="pills" role="radiogroup" aria-labelledby="o-l">
            <label><input type="radio" name="omistajat" value="1"><span>Yksi</span></label>
            <label><input type="radio" name="omistajat" value="2" checked><span>Kaksi</span></label></div></div>
        </fieldset>
        <div aria-live="polite">
          <p class="out-lbl">Arvioitu säästö lämmityksessä</p>
          <p class="out-big"><span data-save-out>2 330 €</span> <span style="font-size:.4em;letter-spacing:0">/ vuosi</span></p>
          <div class="bars">
            <div class="bar"><span>Nyt</span><i data-b-now style="width:100%"></i><b data-now>3 510 €</b></div>
            <div class="bar after"><span>Lämpöpumpulla</span><i data-b-after style="width:35%"></i><b data-after>1 180 €</b></div>
          </div>
          <div class="rows">
            <div><span>Hankinta asennettuna</span><b data-price>14 400 €</b></div>
            <div><span>Kotitalousvähennys</span><b data-ded>2 290 € (öljyn vaihto, 60 %)</b></div>
            <div><span>Takaisinmaksuaika</span><b data-pay>5,2 vuotta</b></div>
          </div>
          <p class="fine">Oletukset: sähkö 16 snt/kWh siirtoineen, kevyt polttoöljy 1,35 €/l, öljykattilan hyötysuhde 85 %, ilma-vesilämpöpumpun vuosilämpökerroin 3,0 ja maalämmön 3,6. Öljylämmityksen vaihdossa kotitalousvähennys on 60 % työn osuudesta, enintään 3 500 € omistajaa kohden (2025–2027). Muuten 35 %, enintään 1 600 €. Arvio ei ole tarjous.</p>
        </div>
      </form>'''


METHODS = [
    ('Perinteinen linjasaneeraus', 'Kaikki putket ja kylpyhuoneet uusiksi', '850–1 050 €', '12–14 viikkoa', 'Asuminen ei onnistu', '50 vuotta'),
    ('Hybridi', 'Viemärit sukitetaan, vesijohdot ja kylpyhuoneet uusitaan', '550–750 €', '7–9 viikkoa', 'Kylpyhuone pois 5–6 viikkoa', '40–50 vuotta'),
    ('Sukitus', 'Viemärit sisäpuolelta, ei purkua', '160–260 €', '2–3 viikkoa / rappu', 'Vesikatko 5–8 päivää', '40–50 vuotta'),
]


def methods():
    rows = ''.join(f'<tr><th scope="row">{a}<small>{b}</small></th><td data-l="€/asm²"><b>{c}</b></td><td data-l="Kesto">{d}</td><td data-l="Asukkaalle">{x}</td><td data-l="Käyttöikä">{y}</td></tr>' for a, b, c, d, x, y in METHODS)
    return f'''<table class="methods">
        <caption class="sr">Putkiremonttimenetelmät</caption>
        <thead><tr><th scope="col">Menetelmä</th><th scope="col">€/asm²</th><th scope="col">Kesto</th><th scope="col">Asukkaalle</th><th scope="col">Käyttöikä</th></tr></thead>
        <tbody>{rows}</tbody></table>
      <p class="pnote">Hinnat ovat Pirkanmaan kohteistamme 2024–2026, sis. alv 25,5 %. Hankesuunnittelussa vertaamme menetelmät teidän talonne kuntotutkimuksen perusteella. Monessa talossa järkevin on yhdistelmä.</p>'''


# A stairwell schedule: '' = ei haittaa, w = työtä asunnossa, d = oma kylpyhuone ei käytössä, x = vesikatko
PLAN = [('Suojaukset ja asukasilta', '' * 0 + '-----'), ('Purku alkaa', 'xxddd'), ('Viemärit ja nousut', 'ddxdd'), ('Käyttövesiputket', 'dxxdd'),
        ('Vedeneristys', 'ddddd'), ('Laatoitus', 'ddddd'), ('Kalusteet ja painekoe', 'dddx-'), ('Vastaanotto ja siivous', 'ww---')]


def rappukortti(R, full=False):
    panels, tabs = '', ''
    start = {'A': 41, 'B': 43, 'C': 45}
    for k, (rap, wk0) in enumerate(start.items()):
        rows = ''
        for i, (what, code) in enumerate(PLAN if full else PLAN[:6]):
            cells = ''.join(f'<i class="{c if c != "-" else ""}">{"ma ti ke to pe".split()[j]}</i>' for j, c in enumerate(code))
            rows += f'<div class="wk"><span class="lab">vk {wk0 + i}</span><div class="days">{cells}</div><span class="what">{what}</span></div>'
        sel = 'true' if k == 0 else 'false'
        tabs += f'<button role="tab" id="t-{rap}" aria-selected="{sel}" aria-controls="p-{rap}">{rap}</button>'
        panels += f'<div role="tabpanel" id="p-{rap}" aria-labelledby="t-{rap}"{"" if k == 0 else " hidden"}><div class="weeks">{rows}</div></div>'
    more = '' if full else f'<p style="margin-top:14px"><a class="tlink" href="{R}putkiremontit/#rappukortti">Koko rappukortti ja asukasopas</a></p>'
    return f'''<div class="card" data-rk>
        <div class="card-hd"><b>Rappukortti</b><span>As Oy Hervannan Kiikku · päivitetty ma 12.10.2026</span></div>
        <div class="tabs" role="tablist" aria-label="Rappu">{tabs}</div>
        {panels}
        <div class="legend"><span class="x">Vesikatko</span><span class="d">Oma kylpyhuone ei käytössä, rapun väliaikaissuihku auki</span><span>Ei haittaa</span></div>
        <div class="foreman"><img src="{R}img/sanna-320.webp" alt="" width="320" height="400" loading="lazy"><div><b>Sanna Lehtimäki, vastaava työnjohtaja</b><span>Työmaalla arkisin 7–15 · <a href="tel:{TEL}">{TEL_H}</a></span></div></div>
        {more}
      </div>'''


CASES = [
    ('kangasala-1979', 'sininen-talo', 'Öljystä ilma-vesilämpöpumppuun', 'Kangasala · omakotitalo 1979', [('Pinta-ala', '164 m²'), ('Asennus', '3 päivää'), ('Lämmitys ennen', '3 900 € / v'), ('Arvio nyt', '1 450 € / v')]),
    ('hervanta-1974', 'kerrostalot', 'Hybridiputkiremontti, 48 asuntoa', 'Hervanta · kerrostalo 1974', [('Hinta', '640 € / asm²'), ('Kesto / rappu', '8 viikkoa'), ('Vesikatkoja', '6 päivää'), ('Lisätöitä', '31 asuntoa')]),
    ('pirkkala-1952', 'punainen-talo', 'Maalämpö rintamamiestaloon', 'Pirkkala · omakotitalo 1952', [('Pinta-ala', '142 m²'), ('Porakaivo', '210 m'), ('Lämmitys ennen', '3 300 € / v'), ('Arvio nyt', '980 € / v')]),
    ('nokia-1988', 'kerrostalo-keltainen', 'Viemäreiden sukitus asuen', 'Nokia · kerrostalo 1988', [('Hinta', '210 € / asm²'), ('Kesto / rappu', '3 viikkoa'), ('Vesikatkoja', '5 päivää'), ('Asunnot', '24')]),
    ('ylojarvi-2004', 'koivut', 'Suorasta sähköstä ilmalämpöpumppu', 'Ylöjärvi · omakotitalo 2004', [('Pinta-ala', '128 m²'), ('Asennus', '1 päivä'), ('Sähköä ennen', '24 500 kWh'), ('Arvio nyt', '17 800 kWh')]),
    ('lempaala-1991', 'kerrostalo-vihrea', 'Putkiremontin hankesuunnittelu', 'Lempäälä · kerrostalo 1991', [('Vaihe', 'hankesuunnittelu'), ('Vaihtoehtoja', '3'), ('Päätös', 'yhtiökokous 4/2027'), ('Asunnot', '30')]),
]


def cases(R, n=6, prefix=''):
    out = ''
    for k, (slug, im, title, where, facts) in enumerate(CASES[:n]):
        dl = ''.join(f'<div><dt>{a}</dt><dd>{b}</dd></div>' for a, b in facts)
        link = k == 0
        tag = 'a' if link else 'article'
        href = f' href="{prefix}kohteet/{slug}/"' if link else ''
        go = '<span class="go">Lue koko kohde</span>' if link else ''
        out += f'<{tag} class="case"{href}>{img(R, im, title, "(min-width:1100px) 30vw, (min-width:760px) 46vw, 100vw")}<div class="case-b"><span class="where">{where}</span><h3>{title}</h3><dl>{dl}</dl>{go}</div></{tag}>'
    return f'<div class="cases">{out}</div>'


CREDS = [
    ('Tukesin kylmäalan rekisteri', 'Saamme käsitellä kylmäaineita. Vastuuhenkilönä Mikko Kärkkäinen.'),
    ('F-kaasupätevyys', 'Jokaisella lämpöpumppuasentajallamme on henkilökohtainen pätevyystodistus.'),
    ('Sähköurakoitsijarekisteri', 'Teemme pumpun sähkökytkennät itse, ilman aliurakoitsijaa.'),
    ('Luotettava Kumppani', 'Verot, eläkemaksut ja vakuutukset ovat kunnossa, ja sen voi tarkistaa.'),
    ('Suomen Lämpöpumppuyhdistys', 'Jäsen vuodesta 2012. Mitoitamme alan ohjeiden mukaan.'),
    ('YSE 1998', 'Taloyhtiöurakat tehdään rakennusalan yleisillä sopimusehdoilla.'),
]

FAQ = [
    ('Riittääkö ilma-vesilämpöpumppu kovilla pakkasilla?', 'Riittää, kun se mitoitetaan oikein. Mitoitamme pumpun Tampereen mitoituslämpötilaan: talo pysyy 21 asteessa −29 asteen pakkasella. Sen alapuolella pumpun sähkövastus auttaa. Jos talo ei pysy lämpimänä ensimmäisenä talvena, korjaamme mitoituksen omalla kustannuksellamme.'),
    ('Mitä öljysäiliölle tehdään?', 'Tyhjennämme, puhdistamme ja poistamme säiliön. Maanalaisen säiliön voi myös täyttää hiekalla. Tämä sisältyy hintaan, kun pumppu tulee öljyn tilalle.'),
    ('Saako öljylämmityksen vaihtoon vielä avustusta?', 'Valtion avustuksen haku päättyi toukokuussa 2026. Kotitalousvähennys on öljylämmityksen vaihdossa korotettu: 60 % työn osuudesta, enintään 3 500 € omistajaa kohden vuosina 2025–2027.'),
    ('Kuinka kauan putkiremontti kestää yhdessä rapussa?', 'Menetelmästä riippuen kahdesta neljääntoista viikkoa. Rappukortista näet jo ennen aloitusta, minä päivinä vesi on poikki ja milloin oma kylpyhuone on käytössä.'),
    ('Voiko asukas tilata lisätöitä?', 'Voi. Jokaisessa taloyhtiökohteessa on lisätöiden hinnasto, ja asukaskohtaiset lisätyöt laskutetaan suoraan asukkaalta. Niihin voi saada kotitalousvähennyksen.'),
    ('Missä toimitte?', 'Tampereella, Pirkkalassa, Nokialla, Ylöjärvellä, Kangasalla ja Lempäälässä. Taloyhtiöurakoita teemme koko Pirkanmaalla.'),
]



def heatpumps_page():
    R = '../'
    steps = [('Arviokäynti', 'Viikon sisällä', 'Katsomme nykyisen lämmityksen, patterit ja paikan ulkoyksikölle. Kulutustiedot mittaamme tai lasketaan laskuista.'),
             ('Mitoitus ja tarjous', '3 arkipäivää', 'Kiinteä hinta, pumpun koko perusteluineen ja kotitalousvähennys laskettuna valmiiksi.'),
             ('Asennus', '2–3 päivää', 'Lämmitys on poikki enintään yhden päivän. Talvella tuomme väliaikaislämmittimet.'),
             ('Käyttöönotto', 'Ensimmäinen talvi', 'Säädämme lämpökäyrän ja tarkistamme kulutuksen etänä ensimmäisen talven ajan.')]
    st = ''.join(f'<li><b>{a}</b><span class="when">{b}</span><p>{c}</p></li>' for a, b, c in steps)
    return head(R, 'Lämpöpumput – Lauha', 'Ilma-vesilämpöpumput, maalämpö ja ilmalämpöpumput Pirkanmaalla: hinnat asennettuna, säästölaskuri, asennuksen kulku ja lämpötakuu.') + header(R, 'Lämpöpumput') + f'''
<main id="main">
  <section class="ptop wrap"><h1 class="h1" style="max-width:13ch">Lämpöpumput öljyn ja sähkön tilalle.</h1><p class="lead">Hinnat asennettuna, säästö omalla kulutuksellasi ja se, mitä asennusviikolla tapahtuu.</p></section>
  <section class="wrap" style="padding-bottom:var(--s6)">{systems(R)}{save_calc()}</section>
  <section class="sec" style="background:var(--frost-2)"><div class="wrap"><div class="sec-hd"><h2 class="h2">Näin asennus etenee.</h2></div><ol class="steps">{st}</ol></div></section>
  <section class="sec" style="padding-top:0"><div class="wrap">{guarantee()}</div></section>
  <section class="sec wrap"><div class="two">
    <div><h2 class="h2">Mitä hinta sisältää.</h2></div>
    <ul class="checks"><li>Laite ja ulkoyksikön jalusta tai seinäteline</li><li>Putkityöt ja liitos nykyiseen lämmönjakoon</li><li>Sähkötyöt omilla sähköasentajilla</li><li>Öljysäiliön tyhjennys ja poisto</li><li>Porakaivo ja toimenpidelupa maalämmössä</li><li>Käyttöönotto, lämpökäyrän säätö ja opastus</li><li>Kulutuksen seuranta ensimmäisen talven ajan</li></ul>
  </div></section>
{contact(R)}
</main>
''' + footer(R)


def pipes_page():
    R = '../'
    tl = [('Kuukaudet 1–6', 'Kuntotutkimus ja hankesuunnittelu', 'Kuvaamme viemärit, arvioimme putkien kunnon ja vertaamme menetelmät. Hallitus saa kolme vaihtoehtoa hintoineen.'),
          ('Yhtiökokous', 'Päätös', 'Esittelemme vaihtoehdot yhtiökokouksessa ja vastaamme asukkaiden kysymyksiin.'),
          ('6 viikkoa ennen', 'Asukasilta ja lisätyöt', 'Rappukortit, lisätöiden hinnasto ja jokaisen asunnon katselmus. Asukas valitsee laatat ja kalusteet.'),
          ('Työmaa', 'Rappu kerrallaan', 'Vesikatkot vain rappukortin päivinä. Työnjohtaja on työmaalla joka arkipäivä.'),
          ('Vastaanotto', 'Luovutus ja takuu', 'Vastaanottotarkastus, käyttö- ja huolto-ohjeet sekä takuutarkastus vuoden päästä.')]
    t = ''.join(f'<li><span class="d">{a}</span><div><b>{b}</b><p>{c}</p></div></li>' for a, b, c in tl)
    return head(R, 'Putkiremontit – Lauha', 'Putkiremontit taloyhtiöille Pirkanmaalla: menetelmät ja hinnat, rappukortti, asukkaan opas ja lisätyöt.') + header(R, 'Putkiremontit') + f'''
<main id="main">
  <section class="ptop wrap"><h1 class="h1" style="max-width:13ch">Putkiremontti, jossa asukas tietää.</h1><p class="lead">Hankesuunnittelusta vastaanottoon. Jokaisella rapulla on oma kortti, jokaisella päivällä oma merkintä.</p></section>
  <section class="wrap" style="padding-bottom:var(--s6)">{methods()}</section>
  <section class="sec" id="rappukortti" style="background:var(--frost-2)"><div class="wrap rk" style="margin-top:0">
    <div><h2 class="h2">Rappukortti.</h2><p class="lead" style="margin-top:20px">Koko kahdeksan viikon kortti hybridiremontista. Valitse rappu.</p>
    <div class="ba" style="margin-top:32px;grid-template-columns:1fr">{''.join(f'<figure>{img(R, n, a, "(min-width:980px) 30vw, 100vw")}<figcaption><b>{c}</b></figcaption></figure>' for n, a, c in [('vanhat-putket', 'Vanhat valurautaviemärit kylpyhuoneen seinässä', 'Ennen: valurautaviemärit vuodelta 1974')])}</div></div>
    {rappukortti(R, full=True)}
  </div></section>
  <section class="sec wrap"><div class="two"><div><h2 class="h2">Kulku.</h2></div><ol class="timeline">{t}</ol></div></section>
  <section class="sec" style="padding-top:0"><div class="wrap two">
    <div class="prose"><h2 style="margin-top:0">Asukkaalle</h2><p>Kotitalousvähennys ei koske taloyhtiön osuutta, mutta asukkaan omat lisätyöt voivat sen saada: esimerkiksi kalliimmat laatat, lisäpistorasiat tai keittiön muutokset. Laskutamme lisätyöt suoraan asukkaalta, ja laskussa työ on eriteltynä.</p><p>Jos muutatte remontin ajaksi pois, kerromme tarkat päivät kuusi viikkoa etukäteen. Kotivakuutus ei yleensä korvaa väistöasuntoa.</p></div>
    <figure class="ba" style="grid-template-columns:1fr"><figure>{img(R, 'kerrostalot', 'Hervantalaisia kerrostaloja syksyllä', '(min-width:980px) 46vw, 100vw')}<figcaption><b>As Oy Hervannan Kiikku</b>, 1974, kolme rappua ja 48 asuntoa.</figcaption></figure></figure>
  </div></section>
{contact(R)}
</main>
''' + footer(R)


def cases_page():
    R = '../'
    return head(R, 'Kohteet – Lauha', 'Lämpöpumppu- ja putkiremonttikohteita Pirkanmaalla luvuin.') + header(R, 'Kohteet') + f'''
<main id="main">
  <section class="ptop wrap"><h1 class="h1" style="max-width:12ch">Kohteet luvuin.</h1><p class="lead">Omakotitaloissa kerromme lämmityskulut ennen ja arvion nyt. Taloyhtiöissä hinnan neliöltä, keston ja vesikatkojen määrän.</p></section>
  <section class="wrap" style="padding-bottom:var(--s7)">{cases(R, 6, R)}</section>
{contact(R)}
</main>
''' + footer(R)


def case_page():
    R = '../../'
    tl = [('Syyskuu', 'Arviokäynti', 'Öljykattila vuodelta 1996, kulutus noin 2 900 litraa vuodessa. Patterit riittävän isoja, joten ilma-vesilämpöpumppu sopi ilman lattialämmitystä.'),
          ('Lokakuu, pv 1', 'Öljyn pois', 'Säiliön tyhjennys ja poisto, vanhan kattilan purku. Talossa lämmitys väliaikaislämmittimillä yhden yön.'),
          ('Pv 2', 'Pumppu paikalleen', 'Ulkoyksikkö talon päätyyn, sisäyksikkö entiseen kattilahuoneeseen, putkityöt ja sähköt.'),
          ('Pv 3', 'Käyttöönotto', 'Lämpökäyrä säädettiin pattereille, ja omistajat saivat opastuksen ja sovelluksen.'),
          ('Tammikuu', 'Ensimmäinen pakkasjakso', 'Ulkona −24 °C, sisällä 21 °C. Lisävastus oli päällä kahtena yönä.')]
    t = ''.join(f'<li><span class="d">{a}</span><div><b>{b}</b><p>{c}</p></div></li>' for a, b, c in tl)
    return head(R, 'Öljystä ilma-vesilämpöpumppuun, Kangasala – Lauha', 'Omakotitalo vuodelta 1979: öljylämmitys vaihtui ilma-vesilämpöpumppuun kolmessa päivässä. Lämmityskulut 3 900 eurosta arviolta 1 450 euroon vuodessa.') + header(R, 'Kohteet') + f'''
<main id="main">
  <section class="ptop wrap">
    <nav class="crumb" aria-label="Murupolku"><a href="{R}kohteet/">Kohteet</a><span aria-hidden="true">/</span><span>Kangasala</span></nav>
    <h1 class="h1" style="max-width:14ch">Öljystä ilma-vesi­lämpöpumppuun.</h1>
    <p class="lead">Kangasalalainen omakotitalo vuodelta 1979. Öljysäiliö lähti, pumppu tuli ja patterit jäivät. Kolme päivää, yksi kylmä yö väliaikaislämmittimillä.</p>
  </section>
  <section class="wrap"><div class="kimg" style="border-radius:20px;overflow:hidden">{img(R, 'ulkoyksikko', 'Ilma-vesilämpöpumpun ulkoyksikkö talon vieressä pensaiden keskellä', '100vw', eager=True)}</div></section>
  <section class="sec wrap"><div class="two">
    <dl class="kv"><div><dt>Paikka</dt><dd>Kangasala</dd></div><div><dt>Talo</dt><dd>Omakotitalo 1979, 164 m²</dd></div><div><dt>Ennen</dt><dd>Öljy, 2 900 l / v</dd></div><div><dt>Nyt</dt><dd>Ilma-vesilämpöpumppu</dd></div><div><dt>Hinta asennettuna</dt><dd>15 200 €</dd></div><div><dt>Kotitalousvähennys</dt><dd>2 × 1 220 €</dd></div><div><dt>Lämmitys ennen</dt><dd>3 900 € / v</dd></div><div><dt>Arvio nyt</dt><dd>1 450 € / v</dd></div></dl>
    <div class="prose"><h2 style="margin-top:0">Miksi ilma-vesi eikä maalämpö</h2><p>Maalämpö olisi ollut käytöltään edullisempi, mutta tontilla kulkee vesijohto juuri siellä, minne porakaivo olisi mahtunut. Ilma-vesilämpöpumpulla takaisinmaksuaika on omistajien kulutuksella noin viisi vuotta.</p><h2>Mitä omistajat seuraavat</h2><p>Sovelluksesta näkyy päivän kulutus ja ulkolämpötila. Tarkistimme kulutuksen etänä ensimmäisen talven ajan ja säädimme lämpökäyrää kahdesti.</p></div>
  </div></section>
  <section class="wrap ba" style="padding-bottom:var(--s6)">
    <figure>{img(R, 'tekninen-tila', 'Kodinhoitohuone, jossa on käyttövesivaraaja ja pyykinpesukone', '(min-width:760px) 46vw, 100vw')}<figcaption><b>Entinen kattilahuone.</b> Nyt varaaja ja pyykkihuone, öljyn haju lähti.</figcaption></figure>
    <figure>{img(R, 'patteri', 'Patteri ja auringonvalo olohuoneen seinällä', '(min-width:760px) 46vw, 100vw')}<figcaption><b>Patterit jäivät.</b> Menoveden lämpötila riittää −24 asteessa.</figcaption></figure>
  </section>
  <section class="sec" style="background:var(--frost-2)"><div class="wrap two"><div><h2 class="h2">Aikajana.</h2></div><ol class="timeline">{t}</ol></div></section>
{contact(R)}
</main>
''' + footer(R)


def contact_page():
    R = '../'
    return head(R, 'Yhteys – Lauha', 'Pyydä maksuton arviokäynti tai soita. Lauha Talotekniikka, Tampere.') + header(R, 'Yhteys') + f'''
<main id="main">
  <section class="ptop wrap"><h1 class="h1" style="max-width:12ch">Soita, niin tullaan katsomaan.</h1><p class="lead">Arviokäynti on maksuton omakotitaloille ja taloyhtiöille. Vastaamme arkisin 7–16.</p></section>
  <section class="wrap" style="padding-bottom:var(--s6)"><div class="two">
    <dl class="kv"><div><dt>Puhelin</dt><dd><a href="tel:{TEL}">{TEL_H}</a></dd></div><div><dt>Sähköposti</dt><dd><a href="mailto:{MAIL}">{MAIL}</a></dd></div><div><dt>Toimisto ja varasto</dt><dd>{ADDR}</dd></div><div><dt>Päivystys taloyhtiökohteissa</dt><dd>24 h työmaan aikana</dd></div><div><dt>Y-tunnus</dt><dd>{YT}</dd></div></dl>
    <div class="prose"><p>Jos olet asukas taloyhtiössä, jossa teemme putkiremonttia, rapun työnjohtajan numero on rappukortissa ja rapun ilmoitustaululla.</p></div>
  </div></section>
{contact(R)}
</main>
''' + footer(R)


def photos_page():
    R = '../'
    cr = json.load(open(f'{HERE}/credits.json'))
    rows = ''.join(f'<tr><td>{e(c["use"])}</td><td>{e(c["who"])}</td><td><a href="{c["url"]}">Pexels</a></td></tr>' for c in cr)
    return head(R, 'Kuvat ja lähteet – Lauha', 'Sivuston kuvien ja lukujen lähteet.') + header(R) + f'''
<main id="main">
  <section class="ptop wrap"><h1 class="h2">Kuvat ja lähteet</h1>
  <div class="prose" style="margin-top:24px"><p>Lauha Talotekniikka Oy on kuvitteellinen yritys, ja sivusto on Ville Saarelan konseptityö. Henkilöt, kohteet, taloyhtiöt, osoite, puhelinnumero ja Y-tunnus on keksitty. Y-tunnuksen tarkistusnumero ei voi olla oikea, ja puhelinnumero on Traficomin varatusta numeroalueesta.</p><p>Hinnat ja kestot perustuvat julkisiin lähteisiin syksyllä 2026: Isännöintiliiton putkiremonttibarometri, alan hintavertailut ja Verohallinnon tiedot kotitalousvähennyksestä. Kuvissa näkyvät lämpöpumput ovat alpha innotecin markkinointikuvia; Lauha ei liity valmistajaan. Kuvissa näkyvät talot ja ihmiset eivät liity yritykseen.</p></div></section>
  <section class="wrap" style="padding-bottom:var(--s7)"><table class="credits-t"><thead><tr><th>Kuva</th><th>Kuvaaja</th><th>Lähde</th></tr></thead><tbody>{rows}</tbody></table></section>
</main>
''' + footer(R)


def write(rel, s):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w').write(s)


if __name__ == '__main__':
    for d in ('img', 'fonts'): os.makedirs(f'{OUT}/{d}', exist_ok=True)
    for f in glob.glob(f'{REFS}/out-l/*.webp'): shutil.copy(f, f'{OUT}/img/')
    for f in glob.glob(f'{REFS}/fonts-l/*.woff2'): shutil.copy(f, f'{OUT}/fonts/')
    for f in ('lauha.svg', 'lauha-light.svg'): shutil.copy(f'{REFS}/logo/{f}', f'{OUT}/img/')
    shutil.copy(f'{REFS}/logo/lauha-fav.svg', f'{OUT}/favicon.svg')
    shutil.copy(f'{HERE}/style.css', OUT); shutil.copy(f'{HERE}/script.js', OUT)
    write('index.html', home())
    write('lampopumput/index.html', heatpumps_page())
    write('putkiremontit/index.html', pipes_page())
    write('kohteet/index.html', cases_page())
    write('kohteet/kangasala-1979/index.html', case_page())
    write('yhteys/index.html', contact_page())
    write('kuvat/index.html', photos_page())
    print('ok', OUT)
