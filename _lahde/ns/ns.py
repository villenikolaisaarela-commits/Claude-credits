"""villesaarela.com, dark version in the spirit of the reference the owner chose: the home page and one case study per project.
BASE=/esikatselu/nonstop python3 ns.py   -> preview (noindex)
python3 ns.py                            -> live pages
"""
import os, json
os.chdir('/home/user/Claude-credits')
BASE = os.environ.get('BASE', '')
V = '11'
SITE = 'https://www.villesaarela.com'
MAIL = 'info@villesaarela.com'
TEL, TEL_H = '+358451035362', '045 103 5362'
AR = '<span class="ar" aria-hidden="true">↗</span>'


def u(p):
    return BASE + p


def cta(href, label, ext=False):
    t = ' target="_blank" rel="noopener"' if ext else ''
    return f'<a class="cta" href="{href}"{t}><span>{label}</span><span class="cta-ar" aria-hidden="true">↗</span></a>'


FIELDS = ['Arkkitehtitoimistot', 'Sisustusarkkitehdit', 'Puusepät', 'Valaisinsuunnittelu', 'Huonekalumuotoilu', 'Vaatemerkit', 'Maisema-arkkitehdit', 'Graafinen suunnittelu', 'Valokuvaajat', 'Keramiikka']

# One entry per project. The front page shows name, title and the short line; the case study tells the rest and says plainly that the work is a concept.
WORKS = [
    dict(slug='haljala', name='Arkkitehtitoimisto Haljala', short='Haljala', title='Soittaja tietää jo hinnan', ala='Arkkitehtitoimisto', city='Tampere',
         work='Nimi, sanamerkki, ilme ja sivusto', site='14 sivua, etusivu 1,0 Mt',
         desc='Pieni toimisto piirtää taloja, huviloita ja saunoja Pirkanmaalle. Hinnat ja vuoden 2027 vapaat aloitukset näkyvät sivulla, joten yhteydenotot tulevat ihmisiltä, joille aikataulu ja budjetti sopivat.',
         concept='Arkkitehtitoimisto Haljala on kuvitteellinen yritys. Tein sivuston näyttääkseni, mitä pienen arkkitehtitoimiston sivut voivat tehdä.',
         credits='Kuvissa näkyvillä rakennuksilla ei ole yhteyttä yritykseen. Kuvat ovat Unsplash-lisenssin alaisia kuvia, ja kuvaajat mainitaan sivustolla. Piirustukset on tehty sivustoa varten.',
         start=['Arkkitehtitoimisto Haljala on viiden hengen toimisto Tampereella. Se suunnittelee taloja, huviloita ja saunoja yksityisille ihmisille ja korjaa vanhoja hirsitaloja, useimmiten Pirkanmaalla. Uusia töitä se ottaa vuodessa 4–6.',
                'Asiakas on perhe, joka rakentaa taloa tai pelastaa vanhaa. Hän haluaa tietää, mitä suunnittelu maksaa, milloin työ voi alkaa ja millaisia pohjia toimisto piirtää. Alan parhaat sivut näyttävät kauniita kuvia, mutta nämä kysymykset jäävät niissä usein auki.'],
         solution='Etusivu kertoo yhdellä virkkeellä, mitä toimisto tekee ja kenelle, ja näyttää heti valmiin huvilan maisemassaan. Kohdesivut etenevät tontin ehdoista ratkaisuun, tietoruutuun ja piirustuksiin. Hinnat arvonlisäveroineen, vuoden 2027 vapaat aloitukset, työn alla olevat kohteet ja jokaisen suora numero ovat näkyvillä. Typografia on Source Serif 4 ja Public Sans lämpimällä paperinvärillä, ja alatunniste on tervan värinen.',
         does=[('Soittaja tietää jo hinnan', 'Hinnat ja vuoden 2027 vapaat aloitukset näkyvät, joten yhteydenotot tulevat ihmisiltä, joille aikataulu ja budjetti sopivat.'),
               ('Kohteet vastaavat perheen kysymyksiin', 'Tontti, ratkaisu, pinta-ala ja piirustukset kertovat, millaisia taloja toimisto piirtää.'),
               ('Pieni toimisto näyttää toimivalta', 'Työn alla -lista päivämäärineen kertoo, että toimistossa tehdään töitä juuri nyt.')],
         made=['Nimi, sanamerkki, värit ja typografia', 'Kohdesivuilla tietoruutu, kuvatekstit ja piirustukset', 'Palvelut ja hinnat -sivu arvonlisäveroineen', 'Työn alla -lista ja vapaat aloitukset etusivulla'],
         mobile='Puhelimella etusivun huvila rajautuu pystykuvaksi, piirustukset pysyvät luettavina ja valikko avautuu koko näytön listaksi.',
         alt=dict(lista='Työt-sivu', kohde='Kohdesivu, Huvila Kallio', hinnat='Palvelut ja hinnat -sivu', toimisto='Toimisto-sivu', yhteys='Yhteystiedot')),
    dict(slug='lindqvist-ekroos', name='Lindqvist Ekroos Arkkitehdit', short='Lindqvist Ekroos', title='Valmiina, kun kunta pyytää tarjousta', ala='Arkkitehtitoimisto', city='Helsinki',
         work='Nimi, tunnus, ilme ja sivusto', site='21 sivua, suomi ja englanti, etusivu 0,5 Mt',
         desc='Toimisto suunnittelee kouluja ja päiväkoteja. Referenssit hankintatapoineen, työryhmä ja sopimusehdot löytyvät sivulta, ja 25 työn arkisto näyttää lautakunnalle, mitä on rakennettu.',
         concept='Lindqvist Ekroos Arkkitehdit on kuvitteellinen yritys. Tein sivuston näyttääkseni, mitä julkisia rakennuksia suunnittelevan toimiston sivut voivat tehdä.',
         credits='Kuvissa näkyvillä rakennuksilla ei ole yhteyttä yritykseen. Kuvat ovat Unsplash-lisenssin alaisia kuvia, ja kuvaajat mainitaan sivustolla. Piirustukset on tehty sivustoa varten.',
         start=['Lindqvist Ekroos Arkkitehdit on kahdentoista hengen toimisto Helsingissä. Se suunnittelee kouluja, päiväkoteja ja puukerrostaloja, ja suurin osa töistä tulee julkisista hankinnoista ja arkkitehtuurikilpailuista.',
                'Sivuston lukija on yleensä kunnan hankeasiantuntija tai palkintolautakunnan jäsen. Hän haluaa nähdä nopeasti, mitä toimisto on rakentanut, kuka hanketta vetää ja millä ehdoilla toimisto työskentelee.'],
         solution='Etusivulla on yksi lause toimistosta, viimeksi valmistunut päiväkoti ja koko 25 työn arkisto työnumeroineen, paikkoineen ja tiloineen. Jokaisella projektisivulla on tietolaatikko hankintatavasta työryhmään, toimiston omat asemapiirrokset ja leikkaukset sekä kuvaajien nimet. Toimeksiannot-sivulla kerrotaan sopimusehdot, tuntihinnat ja hankkeen vaiheet kestoineen. Ilme on rauhallinen: yksi kirjaintyyppi, betoninharmaa ja puun lämpö kuvissa.',
         does=[('Tarjouspyyntöön tarvittava on valmiina', 'Referenssit hankintatapoineen, työryhmä ja sopimusehdot löytyvät sivulta, kun kunta pyytää tarjousta.'),
               ('Arkisto osoittaa kokemuksen', '25 työtä numeroineen, tiloineen ja vuosineen näyttää lautakunnalle, mitä toimisto on rakentanut.'),
               ('Vetäjä näkyy jokaisessa työssä', 'Projektisivulla on nimetty pääsuunnittelija, joten tilaaja tietää, kuka hanketta johtaisi.')],
         made=['Nimi, LE-tunnus, värit ja typografia', '25 työn arkisto suodattimilla etusivulla', 'Projektisivuilla hankintatiedot ja piirustukset', 'Toimeksiannot-sivu sopimusehtoineen ja tuntihintoineen'],
         mobile='Puhelimella arkisto tiivistyy kaksiriviseksi listaksi, jossa työnumero, nimi, vuosi ja tila näkyvät ilman vaakavieritystä.',
         alt=dict(lista='Projektit-sivu', kohde='Projektisivu, Honkaniityn koulu', hinnat='Toimeksiannot-sivu', toimisto='Toimisto-sivu', yhteys='Yhteystiedot')),
    dict(slug='studio-kuusela', name='Studio Kuusela', short='Studio Kuusela', title='Näkyy, mitä suunnittelu muuttaa', ala='Sisustusarkkitehtitoimisto', city='Turku',
         work='Nimi, liikemerkki, ilme ja sivusto', site='16 sivua, etusivu 0,5 Mt',
         desc='Kohdesivuilla on pohjapiirros puretuin ja uusin seinin sekä materiaaliluettelo, ja suunnittelun hinta näkyy jokaisen kohteen tiedoissa. Konsultaatioon tullaan hinta tiedossa.',
         concept='Studio Kuusela on kuvitteellinen yritys. Tein sivuston näyttääkseni, mitä sisustusarkkitehdin sivut voivat tehdä.',
         credits='Kuvat ovat Unsplash-lisenssin alaisia kuvia, ja kuvaajat mainitaan sivustolla.',
         start=['Studio Kuusela on kahden sisustusarkkitehdin toimisto Turun Port Arthurissa. Se suunnittelee koteja ja kesähuviloita Varsinais-Suomessa sekä pari kahvilaa tai liikettä vuodessa.',
                'Alan parhaat sivut näyttävät hienoilta, mutta niistä ei selviä, mitä suunnittelu maksaa. Kotimaisilla kuluttajasivuilla hinnat näkyvät, mutta ulkoasu muistuttaa usein valmispohjaa. Asiakas haluaa tietää molemmat ennen kuin varaa konsultaation.'],
         solution='Etusivu alkaa yhdellä isolla kuvalla Nauvon saunarakennuksesta, ja heti sen alla kerrotaan, keitä studiossa on ja missä se on. Kohdesivujen tietolaatikossa on myös suunnittelun hinta, ja jokaisella kohteella on materiaaliluettelo. Puolalanmäen asunnon kohdalla on pohjapiirros, josta näkee puretut ja uudet seinät. Palvelut ja hinnat -sivulla on koko hinnasto, työn vaiheet ja ehdot. Liikemerkki on piirretty EB Garamondin kirjainmuodoista, ja kaikki kuvat on käsitelty samalla lämpimällä säädöllä.',
         does=[('Konsultaatioon tullaan hinta tiedossa', 'Suunnittelun hinta näkyy jokaisen kohteen tiedoissa ja hinnastossa.'),
               ('Kohteet näyttävät, mitä suunnittelu muuttaa', 'Pohjapiirros puretuin ja uusin seinin ja materiaaliluettelot näyttävät työn, eivät vain lopputulosta.'),
               ('Studion ihmiset näkyvät heti', 'Etusivulla kerrotaan heti, keitä studiossa on ja missä se on. Kotia suunnittelevalle se on tärkeää.')],
         made=['Nimi, liikemerkki, värit ja typografia', 'Suunnittelun hinta jokaisen kohteen tiedoissa', 'Pohjapiirros puretuin ja uusin seinin', 'Hinnasto, työn vaiheet ja ehdot'],
         mobile='Puhelimella pääkuva rajautuu pystyyn kiukaan ja ikkunan ympärille, ja kohdesivuilla teksti tulee ennen tietolaatikkoa.',
         alt=dict(lista='Kohteet-sivu', kohde='Kohdesivu, Asunto Puolalanmäki', hinnat='Palvelut ja hinnat -sivu', toimisto='Studio-sivu', yhteys='Yhteystiedot')),
    dict(slug='keljon-puusepat', name='Keljon Puusepät', short='Keljon Puusepät', title='Hinnan suunta ennen puhelua', ala='Keittiöpuusepänliike', city='Jyväskylä',
         work='Nimi, tunnus, ilme ja sivusto', site='19 sivua, etusivu 0,6 Mt',
         desc='Hintataulukko keittiön pituuden mukaan ja laskuri vastaavat yleisimpään kysymykseen. Toimitusaika ja seuraava vapaa verstasaika näkyvät, joten asiakas osaa varata ajoissa.',
         concept='Keljon Puusepät on kuvitteellinen yritys. Tein sivuston näyttääkseni, mitä puusepänliikkeen sivut voivat tehdä.',
         credits='Kuvat ovat Unsplash-lisenssin alaisia kuvia, ja kuvaajat mainitaan sivustolla.',
         start=['Keljon Puusepät on viiden hengen puusepänliike Jyväskylän Keljossa. Se tekee mittatilauskeittiöitä ja vaatekaappeja koivuvanerista ja massiivipuusta ja asentaa ne itse, ja toimitusaika on 8–10 viikkoa.',
                'Suomalaisten puusepänliikkeiden sivuilla on yleensä iskulause ja kuvakaruselli mutta ei yhtään hintaa. Keittiötä suunnitteleva haluaa kuitenkin ensin tietää, mitä keittiö maksaa ja milloin se ehtii valmistua.'],
         solution='Sivuston runko on numeroitu keittiöluettelo. Jokaisella työllä on numero, paikka, vuosi ja toteutunut hinta, ja sama numero poltetaan tiskialtaan kaappiin huoltoa varten. Hintasivulla on taulukko keittiön pituuden mukaan, laskuri ja yksi keittiö eriteltynä riveittäin. Ilmeessä on kaksi pääväriä, koivunvaalea ja tumma tammi, ja yksi kirjasinperhe kahdessa leveydessä.',
         does=[('Hinnan suunta selviää ennen puhelua', 'Hintataulukko keittiön pituuden mukaan ja laskuri vastaavat yleisimpään kysymykseen.'),
               ('Tarjouspyynnöt tulevat oikeaan aikaan', 'Toimitusaika ja seuraava vapaa verstasaika näkyvät, joten asiakas osaa varata ajoissa.'),
               ('Työ palvelee asennuksen jälkeenkin', 'Numeroitu keittiöluettelo ja hoito-ohjeet auttavat asiakasta vielä vuosia myöhemmin.')],
         made=['Nimi, K-tunnus, värit ja typografia', 'Numeroitu keittiöluettelo ja arkisto vuodesta 2016', 'Hintataulukko, laskuri ja yksi keittiö eriteltynä', 'Hoito-ohjeet, takuu ja maksuerät'],
         mobile='Puhelimella jo ensimmäinen näkymä kertoo toimitusajan ja hintahaarukan, ja valikon alareunassa ovat verstaan puhelinnumero ja tarjouspyyntö.',
         alt=dict(lista='Keittiöt-sivu', kohde='Keittiösivu, K-201', hinnat='Hinnat-sivu', toimisto='Verstas-sivu', yhteys='Tarjouspyyntö-sivu')),
    dict(slug='kivela-rinne', name='Kivelä Rinne', short='Kivelä Rinne', title='Tuotevastaava löytää kaiken', ala='Valaisin- ja huonekalumuotoilu', city='Lahti',
         work='Nimi, leima, ilme ja sivusto', site='14 sivua, etusivu 0,2 Mt',
         desc='Jokaisella tuotteella on oma sivu, jossa ovat mitat, materiaalit, valmistaja ja prototyyppien määrä. Etusivu painaa 0,2 Mt, joten se aukeaa messuillakin.',
         concept='Kivelä Rinne on kuvitteellinen yritys, ja tuotteet ja valmistajat on keksitty sivustoa varten. Tein sivuston näyttääkseni, mitä muotoilustudion sivut voivat tehdä.',
         credits='Tuotekuvat ovat 3D-mallinnuksia, ja muut kuvat ovat Unsplash-lisenssin alaisia kuvia, joiden kuvaajat mainitaan sivustolla.',
         start=['Kivelä Rinne on kahden muotoilijan studio Lahdessa. Se suunnittelee valaisimia ja huonekaluja suomalaisille valmistajille ja tekee prototyypit omalla verstaallaan. Sivuston tärkein lukija on tehtaan tuotevastaava, joka päättää, kenelle antaa kahden vuoden tuotekehityksen.',
                'Kävin läpi kaksitoista muotoilustudioiden ja valmistajien sivustoa. Parhaat näyttävät kauniin tuotekuvan ja valmistajan nimen, mutta mitat, aikataulu ja yhteistyön ehdot puuttuvat lähes kaikilta. Ne halusin tälle sivustolle.'],
         solution='Etusivulla studion koivuvanerinen valaisin roikkuu sivun yläreunasta. Tuotekuvien tausta on tasattu samaan harmaaseen kuin sivu, joten tuotteet näyttävät olevan samassa tilassa. Jokaisella tuotteella on oma sivu, jossa ovat mitat, materiaalit, valmistaja, hinta, prototyyppien määrä ja aineistoluettelo. Valmistajille-sivulla on yhteistyön vaiheet kestoineen, rojalti ja prototyyppien hinnat.',
         does=[('Tuotevastaava löytää tarvitsemansa', 'Mitat, materiaalit, valmistaja ja prototyyppien määrä ovat jokaisella tuotesivulla.'),
               ('Yhteistyön ehdot ovat valmiina', 'Vaiheet kestoineen, rojalti ja prototyyppien hinnat kertovat sopimuksen sisällön ennen ensimmäistä tapaamista.'),
               ('Sivu aukeaa messuillakin', 'Etusivu painaa 0,2 Mt, joten se latautuu puhelimella heikossakin verkossa.')],
         made=['Nimi, KR-leima, värit ja typografia', 'Tuotesivut valmistajan tietokortteina', 'Valmistajille-sivu vaiheineen, rojalteineen ja hintoineen', 'Piirretty huone toisena reittinä tuotteisiin'],
         mobile='Puhelimella valaisin roikkuu näytön yläreunasta otsikon yläpuolella, tuotteet ovat kahdessa sarakkeessa ja huonetta voi vierittää sivusuunnassa.',
         alt=dict(lista='Tuotteet-sivu', kohde='Tuotesivu, Orsi', hinnat='Valmistajille-sivu', toimisto='Studio-sivu', yhteys='Yhteys-sivu')),
    dict(slug='kaulus', name='Kaulus', short='Kaulus', title='Kysymykset vähenevät ennen ostoa', ala='Vaatemerkki ja verkkokauppa', city='Helsinki',
         work='Nimi, merkki, ilme ja verkkokauppa', site='18 sivua, etusivu 0,9 Mt',
         desc='Neljä pellavapaitaa, mitat mallin mukaan ja varastotilanne koon mukaan. Kun koko loppuu, sivu kertoo, minä viikkona seuraava erä valmistuu.',
         concept='Kaulus on kuvitteellinen yritys, eikä paitoja myydä. Tein verkkokaupan näyttääkseni, mitä pienen vaatemerkin sivut voivat tehdä.',
         credits='Kuvat ovat Unsplash-lisenssin alaisia kuvia, ja kuvaajat mainitaan sivustolla.',
         start=['Kaulus on helsinkiläinen merkki, joka tekee vain lyhythihaisia pellavapaitoja. Neljä ihmistä leikkaa ja ompelee Vallilan ateljeessa neljää mallia noin 40 paidan erissä, ja hinnat ovat 119–135 euroa.',
                'Pienen merkin verkkokauppa on usein joko valmiin pohjan näköinen tai kaunis mutta ohut: kuvat ovat hienoja, mutta mitat ja toimitusehdot puuttuvat. Halusin kaupan, joka kestää vertailun isojen pohjoismaisten merkkien sivuihin ja kertoo silti pienen ateljeen arjesta.'],
         solution='Etusivu alkaa kahdella paitakuvalla ja yhdellä lauseella siitä, mitä Vallilassa tehdään. Tuotesivulla on mitat mallin mukaan, kankaan paino ja alkuperä vaiheittain, varastotilanne koon mukaan ja viikko, jolloin seuraava erä valmistuu. Valmistussivulla Harakan 129 euron hinta on purettu osiin. Ostoskori ja suosikit toimivat selaimessa, ja kassalla kerrotaan rauhallisesti, ettei tilauksia oteta vastaan.',
         does=[('Kysymykset vähenevät ennen ostoa', 'Mitat mallin mukaan, kankaan tiedot ja varastotilanne koon mukaan vastaavat siihen, mitä asiakas muuten kysyisi sähköpostilla.'),
               ('Loppunut koko ei katkaise ostoa', 'Seuraavan erän viikko kertoo, milloin koko palaa myyntiin.'),
               ('Hinta on perusteltu', 'Paidan hinta purettuna osiin kertoo, miksi Vallilassa ommeltu paita maksaa 129 euroa.')],
         made=['Nimi, niskanauhamerkki, värit ja typografia', 'Varastotilanne koon mukaan ja seuraavan erän viikko', 'Paidan hinta purettu osiin', 'Toimitusehdot, peruuttamislomake ja korjaushinnasto'],
         mobile='Puhelimella paidat täyttävät ruudun yksi kerrallaan, tuotekuvia selataan pyyhkäisemällä ja ostoskori aukeaa sivun reunasta koko näytön levyisenä.',
         alt=dict(lista='Paidat-sivu', kohde='Tuotesivu, Harakka', hinnat='Valmistus-sivu', toimisto='Ateljee-sivu', yhteys='Kokoopas')),
]
BY = {w['slug']: w for w in WORKS}

