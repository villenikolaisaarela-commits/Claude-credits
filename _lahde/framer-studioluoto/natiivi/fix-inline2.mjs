// Patch in place: texts that still carry a stale inline link get rewritten and wrapped in a link frame
import { connect } from 'framer-api'
import fs from 'fs'
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
const PATH = process.argv[2] || '/'
const MAP = JSON.parse(process.argv[3] || '{}')   // {"text": "/target"}
try {
  const page = (await f.getNodesWithType('WebPageNode')).find(p => p.path === PATH)
  const desk = (await f.getChildren(page.id)).find(b => b.name === 'Desktop')
  let n = 0
  const walk = async (parent) => {
    const kids = await f.getChildren(parent.id)
    for (const [i, c] of kids.entries()) {
      if (typeof c.getText === 'function' && c.inlineTextStyle !== undefined) {
        const s = await c.getText()
        if (!MAP[s] || parent.link) continue   // already inside a linked frame
        const style = c.inlineTextStyle, fit = c.width === 'fit-content'
        await c.setText(s); await f.setAttributes(c.id, { inlineTextStyle: style })
        const w = await f.createFrameNode({ name: 'Linkki', position: 'relative', width: fit ? 'fit-content' : (c.width || '100%'), height: 'fit-content', layout: 'stack', stackDirection: 'vertical', stackAlignment: 'start', gap: '0px', backgroundColor: null }, parent.id)
        await f.setParent(w.id, parent.id, i)
        await f.setAttributes(w.id, { link: MAP[s], linkOpenInNewTab: false })
        await f.setParent(c.id, w.id)
        if (!fit) await f.setAttributes(c.id, { width: '100%' })
        n++; console.log('fixed', JSON.stringify(s), 'in', parent.name)
      } else await walk(c)
    }
  }
  await walk(desk)
  console.log('fixed', n)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
