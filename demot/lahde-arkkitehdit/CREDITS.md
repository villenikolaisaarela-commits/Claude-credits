# Lähde Arkkitehdit – lähteet ja lisenssit

Lähde Arkkitehdit on **kuvitteellinen yritys**. Sivuston projektit, henkilöt, luvut ja tekstit on keksitty tätä konseptiprojektia varten. Kuvissa näkyvät rakennukset ja tilat eivät liity kuvitteelliseen toimistoon.

Suunnittelu ja toteutus: Ville Saarela.

## Valokuvat

Kaikki kuvat ovat CC0 1.0 -lisenssillä (public domain -luovutus). Ne on haettu [Openverse](https://openverse.org/)-rajapinnasta suodattimella `license=cc0,pdm`. Yhtenäisen ilmeen vuoksi kaikkia kuvia on käsitelty samalla tavalla: värikylläisyyttä on hillitty, kontrastia pehmennetty ja mustia tasoja nostettu hieman. Lisäksi kuvia on rajattu ja pienennetty (pisin sivu enintään 1800 px, JPEG-laatu 78).

| Tiedosto | Alkuperäinen nimi | Kuvaaja | Lisenssi | Lähde |
|---|---|---|---|---|
| `img/hero-talo-harmaa.jpg` | Snow on the turf roof (Unsplash) | Jonathan Andreo (canislupus) | CC0 1.0 | https://commons.wikimedia.org/w/index.php?curid=61907618 |
| `img/huvila-kallio.jpg` | Dramatic Sky | Alex Andrews | CC0 1.0 | https://stocksnap.io/photo/dramatic-sky-DYJIQYHO19 |
| `img/huvila-kallio-ikkuna.jpg` | Man relaxing near window (Unsplash) | Nil Castellví (nilcaste) | CC0 1.0 | https://commons.wikimedia.org/w/index.php?curid=62130969 |
| `img/huvila-kallio-julkisivu.jpg` | Blue Wooden Wall (Unsplash), rajattu 4:5 | Math (builtbymath) | CC0 1.0 | https://commons.wikimedia.org/w/index.php?curid=61720115 |
| `img/huvila-kallio-makuuhuone.jpg` | Foxfire Mountain House, Mount Tremper, United States (Unsplash) | Alex Robert (alexrobert) | CC0 1.0 | https://commons.wikimedia.org/w/index.php?curid=61908958 |
| `img/saunarakennus-lampi.jpg` | Water House | Sergei Gussev | CC0 1.0 | https://stocksnap.io/photo/water-house-XFFQLYGP4F |
| `img/koti-kruununhaka.jpg` | House Home | Joseph Albanese | CC0 1.0 | https://stocksnap.io/photo/house-home-W9NA327MNL |
| `img/talo-pihlaja.jpg` | House Roof. Taivaalta on retusoitu pois sähköjohto. | Oliur Rahman | CC0 1.0 | https://stocksnap.io/photo/house-roof-KJMQM11A8G |
| `img/asunto-eira.jpg` | Glassware on stairs (Unsplash) | Monica Silva (monicasilva) | CC0 1.0 | https://commons.wikimedia.org/w/index.php?curid=62119852 |
| `img/toimisto.jpg` | Curve in white marble stairs (Unsplash) | Daniel von Appen (daniel_von_appen) | CC0 1.0 | https://commons.wikimedia.org/w/index.php?curid=62339025 |
| `img/sumu-metsa.jpg` | Misty Forest (Openverse id deba3717-51f7-4c6f-9c89-579d77f69c2c) | Artem Kavalerov | CC0 1.0 | https://commons.wikimedia.org/w/index.php?curid=71443492 |

StockSnap-kuvat on ladattu Openverse-rajapinnan kuvavälityspalvelun kautta (960 px). Wikimedia Commonsin kuvat ovat Unsplashin CC0-aikakaudelta (ennen vuotta 2017) tuotuja kuvia. `sumu-metsa.jpg` on ladattu Openversen kuvavälityspalvelun kautta (1920 × 1280), pienennetty 1800 px:iin ja sävytetty muiden kuvien mukaiseksi.

Huvila Kallion asemapiirros ja materiaalipaletti ovat sivustoa varten piirrettyä SVG/CSS-grafiikkaa.

## Kirjasimet

Kirjasimet ovat sivuston omalla palvelimella kansiossa `fonts/`, joten kolmannen osapuolen pyyntöjä ei tehdä. Mukana on vain latinalainen merkistö. Lisenssiteksti: `fonts/OFL.txt`.

| Tiedosto | Kirjasin | Tekijä | Lisenssi |
|---|---|---|---|
| `fonts/instrument-serif-latin.woff2`, `fonts/instrument-serif-italic-latin.woff2` | Instrument Serif | Rodrigo Fuenzalida, Jordan Egstad (Instrument) | SIL Open Font License 1.1 |
| `fonts/hanken-grotesk-latin.woff2` | Hanken Grotesk (muuttuva, 300–500) | Alfredo Marco Pradil (Hanken Design Co.) | SIL Open Font License 1.1 |

Lähde: Google Fonts (https://fonts.google.com/specimen/Instrument+Serif, https://fonts.google.com/specimen/Hanken+Grotesk).

## Ohjelmakirjastot

| Tiedosto | Kirjasto | Tekijä | Lisenssi |
|---|---|---|---|
| `vendor/lenis.min.js` | Lenis 1.3.26 (pehmeä vieritys) | darkroom.engineering | MIT (`vendor/LICENSE-lenis.txt`) |

Lenis on ladattu npm-rekisteristä (`npm pack lenis@1`) ja tallennettu kansioon sellaisenaan; lähdekarttaviittaus on poistettu. Muu JavaScript (`script.js`) on kirjoitettu tätä sivustoa varten ilman kehyksiä.