# Tools a client may want to recognise, drifting past as grey logos. Logos come from Simple Icons (CC0);
# Adobe keeps its logos out of free icon sets, so its two apps are set as names.
TOOLS = [('Figma', 'figma'), ('Adobe Photoshop', None), ('Claude', 'claude'), ('HTML5', 'html5'), ('CSS', 'css'), ('JavaScript', 'javascript'),
         ('Adobe Illustrator', None), ('GitHub', 'github'), ('Google Search Console', 'googlesearchconsole'), ('Lighthouse', 'lighthouse')]

FAQ = [
    ('Kauanko projekti kestää?', 'Yleensä kahdesta neljään viikkoa. Luonnos etusivusta on valmis 48 tunnissa, ja aikataulu sovitaan ennen aloitusta.'),
    ('Mitä se maksaa?', 'Kiinteä hinta, jonka kerron luonnoksen jälkeen, kun tiedän, mitä tarvitset. Se ei muutu matkalla, eikä kuukausimaksuja ole.'),
    ('Mitä saan käteeni?', 'Valmiit sivut omassa osoitteessasi: suunnittelun, tekstit, kuvien käsittelyn, toimivuuden puhelimella ja Google-perusasiat. Sivut ja domain ovat sinun.'),
    ('Kenen kanssa teen töitä?', 'Minun. Suunnittelen, kirjoitan ja rakennan sivut itse, ilman välikäsiä.'),
    ('Meillä on jo sivut.', 'Hyvä. Kysymys on, tuovatko ne yhteydenottoja. Ilmainen luonnos näyttää eron.'),
    ('Voinko päivittää sivuja itse?', 'Pienet muutokset teen nopeasti. Jos haluat päivittää itse, kerro siitä alussa, niin rakennan sivut sen mukaan.'),
    ('Entä jos meillä on jo logo?', 'Silloin se pidetään. Sivut rakennetaan sen ympärille, eikä ilmettä tarvitse aloittaa alusta.'),
    ('Miten aloitetaan?', 'Lähetä linkki nykyisiin sivuihisi tai kerro, mitä teet. Teen etusivusta ilmaisen luonnoksen 48 tunnissa. Se ei sido mihinkään.'),
]


