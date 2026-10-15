// Patch in place: move each link from a text onto a frame around it, so the text keeps its own colour
import { connect } from 'framer-api'
import fs from 'fs'
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
const PATH = process.argv[2] || '/'
try {
  const page = (await f.getNodesWithType('WebPageNode')).find(p => p.path === PATH)
  const desk = (await f.getChildren(page.id)).find(b => b.name === 'Desktop')
  let n = 0
  const walk = async id => {
    const kids = await f.getChildren(id)
    for (const [i, c] of kids.entries()) {
      if (c.inlineTextStyle !== undefined && typeof c.getText === 'function' && c.link) {
        const fit = c.width === 'fit-content'
        const w = await f.createFrameNode({ name: 'Linkki', position: 'relative', width: fit ? 'fit-content' : (c.width || '100%'), height: 'fit-content', layout: 'stack', stackDirection: 'vertical', stackAlignment: 'start', gap: '0px', backgroundColor: null, ...(c.maxWidth ? { maxWidth: c.maxWidth } : {}) }, id)
        await f.setParent(w.id, id, i)
        await f.setAttributes(w.id, { link: c.link, linkOpenInNewTab: c.link.startsWith('http') })
        await f.setParent(c.id, w.id)
        await f.setAttributes(c.id, { link: null, width: fit ? 'fit-content' : '100%', maxWidth: null })
        n++
      } else await walk(c.id)
    }
  }
  await walk(desk.id)
  console.log('wrapped', n)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
