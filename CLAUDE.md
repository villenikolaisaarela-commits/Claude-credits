# Ohjeet Claudelle

## "Ville Saarela -tyylillä"

Kun käyttäjä pyytää tekemään jotain "Ville Saarela -tyylillä" (tai "tee se Ville Saarela tyylillä", "minun tyylillä", "brändin mukaan"), käytä Ville Saarelan design systemiä:

- **Design system (lue ensin sen README):** https://claude.ai/artifact/BXQi1vE6bECy4jssA4cbky
  – lue Artifact-työkalulla (`action: "read"`, `path: "project/README.md"`), sitten tarvittaessa `project/tokens.json` ja komponenttien `README.md`:t.
- **Paikalliset tiedostot:** `brand/` (logot SVG/PNG, somekuvat, käyntikortti, sähköpostin allekirjoitus), `assets/fonts/` (Geist, Geist Mono), `assets/css/site.css` (sivuston tyylit, josta tokenit on otettu).

Tiivistelmä, jos artifaktia ei voi lukea:
- Mustavalkoinen: `ink #0a0a0a`, `paper #ffffff`, `muted #666666`, `quiet #888888` (vain 24 px+), `line #e6e6e6`, `panel #f5f5f5`, somen pohja `#ededeb`. Ei korostusväriä.
- Fontit: Geist (paino 500 otsikoissa, tiivis välistys −0,055 em isoissa otsikoissa), Geist Mono vain labeleihin ISOILLA KIRJAIMILLA.
- Väljä tyhjä tila, 12 sarakkeen ruudukko, terävät kulmat; painikkeet täysin pyöreäpäisiä; ei varjoja.
- Liike hidas ja pehmeä: `cubic-bezier(0.2, 0.7, 0.1, 1)`, rivit nousevat maskin takaa, kuvat avautuvat alhaalta ylös.
- Äänensävy: sinä-muoto asiakkaalle, minä-muoto itsestä, lyhyet lauseet, ei emojeita. Lupaus: "Verkkosivut, jotka tekevät töitä."
- Konseptityöt merkitään aina rehellisesti ("Konsepti").