def mark(eager=False):
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return f'''<div class="mark">
        <div class="mark-in">
          <picture>
            <source media="(max-width: 699px)" srcset="/assets/img/aa-3d-m.webp" width="1170" height="620">
            <img src="/assets/img/aa-3d-1440.webp" srcset="/assets/img/aa-3d-1440.webp 1440w, /assets/img/aa-3d-2880.webp 2880w" sizes="100vw" width="1440" height="620" alt="" {load} decoding="async">
          </picture>
        </div>
      </div>'''


def head(title, desc, path, extra=''):
    meta = '<meta name="robots" content="noindex">' if BASE else f'<link rel="canonical" href="{SITE}{path}">'
    return f'''<!doctype html>
<html lang="fi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>document.documentElement.classList.add('js')</script>
  <title>{title}</title>
  <meta name="description" content="{desc}">
  {meta}
  <meta name="theme-color" content="#070707">
  <meta name="color-scheme" content="dark">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fi_FI">
  <meta property="og:site_name" content="Ville Saarela">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{SITE}{path}">
  <meta property="og:image" content="{SITE}/assets/img/og-ns.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/geist-300-700-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/geist-mono-400-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/ns.css?v={V}">{extra}
</head>
'''


def header(home=True, sec='Etusivu'):
    h = '' if home else u('/')
    return f'''<body>
  <a class="skip" href="#main">Siirry sisältöön</a>
  <header class="hdr">
    <div class="pill hdr-l">
      <a class="logo" href="{u('/')}" aria-label="Ville Saarela, etusivu"><img src="/assets/img/ville-saarela-valkoinen.svg" width="521" height="74" alt="Ville Saarela"></a>
      <span class="hdr-sec mono" aria-hidden="true"><span data-sec>{sec}</span></span>
    </div>
    <div class="hdr-in">
      <nav class="pill nav" aria-label="Päävalikko"><a href="{u('/tyot/')}"{' aria-current="page"' if sec == 'Työt' else ''}>Työt</a><a href="{h}#kysymykset">Kysymykset</a><a href="{h}#yhteys">Yhteys</a></nav>
      <p class="hdr-clock mono"><span>Helsinki</span> <time data-clock></time></p>
    </div>
  </header>
'''


