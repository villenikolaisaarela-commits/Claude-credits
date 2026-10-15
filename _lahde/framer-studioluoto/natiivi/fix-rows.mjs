// Patch in place: content grids size each row to its content (cards in one row still match)
import { connect } from 'framer-api'
import fs from 'fs'
const f = await connect('https://framer.com/projects/Studio-Luoto-Website--ZrorPAr6gxMmYUmNsh8y-7dszj', process.env.FRAMER_API_KEY)
try {
  const page = (await f.getNodesWithType('WebPageNode')).find(p => p.path === '/')
  const desk = (await f.getChildren(page.id)).find(b => b.name === 'Desktop')
  let n = 0
  const walk = async id => {
    for (const c of await f.getChildren(id)) {
      if (c.layout === 'grid' && !/varjolla/.test(c.name)) { await f.setAttributes(c.id, { gridRowHeightType: 'fit' }); n++; console.log(c.name) }
      if (c.type !== 'TextNode' && c.__class !== 'TextNode') await walk(c.id)
    }
  }
  await walk(desk.id)
  console.log('grids', n)
} catch (e) { console.log('ERR', e.message) } finally { await f.disconnect() }
