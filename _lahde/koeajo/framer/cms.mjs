import { open } from './fx.mjs'
const f = await open()
const IMG = 'https://www.doventus.fi/assets/images/'
try {
  const col = (await f.getCollections()).find(c => c.name === 'Kohteet')
  let fields = await col.getFields()
  const want = [{ type: 'string', name: 'Paikkakunta' }, { type: 'image', name: 'Kuva' }].filter(w => !fields.find(x => x.name === w.name))
  if (want.length) await col.addFields(want)
  fields = await col.getFields()
  const id = n => fields.find(x => x.name === n).id
  const old = await col.getItems(); if (old.length) await col.removeItems(old.map(i => i.id))
  const items = [
    ['vaativa-taydennysrakentaminen', 'Vaativa täydennysrakentamisen suunnittelukohde', '', 'Huolella korjatun historiallisen kohteen ja modernien luhtitalojen muodostama kokonaisuus.', 'arkkitehtisuunnittelu-doventus-taydennysrakentaminen.jpg', 'Vanha valkoinen meijerirakennus, savupiippu ja punainen rakennus'],
    ['lexus-kaivoksela', 'Lexus-automyymälän saneeraus', 'Vantaa, Kaivoksela', 'Automyymälän saneeraus Vantaan Kaivokselassa.', 'karuselli/perusparannus-doventus-liiketila.jpg', 'Automyymälän valoisa näyttelytila'],
    ['kivitalojen-kortteli', 'Kivitalojen kortteli', 'Espoo, Mankkaa', 'Kymmenen kytketyn pientalon ja yhden erillispientalon kokonaisuus.', null, null],
    ['merenrantakyla', 'Modernin merenrantakylän arkkitehtisuunnittelu', 'Pyhtää', '50 erillispientalon ja loma-asunnon kokonaisuus saaristokylän perinteitä kunnioittaen.', null, null],
  ]
  await col.addItems(items.map(([slug, t, p, d, img, alt]) => ({ slug, fieldData: {
    [id('Title')]: { type: 'string', value: t },
    [id('Content')]: { type: 'formattedText', value: `<p>${d}</p>` },
    [id('Paikkakunta')]: { type: 'string', value: p },
    ...(img ? { [id('Kuva')]: { type: 'image', value: IMG + encodeURI(img), alt } } : {}),
  } })))
  console.log('items', (await col.getItems()).length)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