def footer(home=True):
    h = '' if home else u('/')
    return f'''
  <footer class="ftr">
    {mark()}
    <div class="ftr-in">
      <div class="ftr-bot">
        <div>
          <div class="ftr-links"><a href="{u('/tyot/')}">Työt</a><a href="mailto:{MAIL}">{MAIL}</a><a href="tel:{TEL}">{TEL_H}</a><a href="/tietosuoja/">Tietosuoja</a></div>
          <p class="small">© 2026 Ville Saarela, Isosaarentie 10, 00840 Helsinki. Y-tunnus 3660060-6. <a class="mono up" href="#main">[ Ylös ]</a></p>
        </div>
        {cta(h + '#yhteys', 'Ota yhteyttä')}
      </div>
    </div>
  </footer>
  <script src="/assets/vendor/lenis.min.js" defer></script>
  <script src="/assets/js/ns.js?v={V}" defer></script>
</body>
</html>
'''


def icon(slug):
    return f'<img class="ico" src="/assets/img/projektit/{slug}/icon.svg" width="20" height="20" alt="">'


def work(i, w, full=False):
    s = w['slug']
    base = f'/assets/img/projektit/{s}'
    href = u(f'/projektit/{s}/')
    return f'''      <article class="work" style="--i:{i}">
        <a class="w-img" href="{href}" tabindex="-1" aria-hidden="true"><img src="{base}/cover-960.webp" srcset="{base}/cover-960.webp 960w, {base}/cover.webp 1600w" sizes="(min-width: 1200px) 66vw, (min-width: 800px) 50vw, 100vw" width="1600" height="1000" alt="" loading="lazy" decoding="async"><span class="peek"><img data-src="{base}/full-960.webp" width="960" height="2400" alt="" decoding="async"></span></a>
        <div class="w-tx">
          <a class="w-bar" href="{href}"><span class="w-lead">{icon(s)}<h{2 if full else 3} class="w-name">{w['name']}</h{2 if full else 3}></span><span class="w-y mono">2026 {AR}</span></a>
          <p class="w-t">{w['title']}</p>
          <p class="w-meta mono">{w['ala']}, {w['city']}{('<br>' + w['work'] + '<br>' + w['site']) if full else ''}</p>
          <p class="w-d">{w['desc']}</p>
        </div>
      </article>'''


