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
