# Kuvalähteet — Studio Hämärä (konseptiprojekti)

Studio Hämärä on kuvitteellinen yritys. Sivuston kaikki kuvat ovat vapaasti käytettäviä
**CC0 1.0 (Public Domain Dedication)** -lisensoituja kuvia, jotka on haettu
[Openverse](https://openverse.org/)-rajapinnan kautta (`license=cc0,pdm`). Kuvat eivät ole
kuvitteellisen valokuvaaja Nooran ottamia, vaan ne edustavat konseptissa studion tyyliä.

Kaikkiin kuviin on tehty sama hienovarainen värikäsittely (lievä desaturointi, pehmeä
S-käyrä, nostetut mustat ja lämmin sävytys), ja ne on rajattu/pienennetty verkkokäyttöön
(pisin sivu enintään 1800 px, galleriapienoiskuvat 640 px).

| Tiedosto | Alkuperäinen nimi | Tekijä | Lisenssi | Lähde |
| --- | --- | --- | --- | --- |
| `img/hero-1800.jpg`, `img/hero-1200.jpg` | Mystery Woman (Unsplash) | Zach Guinta | CC0 1.0 | [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=62211961) |
| `img/noora.jpg` | Dark Room | Wes Powers | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/dark-room-O5D9FQWVC5) |
| `img/tyot/katse.jpg`, `img/tyot/katse-640.jpg` | Monochrome Girl | Alexander Krivitskiy | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/monochrome-girl-OCLC7O8PGF) |
| `img/tyot/vanha-keittio.jpg`, `img/tyot/vanha-keittio-640.jpg` | Kitchen Sink | Jim DiGritz | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/kitchen-sink-VO57T4JVJU) |
| `img/tyot/lehtikulho.jpg`, `img/tyot/lehtikulho-640.jpg` | Conical shaped tea bowl; dark | tuntematon (rawpixel.com) | CC0 1.0 | [rawpixel](https://www.rawpixel.com/image/7471013/photo-image-leaf-dark-design) |
| `img/tyot/tulppaanit.jpg`, `img/tyot/tulppaanit-640.jpg` | Flower Stilllife | The World is a Stage | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/flower-stilllife-ZBVSPA9XEK) |
| `img/tyot/ruokasali.jpg`, `img/tyot/ruokasali-1200.jpg`, `img/tyot/ruokasali-640.jpg` | Warm light in the dining room (Unsplash) | eberhard grossgasteiger | CC0 1.0 | [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=62340783) |
| `img/tyot/lukunurkka.jpg`, `img/tyot/lukunurkka-640.jpg` | Vintage Chair | EVG Photos | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/vintage-chair-SHE40GOPPL) |
| `img/tyot/askel.jpg`, `img/tyot/askel-640.jpg` | Leather Shoes | Pawel Kadysz | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/leather-shoes-M5V6ZF6HRN) |
| `img/tyot/profiili.jpg`, `img/tyot/profiili-640.jpg` | People Man | Vinicius Amano | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/people-man-KH3BU47M71) |
| `img/tyot/ranunkeli.jpg`, `img/tyot/ranunkeli-640.jpg` | Isolated Flower | Travel Photographer | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/isolated-flower-XALQK3MLVO) |
| `img/tyot/salekaihdin.jpg`, `img/tyot/salekaihdin-640.jpg` | People Woman | Daniel Monteiro | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/people-woman-D5GGV9DTCS) |
| `img/tyot/kesakeittio.jpg`, `img/tyot/kesakeittio-640.jpg` | Window green frame dark interior | tuntematon (rawpixel.com) | CC0 1.0 | [rawpixel](https://www.rawpixel.com/image/3288728/free-photo-image-banister-bowl-cc0) |
| `img/tyot/lierihattu.jpg`, `img/tyot/lierihattu-640.jpg` | Blackandwhite Monochrome | Luke Braswell | CC0 1.0 | [StockSnap](https://stocksnap.io/photo/blackandwhite-monochrome-XZI69BCJTX) |

Lisenssi: <https://creativecommons.org/publicdomain/zero/1.0/>

## Fontit

- [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) — SIL Open Font License 1.1
- [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) — SIL Open Font License 1.1

Fonttitiedostot (latin-osajoukko, woff2) on ladattu Google Fontsista ja tarjoillaan paikallisesti kansiosta `fonts/`.
Lisenssiteksti ja tekijänoikeusmerkinnät: `fonts/OFL.txt`.

## Koodi

Sivusto ei käytä ulkoisia kirjastoja. Pehmeä vieritys, masonry-asettelu, suodatus, kuvankatselu ja
päivän hämärän laskenta (auringonlasku ja siviilihämärän loppu Helsingissä, "Almanac for Computers"
-algoritmi) on kirjoitettu itse tiedostoon `script.js`. Sivu ei tee ajon aikana ulkoisia pyyntöjä.