def home():
    works = '\n'.join(work(i, w) for i, w in enumerate(WORKS))
    fields = ''.join(f'<li>{f}</li>' for f in FIELDS)
    tools = ''.join('<li>' + (f'<img src="/assets/img/tyokalut/{i}.svg" width="24" height="24" alt="">' if i else '') + f'{n}</li>' for n, i in TOOLS)
    faq = '\n'.join(f'        <details><summary>{q}</summary><p>{a}</p></details>' for q, a in FAQ)
    ld = {"@context": "https://schema.org", "@type": "ProfessionalService", "name": "Ville Saarela", "url": SITE + "/", "image": SITE + "/assets/img/og-ns.jpg",
          "description": "Verkkosivut arkkitehdeille, suunnittelijoille ja tekijöille Helsingistä. Luonnos etusivusta 48 tunnissa.",
          "email": MAIL, "telephone": TEL, "taxID": "3660060-6",
          "address": {"@type": "PostalAddress", "streetAddress": "Isosaarentie 10", "postalCode": "00840", "addressLocality": "Helsinki", "addressCountry": "FI"}}
    title = 'Ville Saarela · Verkkosivut arkkitehdeille, suunnittelijoille ja tekijöille'
    desc = 'Ville Saarela suunnittelee ja rakentaa verkkosivuja Helsingissä arkkitehdeille, suunnittelijoille ja tekijöille. Luonnos etusivusta 48 tunnissa.'
    return head(title, desc, '/', f'\n  <script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>') + header() + f'''
  <main id="main">
    <section class="hero" aria-labelledby="h1" data-sec-name="Etusivu">
      <div class="split hero-tx">
        <div aria-hidden="true"></div>
        <div>
          <h1 class="big two" id="h1">Ville Saarela suunnittelee ja rakentaa verkkosivuja Helsingissä. <span>Teen sivut arkkitehdeille, suunnittelijoille ja tekijöille, joiden työ on parempaa kuin heidän nykyiset sivunsa.</span></h1>
          <p class="small">Luonnos uudesta etusivusta 48 tunnissa. Maksuton, eikä sido mihinkään.</p>
          {cta('#yhteys', 'Pyydä luonnos')}
        </div>
      </div>
      {mark(eager=True)}
    </section>

    <section class="fields" aria-labelledby="alat-h">
      <h2 class="lab" id="alat-h">Alat <span>Teen sivuja esimerkiksi näille</span></h2>
      <div class="marq">
        <div class="marq-track">
          <ul>{fields}</ul>
          <ul aria-hidden="true">{fields}</ul>
        </div>
      </div>
    </section>

    <section class="sec" id="tyot" aria-labelledby="tyot-h" data-sec-name="Työt">
      <div class="split sec-hd">
        <h2 class="lab" id="tyot-h">Työt <span>Valitut, 2026</span></h2>
        <p class="big two">Teen sivut, joilla työ näkyy <span>ja oikea asiakas ottaa yhteyttä.</span></p>
      </div>
      <div class="works" style="--last:{len(WORKS) - 1}">
{works}
      </div>
      <p class="more"><a class="mono" href="{u('/tyot/')}">[ Kaikki työt ]</a></p>
    </section>

    <section class="sec" id="tyokalut" aria-labelledby="tyokalut-h" data-sec-name="Työkalut">
      <div class="split sec-hd">
        <h2 class="lab" id="tyokalut-h">Työkalut <span>Suunnittelu, koodi ja mittaus</span></h2>
        <p class="big two">Suunnittelen Figmassa ja koodaan sivut itse, ilman valmispohjia. <span>Ennen julkaisua mittaan nopeuden ja saavutettavuuden.</span></p>
      </div>
      <div class="marq marq-tools">
        <div class="marq-track">
          <ul>{tools}</ul>
          <ul aria-hidden="true">{tools}</ul>
        </div>
      </div>
    </section>

    <section class="sec quote" aria-labelledby="asiakas-h" data-sec-name="Asiakas">
      <div class="split">
        <h2 class="lab" id="asiakas-h">Asiakas <span>BuffBird Oy</span></h2>
        <figure>
          <blockquote><p class="big">”Ville teki sivut, jotka saavat ihmiset innostumaan BuffBirdista jo ennen julkaisua.”</p></blockquote>
          <figcaption class="by"><img src="/assets/img/valtteri-96.webp" width="96" height="96" alt="" loading="lazy" decoding="async"><span><b>Valtteri Viitala</b><span class="small">Toimitusjohtaja, BuffBird Oy</span></span></figcaption>
        </figure>
      </div>
    </section>

    <section class="sec" id="kysymykset" aria-labelledby="kysymykset-h" data-sec-name="Kysymykset">
      <div class="split">
        <h2 class="lab" id="kysymykset-h">Kysymykset <span>Hinta, aikataulu ja ylläpito</span></h2>
        <div class="faq">
{faq}
        </div>
      </div>
    </section>

    <section class="sec" id="yhteys" aria-labelledby="yhteys-h" data-sec-name="Yhteys">
      <div class="split">
        <h2 class="lab" id="yhteys-h">Yhteys <span>Vastaan vuorokauden sisällä</span></h2>
        <div>
          <p class="big two">Kerro, mitä teet, ja lähetä linkki nykyisiin sivuihisi. <span>Saat luonnoksen uudesta etusivusta 48 tunnissa.</span></p>
          <div class="reach big">
            <a class="u" href="mailto:{MAIL}?subject=Luonnospyynt%C3%B6">{MAIL}</a>
            <a class="u" href="tel:{TEL}">{TEL_H}</a>
          </div>
        </div>
      </div>
    </section>
  </main>
''' + footer()


