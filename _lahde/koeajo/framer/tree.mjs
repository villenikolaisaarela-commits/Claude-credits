import { connect } from 'framer-api'
import fs from 'fs'
const key = fs.readFileSync(new URL('./.key', import.meta.url), 'utf8').trim()
const framer = await connect('https://framer.com/projects/Doventus-testi--ndTQAKfO89t6VmXojqHo-1NwBp', key)
const clean = o => JSON.stringify(o, (k, v) => typeof v === 'function' ? undefined : v)
async function walk(id, d = 0) {
  if (d > 6) return
  for (const c of await framer.getChildren(id)) {
    const a = { ...c }; delete a.originalId
    let txt = ''
    if (c.__class === 'TextNode') { try { txt = ' TEXT=' + (await c.getText()) } catch {} }
    console.log('  '.repeat(d) + c.__class + ' ' + c.id + ' ' + (c.name || '') + txt + ' ' + clean(a).slice(0, 400))
    await walk(c.id, d + 1)
  }
}
try {
  const root = await framer.getCanvasRoot()
  await walk(root.id)
  for (const p of await framer.getNodesWithType('WebPageNode')) console.log('PAGE', p.path, p.id)
  for (const col of await framer.getCollections()) {
    console.log('COLL', col.name, clean(await col.getFields()).slice(0, 1500))
    const items = await col.getItems(); console.log('ITEMS', items.length, clean(items).slice(0, 1500))
  }
  console.log('textstyles', (await framer.getTextStyles()).length, 'colorstyles', (await framer.getColorStyles()).length)
} finally { await framer.disconnect() }
