# Kivelä Rinne – lähteet ja oikeudet

Kivelä Rinne Oy on **kuvitteellinen yritys**, ja tämä sivusto on Ville Saarelan konseptityö (lokakuu 2026).
Yrityksen nimi, henkilöt (Noora Kivelä, Tuomas Rinne, Eero Laine), valmistajat (Lummevalo Oy, Puusepäntehdas
Okerkoski Oy, Vesijärven Vaneri Oy), tuotteet (Vako, Nuppi, Orsi, Kolo, Pökkö, Tikas, Lepo, Sarana), hinnat,
myyntimäärät, uutiset ja muut työt ovat keksittyjä. Nimet tarkistettiin verkkohaulla 5.10.2026: samannimistä
muotoilijaa tai puuseppää ei löytynyt Lahdesta, eikä valmistajien nimillä löytynyt yrityksiä.

## Turvalliset keksityt tiedot

- Y-tunnus 2880035-3: tunnuksen tarkistusmerkki ei kelpaa, joten tunnusta ei voi koskaan myöntää.
  Verkkolaskuosoite 003728800353 on johdettu siitä.
- Puhelinnumerot 048 573 2240 ja 048 573 2251: Traficomin numeroreservin etuliite 048. Näytetään vain tekstinä.
- Sähköpostit `*@kivela-rinne.example` (RFC 2606 -varattu verkkotunnus).
- Osoite Liimakatu 4 C, 15140 Lahti: Liimakatua ei ole Lahdessa eikä muualla Suomessa (OpenStreetMap Nominatim,
  haku 5.10.2026 tuloksella []). Postinumero 15140 on todellinen.
- Ei JSON-LD-merkintöjä, ei karttaa, ei asiakaslogoja, palkintoja, lehdistöä tai suosituksia.
- Standardien nimet (EN 12520, EN 1022, EN 60598) ovat todellisia standardeja; kuvitteellisia tuotteita ei ole testattu.

## Tuotekuvat (3D-renderöinnit)

Tuotekuvat ovat Blender 4.2:lla (Cycles) renderöityjä 3D-mallinnuksia, jotka tehtiin Studio Hiilo -konseptia varten
(Ville Saarela, 2026) ja käytetään tässä uudelleen. Studiokuvien tausta on tasattu sivun väriin (#e6e5de) Pythonilla
(NumPy, OpenCV); varjot on säilytetty. Etusivun kuvassa ripustusvaijereita on jatkettu kuvan yläreunaan.

| Tiedosto | Sisältö |
|---|---|
| `img/vako-hero-*` | Vako-riippuvalaisin, etusivun versio |
| `img/vako-*`, `img/vako-kaytossa-*`, `img/vako-detalji-*` | Vako: studiokuva, ruokapöydän yllä, pääty |
| `img/pokko-*`, `img/pokko-kaytossa-*`, `img/pokko-detalji-*` | Pökkö: studiokuva, sivupöytänä, istuin |
| `img/nuppi-*`, `img/orsi-*`, `img/kolo-*` | Nuppi, Orsi ja Kolo studiokuvina |

Renderöinneissä käytetyt Poly Havenin CC0-aineistot: Oak Veneer 01 (Jenelle van Heerden), Plastered Wall
(Amal Kumar) ja Brown Photostudio 02 -HDRI (Sergej Majboroda), https://polyhaven.com, CC0 1.0.

## Valokuvat (Unsplash-lisenssi)

Kaikki valokuvat on ladattu Unsplashista 5.10.2026 ja julkaistu Unsplash Licensellä (https://unsplash.com/license):
maksuton käyttö myös kaupallisesti, mainintaa ei vaadita, mutta tekijät mainitaan kuvateksteissä ja Tietosuoja-sivulla.
Unsplash+-kuvia ei ole käytetty. Kuvat on rajattu ja sävytetty samalla PIL-säädöllä (lämpimämpi valkotasapaino,
kylläisyys −14 %, kontrasti −6 %, mustat nostettu). Kuvissa ei ole tunnistettavia kasvoja eikä luettavia tuotemerkkejä.

| Tiedosto | Alkuperäinen otsikko | Tekijä | Lähde | Sivulla |
|---|---|---|---|---|
| `img/viilut-*` | a stack of wooden boards stacked on top of each other | Tim Meyer | https://unsplash.com/photos/NDQIHPA9Iv0 | Etusivu, Vako |
| `img/kaari-*` | Close-up of faint pencil marks on light wood | Shawn Rain | https://unsplash.com/photos/Zr95x-c3Jg0 | Vako |
| `img/sorvi-*` | A craftsman is shaping wood on a lathe | Maxim Tolchinskiy | https://unsplash.com/photos/Oz5hzB-d7G0 | Studio |
| `img/mitta-*` | person measuring brown board | Olga Kononenko | https://unsplash.com/photos/izDJWgQZonY | Studio |
| `img/vaneri-*` | a stack of wooden boards stacked on top of each other | LUCIA LU | https://unsplash.com/photos/F6cL5B7Gnz8 | Studio |
| `img/levy-*` | person holding white printer paper | Joshua Williams | https://unsplash.com/photos/chEduGv51sM | Studio |
| `img/sabluunat-*` | Laser-cut wooden pieces on a cardboard surface | Josh Davies | https://unsplash.com/photos/ZgmkmQp62P0 | Valmistajille |
| `img/tehdas-*` | Stacks of wooden beams and plywood sheets in a large industrial workshop | PJ Wallace | https://unsplash.com/photos/cAchziokMkk | Valmistajille |
| `img/koivu-*` | brown wooden blocks on white table | Marissa Daeger | https://unsplash.com/photos/iW9iaL-gjX8 | Orsi |
| `img/lauta-*` | a pile of wood sitting next to each other | Patrick Robert Doyle | https://unsplash.com/photos/yVRn-d6JGzo | Pökkö |
| `img/hionta-*` | a close up of a person working on a machine | Elliott Ledain | https://unsplash.com/photos/OufMPGe5ZQc | Nuppi |

## Piirrokset ja logo

- Etusivun huone (SVG) on piirretty käsin Studio Hiilo -konseptia varten ja värit on päivitetty. Idea, jossa huoneen
  esineet toimivat valikkona, on lainattu Jasper Morrisonin sivustolta (jaspermorrison.com); piirros ja koodi ovat omia.
- Prototyyppipiirrokset (Vako ja Pökkö) on piirretty SVG:nä tätä sivustoa varten.
- Logo on piirretty Schibsted Grotesk -kirjaimen ääriviivoista (OFL); R-kirjaimen jalka on piirretty uudelleen.
- `og.jpg` (1200 × 630) on tehty sivuston omista kuvista.

## Kirjasimet

- Schibsted Grotesk, © 2023 The Schibsted-Grotesk Project Authors, SIL Open Font License 1.1.
- Spline Sans Mono, © 2022 The Spline Sans Mono Project Authors, SIL Open Font License 1.1.
- Latin-osajoukot (woff2) Google Fontsista, itse isännöity kansiossa `fonts/`, lisenssi `fonts/OFL.txt`.

## Koodi

HTML, CSS ja JavaScript on kirjoitettu tätä sivustoa varten. Ulkoisia kirjastoja tai pyyntöjä muihin palveluihin ei ole.
Sivusto ei aseta evästeitä. Lomake tarkistaa kentät mutta ei lähetä mitään.