def frame(src, alt, w, h, eager=False, cls=''):
    """One picture in the gallery. Screenshots come in two sizes; the others are single files."""
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    if '/cs/' in src:
        stem = src[:-5]
        img = f'<img src="{stem}-960.webp" srcset="{stem}-960.webp 960w, {src} 1600w" sizes="(min-width: 1200px) 66vw, 100vw" width="{w}" height="{h}" alt="{alt}" {load} decoding="async">'
    elif '/mobile-' in src:
        stem = src[:-5]
        img = f'<img src="{stem}-300.webp" srcset="{stem}-300.webp 300w, {src} 600w" sizes="(min-width: 1200px) 21vw, 31vw" width="{w}" height="{h}" alt="{alt}" {load} decoding="async">'
    else:
        img = f'<img src="{src}" width="{w}" height="{h}" alt="{alt}" {load} decoding="async">'
    return f'<figure class="cs-frame{cls}">{img}</figure>'


def worklist():
    works = '\n'.join(work(i, w, full=True) for i, w in enumerate(WORKS))
    index = '\n'.join(f'''        <li><a href="{u(f"/projektit/{w['slug']}/")}"><span class="mono ix-no">{i + 1:02d}</span><span class="ix-name">{icon(w['slug'])}{w['name']}</span><span class="ix-t">{w['title']}</span><span class="ix-ala">{w['ala']}, {w['city']}</span><span class="mono ix-y">2026 {AR}</span></a></li>''' for i, w in enumerate(WORKS))
    title = 'Työt · Ville Saarela'
    desc = 'Kuusi sivustoa arkkitehtitoimistoille, sisustusarkkitehdille, puusepälle, muotoilustudiolle ja vaatemerkille. Ville Saarela, Helsinki.'
    return head(title, desc, '/tyot/') + header(home=False, sec='Työt') + f'''
  <main id="main">
    <section class="wk" aria-labelledby="wk-h">
      <div class="split wk-open" data-opener>
        <p class="lab">Työt <span>{len(WORKS)} projektia, 2026</span></p>
        <h1 class="big two" id="wk-h">Valitut työt. <span>Kuusi sivustoa: kaksi arkkitehtitoimistoa, sisustusarkkitehti, puuseppä, muotoilustudio ja vaatemerkki.</span></h1>
      </div>
      <div class="works" style="--last:{len(WORKS) - 1}">
{works}
      </div>
    </section>

    <section class="sec" aria-labelledby="ix-h" data-sec-name="Indeksi">
      <div class="split sec-hd">
        <h2 class="lab" id="ix-h">Indeksi <span>Kaikki työt</span></h2>
        <p class="big two">Jokaisella työllä on oma sivu. <span>Siinä kerron, mistä lähdettiin, mitä tein ja mitä sivusto tekee yritykselle.</span></p>
      </div>
      <ol class="ix">
{index}
      </ol>
    </section>

    <section class="sec" aria-labelledby="wk-cta" data-sec-name="Yhteys">
      <div class="split">
        <h2 class="lab" id="wk-cta">Sinun työsi <span>Luonnos 48 tunnissa</span></h2>
        <div>
          <p class="big two">Haluatko työllesi tällaiset sivut? <span>Lähetä linkki nykyisiin sivuihisi, niin saat luonnoksen uudesta etusivusta 48 tunnissa.</span></p>
          <p class="wk-acts">{cta(u('/') + '#yhteys', 'Pyydä luonnos')}<a class="u" href="mailto:{MAIL}?subject=Luonnospyynt%C3%B6">{MAIL}</a></p>
        </div>
      </div>
    </section>
  </main>
''' + footer(home=False)


