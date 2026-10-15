// Puts the page links back after pages have been rebuilt: Framer stores a page link by the page's id,
// so a link to a page that was removed and made again is left empty. Targets come from the layer name or the linked text.
import { connect } from 'framer-api'
import fs from 'fs'
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
const SITE = JSON.parse(fs.readFileSync(new URL('site-data.json', import.meta.url), 'utf8'))
const R = { home: { fi: '/', en: '/en' }, works: { fi: '/tyot', en: '/en/work' }, privacy: { fi: '/tietosuoja', en: '/en/privacy' }, terms: { fi: '/ehdot', en: '/en/terms' } }
const proj = (l, s) => (l === 'fi' ? '/projektit/' : '/en/projects/') + s
function counterpart(path) {
  if (path === '/404') return '/en'
  for (const k in R) { if (R[k].fi === path) return R[k].en; if (R[k].en === path) return R[k].fi }
  let m
  if ((m = path.match(/^\/projektit\/(.+)$/))) return proj('en', m[1])
  if ((m = path.match(/^\/en\/projects\/(.+)$/))) return proj('fi', m[1])
  return '/'
}
const ONLY = process.argv[2]
try {
  const pages = await f.getNodesWithType('WebPageNode')
  let total = 0
  for (const page of pages) {
    if (ONLY && page.path !== ONLY) continue
    const L = page.path.startsWith('/en') ? 'en' : 'fi'
    const other = counterpart(page.path)
    const names = {}
    for (const w of SITE[L].works) names[w.name] = proj(L, w.slug)
    const TEXT = L === 'fi'
      ? { 'Katso työt': R.works.fi, 'Työt': R.works.fi, 'Tietosuoja': R.privacy.fi, 'Sopimusehdot': R.terms.fi, 'In English': other, 'Viimeisimmät työt': R.works.fi, 'English home page': '/en', 'Etusivulle': '/' }
      : { 'See the work': R.works.en, 'Work': R.works.en, 'Privacy': R.privacy.en, 'Terms': R.terms.en, 'Suomeksi': other, 'Latest work': R.works.en }
    const desk = (await f.getChildren(page.id)).find(b => b.name === 'Desktop')
    if (!desk) continue
    let n = 0
    const textOf = async id => { for (const c of await f.getChildren(id)) { if (typeof c.getText === 'function' && c.inlineTextStyle !== undefined) return c.getText(); } return null }
    const walk = async id => {
      for (const c of await f.getChildren(id)) {
        let want = null
        if (c.name === 'Logo') want = R.home[L]
        else if (c.name === 'Kieli') want = other
        else if (names[c.name] && !(c.inlineTextStyle !== undefined)) want = names[c.name]
        else if (c.name === 'Linkki' || c.name === 'Nappi' || c.name === 'Työt' || c.name === 'Work') { const s = await textOf(c.id); if (s && TEXT[s]) want = TEXT[s] }
        if (want && c.link !== want && !(c.link || '').match(/^(mailto|tel|http|data)/)) { await f.setAttributes(c.id, { link: want, linkOpenInNewTab: false }); n++ }
        await walk(c.id)
      }
    }
    await walk(desk.id)
    total += n
    console.log(page.path, n)
  }
  console.log('relinked', total)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
