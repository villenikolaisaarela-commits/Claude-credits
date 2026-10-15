# Studio Luoto Framerissa (natiivit sivut)

Sivut on rakennettu Framerin omista tasoista, joten jokaista tekstiä voi muokata suoraan Framerissa.

- `build-home.mjs` rakensi suomenkielisen etusivun. Älä aja sitä enää: etusivua muokataan käsin.
- `build-site.mjs <sivu...>` rakentaa muut sivut (`all`, `en`, `works-fi`, `project-fi-kallistus`, `privacy-en`, `404` …). Ajo poistaa ja tekee sivun uudelleen, joten käsin tehdyt muutokset sillä sivulla häviävät.
- Uudelleenrakennuksen jälkeen aja `relink.mjs` (Framer tyhjentää linkit poistettuun sivuun), `anchors.mjs` (osioankkurit) ja julkaise.
- `fix-*.mjs` ovat pieniä kohdekorjauksia, jotka eivät rakenna mitään uudelleen.
- `push-comps.mjs` päivittää neljä koodikomponenttia (liukurivi, video, kysymykset, demonappi) tiedostosta `comps.mjs`.

Avain luetaan ympäristömuuttujasta `FRAMER_API_KEY`. Älä tallenna avainta repoon.
