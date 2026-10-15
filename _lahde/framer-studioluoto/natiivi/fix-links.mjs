// Patch in place: put the links back on the front page (text links and links to the page's own sections)
import { connect } from 'framer-api'
import fs from 'fs'
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
const PATH = process.argv[2] || '/'
const MAIL = 'ville@studioluoto.com', TEL = '+358451035362'
try {
  const pages = await f.getNodesWithType('WebPageNode')
  const page = pages.find(p => p.path === PATH)
  const desk = (await f.getChildren(page.id)).find(b => b.name === 'Desktop')
  const top = await f.getChildren(desk.id)
  const sec = name => top.find(c => c.name === name)
  const to = name => `data:framer/page-link,${page.id}?element=${sec(name).id}`
  const FRAMES = { 'Palvelu': to('Palvelu'), 'Näin se toimii': to('Prosessi'), 'Hinnat': to('Hinnat'), 'Kysymykset': to('Kysymykset'), 'Pyydä demo': to('Yhteys') }
  const TEXTS = {
    'Katso työt': '/tyot', 'Pyydä demo, niin näet sen omilla sivuillasi →': to('Yhteys'), 'Sopimusehdot': '/ehdot', [MAIL]: 'mailto:' + MAIL,
    'tai soita 045 103 5362': 'tel:' + TEL, '045 103 5362': 'tel:' + TEL, 'Palvelu': to('Palvelu'), 'Näin se toimii': to('Prosessi'), 'Hinnat': to('Hinnat'),
    'Työt': '/tyot', 'Kysymykset': to('Kysymykset'), 'Tietosuoja': '/tietosuoja', 'In English': '/en', 'Ylös ↑': to('Alku'),
  }
  let nf = 0, nt = 0
  const hdr = sec('Ylätunniste')
  const walk = async (id, inHeader, inFooter) => {
    for (const c of await f.getChildren(id)) {
      const isText = typeof c.getText === 'function' && !(await f.getChildren(c.id)).length && c.inlineTextStyle !== undefined
      if (isText) {
        const s = await c.getText()
        // nav words inside the header sit on frames; the same words as texts are linked only in the footer
        if (TEXTS[s] && !inHeader && (inFooter || !['Palvelu', 'Näin se toimii', 'Hinnat', 'Työt', 'Kysymykset'].includes(s))) { await f.setAttributes(c.id, { link: TEXTS[s], linkOpenInNewTab: TEXTS[s].startsWith("http") }); nt++ }
      } else {
        if (inHeader && FRAMES[c.name]) { await f.setAttributes(c.id, { link: FRAMES[c.name], linkOpenInNewTab: false }); nf++ }
        await walk(c.id, inHeader, inFooter)
      }
    }
  }
  for (const c of top) await walk(c.id, c.id === hdr.id, c.name === 'Alatunniste')
  console.log('frame links', nf, 'text links', nt)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
