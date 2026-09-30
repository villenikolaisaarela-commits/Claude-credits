# Ville Saarela — portfolio

Minimalistinen portfolio- ja yrityssivu (musta & valkoinen, Geist-fontti) sekä neljä konseptiprojektia.
Pelkkää HTML:ää, CSS:ää ja vähän JavaScriptiä — ei asennuksia, ei build-vaihetta.

```
index.html                  Etusivu
projektit/<nimi>/           Projektien esittelysivut (case study)
demot/<nimi>/               Konseptisivustot, joihin esittelyt linkittävät
assets/css/site.css         Portfolion tyylit
assets/js/site.js           Pienet animaatiot + kellonaika
assets/img/                 Kuvat
```

## Julkaisu verkkoon (ilmainen)

**Nopein tapa — Netlify Drop:**
1. Lataa tämä kansio koneellesi (GitHubissa: *Code → Download ZIP*, pura se).
2. Mene osoitteeseen <https://app.netlify.com/drop> ja vedä kansio sivulle.
3. Saat heti toimivan osoitteen. Oman domainin voi liittää Netlifyn asetuksista.

**Automaattinen päivitys GitHubista — Cloudflare Pages tai Netlify:**
1. Luo tili ja valitse *Import from GitHub* / *Connect to Git*.
2. Valitse tämä repositorio ja haara.
3. Build command: *tyhjä*. Output directory: `/` (juurikansio).
4. Jokainen GitHubiin pushattu muutos päivittyy sivuille automaattisesti.

Tarkista palvelun ehdoista, että ilmaistasoa saa käyttää yrityssivuun (esim. Vercelin ilmainen taso on vain ei-kaupalliseen käyttöön).

## Julkaisu GitHub Pagesilla (ilmainen, suoraan GitHubista)

1. Repositorion pitää olla julkinen (ilmaisella tilillä): *Settings → General → Danger Zone → Change visibility → Public*.
2. *Settings → Pages → Build and deployment → Source: Deploy from a branch*, haara **main**, kansio **/ (root)** → *Save*.
3. Parin minuutin päästä sivu on osoitteessa `https://villenikolaisaarela-commits.github.io/Claude-credits/`.
4. Jokainen `main`-haaraan pushattu muutos päivittyy sivulle automaattisesti.

`_config.yml` estää `video/`- ja `some/`-kansioiden julkaisun.

**Oma domain (villesaarela.com):** poista domain ensin Netlifystä. Lisää sitten domainin DNS-asetuksiin A-tietueet `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` ja CNAME-tietue `www` → `villenikolaisaarela-commits.github.io`. Kirjoita lopuksi *Settings → Pages → Custom domain* -kenttään `villesaarela.com` ja valitse *Enforce HTTPS*.

## Oma kuva

Info-osion kuva on `assets/img/ville.jpg` (pystykuva 4:5). Vaihda kuva korvaamalla tiedosto samannimisellä.

## Muokkaaminen

Tekstit ovat suoraan HTML-tiedostoissa. Helpoin tapa: pyydä Claudea tekemään muutos, esim. *"Vaihda etusivun otsikko"* tai *"Lisää uusi projekti"*.

Kun saat ensimmäisen oikean asiakastyön, lisää se etusivun *Valitut työt* -listaan ja päivitä konseptitöistä kertova teksti.

## Kuvat ja lisenssit

Konseptisivustojen kuvat ovat CC0- tai public domain -kuvia Openversestä. Tekijät ja lähteet on listattu kunkin demon `CREDITS.md`-tiedostossa.
Kaikki konseptiprojektit ovat kuvitteellisia yrityksiä, ja ne on merkitty sivuilla konsepteiksi.