CHAPTERS = ['Lähtökohta', 'Ratkaisu', 'Mitä sivusto tekee', 'Toteutus']


def case(i, w):
    s = w['slug']
    nxt = WORKS[(i + 1) % len(WORKS)]
    b = f'/assets/img/projektit/{s}'
    a = w['alt']
    sh = w['short']
    rows = [
        (0, [frame(f'{b}/cs/koti.webp', f'{sh}: etusivu', 1600, 1000, eager=True)]),
        (None, [frame(f'{b}/cs/lista.webp', f'{sh}: {a["lista"]}', 1600, 1000), frame(f'{b}/cs/kohde.webp', f'{sh}: {a["kohde"]}', 1600, 1000)]),
        (1, [frame(f'{b}/cs/kohde-2.webp', f'{sh}: {a["kohde"]}, tiedot', 1600, 1000)]),
        (None, [frame(f'{b}/cs/hinnat.webp', f'{sh}: {a["hinnat"]}', 1600, 1000, cls=' is-off')]),
        (2, [frame(f'/assets/img/tyot/{s}-wire.webp', f'{sh}: etusivun rautalankamalli', 1000, 625), frame(f'/assets/img/tyot/{s}-final.webp', f'{sh}: valmis etusivu', 1000, 625)]),
        (None, [frame(f'{b}/cs/koti-2.webp', f'{sh}: etusivu alempaa', 1600, 1000)]),
        (3, [frame(f'{b}/mobile-{k}.webp', f'{sh} puhelimella, näkymä {k}', 600, 1298) for k in (1, 2, 3)]),
        (None, [frame(f'{b}/cs/toimisto.webp', f'{sh}: {a["toimisto"]}', 1600, 1000), frame(f'{b}/cs/yhteys.webp', f'{sh}: {a["yhteys"]}', 1600, 1000)]),
    ]
    out = []
    for ch, fr in rows:
        start = '' if ch is None else f' data-ch-start="{ch}"'
        out.append(f'        <div class="cs-row cs-n{len(fr)}"{start}>{"".join(fr)}</div>')
    gallery = '\n'.join(out)
    bodies = [
        ''.join(f'<p>{p}</p>' for p in w['start']),
        f'<p>{w["solution"]}</p>',
        '<ol class="cs-does">' + ''.join(f'<li><b>{t}</b> {d}</li>' for t, d in w['does']) + '</ol>',
        '<ul class="cs-made">' + ''.join(f'<li>{m}</li>' for m in w['made']) + f'</ul><p>{w["mobile"]}</p>'
        + f'<dl class="cs-facts"><div><dt>Ala</dt><dd>{w["ala"]}, {w["city"]}</dd></div><div><dt>Työ</dt><dd>{w["work"]}</dd></div><div><dt>Sivusto</dt><dd>{w["site"]}</dd></div></dl>'
        + f'<p class="cs-credits">{w["credits"]}</p>',
    ]
    acc = '\n'.join(f'''          <div class="cs-item{' is-open' if n == 0 else ''}" data-ch="{n}">
            <h2 class="cs-h"><button class="cs-q" type="button" aria-expanded="{'true' if n == 0 else 'false'}" aria-controls="ch-{n}">{c}<span class="cs-pm" aria-hidden="true"></span></button></h2>
            <div class="cs-panel" id="ch-{n}"><div class="cs-in">{bodies[n]}</div></div>
          </div>''' for n, c in enumerate(CHAPTERS))
    title = f'{w["name"]}: {w["title"]} · Konsepti · Ville Saarela'
    desc = f'{w["title"]}. {w["desc"]}'
    nhref = u(f'/projektit/{nxt["slug"]}/')
    return head(title, desc, f'/projektit/{s}/') + header(home=False, sec='Työt') + f'''
  <main id="main" class="cs">
    <div class="cs-body">
      <div class="cs-gallery" data-cs-gallery>
{gallery}
      </div>
      <aside class="cs-aside" aria-label="Projektin tiedot">
        <div class="cs-acc-wrap"><div class="cs-acc" data-cs-acc data-lenis-prevent>
          <div class="cs-head"><span class="cs-lead">{icon(s)}<h1 class="cs-name">{w['name']}</h1></span><span class="cs-year mono">2026</span></div>
          <p class="cs-big">{w['title']}</p>
          <p class="cs-concept"><span class="tag mono">Konsepti</span> {w['concept']}</p>
{acc}
          <div class="cs-acts">{cta(f'/demot/{s}/', 'Avaa sivusto', ext=True)}<a class="u small cs-ask" href="{u('/')}#yhteys">Haluatko tällaiset sivut? Pyydä luonnos</a></div>
        </div></div>
        <nav class="cs-next" aria-label="Seuraava projekti">
          <p class="cs-next-l">Seuraava projekti:</p>
          <a class="cs-next-row" href="{nhref}"><span class="cs-lead">{icon(nxt['slug'])}<span class="cs-name">{nxt['name']}</span></span><span class="cs-title">{nxt['title']}</span><span class="cs-year mono">2026 {AR}</span></a>
        </nav>
      </aside>
    </div>
  </main>
''' + footer(home=False)


