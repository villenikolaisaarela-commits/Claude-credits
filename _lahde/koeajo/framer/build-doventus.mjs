// Doventus: front page draft built straight into the Framer project (koeajo).
// Re-runnable: removes the frames and styles it made earlier (names start with "DV ") and builds again.
import { open } from './fx.mjs'

const C = { paper: '#FFFFFF', rappaus: '#F1F2F0', ink: '#1D2327', muted: '#566067', tiili: '#8C3B26', line: '#D7DBDC' }
const IMG = 'https://www.doventus.fi/assets/images/'
const FORM_ID = 'k9GsOvRcj', DESKTOP_ID = 'WQLkyLRf1'

const f = await open()
const log = (...a) => console.log(...a)
try {
  // ---- clean up an earlier run ----
  const desk = await f.getNode(DESKTOP_ID)
  const form = await f.getNode(FORM_ID)
  if (form) await f.setParent(FORM_ID, DESKTOP_ID)
  for (const c of await f.getChildren(DESKTOP_ID)) if ((c.name || '').startsWith('DV ')) await f.removeNode(c.id)
  for (const s of await f.getTextStyles()) if (s.name.startsWith('DV ')) await s.remove()

  // ---- type ----
  const font = async w => f.getFont('Albert Sans', { weight: w })
  const [f400, f500, f600] = [await font(400), await font(500), await font(600)]
  const style = (name, tag, fnt, size, lh, ls, color, bp, extra = {}) => f.createTextStyle({
    name: 'DV ' + name, tag, font: fnt, fontSize: size, lineHeight: lh, letterSpacing: ls, color, minWidth: 1200,
    breakpoints: bp.map(([minWidth, fontSize]) => ({ minWidth, fontSize })), ...extra })
  const S = {
    h1: await style('H1', 'h1', f500, '64px', '1.04em', '-0.025em', C.ink, [[810, '52px'], [0, '38px']], { balance: true }),
    h2: await style('H2', 'h2', f500, '40px', '1.1em', '-0.02em', C.ink, [[810, '34px'], [0, '28px']], { balance: true }),
    h3: await style('H3', 'h3', f600, '22px', '1.25em', '-0.01em', C.ink, [[810, '21px'], [0, '20px']]),
    lead: await style('Lead', 'p', f400, '21px', '1.5em', '0em', C.muted, [[810, '19px'], [0, '18px']]),
    body: await style('Body', 'p', f400, '17px', '1.55em', '0em', C.muted, [[810, '17px'], [0, '16px']]),
    ink: await style('Body ink', 'p', f400, '17px', '1.55em', '0em', C.ink, [[810, '17px'], [0, '16px']]),
    small: await style('Small', 'p', f400, '14px', '1.5em', '0em', C.muted, [[810, '14px'], [0, '14px']]),
    logo: await style('Logo', 'p', f600, '22px', '1.2em', '-0.01em', C.ink, [[810, '22px'], [0, '20px']]),
    nav: await style('Nav', 'p', f500, '16px', '1.3em', '0em', C.ink, [[810, '16px'], [0, '15px']]),
    btn: await style('Button', 'p', f600, '16px', '1.2em', '0em', '#FFFFFF', [[810, '16px'], [0, '16px']]),
    link: await style('Link', 'p', f600, '16px', '1.4em', '0em', C.tiili, [[810, '16px'], [0, '16px']], { decoration: 'underline' }),
  }

  // ---- helpers ----
  const frame = (parent, a = {}) => f.createFrameNode({
    position: 'relative', width: '100%', height: 'fit-content', layout: 'stack', stackDirection: 'vertical',
    stackAlignment: 'start', stackDistribution: 'start', gap: '0px', backgroundColor: null, ...a }, parent)
  const text = async (parent, str, st, a = {}) => {
    // the style has to be set after the text, or the text is dropped
    const n = await f.createTextNode({ position: 'relative', width: '100%', height: 'fit-content', ...a }, parent)
    await n.setText(str); await f.setAttributes(n.id, { inlineTextStyle: st }); return n
  }
  const section = async (name, bg, pad = '96px 24px 96px 24px') => {
    const outer = await frame(DESKTOP_ID, { name: 'DV ' + name, backgroundColor: bg, padding: pad, stackAlignment: 'center' })
    const inner = await frame(outer.id, { name: name + ' sisältö', maxWidth: '1120px' })
    return inner
  }
  const upload = async (file, alt) => f.uploadImage({ image: IMG + encodeURI(file), name: file.split('/').pop(), altText: alt })
  const image = async (parent, asset, ratio, a = {}) => frame(parent, { name: 'Kuva', backgroundImage: asset, aspectRatio: ratio, height: null, borderRadius: '2px', ...a })

  // ---- page frame ----
  await f.setAttributes(DESKTOP_ID, { layout: 'stack', stackDirection: 'vertical', stackAlignment: 'center', gap: '0px', padding: '0px', height: 'fit-content', backgroundColor: C.paper })

  const img = {
    hero: await upload('karuselli/arkkitehtisuunnittelu-doventus-kivitalo.jpg', 'Valkoisia kivitaloja ja istutuksia kesällä'),
    tiili: await upload('karuselli/korjausrakentaminen-doventus-tiilijulkisivu.jpg', 'Punatiilinen kerrostalo ja nurmipiha'),
    okt: await upload('karuselli/omakotitalo-doventus-yksilöllinen.jpg', 'Valkoinen moderni pientalo rinteessä'),
  }
  log('images ok')

  // ---- header ----
  {
    const outer = await frame(DESKTOP_ID, { name: 'DV Ylätunniste', padding: '22px 24px 22px 24px', stackAlignment: 'center', backgroundColor: C.paper })
    const row = await frame(outer.id, { name: 'Rivi', maxWidth: '1120px', stackDirection: 'horizontal', stackDistribution: 'space-between', stackAlignment: 'center', gap: '16px' })
    await text(row.id, 'Doventus', S.logo, { width: 'fit-content', link: '/' })
    const r = await frame(row.id, { name: 'Yhteys', width: 'fit-content', stackDirection: 'horizontal', stackAlignment: 'center', gap: '24px' })
    await text(r.id, '09 348 9211', S.nav, { width: 'fit-content', link: 'tel:+35893489211' })
  }

  // ---- hero ----
  {
    const s = await section('Alku', C.paper, '56px 24px 32px 24px')
    await f.setAttributes(s.id, { gap: '28px' })
    await text(s.id, 'Arkkitehdit ja rakennesuunnittelijat samassa toimistossa Espoossa.', S.h1, { maxWidth: '920px' })
    await text(s.id, 'Suunnittelemme, johdamme ja valvomme uudis- ja korjausrakentamisen hankkeet alusta loppuun. Vuodesta 2003 lähes 1 500 hanketta yksityisille, taloyhtiöille ja yrityksille.', S.lead, { maxWidth: '680px' })
    const row = await frame(s.id, { name: 'Toiminnot', width: 'fit-content', stackDirection: 'horizontal', stackAlignment: 'center', gap: '28px', stackWrapEnabled: true })
    const b = await frame(row.id, { name: 'Painike', width: 'fit-content', padding: '16px 24px 16px 24px', backgroundColor: C.tiili, borderRadius: '4px', link: 'mailto:etunimi.sukunimi@doventus.fi' })
    await text(b.id, 'Kerro hankkeestasi', S.btn, { width: 'fit-content' })
    await text(row.id, 'Soita 09 348 9211', S.link, { width: 'fit-content', link: 'tel:+35893489211' })
    await image(s.id, img.hero, 1920 / 1100, { name: 'Pääkuva' })
  }

  // ---- two doors ----
  {
    const s = await section('Kaksi polkua', C.paper, '64px 24px 96px 24px')
    await f.setAttributes(s.id, { gap: '36px' })
    await text(s.id, 'Mistä hankkeesta on kyse?', S.h2)
    const grid = await frame(s.id, { name: 'Polut', layout: 'grid', gridColumnCount: 'auto-fill', gridColumnWidthType: 'minmax', gridColumnMinWidth: 440, gridRowHeightType: 'auto', gap: '48px 32px' })
    const door = async (asset, title, body, who, tel, telh) => {
      const c = await frame(grid.id, { name: title, gap: '14px' })
      await image(c.id, asset, 1920 / 1100)
      await text(c.id, title, S.h3, { })
      await text(c.id, body, S.body)
      await text(c.id, who, S.ink)
      await text(c.id, 'Soita ' + telh, S.link, { width: 'fit-content', link: 'tel:' + tel })
    }
    await door(img.tiili, 'Taloyhtiön korjaushanke', 'Putki-, katto-, julkisivu- ja piharemontit. Suunnittelemme korjauksen, johdamme hankkeen suunnittelun ohjauksesta takuutarkastukseen ja valvomme, että urakka tehdään suunnitelmien mukaan.', 'Jari Leppänen, tekninen johtaja', '+358408269784', '040 826 9784')
    await door(img.okt, 'Oma talo arkkitehdilta', 'Olemme suunnitelleet lähes 200 yksilöllistä pientaloa ja vapaa-ajanasuntoa. Arkkitehti ja rakennesuunnittelija työskentelevät samassa toimistossa, joten suunnitelmat sopivat yhteen jo ennen työmaata.', 'Tero Seppänen, arkkitehti SAFA', '+358408269820', '040 826 9820')
  }

  // ---- services ----
  {
    const s = await section('Palvelut', C.rappaus)
    await f.setAttributes(s.id, { gap: '40px' })
    await text(s.id, 'Suunnittelu ja projektinjohto saman katon alta.', S.h2, { maxWidth: '760px' })
    const grid = await frame(s.id, { name: 'Palvelulista', layout: 'grid', gridColumnCount: 'auto-fill', gridColumnWidthType: 'minmax', gridColumnMinWidth: 300, gridRowHeightType: 'auto', gap: '36px 32px' })
    const items = [
      ['Arkkitehtisuunnittelu', 'Uudis- ja korjausrakentamiseen, omakotitaloista vaativiin korjauskohteisiin.'],
      ['Pääsuunnittelu', 'Pääsuunnittelija johtaa ja sovittaa yhteen koko suunnitteluryhmän työn.'],
      ['Rakennesuunnittelu', 'Huolellinen rakennesuunnittelu antaa rakennukselle hyvät tekniset lähtökohdat.'],
      ['Kokonaissuunnittelu', 'Arkkitehti-, rakenne-, sisustus- ja pihasuunnittelu samasta toimistosta.'],
      ['Rakennuttaminen', 'Vastaamme hankkeesta suunnittelun ohjauksesta takuutarkastukseen.'],
      ['Valvonta', 'Valvomme, että urakka toteutuu laadukkaasti ja suunnitelmien mukaisesti.'],
    ]
    for (const [h, d] of items) {
      const c = await frame(grid.id, { name: h, gap: '8px', padding: '20px 0px 0px 0px', border: { width: '1px 0px 0px 0px', color: C.line, style: 'solid' } })
      await text(c.id, h, S.h3)
      await text(c.id, d, S.body)
    }
    await text(s.id, 'AAA-luottoluokka vuodesta 2007. Kuulumme Luotettava Kumppani -rekisteriin.', S.small)
  }

  // ---- references (the CMS list goes here) ----
  {
    const s = await section('Referenssit', C.paper)
    await f.setAttributes(s.id, { gap: '24px' })
    await text(s.id, 'Referenssejä', S.h2)
    await text(s.id, 'Lähes 1 500 asiakashanketta vuosina 2003–2025. Muutama esimerkki uudis- ja korjausrakentamisesta.', S.lead, { maxWidth: '680px' })
  }

  // ---- contact ----
  {
    const s = await section('Yhteys', C.rappaus)
    const row = await frame(s.id, { name: 'Kaksi saraketta', layout: 'grid', gridColumnCount: 'auto-fill', gridColumnWidthType: 'minmax', gridColumnMinWidth: 440, gridRowHeightType: 'auto', gap: '48px 64px' })
    const l = await frame(row.id, { name: 'Teksti', gap: '18px' })
    await text(l.id, 'Kerro hankkeestasi.', S.h2)
    await text(l.id, 'Keskustelemme mielellämme tarkemmin hankkeestasi. Tavoitat meidät puhelimitse, sähköpostitse tai tällä lomakkeella.', S.body)
    await text(l.id, 'Tero Seppänen, arkkitehti SAFA, toimitusjohtaja\nUudisrakentaminen ja arkkitehtisuunnittelu, 040 826 9820', S.ink)
    await text(l.id, 'Jari Leppänen, RI amk, tekninen johtaja\nKorjausrakentaminen ja rakennesuunnittelu, 040 826 9784', S.ink)
    await text(l.id, 'Toimisto 09 348 9211\nKutojantie 7, 02630 Espoo', S.ink)
    const r = await frame(row.id, { name: 'Lomake', gap: '0px' })
    if (form) {
      await f.setParent(FORM_ID, r.id)
      await f.setAttributes(FORM_ID, { position: 'relative', top: null, left: null, width: '100%' })
      const labels = { Name: 'Nimi', Email: 'Sähköposti', Location: 'Hankkeen paikkakunta' }
      for (const t of await f.getNodesWithType('TextNode')) {
        const v = await t.getText()
        if (labels[v]) { await t.setText(labels[v]); await f.setAttributes(t.id, { inlineTextStyle: S.nav }) }
      }
    }
  }

  // ---- footer ----
  {
    const s = await section('Alatunniste', C.ink, '40px 24px 40px 24px')
    await f.setAttributes(s.id, { gap: '8px' })
    const w = await f.createTextStyle({ name: 'DV Footer', tag: 'p', font: f400, fontSize: '14px', lineHeight: '1.5em', letterSpacing: '0em', color: '#C9CFD2', minWidth: 1200, breakpoints: [{ minWidth: 810, fontSize: '14px' }, { minWidth: 0, fontSize: '14px' }] })
    await text(s.id, 'Doventus Oy, Kutojantie 7, 02630 Espoo, 09 348 9211', w)
    await text(s.id, 'Luonnos: Studio Luoto. Tämä on koeajon esimerkkisivu, ei Doventuksen virallinen sivusto. Tekstit ja kuvat ovat doventus.fi-sivustolta.', w)
  }

  // the form came last in the tree before; keep the footer at the very end
  log('built')
} catch (e) {
  console.log('ERR', e && e.message, e && e.stack && e.stack.split('\n').slice(0, 3).join(' | '))
} finally { await f.disconnect() }
