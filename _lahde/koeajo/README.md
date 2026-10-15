# Studio Luoton asiakasprosessin koeajo

Tavoite: käydä koko asiakasprosessi läpi ennen ensimmäistä oikeaa asiakasta. Ville on testiasiakas, Doventus Oy on testiyritys. Demoa ei lähetetä Doventukselle.

## Tilanne

| Vaihe | Tila |
|---|---|
| 1. Yhteydenotto | Korjattu. Demonappi avaa lomakkeen, joka lähettää FormSubmitin kautta osoitteeseen ville@studioluoto.com. Aktivointisähköposti lähetetty; Ville klikkaa aktivointilinkin ja testaa puhelimella. |
| 2. Demo 48 h | Brief valmis (doventus-BRIEF.md). Etusivu tehdään molemmille asiakkaille: taloyhtiöt (korjaushankkeet) ja yksityiset pientalorakentajat. Rakennetaan Frameriin. |
| 3. Tarjous ja sopimus | Tarjouspohja ja tilausvahvistus puuttuvat. |
| 4. Laskutus | Ville ei ole alv-rekisterissä. Suositus: vapaaehtoinen rekisteröinti ennen ensimmäistä laskua. Laskutustyökalu valitsematta. |
| 5. Käyttöönotto | Tarkistuslista puuttuu (DNS, Google-yritysprofiili, Search Console, lomake, aineistot). |
| 6. Rakennus ja julkaisu | Framer, ilmainen taso. Projekti: https://framer.com/projects/Doventus-testi--ndTQAKfO89t6VmXojqHo-1NwBp |
| 7. Muutokset | Loki puuttuu. |
| 8. Kuukausikatsaus | Pohja puuttuu. |
| 9. Takuu | Tarjouspyyntöjen kirjaus puuttuu. |
| 10. Lopetus ja siirto | Siirtolauseke (Oy) lisäämättä ehtoihin. |

## Framer-yhteys

Framerille ei ole Claude-liitintä. Käytetään Framerin Server API:a (open beta, npm-paketti `framer-api`).

1. Ville luo API-avaimen: Framer-projekti, Site Settings, General, API key. Avain on sidottu tähän yhteen projektiin.
2. Ville lisää avaimen ympäristön asetuksiin (istunnon otsikkorivin ympäristövalikko, Edit) muuttujaksi `FRAMER_API_KEY`. Avainta ei liitetä keskusteluun.
3. Uusi istunto lukee avaimen. Yhteys:

```js
import { connect } from 'framer-api'
const framer = await connect('https://framer.com/projects/Doventus-testi--ndTQAKfO89t6VmXojqHo-1NwBp', process.env.FRAMER_API_KEY)
// ... CMS-kokoelmat, sivun solmut, lomake
const result = await framer.publish()
await framer.deploy(result.deployment.id)
await framer.disconnect()
```

Yhteys `wss://api.framer.com/channel/headless-plugin` on avoinna tästä ympäristöstä (tarkistettu).

## Sivuston lähteet

- Studio Luoto -sivusto: `_lahde/studioluoto/build.py` (+ `en.py`, `art.py`). Riippuvuudet `_lahde/ns/ns.py` ja `_lahde/ilme/newworks.py`.
- `python3 _lahde/studioluoto/build.py` tekee esikatselun, `LIVE=1` julkaistavan version repon juureen.
- Doventuksen kuvat ladataan uudelleen osoitteesta https://www.doventus.fi/assets/images/karuselli/ (ei tallenneta julkiseen repoon).