PRIVACY = [
    ('Rekisterinpitäjä', [f'Ville Saarela, Isosaarentie 10, 00840 Helsinki. Y-tunnus 3660060-6.',
                          f'Tietosuoja-asioissa voit ottaa yhteyttä sähköpostilla <a class="u" href="mailto:{MAIL}">{MAIL}</a> tai puhelimella <a class="u" href="tel:{TEL}">{TEL_H}</a>.']),
    ('Mitä tietoja käsittelen', ['Kun lähetät sähköpostia tai soitat, saan nimesi, yhteystietosi, yrityksesi nimen ja sen, mitä kerrot projektistasi. Asiakkailta tarvitsen lisäksi laskutustiedot.',
                                 'Sivustolla ei ole lomakkeita, evästeitä eikä kävijäseurantaa. Fontit, kuvat ja skriptit ladataan tältä sivustolta, ei muiden yritysten palvelimilta.']),
    ('Miksi ja millä perusteella', ['Käytän tietoja vastatakseni yhteydenottoihin, tehdäkseni tarjouksia ja hoitaakseni sovitun työn. Peruste on sopimuksen valmistelu ja täytäntöönpano (tietosuoja-asetuksen 6 artiklan 1 kohdan b alakohta).',
                                    'Laskutustietoja säilytän, koska kirjanpitolaki vaatii sitä (6 artiklan 1 kohdan c alakohta).']),
    ('Kuinka kauan säilytän tietoja', ['Poistan yhteydenotot, joista ei tule projektia, kahden vuoden kuluessa. Asiakasprojektin viestit säilytän projektin ajan ja kaksi vuotta sen jälkeen.',
                                       'Kirjanpitoaineisto säilytetään kirjanpitolain mukaan: tositteet kuusi vuotta ja tilinpäätös kymmenen vuotta tilikauden päättymisestä.']),
    ('Kenelle tiedot menevät', ['En myy enkä luovuta tietoja markkinointiin. Tiedot kulkevat vain sähköposti- ja kirjanpitopalveluiden kautta, joita käytän työssäni.',
                                'Sivusto on GitHub Pages -palvelussa. GitHub voi käsitellä kävijöiden IP-osoitteita palvelun turvallisuuden vuoksi. GitHub on yhdysvaltalainen yritys, ja se kertoo käsittelystä omassa tietosuojaselosteessaan.']),
    ('Oikeutesi', ['Voit pyytää nähdä tietosi, korjata ne tai poistaa ne, jos laki ei vaadi niiden säilyttämistä. Voit myös vastustaa käsittelyä tai pyytää sen rajoittamista. Lähetä pyyntö sähköpostilla, niin vastaan kuukauden kuluessa.',
                   'Jos katsot, että käsittelen tietojasi väärin, voit tehdä valituksen tietosuojavaltuutetun toimistolle (tietosuoja.fi).']),
    ('Konseptityöt', ['Projektisivujen yritykset ovat kuvitteellisia, ja niiden sivustot ovat konseptitöitä. Niiden lomakkeet eivät lähetä tietoja minnekään.']),
]


def privacy():
    body = '\n'.join(f'          <h2>{h}</h2>' + ''.join(f'<p>{p}</p>' for p in ps) for h, ps in PRIVACY)
    return head('Tietosuoja | Ville Saarela', 'Miten Ville Saarela käsittelee henkilötietoja.', '/tietosuoja/') + header(home=False, sec='Tietosuoja') + f'''
  <main id="main">
    <section class="doc">
      <div class="split">
        <p class="lab">Tietosuoja <span>Päivitetty 9.10.2026</span></p>
        <div class="doc-in">
          <h1 class="big">Tietosuoja</h1>
{body}
        </div>
      </div>
    </section>
  </main>
''' + footer(home=False)


def notfound():
    h = head('Sivua ei löytynyt | Ville Saarela', 'Sivua ei löytynyt.', '/404.html').replace(f'<link rel="canonical" href="{SITE}/404.html">', '<meta name="robots" content="noindex">')
    return h + header(home=False, sec='404') + f'''
  <main id="main">
    <section class="doc">
      <div class="split">
        <p class="lab">404 <span>Sivua ei löytynyt</span></p>
        <div class="doc-in">
          <h1 class="big">Sivua ei löytynyt.</h1>
          <p>Osoite on voinut muuttua. Etusivulta löydät työt, kysymykset ja yhteystiedot.</p>
          <p class="doc-acts">{cta(u('/'), 'Etusivulle')}<a class="u" href="{u('/')}#yhteys">Pyydä luonnos</a></p>
        </div>
      </div>
    </section>
  </main>
''' + footer(home=False)


def redirect(path, to, title, noindex=True):
    d = path.strip('/')
    os.makedirs(d, exist_ok=True)
    open(f'{d}/index.html', 'w').write(f'<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>{title}</title><meta http-equiv="refresh" content="0; url={to}"><link rel="canonical" href="{SITE}{to.split("#")[0]}"></head><body><p><a href="{to}">{title}</a></p></body></html>')


def sitemap():
    urls = [('/', '1.0'), ('/tyot/', '0.9')] + [(f'/projektit/{w["slug"]}/', '0.8') for w in WORKS] + [('/tietosuoja/', '0.3')]
    body = '\n'.join(f'  <url>\n    <loc>{SITE}{p}</loc>\n    <lastmod>2026-10-09</lastmod>\n    <priority>{q}</priority>\n  </url>' for p, q in urls)
    open('sitemap.xml', 'w').write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n')


def write(path, html):
    d = (BASE + path).strip('/')
    if d:
        os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html') if d else 'index.html', 'w').write(html)


write('/', home())
for i, w in enumerate(WORKS):
    write(f'/projektit/{w["slug"]}/', case(i, w))
write('/tietosuoja/', privacy())
write('/tyot/', worklist())
if not BASE:
    open('404.html', 'w').write(notfound())
    sitemap()
    # Old addresses land on the matching part of the one-page site
    for p, to, t in [('/hinnat/', '/#kysymykset', 'Hinnat'), ('/prosessi/', '/#kysymykset', 'Prosessi'), ('/minusta/', '/#yhteys', 'Minusta')]:
        redirect(p, to, t)
    # The preview now lives at the real addresses
    redirect('/esikatselu/nonstop/', '/', 'Ville Saarela')
    redirect('/esikatselu/nonstop/tietosuoja/', '/tietosuoja/', 'Tietosuoja')
    for w in WORKS:
        redirect(f'/esikatselu/nonstop/projektit/{w["slug"]}/', f'/projektit/{w["slug"]}/', w['name'])
print('ok', BASE or '/', len(WORKS), 'cases')
